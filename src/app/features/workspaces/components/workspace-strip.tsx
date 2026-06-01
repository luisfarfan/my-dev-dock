import { Briefcase, Building2, FolderKanban, Layers, Pencil, Plus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Project, Workspace, WorkspaceIcon } from '@org/models';
import { GlowBadge, NeonButton } from '@org/ui-kit';
import { useWorkspacePanelStore } from '@/app/store/use-workspace-panel-store';
import { countPendingWorkspaceMatches, WORKSPACE_COLOR_STYLES } from '@/lib/workspace-suggestions';

const ICON_MAP: Record<WorkspaceIcon, typeof Briefcase> = {
  briefcase: Briefcase,
  building: Building2,
  layers: Layers,
  folder: FolderKanban,
};

export interface WorkspaceStripProps {
  workspaces: Workspace[];
  projects: Project[];
  activeWorkspaceId: string | null;
  onSelect: (id: string | null) => void;
  onCreate: () => void;
  onEdit: (workspace: Workspace) => void;
}

export const WorkspaceStrip: React.FC<WorkspaceStripProps> = ({
  workspaces,
  projects,
  activeWorkspaceId,
  onSelect,
  onCreate,
  onEdit,
}) => {
  const { t } = useTranslation();
  const setExpanded = useWorkspacePanelStore((s) => s.setExpanded);

  const handleSelect = (id: string | null) => {
    onSelect(id);
    if (id) setExpanded(true);
  };

  const pendingByWorkspaceId = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const workspace of workspaces) {
      map.set(workspace.id, countPendingWorkspaceMatches(workspace, projects));
    }
    return map;
  }, [workspaces, projects]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-blue/25 bg-neon-blue/10">
            <Layers className="h-4 w-4 text-neon-blue" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
              {t('workspaces.title')}
            </h2>
            <p className="text-[10px] text-muted-foreground">{t('workspaces.hint')}</p>
          </div>
        </div>
        <NeonButton
          variant="outline"
          size="sm"
          className="h-9 gap-2 text-[10px] font-black uppercase tracking-wider"
          onClick={onCreate}
        >
          <Plus className="h-3.5 w-3.5" />
          {t('workspaces.new')}
        </NeonButton>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <WorkspacePill
          label={t('workspaces.all')}
          count={projects.length}
          active={activeWorkspaceId === null}
          onClick={() => handleSelect(null)}
        />

        {workspaces.map((workspace) => {
          const color = workspace.color ?? 'green';
          const styles = WORKSPACE_COLOR_STYLES[color];
          const Icon = ICON_MAP[workspace.icon ?? 'briefcase'];
          const pending = pendingByWorkspaceId.get(workspace.id) ?? 0;
          const count = workspace.projectIds.length;

          return (
            <div key={workspace.id} className="group relative flex items-center">
              <button
                type="button"
                onClick={() => handleSelect(workspace.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${styles.border} ${
                  activeWorkspaceId === workspace.id
                    ? `${styles.bg} ${styles.text} ${styles.glow}`
                    : 'border-border/60 bg-muted/30 text-muted-foreground hover:border-border'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{workspace.name}</span>
                <span className="opacity-70">· {count}</span>
                {pending > 0 ? (
                  <GlowBadge size="xs" color="blue" className="ml-0.5 px-1.5 py-0">
                    +{pending}
                  </GlowBadge>
                ) : null}
              </button>
              <button
                type="button"
                aria-label={t('workspaces.edit')}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(workspace);
                }}
                className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-muted-foreground opacity-0 transition-opacity hover:border-border hover:bg-muted/50 hover:text-foreground group-hover:opacity-100"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

function WorkspacePill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${
        active
          ? 'border-primary/50 bg-primary/15 text-primary shadow-[0_0_20px_-6px_rgba(0,255,136,0.35)]'
          : 'border-border/60 bg-muted/30 text-muted-foreground hover:border-border'
      }`}
    >
      {label}
      <span className="opacity-70">· {count}</span>
    </button>
  );
}
