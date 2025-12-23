/**
 * API pour gérer les langues disponibles
 */

import axios from "axios";
import { apiURL } from "../constant";

// Interface pour une langue
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  isActive?: boolean;
}

/**
 * Récupérer toutes les langues disponibles
 * Les données de l'API sont enrichies avec les drapeaux et noms natifs
 */
export const getLanguages = async (): Promise<Language[]> => {
  try {
    const response = await axios.get(`${apiURL}/i18languages`);
    const apiLanguages = response.data;
    // Enrichir les données avec les métadonnées locales (drapeaux, noms natifs)
    return enrichLanguageData(apiLanguages);
  } catch (error) {
    console.error("Error fetching languages:", error);
    // Fallback avec langues par défaut si l'API n'est pas disponible
    return getDefaultLanguages();
  }
};

/**
 * Récupérer les langues actives uniquement
 * Les données de l'API sont enrichies avec les drapeaux et noms natifs
 */
export const getActiveLanguages = async (): Promise<Language[]> => {
  try {
    const response = await axios.get(`${apiURL}/i18languages`);
    const apiLanguages = response.data;
    // Enrichir les données avec les métadonnées locales
    return enrichLanguageData(apiLanguages);
  } catch (error) {
    console.error("Error fetching active languages:", error);
    return getDefaultLanguages();
  }
};

/**
 * Langues par défaut (fallback)
 */
export const getDefaultLanguages = (): Language[] => {
  return [
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isActive: true },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', isActive: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isActive: true },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isActive: true },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', isActive: true },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', isActive: true },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', isActive: true },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', isActive: true },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', isActive: true },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', isActive: true },
  ];
};

/**
 * Mapping des métadonnées des langues (drapeaux et noms natifs)
 * Utilisé pour enrichir les données venant de l'API
 */
const languageMetadata: Record<string, { nativeName: string; flag: string }> = {
  de: { nativeName: 'Deutsch', flag: '🇩🇪' },
  en: { nativeName: 'English', flag: '🇬🇧' },
  es: { nativeName: 'Español', flag: '🇪🇸' },
  fr: { nativeName: 'Français', flag: '🇫🇷' },
  hi: { nativeName: 'हिन्दी', flag: '🇮🇳' },
  id: { nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  ja: { nativeName: '日本語', flag: '🇯🇵' },
  ko: { nativeName: '한국어', flag: '🇰🇷' },
  vi: { nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  zh: { nativeName: '中文', flag: '🇨🇳' },
};

/**
 * Enrichit les données de l'API avec les métadonnées (drapeaux et noms natifs)
 * Si l'API ne renvoie que le code et le nom, on ajoute le drapeau et le nom natif
 */
export const enrichLanguageData = (languages: Partial<Language>[]): Language[] => {
  return languages.map(lang => ({
    code: lang.code || '',
    name: lang.name || '',
    nativeName: lang.nativeName || languageMetadata[lang.code || '']?.nativeName || lang.name || '',
    flag: lang.flag || languageMetadata[lang.code || '']?.flag || '🌐',
    isActive: lang.isActive !== undefined ? lang.isActive : true,
  }));
};

