import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettings, EditorType, Group, Project, RaycastLauncherInput } from '@org/models';
import { NeonButton } from '@org/ui-kit';
import { Bolt, Folder, FolderTree, Hammer, Rocket, Terminal, Wrench, X } from 'lucide-react';

function slugify(raw: string): string {
  const slug = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'launcher';
}

export interface RaycastLauncherModalProps {
  open: boolean;
  target: { type: 'project'; project: Project } | { type: 'group'; group: Group } | null;
  settings: AppSettings | null;
  installedEditors: EditorType[];
  onClose: () => void;
  onSubmit: (input: RaycastLauncherInput) => Promise<void>;
  onOpenSettings: () => void;
}

const ICON_PRESETS = [
  { id: 'rocket', label: 'Rocket', Icon: Rocket },
  { id: 'folder', label: 'Folder', Icon: Folder },
  { id: 'folder-tree', label: 'Folder Tree', Icon: FolderTree },
  { id: 'terminal', label: 'Terminal', Icon: Terminal },
  { id: 'hammer', label: 'Hammer', Icon: Hammer },
  { id: 'wrench', label: 'Wrench', Icon: Wrench },
  { id: 'bolt', label: 'Bolt', Icon: Bolt },
] as const;

export const RaycastLauncherModal: React.FC<RaycastLauncherModalProps> = ({
  open,
  target,
  settings,
  installedEditors,
  onClose,
  onSubmit,
  onOpenSettings,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = React.useState('');
  const [filename, setFilename] = React.useState('');
  const [icon, setIcon] = React.useState('rocket');
  const [keywords, setKeywords] = React.useState('');
  const [editor, setEditor] = React.useState<EditorType>('cursor');
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !target) return;
    const baseName = target.type === 'project' ? target.project.name : target.group.name;
    const suffix = target.type === 'project' ? 'project' : 'group';
    setTitle(`${baseName} Launcher`);
    setFilename(slugify(`${baseName}-${suffix}`));
    setIcon(target.type === 'project' ? 'folder' : 'folder-tree');
    setKeywords(baseName.toLowerCase());
    setEditor(settings?.defaultEditor ?? installedEditors[0] ?? 'cursor');
    setError(null);
  }, [open, target, settings?.defaultEditor, installedEditors]);

  if (!open || !target) return null;
  const scriptsPath = settings?.raycastScriptsPath?.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !filename.trim()) {
      setError(t('raycast.form.required'));
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit({
        targetType: target.type,
        targetId: target.type === 'project' ? target.project.id : target.group.id,
        title: title.trim(),
        filename: filename.trim(),
        icon: icon.trim() || undefined,
        keywords: keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
        editor,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-modal-backdrop px-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-[0_0_40px_rgba(0,0,0,0.45)]"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">{t('raycast.form.title')}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {target.type === 'project'
                ? t('raycast.form.subtitleProject', { name: target.project.name })
                : t('raycast.form.subtitleGroup', { name: target.group.name })}
            </p>
          </div>
          <NeonButton type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </NeonButton>
        </div>

        {!scriptsPath ? (
          <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-300">
            <p>{t('raycast.form.pathMissing')}</p>
            <NeonButton
              type="button"
              variant="outline"
              className="mt-2 h-8 px-3 text-[10px] font-black uppercase tracking-wider"
              onClick={onOpenSettings}
            >
              {t('raycast.form.openSettings')}
            </NeonButton>
          </div>
        ) : (
          <p className="mb-4 text-[11px] text-muted-foreground">
            {t('raycast.form.pathLabel')}: <span className="font-mono">{scriptsPath}</span>
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-[11px] font-bold text-foreground">{t('raycast.form.launcherNameLabel')}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
              placeholder={t('raycast.form.launcherName')}
            />
            <p className="text-[10px] text-muted-foreground">{t('raycast.form.launcherNameHelp')}</p>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-bold text-foreground">{t('raycast.form.fileNameLabel')}</span>
            <input
              value={filename}
              onChange={(e) => setFilename(slugify(e.target.value))}
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
              placeholder={t('raycast.form.fileName')}
            />
            <p className="text-[10px] text-muted-foreground">{t('raycast.form.fileNameHelp')}</p>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-bold text-foreground">{t('raycast.form.iconLabel')}</span>
            <div className="grid grid-cols-4 gap-1.5 rounded-lg border border-border bg-muted/20 p-1.5">
              {ICON_PRESETS.map(({ id, label, Icon: PresetIcon }) => {
                const selected = icon === id;
                return (
                  <button
                    key={id}
                    type="button"
                    title={label}
                    aria-label={label}
                    onClick={() => setIcon(id)}
                    className={`flex h-9 w-full items-center justify-center rounded-md border transition-colors ${
                      selected
                        ? 'border-primary/60 bg-primary/15 text-primary'
                        : 'border-border bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    <PresetIcon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">{t('raycast.form.iconHelp')}</p>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-bold text-foreground">{t('raycast.form.editorLabel')}</span>
            <select
              value={editor}
              onChange={(e) => setEditor(e.target.value as EditorType)}
              className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
            >
              {(installedEditors.length > 0 ? installedEditors : ['cursor']).map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground">{t('raycast.form.editorHelp')}</p>
          </label>
        </div>

        <label className="mt-3 block space-y-1">
          <span className="text-[11px] font-bold text-foreground">{t('raycast.form.keywordsLabel')}</span>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
            placeholder={t('raycast.form.keywords')}
          />
          <p className="text-[10px] text-muted-foreground">{t('raycast.form.keywordsHelp')}</p>
        </label>

        {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}

        <div className="mt-4 flex justify-end gap-2">
          <NeonButton type="button" variant="ghost" className="h-9 px-4 text-xs" onClick={onClose}>
            {t('raycast.form.cancel')}
          </NeonButton>
          <NeonButton
            type="submit"
            variant="primary"
            className="h-9 px-4 text-xs font-black uppercase tracking-wider"
            disabled={isSaving || !scriptsPath}
          >
            {isSaving ? t('raycast.form.creating') : t('raycast.form.create')}
          </NeonButton>
        </div>
      </form>
    </div>
  );
};
