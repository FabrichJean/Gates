/**
 * Types pour la gestion des titres multilingues des mangas
 * Format: [{i18_language: "en", title: "...", description: "..."}]
 */

export type MangaLanguage = 'en' | 'fr' | 'es' | 'de' | 'pt' | 'ar' | 'zh' | 'ja' | 'ko';

export interface MangaTitleEntry {
  i18_language: MangaLanguage;
  title: string;
  description: string;
}

export type MangaTitles = MangaTitleEntry[];

export const MANGA_LANGUAGES: { code: MangaLanguage; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export interface MangaTitlesFieldProps {
  value: MangaTitles;
  onChange: (titles: MangaTitles) => void;
  label?: string;
  required?: boolean;
  className?: string;
}
