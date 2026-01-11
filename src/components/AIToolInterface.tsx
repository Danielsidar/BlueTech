import React from 'react';
import { Bot, Sparkles, Terminal, Shield, Zap, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AIToolInterface: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col bg-navy relative overflow-hidden">
      {/* Futuristic Background Elements */}
      <div className="absolute top-[-10%] inline-end-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-10%] inline-start-[-10%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[120px]"></div>
      
      <div className="flex-grow flex p-6 gap-6 relative z-10">
        {/* Tool Workspace */}
        <div className="flex-grow flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Terminal size={24} />, title: t('ai_tool.cards.code.title'), desc: t('ai_tool.cards.code.desc') },
              { icon: <Shield size={24} />, title: t('ai_tool.cards.security.title'), desc: t('ai_tool.cards.security.desc') },
              { icon: <Zap size={24} />, title: t('ai_tool.cards.optimization.title'), desc: t('ai_tool.cards.optimization.desc') },
            ].map((card, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] hover:bg-white/10 transition-all cursor-pointer group text-inline-start">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-gray-400 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex-grow bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 animate-pulse">
               <Bot size={40} className="text-primary" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">{t('ai_tool.main.title')}</h2>
            <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
              {t('ai_tool.main.description')}
            </p>
            <div className="relative w-full max-w-lg">
              <Search size={20} className="absolute inline-end-6 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder={t('ai_tool.main.input_placeholder')}
                className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 ps-6 pe-14 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* AI Sidebar */}
        <div className="w-96 shrink-0 hidden lg:block">
           <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] flex flex-col overflow-hidden text-inline-start">
              <div className="p-8 border-b border-white/10">
                 <h3 className="text-white font-bold text-xl flex items-center gap-3">
                    <Sparkles size={20} className="text-cyan-400" />
                    AI Agent Logs
                 </h3>
              </div>
              <div className="p-6 space-y-4 font-mono text-xs overflow-y-auto flex-grow">
                 <p className="text-green-400">[SYSTEM] Initialization started...</p>
                 <p className="text-gray-400">[AUTH] Connection secure. SHA-256 verified.</p>
                 <p className="text-cyan-400">[AGENT] Waiting for input commands...</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIToolInterface;

