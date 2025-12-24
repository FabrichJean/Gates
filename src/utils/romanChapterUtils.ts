/**
 * Utilitaires pour convertir entre le format RomanChapterI18n et le format I18nContent
 */

import type { RomanChapterI18n } from '../types/romanChapter';
import type { I18nContent, TranslatedText } from '../types/i18n';

/**
 * Convertit RomanChapterI18n vers I18nContent
 */
export function romanChapterToI18n(data: RomanChapterI18n): I18nContent {
  const title: TranslatedText = {};
  const content: TranslatedText = {};

  data.forEach(entry => {
    if (entry.title.trim()) {
      title[entry.i18_language] = entry.title;
    }
    if (entry.content.trim()) {
      content[entry.i18_language] = entry.content;
    }
  });

  return { title, description: content }; // On utilise 'description' pour le contenu
}

/**
 * Convertit I18nContent vers RomanChapterI18n
 */
export function i18nToRomanChapter(
  titleTranslations: TranslatedText,
  contentTranslations: TranslatedText
): RomanChapterI18n {
  const languages = new Set([
    ...Object.keys(titleTranslations),
    ...Object.keys(contentTranslations)
  ]);

  return Array.from(languages).map(lang => ({
    i18_language: lang as any,
    title: titleTranslations[lang] || '',
    content: contentTranslations[lang] || ''
  }));
}
