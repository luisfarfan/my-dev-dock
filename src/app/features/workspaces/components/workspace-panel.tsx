import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  FolderKanban,
  GitBranch,
  Layers,
  Pencil,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Project, Workspace, WorkspaceIcon } from '@org/models';
import { GlassCard, GlowBadge, NeonButton } from '@org/ui-kit';
import { useWorkspacePanelStore } from '@/app/store/use-workspace-panel-store';
import { copyTextToClipboard } from '@/lib/clipboard';
import { WORKSPACE_COLOR_STYLES } from '@/lib/workspace-suggestions';

const ICON_MAP: Record<WorkspaceIcon, typeof Briefcase> = {
  briefcase: Briefcase,
  building: Building2,
  layers: Layers,
  folder: FolderKanban,
};

export interface WorkspacePanelProps {
  workspace: Workspace;
  projects: Project[];
  pendingCount: number;
  onEdit: (workspace: Workspace) => void;
  onOpenProject: (path: string) => void;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  workspace,
  projects,
  pendingCount,
  onEdit,
  onOpenProject,
}) => {
  const { t } = useTranslation();
  const expanded = useWorkspacePanelStore((s) => s.expanded);
  const toggleExpanded = useWorkspacePanelStore((s) => s.toggleExpanded);

  const color = workspace.color ?? 'green';
  const styles = WORKSPACE_COLOR_STYLES[color];
  const Icon = ICON_MAP[workspace.icon ?? 'briefcase'];
  const panelId = `workspace-panel-${workspace.id}`;

  return (
    <section
      aria-labelledby={panelId}
      className={`rounded-[1.75rem] border transition-colors ${styles.border} ${styles.bg} shadow-lg`}
    >
      <header className="flex flex-wrap items-center gap-3 px-5 py-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${styles.border} bg-card/40`}>
          <Icon className={`h-5 w-5 ${styles.text}`} />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id={panelId}
            className="truncate text-lg font-black uppercase tracking-[0.18em] text-foreground"
          >
            {workspace.name}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <GlowBadge size="xs" color="blue">
              {t('workspaces.panel.projectCount', { count: projects.length })}
            </GlowBadge>
            {pendingCount > 0 ? (
              <GlowBadge size="xs" color="green">
                {t('workspaces.panel.pendingMatches', { count: pendingCount })}
              </GlowBadge>
            ) : null}
            <span className="text-[10px] font-bold text-muted-foreground italic">
              {expanded ? t('workspaces.panel.hintExpanded') : t('workspaces.panel.hintCollapsed')}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <NeonButton
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label={t('workspaces.edit')}
            onClick={() => onEdit(workspace)}
          >
            <Pencil className="h-4 w-4" />
          </NeonButton>
          <NeonButton
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 px-3 text-[10px] font-black uppercase tracking-wider"
            aria-expanded={expanded}
            aria-controls={`${panelId}-body`}
            onClick={toggleExpanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                {t('workspaces.panel.collapse')}
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                {t('workspaces.panel.expand')}
              </>
            )}
          </NeonButton>
        </div>
      </header>

      {!expanded && projects.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto px-5 pb-4 pt-0">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => onOpenProject(project.path)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${styles.border} bg-card/30 text-foreground hover:bg-card/60`}
              title={project.path}
            >
              {project.name}
            </button>
          ))}
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id={`${panelId}-body`}
            key="workspace-panel-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 px-5 pb-5 pt-4">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 py-14">
                  <Layers className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-center text-xs text-muted-foreground">
                    {t('workspaces.panel.empty')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {projects.map((project) => (
                    <WorkspaceProjectTile
                      key={project.id}
                      project={project}
                      onOpen={() => onOpenProject(project.path)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
};

function WorkspaceProjectTile({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const [pathCopied, setPathCopied] = React.useState(false);

  const handleCopyPath = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyTextToClipboard(project.path);
    setPathCopied(true);
    window.setTimeout(() => setPathCopied(false), 1500);
  };

  return (
    <GlassCard
      hoverable
      className={`group flex flex-col gap-3 border-border/70 bg-card/40 p-4 transition-colors hover:border-primary/40`}
    >
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-black uppercase tracking-wide text-foreground">
          {project.name}
        </h3>
        <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground" title={project.path}>
          {project.path}
        </p>
        {project.git.branch ? (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <GitBranch className="h-3 w-3 shrink-0" />
            <span className="truncate">{project.git.branch}</span>
          </div>
        ) : null}
      </div>
      <div className="flex gap-2">
        <NeonButton
          variant={pathCopied ? 'primary' : 'ghost'}
          size="icon"
          className="h-9 w-9 shrink-0"
          title={pathCopied ? t('projectCard.pathCopied') : t('projectCard.copyPath')}
          aria-label={t('projectCard.copyPath')}
          onClick={(e) => void handleCopyPath(e)}
        >
          {pathCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </NeonButton>
        <NeonButton
          variant="outline"
          size="sm"
          className="h-9 flex-1 gap-2 text-[10px] font-black uppercase tracking-wider group-hover:border-primary/50"
          onClick={onOpen}
        >
          {t('workspaces.panel.open')}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </NeonButton>
      </div>
    </GlassCard>
  );
}
