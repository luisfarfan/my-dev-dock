import React from 'react';
import { 
  Folder, 
  History, 
  Settings, 
  Layers, 
  Terminal,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { NeonButton } from '../neon-button/neon-button';

export interface SidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

const NAV_ITEMS = [
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'groups', label: 'Groups', icon: Layers },
  { id: 'activity', label: 'Activity', icon: History },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeItem = 'projects', 
  onItemClick 
}) => {
  return (
    <aside className="w-64 h-full flex flex-col bg-muted/60 border-r border-border backdrop-blur-xl transition-all duration-300">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center p-1 shadow-[0_0_15px_-5px_rgba(0,255,136,0.5)]">
          <Terminal className="text-black w-5 h-5" />
        </div>
        <span className="text-xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
          DevHub
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 flex flex-col gap-1 py-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className={`
              group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
              ${activeItem === item.id 
                ? 'bg-accent text-primary border border-border' 
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-4 h-4 ${activeItem === item.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {item.label}
            </div>
            {activeItem === item.id && (
              <ChevronRight className="w-3 h-3 text-primary animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-border flex flex-col gap-4">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
            <User className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-foreground leading-none mb-1">Luis Farfan</span>
            <span className="text-[10px] text-muted-foreground leading-none">Developer</span>
          </div>
        </div>
        
        <div className="flex gap-2">
           <NeonButton variant="ghost" size="icon" className="flex-1">
              <Settings className="w-4 h-4" />
           </NeonButton>
           <NeonButton variant="ghost" size="icon" className="flex-1 text-red-500/50 hover:text-red-500">
              <LogOut className="w-4 h-4" />
           </NeonButton>
        </div>
      </div>
    </aside>
  );
};
