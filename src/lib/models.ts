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
}

/**
 * Un grupo de proyectos que se pueden lanzar juntos.
 */
export interface Group {
  id: string;
  name: string;
  projectIds: string[];
  color?: string;
}

export type EditorType =
  | 'vscode'
  | 'cursor'
  | 'antigravity'
  | 'zed'
  | 'webstorm'
  | 'sublime'
  | 'neovim';

export type SortField = 'name' | 'addedAt' | 'lastCommit' | 'status';

export interface AppSettings {
  defaultEditor: EditorType;
  gitPollInterval: number;
  launchDelay: number;
  sortBy: SortField;
  sortDirection: 'asc' | 'desc';
}
