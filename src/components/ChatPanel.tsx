import React, { useState, useEffect } from 'react';
import { Send, Bot, Sparkles, User, X, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatPanelProps {
  agentId?: string;
  externalUrl?: string | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ agentId, externalUrl }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: t('chat.welcome') }
  ]);
  const [input, setInput] = useState('');

  // Reset messages when language changes
  useEffect(() => {
    setMessages([{ role: 'bot', content: t('chat.welcome') }]);
  }, [i18n.language, t]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    
    // Mock bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: t('chat.bot_response_mock')
      }]);
    }, 1000);
  };

  return (
    <div className={`fixed bottom-8 ${i18n.language === 'he' ? 'left-8' : 'right-8'} z-[100] flex flex-col items-end`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[500px] bg-navy rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-white/10 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between ai-mentor-panel">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,86,179,0.5)]">
                <Bot size={24} className="text-white" />
              </div>
              <div className="text-inline-start">
                <h3 className="text-white font-bold text-lg leading-tight flex items-center gap-2">
                  AI Mentor
                  <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                </h3>
                <p className="text-cyan-400/70 text-xs">
                  {t('chat.status')} {agentId && `(${agentId})`}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-[#001a35]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-white/10 text-white border border-white/10 rounded-tr-none' 
                    : 'bg-primary text-white shadow-lg rounded-tl-none border border-primary-dark'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {msg.role === 'user' ? (
                      <User size={12} className="text-gray-400" />
                    ) : (
                      <Bot size={12} className="text-cyan-300" />
                    )}
                    <span className="text-[10px] uppercase tracking-wider opacity-60">
                      {msg.role === 'user' ? t('chat.you') : t('chat.mentor')}
                    </span>
                  </div>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-navy border-t border-white/10">
            <div className="relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('chat.placeholder')}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 ps-4 pe-12 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors text-sm"
              />
              <button 
                onClick={handleSend}
                className={`absolute ${i18n.language === 'he' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark p-2 rounded-xl transition-colors shadow-lg shadow-primary/20`}
              >
                <Send size={16} className={`text-white ${i18n.language === 'en' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => {
          if (externalUrl) {
            window.open(externalUrl, '_blank');
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-white text-navy rotate-90' : 'bg-primary text-white'
        }`}
      >
        {isOpen ? <X size={28} /> : (
          <div className="relative">
            <MessageSquare size={28} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-primary"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatPanel;
