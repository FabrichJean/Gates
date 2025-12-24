import { useState, useCallback } from 'react';
import type { TranslatedText, SupportedLanguage } from '../types/i18n';

interface UseI18nStateReturn {
  value: TranslatedText;
  setValue: (value: TranslatedText) => void;
  updateLanguage: (lang: SupportedLanguage, text: string) => void;
  clearLanguage: (lang: SupportedLanguage) => void;
  clearAll: () => void;
  isEmpty: boolean;
  hasLanguage: (lang: SupportedLanguage) => boolean;
  getLanguageCount: () => number;
  toJSON: () => string;
  fromJSON: (json: string) => void;
}

/**
 * Hook personnalisé pour gérer l'état des contenus multilingues
 * 
 * @example
 * ```tsx
 * const title = useI18nState({ en: "Welcome" });
 * 
 * // Mettre à jour une langue
 * title.updateLanguage('fr', 'Bienvenue');
 * 
 * // Vérifier si vide
 * if (title.isEmpty) { ... }
 * 
 * // Sauvegarder en JSON
 * const json = title.toJSON();
 * ```
 */
export const useI18nState = (initialValue: TranslatedText = {}): UseI18nStateReturn => {
  const [value, setValue] = useState<TranslatedText>(initialValue);

  const updateLanguage = useCallback((lang: SupportedLanguage, text: string) => {
    setValue(prev => ({
      ...prev,
      [lang]: text,
    }));
  }, []);

  const clearLanguage = useCallback((lang: SupportedLanguage) => {
    setValue(prev => {
      const newValue = { ...prev };
      delete newValue[lang];
      return newValue;
    });
  }, []);

  const clearAll = useCallback(() => {
    setValue({});
  }, []);

  const isEmpty = Object.keys(value).length === 0 || 
    Object.values(value).every(v => !v || v.trim() === '');

  const hasLanguage = useCallback((lang: SupportedLanguage) => {
    return !!value[lang] && value[lang].trim().length > 0;
  }, [value]);

  const getLanguageCount = useCallback(() => {
    return Object.keys(value).filter(lang => value[lang]?.trim()).length;
  }, [value]);

  const toJSON = useCallback(() => {
    return JSON.stringify(value);
  }, [value]);

  const fromJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      setValue(parsed);
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  }, []);

  return {
    value,
    setValue,
    updateLanguage,
    clearLanguage,
    clearAll,
    isEmpty,
    hasLanguage,
    getLanguageCount,
    toJSON,
    fromJSON,
  };
};
