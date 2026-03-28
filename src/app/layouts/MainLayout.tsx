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

      <div className="relative z-10 box-border flex h-dvh w-screen min-h-0 flex-col px-3 pb-3 pt-7 lg:px-4 lg:pb-4 lg:pt-9">
        <section className="desktop-glass flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-3xl">
          <div className="flex h-10 shrink-0 border-b border-border">
            <div className="w-[82px] shrink-0" aria-hidden />
            <div data-tauri-drag-region className="app-drag-region min-h-10 flex-1" />
          </div>
          <main className="min-h-0 flex-1 overflow-y-auto py-5 pl-[82px] pr-6 lg:py-6 lg:pr-10">
            {children}
          </main>
        </section>
      </div>
    </div>
  );
};
