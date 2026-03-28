import { listen } from "@tauri-apps/api/event";
import { motion } from "framer-motion";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { AppLocale } from "@/app/i18n/i18n";
import {
  TAURI_APP_SETTINGS_EVENT,
  TAURI_LOCALE_EVENT,
  TAURI_UI_THEME_EVENT,
} from "@/lib/tauri-multi-window-sync";
import { applyUiTheme, UI_THEME_IDS, type UiThemeId } from "@/lib/ui-theme";
import { useDashboard } from "./features/dashboard/hooks/use-dashboard";
import { GlobalCommandPalette } from "./shared/components/global-command-palette";
import { MainLayout } from "./layouts/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { useLocaleStore } from "./store/use-locale-store";
import { useProjectStore } from "./store/use-project-store";
import { useSettingsDrawerStore } from "./store/use-settings-drawer-store";
import { useUiThemeStore } from "./store/use-ui-theme-store";
import { isTauriRuntime } from "./shared/utils/is-tauri-runtime";

export function App() {
  const { t } = useTranslation();
  useLocaleStore((s) => s.locale);
  const { isLoading, fetchData, fetchInstalledEditors } = useDashboard();

  const openSettingsPanel = useCallback(async () => {
    await fetchInstalledEditors();
    useSettingsDrawerStore.getState().open();
  }, [fetchInstalledEditors]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isTauriRuntime()) return;

    let unlistenTheme: (() => void) | undefined;
    let unlistenSettings: (() => void) | undefined;
    let unlistenLocale: (() => void) | undefined;

    void (async () => {
      unlistenTheme = await listen<{ themeId: UiThemeId }>(TAURI_UI_THEME_EVENT, (e) => {
        const id = e.payload.themeId;
        if (id && UI_THEME_IDS.includes(id)) {
          applyUiTheme(id);
          useUiThemeStore.setState({ themeId: id });
        }
      });
      unlistenSettings = await listen(TAURI_APP_SETTINGS_EVENT, () => {
        void useProjectStore.getState().refreshSettingsFromBackend();
      });
      unlistenLocale = await listen<{ locale: AppLocale }>(TAURI_LOCALE_EVENT, (e) => {
        const l = e.payload.locale;
        if (l === "es" || l === "en") {
          useLocaleStore.getState().setLocale(l, { syncOnly: true });
        }
      });
    })();

    return () => {
      unlistenTheme?.();
      unlistenSettings?.();
      unlistenLocale?.();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-primary">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(0,255,136,0.2)]" />
          <span className="text-sm font-bold tracking-[0.3em] uppercase opacity-80 animate-pulse">
            {t("app.loading")}
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <MainLayout>
      <DashboardPage onOpenSettings={openSettingsPanel} />
      <GlobalCommandPalette
        onOpenSettings={openSettingsPanel}
        onFocusSearch={() => {
          document.querySelector<HTMLInputElement>("[data-hub-search-input]")?.focus();
        }}
      />
    </MainLayout>
  );
}

export default App;
