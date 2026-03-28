import { Check } from 'lucide-react';
import React from 'react';
import type { AppSettings, SortField } from '@org/models';
import { normalizeSortField } from '@/lib/project-sort';

const SORT_OPTIONS: { value: SortField; label: string; hint: string }[] = [
  { value: 'lastOpenedAt', label: 'Última apertura', hint: 'Desde Dev Hub (MRU)' },
  { value: 'lastCommitAt', label: 'Último commit Git', hint: 'Fecha del último commit' },
  { value: 'name', label: 'Nombre', hint: 'Alfabético por carpeta' },
  { value: 'addedAt', label: 'Registro', hint: 'Cuándo se añadió al hub' },
  { value: 'status', label: 'Estado Git', hint: 'Limpio / cambios / sin push' },
];

export interface ProjectSortSectionProps {
  settings: AppSettings | null;
  onPatchSettings: (partial: Partial<AppSettings>) => void;
}

export const ProjectSortSection: React.FC<ProjectSortSectionProps> = ({
  settings,
  onPatchSettings,
}) => {
  if (!settings) return null;

  const effectiveSortBy = normalizeSortField(settings.sortBy);

  return (
    <section className="space-y-3 mt-6">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Orden de proyectos</h3>
      <p className="text-[11px] text-muted-foreground">
        Cómo se listan los proyectos en el dashboard (tras filtrar por búsqueda).
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {SORT_OPTIONS.map((opt) => {
          const selected = effectiveSortBy === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPatchSettings({ sortBy: opt.value })}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                selected
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-muted/40 hover:border-primary/25'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{opt.hint}</p>
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
          Dirección
        </span>
        {(
          [
            { value: 'desc' as const, label: 'Descendente' },
            { value: 'asc' as const, label: 'Ascendente' },
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
              {opt.label}
            </button>
          );
        })}
      </div>
    </section>
  );
};
