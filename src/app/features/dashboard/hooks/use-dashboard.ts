import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useActiveWorkspaceStore } from '@/app/store/use-active-workspace-store';
import { useProjectStore } from '@/app/store/use-project-store';
import { projectSortSubtitle, sortProjectsBySettings } from '@/lib/project-sort';

export function useDashboard() {
  const { t, i18n } = useTranslation();
  const {
    projects,
    groups,
    workspaces,
    settings,
    installedEditors,
    isMinimalView,
    isLoading,
    fetchData,
    fetchInstalledEditors,
    detectRaycastInstallation,
    setDefaultEditor,
    patchSettings,
    openProjectWithEditor,
    exportRaycastLauncher,
    scanDirectory,
    openProject,

    removeProject,
    registerProject,
    launchGroup,
    setMinimalView,
    toggleMinimalView,
    clearAll,

    createGroup,
    updateGroup,
    deleteGroup,
    addProjectToGroup,
    removeProjectFromGroup,

    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useProjectStore();

  const activeWorkspaceId = useActiveWorkspaceStore((s) => s.activeWorkspaceId);
  const setActiveWorkspaceId = useActiveWorkspaceStore((s) => s.setActiveWorkspaceId);

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) ?? null,
    [workspaces, activeWorkspaceId],
  );

  useEffect(() => {
    if (activeWorkspaceId && !workspaces.some((w) => w.id === activeWorkspaceId)) {
      setActiveWorkspaceId(null);
    }
  }, [activeWorkspaceId, workspaces, setActiveWorkspaceId]);

  const workspaceProjects = useMemo(() => {
    if (!activeWorkspace) return [];
    const idSet = new Set(activeWorkspace.projectIds);
    const items = projects.filter((p) => idSet.has(p.id));
    if (!settings) return items;
    return sortProjectsBySettings(items, settings);
  }, [activeWorkspace, projects, settings]);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [dndActiveGroupId, setDndActiveGroupId] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 140);
    return () => window.clearTimeout(handle);
  }, [searchQuery]);

  const filteredProjects = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase();
    let filtered = projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q),
    );
    if (!settings) return filtered;
    return sortProjectsBySettings(filtered, settings);
  }, [projects, debouncedSearchQuery, settings]);

  const totalProjectCount = projects.length;

  const projectSortLabel = useMemo(
    () => (settings ? projectSortSubtitle(settings, t) : ''),
    [settings, t, i18n.language],
  );

  return {
    projects: filteredProjects,
    allProjects: projects,
    totalProjectCount,
    projectSortLabel,
    groups,
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
    workspaceProjects,
    settings,
    installedEditors,
    isLoading,
    isMinimalView,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    openProject,
    openProjectWithEditor,
    removeProject,
    registerProject,
    scanDirectory,
    launchGroup,
    setMinimalView,
    toggleMinimalView,
    clearAll,
    fetchData,
    fetchInstalledEditors,
    detectRaycastInstallation,
    setDefaultEditor,
    patchSettings,
    exportRaycastLauncher,

    createGroup,
    updateGroup,
    deleteGroup,
    addProjectToGroup,
    removeProjectFromGroup,
    isCreatingGroup,
    setIsCreatingGroup,
    editingGroupId,
    setEditingGroupId,
    dndActiveGroupId,
    setDndActiveGroupId,

    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  };
}
