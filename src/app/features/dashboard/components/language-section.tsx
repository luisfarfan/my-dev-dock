import { Check } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AppLocale } from '@/app/i18n/i18n';
import { useLocaleStore } from '@/app/store/use-locale-store';

const LOCALES: { id: AppLocale; labelKey: 'language.es' | 'language.en' }[] = [
  { id: 'es', labelKey: 'language.es' },
  { id: 'en', labelKey: 'language.en' },
];

export const LanguageSection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <section className="space-y-3 mt-6">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{t('language.section')}</h3>
      <p className="text-[11px] text-muted-foreground">{t('language.hint')}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {LOCALES.map(({ id, labelKey }) => {
          const selected = locale === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setLocale(id)}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                selected
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-muted/40 hover:border-primary/25'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-foreground">{t(labelKey)}</p>
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
