import { useDroppable } from '@dnd-kit/core';
import { Group, Project } from '@org/models';
import { GlassCard, GlowBadge, NeonButton } from '@org/ui-kit';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Command, Folder, Hand, Pencil, Play, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface GroupSpaceProps {
  group: Group;
  projectsInGroup: Project[];
  isEditingName: boolean;
  isDndActive: boolean;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onEditToggle: () => void;
  onDndToggle: () => void;
  onRemoveProject: (projectId: string) => void;
  onLaunch: () => void;
  onCreateRaycastLauncher?: () => void;
}

export const GroupSpace: React.FC<GroupSpaceProps> = ({
  group,
  projectsInGroup,
  isEditingName,
  isDndActive,
  onRename,
  onDelete,
  onEditToggle,
  onDndToggle,
  onRemoveProject,
  onLaunch,
  onCreateRaycastLauncher,
}) => {
  const { t } = useTranslation();
  const [newName, setNewName] = useState(group.name);
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${group.id}`,
    data: { groupId: group.id },
  });

  const handleRename = () => {
    if (newName.trim()) {
      onRename(newName.trim());
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative transition-all duration-500 ${isOver ? 'scale-[1.02]' : ''}`}
    >
      <GlassCard
        glow={isDndActive ? 'green' : 'blue'}
        hoverable
        className={`p-6 border-border/80 bg-muted/25 flex flex-col gap-4 min-h-[160px] ${
          isDndActive ? 'border-primary/40 shadow-[0_0_20px_rgba(0,255,136,0.1)]' : ''
        } ${isOver ? 'bg-primary/5 border-primary/40' : ''} group`}
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-input border border-border rounded px-2 py-1 text-sm font-black text-primary focus:outline-none focus:border-primary/50 w-full"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename();
                      if (e.key === 'Escape') onEditToggle();
                    }}
                  />
                  <button onClick={handleRename} className="p-1 hover:text-primary transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={onEditToggle} className="p-1 hover:text-neon-red transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <h3
                  className="truncate text-sm font-black uppercase tracking-[0.14em] text-foreground transition-colors group-hover:text-foreground"
                  title={group.name}
                >
                  {group.name}
                </h3>
              )}
            </div>
            <NeonButton variant="primary" size="icon" className="h-8 w-8 shrink-0" onClick={onLaunch}>
              <Play className="w-3.5 h-3.5 fill-current" />
            </NeonButton>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <GlowBadge size="xs" color="blue" className="shrink-0">
              {projectsInGroup.length} {t('groupSpace.projects')}
            </GlowBadge>

            <div className="flex items-center gap-1 shrink-0">
              <div className="group/raycast relative">
                <NeonButton
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  title={t('raycast.form.title')}
                  aria-label={t('raycast.form.title')}
                  onClick={onCreateRaycastLauncher}
                >
                  <Command className="w-3.5 h-3.5" />
                </NeonButton>
                <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] font-bold text-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover/raycast:opacity-100">
                  {t('raycast.form.title')}
                </span>
              </div>

              <div className="mx-1 h-4 w-px bg-border" />

              <NeonButton
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isEditingName ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={onEditToggle}
              >
                <Pencil className="w-3.5 h-3.5" />
              </NeonButton>

              <NeonButton
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isDndActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
                onClick={onDndToggle}
              >
                <Hand className="w-3.5 h-3.5" />
              </NeonButton>

              <NeonButton
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-neon-red"
                onClick={onDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </NeonButton>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {projectsInGroup.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative"
              >
                <div className="flex items-center gap-2 bg-muted/60 border border-border px-2 py-1 rounded-md hover:border-primary/30 transition-all">
                  <Folder className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[80px]">
                    {project.name}
                  </span>
                  {isDndActive && (
                    <button
                      onClick={() => onRemoveProject(project.id)}
                      className="ml-1 text-muted-foreground/50 hover:text-neon-red transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {projectsInGroup.length === 0 && !isDndActive && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic opacity-40 py-2">
              {t('groupSpace.emptyHint')}
            </div>
          )}

          {isDndActive && (
            <div className="flex items-center gap-2 border-2 border-dashed border-primary/20 bg-primary/5 rounded-md px-3 py-1 animate-pulse">
              <Hand className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-black uppercase text-primary/80">{t('groupSpace.dropHere')}</span>
            </div>
          )}
        </div>
      </GlassCard>

      {isOver && (
        <div className="absolute inset-0 z-10 animate-pulse rounded-xl border-2 border-primary bg-primary/10 pointer-events-none" />
      )}
    </div>
  );
};
