import React from 'react';
import { PlayCircle, Star, Users, ArrowLeft, ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { getLocalized } from '../utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  courses: any[];
  onSelectCourse: (course: any) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ courses, onSelectCourse }) => {
  console.log('LandingPage: Rendering, courses count:', courses?.length);
  const { t, i18n } = useTranslation();
  const { user, signOut, session } = useAuth();
  const navigate = useNavigate();
  const lng = i18n.language;

  // Filter out digital assistants (agents) from the landing page course list
  const filteredCourses = (courses || []).filter(c => !['ai_agent_home', 'ai_agent_business'].includes(c.category));

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <div className="bg-white min-h-screen">
      {/* External Header */}
      <nav className="absolute top-0 left-0 w-full z-[100] py-6 px-6 md:px-12 flex items-center justify-between pointer-events-none">
        <div className="font-black text-2xl text-white tracking-tighter pointer-events-auto">BlueTech</div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <LanguageSwitcher buttonClassName="bg-white/10 hover:bg-white/20 backdrop-blur-md border-white/10" />
          
          {session ? (
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-1.5 pe-4 rounded-2xl border border-white/10">
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-xl bg-primary/20 overflow-hidden flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-bold text-xs">{user?.email?.[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="hidden sm:block text-inline-start">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">{t('classroom.welcome_back') || 'שלום,'}</p>
                  <p className="text-sm font-bold text-white leading-tight">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                </div>
              </Link>
              <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                title={t('sidebar.dashboard')}
              >
                <LayoutDashboard size={20} />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
                title={t('sidebar.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            >
              {t('auth.sign_in')}
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-32 bg-navy">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-primary font-bold text-sm mb-8 border border-white/10">
            <Star size={16} fill="currentColor" />
            <span>{t('landing.badge')}</span>
          </div>
          <h1 
            className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight"
            dangerouslySetInnerHTML={{ __html: t('landing.hero_title') }}
          />
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('landing.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-primary-dark transition-all shadow-xl shadow-primary/30 flex items-center gap-3 w-full sm:w-auto"
            >
              {t('landing.hero_cta_catalog')}
              {lng === 'he' ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
            </button>
            <button className="bg-white/5 text-white border border-white/10 px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/10 transition-all flex items-center gap-3 w-full sm:w-auto">
              {t('landing.hero_cta_how_it_works')}
              <PlayCircle size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Course Catalog Section */}
      <section id="catalog" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 text-inline-start">
            <h2 className="text-4xl font-black text-navy mb-12">{t('landing.catalog_title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-white rounded-[40px] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 group cursor-pointer flex flex-col h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                onClick={() => onSelectCourse(course)}
              >
                <div className="h-64 overflow-hidden relative">
                  <img 
                    src={course.image_url} 
                    alt={getLocalized(course, 'title', lng)} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 inline-end-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-navy font-bold text-sm shadow-lg">
                    {course.duration_minutes} {t('dashboard.stats.hours_unit')}
                  </div>
                </div>
                <div className="p-10 flex flex-col flex-grow text-inline-start">
                  <h3 className="text-2xl font-black text-navy mb-4 group-hover:text-primary transition-colors leading-tight">
                    {getLocalized(course, 'title', lng)}
                  </h3>
                  <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                    {getLocalized(course, 'problem_solved', lng)}
                  </p>
                  <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-400 text-sm font-bold uppercase tracking-wider">
                      <Users size={20} className="text-primary" />
                      <span>{t('landing.course_card.students')}</span>
                    </div>
                    <button className="bg-gray-50 group-hover:bg-primary group-hover:text-white px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2">
                      {course.has_pre_test ? t('landing.course_card.cta_pretest') : t('landing.course_card.cta_details')}
                      {lng === 'he' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredCourses.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-200">
               <p className="text-gray-400 font-bold text-lg">{t('landing.empty_catalog')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
