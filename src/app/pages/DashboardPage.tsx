import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import React from 'react';
import { EditorType } from '@org/models';
import {
  DashboardFooter,
  DashboardGroupsSection,
  DashboardHubHeader,
  DashboardProjectsSection,
  DashboardSectionSeparator,
  OpenProjectEditorModal,
  SettingsDrawer,
  useDashboard,
} from '@/app/features/dashboard';
import { useSettingsDrawerStore } from '@/app/store/use-settings-drawer-store';

export interface DashboardPageProps {
  onOpenSettings: () => Promise<void>;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenSettings }) => {
  const [isClearing, setIsClearing] = React.useState(false);
  const [projectPathForEditorPicker, setProjectPathForEditorPicker] = React.useState<string | null>(null);

  const settingsDrawerOpen = useSettingsDrawerStore((s) => s.isOpen);
  const closeSettingsDrawer = useSettingsDrawerStore((s) => s.close);

  const {
    projects,
    groups,
    settings,
    installedEditors,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    openProjectWithEditor,
    removeProject,
    registerProject,
    launchGroup,
    clearAll,
    createGroup,
    updateGroup,
    deleteGroup,
    addProjectToGroup,
    removeProjectFromGroup,
    editingGroupId,
    setEditingGroupId,
    fetchInstalledEditors,
    setDefaultEditor,
    scanDirectory,
    projectSortLabel,
    patchSettings,
  } = useDashboard();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.id.toString().startsWith('group-')) {
      const groupId = over.data.current?.groupId;
      const projectData = active.data.current?.project;
      if (groupId && projectData) {
        addProjectToGroup(groupId, projectData.id);
      }
    }
  };

  const handleOpenProject = async (path: string) => {
    if (installedEditors.length === 0) {
      await fetchInstalledEditors();
    }
    setProjectPathForEditorPicker(path);
  };

  const handleSelectEditorForProject = async (editor: EditorType) => {
    if (!projectPathForEditorPicker) return;
    await setDefaultEditor(editor);
    await openProjectWithEditor(projectPathForEditorPicker, editor);
    setProjectPathForEditorPicker(null);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-16 max-w-[1400px] mx-auto pb-20">
        <DashboardHubHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenSettings={onOpenSettings}
        />

        <DashboardProjectsSection
          viewMode={viewMode}
          projects={projects}
          sortLabel={projectSortLabel}
          isClearing={isClearing}
          onClearingChange={setIsClearing}
          onRemoveProject={removeProject}
          onRegisterProject={registerProject}
          onScanDirectory={scanDirectory}
          onClearAll={clearAll}
          onOpenInEditor={handleOpenProject}
        />

        <DashboardSectionSeparator />

        <DashboardGroupsSection
          groups={groups}
          projects={projects}
          editingGroupId={editingGroupId}
          onEditingGroupIdChange={setEditingGroupId}
          onCreateGroup={createGroup}
          onUpdateGroup={updateGroup}
          onDeleteGroup={deleteGroup}
          onRemoveProjectFromGroup={removeProjectFromGroup}
          onLaunchGroup={launchGroup}
        />

        <DashboardFooter />
      </div>

      <SettingsDrawer
        open={settingsDrawerOpen}
        onClose={closeSettingsDrawer}
        installedEditors={installedEditors}
        settings={settings}
        onSelectDefaultEditor={(editor) => setDefaultEditor(editor)}
        onPatchSettings={patchSettings}
      />

      <OpenProjectEditorModal
        projectPath={projectPathForEditorPicker}
        onClose={() => setProjectPathForEditorPicker(null)}
        installedEditors={installedEditors}
        settings={settings}
        onPickEditor={handleSelectEditorForProject}
      />
    </DndContext>
  );
};
