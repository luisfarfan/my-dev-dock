import { Project, Group, AppSettings, EditorType } from '@org/models';
import { ProjectService, SettingsService } from './interfaces';

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'dev-hub',
    path: '/Users/lucho/projects/me/dev-hub',
    stack: ['react', 'rust', 'nx', 'tailwindcss'],
    git: {
      branch: 'main',
      lastCommit: 'feat: add neon glass theme',
      status: 'clean',
      changesCount: 0,
    },
    addedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'tauri-app',
    path: '/Users/lucho/projects/tauri-app',
    stack: ['vue', 'rust'],
    git: {
      branch: 'develop',
      lastCommit: 'fix: types for cargo',
      status: 'uncommitted',
      changesCount: 5,
    },
    addedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'api-service',
    path: '/Users/lucho/projects/api-service',
    stack: ['nestjs', 'postgresql', 'redis'],
    git: {
      branch: 'feat/auth',
      lastCommit: 'feat: implement jwt',
      status: 'unpushed',
      changesCount: 0,
    },
    addedAt: new Date().toISOString(),
  },
];

const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Core Services',
    projectIds: ['1', '3'],
    color: '#00FF88',
  },
];

const MOCK_SETTINGS: AppSettings = {
  defaultEditor: 'cursor',
  gitPollInterval: 5000,
  launchDelay: 1000,
  sortBy: 'name',
  sortDirection: 'asc',
};

export class MockProjectService implements ProjectService {
  async getProjects(): Promise<Project[]> {
    return MOCK_PROJECTS;
  }

  async getGroups(): Promise<Group[]> {
    return MOCK_GROUPS;
  }

  async getInstalledEditors(): Promise<EditorType[]> {
    return ['cursor', 'vscode', 'zed'];
  }

  async scanDirectory(basePath: string): Promise<Project[]> {
    const name = basePath.split('/').filter(Boolean).pop() || 'folder';
    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      name,
      path: basePath,
      stack: ['typescript'],
      git: {
        branch: 'main',
        lastCommit: '—',
        status: 'clean',
        changesCount: 0,
      },
      addedAt: new Date().toISOString(),
    };
    MOCK_PROJECTS.push(newProject);
    return [newProject];
  }

  async registerProject(path: string): Promise<Project> {
    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      name: path.split('/').pop() || 'new-project',
      path,
      stack: ['typescript'],
      git: {
        branch: 'main',
        lastCommit: 'initial commit',
        status: 'clean',
        changesCount: 0,
      },
      addedAt: new Date().toISOString(),
    };
    MOCK_PROJECTS.push(newProject);
    return newProject;
  }

  async removeProject(id: string): Promise<void> {
    const index = MOCK_PROJECTS.findIndex((p) => p.id === id);
    if (index !== -1) MOCK_PROJECTS.splice(index, 1);
  }

  async createGroup(name: string, projectIds: string[]): Promise<Group> {
    const newGroup: Group = {
      id: Math.random().toString(36).substring(7),
      name,
      projectIds,
    };
    MOCK_GROUPS.push(newGroup);
    return newGroup;
  }

  async updateGroup(group: Group): Promise<Group> {
    const idx = MOCK_GROUPS.findIndex((g) => g.id === group.id);
    if (idx === -1) throw new Error('Group not found');
    MOCK_GROUPS[idx] = group;
    return group;
  }

  async deleteGroup(id: string): Promise<void> {
    const idx = MOCK_GROUPS.findIndex((g) => g.id === id);
    if (idx !== -1) MOCK_GROUPS.splice(idx, 1);
  }

  async clearAll(): Promise<void> {
    MOCK_PROJECTS.splice(0, MOCK_PROJECTS.length);
    MOCK_GROUPS.splice(0, MOCK_GROUPS.length);
  }

  async openInEditor(path: string, editor: EditorType): Promise<void> {
    console.log(`[MOCK] Opening ${path} in ${editor}`);
  }

  async launchProject(path: string): Promise<void> {
    console.log(`[MOCK] Launching project at ${path}`);
  }

  async launchGroup(groupId: string): Promise<void> {
    console.log(`[MOCK] Launching group ${groupId}`);
  }

  async syncProject(id: string): Promise<Project> {
    const project = MOCK_PROJECTS.find((p) => p.id === id);
    if (!project) throw new Error('Project not found');
    return project;
  }
}

export class MockSettingsService implements SettingsService {
  async getSettings(): Promise<AppSettings> {
    return MOCK_SETTINGS;
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    Object.assign(MOCK_SETTINGS, settings);
    return MOCK_SETTINGS;
  }
}
