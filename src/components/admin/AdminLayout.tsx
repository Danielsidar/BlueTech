import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, BookOpen, BarChart3, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../LanguageSwitcher';

const AdminLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { signOut, user } = useAuth();
  const location = useLocation();
  const isRtl = i18n.language === 'he';

  const menuItems = [
    { id: 'courses', label: t('admin.menu.courses'), icon: BookOpen, path: '/admin/courses' },
    { id: 'agents', label: t('admin.menu.agents'), icon: LayoutDashboard, path: '/admin/agents' },
    { id: 'users', label: t('admin.menu.users'), icon: Users, path: '/admin/users' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Admin Sidebar - Green Theme (Emerald 950) */}
      <aside className="w-72 bg-emerald-950 text-white flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <span className="font-black text-xl tracking-tight">{t('admin.console_title')}</span>
          </div>
        </div>

        <nav className="flex-grow p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-emerald-400/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to System and Logout */}
        <div className="p-6 border-t border-white/5 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-emerald-400/60 hover:text-white hover:bg-white/5 w-full"
          >
            <ArrowLeft size={20} className="rtl:rotate-180" />
            <span>{t('admin.back_to_system')}</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-red-400 hover:text-white hover:bg-red-500/10 w-full"
          >
            <LogOut size={20} />
            <span>{t('sidebar.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 h-20 flex items-center px-12 justify-between shrink-0">
          <h1 className="text-xl font-black text-navy uppercase tracking-widest">
            {menuItems.find(item => location.pathname === item.path)?.label || t('admin.dashboard')}
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-inline-end border-gray-100 pe-6">
              <LanguageSwitcher />
              <span className="bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {t('admin.system_active')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-inline-end text-end hidden sm:block">
                <p className="text-sm font-bold text-navy leading-none">{user?.user_metadata?.full_name || user?.email}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">{t('header.user_role')}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Users size={20} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-12">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

