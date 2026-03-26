import { Check, X } from 'lucide-react';
import React from 'react';
import { AppSettings, EditorType } from '@org/models';
import { NeonButton } from '@org/ui-kit';
import { EDITOR_LABELS } from '@/app/shared/constants/editor-labels';

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  installedEditors: EditorType[];
  settings: AppSettings | null;
  onSelectDefaultEditor: (editor: EditorType) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  installedEditors,
  settings,
  onSelectDefaultEditor,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-black/80 shadow-[0_0_40px_rgba(0,0,0,0.45)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Settings</h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Selecciona el editor por defecto para abrir proyectos.
            </p>
          </div>
          <NeonButton variant="ghost" size="icon" className="w-9 h-9" onClick={onClose}>
            <X className="w-4 h-4" />
          </NeonButton>
        </div>

        <div className="space-y-3">
          {installedEditors.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground">
              No se detectaron IDEs instalados.
            </div>
          ) : (
            installedEditors.map((editor) => {
              const isSelected = settings?.defaultEditor === editor;
              return (
                <button
                  key={editor}
                  type="button"
                  onClick={() => onSelectDefaultEditor(editor)}
                  className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-white/10 bg-white/5 hover:border-white/25'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-white">{EDITOR_LABELS[editor] ?? editor}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{editor}</p>
                  </div>
                  {isSelected && (
                    <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {settings &&
          installedEditors.length > 0 &&
          !installedEditors.includes(settings.defaultEditor) && (
            <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-300">
              El editor por defecto actual ({settings.defaultEditor}) no está instalado.
            </div>
          )}
      </div>
    </div>
  );
};
