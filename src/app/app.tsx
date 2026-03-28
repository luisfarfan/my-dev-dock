import { listen } from "@tauri-apps/api/event";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  TAURI_APP_SETTINGS_EVENT,
  TAURI_UI_THEME_EVENT,
} from "@/lib/tauri-multi-window-sync";
import { applyUiTheme, UI_THEME_IDS, type UiThemeId } from "@/lib/ui-theme";
import { useDashboard } from "./features/dashboard/hooks/use-dashboard";
import { GlobalCommandPalette } from "./shared/components/global-command-palette";
import { MainLayout } from "./layouts/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsWindowPage } from "./pages/SettingsWindowPage";
import { useProjectStore } from "./store/use-project-store";
import { useUiThemeStore } from "./store/use-ui-theme-store";
import { isTauriRuntime } from "./shared/utils/is-tauri-runtime";

export function App() {
  const { isLoading, fetchData, openSettingsWindow } = useDashboard();
  const searchParams = new URLSearchParams(window.location.search);
  const windowMode = searchParams.get("window");
  const isSettingsWindow = windowMode === "settings";

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isTauriRuntime()) return;

    let unlistenTheme: (() => void) | undefined;
    let unlistenSettings: (() => void) | undefined;

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
    })();

    return () => {
      unlistenTheme?.();
      unlistenSettings?.();
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
            Syncing Hub...
          </span>
        </motion.div>
      </div>
    );
  }

  if (isSettingsWindow) {
    return <SettingsWindowPage />;
  }

  return (
    <MainLayout>
      <DashboardPage />
      <GlobalCommandPalette
        onOpenSettingsWindow={openSettingsWindow}
        onFocusSearch={() => {
          const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Find in workspace..."]');
          searchInput?.focus();
        }}
      />
    </MainLayout>
  );
}

export default App;
