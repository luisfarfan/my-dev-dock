import { Briefcase, Building2, FolderKanban, Layers, Trash2, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Project, Workspace, WorkspaceColor, WorkspaceIcon } from '@org/models';
import { NeonButton } from '@org/ui-kit';
import {
  defaultWorkspaceSelection,
  suggestWorkspaceProjects,
  WORKSPACE_COLOR_STYLES,
} from '@/lib/workspace-suggestions';

const ICONS: { id: WorkspaceIcon; Icon: typeof Briefcase }[] = [
  { id: 'briefcase', Icon: Briefcase },
  { id: 'building', Icon: Building2 },
  { id: 'layers', Icon: Layers },
  { id: 'folder', Icon: FolderKanban },
];

const COLORS: WorkspaceColor[] = ['green', 'blue', 'yellow', 'red'];

export interface WorkspaceModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  projects: Project[];
  initial?: Workspace | null;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    matchQuery: string;
    projectIds: string[];
    includePathMatch: boolean;
    color?: WorkspaceColor;
    icon?: WorkspaceIcon;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  open,
  mode,
  projects,
  initial,
  onClose,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [name, setName] = React.useState('');
  const [matchQuery, setMatchQuery] = React.useState('');
  const [includePathMatch, setIncludePathMatch] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [color, setColor] = React.useState<WorkspaceColor>('green');
  const [icon, setIcon] = React.useState<WorkspaceIcon>('briefcase');
  const [filter, setFilter] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const userTouchedSelection = React.useRef(false);

  React.useEffect(() => {
    if (!open) return;
    userTouchedSelection.current = false;
    setName(initial?.name ?? '');
    setMatchQuery(initial?.matchQuery ?? initial?.name ?? '');
    setIncludePathMatch(initial?.includePathMatch ?? false);
    setSelectedIds(new Set(initial?.projectIds ?? []));
    setColor(initial?.color ?? 'green');
    setIcon(initial?.icon ?? 'briefcase');
    setFilter('');
  }, [open, initial]);

  const suggestions = React.useMemo(
    () => suggestWorkspaceProjects(projects, matchQuery, includePathMatch),
    [projects, matchQuery, includePathMatch],
  );

  const displaySuggestions = React.useMemo(() => {
    const byId = new Map(suggestions.map((s) => [s.project.id, s]));
    for (const id of selectedIds) {
      if (!byId.has(id)) {
        const project = projects.find((p) => p.id === id);
        if (project) {
          byId.set(id, { project, score: 0, reason: 'name' as const });
        }
      }
    }
    return [...byId.values()].sort(
      (a, b) => b.score - a.score || a.project.name.localeCompare(b.project.name),
    );
  }, [suggestions, selectedIds, projects]);

  React.useEffect(() => {
    if (!open || mode !== 'create' || userTouchedSelection.current) return;
    if (!matchQuery.trim()) return;
    setSelectedIds(new Set(defaultWorkspaceSelection(suggestions)));
  }, [open, mode, matchQuery, suggestions]);

  const visibleSuggestions = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return displaySuggestions;
    return displaySuggestions.filter(
      (s) =>
        s.project.name.toLowerCase().includes(q) ||
        s.project.path.toLowerCase().includes(q),
    );
  }, [displaySuggestions, filter]);

  const toggleId = (id: string) => {
    userTouchedSelection.current = true;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    userTouchedSelection.current = true;
    setSelectedIds(new Set(suggestions.map((s) => s.project.id)));
  };

  const selectNone = () => {
    userTouchedSelection.current = true;
    setSelectedIds(new Set());
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        name: name.trim() || matchQuery.trim(),
        matchQuery: matchQuery.trim(),
        projectIds: [...selectedIds],
        includePathMatch,
        color,
        icon,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-130 flex items-start justify-center bg-modal-backdrop px-4 pt-[10vh] backdrop-blur-sm">
      <div className="floating-panel flex max-h-[min(82vh,720px)] w-full max-w-xl flex-col rounded-2xl p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black uppercase tracking-widest text-foreground">
              {mode === 'create' ? t('workspaces.modal.createTitle') : t('workspaces.modal.editTitle')}
            </h2>
            <p className="mt-1 text-[11px] text-muted-foreground">{t('workspaces.modal.subtitle')}</p>
          </div>
          <NeonButton variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </NeonButton>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('workspaces.modal.nameLabel')}
            </span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (mode === 'create' && !userTouchedSelection.current) {
                  setMatchQuery(e.target.value);
                }
              }}
              placeholder={t('workspaces.modal.namePlaceholder')}
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm font-semibold text-foreground focus:border-primary/50 focus:outline-none"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('workspaces.modal.matchLabel')}
            </span>
            <input
              value={matchQuery}
              onChange={(e) => setMatchQuery(e.target.value)}
              placeholder={t('workspaces.modal.matchPlaceholder')}
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm font-mono text-foreground focus:border-primary/50 focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={includePathMatch}
              onChange={(e) => setIncludePathMatch(e.target.checked)}
              className="rounded border-border"
            />
            {t('workspaces.modal.includePath')}
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {t('workspaces.modal.colorLabel')}
              </p>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform ${WORKSPACE_COLOR_STYLES[c].bg} ${
                      color === c ? WORKSPACE_COLOR_STYLES[c].border + ' scale-110' : 'border-border/40 opacity-70'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {t('workspaces.modal.iconLabel')}
              </p>
              <div className="flex gap-1">
                {ICONS.map(({ id, Icon }) => (
                  <NeonButton
                    key={id}
                    variant={icon === id ? 'primary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIcon(id)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </NeonButton>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-foreground">
                {t('workspaces.modal.suggestions', { count: suggestions.length })}
              </p>
              <div className="flex gap-2">
                <button type="button" className="text-[10px] font-bold text-primary hover:underline" onClick={selectAll}>
                  {t('workspaces.modal.selectAll')}
                </button>
                <button type="button" className="text-[10px] font-bold text-muted-foreground hover:underline" onClick={selectNone}>
                  {t('workspaces.modal.selectNone')}
                </button>
              </div>
            </div>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('workspaces.modal.filterSuggestions')}
              className="mb-3 h-9 w-full rounded-lg border border-border bg-input px-3 text-xs focus:border-primary/50 focus:outline-none"
            />
            <div className="max-h-52 space-y-1 overflow-y-auto">
              {visibleSuggestions.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground">{t('workspaces.modal.noSuggestions')}</p>
              ) : (
                visibleSuggestions.map(({ project, reason }) => (
                  <label
                    key={project.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2 py-2 hover:border-border hover:bg-muted/40"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(project.id)}
                      onChange={() => toggleId(project.id)}
                      className="mt-1 rounded border-border"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-foreground">{project.name}</span>
                      <span className="block truncate font-mono text-[10px] text-muted-foreground">{project.path}</span>
                    </span>
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-muted-foreground/70">
                      {t(`workspaces.match.${reason}`)}
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="mt-3 text-[10px] font-bold text-muted-foreground">
              {t('workspaces.modal.selectedCount', { count: selectedIds.size })}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
          {mode === 'edit' && onDelete ? (
            <NeonButton
              variant="ghost"
              size="sm"
              className="text-neon-red hover:text-neon-red gap-2"
              onClick={() => void onDelete()}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('workspaces.modal.delete')}
            </NeonButton>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <NeonButton variant="ghost" onClick={onClose}>
              {t('workspaces.modal.cancel')}
            </NeonButton>
            <NeonButton variant="primary" disabled={saving || selectedIds.size === 0} onClick={() => void handleSubmit()}>
              {saving ? t('workspaces.modal.saving') : t('workspaces.modal.save')}
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  );
};
