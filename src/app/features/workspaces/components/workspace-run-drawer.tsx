import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Play, Settings2, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Project, RunCommandResolution, Workspace } from '@org/models';
import { GlowBadge, NeonButton } from '@org/ui-kit';
import { getRunService } from '@org/services';
import { useProjectStore } from '@/app/store/use-project-store';
import { useRunSessionsStore } from '@/app/store/use-run-sessions-store';

export interface WorkspaceRunDrawerProps {
  open: boolean;
  onClose: () => void;
  workspace: Workspace;
  projects: Project[];
}

interface RowState {
  project: Project;
  resolution: RunCommandResolution;
  selected: boolean;
  customDraft: string;
  editing: boolean;
}

export const WorkspaceRunDrawer: React.FC<WorkspaceRunDrawerProps> = ({
  open,
  onClose,
  workspace,
  projects,
}) => {
  const { t } = useTranslation();
  const patchProjectRunCommand = useProjectStore((s) => s.setProjectRunCommand);
  const [rows, setRows] = React.useState<RowState[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const runService = getRunService();
      const next: RowState[] = [];
      for (const project of projects) {
        const resolution = await runService.resolveRunCommand(
          project.path,
          project.runCommand,
        );
        if (cancelled) return;
        next.push({
          project,
          resolution,
          selected: Boolean(resolution.command),
          customDraft: project.runCommand ?? resolution.command ?? '',
          editing: false,
        });
      }
      if (!cancelled) {
        setRows(next);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, projects]);

  const runnableCount = rows.filter((r) => r.selected && r.resolution.command).length;

  const refreshRunSessions = useRunSessionsStore((s) => s.refreshSessions);
  const openRunDrawer = useRunSessionsStore((s) => s.openDrawer);

  const handleRun = async () => {
    const ids = rows.filter((r) => r.selected && r.resolution.command).map((r) => r.project.id);
    if (ids.length === 0) return;
    setRunning(true);
    try {
      const results = await getRunService().runProjects(ids);
      await refreshRunSessions();
      const lastSessionId = [...results].reverse().find((r) => r.sessionId)?.sessionId;
      onClose();
      openRunDrawer(lastSessionId);
    } finally {
      setRunning(false);
    }
  };

  const saveCustom = async (row: RowState) => {
    const cmd = row.customDraft.trim();
    await patchProjectRunCommand(row.project.id, cmd || undefined);
    const resolution = await getRunService().resolveRunCommand(row.project.path, cmd || undefined);
    setRows((prev) =>
      prev.map((r) =>
        r.project.id === row.project.id
          ? {
              ...r,
              resolution,
              selected: Boolean(resolution.command),
              editing: false,
              customDraft: cmd || resolution.command || '',
            }
          : r,
      ),
    );
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label={t('workspaces.run.close')}
            className="fixed inset-0 z-100 bg-modal-backdrop backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-110 mx-auto max-h-[min(72vh,560px)] w-full max-w-3xl rounded-t-[1.75rem] border border-border bg-card/95 shadow-2xl backdrop-blur-xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                  {t('workspaces.run.title', { name: workspace.name })}
                </h2>
                <p className="mt-1 text-[11px] text-muted-foreground">{t('workspaces.run.subtitle')}</p>
              </div>
              <NeonButton variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}>
                <X className="h-4 w-4" />
              </NeonButton>
            </header>

            <div className="max-h-[calc(min(72vh,560px)-8.5rem)] overflow-y-auto px-5 py-4">
              {loading ? (
                <p className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('workspaces.run.loading')}
                </p>
              ) : (
                <div className="space-y-2">
                  {rows.map((row) => (
                    <div
                      key={row.project.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/25 px-3 py-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={row.selected}
                        disabled={!row.resolution.command}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.project.id === row.project.id
                                ? { ...r, selected: e.target.checked }
                                : r,
                            ),
                          )
                        }
                        className="rounded border-border"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-foreground">{row.project.name}</p>
                        {row.editing ? (
                          <input
                            value={row.customDraft}
                            onChange={(e) =>
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.project.id === row.project.id
                                    ? { ...r, customDraft: e.target.value }
                                    : r,
                                ),
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-border bg-input px-2 py-1 font-mono text-[11px]"
                            placeholder={t('workspaces.run.commandPlaceholder')}
                          />
                        ) : (
                          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                            {row.resolution.command ?? t('workspaces.run.noCommand')}
                          </p>
                        )}
                      </div>
                      {row.resolution.source === 'detected' ? (
                        <GlowBadge size="xs" color="blue">
                          {row.resolution.confidence}
                        </GlowBadge>
                      ) : null}
                      <NeonButton
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={t('workspaces.run.configure')}
                        onClick={() =>
                          setRows((prev) =>
                            prev.map((r) =>
                              r.project.id === row.project.id
                                ? { ...r, editing: !r.editing }
                                : r,
                            ),
                          )
                        }
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </NeonButton>
                      {row.editing ? (
                        <NeonButton
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-black uppercase"
                          onClick={() => void saveCustom(row)}
                        >
                          {t('workspaces.run.saveCommand')}
                        </NeonButton>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-border px-5 py-4">
              <span className="text-[10px] font-bold text-muted-foreground">
                {t('workspaces.run.readyCount', { count: runnableCount, total: rows.length })}
              </span>
              <div className="flex gap-2">
                <NeonButton variant="ghost" size="sm" onClick={onClose}>
                  {t('workspaces.run.cancel')}
                </NeonButton>
                <NeonButton
                  variant="primary"
                  size="sm"
                  className="gap-2 bg-neon-yellow/20 text-neon-yellow border-neon-yellow/40 hover:bg-neon-yellow/30"
                  disabled={runnableCount === 0 || running}
                  onClick={() => void handleRun()}
                >
                  {running ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  )}
                  {t('workspaces.run.confirm', { count: runnableCount })}
                </NeonButton>
              </div>
            </footer>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
};
