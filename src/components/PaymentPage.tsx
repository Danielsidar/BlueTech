import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, ShieldCheck, CheckCircle2, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getLocalized } from '../utils/i18n';

const PaymentPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get('courseId');
  const lng = i18n.language;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!courseId) {
      navigate('/');
      return;
    }

    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (data) setCourse(data);
      setLoading(false);
    };

    fetchCourse();
  }, [courseId, navigate]);

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // MOCK PAYMENT: Just wait 2 seconds
      await new Promise(resolve => setTimeout(f => resolve(f), 2000));

      // ENROLL USER: Insert into user_course_access
      const { error: enrollError } = await supabase
        .from('user_course_access')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          is_enrolled: true,
          enrolled_at: new Date().toISOString()
        });

      if (enrollError) throw enrollError;

      setSuccess(true);
      setTimeout(() => {
        navigate(`/classroom?courseId=${courseId}`);
      }, 2000);
    } catch (err) {
      console.error('Enrollment error:', err);
      alert('Something went wrong with enrollment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Payment Form */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
            <h2 className="text-3xl font-black text-navy mb-8 text-inline-start">{t('payment.title', 'פרטי תשלום')}</h2>
            
            <div className="space-y-6">
              <div className="space-y-2 text-inline-start">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('payment.card_number', 'מספר כרטיס')}</label>
                <div className="relative">
                  <CreditCard size={20} className="absolute inline-start-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input disabled type="text" value="•••• •••• •••• 4242" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 ps-12 pe-4 font-mono opacity-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 text-inline-start">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('payment.expiry', 'תוקף')}</label>
                  <input disabled type="text" value="12 / 28" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 font-mono opacity-50" />
                </div>
                <div className="space-y-2 text-inline-start">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">CVV</label>
                  <input disabled type="text" value="•••" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 font-mono opacity-50" />
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-blue-50 rounded-[32px] border border-blue-100 flex items-start gap-4">
              <ShieldCheck size={24} className="text-primary mt-1" />
              <div className="text-inline-start">
                <p className="font-bold text-navy text-sm">{t('payment.secure_notice', 'תשלום מאובטח')}</p>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">הפרטים שלך מוצפנים ונשמרים בצורה מאובטחת לפי התקנים המחמירים ביותר.</p>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing || success}
              className={`w-full mt-10 py-6 rounded-[24px] font-black text-xl transition-all shadow-xl flex items-center justify-center gap-4 ${
                success 
                  ? 'bg-green-500 text-white shadow-green-500/20' 
                  : 'bg-primary text-white hover:bg-primary-dark shadow-primary/20'
              }`}
            >
              {processing ? (
                <Loader2 size={28} className="animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 size={28} />
                  {t('payment.success', 'התשלום בוצע בהצלחה!')}
                </>
              ) : (
                <>
                  {t('payment.complete_btn', 'השלם רכישה')}
                  <span className="opacity-50">|</span>
                  <span>₪{course.price}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 sticky top-12">
            <h3 className="text-xl font-black text-navy mb-6 text-inline-start">{t('payment.summary', 'סיכום הזמנה')}</h3>
            
            <div className="flex gap-4 mb-8">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                <img src={course.image_url} className="w-full h-full object-cover" />
              </div>
              <div className="text-inline-start flex flex-col justify-center">
                <h4 className="font-bold text-navy leading-tight">{getLocalized(course, 'title', lng)}</h4>
                <p className="text-xs text-gray-400 mt-2 font-medium">{t('payment.lifetime_access', 'גישה לכל החיים')}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">{t('payment.subtotal', 'מחיר קורס')}</span>
                <span className="text-navy">₪4,500</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-400">{t('payment.discount', 'הנחת השקה')}</span>
                <span className="text-green-500">-₪{4500 - course.price}</span>
              </div>
              <div className="flex justify-between items-center pt-4 text-xl font-black">
                <span className="text-navy">{t('payment.total', 'סה"כ לתשלום')}</span>
                <span className="text-primary">₪{course.price}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

