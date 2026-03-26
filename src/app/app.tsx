import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDashboard } from "./features/dashboard/hooks/use-dashboard";
import { GlobalCommandPalette } from "./shared/components/global-command-palette";
import { MainLayout } from "./layouts/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsWindowPage } from "./pages/SettingsWindowPage";

export function App() {
  const { isLoading, fetchData, openSettingsWindow } = useDashboard();
  const searchParams = new URLSearchParams(window.location.search);
  const windowMode = searchParams.get("window");
  const isSettingsWindow = windowMode === "settings";

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0B0B0B] text-primary">
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
