import type { Project } from '@org/models';

export type WorkspaceMatchReason = 'prefix' | 'name' | 'path';

export interface WorkspaceSuggestion {
  project: Project;
  score: number;
  reason: WorkspaceMatchReason;
}

export function suggestWorkspaceProjects(
  projects: Project[],
  query: string,
  includePathMatch: boolean,
): WorkspaceSuggestion[] {
  const token = query.trim().toLowerCase();
  if (!token) return [];

  const results: WorkspaceSuggestion[] = [];
  for (const project of projects) {
    const name = project.name.toLowerCase();
    const path = project.path.toLowerCase();
    let score = 0;
    let reason: WorkspaceMatchReason = 'name';

    if (name.startsWith(token)) {
      score = 100;
      reason = 'prefix';
    } else if (name.includes(token)) {
      score = 70;
      reason = 'name';
    } else if (includePathMatch && path.includes(token)) {
      score = 50;
      reason = 'path';
    }

    if (score > 0) {
      results.push({ project, score, reason });
    }
  }

  return results.sort(
    (a, b) => b.score - a.score || a.project.name.localeCompare(b.project.name),
  );
}

/** Pre-check high-confidence name matches when creating a workspace. */
export function defaultWorkspaceSelection(suggestions: WorkspaceSuggestion[]): string[] {
  return suggestions.filter((s) => s.score >= 70).map((s) => s.project.id);
}

export function countPendingWorkspaceMatches(
  workspace: { matchQuery: string; includePathMatch: boolean; projectIds: string[] },
  projects: Project[],
): number {
  const selected = new Set(workspace.projectIds);
  return suggestWorkspaceProjects(projects, workspace.matchQuery, workspace.includePathMatch).filter(
    (s) => !selected.has(s.project.id),
  ).length;
}

export const WORKSPACE_COLOR_STYLES: Record<
  'green' | 'blue' | 'yellow' | 'red',
  { border: string; bg: string; text: string; glow: string }
> = {
  green: {
    border: 'border-primary/50',
    bg: 'bg-primary/15',
    text: 'text-primary',
    glow: 'shadow-[0_0_20px_-6px_rgba(0,255,136,0.45)]',
  },
  blue: {
    border: 'border-neon-blue/50',
    bg: 'bg-neon-blue/15',
    text: 'text-neon-blue',
    glow: 'shadow-[0_0_20px_-6px_rgba(0,107,255,0.45)]',
  },
  yellow: {
    border: 'border-neon-yellow/50',
    bg: 'bg-neon-yellow/15',
    text: 'text-neon-yellow',
    glow: 'shadow-[0_0_20px_-6px_rgba(255,215,0,0.35)]',
  },
  red: {
    border: 'border-neon-red/40',
    bg: 'bg-neon-red/10',
    text: 'text-neon-red',
    glow: 'shadow-[0_0_20px_-6px_rgba(255,68,68,0.35)]',
  },
};
