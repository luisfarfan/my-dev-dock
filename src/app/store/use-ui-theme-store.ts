import { applyUiTheme, type UiThemeId } from '@/lib/ui-theme';
import { broadcastUiThemeChange } from '@/lib/tauri-multi-window-sync';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UiThemeState {
  themeId: UiThemeId;
  setThemeId: (id: UiThemeId) => void;
}

export const useUiThemeStore = create<UiThemeState>()(
  persist(
    (set) => ({
      themeId: 'neon',
      setThemeId: (themeId) => {
        applyUiTheme(themeId);
        set({ themeId });
        void broadcastUiThemeChange(themeId);
      },
    }),
    {
      name: 'dev-hub-ui-theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ themeId: s.themeId }),
      onRehydrateStorage: () => (state) => {
        if (state?.themeId) {
          applyUiTheme(state.themeId);
        }
      },
    }
  )
);
