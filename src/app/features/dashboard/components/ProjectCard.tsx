import React from 'react';
import { Project } from '@org/models';
import { GlassCard, NeonButton, GlowBadge } from '@org/ui-kit';
import { 
  Folder, 
  ArrowUpRight, 
  GitBranch, 
  GitCommit, 
  History, 
  Share2, 
  Trash2,
  GripVertical
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export interface ProjectCardProps {
  project: Project;
  onOpenInEditor: (path: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
  isDraggable?: boolean;
}

const stackIconMap: Record<string, string> = {
  react: 'react',
  angular: 'angular',
  vue: 'vuedotjs',
  svelte: 'svelte',
  flutter: 'flutter',
  python: 'python',
  rust: 'rust',
  node: 'nodedotjs',
  nextjs: 'nextdotjs',
  typescript: 'typescript',
  javascript: 'javascript',
  tailwindcss: 'tailwindcss',
  prisma: 'prisma',
  tauri: 'tauri',
  docker: 'docker',
  go: 'go',
};

const stackColorMap: Record<string, string> = {
  react: '61DAFB',
  angular: 'DD0031',
  vue: '4FC08D',
  svelte: 'FF3E00',
  flutter: '02569B',
  python: '3776AB',
  rust: 'DEA584',
  node: '339933',
  nextjs: 'FFFFFF',
  typescript: '3178C6',
  javascript: 'F7DF1E',
  tailwindcss: '06B6D4',
  prisma: '2D3748',
  tauri: 'FFC131',
  docker: '2496ED',
  go: '00ADD8',
  nestjs: 'E0234E',
  express: 'FFFFFF',
  graphql: 'E10098',
  mongodb: '47A248',
  postgresql: '4169E1',
  redis: 'DC382D',
  nx: '143055',
  vite: '646CFF',
  webpack: '8DD6F9',
};

const StackIcon = ({ name, className = '' }: { name: string; className?: string }) => {
  const normalized = name.toLowerCase();
  const slug = stackIconMap[normalized] || normalized;
  const color = stackColorMap[normalized] || 'A1A1A1';
  const iconUrl = `https://cdn.simpleicons.org/${slug}/${color}`;
  const glowColor = `#${color}`;
  
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden transition-all group/stack:brightness-125 ${className}`}
      style={{
        filter: `drop-shadow(0 0 6px ${glowColor}55)`,
      }}
    >
      <img
        src={iconUrl}
        alt={name}
        className="w-full h-full object-contain transition-all duration-300 group-hover/stack:scale-110"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          if ((e.target as HTMLImageElement).parentElement) {
             const span = document.createElement('span');
             span.innerText = name[0].toUpperCase();
             span.className = 'text-[10px] font-black uppercase text-muted-foreground';
             (e.target as HTMLImageElement).parentElement?.appendChild(span);
          }
        }}
      />
      {/* Custom Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 backdrop-blur-md border border-white/10 rounded text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover/stack:opacity-100 group-hover/stack:translate-y-0 translate-y-1 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
         {name}
         <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-black/90" />
      </div>
    </div>
  );
};

function getStackGlow(name: string): string {
  const color = stackColorMap[name.toLowerCase()] || 'A1A1A1';
  return `#${color}`;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpenInEditor,
  onRemove,
  compact = false,
  isDraggable = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `project-${project.id}`,
    data: { project, id: project.id },
    disabled: !isDraggable,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const getGlowColor = (): 'green' | 'blue' | 'yellow' | 'red' => {
    switch (project.git.status) {
      case 'clean': return 'green';
      case 'uncommitted': return 'yellow';
      case 'unpushed': return 'blue';
      case 'error': return 'red';
      default: return 'blue';
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`min-w-0 ${isDragging ? 'opacity-40 scale-95 z-50' : ''} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <GlassCard 
        glow={getGlowColor()}
        className={`group flex w-full min-w-0 transition-all duration-300 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] ${
          compact ? 'flex-col items-center p-2 sm:p-3 gap-1.5 sm:gap-2 text-center' : 'flex-col p-6 h-full'
        } ${isDraggable ? 'ring-2 ring-primary/20 bg-primary/[0.02]' : ''}`}
        hoverable
        onClick={() => onOpenInEditor(project.path)}
      >
        {isDraggable && (
          <div className="absolute top-2 left-2 text-primary/40 group-hover:text-primary transition-colors">
             <GripVertical className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Project Icon & Title Section */}
        <div
          className={`flex w-full ${
            compact
              ? 'flex-col items-center justify-center gap-2 text-center'
              : 'items-center gap-4 mb-6 justify-between'
          }`}
        >
          <div
            className={`flex min-w-0 ${
              compact
                ? 'w-full flex-col items-center justify-center gap-2'
                : 'items-center gap-4 flex-1'
            }`}
          >
            {!compact && (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center p-2 group-hover:border-primary/50 transition-colors shrink-0">
                <Folder className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            )}
            <div
              className={
                compact
                  ? 'flex w-full min-w-0 flex-col items-center justify-center text-center'
                  : 'min-w-0'
              }
            >
              <h3
                className={
                  compact
                    ? 'w-full min-w-0 text-center text-[10px] font-black uppercase tracking-tight group-hover:text-white transition-colors line-clamp-2 break-words'
                    : 'text-lg font-bold group-hover:text-white transition-colors flex items-center gap-2 truncate max-w-full'
                }
              >
                 {project.name}
                 {!compact && <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />}
              </h3>
              {!compact && (
                <p className="text-[10px] font-mono text-muted-foreground/60 transition-colors group-hover:text-muted-foreground truncate max-w-[150px]">
                  {project.path}
                </p>
              )}
            </div>
          </div>

          {compact && (
            <div className="flex w-full flex-col items-center justify-center gap-2">
                <GlowBadge color={getGlowColor()} size="xs" className="scale-75">
                  {project.git.status.toUpperCase()}
                </GlowBadge>
                <div className="flex gap-1 mt-1">
                  {project.stack.slice(0, 3).map(s => (
                    <div key={s} className="w-5 h-5 rounded-md bg-black/40 border border-white/10 flex items-center justify-center group/stack">
                      <StackIcon name={s} className="p-1" />
                    </div>
                  ))}
                  {project.stack.length > 3 && (
                    <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[8px] text-muted-foreground font-black">
                      +{project.stack.length - 3}
                    </div>
                  )}
                </div>
            </div>
          )}

          {!compact && (
            <GlowBadge 
              color={getGlowColor()}
              size="xs" 
              pulse={project.git.status !== 'clean'}
            >
              {project.git.status.toUpperCase()}
            </GlowBadge>
          )}
        </div>

        {!compact && (
          <>
            {/* Git Details */}
            <div className="flex flex-col gap-3 py-4 border-y border-white/5 mb-6">
               <div className="flex items-center justify-between text-[11px] font-bold tracking-tight">
                  <div className="flex items-center gap-2 text-muted-foreground italic">
                    <GitBranch className="w-3.5 h-3.5" />
                    {project.git.branch}
                  </div>
                  <div className="flex items-center gap-1.5 text-white/40">
                     <History className="w-3 h-3" />
                     {project.git.changesCount > 0 ? `+${project.git.changesCount} CHANGES` : 'SYNCED'}
                  </div>
               </div>
               <div className="flex items-start gap-2 p-2 rounded-lg bg-black/20 border border-white/5 h-10 overflow-hidden">
                  <GitCommit className="w-3.5 h-3.5 text-primary/40 flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] text-muted-foreground leading-tight italic line-clamp-2">
                     {project.git.lastCommit}
                  </span>
               </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto flex items-center justify-between pt-2">
              <div className="flex gap-1.5">
                {project.stack.map(s => (
                  <div
                    key={s}
                    className="w-8 h-8 rounded-lg bg-black/80 border border-white/10 flex items-center justify-center p-2 hover:scale-125 hover:z-10 transition-all group/stack"
                    style={{
                      boxShadow: `inset 0 0 0 1px #ffffff12, 0 0 10px ${getStackGlow(s)}33`,
                    }}
                  >
                     <StackIcon name={s} />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                 <NeonButton 
                   variant="ghost" 
                   size="icon" 
                   className="w-8 h-8 group-hover:text-primary"
                   onClick={(e) => { e.stopPropagation(); }}
                 >
                    <Share2 className="w-4 h-4" />
                 </NeonButton>
                 <NeonButton 
                   variant="ghost" 
                   size="icon" 
                   className="w-8 h-8 text-neon-red/40 hover:text-neon-red"
                   onClick={(e) => { e.stopPropagation(); onRemove(project.id); }}
                 >
                    <Trash2 className="w-4 h-4" />
                 </NeonButton>
                 <NeonButton 
                   variant="outline" 
                   size="sm" 
                   className="text-[10px] h-8 px-4 font-black tracking-widest uppercase hover:border-primary/50"
                   onClick={(e) => { e.stopPropagation(); onOpenInEditor(project.path); }}
                 >
                   Lanzar
                 </NeonButton>
              </div>
            </div>
          </>
        )}

        {compact && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
               className="w-6 h-6 rounded-md flex items-center justify-center text-neon-red/40 hover:bg-neon-red/10 hover:text-neon-red transition-all"
               onClick={(e) => { e.stopPropagation(); onRemove(project.id); }}
             >
                <Trash2 className="w-3.5 h-3.5" />
             </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
