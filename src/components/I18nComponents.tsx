import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Check, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import I18nField from './I18nField';
import I18nText from './I18nText';
import type { TranslatedText } from '../types/i18n';
import { LANGUAGE_NAMES, LANGUAGE_FLAGS } from '../types/i18n';
import { translateServer } from '../constant';

/**
 * Composant wrapper qui combine titre et description i18n dans des onglets unifiés
 * Un seul onglet par langue contenant titre ET description
 */
interface I18nContentFieldsProps {
  title: TranslatedText;
  description: TranslatedText;
  onTitleChange: (value: TranslatedText) => void;
  onDescriptionChange: (value: TranslatedText) => void;
  onBothChange?: (titles: TranslatedText, descriptions: TranslatedText) => void; // Callback combiné
  titleRequired?: boolean;
  descriptionRequired?: boolean;
  supportedLanguages?: string[];
  showAutoFill?: boolean; // Nouvelle prop pour activer/désactiver Auto-fill
}

export const I18nContentFields: React.FC<I18nContentFieldsProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onBothChange,
  titleRequired = true,
  descriptionRequired = false,
  supportedLanguages = ['en', 'fr'],
  showAutoFill = false,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>(supportedLanguages[0]);
  const [isLoading, setLoading] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [autoTitle, setAutoTitle] = useState("");
  const [autoDesc, setAutoDesc] = useState("");
  const [server, setServer] = useState(translateServer);

  const handleTitleChange = (lang: string, text: string) => {
    const newValue = { ...title, [lang]: text };
    onTitleChange(newValue);
  };

  const handleDescriptionChange = (lang: string, text: string) => {
    const newValue = { ...description, [lang]: text };
    onDescriptionChange(newValue);
  };

  const isLanguageFilled = (lang: string) => {
    return title[lang]?.trim().length > 0 || description[lang]?.trim().length > 0;
  };

  const getCompletionPercentage = () => {
    const filledLangs = supportedLanguages.filter(lang =>
      title[lang]?.trim() || description[lang]?.trim()
    ).length;
    return Math.round((filledLangs / supportedLanguages.length) * 100);
  };

  const applyAuto = async () => {
    if (!autoTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(server, {
        title: autoTitle,
        description: autoDesc,
        i18n: supportedLanguages,
      });

      const translations = response.data;

      console.log('API Response:', translations);
      console.log('Supported languages:', supportedLanguages);

      // Parser les résultats et appliquer (conserver les valeurs existantes)
      const newTitles: TranslatedText = { ...title };
      const newDescriptions: TranslatedText = { ...description };

      translations.forEach((t: any) => {
        console.log('Processing translation:', t);
        if (t.i18_language && supportedLanguages.includes(t.i18_language)) {
          if (t.title) {
            console.log(`Setting title for ${t.i18_language}:`, t.title);
            newTitles[t.i18_language] = t.title;
          }
          if (t.description) {
            console.log(`Setting description for ${t.i18_language}:`, t.description);
            newDescriptions[t.i18_language] = t.description;
          }
        }
      });

      console.log('Final titles:', newTitles);
      console.log('Final descriptions:', newDescriptions);

      // Utiliser le callback combiné si disponible, sinon les callbacks séparés
      if (onBothChange) {
        onBothChange(newTitles, newDescriptions);
      } else {
        onTitleChange(newTitles);
        onDescriptionChange(newDescriptions);
      }

      toast.success("✨ Auto-fill successful!");
      setAutoOpen(false);
      setAutoTitle("");
      setAutoDesc("");
    } catch (err: any) {
      console.error(err);
      toast.error("Auto-fill failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Label with completion indicator and Auto button */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Languages className="w-4 h-4" />
          Titres et Descriptions
          {titleRequired && <span className="text-red-500">*</span>}
        </label>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCompletionPercentage() === 100
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : getCompletionPercentage() > 0
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
            {getCompletionPercentage()}% traduit
          </span>

          {/* Bouton Auto-fill */}
          {showAutoFill && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setAutoOpen(true)}
              className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto
            </motion.button>
          )}
        </div>
      </div>

      {/* Unified tabs for all languages */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
        {/* Language tabs */}
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
          {supportedLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSelectedLang(lang)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${selectedLang === lang
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <span className="text-base">{LANGUAGE_FLAGS[lang] || '🌐'}</span>
              <span>{LANGUAGE_NAMES[lang] || lang.toUpperCase()}</span>
              {isLanguageFilled(lang) && (
                <Check className="w-3 h-3 text-green-500" />
              )}
            </button>
          ))}
        </div>

        {/* Content for selected language */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedLang}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            {/* Title input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre {titleRequired && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={title[selectedLang] || ''}
                onChange={(e) => handleTitleChange(selectedLang, e.target.value)}
                placeholder={`Entrez le titre en ${LANGUAGE_NAMES[selectedLang] || selectedLang}`}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={titleRequired && selectedLang === supportedLanguages[0]}
              />
            </div>

            {/* Description textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description {descriptionRequired && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={description[selectedLang] || ''}
                onChange={(e) => handleDescriptionChange(selectedLang, e.target.value)}
                rows={6}
                placeholder={`Entrez la description en ${LANGUAGE_NAMES[selectedLang] || selectedLang}`}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required={descriptionRequired && selectedLang === supportedLanguages[0]}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Language status indicators */}
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {supportedLanguages.map((lang) => (
            <div
              key={lang}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${isLanguageFilled(lang)
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                }`}
            >
              <span>{LANGUAGE_FLAGS[lang] || '🌐'}</span>
              <span>{lang.toUpperCase()}</span>
              {isLanguageFilled(lang) && <Check className="w-3 h-3" />}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Auto-fill */}
      {showAutoFill && (
        <>
          <input
            type="checkbox"
            checked={autoOpen}
            onChange={() => setAutoOpen((o) => !o)}
            className="modal-toggle"
          />
          <div className="modal modal-bottom sm:modal-middle">
            <div className="modal-box bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Auto-fill titles & descriptions
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Titre source
                  </label>
                  <input
                    type="text"
                    placeholder="Entrez le titre à traduire"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={autoTitle}
                    onChange={(e) => setAutoTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description source
                  </label>
                  <textarea
                    placeholder="Entrez la description à traduire"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={4}
                    value={autoDesc}
                    onChange={(e) => setAutoDesc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Serveur de traduction
                  </label>
                  <input
                    type="text"
                    placeholder="URL du serveur"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                  />
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Langues cibles:</strong> {supportedLanguages.map(lang => LANGUAGE_FLAGS[lang] || '🌐').join(' ')} ({supportedLanguages.length} langues)
                  </p>
                </div>
              </div>

              <div className="modal-action">
                <button
                  type='button'
                  className="btn btn-ghost"
                  onClick={() => setAutoOpen(false)}
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type='button'
                  className="btn btn-primary gap-2"
                  onClick={applyAuto}
                  disabled={isLoading || !autoTitle.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Traduction...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Appliquer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Composant pour afficher titre et description traduits
 */
interface I18nContentDisplayProps {
  title: TranslatedText | string;
  description?: TranslatedText | string;
  titleClassName?: string;
  descriptionClassName?: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const I18nContentDisplay: React.FC<I18nContentDisplayProps> = ({
  title,
  description,
  titleClassName = 'text-2xl font-bold',
  descriptionClassName = 'text-gray-600 dark:text-gray-400',
  titleAs = 'h2',
}) => {
  return (
    <div className="space-y-2">
      <I18nText
        content={title}
        as={titleAs}
        className={titleClassName}
        fallbackLang="en"
      />

      {description && (
        <I18nText
          content={description}
          as="p"
          className={descriptionClassName}
          fallbackLang="en"
        />
      )}
    </div>
  );
};

export { I18nField, I18nText };
