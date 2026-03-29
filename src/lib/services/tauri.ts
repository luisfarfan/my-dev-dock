import { invoke } from '@tauri-apps/api/core';
import {
  Project,
  Group,
  AppSettings,
  EditorType,
  RaycastLauncherInput,
  RaycastLauncherResult,
} from '@org/models';
import { ProjectService, SettingsService } from './interfaces';

export class TauriProjectService implements ProjectService {
  async getProjects(): Promise<Project[]> {
    return invoke<Project[]>('get_projects');
  }

  async getGroups(): Promise<Group[]> {
    return invoke<Group[]>('get_groups');
  }

  async getInstalledEditors(): Promise<EditorType[]> {
    return invoke<EditorType[]>('get_installed_editors');
  }

  async scanDirectory(basePath: string): Promise<Project[]> {
    return await invoke<Project[]>('scan_directory', { basePath });
  }

  async registerProject(path: string): Promise<Project> {
    return await invoke<Project>('register_project', { path });
  }

  async removeProject(id: string): Promise<void> {
    await invoke('remove_project', { id });
  }

  async createGroup(name: string, projectIds: string[]): Promise<Group> {
    return await invoke<Group>('create_group', { name, projectIds });
  }

  async updateGroup(group: Group): Promise<Group> {
    return await invoke<Group>('update_group', { group });
  }

  async deleteGroup(id: string): Promise<void> {
    await invoke('delete_group', { id });
  }

  async clearAll(): Promise<void> {
    await invoke('clear_all');
  }

  async openInEditor(path: string, editor: EditorType): Promise<void> {
    await invoke('open_in_editor', { path, editor });
  }

  async launchProject(path: string): Promise<void> {
    await invoke('launch_project', { path });
  }

  async launchGroup(groupId: string): Promise<void> {
    await invoke('launch_group', { groupId });
  }

  async syncProject(id: string): Promise<Project> {
    return await invoke<Project>('sync_project', { id });
  }

  async detectRaycastInstallation(): Promise<boolean> {
    return invoke<boolean>('detect_raycast_installation');
  }

  async exportRaycastLauncher(input: RaycastLauncherInput): Promise<RaycastLauncherResult> {
    return invoke<RaycastLauncherResult>('export_raycast_launcher', { input });
  }
}

export class TauriSettingsService implements SettingsService {
  async getSettings(): Promise<AppSettings> {
    return invoke<AppSettings>('get_settings');
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    return invoke<AppSettings>('update_settings', { settings });
  }
}
