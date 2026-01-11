import React from 'react';
import { Home, BookOpen, LogOut, Users, BookMarked, User, LayoutGrid, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface MainSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();

  const menuItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: t('sidebar.dashboard') },
    { id: 'courses', icon: <GraduationCap size={20} />, label: t('sidebar.courses') },
    { id: 'agents', icon: <LayoutGrid size={20} />, label: t('sidebar.agents') },
    { id: 'community', icon: <Users size={20} />, label: t('sidebar.community') },
    { id: 'knowledge', icon: <BookMarked size={20} />, label: t('sidebar.knowledge') },
    { id: 'profile', icon: <User size={20} />, label: t('sidebar.profile') },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <aside className="w-20 md:w-64 h-screen bg-navy border-inline-end border-white/10 flex flex-col shrink-0 transition-all duration-300 z-50 sticky top-0">
      <Link to="/" className="p-6 flex items-center justify-center md:justify-start gap-3 text-inline-start hover:opacity-80 transition-opacity">
        <div className="bg-primary p-2 rounded-xl shrink-0 shadow-lg shadow-primary/40">
          <BookOpen size={24} className="text-white" />
        </div>
        <div className="hidden md:block">
          <span className="text-xl font-black text-white tracking-tighter block leading-none">BlueTech</span>
          <span className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-0.5">Education</span>
        </div>
      </Link>

      <nav className="flex-grow mt-8 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl transition-all duration-300 ${
              activeTab === item.id 
                ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                : 'text-white/40 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="font-bold text-sm hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        {/* Catalog Item - Positioned at bottom with different style */}
        <button
          onClick={() => setActiveTab('catalog')}
          className={`w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl transition-all duration-300 ${
            activeTab === 'catalog' 
              ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30' 
              : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
          }`}
        >
          <span className="shrink-0"><LayoutGrid size={20} /></span>
          <span className="font-black text-sm hidden md:block uppercase tracking-wider">{t('sidebar.catalog')}</span>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold text-sm"
        >
          <LogOut size={20} />
          <span className="hidden md:block">{t('sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default MainSidebar;
