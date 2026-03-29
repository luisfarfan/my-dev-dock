import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettings, EditorType } from '@org/models';
import { NeonButton } from '@org/ui-kit';
import { SettingsPanelBody } from '@/app/features/dashboard/components/settings-panel-body';

export interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  installedEditors: EditorType[];
  settings: AppSettings | null;
  raycastInstalled: boolean | null;
  onSelectDefaultEditor: (editor: EditorType) => void;
  onPatchSettings: (partial: Partial<AppSettings>) => void;
  onRefreshRaycastStatus: () => Promise<void>;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  open,
  onClose,
  installedEditors,
  settings,
  raycastInstalled,
  onSelectDefaultEditor,
  onPatchSettings,
  onRefreshRaycastStatus,
}) => {
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="settings-drawer-backdrop"
            type="button"
            aria-label={t('settingsDrawer.close')}
            className="fixed inset-0 z-100 bg-modal-backdrop backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            key="settings-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-drawer-title"
            className="fixed inset-y-0 right-0 z-110 flex w-[min(92vw,480px)] flex-col border-l border-border bg-card/95 text-card-foreground shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-5">
              <div className="min-w-0">
                <h2 id="settings-drawer-title" className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                  {t('settingsModal.title')}
                </h2>
                <p className="mt-1 text-[11px] text-muted-foreground">{t('settingsModal.subtitle')}</p>
              </div>
              <NeonButton variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onClose}>
                <X className="h-4 w-4" />
              </NeonButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4">
              <SettingsPanelBody
                installedEditors={installedEditors}
                settings={settings}
                raycastInstalled={raycastInstalled}
                onSelectDefaultEditor={onSelectDefaultEditor}
                onPatchSettings={onPatchSettings}
                onRefreshRaycastStatus={onRefreshRaycastStatus}
              />
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};
