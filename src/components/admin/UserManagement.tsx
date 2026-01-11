import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Search, User, Mail, Shield, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  user_course_access: {
    is_enrolled: boolean;
    pre_test_score: number;
    course: {
      title: string;
    }
  }[];
}

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch profiles with their course access info
    const { data, error: _error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_course_access (
          is_enrolled,
          pre_test_score,
          course:courses (
            title
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data as any);
    setLoading(false);
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-navy">{t('admin.users.title')}</h2>
          <p className="text-gray-500 mt-2 font-medium">{t('admin.users.subtitle')}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder={t('admin.users.search_placeholder')}
            className="bg-white border border-gray-100 rounded-2xl pl-12 pr-6 py-4 w-80 font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-bold">{t('admin.users.loading')}</div>
        ) : filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                <User size={32} />
              </div>
              
              <div className="flex-grow space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-navy">{user.full_name || t('admin.users.anonymous')}</h3>
                  {user.role === 'admin' && (
                    <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Shield size={12} /> {t('admin.users.role_admin')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-gray-400 font-medium text-sm">
                  <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
                  <span className="h-3 w-px bg-gray-200"></span>
                  <span>{t('admin.users.joined')} {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {user.user_course_access?.length > 0 ? user.user_course_access.map((access, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl px-6 py-3 border border-gray-50 flex items-center gap-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">{access.course?.title}</p>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${access.is_enrolled ? 'text-green-500' : 'text-yellow-500'}`}>
                          {access.is_enrolled ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {access.is_enrolled ? t('admin.users.enrolled') : t('admin.users.pending')}
                        </span>
                        <span className="h-3 w-px bg-gray-200"></span>
                        <span className="text-xs font-black text-navy">{t('admin.users.pre_test')}: {access.pre_test_score}%</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <span className="text-xs text-gray-300 font-bold uppercase tracking-widest italic">{t('admin.users.no_courses')}</span>
                )}
              </div>

              <button className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ChevronRight size={20} className="rtl:rotate-180" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;

