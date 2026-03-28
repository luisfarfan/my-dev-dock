import { Hand } from 'lucide-react';
import React from 'react';
import { GlowBadge } from '@org/ui-kit';

export const DashboardFooter: React.FC = () => {
  return (
    <footer className="mt-8 py-10 border-t border-border flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,136,1)] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Ready to Launch</span>
        </div>
        <div className="w-px h-6 bg-border" />
        <div className="flex items-center gap-3">
          <Hand className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Drop projects on clusters
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[9px] font-mono text-muted-foreground/40">STATION_ID: DEV_MAC_PRO</span>
        <GlowBadge size="xs" color="blue" className="opacity-40">
          STABLE_V1
        </GlowBadge>
      </div>
    </footer>
  );
};
