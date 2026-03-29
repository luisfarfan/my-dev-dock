import React from 'react';
import { useTranslation } from 'react-i18next';
import { Project } from '@org/models';
import { GlassCard, NeonButton, GlowBadge } from '@org/ui-kit';
import {
  Folder,
  ArrowUpRight,
  GitBranch,
  GitCommit,
  History,
  Command,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export interface ProjectCardProps {
  project: Project;
  onOpenInEditor: (path: string) => void;
  onRemove: (id: string) => void;
  onCreateRaycastLauncher?: (project: Project) => void;
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
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover backdrop-blur-md border border-border rounded text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover/stack:opacity-100 group-hover/stack:translate-y-0 translate-y-1 pointer-events-none transition-all duration-200 whitespace-nowrap z-100 shadow-lg">
        {name}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-popover" />
      </div>
    </div>
  );
};

function getStackGlow(name: string): string {
  const color = stackColorMap[name.toLowerCase()] || 'A1A1A1';
  return `#${color}`;
}

function gitStatusLabel(status: string, t: (key: string) => string): string {
  if (status === 'clean' || status === 'uncommitted' || status === 'unpushed' || status === 'error') {
    return t(`projectCard.status.${status}`);
  }
  return status.toUpperCase();
}

/** Max height ~2 rows of stack chips in detail view; extra scrolls inside. */
const DETAIL_STACK_SCROLL_MAX_H = 'max-h-[4.75rem]';

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpenInEditor,
  onRemove,
  onCreateRaycastLauncher,
  compact = false,
  isDraggable = false,
}) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `project-${project.id}`,
    data: { project, id: project.id },
    disabled: !isDraggable,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const getGlowColor = (): 'green' | 'blue' | 'yellow' | 'red' => {
    switch (project.git.status) {
      case 'clean':
        return 'green';
      case 'uncommitted':
        return 'yellow';
      case 'unpushed':
        return 'blue';
      case 'error':
        return 'red';
      default:
        return 'blue';
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
        className={`group flex w-full min-w-0 transition-all duration-300 border-border/60 bg-muted/20 hover:bg-muted/35 ${
          compact
            ? 'flex-col items-center p-2 sm:p-3 gap-1.5 sm:gap-2 text-center'
            : 'flex-col overflow-hidden p-6 h-full'
        } ${isDraggable ? 'ring-2 ring-primary/20 bg-primary/2' : ''}`}
        hoverable
        onClick={() => onOpenInEditor(project.path)}
      >
        {isDraggable && (
          <div className="absolute top-2 left-2 text-primary/40 group-hover:text-primary transition-colors">
            <GripVertical className="w-3.5 h-3.5" />
          </div>
        )}

        {compact ? (
          <div className="flex w-full flex-col items-center justify-center gap-2 text-center">
            <div className="flex w-full min-w-0 flex-col items-center justify-center gap-2">
              <div className="flex w-full min-w-0 flex-col items-center justify-center text-center">
                <h3 className="w-full min-w-0 text-center text-[10px] font-black uppercase tracking-tight group-hover:text-foreground transition-colors line-clamp-2 wrap-break-word">
                  {project.name}
                </h3>
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-center gap-2">
              <GlowBadge color={getGlowColor()} size="xs" className="scale-75">
                {gitStatusLabel(project.git.status, t)}
              </GlowBadge>
              <div className="flex gap-1 mt-1">
                {project.stack.slice(0, 3).map((s) => (
                  <div
                    key={s}
                    className="w-5 h-5 rounded-md bg-muted border border-border flex items-center justify-center group/stack"
                  >
                    <StackIcon name={s} className="p-1" />
                  </div>
                ))}
                {project.stack.length > 3 && (
                  <div className="w-5 h-5 rounded-md bg-muted/80 border border-border flex items-center justify-center text-[8px] text-muted-foreground font-black">
                    +{project.stack.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 flex w-full min-w-0 flex-col gap-3">
            <div className="flex min-w-0 items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-foreground/10 to-transparent border border-border flex items-center justify-center p-2 group-hover:border-primary/50 transition-colors shrink-0">
                <Folder className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <div className="min-w-0 flex-1 text-left">
                <div className="flex min-w-0 w-full items-start gap-2">
                  <h3 className="min-w-0 flex-1 text-lg font-bold leading-tight text-foreground group-hover:text-foreground transition-colors line-clamp-3 wrap-break-word">
                    {project.name}
                  </h3>
                  <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-40" />
                </div>
                <p
                  className="mt-1.5 text-left text-[10px] font-mono leading-snug text-muted-foreground/70 transition-colors group-hover:text-muted-foreground line-clamp-2 xl:line-clamp-3 break-all"
                  title={project.path}
                >
                  {project.path}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/25 px-2.5 py-1.5">
              <GlowBadge
                color={getGlowColor()}
                size="xs"
                pulse={project.git.status !== 'clean'}
                className="shrink-0"
              >
                {gitStatusLabel(project.git.status, t)}
              </GlowBadge>
              <div className="h-3.5 w-px shrink-0 bg-border/80" />
              <div className="flex min-w-0 flex-1 items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                <GitBranch className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 truncate" title={project.git.branch}>
                  {project.git.branch}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold text-muted-foreground/90">
                <History className="h-3 w-3 shrink-0" />
                <span className="whitespace-nowrap">
                  {project.git.changesCount > 0
                    ? t('projectCard.changes', { count: project.git.changesCount })
                    : t('projectCard.synced')}
                </span>
              </div>
            </div>
          </div>
        )}

        {!compact && (
          <>
            <div className="flex min-w-0 flex-col gap-3 border-y border-border py-4 mb-4">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/40 border border-border h-10 overflow-hidden">
                <GitCommit className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/40" />
                <span className="text-[10px] text-muted-foreground leading-tight italic line-clamp-2">
                  {project.git.lastCommit}
                </span>
              </div>
            </div>

            <div className="mt-auto flex min-w-0 flex-col gap-3 pt-1">
              <div
                className={`min-w-0 w-full ${DETAIL_STACK_SCROLL_MAX_H} overflow-y-auto overflow-x-hidden pr-0.5 [scrollbar-width:thin]`}
              >
                <div className="flex flex-wrap content-start gap-1.5">
                  {project.stack.map((s) => (
                    <div
                      key={s}
                      className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-card p-1 ring-1 ring-border/30 transition-colors group/stack hover:border-primary/35 hover:ring-primary/20"
                      style={{
                        boxShadow: `0 0 8px ${getStackGlow(s)}28`,
                      }}
                    >
                      <StackIcon name={s} className="h-full w-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex w-full min-w-0 justify-end gap-1.5 opacity-0 translate-y-2 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="group/raycast relative">
                  <NeonButton
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 group-hover:text-primary"
                    title={t('raycast.form.title')}
                    aria-label={t('raycast.form.title')}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateRaycastLauncher?.(project);
                    }}
                  >
                    <Command className="h-4 w-4" />
                  </NeonButton>
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] font-bold text-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover/raycast:opacity-100">
                    {t('raycast.form.title')}
                  </span>
                </div>
                <NeonButton
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-neon-red/40 hover:text-neon-red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(project.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </NeonButton>
                <NeonButton
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 px-4 text-[10px] font-black uppercase tracking-widest hover:border-primary/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenInEditor(project.path);
                  }}
                >
                  {t('projectCard.launch')}
                </NeonButton>
              </div>
            </div>
          </>
        )}

        {compact && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="w-6 h-6 rounded-md flex items-center justify-center text-neon-red/40 hover:bg-neon-red/10 hover:text-neon-red transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(project.id);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
