/**
 * Composant pour afficher les titres multilingues
 * Utilise le système i18n existant avec adaptateurs
 */

import React from 'react';
import type { MangaTitles, MangaLanguage } from '../types/mangaTitles';
import I18nText from './I18nText';
import { mangaTitlesToI18n } from '../utils/mangaTitlesUtils';

type I18nElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';

interface MangaTitlesDisplayProps {
  titles: MangaTitles;
  preferredLang?: MangaLanguage;
  fallbackText?: string;
  showDescription?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
  titleAs?: I18nElement;
  descriptionAs?: I18nElement;
}

export const MangaTitlesDisplay: React.FC<MangaTitlesDisplayProps> = ({
  titles,
  preferredLang,
  fallbackText = 'Sans titre',
  showDescription = false,
  titleClassName = 'text-lg font-semibold text-gray-900 dark:text-gray-100',
  descriptionClassName = 'text-sm text-gray-600 dark:text-gray-400',
  titleAs = 'div',
  descriptionAs = 'p',
}) => {
  const i18nContent = mangaTitlesToI18n(titles);
  
  if (!i18nContent.title || Object.keys(i18nContent.title).length === 0) {
    const TitleTag = titleAs;
    return <TitleTag className={titleClassName}>{fallbackText}</TitleTag>;
  }
  

  return (
    <div className="space-y-1 w-full">
      <I18nText
        content={i18nContent.title}
        fallbackLang={preferredLang as any}
        defaultLang="en"
        as={titleAs}
        className={titleClassName}
      />
      
      {showDescription && i18nContent.description && Object.keys(i18nContent.description).length > 0 && (
        <I18nText
          content={i18nContent.description}
          fallbackLang={preferredLang as any}
          defaultLang="en"
          as={descriptionAs}
          className={descriptionClassName}
        />
      )}
    </div>
  );
};

/**
 * Version compacte pour afficher uniquement le titre
 */
export const MangaTitle: React.FC<{
  titles: MangaTitles;
  preferredLang?: MangaLanguage;
  fallbackText?: string;
  className?: string;
  as?: I18nElement;
}> = ({ titles, preferredLang, fallbackText = 'Sans titre', className = '', as = 'span' }) => {
  const i18nContent = mangaTitlesToI18n(titles);
  
  if (!i18nContent.title || Object.keys(i18nContent.title).length === 0) {
    const Tag = as;
    return <Tag className={className}>{fallbackText}</Tag>;
  }
  
  return (
    <I18nText
      content={i18nContent.title}
      fallbackLang={preferredLang as any}
      defaultLang="en"
      as={as}
      className={className}
    />
  );
};

/**
 * Version compacte pour afficher uniquement la description
 */
export const MangaDescription: React.FC<{
  titles: MangaTitles;
  preferredLang?: MangaLanguage;
  fallbackText?: string;
  className?: string;
  as?: I18nElement;
}> = ({ titles, preferredLang, fallbackText = '', className = '', as = 'p' }) => {
  const i18nContent = mangaTitlesToI18n(titles);
  
  if (!i18nContent.description || Object.keys(i18nContent.description).length === 0) {
    if (!fallbackText) return null;
    const Tag = as;
    return <Tag className={className}>{fallbackText}</Tag>;
  }
  
  return (
    <I18nText
      content={i18nContent.description}
      fallbackLang={preferredLang as any}
      defaultLang="en"
      as={as}
      className={className}
    />
  );
};
