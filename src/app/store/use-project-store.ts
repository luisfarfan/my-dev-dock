import {
  AppSettings,
  EditorType,
  Group,
  Project,
  RaycastLauncherInput,
  RaycastLauncherResult,
} from '@org/models';
import { getProjectService, getSettingsService } from '@org/services';
import i18n from '@/app/i18n/i18n';
import { broadcastAppSettingsChanged } from '@/lib/tauri-multi-window-sync';
import { create } from 'zustand';

interface ProjectState {
  projects: Project[];
  groups: Group[];
  settings: AppSettings | null;
  installedEditors: EditorType[];
  isMinimalView: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchData: () => Promise<void>;
  fetchInstalledEditors: () => Promise<void>;
  detectRaycastInstallation: () => Promise<boolean>;
  refreshSettingsFromBackend: () => Promise<void>;
  setDefaultEditor: (editor: EditorType) => Promise<void>;
  patchSettings: (partial: Partial<AppSettings>) => Promise<void>;
  openProjectWithEditor: (path: string, editor: EditorType) => Promise<void>;
  exportRaycastLauncher: (input: RaycastLauncherInput) => Promise<RaycastLauncherResult>;
  scanDirectory: (path: string) => Promise<Project[]>;
  registerProject: (path: string) => Promise<void>;

  removeProject: (id: string) => Promise<void>;
  openProject: (path: string) => Promise<void>;
  launchGroup: (id: string) => Promise<void>;
  setMinimalView: (value: boolean) => Promise<void>;
  toggleMinimalView: () => Promise<void>;
  clearAll: () => Promise<void>;
  createGroup: () => Promise<string>;
  updateGroup: (group: Group) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addProjectToGroup: (groupId: string, projectId: string) => Promise<void>;
  removeProjectFromGroup: (groupId: string, projectId: string) => Promise<void>;
}


const projectService = getProjectService();
const settingsService = getSettingsService();
const MINIMAL_VIEW_STORAGE_KEY = 'dashboard:isMinimalView';

function getInitialMinimalView(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(MINIMAL_VIEW_STORAGE_KEY) === 'true';
}

function persistMinimalView(value: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MINIMAL_VIEW_STORAGE_KEY, String(value));
}

