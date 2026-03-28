import { Check } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettings, EditorType } from '@org/models';
import { LanguageSection } from '@/app/features/dashboard/components/language-section';
import { ProjectSortSection } from '@/app/features/dashboard/components/project-sort-section';
import { ThemeAppearanceSection } from '@/app/features/dashboard/components/theme-appearance-section';
import { EDITOR_LABELS } from '@/app/shared/constants/editor-labels';

export interface SettingsPanelBodyProps {
  installedEditors: EditorType[];
  settings: AppSettings | null;
  onSelectDefaultEditor: (editor: EditorType) => void;
  onPatchSettings: (partial: Partial<AppSettings>) => void;
}

export const SettingsPanelBody: React.FC<SettingsPanelBodyProps> = ({
  installedEditors,
  settings,
  onSelectDefaultEditor,
  onPatchSettings,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-0 pb-6">
      <ThemeAppearanceSection />

      <LanguageSection />

      <ProjectSortSection settings={settings} onPatchSettings={onPatchSettings} />

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
