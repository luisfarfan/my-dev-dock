import { useMemo, useState } from 'react';
import { useProjectStore } from '@/app/store/use-project-store';
import { projectSortSubtitle, sortProjectsBySettings } from '@/lib/project-sort';

export function useDashboard() {
  const { 
    projects, 
    groups, 
    settings,
    installedEditors,
    isLoading, 
    fetchData, 
    fetchInstalledEditors,
    setDefaultEditor,
    patchSettings,
    openProjectWithEditor,
    openSettingsWindow,
    scanDirectory,
    openProject,

    removeProject,
    registerProject,
    launchGroup,
    clearAll,

    createGroup,
    updateGroup,
    deleteGroup,
    addProjectToGroup,
    removeProjectFromGroup,
  } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Group UI states
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [dndActiveGroupId, setDndActiveGroupId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q),
    );
    if (!settings) return filtered;
    return sortProjectsBySettings(filtered, settings);
  }, [projects, searchQuery, settings]);

  const projectSortLabel = useMemo(
    () => (settings ? projectSortSubtitle(settings) : ''),
    [settings],
  );

  return {
    projects: filteredProjects,
    projectSortLabel,
    groups,
    settings,
    installedEditors,
    isLoading,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    openProject,
    openSettingsWindow,
    openProjectWithEditor,
    removeProject,
    registerProject,
    scanDirectory,
    launchGroup,
    clearAll,
    fetchData,
    fetchInstalledEditors,
    setDefaultEditor,
    patchSettings,

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
  };
}
