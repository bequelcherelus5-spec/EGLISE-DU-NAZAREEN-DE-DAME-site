import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageCode } from '../context/LanguageContext';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { currentLang, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelectLanguage = (langCode: LanguageCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  const activeOption = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[1];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center space-x-1.5 rounded-full transition border font-semibold ${
          compact
            ? 'px-2.5 py-1 text-xs bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-400'
            : 'px-3 py-1 text-xs bg-slate-900/80 text-amber-300 border-amber-500/30 hover:border-amber-400 hover:bg-slate-900 shadow-sm'
        }`}
        title="Changer de langue / Chwazi lang"
      >
        <span className="text-xs sm:text-sm leading-none">{activeOption.flag}</span>
        <span className="font-bold text-[10px] sm:text-[11px] tracking-wide uppercase">
          {compact ? activeOption.code.toUpperCase() : activeOption.nativeLabel}
        </span>
        <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu for 4 languages */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950 border border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
          <div className="px-3.5 py-1.5 border-b border-slate-800 mb-1 flex items-center justify-between text-[10px] text-amber-400 font-bold uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>Chwazi Lang / Langue</span>
            </span>
            <span className="text-slate-500 font-mono">4 lang</span>
          </div>

          <div className="space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 font-bold border-l-2 border-amber-400'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-amber-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div>
                      <span className="block font-medium">{lang.nativeLabel}</span>
                      <span className="block text-[10px] text-slate-400">{lang.label}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
