/**
 * Utilitaires pour gérer les titres multilingues des mangas
 * Adaptateurs pour convertir entre le système i18n et le format API
 */

import type { MangaTitles, MangaTitleEntry, MangaLanguage } from '../types/mangaTitles';
import type { TranslatedText, I18nContent } from '../types/i18n';

/**
 * Convertit le format i18n (TranslatedText) vers le format API (MangaTitles)
 * @example
 * i18nToMangaTitles({en: "One Piece"}, {en: "Epic"})
 * // [{i18_language: "en", title: "One Piece", description: "Epic"}]
 */
export function i18nToMangaTitles(
  titleTranslations: TranslatedText,
  descriptionTranslations: TranslatedText
): MangaTitles {
  const languages = new Set([
    ...Object.keys(titleTranslations),
    ...Object.keys(descriptionTranslations)
  ]);

  return Array.from(languages).map(lang => ({
    i18_language: lang as MangaLanguage,
    title: titleTranslations[lang] || '',
    description: descriptionTranslations[lang] || ''
  })).filter(entry => entry.title.trim() !== ''); // Garder seulement les entrées avec titre
}

/**
 * Convertit le format API (MangaTitles) vers le format i18n (I18nContent)
 * @example
 * mangaTitlesToI18n([{i18_language: "en", title: "One Piece", description: "Epic"}])
 * // { title: {en: "One Piece"}, description: {en: "Epic"} }
 */
export function mangaTitlesToI18n(titles: MangaTitles): I18nContent {
  const title: TranslatedText = {};
  const description: TranslatedText = {};

  titles.forEach(entry => {
    if (entry.title) {
      title[entry.i18_language] = entry.title;
    }
    if (entry.description) {
      description[entry.i18_language] = entry.description;
    }
  });

  return { title, description };
}

/**
 * Convertit MangaTitles en JSON string pour l'API
 * @example
 * prepareTitlesForAPI([{i18_language: "en", title: "One Piece", description: "Epic"}])
 * // "[{\"i18_language\":\"en\",\"title\":\"One Piece\",\"description\":\"Epic\"}]"
 */
export function prepareTitlesForAPI(titles: MangaTitles): string {
  if (!titles || titles.length === 0) return '[]';
  return JSON.stringify(titles);
}

/**
 * Parse les titres depuis l'API (JSON string ou objet)
 * @example
 * parseTitlesFromAPI("[{\"i18_language\":\"en\",\"title\":\"One Piece\"}]")
 * // [{i18_language: "en", title: "One Piece", description: ""}]
 */
export function parseTitlesFromAPI(data: string | MangaTitles | null | undefined): MangaTitles {
  if (!data) return [];
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map(entry => ({
          i18_language: entry.i18_language || 'en',
          title: entry.title || '',
          description: entry.description || '',
        }));
      }
    } catch (e) {
      console.warn('Failed to parse titles:', e);
      return [];
    }
  }
  
  if (Array.isArray(data)) {
    return data.map(entry => ({
      i18_language: entry.i18_language || 'en',
      title: entry.title || '',
      description: entry.description || '',
    }));
  }
  
  return [];
}

/**
 * Récupère un titre pour une langue spécifique
 */
export function getTitleForLanguage(
  titles: MangaTitles,
  language: MangaLanguage
): MangaTitleEntry | undefined {
  return titles.find(t => t.i18_language === language);
}

/**
 * Récupère le titre avec fallback intelligent
 * Priorité: langue demandée → anglais → français → premier disponible
 */
export function getTitleWithFallback(
  titles: MangaTitles,
  preferredLang: MangaLanguage = 'en'
): MangaTitleEntry | null {
  if (!titles || titles.length === 0) return null;
  
  // 1. Langue préférée
  const preferred = titles.find(t => t.i18_language === preferredLang);
  if (preferred?.title) return preferred;
  
  // 2. Anglais
  const english = titles.find(t => t.i18_language === 'en');
  if (english?.title) return english;
  
  // 3. Français
  const french = titles.find(t => t.i18_language === 'fr');
  if (french?.title) return french;
  
  // 4. Premier disponible avec un titre
  const first = titles.find(t => t.title);
  return first || null;
}

/**
 * Détecte la langue du navigateur
 */
export function getBrowserLanguage(): MangaLanguage {
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const validLangs: MangaLanguage[] = ['en', 'fr', 'es', 'de', 'pt', 'ar', 'zh', 'ja', 'ko'];
  
  if (validLangs.includes(browserLang as MangaLanguage)) {
    return browserLang as MangaLanguage;
  }
  
  return 'en'; // fallback
}

/**
 * Ajoute ou met à jour un titre pour une langue
 */
export function updateTitleForLanguage(
  titles: MangaTitles,
  language: MangaLanguage,
  title: string,
  description: string
): MangaTitles {
  const existing = titles.findIndex(t => t.i18_language === language);
  
  if (existing >= 0) {
    // Mise à jour
    const updated = [...titles];
    updated[existing] = { i18_language: language, title, description };
    return updated;
  } else {
    // Ajout
    return [...titles, { i18_language: language, title, description }];
  }
}

/**
 * Supprime un titre pour une langue
 */
export function removeTitleForLanguage(
  titles: MangaTitles,
  language: MangaLanguage
): MangaTitles {
  return titles.filter(t => t.i18_language !== language);
}

/**
 * Compte le nombre de langues avec des titres remplis
 */
export function countFilledTitles(titles: MangaTitles): number {
  return titles.filter(t => t.title.trim() !== '').length;
}

/**
 * Vérifie si une langue spécifique est remplie
 */
export function isTitleFilled(titles: MangaTitles, language: MangaLanguage): boolean {
  const entry = titles.find(t => t.i18_language === language);
  return !!entry && entry.title.trim() !== '';
}

/**
 * Valide qu'au moins une langue est remplie
 */
export function validateTitles(titles: MangaTitles, required: boolean = false): boolean {
  if (!required) return true;
  return titles.some(t => t.title.trim() !== '');
}

/**
 * Crée des titres vides pour toutes les langues
 */
export function createEmptyTitles(): MangaTitles {
  const languages: MangaLanguage[] = ['en', 'fr', 'es', 'de', 'pt', 'ar', 'zh', 'ja', 'ko'];
  return languages.map(lang => ({
    i18_language: lang,
    title: '',
    description: '',
  }));
}

/**
 * Nettoie les entrées vides
 */
export function cleanEmptyTitles(titles: MangaTitles): MangaTitles {
  return titles.filter(t => t.title.trim() !== '' || t.description.trim() !== '');
}
