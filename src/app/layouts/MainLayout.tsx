import React from 'react';

export interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
}) => {
  return (
    <div className="min-h-screen w-screen bg-[#0B0B0B] text-[#F2F2F2] flex flex-col font-sans selection:bg-primary/30 relative overflow-x-hidden">
      {/* Background Neon Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-green/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-neon-blue/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-6 py-12 lg:px-12">
        {children}
      </main>

      {/* Custom Scrollbar Global Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </div>
  );
};
