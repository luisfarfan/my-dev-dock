import { AnimatePresence, motion } from 'framer-motion';
import { Folder, FolderSearch, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { confirm, message, open } from '@tauri-apps/plugin-dialog';
import { Project } from '@org/models';
import { GlowBadge, NeonButton } from '@org/ui-kit';
import { isTauriRuntime } from '@/app/shared/utils/is-tauri-runtime';
import { ProjectCard } from '@/app/features/projects';

export interface DashboardProjectsSectionProps {
  viewMode: 'grid' | 'list';
  projects: Project[];
  isClearing: boolean;
  onClearingChange: (value: boolean) => void;
  onRemoveProject: (id: string) => void;
  onRegisterProject: (path: string) => Promise<void>;
  onScanDirectory: (path: string) => Promise<number>;
  onClearAll: () => Promise<void>;
  onOpenInEditor: (path: string) => void;
}

export const DashboardProjectsSection: React.FC<DashboardProjectsSectionProps> = ({
  viewMode,
  projects,
  isClearing,
  onClearingChange,
  onRemoveProject,
  onRegisterProject,
  onScanDirectory,
  onClearAll,
  onOpenInEditor,
}) => {
  const handleAddProject = async () => {
    const path = window.prompt('Introduce la ruta del proyecto local:');
    if (path) await onRegisterProject(path);
  };

  const handleScanParentFolder = async () => {
    let selectedPath: string | null = null;

    if (isTauriRuntime()) {
      const result = await open({
        directory: true,
        multiple: false,
        title: 'Selecciona la carpeta padre a escanear',
      });
      if (typeof result === 'string') {
        selectedPath = result;
      }
    } else {
      const path = window.prompt('Introduce la ruta de la carpeta padre para escanear:');
      selectedPath = path?.trim() || null;
    }

    if (!selectedPath) return;

    try {
      const foundCount = await onScanDirectory(selectedPath);
      if (foundCount === 0) {
        window.alert(
          'No se detectaron proyectos en esa carpeta. Verifica la ruta y que los proyectos estén hasta 5 niveles de profundidad.',
        );
      } else {
        window.alert(`Se agregaron ${foundCount} proyectos al dashboard.`);
      }
    } catch (err) {
      window.alert(`No se pudo escanear la carpeta: ${(err as Error).message}`);
    }
  };

  const handleClearAll = async () => {
    if (isClearing) return;

    onClearingChange(true);
    try {
      const shouldDelete = isTauriRuntime()
        ? await confirm('Esto borrará TODOS los proyectos y grupos del dashboard. ¿Continuar?', {
            title: 'Confirmar borrado',
            kind: 'warning',
            okLabel: 'Sí, borrar',
            cancelLabel: 'Cancelar',
          })
        : window.confirm('Esto borrará TODOS los proyectos y grupos del dashboard. ¿Continuar?');
      if (!shouldDelete) return;

      await onClearAll();
      if (isTauriRuntime()) {
        await message('Se borraron todos los proyectos y grupos.', {
          title: 'Borrado completado',
          kind: 'info',
          okLabel: 'OK',
        });
      } else {
        window.alert('Se borraron todos los proyectos y grupos.');
      }
    } finally {
      onClearingChange(false);
    }
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Active Projects</h2>
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
            onClick={handleScanParentFolder}
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
            onClick={handleClearAll}
          >
            <Trash2 className="w-4 h-4" />
            {isClearing ? 'Borrando...' : 'Borrar Todo'}
          </NeonButton>
        </div>
      </div>

      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
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
                onRemove={onRemoveProject}
                onOpenInEditor={onOpenInEditor}
                compact={viewMode === 'grid'}
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
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/20">Empty Workspace</h3>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                No projects have been registered in this machine yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
