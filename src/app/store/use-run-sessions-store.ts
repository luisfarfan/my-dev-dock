import { listen } from '@tauri-apps/api/event';
import { create } from 'zustand';
import type { RunSession } from '@org/models';
import { getRunService } from '@org/services';
import { isTauriRuntime } from '@/app/shared/utils/is-tauri-runtime';

interface RunSessionsState {
  sessions: RunSession[];
  outputBySession: Record<string, string>;
  activeSessionId: string | null;
  drawerOpen: boolean;
  hydrated: boolean;
  refreshSessions: () => Promise<void>;
  appendOutput: (sessionId: string, data: string) => void;
  markExited: (sessionId: string, exitCode?: number) => void;
  setActiveSessionId: (sessionId: string | null) => void;
  openDrawer: (sessionId?: string) => void;
  closeDrawer: () => void;
  killSession: (sessionId: string) => Promise<void>;
  killAllRunning: () => Promise<void>;
  writeToActive: (data: string) => Promise<void>;
  registerFromRun: (session: RunSession) => void;
}

export const useRunSessionsStore = create<RunSessionsState>((set, get) => ({
  sessions: [],
  outputBySession: {},
  activeSessionId: null,
  drawerOpen: false,
  hydrated: false,

  refreshSessions: async () => {
    const sessions = await getRunService().listSessions();
    set({ sessions, hydrated: true });
  },

  appendOutput: (sessionId, data) => {
    set((state) => ({
      outputBySession: {
        ...state.outputBySession,
        [sessionId]: (state.outputBySession[sessionId] ?? '') + data,
      },
    }));
  },

  markExited: (sessionId, exitCode) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, status: 'exited', exitCode } : s,
      ),
    }));
  },

  setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),

  openDrawer: (sessionId) => {
    set({
      drawerOpen: true,
      activeSessionId: sessionId ?? get().activeSessionId ?? get().sessions[0]?.id ?? null,
    });
  },

  closeDrawer: () => set({ drawerOpen: false }),

  killSession: async (sessionId) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, status: 'exited', exitCode: 130 } : s,
      ),
    }));
    try {
      await getRunService().killSession(sessionId);
    } finally {
      void get().refreshSessions();
    }
  },

  killAllRunning: async () => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.status === 'running' ? { ...s, status: 'exited', exitCode: 130 } : s,
      ),
    }));
    try {
      await getRunService().killAllSessions();
    } finally {
      void get().refreshSessions();
    }
  },

  writeToActive: async (data) => {
    const sessionId = get().activeSessionId;
    if (!sessionId) return;
    await getRunService().writeSession(sessionId, data);
  },

  registerFromRun: (session) => {
    set((state) => ({
      sessions: [session, ...state.sessions.filter((s) => s.id !== session.id)],
      outputBySession: {
        ...state.outputBySession,
        [session.id]: state.outputBySession[session.id] ?? '',
      },
      activeSessionId: session.id,
      drawerOpen: true,
    }));
  },
}));

let listenersStarted = false;

export function ensureRunSessionListeners(): void {
  if (!isTauriRuntime() || listenersStarted) return;
  listenersStarted = true;

  void (async () => {
    await useRunSessionsStore.getState().refreshSessions();

    await listen<{ sessionId: string; data: string }>('run-session-output', (event) => {
      useRunSessionsStore.getState().appendOutput(event.payload.sessionId, event.payload.data);
    });

    await listen<{ sessionId: string; exitCode?: number }>('run-session-exit', (event) => {
      useRunSessionsStore
        .getState()
        .markExited(event.payload.sessionId, event.payload.exitCode);
      void useRunSessionsStore.getState().refreshSessions();
    });
  })();
}
