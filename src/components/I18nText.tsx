import React from 'react';
import type { TranslatedText, SupportedLanguage } from '../types/i18n';
import Markdown from 'react-markdown'
import { useI18n } from '../context/I18nProvider';


interface I18nTextProps {
  content: TranslatedText | string;
  fallbackLang?: SupportedLanguage;
  defaultLang?: SupportedLanguage;
  className?: string;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

/**
 * Composant pour afficher du texte traduit
 * Détecte automatiquement la langue du navigateur ou utilise la langue par défaut
 * 
 * @example
 * ```tsx
 * <I18nText 
 *   content={{ en: "Hello", fr: "Bonjour" }}
 *   defaultLang="en"
 *   as="h1"
 * />
 * ```
 */
const I18nText: React.FC<I18nTextProps> = ({
  content,
  fallbackLang = 'en',
  defaultLang,
  className = '',
  as: Component = 'span',
}) => {
  // Si content est une string simple, la retourner directement
  if (typeof content === 'string') {
    return <Component className={className}>{content}</Component>;
  }

  // Prefer the app-wide language from I18nProvider, fallback to navigator or provided fallbackLang
  const { lang: appLang } = (() => {
    try {
      return useI18n();
    } catch (e) {
      return { lang: undefined } as any;
    }
  })();

  // Priorité: langue spécifiée > langue du provider > langue de fallback > première langue disponible
  const getDisplayText = (): string => {
    const targetLang = defaultLang || appLang || (typeof navigator !== 'undefined' ? navigator.language.split('-')[0].toLowerCase() : fallbackLang) as SupportedLanguage;
    
    // Essayer la langue cible
    if (content[targetLang]) {
      return content[targetLang];
    }
    
    // Essayer la langue de fallback
    if (content[fallbackLang]) {
      return content[fallbackLang];
    }
    
    // Retourner la première langue disponible
    const availableLanguages = Object.keys(content);
    if (availableLanguages.length > 0) {
      return content[availableLanguages[0]];
    }
    
    return '';
  };

  const displayText = getDisplayText();

  return <Component className={className}>{displayText}</Component>;
};

export default I18nText;
