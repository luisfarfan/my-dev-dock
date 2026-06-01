import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { EditorType, Group, Project, RaycastLauncherInput } from '@org/models';
import {
  DashboardFooter,
  DashboardGroupsSection,
  DashboardHubHeader,
  DashboardProjectsSection,
  RaycastLauncherModal,
  DashboardSectionSeparator,
  OpenProjectEditorModal,
  SettingsDrawer,
  useDashboard,
} from '@/app/features/dashboard';
import { EnvIndexDrawer } from '@/app/features/env-index';
import { WorkspaceModal, WorkspacePanel, WorkspaceStrip } from '@/app/features/workspaces';
import { countPendingWorkspaceMatches } from '@/lib/workspace-suggestions';
import type { Workspace } from '@org/models';
import { useEnvIndexDrawerStore } from '@/app/store/use-env-index-drawer-store';
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
  const hasSyncedWidgetModeRef = React.useRef(false);

  const settingsDrawerOpen = useSettingsDrawerStore((s) => s.isOpen);
  const closeSettingsDrawer = useSettingsDrawerStore((s) => s.close);
  const envIndexOpen = useEnvIndexDrawerStore((s) => s.isOpen);
  const envIndexProjectId = useEnvIndexDrawerStore((s) => s.filterProjectId);
  const closeEnvIndex = useEnvIndexDrawerStore((s) => s.close);
  const openEnvIndex = useEnvIndexDrawerStore((s) => s.open);

  const {
    projects,
    allProjects,
    groups,
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
    workspaceProjects,
    settings,
    installedEditors,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    isMinimalView,
    setMinimalView,
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
    dndActiveGroupId,
    setDndActiveGroupId,
    fetchInstalledEditors,
    detectRaycastInstallation,
    setDefaultEditor,
    scanDirectory,
    projectSortLabel,
    patchSettings,
    exportRaycastLauncher,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  } = useDashboard();

  const [workspaceModal, setWorkspaceModal] = React.useState<{
    mode: 'create' | 'edit';
    workspace: Workspace | null;
  } | null>(null);

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
    if (hasSyncedWidgetModeRef.current) return;
    hasSyncedWidgetModeRef.current = true;
    void setMinimalView(isMinimalView);
  }, [isMinimalView, setMinimalView]);

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
      <div className="mx-auto flex max-w-[1400px] flex-col gap-16 px-3 pb-20 sm:px-4 lg:px-5">
        <DashboardHubHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showGroupsFirst={showGroupsFirst}
          onToggleSectionOrder={() => setShowGroupsFirst((prev) => !prev)}
          isMinimalView={isMinimalView}
          onToggleMinimalView={() => setMinimalView(!isMinimalView)}
          onOpenSettings={onOpenSettings}
          onOpenEnvIndex={() => openEnvIndex()}
        />

        {!isMinimalView ? (
          <WorkspaceStrip
            workspaces={workspaces}
            projects={allProjects}
            activeWorkspaceId={activeWorkspaceId}
            onSelect={setActiveWorkspaceId}
            onCreate={() => setWorkspaceModal({ mode: 'create', workspace: null })}
            onEdit={(workspace) => setWorkspaceModal({ mode: 'edit', workspace })}
          />
        ) : null}

        {!isMinimalView && activeWorkspace ? (
          <WorkspacePanel
            workspace={activeWorkspace}
            projects={workspaceProjects}
            pendingCount={countPendingWorkspaceMatches(activeWorkspace, allProjects)}
            onEdit={(workspace) => setWorkspaceModal({ mode: 'edit', workspace })}
            onOpenProject={handleOpenProject}
          />
        ) : null}

        <AnimatePresence mode="sync" initial={false}>
          {!isMinimalView ? (
            <>
              <motion.div
                key="dashboard-groups-section"
                className={showGroupsFirst ? '' : 'order-3'}
              >
                <DashboardGroupsSection
                  groups={groups}
                  projects={projects}
                  editingGroupId={editingGroupId}
                  dndActiveGroupId={dndActiveGroupId}
                  onEditingGroupIdChange={setEditingGroupId}
                  onDndActiveGroupIdChange={setDndActiveGroupId}
                  onCreateGroup={createGroup}
                  onUpdateGroup={updateGroup}
                  onDeleteGroup={deleteGroup}
                  onRemoveProjectFromGroup={removeProjectFromGroup}
                  onLaunchGroup={launchGroup}
                  onCreateRaycastLauncher={(group) => setRaycastTarget({ type: 'group', group })}
                />
              </motion.div>

              <motion.div key="dashboard-order-separator" className="order-2">
                <DashboardSectionSeparator />
              </motion.div>
            </>
          ) : null}

          <motion.div
            key="dashboard-projects-section"
            className={!isMinimalView && showGroupsFirst ? 'order-3' : ''}
          >
            <DashboardProjectsSection
              viewMode={viewMode}
              projects={projects}
              groups={groups}
              sortLabel={projectSortLabel}
              isMinimalView={isMinimalView}
              isClearing={isClearing}
              onClearingChange={setIsClearing}
              onRemoveProject={removeProject}
              onRegisterProject={registerProject}
              onScanDirectory={scanDirectory}
              onClearAll={clearAll}
              onOpenInEditor={handleOpenProject}
              onLaunchGroup={launchGroup}
              onExitMinimalView={() => setMinimalView(false)}
              onCreateRaycastLauncher={(project) => setRaycastTarget({ type: 'project', project })}
            />
          </motion.div>
        </AnimatePresence>

        {!isMinimalView ? <DashboardFooter /> : null}
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

      <EnvIndexDrawer
        open={envIndexOpen}
        onClose={closeEnvIndex}
        projects={allProjects}
        initialProjectId={envIndexProjectId}
      />

      <WorkspaceModal
        open={Boolean(workspaceModal)}
        mode={workspaceModal?.mode ?? 'create'}
        projects={allProjects}
        initial={workspaceModal?.workspace}
        onClose={() => setWorkspaceModal(null)}
        onSave={async (payload) => {
          if (workspaceModal?.mode === 'edit' && workspaceModal.workspace) {
            await updateWorkspace({ ...workspaceModal.workspace, ...payload });
          } else {
            const created = await createWorkspace(payload);
            setActiveWorkspaceId(created.id);
          }
        }}
        onDelete={
          workspaceModal?.mode === 'edit' && workspaceModal.workspace
            ? async () => {
                const id = workspaceModal.workspace!.id;
                if (activeWorkspaceId === id) setActiveWorkspaceId(null);
                await deleteWorkspace(id);
                setWorkspaceModal(null);
              }
            : undefined
        }
      />
    </DndContext>
  );
};
