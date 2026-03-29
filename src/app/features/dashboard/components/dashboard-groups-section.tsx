import { AnimatePresence, motion } from 'framer-motion';
import { Layers, Plus, Users } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group, Project } from '@org/models';
import { GlowBadge, NeonButton } from '@org/ui-kit';
import { GroupSpace } from '@/app/features/groups';

export interface DashboardGroupsSectionProps {
  groups: Group[];
  projects: Project[];
  editingGroupId: string | null;
  onEditingGroupIdChange: (id: string | null) => void;
  onCreateGroup: () => Promise<string>;
  onUpdateGroup: (group: Group) => void;
  onDeleteGroup: (groupId: string) => void;
  onRemoveProjectFromGroup: (groupId: string, projectId: string) => void;
  onLaunchGroup: (groupId: string) => void;
  onCreateRaycastLauncher: (group: Group) => void;
}

export const DashboardGroupsSection: React.FC<DashboardGroupsSectionProps> = ({
  groups,
  projects,
  editingGroupId,
  onEditingGroupIdChange,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onRemoveProjectFromGroup,
  onLaunchGroup,
  onCreateRaycastLauncher,
}) => {
  const { t } = useTranslation();
  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-foreground">{t('groups.title')}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <GlowBadge size="xs" color="green">
                {groups.length} {t('groups.configured')}
              </GlowBadge>
              <span className="text-[10px] font-bold text-muted-foreground opacity-40 italic">{t('groups.hint')}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground/65">
                {t('footer.dropHint')}
              </span>
            </div>
          </div>
        </div>

        <NeonButton
          variant="outline"
          className="h-11 px-8 text-xs font-black uppercase tracking-widest border-border hover:border-primary/50 group gap-3"
          onClick={async () => {
            const id = await onCreateGroup();
            onEditingGroupIdChange(id);
          }}
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          {t('groups.newCluster')}
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
                projectsInGroup={projects.filter((p) => group.projectIds.includes(p.id))}
                isEditingName={editingGroupId === group.id}
                isDndActive={true}
                onRename={(newName) => {
                  onUpdateGroup({ ...group, name: newName });
                  onEditingGroupIdChange(null);
                }}
                onDelete={() => onDeleteGroup(group.id)}
                onEditToggle={() =>
                  onEditingGroupIdChange(editingGroupId === group.id ? null : group.id)
                }
                onDndToggle={() => console.log('dnd toggled')}
                onRemoveProject={(pid) => onRemoveProjectFromGroup(group.id, pid)}
                onLaunch={() => onLaunchGroup(group.id)}
                onCreateRaycastLauncher={() => onCreateRaycastLauncher(group)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {groups.length === 0 && (
          <div className="col-span-full py-16 border-2 border-dashed border-border rounded-[2.5rem] flex items-center justify-center bg-muted/20">
            <div className="flex flex-col items-center gap-4 opacity-20">
              <Users className="w-12 h-12" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('groups.empty')}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
