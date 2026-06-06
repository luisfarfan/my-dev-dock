import { AnimatePresence, motion } from 'framer-motion';
import { Square, TerminalSquare, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { GlowBadge, NeonButton } from '@org/ui-kit';
import { EmbeddedTerminalPane } from '@/app/features/run/components/embedded-terminal-pane';
import { useRunSessionsStore } from '@/app/store/use-run-sessions-store';

export interface RunProcessesDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const RunProcessesDrawer: React.FC<RunProcessesDrawerProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const sessions = useRunSessionsStore((s) => s.sessions);
  const outputBySession = useRunSessionsStore((s) => s.outputBySession);
  const activeSessionId = useRunSessionsStore((s) => s.activeSessionId);
  const setActiveSessionId = useRunSessionsStore((s) => s.setActiveSessionId);
  const killSession = useRunSessionsStore((s) => s.killSession);
  const killAllRunning = useRunSessionsStore((s) => s.killAllRunning);

  const runningCount = sessions.filter((s) => s.status === 'running').length;
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? sessions[0] ?? null;

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open || activeSession) return;
    if (sessions[0]) setActiveSessionId(sessions[0].id);
  }, [open, activeSession, sessions, setActiveSessionId]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label={t('runProcesses.close')}
            className="fixed inset-0 z-100 bg-modal-backdrop backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-110 mx-auto flex h-[min(78vh,640px)] w-full max-w-6xl flex-col rounded-t-[1.75rem] border border-border bg-card/95 shadow-2xl backdrop-blur-xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-foreground">
                  <TerminalSquare className="h-4 w-4 text-neon-yellow" />
                  {t('runProcesses.title')}
                </h2>
                <p className="mt-1 text-[11px] text-muted-foreground">{t('runProcesses.subtitle')}</p>
              </div>
              <div className="flex items-center gap-2">
                {runningCount > 0 ? (
                  <GlowBadge size="xs" color="yellow">
                    {t('runProcesses.runningCount', { count: runningCount })}
                  </GlowBadge>
                ) : null}
                <NeonButton variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}>
                  <X className="h-4 w-4" />
                </NeonButton>
              </div>
            </header>

            <div className="flex min-h-0 flex-1">
              <aside className="flex w-56 shrink-0 flex-col border-r border-border/70 sm:w-64">
                <div className="flex-1 overflow-y-auto p-2">
                  {sessions.length === 0 ? (
                    <p className="px-2 py-8 text-center text-[11px] text-muted-foreground">
                      {t('runProcesses.empty')}
                    </p>
                  ) : (
                    sessions.map((session) => {
                      const selected = session.id === activeSession?.id;
                      return (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => setActiveSessionId(session.id)}
                          className={`mb-1.5 w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                            selected
                              ? 'border-neon-yellow/40 bg-neon-yellow/10'
                              : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-bold text-foreground">
                              {session.projectName}
                            </span>
                            <GlowBadge
                              size="xs"
                              color={session.status === 'running' ? 'green' : 'blue'}
                            >
                              {session.status === 'running'
                                ? t('runProcesses.statusRunning')
                                : t('runProcesses.statusExited')}
                            </GlowBadge>
                          </div>
                          <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                            {session.command}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
                {runningCount > 0 ? (
                  <div className="border-t border-border/70 p-2">
                    <NeonButton
                      variant="outline"
                      size="sm"
                      className="h-8 w-full gap-1.5 text-[10px] font-black uppercase"
                      onClick={() => void killAllRunning()}
                    >
                      <Square className="h-3 w-3 fill-current" />
                      {t('runProcesses.stopAll')}
                    </NeonButton>
                  </div>
                ) : null}
              </aside>

              <div className="flex min-w-0 flex-1 flex-col p-4">
                {activeSession ? (
                  <>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {activeSession.projectName}
                        </p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground">
                          {activeSession.command}
                        </p>
                      </div>
                      {activeSession.status === 'running' ? (
                        <NeonButton
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-[10px] font-black uppercase"
                          onClick={() => void killSession(activeSession.id)}
                        >
                          <Square className="h-3 w-3 fill-current" />
                          {t('runProcesses.stop')}
                        </NeonButton>
                      ) : null}
                    </div>
                    <div className="min-h-0 flex-1">
                      <EmbeddedTerminalPane
                        key={activeSession.id}
                        sessionId={activeSession.id}
                        liveOutput={outputBySession[activeSession.id] ?? ''}
                        disabled={activeSession.status !== 'running'}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
                    <TerminalSquare className="h-10 w-10 opacity-30" />
                    <p className="text-xs">{t('runProcesses.pickSession')}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
};
