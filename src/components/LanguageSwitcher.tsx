import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  buttonClassName?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  buttonClassName = '' 
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'he', label: 'עברית', flag: '🇮🇱' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ];

  const currentLang = languages.find(l => l.code === (i18n.language || 'he')) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-1 rounded-full transition-all active:scale-95 border ${buttonClassName ? 'border-white/10' : 'border-transparent hover:bg-gray-100 hover:border-gray-200'} ${buttonClassName}`}
        title={t('languages.' + currentLang.code)}
      >
        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lg overflow-hidden shrink-0">
          {currentLang.flag}
        </div>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${buttonClassName ? 'text-white/70' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 inline-end-0 w-40 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-bold ${
                  i18n.language === lang.code 
                    ? 'bg-primary/5 text-primary' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg leading-none">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

