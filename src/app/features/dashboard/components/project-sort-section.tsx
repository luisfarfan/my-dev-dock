import { Check } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AppSettings, SortField } from '@org/models';
import { normalizeSortField } from '@/lib/project-sort';

const SORT_VALUES: SortField[] = ['lastOpenedAt', 'lastCommitAt', 'name', 'addedAt', 'status'];

export interface ProjectSortSectionProps {
  settings: AppSettings | null;
  onPatchSettings: (partial: Partial<AppSettings>) => void;
}

export const ProjectSortSection: React.FC<ProjectSortSectionProps> = ({
  settings,
  onPatchSettings,
}) => {
  const { t } = useTranslation();
  if (!settings) return null;

  const effectiveSortBy = normalizeSortField(settings.sortBy);

  return (
    <section className="space-y-3 mt-6">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{t('sort.sectionTitle')}</h3>
      <p className="text-[11px] text-muted-foreground">{t('sort.sectionHint')}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {SORT_VALUES.map((value) => {
          const selected = effectiveSortBy === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onPatchSettings({ sortBy: value })}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                selected
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-muted/40 hover:border-primary/25'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{t(`sort.options.${value}.label`)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{t(`sort.options.${value}.hint`)}</p>
                </div>
                {selected && (
                  <div className="w-7 h-7 shrink-0 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground self-center mr-1">
          {t('sort.direction')}
        </span>
        {(
          [
            { value: 'desc' as const, labelKey: 'sort.desc' as const },
            { value: 'asc' as const, labelKey: 'sort.asc' as const },
          ] as const
        ).map((opt) => {
          const selected = settings.sortDirection === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPatchSettings({ sortDirection: opt.value })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                selected
                  ? 'border-primary/50 bg-primary/10 text-foreground'
                  : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/25'
              }`}
            >
              {t(opt.labelKey)}
            </button>
          );
        })}
      </div>
    </section>
  );
};
