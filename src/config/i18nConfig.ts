import type { SupportedLanguage } from '../types/i18n';

// Centralized i18n configuration for the app UI
// Language is set via environment variable based on region:
// - CN (Chine): VITE_DEFAULT_UI_LANGUAGE=zh
// - YD (YD): VITE_DEFAULT_UI_LANGUAGE=en
const getDefaultLanguage = (): SupportedLanguage => {
  const lang = import.meta.env.VITE_DEFAULT_UI_LANGUAGE as SupportedLanguage;
  return lang || 'en';
};

export const DEFAULT_UI_LANGUAGE: SupportedLanguage = getDefaultLanguage();

// LocalStorage key used to persist selected UI language
export const I18N_STORAGE_KEY = 'vms:lang';

// Optional: tweak here to control whether we fallback to browser language
export const RESPECT_BROWSER_LANGUAGE = true;

// If true, the app will override any previously persisted language in localStorage
// with the DEFAULT_UI_LANGUAGE on startup. Useful for development when you change
// the default and want it applied immediately. Set to `true` to force override.
export const FORCE_PERSISTED_OVERRIDE = true;

export default {
  DEFAULT_UI_LANGUAGE,
  I18N_STORAGE_KEY,
  RESPECT_BROWSER_LANGUAGE,
  FORCE_PERSISTED_OVERRIDE,
};
