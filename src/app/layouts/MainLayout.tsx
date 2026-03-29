import React from 'react';

export interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * macOS overlay titlebar: traffic lights sit top-left. The glass panel stays full-width
 * (symmetric window padding only); we reserve space *inside* the panel so content and
 * drag don’t sit under the native controls.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-screen bg-transparent text-foreground flex flex-col font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* Background Neon Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-green/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-neon-blue/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Top outer padding is empty transparent webview: without a drag strip, clicks do nothing (overlay titlebar). */}
      <div
        aria-hidden
        data-tauri-drag-region
        className="app-drag-region pointer-events-auto fixed inset-x-0 top-0 z-50 box-border h-7 pl-[82px] lg:h-9"
      />

      <div className="relative z-10 box-border flex h-dvh w-screen min-h-0 flex-col pt-7 lg:pt-9">
        <section className="desktop-glass flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-none">
          <main className="min-h-0 flex-1 overflow-y-auto pt-3 pb-4 pl-[82px] pr-5 lg:pt-4 lg:pb-5 lg:pr-8">
            {children}
          </main>
        </section>
      </div>
    </div>
  );
};
