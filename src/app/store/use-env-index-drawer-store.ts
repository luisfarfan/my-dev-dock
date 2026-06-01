import { create } from 'zustand';

interface EnvIndexDrawerState {
  isOpen: boolean;
  filterProjectId: string | null;
  open: (projectId?: string) => void;
  close: () => void;
}

export const useEnvIndexDrawerStore = create<EnvIndexDrawerState>((set) => ({
  isOpen: false,
  filterProjectId: null,
  open: (projectId) => set({ isOpen: true, filterProjectId: projectId ?? null }),
  close: () => set({ isOpen: false, filterProjectId: null }),
}));
