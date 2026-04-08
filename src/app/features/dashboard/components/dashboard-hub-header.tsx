import { ArrowUpDown, Dock, LayoutGrid, List, Minimize2, Settings } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NeonButton, SearchInput } from '@org/ui-kit';

export interface DashboardHubHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  showGroupsFirst: boolean;
  onToggleSectionOrder: () => void;
  isMinimalView: boolean;
  onToggleMinimalView: () => void;
  onOpenSettings: () => void;
}

export const DashboardHubHeader: React.FC<DashboardHubHeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showGroupsFirst,
  onToggleSectionOrder,
  isMinimalView,
  onToggleMinimalView,
  onOpenSettings,
}) => {
  const { t } = useTranslation();
  const headerRef = React.useRef<HTMLElement | null>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const scrollContainer = headerEl.closest('main');
    if (!scrollContainer) return;

    const onScroll = () => {
      setIsScrolled(scrollContainer.scrollTop > 12);
    };

    onScroll();
    scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scrollContainer.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 rounded-2xl border-b px-3 transition-all duration-400 sm:px-4 lg:px-5 ${
        isScrolled
          ? 'border-border/60 bg-card/55 pb-3 pt-2 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-xl'
          : 'border-border/25 bg-card/20 pb-4 pt-2 backdrop-blur-md'
      }`}
    >
      <div
        className={`relative z-10 flex flex-col justify-between transition-all duration-400 md:flex-row md:items-center ${
          isScrolled ? 'gap-3' : 'gap-5'
        }`}
      >
      <div>
        <h1 className="flex items-center gap-3 transition-all duration-400">
          <div
            className={`rounded-2xl bg-linear-to-br from-neon-green to-neon-blue flex items-center justify-center p-2 shadow-[0_0_30px_-5px_rgba(0,255,136,0.3)] transition-all duration-400 ${
              isScrolled ? 'h-10 w-10' : 'h-12 w-12'
            }`}
          >
            <Dock className="h-6 w-6 text-black md:h-7 md:w-7" strokeWidth={2.25} />
          </div>
          <span
            className={`font-mono font-bold tracking-tight text-foreground transition-all duration-400 ${
              isScrolled ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'
            }`}
            translate="no"
          >
            <span className="text-primary/55" aria-hidden="true">
              &lt;
            </span>
            {t('hub.title')}
            <span className="text-primary/55" aria-hidden="true">
              {' '}
              /&gt;
            </span>
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {!isMinimalView ? (
          <>
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
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
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
              <div className="mx-0.5 h-6 w-px bg-border" />
              <NeonButton
                variant={isMinimalView ? 'primary' : 'ghost'}
                size="icon"
                className="w-9 h-9"
                onClick={onToggleMinimalView}
                title={
                  isMinimalView
                    ? t('minimalView.disable')
                    : t('minimalView.enable')
                }
              >
                <Minimize2 className="w-4 h-4" />
              </NeonButton>
              <div className="group relative">
                <NeonButton
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={onToggleSectionOrder}
                  title={
                    showGroupsFirst
                      ? t('layoutOrder.ctaProjectsFirst')
                      : t('layoutOrder.ctaGroupsFirst')
                  }
                >
                  <ArrowUpDown className="w-4 h-4" />
                </NeonButton>
                <span className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] font-bold text-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  {showGroupsFirst
                    ? t('layoutOrder.ctaProjectsFirst')
                    : t('layoutOrder.ctaGroupsFirst')}
                </span>
              </div>
            </div>
          </>
        ) : null}
        <NeonButton
          variant="ghost"
          size="icon"
          className="w-12 h-12 border border-border group hover:border-primary/50 transition-colors"
          onClick={onOpenSettings}
        >
          <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </NeonButton>
      </div>
      </div>
    </header>
  );
};
