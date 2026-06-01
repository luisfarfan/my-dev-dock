import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound, RefreshCw, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Project } from '@org/models';
import { NeonButton, SearchInput } from '@org/ui-kit';
import { EnvVarRow } from '@/app/features/env-index/components/env-var-row';
import { useEnvIndexStore } from '@/app/store/use-env-index-store';
import {
  countEnvKeys,
  filterEnvEntries,
  groupEnvEntriesByProject,
} from '@/lib/env-index-utils';
import { SYSTEM_ENV_PROJECT_ID } from '@org/models';

export interface EnvIndexDrawerProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  initialProjectId?: string | null;
}

const ENV_DRAWER_RENDER_LIMIT = 100;

export const EnvIndexDrawer: React.FC<EnvIndexDrawerProps> = ({
  open,
  onClose,
  projects,
  initialProjectId = null,
}) => {
  const { t } = useTranslation();
  const { entries, isLoading, error, scanEnvVars } = useEnvIndexStore();
  const [query, setQuery] = React.useState('');
  const [projectFilter, setProjectFilter] = React.useState<string>('all');
  const [renderLimit, setRenderLimit] = React.useState(ENV_DRAWER_RENDER_LIMIT);

  React.useEffect(() => {
    setRenderLimit(ENV_DRAWER_RENDER_LIMIT);
  }, [query, projectFilter]);

  React.useEffect(() => {
    if (!open) return;
    setProjectFilter(initialProjectId ?? 'all');
    void scanEnvVars({ includeSystem: true });
  }, [open, initialProjectId, scanEnvVars]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const keyCounts = React.useMemo(() => countEnvKeys(entries), [entries]);
  const filtered = React.useMemo(
    () =>
      filterEnvEntries(
        entries,
        query,
        projectFilter === 'all' ? undefined : projectFilter,
      ),
    [entries, query, projectFilter],
  );
  const visibleFiltered = React.useMemo(
    () => (filtered.length > renderLimit ? filtered.slice(0, renderLimit) : filtered),
    [filtered, renderLimit],
  );
  const grouped = React.useMemo(
    () => groupEnvEntriesByProject(visibleFiltered, t('envIndex.systemSource')),
    [visibleFiltered, t],
  );
  const hasMoreRows = filtered.length > visibleFiltered.length;

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="env-drawer-backdrop"
            type="button"
            aria-label={t('envIndex.close')}
            className="fixed inset-0 z-100 bg-modal-backdrop backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="env-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="env-index-title"
            className="fixed right-0 top-0 z-110 flex h-full w-full max-w-xl flex-col border-l border-border bg-card/95 shadow-2xl backdrop-blur-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-blue/30 bg-neon-blue/10">
                  <KeyRound className="h-5 w-5 text-neon-blue" />
                </div>
                <div>
                  <h2 id="env-index-title" className="text-lg font-black uppercase tracking-widest text-foreground">
                    {t('envIndex.title')}
                  </h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">{t('envIndex.subtitle')}</p>
                  {(projectFilter === 'all' || projectFilter === SYSTEM_ENV_PROJECT_ID) &&
                  entries.some((e) => e.source === 'system' || e.projectId === SYSTEM_ENV_PROJECT_ID) ? (
                    <p className="mt-2 text-[10px] text-muted-foreground/90">{t('envIndex.systemHint')}</p>
                  ) : null}
                </div>
              </div>
              <NeonButton variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onClose}>
                <X className="h-4 w-4" />
              </NeonButton>
            </header>

            <div className="space-y-3 border-b border-border px-5 py-4">
              <SearchInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('envIndex.searchPlaceholder')}
                autoFocus
              />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="h-9 rounded-lg border border-border bg-input px-3 text-xs font-bold text-foreground focus:border-primary/50 focus:outline-none"
                >
                  <option value="all">{t('envIndex.allProjects')}</option>
                  <option value={SYSTEM_ENV_PROJECT_ID}>{t('envIndex.systemSource')}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <NeonButton
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 text-[10px] font-black uppercase tracking-wider"
                  disabled={isLoading}
                  onClick={() => void scanEnvVars({ includeSystem: true, force: true })}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  {t('envIndex.reindex')}
                </NeonButton>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {t('envIndex.count', { count: filtered.length })}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {isLoading && entries.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">{t('envIndex.loading')}</p>
              ) : null}
              {error ? (
                <p className="rounded-xl border border-neon-red/30 bg-neon-red/10 px-3 py-2 text-xs text-neon-red">
                  {error}
                </p>
              ) : null}
              {!isLoading && !error && filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">{t('envIndex.empty')}</p>
              ) : null}

              <div className="space-y-6">
                {grouped.map((group) => (
                  <section key={group.projectId}>
                    <h3 className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      {group.projectName}
                      <span className="ml-2 text-primary/70">{group.items.length}</span>
                    </h3>
                    <div className="space-y-2">
                      {group.items.map((entry) => (
                        <EnvVarRow
                          key={`${entry.projectId}-${entry.filePath}-${entry.key}-${entry.lineNumber}`}
                          entry={entry}
                          duplicateKey={(keyCounts.get(entry.key.toLowerCase()) ?? 0) > 1}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {hasMoreRows ? (
                <div className="mt-6 flex justify-center">
                  <NeonButton
                    variant="outline"
                    size="sm"
                    className="text-[10px] font-black uppercase tracking-wider"
                    onClick={() => setRenderLimit((n) => n + ENV_DRAWER_RENDER_LIMIT)}
                  >
                    {t('envIndex.showMore', {
                      shown: visibleFiltered.length,
                      total: filtered.length,
                    })}
                  </NeonButton>
                </div>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};
