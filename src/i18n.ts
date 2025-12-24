/**
 * Export centralisé du système i18n
 * 
 * @example
 * ```tsx
 * import { I18nField, I18nText, useI18nState, prepareI18nForAPI } from './i18n';
 * ```
 */

// Components
export { default as I18nField } from './components/I18nField';
export { default as I18nText } from './components/I18nText';
export { I18nContentFields, I18nContentDisplay } from './components/I18nComponents';

// Hook
export { useI18nState } from './hooks/useI18nState';

// Types
export type {
  SupportedLanguage,
  TranslatedText,
  I18nContent,
  I18nFieldProps,
} from './types/i18n';

export {
  DEFAULT_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
} from './types/i18n';

// Utilities
export {
  serializeI18n,
  deserializeI18n,
  getTranslation,
  hasTranslation,
  countTranslations,
  mergeTranslations,
  cleanTranslations,
  validateRequiredLanguage,
  convertLegacyToI18n,
  getBrowserLanguage,
  prepareI18nForAPI,
  parseI18nFromAPI,
} from './utils/i18nUtils';
