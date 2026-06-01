import type { EnvCopyFormat, EnvVarEntry } from '@org/models';
import { SYSTEM_ENV_PROJECT_ID } from '@org/models';

export function isSystemEnvEntry(entry: EnvVarEntry): boolean {
  return entry.source === 'system' || entry.projectId === SYSTEM_ENV_PROJECT_ID;
}

export function envEntryId(entry: EnvVarEntry): string {
  return `${entry.projectId}:${entry.filePath}:${entry.key}:${entry.lineNumber}`;
}

export function formatEnvCopy(entry: EnvVarEntry, format: EnvCopyFormat): string {
  switch (format) {
    case 'key':
      return entry.key;
    case 'value':
      return entry.value;
    case 'line':
      return `${entry.key}=${entry.value}`;
  }
}

export function maskEnvValue(entry: EnvVarEntry): string {
  if (entry.isExample) return entry.value;
  if (!entry.value) return '';
  if (entry.value.length <= 4) return '••••';
  return `${entry.value.slice(0, 2)}${'•'.repeat(Math.min(entry.value.length - 4, 12))}${entry.value.slice(-2)}`;
}

export function filterEnvEntries(entries: EnvVarEntry[], query: string, projectId?: string): EnvVarEntry[] {
  const q = query.trim().toLowerCase();
  return entries.filter((entry) => {
    if (projectId === SYSTEM_ENV_PROJECT_ID) {
      if (!isSystemEnvEntry(entry)) return false;
    } else if (projectId && entry.projectId !== projectId) {
      return false;
    }
    if (!q) return true;
    return (
      entry.key.toLowerCase().includes(q) ||
      entry.value.toLowerCase().includes(q) ||
      entry.projectName.toLowerCase().includes(q) ||
      entry.fileName.toLowerCase().includes(q)
    );
  });
}

export function countEnvKeys(entries: EnvVarEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const k = entry.key.toLowerCase();
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

export function groupEnvEntriesByProject(
  entries: EnvVarEntry[],
  systemLabel = 'System',
): { projectId: string; projectName: string; items: EnvVarEntry[] }[] {
  const map = new Map<string, { projectName: string; items: EnvVarEntry[] }>();
  for (const entry of entries) {
    const projectId = isSystemEnvEntry(entry) ? SYSTEM_ENV_PROJECT_ID : entry.projectId;
    const projectName = isSystemEnvEntry(entry) ? systemLabel : entry.projectName;
    const bucket = map.get(projectId);
    if (bucket) {
      bucket.items.push(entry);
    } else {
      map.set(projectId, { projectName, items: [entry] });
    }
  }
  return [...map.entries()]
    .map(([projectId, { projectName, items }]) => ({
      projectId,
      projectName,
      items: items.sort((a, b) => a.key.localeCompare(b.key)),
    }))
    .sort((a, b) => {
      if (a.projectId === SYSTEM_ENV_PROJECT_ID) return -1;
      if (b.projectId === SYSTEM_ENV_PROJECT_ID) return 1;
      return a.projectName.localeCompare(b.projectName);
    });
}

export async function copyEnvText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
