/**
 * Composant pour gérer les titres multilingues des audios
 * Utilise le système i18n existant avec sélection dynamique des langues
 */

import React, { useState, useEffect } from 'react';
import { I18nContentFields } from './I18nComponents';
import { LanguageSelector } from './LanguageSelector';
import type { TranslatedText } from '../types/i18n';

export interface AudioTitle {
  i18_language: string;
  language_code: string;
  title: string;
  description: string;
}

interface AudioTitlesFieldProps {
  value: AudioTitle[];
  onChange: (titles: AudioTitle[]) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const AudioTitlesField: React.FC<AudioTitlesFieldProps> = ({
  value,
  onChange,
  label = 'Titres multilingues',
  required = false,
  className = '',
}) => {
  // Déterminer les langues sélectionnées à partir des titres existants
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    const languages = value
      .filter(entry => entry.title.trim() !== '' || entry.description.trim() !== '')
      .map(entry => entry.i18_language);
    
    return languages.length > 0 ? languages : ['en'];
  });
  
  // Mettre à jour les langues sélectionnées quand les titres initiaux sont chargés
  useEffect(() => {
    const languages = value
      .filter(entry => entry.title.trim() !== '' || entry.description.trim() !== '')
      .map(entry => entry.i18_language);
    
    if (languages.length > 0 && selectedLanguages.length === 1 && selectedLanguages[0] === 'en') {
      setSelectedLanguages(languages);
    }
  }, [value]);

  // Convertir AudioTitle[] vers I18nContent (TranslatedText)
  const audioTitlesToI18n = (titles: AudioTitle[]): { titles: TranslatedText; descriptions: TranslatedText } => {
    const result: { titles: TranslatedText; descriptions: TranslatedText } = {
      titles: {},
      descriptions: {},
    };

    titles.forEach(entry => {
      if (entry.i18_language) {
        result.titles[entry.i18_language] = entry.title || '';
        result.descriptions[entry.i18_language] = entry.description || '';
      }
    });

    return result;
  };

  // Convertir I18nContent vers AudioTitle[]
  const i18nToAudioTitles = (titles: TranslatedText, descriptions: TranslatedText): AudioTitle[] => {
    const allLanguages = new Set([...Object.keys(titles), ...Object.keys(descriptions)]);
    
    return Array.from(allLanguages).map(lang => ({
      i18_language: lang,
      language_code: lang,
      title: titles[lang] || '',
      description: descriptions[lang] || '',
    }));
  };

  const i18nContent = audioTitlesToI18n(value);

  // Gérer les changements de titre
  const handleTitleChange = (newTitles: TranslatedText) => {
    const newAudioTitles = i18nToAudioTitles(newTitles, i18nContent.descriptions);
    onChange(newAudioTitles);
  };

  // Gérer les changements de description
  const handleDescriptionChange = (newDescriptions: TranslatedText) => {
    const newAudioTitles = i18nToAudioTitles(i18nContent.titles, newDescriptions);
    onChange(newAudioTitles);
  };

  // Gérer les changements de langues sélectionnées
  const handleLanguagesChange = (languages: string[]) => {
    setSelectedLanguages(languages);
    
    // Créer ou conserver les entrées pour toutes les langues sélectionnées
    const updatedTitles = [...value];
    
    languages.forEach(lang => {
      const existingEntry = updatedTitles.find(t => t.i18_language === lang);
      if (!existingEntry) {
        updatedTitles.push({
          i18_language: lang,
          language_code: lang,
          title: '',
          description: '',
        });
      }
    });
    
    // Filtrer les langues non sélectionnées (optionnel - garder les données même si désélectionnées)
    // Pour garder les données: ne pas filtrer
    // Pour supprimer: décommenter la ligne suivante
    // const filteredTitles = updatedTitles.filter(t => languages.includes(t.i18_language));
    
    onChange(updatedTitles);
  };

  return (
    <div className={`space-y-4 ${className} block w-full`}>
      <div className="flex flex-col gap-3 w-full">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <LanguageSelector
          selectedLanguages={selectedLanguages}
          onChange={handleLanguagesChange}
        />
      </div>
      
      <I18nContentFields
        title={i18nContent.titles}
        description={i18nContent.descriptions}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
        titleRequired={required}
        descriptionRequired={false}
        supportedLanguages={selectedLanguages}
        showAutoFill={true}
      />
    </div>
  );
};
