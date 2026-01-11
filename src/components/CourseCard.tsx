import React from 'react';
import { Clock, PlayCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '../utils/i18n';

interface CourseCardProps {
  course: any;
  onStart: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onStart }) => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  return (
    <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full group">
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
        <p className="text-gray-400 mb-8 text-sm font-medium leading-relaxed line-clamp-2">
          {getLocalized(course, 'problem_solved', lng)}
        </p>
        
        <div className="mt-auto pt-6 border-t border-gray-50">
          <button 
            onClick={onStart}
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
};


export default CourseCard;
