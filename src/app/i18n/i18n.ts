import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

export const SUPPORTED_LOCALES = ['es', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

const STORAGE_KEY = 'dev-hub-locale';

type PersistShape = { state?: { locale?: string } };

function readPersistedLocale(): AppLocale | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistShape;
    const l = parsed?.state?.locale;
    return l === 'es' || l === 'en' ? l : null;
  } catch {
    return null;
  }
}

export function detectBrowserLocale(): AppLocale {
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function getInitialLocale(): AppLocale {
  return readPersistedLocale() ?? detectBrowserLocale();
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: getInitialLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
