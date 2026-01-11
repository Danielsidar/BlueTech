import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, ArrowRight, Clock, Bookmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalized, filterByVisibility } from '../utils/i18n';
import { supabase } from '../lib/supabase';

const ArticleGrid: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .order('published_at', { ascending: false });

        if (error) throw error;
        setArticles(data || []);
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = filterByVisibility(articles, lng);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-full p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="text-inline-start">
            <h1 className="text-4xl font-black text-navy mb-3">{t('knowledge.title')}</h1>
            <p className="text-gray-500 text-lg">{t('knowledge.subtitle')}</p>
          </div>
          <div className="relative w-full max-w-md">
            <Search size={20} className="absolute inline-start-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={t('knowledge.search_placeholder')}
              className="w-full bg-white border border-gray-100 rounded-2xl py-4 ps-14 pe-6 text-sm focus:outline-none focus:border-primary shadow-sm focus:shadow-xl transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={article.image_url} 
                  alt={getLocalized(article, 'title', lng)} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 inline-end-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-primary shadow-lg">
                  {getLocalized(article, 'category', lng)}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow text-inline-start">
                <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(article.published_at).toLocaleDateString(lng === 'he' ? 'he-IL' : 'en-US')}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                  <span>{t('knowledge.read_time')}</span>
                </div>
                <h3 className="text-2xl font-black text-navy mb-4 group-hover:text-primary transition-colors leading-tight">
                  {getLocalized(article, 'title', lng)}
                </h3>
                <p className="text-gray-500 mb-8 leading-relaxed line-clamp-3 font-medium">
                  {getLocalized(article, 'excerpt', lng)}
                </p>
                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <button className="text-primary font-black flex items-center gap-2 group-hover:gap-4 transition-all">
                    {t('knowledge.read_more')}
                    {lng === 'he' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </button>
                  <button className="text-gray-300 hover:text-primary transition-colors">
                    <Bookmark size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default ArticleGrid;

