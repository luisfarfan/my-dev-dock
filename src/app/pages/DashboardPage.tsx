import {
  ArrowRight,
  Check,
  LayoutGrid,
  List,
  X,
  Trash2,
  Folder,
  FolderSearch,
  Hand,
  Layers,
  Plus,
  Rocket,
  Settings,
  Users,
} from "lucide-react";
import React from "react";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { confirm, message, open } from "@tauri-apps/plugin-dialog";
import { GlowBadge, NeonButton, SearchInput } from "@org/ui-kit";
import { AnimatePresence, motion } from "framer-motion";
import { EditorType } from "@org/models";
import { GroupSpace } from "../features/dashboard/components/GroupSpace";
import { ProjectCard } from "../features/dashboard/components/ProjectCard";
import { useDashboard } from "../features/dashboard/hooks/use-dashboard";

function isTauriRuntime(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const runtimeWindow = window as Window & {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  };
  return (
    typeof runtimeWindow.__TAURI__ !== "undefined" ||
    typeof runtimeWindow.__TAURI_INTERNALS__ !== "undefined"
  );
}

const editorLabelMap: Record<string, string> = {
  cursor: "Cursor",
  antigravity: "Antigravity",
  vscode: "VS Code",
  zed: "Zed",
  webstorm: "WebStorm",
  sublime: "Sublime Text",
  neovim: "Neovim",
};

