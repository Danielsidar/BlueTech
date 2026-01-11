import React, { useState, useEffect } from 'react';
import { Award, User, Mail, Shield, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 text-inline-start">
      <div>
        <h1 className="text-4xl font-black text-navy mb-3">{t('profile.title')}</h1>
        <p className="text-gray-500 text-lg">{t('profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-xl">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-gray-300" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-primary text-white p-3 rounded-full shadow-lg border-4 border-white hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            <h2 className="text-2xl font-black text-navy">{profile?.full_name}</h2>
            <p className="text-primary font-bold text-sm uppercase tracking-widest mt-1">{profile?.role || t('header.user_role')}</p>
            
            <div className="w-full h-[1px] bg-gray-50 my-8"></div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-50">
                <Mail size={20} className="text-gray-400" />
                <div className="text-inline-start">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Email</p>
                  <p className="text-sm font-bold text-navy">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-50">
                <Shield size={20} className="text-gray-400" />
                <div className="text-inline-start">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Account Status</p>
                  <p className="text-sm font-bold text-green-500">Active / VIP</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates & Achievements */}
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h2 className="text-2xl font-black text-navy mb-8 flex items-center gap-3">
              <Award size={24} className="text-primary" />
              {t('profile.my_certificates')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[40px] border-2 border-dashed border-gray-200 flex flex-col items-center text-center text-gray-400 font-medium group hover:border-primary/30 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Award size={32} className="opacity-30" />
                </div>
                <p className="text-sm">{t('profile.no_certificates')}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
