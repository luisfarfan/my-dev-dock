import { Command, FolderPlus, Search, Settings2, X } from 'lucide-react';
import React from 'react';
import { NeonButton } from '@org/ui-kit';

export interface GlobalCommandPaletteProps {
  onOpenSettingsWindow: () => Promise<void>;
  onFocusSearch: () => void;
}

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  onOpenSettingsWindow,
  onFocusSearch,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (!isMetaK) return;

      event.preventDefault();
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 bg-modal-backdrop backdrop-blur-sm flex items-start justify-center pt-[18vh] px-4">
      <div className="floating-panel w-full max-w-2xl rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Command className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Command Palette</p>
              <p className="text-[11px] text-muted-foreground">Navega rápido por acciones globales.</p>
            </div>
          </div>
          <NeonButton variant="ghost" size="icon" className="w-8 h-8" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </NeonButton>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            className="w-full p-3 rounded-xl border border-border bg-muted/40 hover:border-primary/40 flex items-center justify-between transition-colors"
            onClick={async () => {
              setIsOpen(false);
              await onOpenSettingsWindow();
            }}
          >
            <span className="flex items-center gap-3 text-sm text-foreground">
              <Settings2 className="w-4 h-4 text-primary" />
              Abrir ventana de settings
            </span>
            <span className="text-[11px] text-muted-foreground">Desktop Window</span>
          </button>

          <button
            type="button"
            className="w-full p-3 rounded-xl border border-border bg-muted/40 hover:border-primary/40 flex items-center justify-between transition-colors"
            onClick={() => {
              setIsOpen(false);
              onFocusSearch();
            }}
          >
            <span className="flex items-center gap-3 text-sm text-foreground">
              <Search className="w-4 h-4 text-neon-blue" />
              Foco en búsqueda global
            </span>
            <span className="text-[11px] text-muted-foreground">⌘K → Search</span>
          </button>

          <div className="w-full p-3 rounded-xl border border-dashed border-border bg-muted/30 flex items-center gap-3">
            <FolderPlus className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Próximo paso: atajos para registrar proyecto y crear grupos.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