function mergeUniqueProjects(existing: Project[], incoming: Project[]): Project[] {
  const byId = new Map(existing.map((project) => [project.id, project]));
  for (const project of incoming) {
    byId.set(project.id, project);
  }
  return Array.from(byId.values());
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  groups: [],
  settings: null,
  installedEditors: [],
  isMinimalView: getInitialMinimalView(),
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [projects, groups, settings, installedEditors] = await Promise.all([
        projectService.getProjects(),
        projectService.getGroups(),
        settingsService.getSettings(),
        projectService.getInstalledEditors(),
      ]);
      set({ projects, groups, settings, installedEditors, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchInstalledEditors: async () => {
    try {
      const installedEditors = await projectService.getInstalledEditors();
      set({ installedEditors });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  detectRaycastInstallation: async () => {
    try {
      return await projectService.detectRaycastInstallation();
    } catch (err) {
      set({ error: (err as Error).message });
      return false;
    }
  },

  refreshSettingsFromBackend: async () => {
    try {
      const settings = await settingsService.getSettings();
      set({ settings });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setDefaultEditor: async (editor) => {
    const { installedEditors, settings } = get();
    if (!installedEditors.includes(editor)) {
      set({ error: i18n.t('errors.editorUnavailable', { editor }) });
      return;
    }

    try {
      const updated = await settingsService.updateSettings({ defaultEditor: editor });
      set({ settings: updated });
      void broadcastAppSettingsChanged();
    } catch (err) {
      set({ error: (err as Error).message });
      if (settings) {
        set({ settings });
      }
    }
  },

  patchSettings: async (partial) => {
    const prev = get().settings;
    try {
      const updated = await settingsService.updateSettings(partial);
      set({ settings: updated });
      void broadcastAppSettingsChanged();
    } catch (err) {
      set({ error: (err as Error).message });
      if (prev) set({ settings: prev });
    }
  },
  scanDirectory: async (path) => {
    set({ isLoading: true, error: null });
    try {
      const foundProjects = await projectService.scanDirectory(path);
      set((state) => ({ 
        projects: mergeUniqueProjects(state.projects, foundProjects),
        isLoading: false 
      }));
      return foundProjects;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },


  registerProject: async (path) => {
    try {
      const newProject = await projectService.registerProject(path);
      set({ projects: mergeUniqueProjects(get().projects, [newProject]) });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  removeProject: async (id) => {
    try {
      await projectService.removeProject(id);
      set({ projects: get().projects.filter((p) => p.id !== id) });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  openProject: async (path) => {
    const { settings } = get();
    if (!settings) return;
    await projectService.openInEditor(path, settings.defaultEditor);
    try {
      const projects = await projectService.getProjects();
      set({ projects: [...projects] });
    } catch {
      /* ignore refresh errors */
    }
  },

  openProjectWithEditor: async (path, editor) => {
    try {
      await projectService.openInEditor(path, editor);
      try {
        const projects = await projectService.getProjects();
        set({ projects: [...projects] });
      } catch {
        /* ignore */
      }
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  exportRaycastLauncher: async (input) => {
    try {
      const result = await projectService.exportRaycastLauncher(input);
      const [projects, groups] = await Promise.all([
        projectService.getProjects(),
        projectService.getGroups(),
      ]);
      set({ projects, groups });
      return result;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  launchGroup: async (id) => {
    try {
      await projectService.launchGroup(id);
      try {
        const projects = await projectService.getProjects();
        set({ projects: [...projects] });
      } catch {
        /* ignore refresh */
      }
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setMinimalView: async (value) => {
    persistMinimalView(value);
    set({ isMinimalView: value });
    try {
      await projectService.setWidgetMode(value);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  toggleMinimalView: async () => {
    const nextValue = !get().isMinimalView;
    await get().setMinimalView(nextValue);
  },

  clearAll: async () => {
    try {
      await projectService.clearAll();
      set({ projects: [], groups: [] });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  createGroup: async () => {
    const existingGroups = get().groups;
    const groupNumber = existingGroups.length + 1;
    const newGroup = await projectService.createGroup(
      i18n.t('groups.defaultName', { n: String(groupNumber).padStart(3, '0') }),
      [],
    );
    set({ groups: [...existingGroups, newGroup] });
    return newGroup.id;
  },

  updateGroup: async (updatedGroup) => {
    const persisted = await projectService.updateGroup(updatedGroup);
    set({
      groups: get().groups.map((g) => (g.id === persisted.id ? persisted : g)),
    });
  },

  deleteGroup: async (id) => {
    await projectService.deleteGroup(id);
    set({
      groups: get().groups.filter((g) => g.id !== id),
    });
  },

  addProjectToGroup: async (groupId, projectId) => {
    const prevGroups = get().groups;
    const group = prevGroups.find((g) => g.id === groupId);
    if (!group || group.projectIds.includes(projectId)) return;

    const updated = { ...group, projectIds: [...group.projectIds, projectId] };
    set({
      groups: prevGroups.map((g) => (g.id === groupId ? updated : g)),
    });

    try {
      const persisted = await projectService.updateGroup(updated);
      set({
        groups: get().groups.map((g) => (g.id === groupId ? persisted : g)),
      });
    } catch (err) {
      set({ error: (err as Error).message, groups: prevGroups });
    }
  },

  removeProjectFromGroup: async (groupId, projectId) => {
    const prevGroups = get().groups;
    const group = prevGroups.find((g) => g.id === groupId);
    if (!group) return;

    const updated = { ...group, projectIds: group.projectIds.filter((id) => id !== projectId) };
    set({
      groups: prevGroups.map((g) => (g.id === groupId ? updated : g)),
    });

    try {
      const persisted = await projectService.updateGroup(updated);
      set({
        groups: get().groups.map((g) => (g.id === groupId ? persisted : g)),
      });
    } catch (err) {
      set({ error: (err as Error).message, groups: prevGroups });
    }
  },
}));

