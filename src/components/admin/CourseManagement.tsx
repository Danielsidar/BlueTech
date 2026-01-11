import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Globe, Check, X, Shield, Brain, Award, DollarSign, BookOpen, Layers, Video, ChevronRight, ChevronLeft, Save, FileText, Settings, HelpCircle, Layout, Camera, Upload, Loader2, Home, Briefcase } from 'lucide-react';
import { Tables } from '../../types/database.types';

type Course = Tables<'courses'>;
type Module = Tables<'modules'>;
type Lesson = Tables<'lessons'>;

interface CourseManagementProps {
  isAgentsMode?: boolean;
}

const CourseManagement: React.FC<CourseManagementProps> = ({ isAgentsMode = false }) => {
  const { t, i18n: _i18n } = useTranslation('common');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([]);
  const [preTestQuizzes, setPreTestQuizzes] = useState<Tables<'quizzes'>[]>([]);
  
  // Tabs management
  const [openLessons, setOpenLessons] = useState<Lesson[]>([]);
  const [activeTab, setActiveTab] = useState<string>('course'); // 'course' or lessonId
  const [lessonQuizzes, setLessonQuizzes] = useState<{ [key: string]: Tables<'quizzes'>[] }>({});
  const [lessonTabsState, setLessonTabsState] = useState<{ [key: string]: 'content' | 'quiz' }>({});

  useEffect(() => {
    fetchCourses();
  }, [isAgentsMode]);

  const fetchLessonQuizzes = async (lessonId: string) => {
    const { data, error: _error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index', { ascending: true });
    
    if (data) {
      setLessonQuizzes(prev => ({ ...prev, [lessonId]: data }));
    }
  };

  const fetchPreTestQuizzes = async (courseId: string) => {
    const { data, error: _error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('course_id', courseId)
      .is('lesson_id', null)
      .order('order_index', { ascending: true });
    
    if (data) setPreTestQuizzes(data);
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (isAgentsMode) {
        query = query.in('category', ['ai_agent_home', 'ai_agent_business']);
      } else {
        query = query.not('category', 'in', '("ai_agent_home","ai_agent_business")');
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setCourses(data || []);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchModulesAndLessons = async (courseId: string) => {
    try {
      const { data: modulesData, error: _modulesError } = await supabase
        .from('modules')
        .select(`
          *,
          lessons (*)
        `)
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesData) {
        const sortedModules = modulesData.map(m => ({
          ...m,
          lessons: (m.lessons as Lesson[]).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        }));
        setModules(sortedModules);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `course-covers/${fileName}`;

      const { error: uploadError, data: _data } = await supabase.storage
        .from('course-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      setEditingCourse(prev => prev ? { ...prev, image_url: publicUrl } : null);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    // Generate slug from title if it doesn't exist
    const generateSlug = (text: string) => {
      // Support for Hebrew and English slugs
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\u0590-\u05FF\w\s-]/g, '') // Keep Hebrew, alphanumeric, spaces, dashes
        .replace(/[\s_-]+/g, '-')              // Replace spaces/underscores with dashes
        .replace(/^-+|-+$/g, '');             // Trim dashes from start/end
    };

    const courseData = {
      ...editingCourse,
      language: editingCourse.language || 'he',
      slug: editingCourse.slug || (editingCourse.title ? `${generateSlug(editingCourse.title) || 'agent'}-${Math.random().toString(36).substring(2, 7)}` : `placeholder-${Math.random().toString(36).substring(2, 7)}`),
    };

    // Remove fields that shouldn't be sent to the DB
    delete (courseData as any).is_free;
    delete (courseData as any).id; // Remove ID for insert, Supabase handles it

    try {
      if (editingCourse.id) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);
        
        if (error) throw error;
        
        if (isAgentsMode) {
          setView('list');
        } else {
          await fetchModulesAndLessons(editingCourse.id);
          setCurrentStep(2);
        }
      } else {
        const { data, error } = await supabase
          .from('courses')
          .insert([courseData])
          .select()
          .single();
        
        if (error) throw error;
        
        if (data) {
          if (isAgentsMode) {
            setView('list');
          } else {
          setEditingCourse(data);
          await fetchModulesAndLessons(data.id);
          setCurrentStep(2);
          }
        }
      }
      
      fetchCourses();
    } catch (error: any) {
      console.error('Error saving course:', error);
      alert(`${t('common.error')}: ${error.message || error.details || t('common.unknown_error')}`);
    }
  };

  const handleAddModule = async () => {
    if (!editingCourse?.id) return;
    const newModule = {
      course_id: editingCourse.id,
      title_he: t('admin.courses.wizard.new_module'),
      order_index: modules.length
    };

    const { data, error: _error } = await supabase.from('modules').insert([newModule]).select().single();
    if (data) {
      setModules([...modules, { ...data, lessons: [] }]);
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    const newLesson = {
      module_id: moduleId,
      title_he: t('admin.courses.wizard.new_lesson'),
      order_index: module.lessons.length,
      lesson_type: 'video'
    };

    const { data, error: _error } = await supabase.from('lessons').insert([newLesson]).select().single();
    if (data) {
      setModules(modules.map(m => 
        m.id === moduleId ? { ...m, lessons: [...m.lessons, data] } : m
      ));
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm(t('admin.courses.delete_module_confirm'))) return;
    const { error } = await supabase.from('modules').delete().eq('id', moduleId);
    if (!error) {
      setModules(modules.filter(m => m.id !== moduleId));
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!window.confirm(t('admin.courses.delete_lesson_confirm'))) return;
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (!error) {
      setModules(modules.map(m => 
        m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m
      ));
      // Close tab if open
      setOpenLessons(openLessons.filter(l => l.id !== lessonId));
      if (activeTab === lessonId) setActiveTab('course');
    }
  };

  const deleteCourse = async (id: string) => {
    if (window.confirm(t('admin.courses.delete_confirm'))) {
      await supabase.from('courses').delete().eq('id', id);
      fetchCourses();
    }
  };

  const openLessonTab = async (lesson: Lesson) => {
    if (!openLessons.find(l => l.id === lesson.id)) {
      setOpenLessons([...openLessons, lesson]);
      await fetchLessonQuizzes(lesson.id);
      setLessonTabsState(prev => ({ ...prev, [lesson.id]: 'content' }));
    }
    setActiveTab(lesson.id);
  };

  const closeLessonTab = (lessonId: string) => {
    const newOpen = openLessons.filter(l => l.id !== lessonId);
    setOpenLessons(newOpen);
    if (activeTab === lessonId) {
      setActiveTab('course');
    }
  };

  const updateLessonData = (lessonId: string, updates: Partial<Lesson>) => {
    setOpenLessons(openLessons.map(l => l.id === lessonId ? { ...l, ...updates } : l));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {view === 'list' ? (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-navy">{isAgentsMode ? t('admin.agents.title') : t('admin.courses.title')}</h2>
              <p className="text-gray-500 mt-2 font-medium">{isAgentsMode ? t('admin.agents.subtitle') : t('admin.courses.subtitle')}</p>
            </div>
            <button 
              onClick={() => {
                setEditingCourse({
                  title: '',
                  description: '',
                  language: 'he',
                  category: isAgentsMode ? 'ai_agent_home' : 'certificate',
                  has_pre_test: false,
                  has_ai_mentor: false,
                  has_certificate: false,
                  is_paid: false,
                  price: 0,
                  ai_mentor_url: '',
                  payment_url: '',
                  external_tool_url: '',
                  demo_video_url: '',
                  visibility: ['he', 'en'],
                  min_pre_test_score: 80
                });
                setCurrentStep(1);
                setView('edit');
                setOpenLessons([]);
                setActiveTab('course');
              }}
              className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
            >
              <Plus size={24} />
              {isAgentsMode ? t('admin.agents.add_new') : t('admin.courses.add_new')}
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-start">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-start">
                    {isAgentsMode ? t('admin.agents.table.agent') : t('admin.courses.table.course')}
                  </th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-start">
                    {isAgentsMode ? t('admin.agents.table.category') : t('admin.courses.table.visibility')}
                  </th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-start">
                    {isAgentsMode ? t('admin.agents.table.price') : t('admin.courses.table.modules')}
                  </th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-start">
                    {t('admin.courses.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold">{t('admin.courses.loading')}</td></tr>
                ) : error ? (
                  <tr><td colSpan={4} className="px-8 py-12 text-center text-red-500 font-bold">{t('common.error')}: {error}</td></tr>
                ) : courses.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold">{t('admin.courses.no_items', 'לא נמצאו פריטים')}</td></tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          {course.image_url ? (
                            <img src={course.image_url} className="w-12 h-12 rounded-xl object-cover" alt="" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                              {isAgentsMode ? <Brain size={20} /> : <BookOpen size={20} />}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-navy">{course.title}</p>
                            <div className="flex gap-2 mt-1">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${course.language === 'he' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                {course.language}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {isAgentsMode ? (
                          <span className="text-[10px] font-black uppercase px-3 py-1.5 rounded-full bg-purple-100 text-purple-600">
                            {course.category === 'ai_agent_home' ? t('admin.courses.form.category_home') : t('admin.courses.form.category_business')}
                          </span>
                        ) : (
                        <div className="flex gap-3">
                          <StatusBadge active={!!course.has_pre_test} icon={Shield} color="blue" />
                          <StatusBadge active={!!course.has_ai_mentor} icon={Brain} color="purple" />
                          <StatusBadge active={!!course.has_certificate} icon={Award} color="yellow" />
                        </div>
                        )}
                      </td>
                      <td className="px-8 py-6 font-bold text-navy">
                        {course.is_paid ? `₪${course.price}` : <span className="text-green-500 uppercase text-xs">{t('purchase.sticky.free')}</span>}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingCourse(course); setCurrentStep(1); setView('edit'); setOpenLessons([]); setActiveTab('course'); }} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit2 size={18} /></button>
                          <button onClick={() => deleteCourse(course.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[85vh]">
          {/* Internal Tabs Bar */}
          {!isAgentsMode && (
          <div className="bg-gray-50/50 border-b border-gray-100 px-8 pt-6 flex items-end gap-2">
            <button 
              onClick={() => setActiveTab('course')}
              className={`px-8 py-4 rounded-t-2xl font-black text-sm transition-all flex items-center gap-2 relative ${
                activeTab === 'course' 
                  ? 'bg-white text-navy shadow-[0_-4px_20px_rgba(0,0,0,0.03)] border-x border-t border-gray-100' 
                  : 'text-gray-400 hover:text-navy hover:bg-white/50'
              }`}
            >
              <Settings size={18} />
                {t('admin.courses.wizard.step1')}
              {activeTab === 'course' && <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-white z-10" />}
            </button>
            
            {openLessons.map((lesson) => (
              <div key={lesson.id} className="relative group">
                <button 
                  onClick={() => setActiveTab(lesson.id)}
                  className={`px-8 py-4 rounded-t-2xl font-black text-sm transition-all flex items-center gap-2 relative border-t border-x ${
                    activeTab === lesson.id 
                      ? 'bg-white text-navy shadow-[0_-4px_20px_rgba(0,0,0,0.03)] border-gray-100' 
                      : 'text-gray-400 hover:text-navy hover:bg-white/50 border-transparent'
                  }`}
                >
                  {lesson.lesson_type === 'text' ? <FileText size={18} /> : <Video size={18} />}
                  <span className="max-w-[120px] truncate">{lesson.title}</span>
                  {activeTab === lesson.id && <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-white z-10" />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); closeLessonTab(lesson.id); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isAgentsMode ? (
              /* CLEAN AGENT FORM */
              <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setView('list')}
                        className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
                      >
                        <ChevronLeft size={24} className="rtl:rotate-180" />
                      </button>
                      <div>
                        <h3 className="text-3xl font-black text-navy">
                          {editingCourse?.id ? t('admin.agents.edit_title') : t('admin.agents.create_title')}
                        </h3>
                        <p className="text-gray-400 font-bold mt-1">
                          {editingCourse?.title || t('admin.agents.new_agent')}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setView('list')} className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400"><X size={24} /></button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      {/* Left Column: Image & Basic Info */}
                      <div className="space-y-8">
                        <div>
                          <label className="block text-sm font-black text-navy uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Camera size={16} /> {t('admin.agents.form.image')}
                          </label>
                          <div className="relative group aspect-video">
                            <div className="w-full h-full bg-gray-50 rounded-[32px] overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center transition-all group-hover:border-navy/20">
                              {editingCourse?.image_url ? (
                                <img src={editingCourse.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-300">
                                  <Upload size={40} />
                                  <span className="text-[10px] font-black uppercase">Click to upload</span>
                                </div>
                              )}
                            </div>
                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-navy/40 backdrop-blur-sm rounded-[32px]">
                              <div className="bg-white text-navy px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2">
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {t('admin.courses.form.upload_image')}
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <label className="block text-sm font-black text-navy uppercase tracking-widest">{t('admin.agents.form.category')}</label>
                            <div className="flex flex-col gap-2">
                              <button 
                                type="button"
                                onClick={() => setEditingCourse({...editingCourse, category: 'ai_agent_home'})}
                                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${editingCourse?.category === 'ai_agent_home' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400'}`}
                              >
                                <Home size={18} />
                                <span className="font-bold text-xs">{t('admin.courses.form.category_home')}</span>
                              </button>
                              <button 
                                type="button"
                                onClick={() => setEditingCourse({...editingCourse, category: 'ai_agent_business'})}
                                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${editingCourse?.category === 'ai_agent_business' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400'}`}
                              >
                                <Briefcase size={18} />
                                <span className="font-bold text-xs">{t('admin.courses.form.category_business')}</span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <label className="block text-sm font-black text-navy uppercase tracking-widest">{t('purchase.stats.language')}</label>
                            <div className="flex flex-col gap-2">
                              <button 
                                type="button"
                                onClick={() => setEditingCourse({...editingCourse, language: 'he'})}
                                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${editingCourse?.language === 'he' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-400'}`}
                              >
                                <div className="w-5 h-5 rounded-md bg-current opacity-20 flex items-center justify-center text-[10px] text-white font-black">HE</div>
                                <span className="font-bold text-xs">{t('languages.he')}</span>
                              </button>
                              <button 
                                type="button"
                                onClick={() => setEditingCourse({...editingCourse, language: 'en'})}
                                className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${editingCourse?.language === 'en' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}
                              >
                                <div className="w-5 h-5 rounded-md bg-current opacity-20 flex items-center justify-center text-[10px] text-white font-black">EN</div>
                                <span className="font-bold text-xs">{t('languages.en')}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="block text-sm font-black text-navy uppercase tracking-widest">{t('admin.courses.form.visibility')}</label>
                          <div className="flex gap-2">
                            {['he', 'en'].map(lang => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => {
                                  const current = editingCourse?.visibility || ['he', 'en'];
                                  const newVal = current.includes(lang) 
                                    ? current.filter(l => l !== lang)
                                    : [...current, lang];
                                  setEditingCourse({...editingCourse, visibility: newVal});
                                }}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold text-xs transition-all border-2 ${
                                  (editingCourse?.visibility || ['he', 'en']).includes(lang)
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-100 text-gray-400'
                                }`}
                              >
                                {lang === 'he' ? t('languages.he') : t('languages.en')}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Pricing & Content */}
                      <div className="space-y-8">
                        <div>
                          <label className="block text-sm font-bold text-navy mb-2">{t('admin.agents.form.title')}</label>
                          <input 
                            required
                            className="w-full bg-gray-50 border-none rounded-[24px] px-6 py-5 font-bold text-navy focus:ring-2 focus:ring-primary/20 transition-all text-lg shadow-sm"
                            value={editingCourse?.title || ''}
                            onChange={e => setEditingCourse({...editingCourse, title: e.target.value})}
                            placeholder={t('admin.courses.placeholders.title_he')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-navy mb-2">{t('admin.agents.form.description')}</label>
                          <textarea 
                            className="w-full bg-gray-50 border-none rounded-[24px] px-6 py-5 font-medium focus:ring-2 focus:ring-primary/20 transition-all min-h-[160px] shadow-sm"
                            value={editingCourse?.description || ''}
                            onChange={e => setEditingCourse({...editingCourse, description: e.target.value})}
                            placeholder={t('admin.courses.placeholders.description_he')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.problem_solved_he')}</label>
                          <textarea 
                            className="w-full bg-gray-50 border-none rounded-[24px] px-6 py-5 font-medium focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] shadow-sm"
                            value={editingCourse?.problem_solved || ''}
                            onChange={e => setEditingCourse({...editingCourse, problem_solved: e.target.value})}
                            placeholder={t('admin.courses.placeholders.problem_solved_he')}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingCourse?.is_paid ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                  <DollarSign size={20} />
                                </div>
                                <span className="font-black text-navy">{t('admin.agents.form.paid')}</span>
                              </div>
                              <button 
                                type="button"
                                onClick={() => setEditingCourse({...editingCourse, is_paid: !editingCourse?.is_paid})}
                                className={`w-14 h-8 rounded-full transition-all relative ${editingCourse?.is_paid ? 'bg-emerald-500' : 'bg-gray-200'}`}
                              >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${editingCourse?.is_paid ? 'right-7' : 'right-1'}`} />
                              </button>
                            </div>

                            {editingCourse?.is_paid && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4">
                                <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">{t('admin.agents.form.price')}</label>
                                  <input 
                                    type="number"
                                    className="w-full bg-white border-none rounded-xl px-4 py-3 font-black text-primary focus:ring-2 focus:ring-primary/20 shadow-sm"
                                    value={editingCourse?.price || 0}
                                    onChange={e => setEditingCourse({...editingCourse, price: parseFloat(e.target.value)})}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">{t('admin.courses.form.payment_url')}</label>
                                  <input 
                                    type="url"
                                    className="w-full bg-white border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary/20 shadow-sm"
                                    value={editingCourse?.payment_url || ''}
                                    onChange={e => setEditingCourse({...editingCourse, payment_url: e.target.value})}
                                    placeholder="https://..."
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                      <div>
                        <label className="block text-sm font-bold text-navy mb-2 flex items-center gap-2">
                          <Layout size={16} className="text-primary" /> {t('admin.agents.form.link')}
                        </label>
                        <input 
                          type="url"
                          required
                          className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                          value={editingCourse?.external_tool_url || ''}
                          onChange={e => setEditingCourse({...editingCourse, external_tool_url: e.target.value})}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-navy mb-2 flex items-center gap-2">
                          <Video size={16} className="text-red-500" /> {t('admin.agents.form.demo')}
                        </label>
                        <input 
                          type="url"
                          className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                          value={editingCourse?.demo_video_url || ''}
                          onChange={e => setEditingCourse({...editingCourse, demo_video_url: e.target.value})}
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="pt-10 flex justify-end gap-4">
                      <button 
                        type="button" 
                        onClick={() => setView('list')} 
                        className="px-10 py-5 rounded-[24px] font-black text-gray-400 hover:bg-gray-100 transition-all"
                      >
                        {t('common.cancel')}
                      </button>
                      <button 
                        type="submit" 
                        className="bg-emerald-500 text-white px-16 py-5 rounded-[24px] font-black hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/20 flex items-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Check size={24} />
                        {t('admin.courses.wizard.finish')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : activeTab === 'course' ? (
              <>
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-8">
                    <button 
                      onClick={() => setView('list')}
                      className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div>
                      <h3 className="text-2xl font-black text-navy">{editingCourse?.id ? t('admin.courses.edit_title') : t('admin.courses.create_title')}</h3>
                      <p className="text-gray-400 text-sm font-bold">{editingCourse?.title || t('admin.courses.new_course')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StepIndicator 
                        number={1} 
                        title={t('admin.courses.wizard.step1')} 
                        active={currentStep === 1} 
                        completed={currentStep > 1} 
                      />
                      <div className="w-8 h-px bg-gray-200"></div>
                      <StepIndicator 
                        number={2} 
                        title={t('admin.courses.wizard.step2')} 
                        active={currentStep === 2} 
                        completed={currentStep > 2} 
                      />
                      {editingCourse?.has_pre_test && (
                        <>
                          <div className="w-8 h-px bg-gray-200"></div>
                          <StepIndicator 
                            number={3} 
                            title={t('admin.courses.wizard.step3')} 
                            active={currentStep === 3} 
                            completed={currentStep > 3} 
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setView('list')} className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400"><X size={24} /></button>
                </div>

                <div className="p-10">
                  {currentStep === 1 ? (
                    <form onSubmit={handleSave} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-8">
                          <h4 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2 bg-gray-50 w-fit px-4 py-2 rounded-xl">
                            <BookOpen size={16} /> {t('admin.courses.wizard.step1')}
                          </h4>
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-bold text-navy mb-4">{t('admin.courses.form.category')}</label>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {!isAgentsMode ? (
                                  <>
                                    <button 
                                      type="button"
                                      onClick={() => setEditingCourse({...editingCourse, category: 'certificate'})}
                                      className={`p-4 rounded-xl border-2 transition-all font-bold text-xs ${editingCourse?.category === 'certificate' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400'}`}
                                    >
                                      {t('landing.tabs.certificate')}
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => setEditingCourse({...editingCourse, category: 'fast_track'})}
                                      className={`p-4 rounded-xl border-2 transition-all font-bold text-xs ${editingCourse?.category === 'fast_track' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400'}`}
                                    >
                                      {t('landing.tabs.fast_track')}
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      type="button"
                                      onClick={() => setEditingCourse({...editingCourse, category: 'ai_agent_home'})}
                                      className={`p-4 rounded-xl border-2 transition-all font-bold text-xs ${editingCourse?.category === 'ai_agent_home' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400'}`}
                                    >
                                      {t('admin.courses.form.category_home')}
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => setEditingCourse({...editingCourse, category: 'ai_agent_business'})}
                                      className={`p-4 rounded-xl border-2 transition-all font-bold text-xs ${editingCourse?.category === 'ai_agent_business' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400'}`}
                                    >
                                      {t('admin.courses.form.category_business')}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-navy mb-4">{t('admin.courses.form.course_image')}</label>
                              <div className="flex items-start gap-6">
                                <div className="relative group">
                                  <div className="w-40 h-40 bg-gray-50 rounded-[32px] overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center transition-all group-hover:border-navy/20">
                                    {editingCourse?.image_url ? (
                                      <img 
                                        src={editingCourse.image_url} 
                                        alt="Course Preview" 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex flex-col items-center text-gray-400">
                                        <Camera size={32} strokeWidth={1.5} />
                                      </div>
                                    )}
                                  </div>
                                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-navy/80 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 backdrop-blur-sm">
                                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                      {editingCourse?.image_url ? t('admin.courses.form.change_image') : t('admin.courses.form.upload_image')}
                                    </div>
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                      disabled={uploading}
                                    />
                                  </label>
                                </div>
                                <div className="flex-1 pt-2">
                                  <p className="text-xs text-gray-400 font-bold leading-relaxed mb-4">
                                    {t('admin.courses.form.upload_image_hint', 'מומלץ להעלות תמונה ביחס של 16:9')}<br />
                                    {t('admin.courses.form.upload_image_formats', 'גודל מקסימלי: 2MB. פורמטים נתמכים: JPG, PNG, WebP.')}
                                  </p>
                                  <input 
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-navy/5 transition-all text-xs"
                                    value={editingCourse?.image_url || ''}
                                    onChange={e => setEditingCourse({...editingCourse, image_url: e.target.value})}
                                    placeholder={t('admin.courses.form.course_image_url_placeholder', 'או הדבק כתובת URL לתמונה...')}
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.title_he')}</label>
                              <input 
                                required
                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-navy/5 transition-all"
                                value={editingCourse?.title || ''}
                                onChange={e => setEditingCourse({...editingCourse, title: e.target.value})}
                                placeholder={t('admin.courses.placeholders.title_he')}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.description_he')}</label>
                              <textarea 
                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-navy/5 transition-all min-h-[160px]"
                                value={editingCourse?.description || ''}
                                onChange={e => setEditingCourse({...editingCourse, description: e.target.value})}
                                placeholder={t('admin.courses.placeholders.description_he')}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.problem_solved_he')}</label>
                                <textarea 
                                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-navy/5 transition-all min-h-[100px]"
                                  value={editingCourse?.problem_solved || ''}
                                  onChange={e => setEditingCourse({...editingCourse, problem_solved: e.target.value})}
                                  placeholder={t('admin.courses.placeholders.problem_solved_he')}
                                />
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.duration_minutes')}</label>
                                  <input 
                                    type="number"
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-navy/5 transition-all"
                                    value={editingCourse?.duration_minutes || 0}
                                    onChange={e => setEditingCourse({...editingCourse, duration_minutes: parseInt(e.target.value)})}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.course_type')}</label>
                                  <select 
                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-navy/5 transition-all"
                                    value={editingCourse?.course_type || 'professional_training'}
                                    onChange={e => setEditingCourse({...editingCourse, course_type: e.target.value})}
                                  >
                                    <option value="professional_training">{t('admin.courses.form.course_type_training')}</option>
                                    <option value="ai_tool_only">{t('admin.courses.form.course_type_tool')}</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-8">
                          <h4 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2 bg-gray-50 w-fit px-4 py-2 rounded-xl">
                            <Globe size={16} /> {t('purchase.stats.language')}
                          </h4>
                          <div className="space-y-4">
                            <button 
                              type="button"
                              onClick={() => setEditingCourse({...editingCourse, language: 'he'})}
                              className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                                editingCourse?.language === 'he' 
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                  : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingCourse?.language === 'he' ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>
                                HE
                              </div>
                              <span className="font-black text-sm">{t('languages.he')}</span>
                              {editingCourse?.language === 'he' && <Check size={20} className="ml-auto" />}
                            </button>

                            <button 
                              type="button"
                              onClick={() => setEditingCourse({...editingCourse, language: 'en'})}
                              className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                                editingCourse?.language === 'en' 
                                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                  : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingCourse?.language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                                EN
                              </div>
                              <span className="font-black text-sm">{t('languages.en')}</span>
                              {editingCourse?.language === 'en' && <Check size={20} className="ml-auto" />}
                            </button>
                          </div>
                          
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mt-8 mb-4">{t('admin.courses.form.visibility')}</h4>
                          <div className="flex gap-4">
                            {['he', 'en'].map(lang => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => {
                                  const current = editingCourse?.visibility || ['he', 'en'];
                                  const newVal = current.includes(lang) 
                                    ? current.filter(l => l !== lang)
                                    : [...current, lang];
                                  setEditingCourse({...editingCourse, visibility: newVal});
                                }}
                                className={`px-6 py-3 rounded-xl font-bold text-xs transition-all border-2 ${
                                  (editingCourse?.visibility || ['he', 'en']).includes(lang)
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-100 text-gray-400'
                                }`}
                              >
                                {lang === 'he' ? t('languages.he') : t('languages.en')}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100"></div>

                      <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">{t('admin.courses.form.modular_controls')}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                          <ToggleCard 
                            label={t('admin.courses.form.pre_test')} 
                            icon={Shield} 
                            active={!!editingCourse?.has_pre_test} 
                            onClick={() => setEditingCourse({...editingCourse, has_pre_test: !editingCourse?.has_pre_test})}
                          />
                          <ToggleCard 
                            label={t('admin.courses.form.ai_mentor')} 
                            icon={Brain} 
                            active={!!editingCourse?.has_ai_mentor} 
                            onClick={() => setEditingCourse({...editingCourse, has_ai_mentor: !editingCourse?.has_ai_mentor})}
                          />
                          <ToggleCard 
                            label={t('admin.courses.form.certificate')} 
                            icon={Award} 
                            active={!!editingCourse?.has_certificate} 
                            onClick={() => setEditingCourse({...editingCourse, has_certificate: !editingCourse?.has_certificate})}
                          />
                          <ToggleCard 
                            label={t('admin.courses.form.paid')} 
                            icon={DollarSign} 
                            active={!!editingCourse?.is_paid} 
                            onClick={() => setEditingCourse({...editingCourse, is_paid: !editingCourse?.is_paid})}
                          />
                          <ToggleCard 
                            label={t('admin.courses.form.enable_lesson_qa')} 
                            icon={HelpCircle} 
                            active={!!editingCourse?.enable_lesson_qa} 
                            onClick={() => setEditingCourse({...editingCourse, enable_lesson_qa: !editingCourse?.enable_lesson_qa})}
                          />
                        </div>
                      </div>

                      {editingCourse?.has_ai_mentor && (
                        <div className="animate-in slide-in-from-top-4 duration-300">
                          <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.ai_mentor_url')}</label>
                          <input 
                            type="url"
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            value={editingCourse?.ai_mentor_url || ''}
                            onChange={e => setEditingCourse({...editingCourse, ai_mentor_url: e.target.value})}
                            placeholder={t('admin.courses.placeholders.ai_mentor_url')}
                          />
                        </div>
                      )}

                      {editingCourse?.is_paid && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                          <div>
                            <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.price_ils')}</label>
                            <input 
                              type="number"
                              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all"
                              value={editingCourse?.price || 0}
                              onChange={e => setEditingCourse({...editingCourse, price: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.payment_url')}</label>
                            <input 
                              type="url"
                              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all"
                              value={editingCourse?.payment_url || ''}
                              onChange={e => setEditingCourse({...editingCourse, payment_url: e.target.value})}
                              placeholder={t('admin.courses.placeholders.payment_url')}
                            />
                          </div>
                        </div>
                      )}

                      {isAgentsMode && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                          <div>
                            <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.external_tool_url')}</label>
                            <input 
                              type="url"
                              required
                              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all"
                              value={editingCourse?.external_tool_url || ''}
                              onChange={e => setEditingCourse({...editingCourse, external_tool_url: e.target.value})}
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.demo_video_url')}</label>
                            <input 
                              type="url"
                              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all"
                              value={editingCourse?.demo_video_url || ''}
                              onChange={e => setEditingCourse({...editingCourse, demo_video_url: e.target.value})}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-6 border-t border-gray-100 flex justify-end gap-4 bg-white">
                        <button 
                          type="button" 
                          onClick={() => setView('list')}
                          className="px-8 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all"
                        >
                          {t('common.cancel')}
                        </button>
                        <button 
                          type="submit"
                          className="bg-emerald-500 text-white px-12 py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                        >
                          {isAgentsMode ? (
                            <>
                              <Check size={20} />
                              {t('admin.courses.wizard.finish')}
                            </>
                          ) : (
                            <>
                          {t('admin.courses.wizard.next')}
                          <ChevronRight size={20} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : currentStep === 2 ? (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xl font-black text-navy">{t('admin.courses.wizard.content_title')}</h4>
                          <p className="text-gray-500 text-sm font-medium">{t('admin.courses.wizard.content_subtitle')}</p>
                        </div>
                        <button 
                          onClick={handleAddModule}
                          className="bg-navy text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-navy/90 transition-all"
                        >
                          <Plus size={20} />
                          {t('admin.courses.wizard.add_module')}
                        </button>
                      </div>

                      <div className="space-y-6">
                        {modules.map((module, _mIndex) => (
                          <div key={module.id} className="bg-gray-50 rounded-[24px] p-6 border border-gray-100">
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex-1">
                                <input 
                                  className="w-full bg-white border-none rounded-xl px-4 py-2 font-bold text-navy focus:ring-2 focus:ring-navy/5 transition-all"
                                  value={module.title || ''}
                                  onChange={async (e) => {
                                    const newTitle = e.target.value;
                                    setModules(modules.map(m => m.id === module.id ? { ...m, title: newTitle } : m));
                                    await supabase.from('modules').update({ title: newTitle }).eq('id', module.id);
                                  }}
                                  placeholder={t('admin.courses.placeholders.module_title_he')}
                                />
                              </div>
                              <button 
                                onClick={() => handleDeleteModule(module.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-4"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>

                            <div className="space-y-3 pl-8 border-l-2 border-gray-200">
                              {module.lessons.map((lesson, lIndex) => (
                                <div key={lesson.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 group">
                                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 font-black text-xs">
                                    {lIndex + 1}
                                  </div>
                                  <div className="flex-1">
                                    <input 
                                      className="w-full border-none p-0 font-bold text-navy focus:ring-0"
                                      value={lesson.title || ''}
                                      onChange={async (e) => {
                                        const newTitle = e.target.value;
                                        setModules(modules.map(m => m.id === module.id ? {
                                          ...m,
                                          lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, title: newTitle } : l)
                                        } : m));
                                        await supabase.from('lessons').update({ title: newTitle }).eq('id', lesson.id);
                                      }}
                                      placeholder={t('admin.courses.placeholders.lesson_title_he')}
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => openLessonTab(lesson)}
                                      className={`p-2 rounded-lg transition-all flex items-center gap-2 font-bold text-xs ${
                                        lesson.lesson_type === 'text' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-blue-600 hover:bg-blue-50'
                                      }`}
                                      title={t('admin.courses.wizard.lesson_details')}
                                    >
                                      {lesson.lesson_type === 'text' ? <FileText size={16} /> : <Video size={16} />}
                                      {lesson.lesson_type === 'text' ? t('admin.courses.wizard.lesson_text') : t('admin.courses.wizard.lesson_video')}
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                      className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <button 
                                onClick={() => handleAddLesson(module.id)}
                                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-navy/20 hover:text-navy/40 transition-all"
                              >
                                <Plus size={16} />
                                {t('admin.courses.wizard.add_lesson')}
                              </button>
                            </div>
                          </div>
                        ))}
                        {modules.length === 0 && (
                          <div className="py-20 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                            <Layers size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold">{t('admin.courses.wizard.no_modules')}</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex justify-between items-center bg-white">
                        <button 
                          type="button" 
                          onClick={() => setCurrentStep(1)}
                          className="px-8 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all flex items-center gap-2"
                        >
                          <ChevronLeft size={20} />
                          {t('admin.courses.wizard.back')}
                        </button>
                        <button 
                          onClick={async () => {
                            if (editingCourse?.has_pre_test) {
                              if (editingCourse.id) await fetchPreTestQuizzes(editingCourse.id);
                              setCurrentStep(3);
                            } else {
                              setView('list');
                            }
                          }}
                          className="bg-emerald-500 text-white px-12 py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                        >
                          {editingCourse?.has_pre_test ? (
                            <>
                              {t('admin.courses.wizard.next')}
                              <ChevronRight size={20} />
                            </>
                          ) : (
                            <>
                              <Check size={20} />
                              {t('admin.courses.wizard.finish')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="text-2xl font-black text-navy">{t('admin.courses.wizard.pretest_title')}</h4>
                          <p className="text-gray-500 font-medium">{t('admin.courses.wizard.pretest_subtitle')}</p>
                        </div>
                        <div className="w-64">
                          <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.wizard.min_score')}</label>
                          <input 
                            type="number"
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            value={editingCourse?.min_pre_test_score || 0}
                            onChange={async (e) => {
                              const val = parseInt(e.target.value);
                              setEditingCourse({ ...editingCourse, min_pre_test_score: val });
                              if (editingCourse?.id) {
                                await supabase.from('courses').update({ min_pre_test_score: val }).eq('id', editingCourse.id);
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        {preTestQuizzes.map((quiz, qIndex) => {
                          const pointsPerQuestion = preTestQuizzes.length > 0 ? (100 / preTestQuizzes.length).toFixed(1) : 0;
                          return (
                            <div key={quiz.id} className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 space-y-6">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                    {t('admin.courses.wizard.question')} {qIndex + 1} ({pointsPerQuestion} {t('admin.courses.wizard.points')})
                                  </label>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                      className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold text-navy focus:ring-2 focus:ring-navy/5 transition-all"
                                      value={quiz.question_he || ''}
                                      onChange={async (e) => {
                                        const newVal = e.target.value;
                                        setPreTestQuizzes(preTestQuizzes.map(q => q.id === quiz.id ? { ...q, question_he: newVal } : q));
                                        await supabase.from('quizzes').update({ question_he: newVal }).eq('id', quiz.id);
                                      }}
                                      placeholder={t('admin.courses.placeholders.new_question_text') + " (HE)"}
                                    />
                                    <input 
                                      className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold text-navy focus:ring-2 focus:ring-navy/5 transition-all"
                                      value={quiz.question_en || ''}
                                      onChange={async (e) => {
                                        const newVal = e.target.value;
                                        setPreTestQuizzes(preTestQuizzes.map(q => q.id === quiz.id ? { ...q, question_en: newVal } : q));
                                        await supabase.from('quizzes').update({ question_en: newVal }).eq('id', quiz.id);
                                      }}
                                      placeholder="Question text (EN)"
                                    />
                                  </div>
                                </div>
                                <button 
                                  onClick={async () => {
                                    if (window.confirm(t('admin.courses.delete_question_confirm'))) {
                                      await supabase.from('quizzes').delete().eq('id', quiz.id);
                                      setPreTestQuizzes(preTestQuizzes.filter(q => q.id !== quiz.id));
                                    }
                                  }}
                                  className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-4"
                                >
                                  <Trash2 size={24} />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {((quiz.options_he as string[]) || ['', '', '', '']).map((opt, oIndex) => {
                                  const optEn = ((quiz.options_en as string[]) || ['', '', '', ''])[oIndex] || '';
                                  return (
                                    <div key={oIndex} className={`flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all ${quiz.correct_answer_index === oIndex ? 'border-emerald-500 bg-emerald-50' : 'border-white bg-white'}`}>
                                      <div className="flex items-center gap-3">
                                        <button 
                                          onClick={async () => {
                                                  setPreTestQuizzes(preTestQuizzes.map(q => q.id === quiz.id ? { ...q, correct_answer_index: oIndex } : q) as Tables<'quizzes'>[]);
                                            await supabase.from('quizzes').update({ correct_answer_index: oIndex }).eq('id', quiz.id);
                                          }}
                                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${quiz.correct_answer_index === oIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200'}`}
                                        >
                                          {quiz.correct_answer_index === oIndex && <Check size={14} />}
                                        </button>
                                        <input 
                                          className="flex-1 bg-transparent border-none p-2 font-bold text-navy focus:ring-0"
                                          value={opt}
                                          onChange={async (e) => {
                                            const newOpts = [...((quiz.options_he as string[]) || ['', '', '', ''])];
                                            newOpts[oIndex] = e.target.value;
                                                  setPreTestQuizzes(preTestQuizzes.map(q => q.id === quiz.id ? { ...q, options_he: newOpts } : q) as Tables<'quizzes'>[]);
                                            await supabase.from('quizzes').update({ options_he: newOpts }).eq('id', quiz.id);
                                          }}
                                                placeholder={`${t('admin.courses.wizard.option')} ${oIndex + 1} (HE)`}
                                        />
                                      </div>
                                      <input 
                                        className="w-full bg-transparent border-t border-gray-100 p-2 text-sm text-gray-500 focus:ring-0"
                                        value={optEn}
                                        onChange={async (e) => {
                                          const newOptsEn = [...((quiz.options_en as string[]) || ['', '', '', ''])];
                                          newOptsEn[oIndex] = e.target.value;
                                          setPreTestQuizzes(preTestQuizzes.map(q => q.id === quiz.id ? { ...q, options_en: newOptsEn } : q) as Tables<'quizzes'>[]);
                                          await supabase.from('quizzes').update({ options_en: newOptsEn }).eq('id', quiz.id);
                                        }}
                                        placeholder={`Option ${oIndex + 1} (EN)`}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        <button 
                          onClick={async () => {
                            if (!editingCourse?.id) return;
                            const newQuiz = {
                              course_id: editingCourse.id,
                              question_he: t('admin.courses.placeholders.new_question_text'),
                              options_he: ['', '', '', ''],
                              correct_answer_index: 0,
                              order_index: preTestQuizzes.length
                            };
                            const { data: _data, error: _error } = await supabase.from('quizzes').insert([newQuiz]).select().single();
                            if (_data) setPreTestQuizzes([...preTestQuizzes, _data]);
                          }}
                          className="w-full py-8 border-2 border-dashed border-gray-200 rounded-[32px] text-gray-400 font-black flex items-center justify-center gap-3 hover:border-emerald-500/20 hover:text-emerald-500 hover:bg-emerald-50/30 transition-all"
                        >
                          <Plus size={24} />
                          {t('admin.courses.wizard.add_question')}
                        </button>
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex justify-between items-center bg-white">
                        <button 
                          type="button" 
                          onClick={() => setCurrentStep(2)}
                          className="px-8 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all flex items-center gap-2"
                        >
                          <ChevronLeft size={20} />
                          {t('admin.courses.wizard.back')}
                        </button>
                        <button 
                          onClick={() => setView('list')}
                          className="bg-emerald-500 text-white px-12 py-4 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                        >
                          <Check size={20} />
                          {t('admin.courses.wizard.finish')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Lesson Tab Content */
              (() => {
                const lesson = openLessons.find(l => l.id === activeTab);
                if (!lesson) return null;
                const activeSubTab = lessonTabsState[lesson.id] || 'content';
                const currentQuizzes = lessonQuizzes[lesson.id] || [];

                return (
                  <div className="flex flex-col min-h-full">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                      <div className="flex items-center gap-8">
                        <div>
                          <h3 className="text-2xl font-black text-navy">{t('admin.courses.wizard.lesson_edit_title')}</h3>
                          <p className="text-gray-400 text-sm font-bold">{lesson.title}</p>
                        </div>
                        <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-2">
                          <button 
                            onClick={() => setLessonTabsState(prev => ({ ...prev, [lesson.id]: 'content' }))}
                            className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${
                              activeSubTab === 'content' ? 'bg-white text-navy shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            <Layout size={18} />
                            {t('admin.courses.wizard.lesson_tab_content')}
                          </button>
                          <button 
                            onClick={() => setLessonTabsState(prev => ({ ...prev, [lesson.id]: 'quiz' }))}
                            className={`px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${
                              activeSubTab === 'quiz' ? 'bg-white text-navy shadow-sm' : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            <HelpCircle size={18} />
                            {t('admin.courses.wizard.lesson_tab_quiz')}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={async () => {
                            const { error } = await supabase
                              .from('lessons')
                              .update({
                                video_url: lesson.video_url,
                                content: lesson.content,
                                lesson_type: lesson.lesson_type,
                                has_quiz: lesson.has_quiz,
                                duration_text: lesson.duration_text,
                                quiz_min_score: (lesson as any).quiz_min_score
                              })
                              .eq('id', lesson.id);
                            
                            if (!error) {
                              setModules(modules.map(m => ({
                                ...m,
                                lessons: m.lessons.map(l => l.id === lesson.id ? lesson : l)
                              })));
                              // Keep the tab open but show a success indicator maybe? 
                              // For now, let's stay on the tab.
                            }
                          }}
                          className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                          <Save size={20} />
                          {t('admin.courses.wizard.save_lesson')}
                        </button>
                        <button onClick={() => closeLessonTab(lesson.id)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400">
                          <X size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 p-10">
                      {activeSubTab === 'content' ? (
                        <div className="max-w-4xl mx-auto space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <label className="block text-sm font-black text-navy uppercase tracking-widest">{t('admin.courses.wizard.lesson_type')}</label>
                              <div className="grid grid-cols-2 gap-4">
                                <button 
                                  onClick={() => updateLessonData(lesson.id, { lesson_type: 'video' })}
                                  className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${
                                    lesson.lesson_type === 'video' || !lesson.lesson_type 
                                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                      : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                  }`}
                                >
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    lesson.lesson_type === 'video' || !lesson.lesson_type ? 'bg-blue-500 text-white' : 'bg-gray-50'
                                  }`}>
                                    <Video size={24} />
                                  </div>
                                  <span className="font-bold text-sm">{t('admin.courses.wizard.lesson_video')}</span>
                                </button>
                                <button 
                                  onClick={() => updateLessonData(lesson.id, { lesson_type: 'text' })}
                                  className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${
                                    lesson.lesson_type === 'text' 
                                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                                      : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                  }`}
                                >
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    lesson.lesson_type === 'text' ? 'bg-emerald-500 text-white' : 'bg-gray-50'
                                  }`}>
                                    <FileText size={24} />
                                  </div>
                                  <span className="font-bold text-sm">{t('admin.courses.wizard.lesson_text')}</span>
                                </button>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <label className="block text-sm font-black text-navy uppercase tracking-widest">{t('admin.courses.form.duration_text')}</label>
                              <input 
                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-navy/5 transition-all"
                                value={lesson.duration_text || ''}
                                onChange={(e) => updateLessonData(lesson.id, { duration_text: e.target.value })}
                                placeholder="05:30"
                              />
                            </div>
                          </div>

                          <div className="h-px bg-gray-100"></div>

                          {lesson.lesson_type === 'video' || !lesson.lesson_type ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                              <div>
                                <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.video_url')}</label>
                                <input 
                                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-navy/5 transition-all"
                                  value={lesson.video_url || ''}
                                  onChange={(e) => updateLessonData(lesson.id, { video_url: e.target.value })}
                                  placeholder={t('admin.courses.placeholders.video_url')}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.content_he')}</label>
                                <textarea 
                                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-navy/5 transition-all min-h-[200px]"
                                  value={lesson.content || ''}
                                  onChange={(e) => updateLessonData(lesson.id, { content: e.target.value })}
                                  placeholder={t('admin.courses.placeholders.content_he')}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                              <div>
                                <label className="block text-sm font-bold text-navy mb-2">{t('admin.courses.form.content_he')} (HTML)</label>
                                <textarea 
                                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium focus:ring-2 focus:ring-navy/5 transition-all min-h-[500px]"
                                  value={lesson.content || ''}
                                  onChange={(e) => updateLessonData(lesson.id, { content: e.target.value })}
                                  placeholder={t('admin.courses.placeholders.content_he')}
                                />
                                <p className="text-xs text-gray-400 mt-2 font-medium">{t('admin.courses.form.rich_text_hint', '* בקרוב: עורך טקסט עשיר (Rich Text Editor) מלא')}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-4xl mx-auto space-y-8">
                          {!lesson.has_quiz ? (
                            <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                              <HelpCircle size={64} className="mx-auto text-gray-200 mb-6" />
                              <h4 className="text-xl font-black text-navy mb-2">{t('admin.courses.wizard.lesson_quiz_disabled_title')}</h4>
                              <p className="text-gray-400 font-medium mb-8">{t('admin.courses.wizard.lesson_quiz_disabled_subtitle')}</p>
                              <button 
                                onClick={() => updateLessonData(lesson.id, { has_quiz: true })}
                                className="bg-navy text-white px-8 py-4 rounded-2xl font-black hover:bg-navy/90 transition-all"
                              >
                                {t('admin.courses.wizard.lesson_quiz_activate')}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-10">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="text-2xl font-black text-navy">{t('admin.courses.wizard.lesson_quiz_builder_title')}</h4>
                                  <p className="text-gray-500 font-medium">{t('admin.courses.wizard.lesson_quiz_builder_subtitle')}</p>
                                </div>
                                <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                  <div className="flex items-center gap-3">
                                    <input 
                                      type="checkbox"
                                      id="requires_score"
                                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                      checked={!!(lesson as any).quiz_min_score}
                                      onChange={(e) => updateLessonData(lesson.id, { quiz_min_score: e.target.checked ? 80 : null } as any)}
                                    />
                                    <label htmlFor="requires_score" className="text-sm font-bold text-navy">
                                      {t('admin.courses.wizard.lesson_quiz_requires_score')}
                                    </label>
                                  </div>
                                  
                                  {(lesson as any).quiz_min_score !== null && (lesson as any).quiz_min_score !== undefined && (
                                    <div className="flex items-center gap-2 animate-in slide-in-from-inline-start-2">
                                      <input 
                                        type="number"
                                        className="w-20 bg-white border-none rounded-xl px-3 py-2 font-black text-primary focus:ring-2 focus:ring-primary/20 shadow-sm text-center"
                                        value={(lesson as any).quiz_min_score}
                                        onChange={(e) => updateLessonData(lesson.id, { quiz_min_score: parseInt(e.target.value) } as any)}
                                        min="0"
                                        max="100"
                                      />
                                      <span className="text-xs font-bold text-gray-400">%</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-4">
                                  <button 
                                    onClick={() => updateLessonData(lesson.id, { has_quiz: false })}
                                    className="text-red-400 hover:text-red-600 font-bold text-sm"
                                  >
                                    {t('admin.courses.wizard.lesson_quiz_disable')}
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      const newQuiz = {
                                        lesson_id: lesson.id,
                                        question_he: t('admin.courses.wizard.new_question_text', 'שאלה חדשה'),
                                        options_he: ['', '', '', ''],
                                        correct_answer_index: 0,
                                       order_index: currentQuizzes.length
                                     };
                                     const { data: _data, error: _error } = await supabase.from('quizzes').insert([newQuiz]).select().single();
                                     if (_data) {
                                       setLessonQuizzes(prev => ({
                                         ...prev,
                                         [lesson.id]: [...(prev[lesson.id] || []), _data]
                                       }));
                                     }
                                    }}
                                    className="bg-navy text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                                  >
                                    <Plus size={20} />
                                    {t('admin.courses.wizard.add_question')}
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-6">
                                {currentQuizzes.map((quiz, qIndex) => (
                                  <div key={quiz.id} className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 space-y-6">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                                          {t('admin.courses.wizard.question')} {qIndex + 1}
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <input 
                                            className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold text-navy focus:ring-2 focus:ring-navy/5 transition-all"
                                            value={quiz.question_he || ''}
                                            onChange={async (e) => {
                                              const newVal = e.target.value;
                                              setLessonQuizzes(prev => ({
                                                ...prev,
                                                [lesson.id]: (prev[lesson.id] || []).map(q => q.id === quiz.id ? { ...q, question_he: newVal } : q)
                                              }));
                                              await supabase.from('quizzes').update({ question_he: newVal }).eq('id', quiz.id);
                                            }}
                                            placeholder={t('admin.courses.placeholders.new_question_text') + " (HE)"}
                                          />
                                          <input 
                                            className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold text-navy focus:ring-2 focus:ring-navy/5 transition-all"
                                            value={quiz.question_en || ''}
                                            onChange={async (e) => {
                                              const newVal = e.target.value;
                                              setLessonQuizzes(prev => ({
                                                ...prev,
                                                [lesson.id]: (prev[lesson.id] || []).map(q => q.id === quiz.id ? { ...q, question_en: newVal } : q)
                                              }));
                                              await supabase.from('quizzes').update({ question_en: newVal }).eq('id', quiz.id);
                                            }}
                                            placeholder="Question text (EN)"
                                          />
                                        </div>
                                      </div>
                                      <button 
                                        onClick={async () => {
                                          if (window.confirm(t('admin.courses.delete_question_confirm'))) {
                                            await supabase.from('quizzes').delete().eq('id', quiz.id);
                                            setLessonQuizzes(prev => ({
                                              ...prev,
                                              [lesson.id]: (prev[lesson.id] || []).filter(q => q.id !== quiz.id)
                                            }));
                                          }
                                        }}
                                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-4"
                                      >
                                        <Trash2 size={24} />
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {((quiz.options_he as string[]) || ['', '', '', '']).map((opt, oIndex) => {
                                        const optEn = ((quiz.options_en as string[]) || ['', '', '', ''])[oIndex] || '';
                                        return (
                                          <div key={oIndex} className={`flex flex-col gap-2 p-4 rounded-2xl border-2 transition-all ${quiz.correct_answer_index === oIndex ? 'border-emerald-500 bg-emerald-50' : 'border-white bg-white'}`}>
                                            <div className="flex items-center gap-3">
                                              <button 
                                                onClick={async () => {
                                                  setLessonQuizzes(prev => ({
                                                    ...prev,
                                                    [lesson.id]: prev[lesson.id].map(q => q.id === quiz.id ? { ...q, correct_answer_index: oIndex } : q)
                                                  }));
                                                  await supabase.from('quizzes').update({ correct_answer_index: oIndex }).eq('id', quiz.id);
                                                }}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${quiz.correct_answer_index === oIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200'}`}
                                              >
                                                {quiz.correct_answer_index === oIndex && <Check size={14} />}
                                              </button>
                                              <input 
                                                className="flex-1 bg-transparent border-none p-2 font-bold text-navy focus:ring-0"
                                                value={opt}
                                                onChange={async (e) => {
                                                  const newOpts = [...((quiz.options_he as string[]) || ['', '', '', ''])];
                                                  newOpts[oIndex] = e.target.value;
                                                  setLessonQuizzes(prev => ({
                                                    ...prev,
                                                    [lesson.id]: (prev[lesson.id] || []).map(q => q.id === quiz.id ? { ...q, options_he: newOpts } : q)
                                                  }));
                                                  await supabase.from('quizzes').update({ options_he: newOpts }).eq('id', quiz.id);
                                                }}
                                                placeholder={`${t('admin.courses.wizard.option')} ${oIndex + 1} (HE)`}
                                              />
                                            </div>
                                            <input 
                                              className="w-full bg-transparent border-t border-gray-100 p-2 text-sm text-gray-500 focus:ring-0"
                                              value={optEn}
                                              onChange={async (e) => {
                                                const newOptsEn = [...((quiz.options_en as string[]) || ['', '', '', ''])];
                                                newOptsEn[oIndex] = e.target.value;
                                                setLessonQuizzes(prev => ({
                                                  ...prev,
                                                  [lesson.id]: (prev[lesson.id] || []).map(q => q.id === quiz.id ? { ...q, options_en: newOptsEn } : q)
                                                }));
                                                await supabase.from('quizzes').update({ options_en: newOptsEn }).eq('id', quiz.id);
                                              }}
                                              placeholder={`Option ${oIndex + 1} (EN)`}
                                            />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StepIndicator: React.FC<{ number: number, title: string, active: boolean, completed: boolean }> = ({ number, title, active, completed }) => (
  <div className={`flex items-center gap-3 transition-all ${active ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${
      completed ? 'bg-emerald-500 text-white' : 
      active ? 'bg-navy text-white shadow-lg shadow-navy/20 scale-110' : 
      'bg-gray-100 text-gray-400'
    }`}>
      {completed ? <Check size={16} /> : number}
    </div>
    <span className={`text-sm font-black whitespace-nowrap ${active ? 'text-navy' : 'text-gray-400'}`}>{title}</span>
  </div>
);

const StatusBadge: React.FC<{ active?: boolean, icon: any, color: string }> = ({ active, icon: Icon, color }) => (
  <div className={`p-2 rounded-lg ${active ? `bg-${color}-100 text-${color}-600` : 'bg-gray-50 text-gray-300 opacity-50'}`}>
    <Icon size={16} />
  </div>
);

const ToggleCard: React.FC<{ label: string, icon: any, active: boolean, onClick: () => void }> = ({ label, icon: Icon, active, onClick }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 group ${
      active 
        ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 shadow-lg shadow-emerald-500/10' 
        : 'border-gray-100 bg-white text-gray-400 hover:border-emerald-500/30'
    }`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
      active ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-500'
    }`}>
      <Icon size={24} />
    </div>
    <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
    {active ? <Check size={14} className="mt-auto" /> : <X size={14} className="mt-auto opacity-30" />}
  </button>
);

export default CourseManagement;
