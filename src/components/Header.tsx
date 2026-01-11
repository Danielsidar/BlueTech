import React from 'react';
import { User as UserIcon, Bell, Search, LogOut, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { role, isAdmin, signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <header className="bg-white text-navy border-b border-gray-100 py-4 px-6 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-4 flex-grow max-w-xl">
        <Link to="/" className="text-xl font-bold md:hidden hover:text-primary transition-colors">BlueTech</Link>
        <div className="relative w-full hidden md:block">
          <Search size={18} className="absolute inline-start-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('header.search_placeholder')}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 ps-12 pe-4 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-inline-end border-gray-100 pe-6">
          <LanguageSwitcher />

          {isAdmin && (
            <Link 
              to="/admin" 
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
            >
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">{t('header.admin_panel')}</span>
            </Link>
          )}

          <Bell size={20} className="text-gray-400 cursor-pointer hover:text-primary transition-colors" />
          
          {user && (
            <div className="flex items-center gap-6">
              <Link to="/profile" className="flex items-center gap-3 cursor-pointer group">
                <div className="text-inline-start hidden sm:block">
                  <p className="text-sm font-bold text-navy leading-none">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">{role || t('header.user_role')}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata?.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={20} className="text-navy group-hover:text-primary transition-colors" />
                  )}
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title={t('sidebar.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
