/**
 * Types pour la gestion des chapitres de romans multilingues
 * Format: [{i18_language: "en", title: "...", content: "..."}]
 */

export type RomanChapterLanguage = 'en' | 'fr' | 'es' | 'de' | 'pt' | 'ar' | 'zh' | 'ja' | 'ko';

export interface RomanChapterI18nEntry {
  i18_language: RomanChapterLanguage;
  title: string;
  content: string;
}

export type RomanChapterI18n = RomanChapterI18nEntry[];

export interface RomanChapterI18nFieldProps {
  value: RomanChapterI18n;
  onChange: (data: RomanChapterI18n) => void;
  titleLabel?: string;
  contentLabel?: string;
  titleRequired?: boolean;
  contentRequired?: boolean;
  className?: string;
}
