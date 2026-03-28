import { LayoutGrid, List, Rocket, Settings } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NeonButton, SearchInput } from '@org/ui-kit';

export interface DashboardHubHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onOpenSettings: () => void;
}

export const DashboardHubHeader: React.FC<DashboardHubHeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenSettings,
}) => {
  const { t } = useTranslation();
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-border relative z-10">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center p-2 shadow-[0_0_30px_-5px_rgba(0,255,136,0.3)]">
            <Rocket className="text-black w-7 h-7" />
          </div>
          {t('hub.title')}
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2 opacity-60">
          {t('hub.subtitle')}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group hidden lg:block">
          <SearchInput
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('hub.searchPlaceholder')}
            className="min-w-[320px]"
            data-hub-search-input=""
          />
        </div>
        <div className="w-px h-10 bg-border mx-2" />
        <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/50">
          <NeonButton
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="icon"
            className="w-9 h-9"
            onClick={() => onViewModeChange('grid')}
            title={t('hub.viewCompact')}
          >
            <LayoutGrid className="w-4 h-4" />
          </NeonButton>
          <NeonButton
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="icon"
            className="w-9 h-9"
            onClick={() => onViewModeChange('list')}
            title={t('hub.viewDetailed')}
          >
            <List className="w-4 h-4" />
          </NeonButton>
        </div>
        <NeonButton
          variant="ghost"
          size="icon"
          className="w-12 h-12 border border-border group hover:border-primary/50 transition-colors"
          onClick={onOpenSettings}
        >
          <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </NeonButton>
      </div>
    </header>
  );
};
