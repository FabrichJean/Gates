import type { TranslatedText, SupportedLanguage } from '../types/i18n';

/**
 * Utilitaires pour l'internationalisation (i18n)
 */

/**
 * Convertit un objet TranslatedText en chaîne JSON
 */
export const serializeI18n = (content: TranslatedText): string => {
  return JSON.stringify(content);
};

/**
 * Parse une chaîne JSON en objet TranslatedText
 */
export const deserializeI18n = (json: string): TranslatedText => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Error parsing i18n JSON:', error);
    return {};
  }
};

/**
 * Obtient le texte dans une langue spécifique avec fallback
 */
export const getTranslation = (
  content: TranslatedText,
  lang: SupportedLanguage,
  fallbackLang: SupportedLanguage = 'en'
): string => {
  return content[lang] || content[fallbackLang] || Object.values(content)[0] || '';
};

/**
 * Vérifie si au moins une traduction existe
 */
export const hasTranslation = (content: TranslatedText): boolean => {
  return Object.values(content).some(text => text && text.trim().length > 0);
};

/**
 * Compte le nombre de traductions remplies
 */
export const countTranslations = (content: TranslatedText): number => {
  return Object.values(content).filter(text => text && text.trim().length > 0).length;
};

/**
 * Fusionne deux objets de traductions (merge)
 */
export const mergeTranslations = (
  base: TranslatedText,
  override: TranslatedText
): TranslatedText => {
  return {
    ...base,
    ...override,
  };
};

/**
 * Filtre les traductions vides
 */
export const cleanTranslations = (content: TranslatedText): TranslatedText => {
  const cleaned: TranslatedText = {};
  
  for (const [lang, text] of Object.entries(content)) {
    if (text && text.trim().length > 0) {
      cleaned[lang] = text;
    }
  }
  
  return cleaned;
};

/**
 * Valide qu'au moins la langue par défaut est remplie
 */
export const validateRequiredLanguage = (
  content: TranslatedText,
  requiredLang: SupportedLanguage = 'en'
): boolean => {
  return !!content[requiredLang] && content[requiredLang].trim().length > 0;
};

/**
 * Convertit un ancien champ texte simple en format i18n
 */
export const convertLegacyToI18n = (
  text: string,
  defaultLang: SupportedLanguage = 'en'
): TranslatedText => {
  if (!text || text.trim().length === 0) {
    return {};
  }
  
  return {
    [defaultLang]: text,
  };
};

/**
 * Obtient la langue du navigateur
 */
export const getBrowserLanguage = (): SupportedLanguage => {
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const supportedLangs: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'pt', 'ar', 'zh', 'ja', 'ko'];
  
  if (supportedLangs.includes(browserLang as SupportedLanguage)) {
    return browserLang as SupportedLanguage;
  }
  
  return 'en';
};

/**
 * Prépare les données pour l'envoi à l'API
 */
export const prepareI18nForAPI = (content: TranslatedText): string => {
  return JSON.stringify(cleanTranslations(content));
};

/**
 * Parse les données reçues de l'API
 */
export const parseI18nFromAPI = (data: string | TranslatedText | null | undefined): TranslatedText => {
  if (!data) {
    return {};
  }
  
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  
  return data;
};
