/**
 * Composant pour sélectionner les langues à utiliser pour les titres
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Plus, X } from 'lucide-react';
import type { Language } from '../api/languages';
import { getActiveLanguages, getDefaultLanguages } from '../api/languages';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
  maxLanguages?: number;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onChange,
  maxLanguages = 9,
  className = '',
}) => {
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    setLoading(true);
    try {
      const languages = await getActiveLanguages();
      setAvailableLanguages(languages);
    } catch (error) {
      console.error('Error loading languages:', error);
      setAvailableLanguages(getDefaultLanguages());
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      // Retirer la langue
      onChange(selectedLanguages.filter(l => l !== code));
    } else {
      // Ajouter la langue si limite non atteinte
      if (selectedLanguages.length < maxLanguages) {
        onChange([...selectedLanguages, code]);
      }
    }
  };

  const getLanguageName = (code: string): Language | undefined => {
    return availableLanguages.find(l => l.code === code);
  };

  return (
    <div ref={rootRef} className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Globe className="w-4 h-4" />
          Langues sélectionnées
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {selectedLanguages.length}/{maxLanguages} langues
        </span>
      </div>

      {/* Selected Languages */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {selectedLanguages.length === 0 ? (
          <span className="text-sm text-gray-400 dark:text-gray-500">
            Aucune langue sélectionnée
          </span>
        ) : (
          selectedLanguages.map(code => {
            const lang = getLanguageName(code);
            return (
              <motion.div
                key={code}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-md text-sm font-medium"
              >
                <span>{lang?.flag || '🌐'}</span>
                <span>{lang?.nativeName || code.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => toggleLanguage(code)}
                  className="ml-1 hover:bg-blue-600 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })
        )}
        
        {/* Add Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={selectedLanguages.length >= maxLanguages}
          className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" />
          Ajouter
        </button>
      </div>

      {/* Language Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Langues disponibles
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-4 text-sm text-gray-500">
                Chargement des langues...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {availableLanguages.map(lang => {
                  const isSelected = selectedLanguages.includes(lang.code);
                  const isDisabled = !isSelected && selectedLanguages.length >= maxLanguages;

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => toggleLanguage(lang.code)}
                      disabled={isDisabled}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                        ${isSelected
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                        }
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <span className="text-xl">{lang.flag || '🌐'}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{lang.nativeName}</div>
                        <div className="text-xs opacity-70">{lang.name}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Close dropdown when clicking outside
// function useOutsideClose(ref: React.RefObject<HTMLDivElement>, isOpen: boolean, onClose: () => void) {
//   useEffect(() => {
//     if (!isOpen) return;
//     const handleOutside = (e: MouseEvent | TouchEvent) => {
//       const target = e.target as Node;
//       if (ref.current && !ref.current.contains(target)) {
//         onClose();
//       }
//     };
//     document.addEventListener('mousedown', handleOutside);
//     document.addEventListener('touchstart', handleOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleOutside);
//       document.removeEventListener('touchstart', handleOutside);
//     };
//   }, [ref, isOpen, onClose]);
// }
