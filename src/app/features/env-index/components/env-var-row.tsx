import { Check, ChevronDown, Copy, Eye, EyeOff } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { EnvCopyFormat, EnvVarEntry } from '@org/models';
import { GlowBadge, NeonButton } from '@org/ui-kit';
import {
  copyEnvText,
  formatEnvCopy,
  isSystemEnvEntry,
  maskEnvValue,
} from '@/lib/env-index-utils';

export interface EnvVarRowProps {
  entry: EnvVarEntry;
  duplicateKey?: boolean;
  compact?: boolean;
  onCopied?: () => void;
}

export const EnvVarRow: React.FC<EnvVarRowProps> = ({
  entry,
  duplicateKey = false,
  compact = false,
  onCopied,
}) => {
  const { t } = useTranslation();
  const [revealed, setRevealed] = React.useState(entry.isExample);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const handleCopy = async (format: EnvCopyFormat) => {
    await copyEnvText(formatEnvCopy(entry, format));
    setMenuOpen(false);
    setCopied(true);
    onCopied?.();
    window.setTimeout(() => setCopied(false), 1500);
  };

  const displayValue = revealed || entry.isExample ? entry.value : maskEnvValue(entry);
  const system = isSystemEnvEntry(entry);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 hover:border-primary/30 transition-colors ${
        compact ? 'py-2' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-primary truncate">{entry.key}</span>
          {duplicateKey ? (
            <GlowBadge size="xs" color="blue">
              {t('envIndex.duplicateKey')}
            </GlowBadge>
          ) : null}
          {entry.isExample ? (
            <GlowBadge size="xs" color="green">
              {t('envIndex.exampleFile')}
            </GlowBadge>
          ) : null}
          {system ? (
            <GlowBadge size="xs" color="yellow">
              {t('envIndex.systemBadge')}
            </GlowBadge>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
          {system ? (
            <span className="font-semibold text-foreground/80">{t('envIndex.systemSource')}</span>
          ) : (
            <>
              <span className="font-semibold text-foreground/80">{entry.projectName}</span>
              <span aria-hidden>·</span>
              <span className="font-mono truncate">{entry.fileName}</span>
            </>
          )}
          {!compact && !system ? (
            <>
              <span aria-hidden>·</span>
              <span>
                {t('envIndex.line', { line: entry.lineNumber })}
              </span>
            </>
          ) : null}
        </div>
        <p className="mt-1.5 font-mono text-[11px] text-muted-foreground truncate" title={revealed ? entry.value : undefined}>
          {displayValue || t('envIndex.emptyValue')}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!entry.isExample ? (
          <NeonButton
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title={revealed ? t('envIndex.hideValue') : t('envIndex.revealValue')}
            aria-label={revealed ? t('envIndex.hideValue') : t('envIndex.revealValue')}
            onClick={() => setRevealed((v) => !v)}
          >
            {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </NeonButton>
        ) : null}

        <div className="relative" ref={menuRef}>
          <NeonButton
            variant={copied ? 'primary' : 'outline'}
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-[10px] font-black uppercase tracking-wider"
            onClick={() => (copied ? undefined : setMenuOpen((o) => !o))}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                {t('envIndex.copied')}
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                {t('envIndex.copy')}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </>
            )}
          </NeonButton>

          {menuOpen ? (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-xl">
              <button
                type="button"
                className="w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted/60"
                onClick={() => void handleCopy('line')}
              >
                {t('envIndex.copyLine')}
              </button>
              <button
                type="button"
                className="w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted/60"
                onClick={() => void handleCopy('key')}
              >
                {t('envIndex.copyKey')}
              </button>
              <button
                type="button"
                className="w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted/60"
                onClick={() => void handleCopy('value')}
              >
                {t('envIndex.copyValue')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
