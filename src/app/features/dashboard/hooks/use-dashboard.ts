import { useMemo, useState } from 'react';
import { useProjectStore } from '../../../store/use-project-store';

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
    openProjectWithEditor,
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
  const [activeNav, setActiveNav] = useState('projects');
  
  // Group UI states
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [dndActiveGroupId, setDndActiveGroupId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.path.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  return {
    projects: filteredProjects,
    groups,
    settings,
    installedEditors,
    isLoading,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    activeNav,
    setActiveNav,
    openProject,
    openProjectWithEditor,
    removeProject,
    registerProject,
    scanDirectory,
    launchGroup,
    clearAll,
    fetchData,
    fetchInstalledEditors,
    setDefaultEditor,


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
