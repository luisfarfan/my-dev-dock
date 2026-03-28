import { useDroppable } from '@dnd-kit/core';
import { Group, Project } from '@org/models';
import { GlassCard, GlowBadge, NeonButton } from '@org/ui-kit';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Folder, Hand, Pencil, Play, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

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
}) => {
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
        className={`p-6 border-border/80 bg-muted/25 flex flex-col gap-4 min-h-[160px] ${
          isDndActive ? 'border-primary/40 shadow-[0_0_20px_rgba(0,255,136,0.1)]' : ''
        } ${isOver ? 'bg-primary/5 border-primary/40' : ''}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1 flex-1">
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
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/90 truncate">
                {group.name}
              </h3>
            )}

            <GlowBadge size="xs" color="blue" className="shrink-0">
              {projectsInGroup.length} PROJECTS
            </GlowBadge>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <NeonButton
              variant="ghost"
              size="icon"
              className={`w-8 h-8 ${isEditingName ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={onEditToggle}
            >
              <Pencil className="w-3.5 h-3.5" />
            </NeonButton>

            <NeonButton
              variant="ghost"
              size="icon"
              className={`w-8 h-8 ${isDndActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              onClick={onDndToggle}
            >
              <Hand className="w-3.5 h-3.5" />
            </NeonButton>

            <NeonButton
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-neon-red"
              onClick={onDelete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </NeonButton>

            <div className="w-px h-4 bg-border mx-1" />

            <NeonButton variant="primary" size="icon" className="w-8 h-8" onClick={onLaunch}>
              <Play className="w-3.5 h-3.5 fill-current" />
            </NeonButton>
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
              No projects in this group. Click the hand icon to drag projects here.
            </div>
          )}

          {isDndActive && (
            <div className="flex items-center gap-2 border-2 border-dashed border-primary/20 bg-primary/5 rounded-md px-3 py-1 animate-pulse">
              <Hand className="w-3 h-3 text-primary" />
              <span className="text-[9px] font-black uppercase text-primary/80">Drop Here</span>
            </div>
          )}
        </div>
      </GlassCard>

      {isOver && (
        <div className="absolute inset-0 bg-primary/10 rounded-[0.75rem] border-2 border-primary animate-pulse pointer-events-none z-10" />
      )}
    </div>
  );
};
