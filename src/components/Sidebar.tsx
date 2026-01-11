import React from 'react';
import { ChevronDown, PlayCircle, CheckCircle2, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '../utils/i18n';

interface SidebarProps {
  course: any;
  currentLessonId: string;
  onSelectLesson: (lesson: any) => void;
  lessonProgress: any[];
}

const Sidebar: React.FC<SidebarProps> = ({ course, currentLessonId, onSelectLesson, lessonProgress }) => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;

  // Calculate percentage
  const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;
  const completedLessons = lessonProgress.filter(p => p.completed).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="w-64 h-full bg-gray-50 border-inline-end border-gray-200 flex flex-col overflow-y-auto shrink-0">
      <div className="p-5 border-b border-gray-200">
        <h2 className="font-bold text-navy text-base leading-tight mb-2">{getLocalized(course, 'title', lng)}</h2>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{progressPercent}% {t('classroom.completed')}</p>
      </div>

      <div className="flex-grow text-inline-start">
        {course.modules?.map((module: any) => (
          <div key={module.id} className="border-b border-gray-100">
            <div className="p-4 bg-gray-100/50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors">
              <span className="font-bold text-navy text-sm">{getLocalized(module, 'title', lng)}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
            
            <div className="py-2">
              {module.lessons?.map((lesson: any) => {
                const isCompleted = lessonProgress.some(p => p.lesson_id === lesson.id && p.completed);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson)}
                    className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-white transition-colors text-inline-start ${
                      currentLessonId === lesson.id ? 'bg-white border-inline-start-4 border-primary' : ''
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                    ) : (
                      <Circle size={18} className="text-gray-300 shrink-0" />
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className={`text-sm truncate ${currentLessonId === lesson.id ? 'font-bold text-primary' : 'text-gray-700'}`}>
                        {getLocalized(lesson, 'title', lng)}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <PlayCircle size={12} />
                        {lesson.duration_text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
