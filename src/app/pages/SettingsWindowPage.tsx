import { Check, Settings2 } from 'lucide-react';
import React from 'react';
import { EditorType } from '@org/models';
import { ProjectSortSection } from '@/app/features/dashboard/components/project-sort-section';
import { NeonButton } from '@org/ui-kit';
import { useDashboard } from '@/app/features/dashboard';
import { ThemeAppearanceSection } from '@/app/features/dashboard/components/theme-appearance-section';
import { EDITOR_LABELS } from '@/app/shared/constants/editor-labels';

export const SettingsWindowPage: React.FC = () => {
  const { settings, installedEditors, fetchInstalledEditors, setDefaultEditor, patchSettings } =
    useDashboard();

  React.useEffect(() => {
    fetchInstalledEditors();
  }, [fetchInstalledEditors]);

  const handlePickEditor = async (editor: EditorType) => {
    await setDefaultEditor(editor);
  };

  return (
    <div className="box-border h-dvh w-screen bg-background px-4 pb-4 pt-8">
      <div className="desktop-glass flex h-full min-h-0 flex-col overflow-hidden rounded-2xl">
        <div className="flex h-10 shrink-0 border-b border-border">
          <div className="w-[82px] shrink-0" aria-hidden />
          <div data-tauri-drag-region className="app-drag-region min-h-10 flex-1 rounded-tr-2xl" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-5 pl-[82px] pr-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-[0.2em] text-foreground">Settings</h2>
              <p className="text-xs text-muted-foreground">Preferencias globales del workspace local</p>
            </div>
          </div>

          <ThemeAppearanceSection />

          <ProjectSortSection settings={settings} onPatchSettings={patchSettings} />

          <section className="space-y-3 mt-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Default Editor</h3>

            {installedEditors.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
                No se detectaron IDEs instalados.
              </div>
            ) : (
              installedEditors.map((editor) => {
                const isSelected = settings?.defaultEditor === editor;
                return (
                  <button
                    key={editor}
                    type="button"
                    onClick={() => handlePickEditor(editor)}
                    className={`w-full rounded-xl border px-4 py-3 flex items-center justify-between transition-colors ${
                      isSelected ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted/40 hover:border-primary/25'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">{EDITOR_LABELS[editor] ?? editor}</p>
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
          </section>

          <div className="mt-6">
            <NeonButton variant="outline" className="h-10 px-5 text-xs uppercase tracking-wider" onClick={() => window.close()}>
              Cerrar ventana
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  );
};
