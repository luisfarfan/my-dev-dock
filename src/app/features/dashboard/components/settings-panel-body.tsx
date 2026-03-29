import { Check } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/plugin-dialog';
import { AppSettings, EditorType } from '@org/models';
import { LanguageSection } from '@/app/features/dashboard/components/language-section';
import { ProjectSortSection } from '@/app/features/dashboard/components/project-sort-section';
import { ThemeAppearanceSection } from '@/app/features/dashboard/components/theme-appearance-section';
import { EDITOR_LABELS } from '@/app/shared/constants/editor-labels';
import { isTauriRuntime } from '@/app/shared/utils/is-tauri-runtime';

export interface SettingsPanelBodyProps {
  installedEditors: EditorType[];
  settings: AppSettings | null;
  raycastInstalled: boolean | null;
  onSelectDefaultEditor: (editor: EditorType) => void;
  onPatchSettings: (partial: Partial<AppSettings>) => void;
  onRefreshRaycastStatus: () => Promise<void>;
}

export const SettingsPanelBody: React.FC<SettingsPanelBodyProps> = ({
  installedEditors,
  settings,
  raycastInstalled,
  onSelectDefaultEditor,
  onPatchSettings,
  onRefreshRaycastStatus,
}) => {
  const { t } = useTranslation();
  const [isPickingFolder, setIsPickingFolder] = React.useState(false);

  const pickScriptsFolder = async () => {
    if (isPickingFolder) return;
    setIsPickingFolder(true);
    try {
      if (isTauriRuntime()) {
        const result = await open({
          directory: true,
          multiple: false,
          title: t('raycast.settings.pickTitle'),
        });
        if (typeof result === 'string') {
          onPatchSettings({ raycastScriptsPath: result });
        }
      } else {
        const value = window.prompt(t('raycast.settings.promptPath'));
        if (value?.trim()) {
          onPatchSettings({ raycastScriptsPath: value.trim() });
        }
      }
    } finally {
      setIsPickingFolder(false);
    }
  };

  return (
    <div className="flex flex-col gap-0 pb-6">
      <ThemeAppearanceSection />

      <LanguageSection />

      <ProjectSortSection settings={settings} onPatchSettings={onPatchSettings} />

      <div className="mt-6 space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              {t('raycast.settings.title')}
            </h3>
            <p className="mt-1 text-[11px] text-muted-foreground">{t('raycast.settings.hint')}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void onRefreshRaycastStatus();
            }}
            className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80"
          >
            {t('raycast.settings.refresh')}
          </button>
        </div>

        <div className="text-[11px]">
          {raycastInstalled === null ? (
            <span className="text-muted-foreground">{t('raycast.settings.statusUnknown')}</span>
          ) : raycastInstalled ? (
            <span className="text-neon-green">{t('raycast.settings.detected')}</span>
          ) : (
            <span className="text-yellow-300">{t('raycast.settings.notDetected')}</span>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
          {settings?.raycastScriptsPath?.trim() ? (
            <span className="font-mono">{settings.raycastScriptsPath}</span>
          ) : (
            <span>{t('raycast.settings.pathNotSet')}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              void pickScriptsFolder();
            }}
            className="rounded-lg border border-border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors hover:border-primary/40"
            disabled={isPickingFolder}
          >
            {isPickingFolder ? t('raycast.settings.picking') : t('raycast.settings.chooseFolder')}
          </button>
          {settings?.raycastScriptsPath ? (
            <button
              type="button"
              onClick={() => onPatchSettings({ raycastScriptsPath: '' })}
              className="rounded-lg border border-border px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground transition-colors hover:border-red-400/40 hover:text-red-300"
            >
              {t('raycast.settings.clear')}
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{t('settingsModal.defaultEditor')}</h3>
        {installedEditors.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
            {t('settingsModal.noIDEs')}
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
                    : 'border-border bg-muted/40 hover:border-primary/25'
                }`}
              >
                <div>
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
      </div>

      {settings &&
        installedEditors.length > 0 &&
        !installedEditors.includes(settings.defaultEditor) && (
          <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-300">
            {t('settingsModal.editorNotInstalled', { editor: settings.defaultEditor })}
          </div>
        )}
    </div>
  );
};
