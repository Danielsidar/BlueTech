import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, PlayCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalized, filterByVisibility } from '../utils/i18n';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MyCourses: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const lng = i18n.language;
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<{ [key: string]: { completed: number, total: number } }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let myCourses = [];

        if (isAdmin) {
          // Admins see all full courses
          const { data, error } = await supabase
            .from('courses')
            .select('*, modules(*, lessons(*))')
            .eq('course_type', 'full_course')
            .not('category', 'in', '("ai_agent_home","ai_agent_business")')
            .order('created_at', { ascending: true });
          
          if (error) throw error;
          myCourses = data || [];
        } else {
          const { data, error } = await supabase
            .from('user_course_access')
            .select(`
              course_id,
              courses (*, modules(*, lessons(*)))
            `)
            .eq('user_id', user.id)
            .eq('is_enrolled', true);

          if (error) throw error;
          // Filter out ai_tool_only courses and agent categories
          myCourses = (data?.map(item => item.courses) || []).filter(c => 
            c?.course_type === 'full_course' && 
            !['ai_agent_home', 'ai_agent_business'].includes(c.category)
          );
        }
        
        // Fetch progress for all these courses
        const allLessonIds = myCourses.flatMap(c => c.modules?.flatMap((m: any) => m.lessons?.map((l: any) => l.id) || []) || []);
        
        if (allLessonIds.length > 0) {
          const { data: progressData } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id)
            .in('lesson_id', allLessonIds)
            .eq('completed', true);

          const progressMap: { [key: string]: { completed: number, total: number } } = {};
          
          myCourses.forEach(course => {
            const courseLessonIds = course.modules?.flatMap((m: any) => m.lessons?.map((l: any) => l.id) || []) || [];
            const completedCount = progressData?.filter(p => courseLessonIds.includes(p.lesson_id)).length || 0;
            progressMap[course.id] = {
              completed: completedCount,
              total: courseLessonIds.length
            };
          });
          setCourseProgress(progressMap);
        }

        setCourses(myCourses);
      } catch (err) {
        console.error('Error fetching my courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [isAdmin]);

  const filteredCourses = filterByVisibility(courses, lng);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 text-inline-start">
      <div>
        <h1 className="text-4xl font-black text-navy mb-3">{t('app_courses.title')}</h1>
        <p className="text-gray-500 text-lg">{t('app_courses.subtitle', 'המשך בדיוק מאיפה שהפסקת')}</p>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCourses.map((course) => {
            const progress = courseProgress[course.id] || { completed: 0, total: 0 };
            const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
            
            return (
              <div key={course.id} className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full group">
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={course.image_url} 
                    alt={getLocalized(course, 'title', lng)} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 inline-end-6 bg-navy/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} className="text-primary" />
                    {course.duration_minutes} {t('dashboard.stats.hours_unit')}
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-black mb-3 text-navy leading-tight group-hover:text-primary transition-colors">
                    {getLocalized(course, 'title', lng)}
                  </h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-400">{t('profile.progress', { percent })}</span>
                      <span className="text-primary">{progress.completed}/{progress.total} {t('classroom.lessons', 'שיעורים')}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                
                <div className="mt-auto pt-6 border-t border-gray-50">
                  <button 
                    onClick={() => navigate(`/classroom?courseId=${course.id}`)}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 group/btn shadow-lg shadow-primary/20"
                  >
                    <PlayCircle size={20} className="group-hover/btn:scale-110 transition-transform" />
                    <span>{t('app_courses.buttons.continue')}</span>
                    {lng === 'he' ? (
                      <ArrowLeft size={18} className="mr-auto opacity-0 group-hover/btn:opacity-100 group-hover/btn:-translate-x-1 transition-all" />
                    ) : (
                      <ArrowRight size={18} className="ml-auto opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
        <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-200">
           <p className="text-gray-400 font-bold text-lg">{t('profile.no_courses')}</p>
           <button 
            onClick={() => navigate('/catalog')}
            className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-black hover:bg-primary-dark transition-all"
           >
             {t('landing.hero_cta_catalog')}
           </button>
        </div>
      )}
    </div>
  );
};

export default MyCourses;

