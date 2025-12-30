import React from 'react';
import type { TranslatedText, SupportedLanguage } from '../types/i18n';
import Markdown from 'react-markdown'


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

  // Obtenir la langue du navigateur
  const getBrowserLanguage = (): SupportedLanguage => {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    
    // Vérifier si c'est une langue supportée
    const supportedLangs: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'pt', 'ar', 'zh', 'ja', 'ko'];
    if (supportedLangs.includes(browserLang as SupportedLanguage)) {
      return browserLang as SupportedLanguage;
    }
    
    return fallbackLang;
  };

  // Priorité: langue spécifiée > langue du navigateur > langue de fallback > première langue disponible
  const getDisplayText = (): string => {
    const targetLang = defaultLang || getBrowserLanguage();
    
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

  return <Component className={className}>
    {displayText}
    </Component>;
};

export default I18nText;
