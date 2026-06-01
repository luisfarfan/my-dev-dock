import { create } from 'zustand';
import type { EnvVarEntry } from '@org/models';
import { getEnvService } from '@org/services';

export interface ScanEnvVarsOptions {
  /** Include OS process environment (heavier IPC payload). Default false. */
  includeSystem?: boolean;
  force?: boolean;
}

interface EnvIndexState {
  entries: EnvVarEntry[];
  isLoading: boolean;
  error: string | null;
  lastScannedAt: string | null;
  lastIncludeSystem: boolean | null;
  scanEnvVars: (options?: ScanEnvVarsOptions) => Promise<void>;
  clear: () => void;
}

const STALE_MS = 5 * 60 * 1000;

export const useEnvIndexStore = create<EnvIndexState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,
  lastScannedAt: null,
  lastIncludeSystem: null,

  scanEnvVars: async (options = {}) => {
    const includeSystem = options.includeSystem ?? false;
    const force = options.force ?? false;
    const { lastScannedAt, isLoading, entries, lastIncludeSystem } = get();
    if (isLoading) return;
    if (!force && entries.length > 0 && lastScannedAt && lastIncludeSystem === includeSystem) {
      const age = Date.now() - new Date(lastScannedAt).getTime();
      if (age < STALE_MS) return;
    }

    // Stale-while-revalidate: keep showing cached rows while refreshing.
    if (entries.length === 0) {
      set({ isLoading: true, error: null });
    }

    try {
      const scanned = await getEnvService().scanEnvVars({ includeSystem });
      set({
        entries: scanned,
        isLoading: false,
        lastScannedAt: new Date().toISOString(),
        lastIncludeSystem: includeSystem,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  clear: () =>
    set({ entries: [], lastScannedAt: null, lastIncludeSystem: null, error: null }),
}));
