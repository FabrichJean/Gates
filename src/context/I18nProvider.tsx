import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { SupportedLanguage } from '../types/i18n';
import { DEFAULT_LANGUAGES, LANGUAGE_NAMES } from '../types/i18n';
import { DEFAULT_UI_LANGUAGE, I18N_STORAGE_KEY, RESPECT_BROWSER_LANGUAGE, FORCE_PERSISTED_OVERRIDE } from '../config/i18nConfig';

// Basic locale bundles (small examples). For a real app these should be split into many keys/files.
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import zh from '../locales/zh.json';

export type LocaleMessages = Record<string, string>;
export type AllLocales = Partial<Record<SupportedLanguage, LocaleMessages>>;

const LOCALE_KEY = I18N_STORAGE_KEY;

interface I18nContextValue {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  availableLanguages: SupportedLanguage[];
  // t supports either a fallback string or an options object with
  // { fallback?: string, default?: { [lang]: string } }
  t: (
    key: string,
    fallbackOrOptions?:
      | string
      | {
          fallback?: string;
          default?: Partial<Record<SupportedLanguage, string>>;
        }
  ) => string;
  messages: LocaleMessages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const DEFAULT_MESSAGES: AllLocales = {
  en,
  fr,
  zh,
};

export const I18nProvider = ({ children, defaultLang }: { children: ReactNode; defaultLang?: SupportedLanguage }) => {
  const browserLang = (typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : DEFAULT_UI_LANGUAGE) as SupportedLanguage;

  const _persisted = typeof localStorage !== 'undefined' ? (localStorage.getItem(LOCALE_KEY) as SupportedLanguage | null) : null;
  // Allow forcing override of persisted value in special cases
  const persisted = FORCE_PERSISTED_OVERRIDE ? null : _persisted;

  // When forcing override, prefer explicit defaultLang or DEFAULT_UI_LANGUAGE
  // and ignore browser language to ensure the DEFAULT_UI_LANGUAGE is applied.
  const initialLang = (FORCE_PERSISTED_OVERRIDE
    ? (defaultLang || DEFAULT_UI_LANGUAGE)
    : (persisted || defaultLang || (RESPECT_BROWSER_LANGUAGE && DEFAULT_LANGUAGES.includes(browserLang) ? browserLang : DEFAULT_UI_LANGUAGE))
  ) as SupportedLanguage;

  const [lang, setLangState] = useState<SupportedLanguage>(initialLang);

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_KEY, lang);
    } catch (e) {
      // ignore
    }
  }, [lang]);

  const allMessages: AllLocales = useMemo(() => ({ ...DEFAULT_MESSAGES }), []);

  const messages: LocaleMessages = useMemo(() => {
    return (allMessages[lang] as LocaleMessages) || {};
  }, [allMessages, lang]);

  const setLang = (l: SupportedLanguage) => {
    if (l === lang) return;
    setLangState(l);
  };

  // If we are forcing override, and the raw persisted value differs from our initialLang,
  // write the chosen initialLang back to storage so the UI reflects the DEFAULT_UI_LANGUAGE.
  useEffect(() => {
    if (FORCE_PERSISTED_OVERRIDE && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(LOCALE_KEY);
        if (raw !== initialLang) {
          localStorage.setItem(LOCALE_KEY, initialLang);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const t = (
    key: string,
    fallbackOrOptions?:
      | string
      | { fallback?: string; default?: Partial<Record<SupportedLanguage, string>> }
  ) => {
    // simple dot path support: 'nav.home'
    const val = messages[key];
    if (val) return val;

    // Normalize options
    let fallback: string | undefined;
    let defaultMap: Partial<Record<SupportedLanguage, string>> | undefined;
    if (typeof fallbackOrOptions === 'string') {
      fallback = fallbackOrOptions;
    } else if (fallbackOrOptions && typeof fallbackOrOptions === 'object') {
      fallback = fallbackOrOptions.fallback;
      defaultMap = fallbackOrOptions.default;
    }

    // If a default map is provided, prefer the language-specific default
    if (defaultMap && defaultMap[lang]) return defaultMap[lang] as string;

    if (fallback) return fallback;
    return key;
  };

  const value: I18nContextValue = {
    lang,
    setLang,
    availableLanguages: DEFAULT_LANGUAGES,
    t,
    messages,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
};

export const getAvailableLanguageNames = () => {
  return DEFAULT_LANGUAGES.map(l => ({ code: l, name: LANGUAGE_NAMES[l] }));
};

export default I18nProvider;
