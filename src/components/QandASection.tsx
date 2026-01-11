import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Reply, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface QAEntry {
  id: string;
  content: string;
  user_id: string;
  lesson_id: string;
  parent_id: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    role: string;
  };
  replies?: QAEntry[];
}

interface QandASectionProps {
  lessonId: string;
}

const QandASection: React.FC<QandASectionProps> = ({ lessonId }) => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const [questions, setQuestions] = useState<QAEntry[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQA = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_qa')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group questions and replies
      const qMap = new Map<string, QAEntry>();
      const replies: QAEntry[] = [];

      (data || []).forEach((item: any) => {
        if (!item.parent_id) {
          qMap.set(item.id, { ...item, replies: [] });
        } else {
          replies.push(item);
        }
      });

      replies.forEach(reply => {
        const parent = qMap.get(reply.parent_id!);
        if (parent) {
          parent.replies?.push(reply);
        }
      });

      setQuestions(Array.from(qMap.values()));
    } catch (error) {
      console.error('Error fetching Q&A:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQA();
  }, [lessonId]);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('lesson_qa')
        .insert({
          lesson_id: lessonId,
          user_id: user.id,
          content: newQuestion.trim(),
          parent_id: null
        });

      if (error) throw error;
      setNewQuestion('');
      fetchQA();
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!newReply.trim() || !user || !isAdmin) return;

    try {
      const { error } = await supabase
        .from('lesson_qa')
        .insert({
          lesson_id: lessonId,
          user_id: user.id,
          content: newReply.trim(),
          parent_id: parentId
        });

      if (error) throw error;
      setNewReply('');
      setReplyTo(null);
      fetchQA();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.courses.delete_confirm'))) return;

    try {
      const { error } = await supabase
        .from('lesson_qa')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchQA();
    } catch (error) {
      console.error('Error deleting Q&A:', error);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-navy flex items-center gap-3">
          <MessageCircle size={24} className="text-primary" />
          {t('qa.title')}
        </h3>
        <span className="bg-gray-50 text-gray-500 px-4 py-1.5 rounded-full text-sm font-bold">
          {t('qa.questions_count', { count: questions.length })}
        </span>
      </div>

      <div className="space-y-8">
        {questions.length === 0 ? (
          <p className="text-center text-gray-400 py-8 italic">{t('community.no_posts')}</p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="space-y-4">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 group text-inline-start relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-navy">{q.profiles?.full_name || t('qa.anonymous')}</span>
                    {q.profiles?.role === 'admin' && (
                      <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        {t('header.user_role')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {new Date(q.created_at).toLocaleDateString()}
                    </span>
                    {(isAdmin || q.user_id === user?.id) && (
                      <button 
                        onClick={() => handleDelete(q.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{q.content}</p>
                
                {isAdmin && !replyTo && (
                  <button 
                    onClick={() => setReplyTo(q.id)}
                    className="mt-4 text-primary text-xs font-bold hover:underline flex items-center gap-1.5"
                  >
                    <Reply size={14} />
                    {t('qa.add_reply')}
                  </button>
                )}

                {replyTo === q.id && (
                  <form onSubmit={(e) => handleSubmitReply(e, q.id)} className="mt-4 flex gap-2">
                    <input 
                      type="text" 
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder={t('qa.reply_placeholder')}
                      className="flex-grow bg-white border border-gray-200 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-primary"
                      autoFocus
                    />
                    <button type="submit" className="bg-primary text-white p-2 rounded-xl hover:bg-primary-dark">
                      <Send size={18} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setReplyTo(null); setNewReply(''); }}
                      className="text-gray-400 text-xs px-2"
                    >
                      {t('common.cancel')}
                    </button>
                  </form>
                )}
              </div>

              {/* Replies */}
              {q.replies && q.replies.length > 0 && (
                <div className="ms-10 space-y-4 border-s-2 border-gray-100 ps-6">
                  {q.replies.map((reply) => (
                    <div key={reply.id} className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-inline-start relative group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy text-sm">{reply.profiles?.full_name}</span>
                          <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded font-black uppercase">
                            {t('header.user_role')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                          {(isAdmin || reply.user_id === user?.id) && (
                            <button 
                              onClick={() => handleDelete(reply.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmitQuestion} className="mt-8 relative">
        <input 
          type="text" 
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder={t('qa.input_placeholder')}
          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 ps-4 pe-12 text-sm focus:outline-none focus:border-primary transition-colors"
        />
        <button type="submit" className="absolute inline-end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default QandASection;
