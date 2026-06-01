import { Command, KeyRound, Layers, Search, Settings2, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Workspace } from '@org/models';
import { NeonButton, SearchInput } from '@org/ui-kit';
import { EnvVarRow } from '@/app/features/env-index';
import { useActiveWorkspaceStore } from '@/app/store/use-active-workspace-store';
import { useWorkspacePanelStore } from '@/app/store/use-workspace-panel-store';
import { useEnvIndexDrawerStore } from '@/app/store/use-env-index-drawer-store';
import { useEnvIndexStore } from '@/app/store/use-env-index-store';
import { useProjectStore } from '@/app/store/use-project-store';
import { countEnvKeys, filterEnvEntries, formatEnvCopy, copyEnvText } from '@/lib/env-index-utils';

export interface GlobalCommandPaletteProps {
  onOpenSettings: () => Promise<void>;
  onFocusSearch: () => void;
}

type PaletteItem =
  | { kind: 'action'; id: string; label: string; hint: string; icon: typeof Command; run: () => void | Promise<void> }
  | { kind: 'workspace'; workspace: Workspace }
  | { kind: 'env'; entry: ReturnType<typeof filterEnvEntries>[number] };

export const GlobalCommandPalette: React.FC<GlobalCommandPaletteProps> = ({
  onOpenSettings,
  onFocusSearch,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const entries = useEnvIndexStore((s) => s.entries);
  const scanEnvVars = useEnvIndexStore((s) => s.scanEnvVars);
  const workspaces = useProjectStore((s) => s.workspaces);
  const activeWorkspaceId = useActiveWorkspaceStore((s) => s.activeWorkspaceId);
  const setActiveWorkspaceId = useActiveWorkspaceStore((s) => s.setActiveWorkspaceId);
  const setWorkspacePanelExpanded = useWorkspacePanelStore((s) => s.setExpanded);

  const quickActions = React.useMemo(
    () => [
      {
        id: 'env-index',
        label: t('commandPalette.openEnvIndex'),
        hint: t('commandPalette.envIndexHint'),
        icon: KeyRound,
        run: () => {
          setIsOpen(false);
          useEnvIndexDrawerStore.getState().open();
        },
      },
      {
        id: 'settings',
        label: t('commandPalette.openSettings'),
        hint: t('commandPalette.settingsPanelHint'),
        icon: Settings2,
        run: async () => {
          setIsOpen(false);
          await onOpenSettings();
        },
      },
      {
        id: 'project-search',
        label: t('commandPalette.focusSearch'),
        hint: t('commandPalette.searchShortcut'),
        icon: Search,
        run: () => {
          setIsOpen(false);
          onFocusSearch();
        },
      },
    ],
    [onFocusSearch, onOpenSettings, t],
  );

  const workspaceMatches = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return workspaces.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.matchQuery.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query, workspaces]);

  const envMatches = React.useMemo(() => {
    if (!query.trim()) return [];
    return filterEnvEntries(entries, query).slice(0, 12);
  }, [entries, query]);

  const listItems = React.useMemo((): PaletteItem[] => {
    const q = query.trim();
    if (!q) {
      return quickActions.map((action) => ({
        kind: 'action' as const,
        ...action,
      }));
    }
    return [
      ...workspaceMatches.map((workspace) => ({ kind: 'workspace' as const, workspace })),
      ...envMatches.map((entry) => ({ kind: 'env' as const, entry })),
    ];
  }, [query, quickActions, workspaceMatches, envMatches]);

  const keyCounts = React.useMemo(
    () => (query.trim() ? countEnvKeys(envMatches) : new Map<string, number>()),
    [query, envMatches],
  );
  const isSearchMode = Boolean(query.trim());

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      if (!isMetaK) return;
      event.preventDefault();
      setIsOpen((prev) => !prev);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
      return;
    }
  }, [isOpen]);

  // Lazy env scan: only when user searches (debounced), skip heavy system vars in palette.
  React.useEffect(() => {
    if (!isOpen) return;
    const q = query.trim();
    if (q.length < 2) return;
    const handle = window.setTimeout(() => {
      void scanEnvVars({ includeSystem: false });
    }, 280);
    return () => window.clearTimeout(handle);
  }, [isOpen, query, scanEnvVars]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  React.useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, Math.max(listItems.length - 1, 0)));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (event.key !== 'Enter') return;

      const item = listItems[selectedIndex];
      if (!item) return;

      event.preventDefault();
      if (item.kind === 'env') {
        void copyEnvText(formatEnvCopy(item.entry, 'line')).then(() => setIsOpen(false));
      } else if (item.kind === 'workspace') {
        setActiveWorkspaceId(item.workspace.id);
        setWorkspacePanelExpanded(true);
        setIsOpen(false);
      } else {
        void item.run();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, listItems, selectedIndex, setActiveWorkspaceId, setWorkspacePanelExpanded]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-start justify-center bg-modal-backdrop px-4 pt-[14vh] backdrop-blur-sm">
      <div className="floating-panel w-full max-w-2xl rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/20">
              <Command className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{t('commandPalette.title')}</p>
              <p className="text-[11px] text-muted-foreground">{t('commandPalette.subtitleEnv')}</p>
            </div>
          </div>
          <NeonButton variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </NeonButton>
        </div>

        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('commandPalette.envSearchPlaceholder')}
          autoFocus
          className="mb-4"
        />

        {!isSearchMode && activeWorkspaceId ? (
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t('commandPalette.activeWorkspaceHint')}
          </p>
        ) : null}

        <div className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto">
          {listItems.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-xs text-muted-foreground">
              {t('envIndex.noMatches')}
            </p>
          ) : (
            listItems.map((item, idx) => {
              if (item.kind === 'action') {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`flex w-full items-center justify-between rounded-xl border p-3 transition-colors ${
                      idx === selectedIndex
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border bg-muted/40 hover:border-primary/40'
                    }`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => void item.run()}
                  >
                    <span className="flex items-center gap-3 text-sm text-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      {item.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{item.hint}</span>
                  </button>
                );
              }

              if (item.kind === 'workspace') {
                const active = item.workspace.id === activeWorkspaceId;
                return (
                  <button
                    key={`ws-${item.workspace.id}`}
                    type="button"
                    className={`flex w-full items-center justify-between rounded-xl border p-3 transition-colors ${
                      idx === selectedIndex
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border bg-muted/40 hover:border-primary/40'
                    }`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => {
                      setActiveWorkspaceId(item.workspace.id);
                      setWorkspacePanelExpanded(true);
                      setIsOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-3 text-sm text-foreground">
                      <Layers className="h-4 w-4 text-neon-blue" />
                      {t('commandPalette.switchWorkspace', { name: item.workspace.name })}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {active ? t('commandPalette.workspaceActive') : t('commandPalette.workspaceHint')}
                    </span>
                  </button>
                );
              }

              return (
                <div
                  key={`${item.entry.projectId}-${item.entry.filePath}-${item.entry.key}-${item.entry.lineNumber}`}
                  className={idx === selectedIndex ? 'rounded-xl ring-2 ring-primary/40' : ''}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <EnvVarRow
                    entry={item.entry}
                    compact
                    duplicateKey={(keyCounts.get(item.entry.key.toLowerCase()) ?? 0) > 1}
                    onCopied={() => setIsOpen(false)}
                  />
                </div>
              );
            })
          )}
        </div>

        {isSearchMode && envMatches.length > 0 ? (
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t('commandPalette.enterToCopyLine')}
          </p>
        ) : null}
      </div>
    </div>
  );
};
