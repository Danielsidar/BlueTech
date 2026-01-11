import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import LanguageSwitcher from './LanguageSwitcher';

const AuthPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = searchParams.get('courseId');
  const from = location.state?.from?.pathname || '/dashboard';
  const lng = i18n.language;

  const [step, setStep] = useState(1); // 1: Email, 2: Auth (Sign In / Sign Up)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    const normalizedEmail = email.trim().toLowerCase();
    setEmail(normalizedEmail);
    
    setLoading(true);
    setError(null);

    try {
      const { data: exists, error: checkError } = await supabase.rpc('check_user_exists', { 
        email_to_check: normalizedEmail 
      });
      if (checkError) throw checkError;

      if (exists) {
        setMode('signin');
      } else {
        setMode('signup');
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data: _data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              language: lng,
            },
          },
        });
        if (signUpError) throw signUpError;
        
        // After signup, go to payment if courseId exists
        if (courseId) {
          navigate(`/payment?courseId=${courseId}`);
        } else {
          navigate(from, { replace: true });
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        
        // After signin, go to payment if courseId exists, otherwise from
        if (courseId) {
          navigate(`/payment?courseId=${courseId}`);
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err: any) {
      setError(err.message || t('auth.invalid_login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side: Branding / Info */}
      <div className="lg:w-1/2 p-12 flex flex-col justify-between relative overflow-hidden hidden lg:flex">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="text-3xl font-black text-white tracking-tighter mb-20 block">
            BlueTech
          </button>
          
          <div className="space-y-8 max-w-lg">
            <h1 className="text-6xl font-black text-white leading-tight">
              {t('auth.page_hero_title', 'הצטרפו למהפכת ה-AI')}
            </h1>
            <p className="text-xl text-white/60 leading-relaxed font-medium">
              {t('auth.page_hero_subtitle', 'הכשרה מקצועית, ליווי אישי וכלים מתקדמים שיעזרו לכם להוביל את המחר.')}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex -space-x-4 rtl:space-x-reverse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-navy bg-gray-200 overflow-hidden shadow-xl">
                <img src={`https://i.pravatar.cc/150?u=user${i}`} alt="" />
              </div>
            ))}
          </div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
            {t('auth.social_proof', '12,000+ בוגרים כבר בפנים')}
          </p>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-grow bg-white lg:rounded-s-[80px] shadow-2xl flex flex-col items-center justify-center p-8 md:p-20 relative">
        <div className="absolute top-8 inline-end-8 flex items-center gap-4">
          <LanguageSwitcher className="bg-gray-50 border-gray-100" />
        </div>

        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-inline-start">
            <h2 className="text-4xl font-black text-navy mb-4">
              {step === 1 ? t('auth.welcome_title', 'ברוכים הבאים') : (mode === 'signin' ? t('auth.sign_in') : t('auth.sign_up'))}
            </h2>
            <p className="text-gray-500 text-lg font-medium">
              {step === 1 
                ? t('auth.welcome_subtitle', 'הכניסו את המייל שלכם כדי להתחיל') 
                : (mode === 'signin' ? t('auth.signin_prompt', 'יופי שחזרת! הכנס סיסמה') : t('auth.signup_prompt', 'נעים להכיר! בואו ניצור חשבון'))}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-5 rounded-[24px] flex items-center gap-4 text-red-600 font-bold text-sm animate-in shake duration-500">
              <AlertCircle size={24} />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ms-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail size={24} className="absolute inline-start-5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-[24px] py-5 ps-14 pe-6 text-lg focus:outline-none focus:border-primary focus:bg-white transition-all font-bold text-navy"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-[24px] text-xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 group"
              >
                {loading ? <Loader2 size={28} className="animate-spin" /> : (
                  <>
                    {t('auth.continue', 'המשך')}
                    {lng === 'he' ? <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform" /> : <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />}
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-8 animate-in fade-in slide-in-from-inline-end-4 duration-500">
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-bold text-navy">{email}</span>
                  <button onClick={() => setStep(1)} className="text-xs font-black text-primary hover:underline uppercase tracking-widest">
                    {t('auth.change_email', 'שינוי מייל')}
                  </button>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ms-2">
                      {t('auth.full_name')}
                    </label>
                    <div className="relative">
                      <User size={24} className="absolute inline-start-5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        required
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Israel Israeli"
                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-[24px] py-5 ps-14 pe-6 text-lg focus:outline-none focus:border-primary focus:bg-white transition-all font-bold text-navy"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ms-2">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock size={24} className="absolute inline-start-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border-2 border-gray-50 rounded-[24px] py-5 ps-14 pe-6 text-lg focus:outline-none focus:border-primary focus:bg-white transition-all font-bold text-navy"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-black py-6 rounded-[24px] text-xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4"
                >
                  {loading ? <Loader2 size={28} className="animate-spin" /> : (
                    mode === 'signin' ? t('auth.submit_sign_in') : t('auth.submit_sign_up')
                  )}
                </button>

                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-sm font-bold text-gray-400 hover:text-primary transition-colors"
                  >
                    {mode === 'signin' ? t('auth.no_account') : t('auth.have_account')}{' '}
                    <span className="text-primary font-black">{mode === 'signin' ? t('auth.sign_up') : t('auth.sign_in')}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

