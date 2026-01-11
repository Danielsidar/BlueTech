import { X, ExternalLink, Video, CheckCircle2, Globe, Brain, Shield, Award, Layout, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '../utils/i18n';

interface ProductDetailsModalProps {
  product: any;
  onClose: () => void;
  onPurchase: () => void;
  isEnrolled?: boolean;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose, onPurchase, isEnrolled }) => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  if (!product) return null;

  const isFree = product.price === 0 || product.price === null || !product.is_paid;
  const isAgent = product.category === 'ai_agent_home' || product.category === 'ai_agent_business';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src={product.image_url} 
            alt={getLocalized(product, 'title', lng)} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
          
          <button 
            onClick={onClose} 
            className="absolute top-6 inline-end-6 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all z-10"
          >
            <X size={24} />
          </button>

          <div className="absolute bottom-8 inline-start-8 inline-end-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md flex items-center gap-2 ${
                product.language === 'he' ? 'bg-emerald-500/80 text-white' : 'bg-blue-500/80 text-white'
              }`}>
                <Globe size={12} />
                {product.language === 'he' ? t('languages.he') : t('languages.en')}
              </span>
              {isAgent && (
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/80 backdrop-blur-md text-white flex items-center gap-2">
                  <Brain size={12} />
                  {product.category === 'ai_agent_home' ? t('admin.courses.form.category_home') : t('admin.courses.form.category_business')}
                </span>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {getLocalized(product, 'title', lng)}
            </h2>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 text-inline-start">
                  <Layout size={16} className="text-primary" /> {t('admin.agents.form.description')}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap text-inline-start">
                  {getLocalized(product, 'description', lng)}
                </p>
              </div>

              {product.problem_solved && (
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 text-inline-start">
                    <CheckCircle2 size={16} className="text-green-500" /> {t('admin.courses.form.problem_solved_he')}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed text-inline-start">
                    {getLocalized(product, 'problem_solved', lng)}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-6 pt-4">
                {product.has_ai_mentor && (
                  <div className="flex items-center gap-3 text-sm font-bold text-navy bg-gray-50 px-4 py-2 rounded-xl">
                    <Brain size={18} className="text-purple-500" />
                    {t('admin.courses.form.ai_mentor')}
                  </div>
                )}
                {product.has_certificate && (
                  <div className="flex items-center gap-3 text-sm font-bold text-navy bg-gray-50 px-4 py-2 rounded-xl">
                    <Award size={18} className="text-yellow-500" />
                    {t('admin.courses.form.certificate')}
                  </div>
                )}
                {product.has_pre_test && (
                  <div className="flex items-center gap-3 text-sm font-bold text-navy bg-gray-50 px-4 py-2 rounded-xl">
                    <Shield size={18} className="text-blue-500" />
                    {t('admin.courses.form.pre_test')}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
                <div className="text-center mb-8">
                  <span className="text-gray-400 text-sm font-bold block mb-2">{t('purchase.sticky.price')}</span>
                  {isFree ? (
                    <span className="text-4xl font-black text-green-500 uppercase tracking-tight">{t('agents.free')}</span>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-4xl font-black text-navy">₪{product.price}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={onPurchase}
                    className="w-full py-5 rounded-2xl bg-primary text-white font-black hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 group"
                  >
                    {isEnrolled ? (
                      <>
                        {t('catalog.start_learning')}
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                      </>
                    ) : isFree ? (
                      <>
                        {t('agents.open_tool')}
                        <ExternalLink size={20} />
                      </>
                    ) : (
                      <>
                        {t('catalog.buy_now')}
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  {product.demo_video_url && (
                    <a 
                      href={product.demo_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 rounded-2xl border-2 border-gray-200 text-navy font-black hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                    >
                      <Video size={20} className="text-red-500" />
                      {t('admin.agents.form.demo')}
                    </a>
                  )}
                </div>

                {!isEnrolled && !isFree && (
                  <p className="text-[10px] text-gray-400 font-bold text-center mt-6 uppercase tracking-widest leading-relaxed">
                    {t('purchase.sticky.lifetime_access')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;

