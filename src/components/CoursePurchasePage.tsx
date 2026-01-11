import React, { useState } from 'react';
import { CheckCircle, Clock, Globe, ShieldCheck, CreditCard, ChevronRight, ChevronLeft, Lock, Award } from 'lucide-react';
import QuizModal from './QuizModal';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '../utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';

interface CoursePurchasePageProps {
  course: any;
  onPurchase: () => void;
  onBack: () => void;
}

const CoursePurchasePage: React.FC<CoursePurchasePageProps> = ({ course, onPurchase, onBack }) => {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const lng = i18n.language;
  const [showPreTest, setShowPreTest] = useState(false);
  const [preTestPassed, setPreTestPassed] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handlePreTestComplete = (resultScore: number) => {
    setScore(resultScore);
    if (resultScore >= (course.min_pre_test_score || 0)) {
      setPreTestPassed(true);
    }
  };

  const isLocked = course.has_pre_test && !preTestPassed && !isAdmin;

  const handleEnrollClick = () => {
    if (isLocked) return;
    
    if (course.is_paid && course.payment_url) {
      window.open(course.payment_url, '_blank');
    } else {
      onPurchase();
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Mini Header */}
      <nav className="py-6 px-6 md:px-12 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50 gap-4">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-navy transition-colors font-bold whitespace-nowrap">
            {lng === 'he' ? <ChevronRight size={20} className="rotate-180" /> : <ChevronLeft size={20} />}
            {t('purchase.back_to_catalog')}
          </button>
          <div className="h-6 w-[1px] bg-gray-200 hidden md:block"></div>
          <LanguageSwitcher />
        </div>
        
        <div className="font-black text-2xl text-navy tracking-tighter hidden sm:block">BlueTech</div>
        
        <div className="flex items-center gap-4">
           <button 
            disabled={isLocked}
            onClick={handleEnrollClick} 
            className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
              isLocked 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
            }`}
          >
            {isLocked ? t('purchase.pretest_required_btn') : t('purchase.enroll_now')}
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          <div className="lg:col-span-7 space-y-12">
            <div className="text-inline-start">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold inline-block">
                  {course.course_type === 'ai_tool_only' ? t('purchase.tags.ai_tool') : t('purchase.tags.professional_training')}
                </span>
                {course.has_pre_test && (
                  <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-bold inline-block flex items-center gap-2">
                    <Lock size={14} />
                    {t('purchase.tags.pretest_required')} ({course.min_pre_test_score}%)
                  </span>
                )}
                {course.has_certificate && (
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold inline-block flex items-center gap-2">
                    <Award size={14} />
                    {t('purchase.tags.certified')}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-navy mb-6 leading-tight">
                {getLocalized(course, 'title', lng)}
              </h1>
              <p className="text-xl text-gray-500 leading-relaxed">
                {getLocalized(course, 'problem_solved', lng)}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { icon: <Clock size={20} />, label: t('purchase.stats.duration'), val: `${course.duration_minutes} ${t('dashboard.stats.hours_unit')}` },
                 { icon: <Globe size={20} />, label: t('purchase.stats.language'), val: t('purchase.stats.language_val') },
                 { icon: <ShieldCheck size={20} />, label: t('purchase.stats.certificate'), val: course.has_certificate ? t('purchase.stats.certified_val') : t('purchase.stats.no_certificate') },
                 { icon: <CreditCard size={20} />, label: t('purchase.stats.access'), val: t('purchase.stats.lifetime_access') },
               ].map((item, i) => (
                 <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <div className="text-primary mb-2">{item.icon}</div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.label}</p>
                   <p className="text-sm font-bold text-navy">{item.val}</p>
                 </div>
               ))}
            </div>

            {/* Pre-Test Action Box */}
            {course.has_pre_test && !preTestPassed && (
              <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-[32px] p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock size={32} className="text-amber-600" />
                </div>
                <h3 className="text-2xl font-black text-navy">{t('purchase.pretest.title')}</h3>
                <p className="text-gray-600 max-w-md mx-auto font-medium">
                  {t('purchase.pretest.description', { score: course.min_pre_test_score })}
                </p>
                <button 
                  onClick={() => setShowPreTest(true)}
                  className="bg-amber-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20"
                >
                  {t('purchase.pretest.start_button')}
                </button>
                {score !== null && score < (course.min_pre_test_score || 0) && (
                  <p className="text-red-500 font-bold mt-4">{t('purchase.pretest.your_score', { score: Math.round(score) })}</p>
                )}
              </div>
            )}

            {preTestPassed && (
              <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-[32px] p-8 text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-navy">{t('purchase.pretest.passed_title')}</h3>
                <p className="text-gray-600 font-medium">{t('purchase.pretest.passed_description', { score: Math.round(score || 0) })}</p>
              </div>
            )}

            <div className="space-y-6 text-inline-start">
              <h2 className="text-2xl font-black text-navy">{t('purchase.included.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(t('purchase.included.items', { returnObjects: true }) as string[]).map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-500 shrink-0 mt-1" />
                    <span className="text-gray-700 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-navy rounded-[40px] p-8 md:p-12 text-white overflow-hidden relative">
               <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[100px] opacity-20"></div>
               <h3 className="text-3xl font-black mb-6 relative z-10">{t('purchase.ready.title')}</h3>
               <button 
                disabled={isLocked}
                onClick={handleEnrollClick}
                className={`px-12 py-5 rounded-2xl font-black text-xl transition-all relative z-10 ${
                  isLocked 
                    ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                    : 'bg-primary text-white hover:bg-primary-dark shadow-2xl shadow-primary/40'
                }`}
               >
                 {isLocked ? t('purchase.ready.cta_locked') : t('purchase.ready.cta')}
               </button>
            </div>
          </div>

          {/* Sticky Purchase Card */}
          <div className="lg:col-span-5">
             <div className="sticky top-32 bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200 overflow-hidden">
                <div className="h-64 relative">
                   <img src={course.image_url} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent"></div>
                   <div className="absolute bottom-8 inline-end-8 text-white">
                      <p className="text-white/70 text-sm font-bold mb-1">{t('purchase.sticky.price')}</p>
                      {course.is_paid ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black">₪{course.price}</span>
                          <span className="text-white/50 line-through text-lg">₪4,500</span>
                        </div>
                      ) : (
                        <span className="text-4xl font-black text-green-400">{t('purchase.sticky.free')}</span>
                      )}
                   </div>
                </div>
                <div className="p-10 space-y-8">
                   <button 
                    disabled={isLocked}
                    onClick={handleEnrollClick}
                    className={`w-full py-5 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-3 ${
                      isLocked 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                   >
                    {isLocked ? t('purchase.sticky.cta_locked') : t('purchase.sticky.cta')}
                    {lng === 'he' ? <ChevronRight size={24} className="rotate-180" /> : <ChevronRight size={24} />}
                   </button>
                   {isLocked && <p className="text-center text-xs text-amber-600 font-bold">{t('purchase.sticky.locked_hint')}</p>}
                </div>
             </div>
          </div>
        </div>
      </div>

      {showPreTest && course.quizzes && (
        <QuizModal 
          title={`${t('purchase.pretest.title')}: ${getLocalized(course, 'title', lng)}`}
          minScore={course.min_pre_test_score || 80}
          questions={course.quizzes.filter((q: any) => !q.lesson_id).map((q: any) => ({
            id: q.id,
            question: q[`question_${lng}`] || q.question_he,
            options: q[`options_${lng}`] || q.options_he,
            correctAnswer: q.correct_answer_index
          }))}
          onComplete={handlePreTestComplete}
          onClose={() => setShowPreTest(false)}
        />
      )}
    </div>
  );
};

export default CoursePurchasePage;
