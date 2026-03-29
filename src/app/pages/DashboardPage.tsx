import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { EditorType, Group, Project, RaycastLauncherInput } from '@org/models';
import {
  DashboardGroupsSection,
  DashboardHubHeader,
  DashboardProjectsSection,
  RaycastLauncherModal,
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
  const [raycastInstalled, setRaycastInstalled] = React.useState<boolean | null>(null);
  const [raycastTarget, setRaycastTarget] = React.useState<
    { type: 'project'; project: Project } | { type: 'group'; group: Group } | null
  >(null);
  const [showGroupsFirst, setShowGroupsFirst] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('dashboard:showGroupsFirst') === 'true';
  });

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
    detectRaycastInstallation,
    setDefaultEditor,
    scanDirectory,
    projectSortLabel,
    patchSettings,
    exportRaycastLauncher,
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

  React.useEffect(() => {
    window.localStorage.setItem('dashboard:showGroupsFirst', String(showGroupsFirst));
  }, [showGroupsFirst]);

  React.useEffect(() => {
    void (async () => {
      const detected = await detectRaycastInstallation();
      setRaycastInstalled(detected);
    })();
  }, [detectRaycastInstallation]);

  const refreshRaycastStatus = React.useCallback(async () => {
    const detected = await detectRaycastInstallation();
    setRaycastInstalled(detected);
  }, [detectRaycastInstallation]);

  const handleCreateRaycastLauncher = React.useCallback(
    async (input: RaycastLauncherInput) => {
      await exportRaycastLauncher(input);
    },
    [exportRaycastLauncher],
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-16 max-w-[1400px] mx-auto pb-20">
        <DashboardHubHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showGroupsFirst={showGroupsFirst}
          onToggleSectionOrder={() => setShowGroupsFirst((prev) => !prev)}
          onOpenSettings={onOpenSettings}
        />

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key="dashboard-groups-section"
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={showGroupsFirst ? '' : 'order-3'}
          >
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
              onCreateRaycastLauncher={(group) => setRaycastTarget({ type: 'group', group })}
            />
          </motion.div>

          <motion.div
            key="dashboard-order-separator"
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="order-2"
          >
            <DashboardSectionSeparator />
          </motion.div>

          <motion.div
            key="dashboard-projects-section"
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={showGroupsFirst ? 'order-3' : ''}
          >
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
              onCreateRaycastLauncher={(project) => setRaycastTarget({ type: 'project', project })}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <SettingsDrawer
        open={settingsDrawerOpen}
        onClose={closeSettingsDrawer}
        installedEditors={installedEditors}
        settings={settings}
        raycastInstalled={raycastInstalled}
        onSelectDefaultEditor={(editor) => setDefaultEditor(editor)}
        onPatchSettings={patchSettings}
        onRefreshRaycastStatus={refreshRaycastStatus}
      />

      <OpenProjectEditorModal
        projectPath={projectPathForEditorPicker}
        onClose={() => setProjectPathForEditorPicker(null)}
        installedEditors={installedEditors}
        settings={settings}
        onPickEditor={handleSelectEditorForProject}
      />

      <RaycastLauncherModal
        open={Boolean(raycastTarget)}
        target={raycastTarget}
        settings={settings}
        installedEditors={installedEditors}
        onClose={() => setRaycastTarget(null)}
        onSubmit={handleCreateRaycastLauncher}
        onOpenSettings={() => {
          setRaycastTarget(null);
          useSettingsDrawerStore.getState().open();
        }}
      />
    </DndContext>
  );
};
