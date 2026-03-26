import { AppSettings, EditorType, Group, Project } from '@org/models';
import { getProjectService, getSettingsService } from '@org/services';
import { create } from 'zustand';

interface ProjectState {
  projects: Project[];
  groups: Group[];
  settings: AppSettings | null;
  installedEditors: EditorType[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchData: () => Promise<void>;
  fetchInstalledEditors: () => Promise<void>;
  setDefaultEditor: (editor: EditorType) => Promise<void>;
  openProjectWithEditor: (path: string, editor: EditorType) => Promise<void>;
  scanDirectory: (path: string) => Promise<number>;
  registerProject: (path: string) => Promise<void>;

  removeProject: (id: string) => Promise<void>;
  openProject: (path: string) => Promise<void>;
  openSettingsWindow: () => Promise<void>;
  launchGroup: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  createGroup: () => Promise<string>;
  updateGroup: (group: Group) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  addProjectToGroup: (groupId: string, projectId: string) => Promise<void>;
  removeProjectFromGroup: (groupId: string, projectId: string) => Promise<void>;
}


const projectService = getProjectService();
const settingsService = getSettingsService();

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

  setDefaultEditor: async (editor) => {
    const { installedEditors, settings } = get();
    if (!installedEditors.includes(editor)) {
      set({ error: `Editor no disponible: ${editor}` });
      return;
    }

    try {
      const updated = await settingsService.updateSettings({ defaultEditor: editor });
      set({ settings: updated });
    } catch (err) {
      set({ error: (err as Error).message });
      if (settings) {
        set({ settings });
      }
    }
  },
  scanDirectory: async (path) => {
    set({ isLoading: true, error: null });
    try {
      const newProjects = await projectService.scanDirectory(path);
      set((state) => ({ 
        projects: mergeUniqueProjects(state.projects, newProjects),
        isLoading: false 
      }));
      return newProjects.length;
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
  },

  openProjectWithEditor: async (path, editor) => {
    try {
      await projectService.openInEditor(path, editor);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  launchGroup: async (id) => {
    await projectService.launchGroup(id);
  },

  openSettingsWindow: async () => {
    try {
      await projectService.openSettingsWindow();
    } catch (err) {
      set({ error: (err as Error).message });
    }
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
      `GRUPO ${String(groupNumber).padStart(3, '0')}`,
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
    set({
      groups: get().groups.map((g) => {
        if (g.id === groupId && !g.projectIds.includes(projectId)) {
          return { ...g, projectIds: [...g.projectIds, projectId] };
        }
        return g;
      }),
    });
  },

  removeProjectFromGroup: async (groupId, projectId) => {
    set({
      groups: get().groups.map((g) => {
        if (g.id === groupId) {
          return { ...g, projectIds: g.projectIds.filter((id) => id !== projectId) };
        }
        return g;
      }),
    });
  },
}));

