import { Check } from 'lucide-react';
import React from 'react';
import { UI_THEME_IDS, UI_THEME_LABELS } from '@/lib/ui-theme';
import { useUiThemeStore } from '@/app/store/use-ui-theme-store';

export const ThemeAppearanceSection: React.FC = () => {
  const themeId = useUiThemeStore((s) => s.themeId);
  const setThemeId = useUiThemeStore((s) => s.setThemeId);

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Apariencia</h3>
      <p className="text-[11px] text-muted-foreground">
        Tema visual global (Tailwind + variables CSS en <code className="text-primary/90">styles.css</code>).
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {UI_THEME_IDS.map((id) => {
          const { title, hint } = UI_THEME_LABELS[id];
          const selected = themeId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setThemeId(id)}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                selected
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-muted/40 hover:border-primary/25'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-foreground">{title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{hint}</p>
                </div>
                {selected && (
                  <div className="w-7 h-7 shrink-0 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
