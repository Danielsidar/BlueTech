import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import MainSidebar from './components/MainSidebar';
import ChatPanel from './components/ChatPanel';
import LandingPage from './components/LandingPage';
import CoursePurchasePage from './components/CoursePurchasePage';
import QandASection from './components/QandASection';
import AIToolInterface from './components/AIToolInterface';
import QuizModal from './components/QuizModal';
import CommunityHub from './components/CommunityHub';
import ArticleGrid from './components/ArticleGrid';
import Profile from './components/Profile';
import MyCourses from './components/MyCourses';
import AuthPage from './components/AuthPage';
import PaymentPage from './components/PaymentPage';
import CourseCatalog from './components/CourseCatalog';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import CourseManagement from './components/admin/CourseManagement';
import UserManagement from './components/admin/UserManagement';
import Sidebar from './components/Sidebar';
import { CheckCircle2, Play, Info, Clock, ChevronLeft, Lock, ExternalLink } from 'lucide-react';
import { getLocalized } from './utils/i18n';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';

const VideoPlayer: React.FC<{ url: string }> = ({ url }) => {
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sanday\?v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    
    return null;
  };

  const embedUrl = getEmbedUrl(url);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset play state when URL changes
  useEffect(() => {
    setIsPlaying(false);
  }, [url]);

  if (!url) return null;

  if (!embedUrl) {
    return (
      <div className="aspect-video bg-navy rounded-3xl flex flex-col items-center justify-center text-white p-6 text-center">
        <ExternalLink size={48} className="mb-4 opacity-50" />
        <p className="font-bold mb-4">קישור וידאו לא נתמך להטמעה ישירה</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-primary px-6 py-2 rounded-xl font-bold hover:bg-primary-dark transition-all"
        >
          צפה בנגן חיצוני
        </a>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div 
        onClick={() => setIsPlaying(true)}
        className="aspect-video bg-navy rounded-3xl flex items-center justify-center relative overflow-hidden group shadow-2xl shadow-navy/20 cursor-pointer"
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
        <Play size={80} className="text-white relative z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl shadow-navy/20">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Lesson Video"
      ></iframe>
    </div>
  );
};

