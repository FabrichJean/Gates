/**
 * Composant pour visualiser et basculer entre les titres audio multilingues
 * Affiche toutes les langues disponibles avec des onglets cliquables
 * Adapté de MangaTitlesViewer pour les audios
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';

interface AudioTitle {
  id?: number;
  i18_language: string;
  language_code?: string;
  title: string;
  description?: string;
}

interface AudioTitlesViewerProps {
  titles: AudioTitle[];
  fallbackText?: string;
  showDescription?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
  compact?: boolean; // Mode compact pour AudioDetails
}

// Métadonnées des langues avec drapeaux
const languageMetadata: Record<string, { name: string; nativeName: string; flag: string }> = {
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
};

export const AudioTitlesViewer: React.FC<AudioTitlesViewerProps> = ({
  titles,
  fallbackText = 'Sans titre',
  showDescription = true,
  titleClassName = 'text-lg font-semibold text-gray-900 dark:text-gray-100',
  descriptionClassName = 'text-sm text-gray-600 dark:text-gray-300',
  compact = true,
}) => {
  // Détecter la langue du navigateur
  const browserLang = navigator.language.split('-')[0];
  
  // Trouver la langue par défaut (navigateur ou anglais ou première disponible)
  const defaultLang = useMemo(() => {
    if (!titles || titles.length === 0) return 'en';
    const langCodes = titles.map(t => t.i18_language);
    if (langCodes.includes(browserLang)) return browserLang;
    if (langCodes.includes('en')) return 'en';
    return langCodes[0];
  }, [titles, browserLang]);

  const [selectedLang, setSelectedLang] = useState<string>(defaultLang);

  // Trouver le contenu pour la langue sélectionnée
  const currentContent = useMemo(() => {
    if (!titles || titles.length === 0) return null;
    return titles.find(t => t.i18_language === selectedLang) || titles[0];
  }, [titles, selectedLang]);

  if (!titles || titles.length === 0) {
    return null; // Ne rien afficher si pas de titres
  }

  // Mode compact pour AudioDetails
  if (compact) {
    return (
      <div className="space-y-2">
        {/* Sélecteur de langues compact */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Languages className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {titles.map((entry) => {
              const meta = languageMetadata[entry.i18_language] || {
                name: entry.i18_language.toUpperCase(),
                nativeName: entry.i18_language.toUpperCase(),
                flag: '🌐'
              };
              const isSelected = selectedLang === entry.i18_language;

              return (
                <button
                  key={entry.i18_language}
                  onClick={() => setSelectedLang(entry.i18_language)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  title={meta.name}
                >
                  <span>{meta.flag}</span>
                  <span className="uppercase">{entry.i18_language}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu sélectionné */}
        {currentContent && (
          <motion.div
            key={selectedLang}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1"
          >
            <div className={titleClassName}>{currentContent.title}</div>
            {showDescription && currentContent.description && (
              <div className={descriptionClassName}>{currentContent.description}</div>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // Mode normal (non utilisé pour AudioDetails mais disponible)
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Languages className="w-4 h-4" />
          <span className="font-medium">Langues</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {titles.map((entry) => {
            const meta = languageMetadata[entry.i18_language] || {
              name: entry.i18_language.toUpperCase(),
              nativeName: entry.i18_language.toUpperCase(),
              flag: '🌐'
            };
            const isSelected = selectedLang === entry.i18_language;

            return (
              <button
                key={entry.i18_language}
                onClick={() => setSelectedLang(entry.i18_language)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title={meta.name}
              >
                <span className="text-base">{meta.flag}</span>
                <span>{meta.nativeName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {currentContent && (
        <motion.div
          key={selectedLang}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <div className={titleClassName}>{currentContent.title}</div>
          {showDescription && currentContent.description && (
            <div className={descriptionClassName}>{currentContent.description}</div>
          )}
        </motion.div>
      )}
    </div>
  );
};
