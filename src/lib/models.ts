/**
 * Estado del repositorio Git.
 * Determina el color del glow en la UI.
 */
export type GitStatusType = 'clean' | 'uncommitted' | 'unpushed' | 'error';

/**
 * Tecnologías detectables por el sistema.
 */
export type StackType =
  | 'react'
  | 'angular'
  | 'vue'
  | 'nextjs'
  | 'nuxt'
  | 'svelte'
  | 'node'
  | 'express'
  | 'nestjs'
  | 'python'
  | 'django'
  | 'flask'
  | 'fastapi'
  | 'rust'
  | 'go'
  | 'java'
  | 'kotlin'
  | 'ruby'
  | 'rails'
  | 'typescript'
  | 'javascript'
  | 'docker'
  | 'kubernetes'
  | 'terraform'
  | 'flutter'
  | 'dart'
  | 'swift'
  | 'nx'
  | 'vite'
  | 'webpack'
  | 'tailwindcss'
  | 'graphql'
  | 'mongodb'
  | 'postgresql'
  | 'redis';

/**
 * Información del estado de Git de un proyecto.
 */
export interface GitInfo {
  branch: string;
  lastCommit: string;
  /** ISO 8601 timestamp from `git log -1`, when available */
  lastCommitAt?: string;
  status: GitStatusType;
  changesCount: number;
}

/**
 * Representa un proyecto local registrado en la aplicación.
 */
export interface Project {
  id: string;
  name: string;
  path: string;
  stack: StackType[];
  git: GitInfo;
  probableEditor?: EditorType;
  addedAt: string;
  /** Set when the project is opened from Dev Hub (ISO 8601) */
  lastOpenedAt?: string;
  /** Path to last Raycast script exported for this project (for cleanup on remove) */
  raycastLauncherPath?: string;
}

/**
 * Un grupo de proyectos que se pueden lanzar juntos.
 */
export interface Group {
  id: string;
  name: string;
  projectIds: string[];
  color?: string;
  /** Path to last Raycast script exported for this group (for cleanup on delete) */
  raycastLauncherPath?: string;
}

export type EditorType =
  | 'vscode'
  | 'cursor'
  | 'antigravity'
  | 'zed'
  | 'webstorm'
  | 'sublime'
  | 'neovim';

export type SortField = 'name' | 'addedAt' | 'lastCommitAt' | 'lastOpenedAt' | 'status';

export interface AppSettings {
  defaultEditor: EditorType;
  gitPollInterval: number;
  launchDelay: number;
  /** May include legacy `lastCommit` from older persisted state */
  sortBy: SortField | 'lastCommit';
  sortDirection: 'asc' | 'desc';
  raycastScriptsPath?: string;
}

export type RaycastLauncherTargetType = 'project' | 'group';

export interface RaycastLauncherInput {
  targetType: RaycastLauncherTargetType;
  targetId: string;
  title: string;
  filename: string;
  icon?: string;
  keywords?: string[];
  editor?: EditorType;
}

export interface RaycastLauncherResult {
  filePath: string;
  overwritten: boolean;
}
