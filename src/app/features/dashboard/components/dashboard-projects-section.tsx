import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Folder, FolderOpen, FolderSearch, Layers, Plus, RefreshCw, Sparkles, Trash2, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { confirm, message, open } from '@tauri-apps/plugin-dialog';
import { Group, Project } from '@org/models';
import { GlowBadge, NeonButton } from '@org/ui-kit';
import { isTauriRuntime } from '@/app/shared/utils/is-tauri-runtime';
import { ProjectCard } from '@/app/features/projects';

const LAST_SCANNED_PARENT_PATH_KEY = 'dashboard:lastScannedParentPath';

export interface DashboardProjectsSectionProps {
  viewMode: 'grid' | 'list';
  projects: Project[];
  groups: Group[];
  sortLabel: string;
  isMinimalView: boolean;
  isClearing: boolean;
  onClearingChange: (value: boolean) => void;
  onRemoveProject: (id: string) => void;
  onRegisterProject: (path: string) => Promise<void>;
  onScanDirectory: (path: string) => Promise<Project[]>;
  onClearAll: () => Promise<void>;
  onOpenInEditor: (path: string) => void;
  onLaunchGroup: (groupId: string) => void;
  onExitMinimalView: () => void;
  onCreateRaycastLauncher: (project: Project) => void;
}

export const DashboardProjectsSection: React.FC<DashboardProjectsSectionProps> = ({
  viewMode,
  projects,
  groups,
  sortLabel,
  isMinimalView,
  isClearing,
  onClearingChange,
  onRemoveProject,
  onRegisterProject,
  onScanDirectory,
  onClearAll,
  onOpenInEditor,
  onLaunchGroup,
  onExitMinimalView,
  onCreateRaycastLauncher,
}) => {
  const { t } = useTranslation();
  const [lastScannedPath, setLastScannedPath] = React.useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(LAST_SCANNED_PARENT_PATH_KEY);
    return stored?.trim() || null;
  });
  const [syncResult, setSyncResult] = React.useState<{
    basePath: string;
    addedProjects: Project[];
  } | null>(null);

  const handleAddProject = async () => {
    const path = window.prompt(t('projects.promptPath'));
    if (path) await onRegisterProject(path);
  };

  const pickParentFolder = async (): Promise<string | null> => {
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

    return selectedPath;
  };

  const showScanResult = async (basePath: string, addedProjects: Project[]) => {
    setSyncResult({ basePath, addedProjects });
  };

  const handleScanParentFolder = async () => {
    const selectedPath = await pickParentFolder();
    if (!selectedPath) return;

    setLastScannedPath(selectedPath);
    window.localStorage.setItem(LAST_SCANNED_PARENT_PATH_KEY, selectedPath);
    try {
      const previousIds = new Set(projects.map((p) => p.id));
      const foundProjects = await onScanDirectory(selectedPath);
      const addedProjects = foundProjects.filter((project) => !previousIds.has(project.id));
      await showScanResult(selectedPath, addedProjects);
    } catch (err) {
      const errorText = t('projects.scanError', { message: (err as Error).message });
      if (isTauriRuntime()) {
        await message(errorText, {
          title: t('projects.syncTitle'),
          kind: 'warning',
          okLabel: t('projects.ok'),
        });
      } else {
        window.alert(errorText);
      }
    }
  };

  const handleSync = async () => {
    let targetPath = lastScannedPath;
    if (!targetPath) {
      targetPath = await pickParentFolder();
      if (!targetPath) return;
      setLastScannedPath(targetPath);
      window.localStorage.setItem(LAST_SCANNED_PARENT_PATH_KEY, targetPath);
    }

    try {
      const previousIds = new Set(projects.map((p) => p.id));
      const foundProjects = await onScanDirectory(targetPath);
      const addedProjects = foundProjects.filter((project) => !previousIds.has(project.id));
      await showScanResult(targetPath, addedProjects);
    } catch (err) {
      const errorText = t('projects.scanError', { message: (err as Error).message });
      if (isTauriRuntime()) {
        await message(errorText, {
          title: t('projects.syncTitle'),
          kind: 'warning',
          okLabel: t('projects.ok'),
        });
      } else {
        window.alert(errorText);
      }
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

  if (isMinimalView) {
    return (
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
            {t('minimalView.title')}
          </h2>
          <NeonButton
            variant="outline"
            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest"
            onClick={onExitMinimalView}
          >
            <FolderOpen className="w-4 h-4" />
            {t('minimalView.backToNormal')}
          </NeonButton>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/40">
          <div className="border-b border-border/70 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
            {t('groups.title')}
          </div>
          {groups.length === 0 ? (
            <p className="px-3 py-3 text-xs text-muted-foreground">{t('minimalView.emptyGroups')}</p>
          ) : (
            <ul>
              {groups.map((group) => (
                <li key={group.id} className="border-b border-border/40 last:border-b-0">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/40"
                    onClick={() => onLaunchGroup(group.id)}
                  >
                    <Layers className="h-4 w-4 text-primary/80" />
                    <span className="truncate">{group.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border/70 bg-card/40">
          <div className="border-b border-border/70 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
            {t('projects.title')}
          </div>
          {projects.length === 0 ? (
            <p className="px-3 py-3 text-xs text-muted-foreground">{t('minimalView.emptyProjects')}</p>
          ) : (
            <ul>
              {projects.map((project) => (
                <li key={project.id} className="border-b border-border/40 last:border-b-0">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/40"
                    onClick={() => onOpenInEditor(project.path)}
                  >
                    <Folder className="h-4 w-4 text-primary/80" />
                    <span className="truncate">{project.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    );
  }

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
            variant="outline"
            className="h-11 px-6 text-xs font-black uppercase tracking-widest border-border hover:border-primary/50 group gap-2"
            onClick={handleSync}
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            {t('projects.sync')}
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

      {syncResult ? (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-modal-backdrop backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card text-card-foreground shadow-[0_0_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-border/60 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-primary/40 bg-primary/15 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.18em] text-foreground">
                    {t('projects.syncTitle')}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {syncResult.addedProjects.length === 0
                      ? t('projects.syncNoNew')
                      : t('projects.scanAdded', { count: syncResult.addedProjects.length })}
                  </p>
                </div>
              </div>
              <NeonButton
                variant="ghost"
                size="icon"
                className="w-9 h-9"
                onClick={() => setSyncResult(null)}
              >
                <X className="w-4 h-4" />
              </NeonButton>
            </div>

            <div className="p-5 pt-4 space-y-4">
              <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t('projects.syncBasePath')}
                </p>
                <p className="font-mono text-[11px] text-foreground/90 mt-1 break-all">{syncResult.basePath}</p>
              </div>

              {syncResult.addedProjects.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/90">
                    {t('projects.syncAddedListLabel')}
                  </p>
                  <div className="max-h-72 overflow-auto rounded-xl border border-primary/20 bg-primary/5 p-2">
                    <div className="space-y-2">
                      {syncResult.addedProjects.map((project) => (
                        <div
                          key={project.id}
                          className="rounded-lg border border-border/70 bg-card/80 px-3 py-2 flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono break-all">{project.path}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground">
                  {t('projects.scanNoProjects')}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-border/60 p-4">
              <NeonButton
                variant="primary"
                className="h-9 px-4 text-xs font-black uppercase tracking-wider"
                onClick={() => setSyncResult(null)}
              >
                {t('projects.ok')}
              </NeonButton>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
