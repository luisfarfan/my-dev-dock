import i18n, { type AppLocale, getInitialLocale } from '@/app/i18n/i18n';
import { broadcastLocaleChange } from '@/lib/tauri-multi-window-sync';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface LocaleState {
  locale: AppLocale;
  setLocale: (locale: AppLocale, opts?: { syncOnly?: boolean }) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: getInitialLocale(),
      setLocale: (locale, opts) => {
        void i18n.changeLanguage(locale);
        set({ locale });
        if (!opts?.syncOnly) {
          void broadcastLocaleChange(locale);
        }
      },
    }),
    {
      name: 'dev-hub-locale',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ locale: s.locale }),
      onRehydrateStorage: () => (state) => {
        if (state?.locale) {
          void i18n.changeLanguage(state.locale);
        }
      },
    },
  ),
);
