/**
 * Composant pour gérer les titres multilingues des mangas
 * Utilise le système i18n existant avec sélection dynamique des langues
 */

import React, { useState, useEffect } from 'react';
import type { MangaTitles, MangaTitlesFieldProps } from '../types/mangaTitles';
import type { TranslatedText } from '../types/i18n';
import { I18nContentFields } from './I18nComponents';
import { i18nToMangaTitles, mangaTitlesToI18n } from '../utils/mangaTitlesUtils';
import { LanguageSelector } from './LanguageSelector';

export const MangaTitlesField: React.FC<MangaTitlesFieldProps> = ({
  value,
  onChange,
  label = 'Titres multilingues',
  required = false,
  className = '',
}) => {
  // Déterminer les langues sélectionnées à partir des titres existants
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    // Initialisation : extraire les langues des titres existants
    const languages = value
      .filter(entry => entry.title.trim() !== '' || entry.description.trim() !== '')
      .map(entry => entry.i18_language);
    
    // Si aucune langue, retourner anglais par défaut
    return languages.length > 0 ? languages : ['en'];
  });
  
  // Mettre à jour les langues sélectionnées quand les titres changent
  useEffect(() => {
    const languages = value
      .filter(entry => entry.title.trim() !== '' || entry.description.trim() !== '')
      .map(entry => entry.i18_language);
    
    // Mettre à jour seulement si différent
    if (languages.length > 0 && JSON.stringify(languages.sort()) !== JSON.stringify(selectedLanguages.sort())) {
      setSelectedLanguages(languages);
    }
  }, [value]);

  // Convertir MangaTitles vers I18nContent
  const i18nContent = mangaTitlesToI18n(value);

  // Gérer les changements de titre
  const handleTitleChange = (titleTranslations: TranslatedText) => {
    const updated = i18nToMangaTitles(titleTranslations, i18nContent.description || {});
    onChange(updated);
  };

  // Gérer les changements de description
  const handleDescriptionChange = (descriptionTranslations: TranslatedText) => {
    const updated = i18nToMangaTitles(i18nContent.title || {}, descriptionTranslations);
    onChange(updated);
  };

  // Gérer les changements de langues sélectionnées
  const handleLanguageChange = (languages: string[]) => {
    setSelectedLanguages(languages);
    
    // Supprimer les titres des langues désélectionnées
    const currentTitles = mangaTitlesToI18n(value);
    const updatedTitleTranslations: TranslatedText = {};
    const updatedDescriptionTranslations: TranslatedText = {};
    
    // Garder uniquement les traductions des langues sélectionnées
    languages.forEach(lang => {
      if (currentTitles.title && currentTitles.title[lang]) {
        updatedTitleTranslations[lang] = currentTitles.title[lang];
      }
      if (currentTitles.description && currentTitles.description[lang]) {
        updatedDescriptionTranslations[lang] = currentTitles.description[lang];
      }
    });
    
    // Mettre à jour le state avec seulement les langues sélectionnées
    const updated = i18nToMangaTitles(updatedTitleTranslations, updatedDescriptionTranslations);
    onChange(updated);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sélecteur de langues */}
      <LanguageSelector
        selectedLanguages={selectedLanguages}
        onChange={handleLanguageChange}
        maxLanguages={9}
      />

      {/* Champs de titre et description */}
      {selectedLanguages.length > 0 && (
        <I18nContentFields
          title={i18nContent.title || {}}
          description={i18nContent.description || {}}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          titleRequired={required}
          descriptionRequired={false}
          supportedLanguages={selectedLanguages}
        />
      )}
    </div>
  );
};
