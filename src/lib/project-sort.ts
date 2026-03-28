import type { AppSettings, Project, SortField } from '@org/models';
import type { TFunction } from 'i18next';

/** Maps legacy persisted `sortBy` values to current fields. */
export function normalizeSortField(sortBy: string): SortField {
  if (sortBy === 'lastCommit') return 'lastCommitAt';
  const allowed: SortField[] = ['name', 'addedAt', 'lastCommitAt', 'lastOpenedAt', 'status'];
  if (allowed.includes(sortBy as SortField)) return sortBy as SortField;
  return 'name';
}

function parseTs(iso?: string): number {
  if (!iso) return NaN;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? NaN : t;
}

/** Missing dates sort after dated rows; both missing tie-break by name. */
function compareOptionalTimestamps(
  va: number,
  vb: number,
  nameA: string,
  nameB: string,
  direction: 'asc' | 'desc',
): number {
  const aBad = Number.isNaN(va);
  const bBad = Number.isNaN(vb);
  if (aBad && bBad) return nameA.localeCompare(nameB);
  if (aBad) return 1;
  if (bBad) return -1;
  const dir = direction === 'asc' ? 1 : -1;
  return dir * (va - vb);
}

function compareProjectsPair(
  a: Project,
  b: Project,
  field: SortField,
  direction: 'asc' | 'desc',
): number {
  const dir = direction === 'asc' ? 1 : -1;

  switch (field) {
    case 'name':
      return dir * a.name.localeCompare(b.name);
    case 'addedAt': {
      const va = parseTs(a.addedAt);
      const vb = parseTs(b.addedAt);
      return compareOptionalTimestamps(va, vb, a.name, b.name, direction);
    }
    case 'lastOpenedAt': {
      const va = parseTs(a.lastOpenedAt);
      const vb = parseTs(b.lastOpenedAt);
      return compareOptionalTimestamps(va, vb, a.name, b.name, direction);
    }
    case 'lastCommitAt': {
      const va = parseTs(a.git.lastCommitAt);
      const vb = parseTs(b.git.lastCommitAt);
      return compareOptionalTimestamps(va, vb, a.name, b.name, direction);
    }
    case 'status': {
      const order: Record<string, number> = {
        clean: 0,
        uncommitted: 1,
        unpushed: 2,
        error: 3,
      };
      const va = order[a.git.status] ?? 99;
      const vb = order[b.git.status] ?? 99;
      const cmp = va - vb;
      if (cmp !== 0) return dir * cmp;
      return dir * a.name.localeCompare(b.name);
    }
    default:
      return a.name.localeCompare(b.name);
  }
}

export function sortProjectsBySettings(projects: Project[], settings: AppSettings): Project[] {
  const field = normalizeSortField(settings.sortBy);
  const direction = settings.sortDirection;
  return [...projects].sort((a, b) => compareProjectsPair(a, b, field, direction));
}

export function projectSortSubtitle(settings: AppSettings, t: TFunction): string {
  const field = normalizeSortField(settings.sortBy);
  const asc = settings.sortDirection === 'asc';

  const fieldLabel = t(`sort.fieldLabels.${field}`);
  const tailKey =
    field === 'name'
      ? asc
        ? 'sort.tail.nameAsc'
        : 'sort.tail.nameDesc'
      : field === 'status'
        ? asc
          ? 'sort.tail.statusAsc'
          : 'sort.tail.statusDesc'
        : asc
          ? 'sort.tail.dateAsc'
          : 'sort.tail.dateDesc';

  return t('sort.subtitleLine', { field: fieldLabel, tail: t(tailKey) });
}
