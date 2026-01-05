/**
 * Types pour l'internationalisation (i18n)
 */

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'pt' | 'ar' | 'zh' | 'ja' | 'ko' | 'hi';

export interface TranslatedText {
  [key: string]: string; // key is language code (en, fr, es, etc.)
}

export interface I18nContent {
  title?: TranslatedText;
  description?: TranslatedText;
}

export interface I18nFieldProps {
  value: TranslatedText;
  onChange: (value: TranslatedText) => void;
  label: string;
  fieldType?: 'input' | 'textarea';
  required?: boolean;
  placeholder?: string;
  rows?: number;
  supportedLanguages?: SupportedLanguage[];
}

export const DEFAULT_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'pt'];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  ar: 'العربية',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  hi: 'हिन्दी',
};

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  es: '🇪🇸',
  de: '🇩🇪',
  pt: '🇵🇹',
  ar: '🇸🇦',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  hi: '🇮🇳',
};
