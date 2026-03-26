import { Project, Group, AppSettings, EditorType } from '@org/models';

/**
 * Interface that all implementations of the project service must follow.
 * This allows swapping the real Tauri bridge with a mock during development.
 */
export interface ProjectService {
  getProjects(): Promise<Project[]>;
  getGroups(): Promise<Group[]>;
  getInstalledEditors(): Promise<EditorType[]>;
  scanDirectory(basePath: string): Promise<Project[]>;
  registerProject(path: string): Promise<Project>;
  removeProject(id: string): Promise<void>;
  createGroup(name: string, projectIds: string[]): Promise<Group>;
  updateGroup(group: Group): Promise<Group>;
  deleteGroup(id: string): Promise<void>;
  clearAll(): Promise<void>;
  openInEditor(path: string, editor: EditorType): Promise<void>;
  launchProject(path: string): Promise<void>;
  launchGroup(groupId: string): Promise<void>;
  openSettingsWindow(): Promise<void>;
  syncProject(id: string): Promise<Project>;
}

export interface SettingsService {
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
}
