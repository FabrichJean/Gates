import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../context/I18nProvider';
import { DEFAULT_LANGUAGES, LANGUAGE_NAMES } from '../types/i18n';

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 cursor-pointer
                   bg-white/80 dark:bg-gray-900/80 backdrop-blur-md
                   border border-white/20 dark:border-gray-700/50
                   rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/30
                   hover:shadow-xl hover:scale-[1.02]
                   active:scale-[0.98]
                   transition-all duration-300 ease-out"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400/60 to-purple-500/60 
                        flex items-center justify-center text-white text-xs font-bold">
          {lang.toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 
                        bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl
                        rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50
                        overflow-hidden z-50
                        animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1">
            {DEFAULT_LANGUAGES.map((l, index) => (
              <button
                key={l}
                onClick={() => {
                  setLang(l as any);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                           text-sm font-medium transition-all duration-200
                           ${lang === l
                    ? 'bg-gradient-to-r from-blue-500/60 to-purple-500/60 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                                ${lang === l ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  {l.toUpperCase()}
                </span>
                <span>{LANGUAGE_NAMES[l]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;