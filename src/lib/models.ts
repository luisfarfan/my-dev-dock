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
  /** User override for terminal run command (e.g. `bun run dev`). */
  runCommand?: string;
}

export type TerminalId =
  | 'iterm'
  | 'warp'
  | 'ghostty'
  | 'wezterm'
  | 'alacritty'
  | 'kitty'
  | 'terminal';

export interface TerminalInfo {
  id: TerminalId;
  name: string;
  installed: boolean;
}

export type RunCommandSource = 'custom' | 'detected' | 'none';
export type RunCommandConfidence = 'high' | 'medium' | 'low';

export interface RunCommandResolution {
  command?: string;
  scriptName?: string;
  packageManager?: string;
  source: RunCommandSource;
  confidence: RunCommandConfidence;
}

export interface RunProjectResult {
  projectId: string;
  projectName: string;
  command: string;
  terminalId: string;
  sessionId?: string;
  success: boolean;
  error?: string;
}

export type RunSessionStatus = 'running' | 'exited';

export interface RunSession {
  id: string;
  projectId: string;
  projectName: string;
  command: string;
  cwd: string;
  pid?: number;
  status: RunSessionStatus;
  startedAt: string;
  exitCode?: number;
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
  defaultTerminal?: TerminalId;
  minimizeTerminalOnRun?: boolean;
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

/** One variable from a project `.env*` file or the OS process environment (never persisted in hub JSON). */
export type EnvVarSource = 'project' | 'system';

export const SYSTEM_ENV_PROJECT_ID = '__system__';

export interface EnvVarEntry {
  projectId: string;
  projectName: string;
  projectPath: string;
  fileName: string;
  filePath: string;
  key: string;
  value: string;
  lineNumber: number;
  /** True for `.env.example` and similar non-secret templates. */
  isExample: boolean;
  /** `project` (default) or `system` — vars from the running process / OS. */
  source?: EnvVarSource;
}

export type EnvCopyFormat = 'key' | 'value' | 'line';

export type WorkspaceColor = 'green' | 'blue' | 'yellow' | 'red';
export type WorkspaceIcon = 'briefcase' | 'building' | 'layers' | 'folder';

/** Saved filter/collection of projects (client, prefix, etc.). */
export interface Workspace {
  id: string;
  name: string;
  matchQuery: string;
  projectIds: string[];
  includePathMatch: boolean;
  color?: WorkspaceColor;
  icon?: WorkspaceIcon;
  createdAt: string;
}
