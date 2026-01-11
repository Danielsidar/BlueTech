import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, ArrowRight, ArrowLeft, Bot, Home, Briefcase, ExternalLink, Play, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalized, filterByVisibility } from '../utils/i18n';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProductDetailsModal from './ProductDetailsModal';

interface CourseCatalogProps {
  isAgents?: boolean;
}

const CourseCatalog: React.FC<CourseCatalogProps> = ({ isAgents = false }) => {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const lng = i18n.language;
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState<'home' | 'business'>('home');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Fetch courses based on mode
        let query = supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: true });

        if (isAgents) {
          query = query.in('category', ['ai_agent_home', 'ai_agent_business']);
        } else {
          // Exclude agent categories from regular catalog
          query = query.not('category', 'in', '("ai_agent_home","ai_agent_business")');
        }

        const { data: allCourses, error: coursesError } = await query;

        if (coursesError) throw coursesError;

        // Fetch enrolled course IDs
        if (user) {
          const { data: accessData } = await supabase
            .from('user_course_access')
            .select('course_id')
            .eq('user_id', user.id)
            .eq('is_enrolled', true);
          
          setEnrolledIds(accessData?.map(item => item.course_id) || []);
        }

        setCourses(allCourses || []);
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCourses = filterByVisibility(courses, lng).filter(c => {
    if (!isAgents) return true;
    return c.category === (agentFilter === 'home' ? 'ai_agent_home' : 'ai_agent_business');
  });

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 text-inline-start">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-navy mb-3">
            {isAgents ? t('agents.title') : t('catalog.title', 'קטלוג קורסים')}
          </h1>
          <p className="text-gray-500 text-lg">
            {isAgents ? t('agents.subtitle') : t('catalog.subtitle', 'כל הידע שאתה צריך כדי להוביל ב-AI')}
          </p>
        </div>

        {isAgents && (
          <div className="flex bg-gray-100 p-1.5 rounded-[24px] w-fit shadow-inner">
            <button 
              onClick={() => setAgentFilter('home')}
              className={`flex items-center gap-2 px-8 py-3 rounded-[20px] font-black text-sm transition-all ${
                agentFilter === 'home' 
                  ? 'bg-white text-navy shadow-lg' 
                  : 'text-gray-400 hover:text-navy'
              }`}
            >
              <Home size={18} />
              {t('agents.filter_home')}
            </button>
            <button 
              onClick={() => setAgentFilter('business')}
              className={`flex items-center gap-2 px-8 py-3 rounded-[20px] font-black text-sm transition-all ${
                agentFilter === 'business' 
                  ? 'bg-white text-navy shadow-lg' 
                  : 'text-gray-400 hover:text-navy'
              }`}
            >
              <Briefcase size={18} />
              {t('agents.filter_business')}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <Bot size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold">{t('landing.empty_catalog')}</p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isEnrolled = enrolledIds.includes(course.id) || isAdmin;
            const isFree = course.price === 0 || course.price === null || !course.is_paid;
            const canOpen = isFree || isEnrolled;
            
            return (
              <div 
                key={course.id} 
                className={`bg-white rounded-[40px] overflow-hidden shadow-xl shadow-gray-200/50 border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full group ${
                  isEnrolled ? 'border-green-500/30 ring-4 ring-green-500/5' : 'border-gray-100'
                }`}
              >
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={course.image_url} 
                    alt={getLocalized(course, 'title', lng)} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {isEnrolled && (
                    <div className="absolute inset-0 bg-green-500/10 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="bg-green-500 text-white px-6 py-2 rounded-full font-black text-sm shadow-xl flex items-center gap-2 animate-in zoom-in duration-300">
                        <CheckCircle2 size={18} />
                        {t('catalog.purchased', 'כבר רכשת')}
                      </div>
                    </div>
                  )}

                  {!isAgents && (
                    <div className="absolute top-6 inline-end-6 bg-navy/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Clock size={12} className="text-primary" />
                      {course.duration_minutes} {t('dashboard.stats.hours_unit')}
                    </div>
                  )}

                  {isAgents && course.demo_video_url && (
                    <a 
                      href={course.demo_video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute top-6 inline-start-6 bg-primary/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-colors"
                    >
                      <Play size={12} fill="currentColor" />
                      Demo
                    </a>
                  )}
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-black mb-3 text-navy leading-tight group-hover:text-primary transition-colors">
                    {getLocalized(course, 'title', lng)}
                  </h3>
                  <p className="text-gray-400 mb-8 text-sm font-medium leading-relaxed line-clamp-2">
                    {getLocalized(course, 'problem_solved', lng) || getLocalized(course, 'description', lng)}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-navy font-black text-lg">
                      {course.is_paid ? (
                        <span>₪{course.price}</span>
                      ) : (
                        <span className="text-green-500 uppercase text-sm tracking-wider font-black">{t('agents.free')}</span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (canOpen) {
                          if (isAgents) {
                            window.open(course.external_tool_url, '_blank');
                          } else {
                            navigate(`/classroom?courseId=${course.id}`);
                          }
                        } else {
                          setSelectedProduct(course);
                        }
                      }}
                      className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${
                        canOpen 
                          ? 'bg-navy text-white hover:bg-navy-light shadow-lg shadow-navy/10' 
                          : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20'
                      }`}
                    >
                      {canOpen ? (
                        <>
                          {isAgents ? t('agents.open_tool') : t('catalog.start_learning', 'התחל ללמוד')}
                          {isAgents ? <ExternalLink size={16} /> : (lng === 'he' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />)}
                        </>
                      ) : (
                        <>
                          {t('agents.more_details', 'לפרטים נוספים')}
                          <Info size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isEnrolled={enrolledIds.includes(selectedProduct.id) || isAdmin}
          onClose={() => setSelectedProduct(null)}
          onPurchase={() => {
            const isEnrolled = enrolledIds.includes(selectedProduct.id) || isAdmin;
            const isFree = selectedProduct.price === 0 || selectedProduct.price === null || !selectedProduct.is_paid;
            
            if (isEnrolled) {
              if (isAgents) {
                window.open(selectedProduct.external_tool_url, '_blank');
              } else {
                navigate(`/classroom?courseId=${selectedProduct.id}`);
              }
            } else if (isFree) {
              if (isAgents) {
                window.open(selectedProduct.external_tool_url, '_blank');
              } else {
                navigate(`/course-details?courseId=${selectedProduct.id}`);
              }
            } else {
              // Redirect to payment URL if exists, otherwise to details page
              if (selectedProduct.payment_url) {
                window.open(selectedProduct.payment_url, '_blank');
              } else {
                navigate(`/course-details?courseId=${selectedProduct.id}`);
              }
            }
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default CourseCatalog;