const Classroom: React.FC<{ 
  selectedCourse: any | null, 
  currentLesson: any | null, 
  handleSelectLesson: (lesson: any) => void,
  setShowLessonQuiz: (show: boolean) => void,
  onBack: () => void,
  lessonProgress: any[],
  onFinishLesson: (lessonId: string) => Promise<void>,
  hasPassedQuiz: boolean
}> = ({ selectedCourse, currentLesson, handleSelectLesson, setShowLessonQuiz, onBack, lessonProgress, onFinishLesson, hasPassedQuiz }) => {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const lng = i18n.language;

  if (!selectedCourse) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isFullCourse = selectedCourse.course_type === 'full_course';
  const hasLessons = selectedCourse.modules?.[0]?.lessons?.length > 0;

  if (isFullCourse && !currentLesson && hasLessons) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isLessonCompleted = lessonProgress.some(p => p.lesson_id === currentLesson?.id && p.completed);
  const needsQuiz = currentLesson?.quizzes && currentLesson.quizzes.length > 0;
  const canFinish = !needsQuiz || hasPassedQuiz || isLessonCompleted || isAdmin;

  // Calculate percentage
  const totalLessons = selectedCourse.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedLessons = lessonProgress.filter(p => p.completed).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-500">
            <ChevronLeft size={24} className="rtl:rotate-180" />
          </button>
          <div className="h-4 w-[1px] bg-gray-200"></div>
          <div>
            <h2 className="font-bold text-navy leading-none">{getLocalized(selectedCourse, 'title', lng)}</h2>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
              {selectedCourse.course_type === 'ai_tool_only' 
                ? t('classroom.ai_tool') 
                : `${t('classroom.active_lesson')}: ${getLocalized(currentLesson, 'title', lng)}`}
            </p>
          </div>
        </div>
        {isFullCourse && (
          <div className="flex items-center gap-3">
            <div className="w-32 bg-gray-100 h-2 rounded-full overflow-hidden hidden md:block">
              <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="text-xs font-bold text-gray-400">{progressPercent}% {t('classroom.completed')}</span>
          </div>
        )}
      </header>

      <div className="flex-grow flex overflow-hidden">
        {isFullCourse && selectedCourse && (
          <Sidebar course={selectedCourse!} currentLessonId={currentLesson?.id || ''} onSelectLesson={handleSelectLesson} lessonProgress={lessonProgress} />
        )}
        
        <main className="flex-grow overflow-y-auto bg-gray-50">
          {selectedCourse.course_type === 'ai_tool_only' ? (
            <AIToolInterface />
          ) : (
            <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10">
              <div className="space-y-4">
                <VideoPlayer url={currentLesson?.video_url || ''} />
                
                {needsQuiz && !hasPassedQuiz && !isLessonCompleted ? (
                  <button 
                    onClick={() => setShowLessonQuiz(true)}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 px-16 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                  >
                    <Lock size={24} />
                    {t('classroom.quiz_button')}
                  </button>
                ) : (
                  <button 
                    onClick={() => currentLesson && onFinishLesson(currentLesson.id)}
                    disabled={!canFinish || isLessonCompleted}
                    className={`w-full font-black py-5 px-16 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl ${
                      isLessonCompleted 
                        ? 'bg-gray-100 text-gray-400 cursor-default' 
                        : canFinish 
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 size={24} />
                    {isLessonCompleted ? t('classroom.completed') : t('classroom.finish_button')}
                  </button>
                )}
                
                {!canFinish && !isLessonCompleted && !hasPassedQuiz && (
                  <p className="text-center text-xs font-bold text-red-400 animate-pulse">
                    {t('classroom.quiz_required_hint', 'עליך לעבור את המבחן לפני סיום השיעור')}
                  </p>
                )}
              </div>

              <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
                <h1 className="text-3xl font-black text-navy mb-4">{getLocalized(currentLesson, 'title', lng)}</h1>
                <div className="flex items-center gap-4 text-gray-400 text-sm mb-8">
                  <span className="flex items-center gap-1.5"><Info size={16} className="text-primary" /> {t('classroom.video_lesson')}</span>
                  <span className="h-4 w-[1px] bg-gray-100"></span>
                  <span className="flex items-center gap-1.5"><Clock size={16} className="text-primary" /> {currentLesson?.duration_text}</span>
                </div>
                <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-lg font-medium">
                  {getLocalized(currentLesson, 'content', lng)}
                </div>
              </div>

              {selectedCourse.enable_lesson_qa && currentLesson && (
                <QandASection lessonId={currentLesson.id} />
              )}
              
            </div>
          )}
        </main>
        {selectedCourse.has_ai_mentor && (
          <ChatPanel 
            agentId={getLocalized(selectedCourse, 'agent_id', lng)} 
            externalUrl={selectedCourse.ai_mentor_url}
          />
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ courses: any[], user: any }> = ({ courses, user }) => {
  const { t } = useTranslation();
  const [completedCount, setCompletedCount] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  // Filter out agents from dashboard stats
  const filteredCourses = courses.filter(c => !['ai_agent_home', 'ai_agent_business'].includes(c.category));

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user || filteredCourses.length === 0) return;

      try {
        const { data: progressData } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('completed', true);

        const totalLessons = filteredCourses.reduce((acc, c) => acc + (c.modules?.reduce((mAcc: number, m: any) => mAcc + (m.lessons?.length || 0), 0) || 0), 0);
        const completedLessons = progressData?.length || 0;
        
        setOverallProgress(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);
        
        // Count fully completed courses
        let completedCourses = 0;
        filteredCourses.forEach(course => {
          const courseLessonIds = course.modules?.flatMap((m: any) => m.lessons?.map((l: any) => l.id) || []) || [];
          const isCourseDone = courseLessonIds.length > 0 && courseLessonIds.every(id => progressData?.some(p => p.lesson_id === id));
          if (isCourseDone) completedCourses++;
        });
        setCompletedCount(completedCourses);

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, [filteredCourses, user]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-navy mb-2">{t('dashboard.welcome')}</h1>
          <p className="text-gray-500 text-lg">{t('dashboard.subtitle')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: t('dashboard.stats.learning_hours'), value: '12.5', unit: t('dashboard.stats.hours_unit'), color: 'bg-blue-500' },
          { label: t('dashboard.stats.completed_courses'), value: completedCount.toString(), unit: t('dashboard.stats.courses_unit'), color: 'bg-yellow-500' },
          { label: t('dashboard.stats.learning_streak'), value: '5', unit: t('dashboard.stats.days_unit'), color: 'bg-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
              <div className={`w-3 h-3 rounded-full ${stat.color} animate-pulse`}></div>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-navy">{stat.value} <span className="text-sm font-bold text-gray-300">{stat.unit}</span></p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-navy rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[100px] opacity-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-grow space-y-4 text-center md:text-inline-start">
             <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary">{t('dashboard.promo.new_mission')}</span>
             <h2 className="text-3xl font-black leading-tight" dangerouslySetInnerHTML={{ __html: t('dashboard.promo.title') }}></h2>
             <p className="text-gray-400 max-w-xl">{t('dashboard.promo.description')}</p>
             <button className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/30">{t('dashboard.promo.button')}</button>
          </div>
          <div className="w-48 h-48 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
             <div className="text-center">
                <p className="text-5xl font-black text-primary">{overallProgress}%</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">{t('dashboard.promo.completed_label')}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { session, user, isAdmin, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [currentLesson, setCurrentLesson] = useState<any | null>(null);
  const [lessonProgress, setLessonProgress] = useState<any[]>([]);
  const [hasPassedQuiz, setHasPassedQuiz] = useState(false);
  const [showLessonQuiz, setShowLessonQuiz] = useState(false);
  const [loading, setLoading] = useState(true);

  const isLandingPage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');

  // Fetch lesson progress when user or selected course changes
  useEffect(() => {
    if (user && selectedCourse) {
      fetchLessonProgress(selectedCourse.id);
    }
  }, [user, selectedCourse]);

  // Reset quiz status when lesson changes
  useEffect(() => {
    setHasPassedQuiz(false);
  }, [currentLesson]);

  const fetchLessonProgress = async (courseId: string) => {
    if (!user) return;
    try {
      // Get all lessons for this course to filter progress
      const lessonIds = selectedCourse.modules?.flatMap((m: any) => m.lessons?.map((l: any) => l.id) || []) || [];
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);
      
      if (error) throw error;
      setLessonProgress(data || []);
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    }
  };

  const handleFinishLesson = async (lessonId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update local state
      setLessonProgress(prev => {
        const existing = prev.find(p => p.lesson_id === lessonId);
        if (existing) {
          return prev.map(p => p.lesson_id === lessonId ? { ...p, completed: true } : p);
        }
        return [...prev, { user_id: user.id, lesson_id: lessonId, completed: true }];
      });

    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  const handleQuizComplete = (score: number) => {
    const minScore = currentLesson?.quiz_min_score ?? 80;
    if (score >= minScore) {
      setHasPassedQuiz(true);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*, modules(*, lessons(*, quizzes(*))), quizzes(*)')
          .order('created_at', { ascending: true })
          .order('order_index', { foreignTable: 'modules', ascending: true })
          .order('order_index', { foreignTable: 'modules.lessons', ascending: true });
        
        if (!isMounted) return;
        
        if (error) {
          console.error('AppRoutes: fetchCourses error', error);
        } else {
          // Sort modules, lessons, and quizzes manually by order_index
          const sortedData = (data || []).map(course => ({
            ...course,
            modules: (course.modules || [])
              .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
              .map((module: any) => ({
                ...module,
                lessons: (module.lessons || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
                  .map((lesson: any) => ({
                    ...lesson,
                    quizzes: (lesson.quizzes || []).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
                  }))
              }))
          }));

          const currentLng = i18n.language.split('-')[0];
          const filtered = sortedData.filter(c => c.language === currentLng);
          setCourses(filtered);
        }
      } catch (err: any) {
        console.error('AppRoutes: fetchCourses unexpected error', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchCourses();
    
    // Safety timeout for course loading
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 10000);
    
    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [i18n.language]);

  // Sync selected course from URL
  useEffect(() => {
    const courseId = searchParams.get('courseId');
    if (courseId && courses.length > 0) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        setSelectedCourse(course);
        if (course.modules?.[0]?.lessons?.[0]) {
          setCurrentLesson(course.modules[0].lessons[0]);
        }
      }
    }
  }, [searchParams, courses]);

  // Non-blocking approach: only show global loading if we are NOT on the landing page
  // and course data is still loading.
  if (loading && !isLandingPage) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {session && !isLandingPage && !isAdminPage && (
          <MainSidebar activeTab={location.pathname.replace('/', '') || 'dashboard'} setActiveTab={(tab) => navigate(`/${tab}`)} />
        )}
        
        <div className="flex-grow flex flex-col">
          {!isLandingPage && !isAdminPage && session && <Header />}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage courses={courses} onSelectCourse={(course) => { setSelectedCourse(course); navigate(`/course-details?courseId=${course.id}`); }} />} />
              <Route path="/course-details" element={selectedCourse ? <CoursePurchasePage course={selectedCourse} onPurchase={() => navigate(`/auth?courseId=${selectedCourse.id}`)} onBack={() => navigate('/')} /> : <Navigate to="/" />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/classroom" element={<ProtectedRoute><Classroom selectedCourse={selectedCourse} currentLesson={currentLesson} handleSelectLesson={setCurrentLesson} setShowLessonQuiz={setShowLessonQuiz} onBack={() => navigate('/dashboard')} lessonProgress={lessonProgress} onFinishLesson={handleFinishLesson} hasPassedQuiz={hasPassedQuiz} /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard courses={courses} user={user} /></ProtectedRoute>} />
              <Route path="/catalog" element={<ProtectedRoute><CourseCatalog /></ProtectedRoute>} />
              <Route path="/agents" element={<ProtectedRoute><CourseCatalog isAgents /></ProtectedRoute>} />
              <Route path="/courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><CommunityHub /></ProtectedRoute>} />
              <Route path="/knowledge" element={<ProtectedRoute><ArticleGrid /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<Navigate to="/admin/courses" replace />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route path="agents" element={<CourseManagement isAgentsMode />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
              <Route path="*" element={<Navigate to={session ? "/dashboard" : "/"} />} />
            </Routes>
          </main>
        </div>
      </div>

      {showLessonQuiz && currentLesson?.quizzes && (
        <QuizModal 
          title={`${t('classroom.quiz_title')}: ${getLocalized(currentLesson, 'title', lng)}`}
          minScore={currentLesson.quiz_min_score ?? 80}
          questions={currentLesson.quizzes.map((q: any) => ({
            id: q.id,
            question: q[`question_${lng}`] || q.question_he,
            options: q[`options_${lng}`] || q.options_he,
            correctAnswer: q.correct_answer_index
          }))}
          onComplete={handleQuizComplete} 
          onClose={() => setShowLessonQuiz(false)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
