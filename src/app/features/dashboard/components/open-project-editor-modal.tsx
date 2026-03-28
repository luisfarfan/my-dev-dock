import { Check, X } from 'lucide-react';
import React from 'react';
import { AppSettings, EditorType } from '@org/models';
import { NeonButton } from '@org/ui-kit';
import { EDITOR_LABELS } from '@/app/shared/constants/editor-labels';

export interface OpenProjectEditorModalProps {
  projectPath: string | null;
  onClose: () => void;
  installedEditors: EditorType[];
  settings: AppSettings | null;
  onPickEditor: (editor: EditorType) => void;
}

export const OpenProjectEditorModal: React.FC<OpenProjectEditorModalProps> = ({
  projectPath,
  onClose,
  installedEditors,
  settings,
  onPickEditor,
}) => {
  if (!projectPath) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-modal-backdrop backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card text-card-foreground shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Abrir Proyecto</h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Selecciona el editor para abrir este proyecto.
            </p>
          </div>
          <NeonButton variant="ghost" size="icon" className="w-9 h-9" onClick={onClose}>
            <X className="w-4 h-4" />
          </NeonButton>
        </div>

        <div className="space-y-3">
          {installedEditors.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
              No se detectaron IDEs instalados.
            </div>
          ) : (
            installedEditors.map((editor) => (
              <button
                key={editor}
                type="button"
                onClick={() => onPickEditor(editor)}
                className="w-full flex items-center justify-between rounded-xl border border-border bg-muted/40 hover:border-primary/25 px-4 py-3 text-left transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-foreground">{EDITOR_LABELS[editor] ?? editor}</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{editor}</p>
                </div>
                {settings?.defaultEditor === editor && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
