import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ChevronDown, Check } from 'lucide-react';
import type {
  I18nFieldProps,
  SupportedLanguage,
  TranslatedText,
} from '../types/i18n';
import {
  DEFAULT_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
} from '../types/i18n';

/**
 * Composant réutilisable pour les champs multilingues (i18n)
 * 
 * @example
 * ```tsx
 * const [title, setTitle] = useState<TranslatedText>({});
 * 
 * <I18nField
 *   value={title}
 *   onChange={setTitle}
 *   label="Titre"
 *   required
 * />
 * ```
 */
const I18nField: React.FC<I18nFieldProps> = ({
  value,
  onChange,
  label,
  fieldType = 'input',
  required = false,
  placeholder,
  rows = 4,
  supportedLanguages = DEFAULT_LANGUAGES,
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(supportedLanguages[0]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const handleTextChange = (lang: SupportedLanguage, text: string) => {
    const newValue = { ...value, [lang]: text };
    onChange(newValue);
  };

  const getCompletionPercentage = () => {
    const filledLangs = supportedLanguages.filter(lang => value[lang]?.trim()).length;
    return Math.round((filledLangs / supportedLanguages.length) * 100);
  };

  const isLanguageFilled = (lang: SupportedLanguage) => {
    return value[lang]?.trim().length > 0;
  };

  return (
    <div className="space-y-2">
      {/* Label with completion indicator */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Languages className="w-4 h-4" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="flex items-center gap-2">
          {/* Completion badge */}
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            getCompletionPercentage() === 100
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : getCompletionPercentage() > 0
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {getCompletionPercentage()}% traduit
          </span>
        </div>
      </div>

      {/* Language selector and input */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        {/* Language tabs */}
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
          {supportedLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSelectedLang(lang)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedLang === lang
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
              <span>{LANGUAGE_NAMES[lang]}</span>
              {isLanguageFilled(lang) && (
                <Check className="w-3 h-3 text-green-500" />
              )}
            </button>
          ))}
        </div>

        {/* Input/Textarea */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedLang}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {fieldType === 'textarea' ? (
                <textarea
                  value={value[selectedLang] || ''}
                  onChange={(e) => handleTextChange(selectedLang, e.target.value)}
                  rows={rows}
                  placeholder={placeholder || `Entrez le ${label.toLowerCase()} en ${LANGUAGE_NAMES[selectedLang]}`}
                  className="w-full px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 border-none focus:outline-none resize-none"
                  required={required && selectedLang === supportedLanguages[0]}
                />
              ) : (
                <input
                  type="text"
                  value={value[selectedLang] || ''}
                  onChange={(e) => handleTextChange(selectedLang, e.target.value)}
                  placeholder={placeholder || `Entrez le ${label.toLowerCase()} en ${LANGUAGE_NAMES[selectedLang]}`}
                  className="w-full px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 border-none focus:outline-none"
                  required={required && selectedLang === supportedLanguages[0]}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Language status indicators */}
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {supportedLanguages.map((lang) => (
            <div
              key={lang}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                isLanguageFilled(lang)
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
              }`}
            >
              <span>{LANGUAGE_FLAGS[lang]}</span>
              <span>{lang.toUpperCase()}</span>
              {isLanguageFilled(lang) && <Check className="w-3 h-3" />}
            </div>
          ))}
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Remplissez au moins la langue {LANGUAGE_NAMES[supportedLanguages[0]]} {required && '(obligatoire)'}.
        Les autres langues sont optionnelles.
      </p>
    </div>
  );
};

export default I18nField;