export const DashboardPage: React.FC = () => {
  const [isClearing, setIsClearing] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [projectPathForEditorPicker, setProjectPathForEditorPicker] = React.useState<string | null>(null);
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
  } = useDashboard();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.id.toString().startsWith("group-")) {
      const groupId = over.data.current?.groupId;
      const projectData = active.data.current?.project;
      if (groupId && projectData) {
        addProjectToGroup(groupId, projectData.id);
      }
    }
  };

  const handleAddProject = async () => {
    const path = window.prompt("Introduce la ruta del proyecto local:");
    if (path) await registerProject(path);
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
        {/* Main Hub Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-white/5 relative z-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center p-2 shadow-[0_0_30px_-5px_rgba(0,255,136,0.3)]">
                <Rocket className="text-black w-7 h-7" />
              </div>
              Project Hub
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-60">
              Central Management & Launchpad
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden lg:block">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find in workspace..."
                className="bg-black/40 border-white/5 min-w-[320px]"
              />
            </div>
            <div className="w-px h-10 bg-white/5 mx-2" />
            <div className="flex items-center gap-1 p-1 rounded-lg border border-white/10 bg-black/30">
              <NeonButton
                variant={viewMode === "grid" ? "primary" : "ghost"}
                size="icon"
                className="w-9 h-9"
                onClick={() => setViewMode("grid")}
                title="Vista compacta"
              >
                <LayoutGrid className="w-4 h-4" />
              </NeonButton>
              <NeonButton
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="icon"
                className="w-9 h-9"
                onClick={() => setViewMode("list")}
                title="Vista detallada"
              >
                <List className="w-4 h-4" />
              </NeonButton>
            </div>
            <NeonButton
              variant="ghost"
              size="icon"
              className="w-12 h-12 border border-white/5 group hover:border-primary/50 transition-colors"
              onClick={async () => {
                setIsSettingsOpen(true);
                await fetchInstalledEditors();
              }}
            >
              <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </NeonButton>
          </div>
        </header>

        {/* PROJECTS SECTION (TOP ROW) */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Folder className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-white">
                  Active Projects
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <GlowBadge size="xs" color="blue">
                    {projects.length} DETECTED
                  </GlowBadge>
                  <span className="text-[10px] font-bold text-muted-foreground opacity-40 italic">
                    Sorted by recent activity
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NeonButton
                variant="outline"
                className="h-11 px-8 text-xs font-black uppercase tracking-widest border-white/10 hover:border-primary/50 group gap-3"
                onClick={async () => {
                  let selectedPath: string | null = null;

                  if (isTauriRuntime()) {
                    const result = await open({
                      directory: true,
                      multiple: false,
                      title: "Selecciona la carpeta padre a escanear",
                    });
                    if (typeof result === "string") {
                      selectedPath = result;
                    }
                  } else {
                    const path = window.prompt(
                      "Introduce la ruta de la carpeta padre para escanear:",
                    );
                    selectedPath = path?.trim() || null;
                  }

                  if (!selectedPath) return;

                  try {
                    const foundCount = await scanDirectory(selectedPath);
                    if (foundCount === 0) {
                      window.alert(
                        "No se detectaron proyectos en esa carpeta. Verifica la ruta y que los proyectos estén hasta 5 niveles de profundidad.",
                      );
                    } else {
                      window.alert(`Se agregaron ${foundCount} proyectos al dashboard.`);
                    }
                  } catch (err) {
                    window.alert(
                      `No se pudo escanear la carpeta: ${(err as Error).message}`,
                    );
                  }
                }}
              >
                <FolderSearch className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Scan Parent Folder
              </NeonButton>

              <NeonButton
                variant="primary"
                className="h-11 px-8 text-xs font-black uppercase tracking-widest gap-3 shadow-[0_0_20px_rgba(0,255,136,0.15)]"
                onClick={handleAddProject}
              >
                <Plus className="w-4 h-4" />
                Register Project
              </NeonButton>

              <NeonButton
                variant="outline"
                className="h-11 px-6 text-xs font-black uppercase tracking-widest gap-2 border-red-400/40 text-red-300 hover:border-red-400 hover:text-red-200"
                disabled={isClearing}
                onClick={async () => {
                  if (isClearing) return;

                  setIsClearing(true);
                  try {
                    const shouldDelete = isTauriRuntime()
                      ? await confirm(
                          "Esto borrará TODOS los proyectos y grupos del dashboard. ¿Continuar?",
                          {
                            title: "Confirmar borrado",
                            kind: "warning",
                            okLabel: "Sí, borrar",
                            cancelLabel: "Cancelar",
                          },
                        )
                      : window.confirm(
                          "Esto borrará TODOS los proyectos y grupos del dashboard. ¿Continuar?",
                        );
                    if (!shouldDelete) return;

                    await clearAll();
                    if (isTauriRuntime()) {
                      await message("Se borraron todos los proyectos y grupos.", {
                        title: "Borrado completado",
                        kind: "info",
                        okLabel: "OK",
                      });
                    } else {
                      window.alert("Se borraron todos los proyectos y grupos.");
                    }
                  } finally {
                    setIsClearing(false);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
                {isClearing ? "Borrando..." : "Borrar Todo"}
              </NeonButton>
            </div>
          </div>

          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            }
          >
            <AnimatePresence mode="popLayout">
              {projects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  className="min-w-0"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                  <ProjectCard
                    project={project}
                    onRemove={removeProject}
                    onOpenInEditor={handleOpenProject}
                    compact={viewMode === "grid"}
                    isDraggable={true}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {projects.length === 0 && (
              <div className="col-span-full py-24 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 bg-white/[0.01]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Folder className="w-7 h-7 text-white/10" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/20">
                    Empty Workspace
                  </h3>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    No projects have been registered in this machine yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SEPARATOR (Visual) */}
        <div className="relative flex items-center py-4">
          <div className="flex-1 border-t border-white/5" />
          <div className="mx-6 p-2 rounded-full border border-white/5 bg-black">
            <ArrowRight className="w-4 h-4 text-white/10 rotate-90" />
          </div>
          <div className="flex-1 border-t border-white/5" />
        </div>

        {/* GROUPS SECTION (BOTTOM ROW) */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-neon-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-white">
                  Smart Groups
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <GlowBadge size="xs" color="green">
                    {groups.length} CONFIGURED
                  </GlowBadge>
                  <span className="text-[10px] font-bold text-muted-foreground opacity-40 italic">
                    Cluster your workspace logically
                  </span>
                </div>
              </div>
            </div>

            <NeonButton
              variant="outline"
              className="h-11 px-8 text-xs font-black uppercase tracking-widest border-white/10 hover:border-primary/50 group gap-3"
              onClick={async () => {
                const id = await createGroup();
                setEditingGroupId(id);
              }}
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              New Logical Cluster
            </NeonButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {groups.map((group, idx) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1 }}
                  layout
                >
                  <GroupSpace
                    group={group}
                    projectsInGroup={projects.filter((p) =>
                      group.projectIds.includes(p.id),
                    )}
                    isEditingName={editingGroupId === group.id}
                    isDndActive={true}
                    onRename={(newName) => {
                      updateGroup({ ...group, name: newName });
                      setEditingGroupId(null);
                    }}
                    onDelete={() => deleteGroup(group.id)}
                    onEditToggle={() =>
                      setEditingGroupId(
                        editingGroupId === group.id ? null : group.id,
                      )
                    }
                    onDndToggle={() => console.log("dnd toggled")}
                    onRemoveProject={(pid) =>
                      removeProjectFromGroup(group.id, pid)
                    }
                    onLaunch={() => launchGroup(group.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {groups.length === 0 && (
              <div className="col-span-full py-16 border-2 border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center bg-white/[0.01]">
                <div className="flex flex-col items-center gap-4 opacity-20">
                  <Users className="w-12 h-12" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    No Launch Groups Defined
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Global Footer Interactivity */}
        <footer className="mt-8 py-10 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,136,1)] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Ready to Launch
              </span>
            </div>
            <div className="w-px h-6 bg-white/5" />
            <div className="flex items-center gap-3">
              <Hand className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Drop projects on clusters
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[9px] font-mono text-white/10">
              STATION_ID: DEV_MAC_PRO
            </span>
            <GlowBadge size="xs" color="blue" className="opacity-40">
              STABLE_V1
            </GlowBadge>
          </div>
        </footer>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-black/80 shadow-[0_0_40px_rgba(0,0,0,0.45)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                  Settings
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Selecciona el editor por defecto para abrir proyectos.
                </p>
              </div>
              <NeonButton
                variant="ghost"
                size="icon"
                className="w-9 h-9"
                onClick={() => setIsSettingsOpen(false)}
              >
                <X className="w-4 h-4" />
              </NeonButton>
            </div>

            <div className="space-y-3">
              {installedEditors.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground">
                  No se detectaron IDEs instalados.
                </div>
              ) : (
                installedEditors.map((editor) => {
                  const isSelected = settings?.defaultEditor === editor;
                  return (
                    <button
                      key={editor}
                      onClick={() => setDefaultEditor(editor)}
                      className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? "border-primary/50 bg-primary/10"
                          : "border-white/10 bg-white/5 hover:border-white/25"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-white">
                          {editorLabelMap[editor] ?? editor}
                        </p>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                          {editor}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {settings && installedEditors.length > 0 && !installedEditors.includes(settings.defaultEditor) && (
              <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-300">
                El editor por defecto actual ({settings.defaultEditor}) no está instalado.
              </div>
            )}
          </div>
        </div>
      )}

      {projectPathForEditorPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/80 shadow-[0_0_40px_rgba(0,0,0,0.45)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                  Abrir Proyecto
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Selecciona el editor para abrir este proyecto.
                </p>
              </div>
              <NeonButton
                variant="ghost"
                size="icon"
                className="w-9 h-9"
                onClick={() => setProjectPathForEditorPicker(null)}
              >
                <X className="w-4 h-4" />
              </NeonButton>
            </div>

            <div className="space-y-3">
              {installedEditors.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-muted-foreground">
                  No se detectaron IDEs instalados.
                </div>
              ) : (
                installedEditors.map((editor) => (
                  <button
                    key={editor}
                    onClick={() => handleSelectEditorForProject(editor)}
                    className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 hover:border-white/25 px-4 py-3 text-left transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">
                        {editorLabelMap[editor] ?? editor}
                      </p>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                        {editor}
                      </p>
                    </div>
                    {settings?.defaultEditor === editor && (
                      <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
};
