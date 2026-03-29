import { AnimatePresence, motion } from 'framer-motion';
import { Folder, FolderSearch, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { confirm, message, open } from '@tauri-apps/plugin-dialog';
import { Project } from '@org/models';
import { GlowBadge, NeonButton } from '@org/ui-kit';
import { isTauriRuntime } from '@/app/shared/utils/is-tauri-runtime';
import { ProjectCard } from '@/app/features/projects';

export interface DashboardProjectsSectionProps {
  viewMode: 'grid' | 'list';
  projects: Project[];
  sortLabel: string;
  isClearing: boolean;
  onClearingChange: (value: boolean) => void;
  onRemoveProject: (id: string) => void;
  onRegisterProject: (path: string) => Promise<void>;
  onScanDirectory: (path: string) => Promise<number>;
  onClearAll: () => Promise<void>;
  onOpenInEditor: (path: string) => void;
  onCreateRaycastLauncher: (project: Project) => void;
}

export const DashboardProjectsSection: React.FC<DashboardProjectsSectionProps> = ({
  viewMode,
  projects,
  sortLabel,
  isClearing,
  onClearingChange,
  onRemoveProject,
  onRegisterProject,
  onScanDirectory,
  onClearAll,
  onOpenInEditor,
  onCreateRaycastLauncher,
}) => {
  const { t } = useTranslation();

  const handleAddProject = async () => {
    const path = window.prompt(t('projects.promptPath'));
    if (path) await onRegisterProject(path);
  };

  const handleScanParentFolder = async () => {
    let selectedPath: string | null = null;

    if (isTauriRuntime()) {
      const result = await open({
        directory: true,
        multiple: false,
        title: t('projects.dialogScanTitle'),
      });
      if (typeof result === 'string') {
        selectedPath = result;
      }
    } else {
      const path = window.prompt(t('projects.promptScanPath'));
      selectedPath = path?.trim() || null;
    }

    if (!selectedPath) return;

    try {
      const foundCount = await onScanDirectory(selectedPath);
      if (foundCount === 0) {
        window.alert(t('projects.scanNoProjects'));
      } else {
        window.alert(t('projects.scanAdded', { count: foundCount }));
      }
    } catch (err) {
      window.alert(t('projects.scanError', { message: (err as Error).message }));
    }
  };

  const handleClearAll = async () => {
    if (isClearing) return;

    onClearingChange(true);
    try {
      const shouldDelete = isTauriRuntime()
        ? await confirm(t('projects.confirmClear'), {
            title: t('projects.confirmClearTitle'),
            kind: 'warning',
            okLabel: t('projects.okDelete'),
            cancelLabel: t('projects.cancel'),
          })
        : window.confirm(t('projects.confirmClear'));
      if (!shouldDelete) return;

      await onClearAll();
      if (isTauriRuntime()) {
        await message(t('projects.clearDone'), {
          title: t('projects.clearDoneTitle'),
          kind: 'info',
          okLabel: t('projects.ok'),
        });
      } else {
        window.alert(t('projects.clearDone'));
      }
    } finally {
      onClearingChange(false);
    }
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-foreground">{t('projects.title')}</h2>
            <div className="flex items-center gap-2 mt-1">
              <GlowBadge size="xs" color="blue">
                {projects.length} {t('projects.detected')}
              </GlowBadge>
              {sortLabel ? (
                <span className="text-[10px] font-bold text-muted-foreground opacity-40 italic">
                  {sortLabel}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NeonButton
            variant="outline"
            className="h-11 px-8 text-xs font-black uppercase tracking-widest border-border hover:border-primary/50 group gap-3"
            onClick={handleScanParentFolder}
          >
            <FolderSearch className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {t('projects.scanFolder')}
          </NeonButton>

          <NeonButton
            variant="primary"
            className="h-11 px-8 text-xs font-black uppercase tracking-widest gap-3 shadow-[0_0_20px_rgba(0,255,136,0.15)]"
            onClick={handleAddProject}
          >
            <Plus className="w-4 h-4" />
            {t('projects.register')}
          </NeonButton>

          <NeonButton
            variant="outline"
            className="h-11 px-6 text-xs font-black uppercase tracking-widest gap-2 border-red-400/40 text-red-300 hover:border-red-400 hover:text-red-200"
            disabled={isClearing}
            onClick={handleClearAll}
          >
            <Trash2 className="w-4 h-4" />
            {isClearing ? t('projects.clearing') : t('projects.clearAll')}
          </NeonButton>
        </div>
      </div>

      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        }
      >
        <AnimatePresence mode="popLayout">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              className="min-w-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              layout
            >
              <ProjectCard
                project={project}
                onRemove={onRemoveProject}
                onOpenInEditor={onOpenInEditor}
                onCreateRaycastLauncher={onCreateRaycastLauncher}
                compact={viewMode === 'grid'}
                isDraggable={true}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {projects.length === 0 && (
          <div className="col-span-full py-24 border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center gap-6 bg-muted/20">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Folder className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/70">{t('projects.emptyTitle')}</h3>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{t('projects.emptyHint')}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
