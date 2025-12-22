/**
 * Composant pour visualiser et basculer entre les titres multilingues
 * Affiche toutes les langues disponibles avec des onglets cliquables
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Globe, Grid3x3 } from 'lucide-react';
import type { MangaTitles, MangaTitleEntry } from '../types/mangaTitles';

type I18nElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';

interface MangaTitlesViewerProps {
  titles: MangaTitles;
  fallbackText?: string;
  showDescription?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
  titleAs?: I18nElement;
  descriptionAs?: I18nElement;
  allowViewAll?: boolean; // Nouvelle prop pour activer le mode "Voir toutes"
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
};

export const MangaTitlesViewer: React.FC<MangaTitlesViewerProps> = ({
  titles,
  fallbackText = 'Sans titre',
  showDescription = true,
  titleClassName = 'text-4xl font-bold text-gray-900 dark:text-gray-100',
  descriptionClassName = 'text-gray-600 dark:text-gray-400 mt-2 max-w-2xl',
  titleAs = 'h1',
  descriptionAs = 'p',
  allowViewAll = true, // Activé par défaut
}) => {
  // Détecter la langue du navigateur
  const browserLang = navigator.language.split('-')[0];
  
  // Mode d'affichage : 'single' ou 'all'
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  
  // Trouver la langue par défaut (navigateur ou anglais ou première disponible)
  const defaultLang = useMemo(() => {
    if (!titles || titles.length === 0) return 'en';
    const langCodes = titles.map(t => t.i18_language);
    if (langCodes.includes(browserLang as any)) return browserLang;
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
    const TitleTag = titleAs;
    return <TitleTag className={titleClassName}>{fallbackText}</TitleTag>;
  }

  const TitleTag = titleAs;
  const DescriptionTag = descriptionAs;

  return (
    <div className="space-y-3 w-full">
      {/* En-tête avec sélecteur de langues et bouton Vue */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Languages className="w-3.5 h-3.5" />
            <span className="font-medium">Langues</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {titles.map((entry) => {
              const meta = languageMetadata[entry.i18_language] || {
                name: entry.i18_language.toUpperCase(),
                nativeName: entry.i18_language.toUpperCase(),
                flag: '🌐'
              };
              const isSelected = selectedLang === entry.i18_language;

              return (
                <motion.button
                  key={entry.i18_language}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedLang(entry.i18_language);
                    setViewMode('single');
                  }}
                  className={`
                    relative px-2 py-1 rounded-md font-medium text-xs
                    transition-all duration-200
                    ${isSelected && viewMode === 'single'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
                    }
                  `}
                  title={`${meta.name} (${meta.nativeName})`}
                >
                  <span className="flex items-center gap-1">
                    <span className="text-sm">{meta.flag}</span>
                    <span>{entry.i18_language.toUpperCase()}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Bouton Vue Toutes les langues */}
        {allowViewAll && titles.length > 1 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(viewMode === 'all' ? 'single' : 'all')}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs
              transition-all duration-200
              ${viewMode === 'all'
                ? 'bg-purple-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
              }
            `}
            title={viewMode === 'all' ? 'Vue unique' : 'Voir toutes les langues'}
          >
            <Grid3x3 className="w-3.5 h-3.5" />
            <span>{viewMode === 'all' ? 'Une' : 'Toutes'}</span>
          </motion.button>
        )}
      </div>

      {/* Contenu avec animation */}
      <AnimatePresence mode="wait">
        {viewMode === 'single' ? (
          // Vue unique : une langue à la fois
          <motion.div
            key={`single-${selectedLang}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="space-y-1.5"
          >
            {currentContent && (
              <>
                <TitleTag className={titleClassName}>
                  {currentContent.title || fallbackText}
                </TitleTag>
                
                {showDescription && currentContent.description && (
                  <DescriptionTag className={descriptionClassName}>
                    {currentContent.description}
                  </DescriptionTag>
                )}
              </>
            )}
          </motion.div>
        ) : (
          // Vue toutes : grille avec toutes les langues
          <motion.div
            key="all-languages"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {titles.map((entry, index) => {
              const meta = languageMetadata[entry.i18_language] || {
                name: entry.i18_language.toUpperCase(),
                nativeName: entry.i18_language.toUpperCase(),
                flag: '🌐'
              };

              return (
                <motion.div
                  key={entry.i18_language}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
                >
                  {/* En-tête de langue */}
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-lg">{meta.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {meta.nativeName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {meta.name}
                      </div>
                    </div>
                  </div>

                  {/* Titre */}
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-2">
                    {entry.title || fallbackText}
                  </h3>

                  {/* Description */}
                  {showDescription && entry.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {entry.description}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicateur de langue active (uniquement en mode single) */}
      {viewMode === 'single' && currentContent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900"
        >
          <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            {languageMetadata[selectedLang]?.nativeName || selectedLang.toUpperCase()}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default MangaTitlesViewer;
