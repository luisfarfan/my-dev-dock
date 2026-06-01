import { create } from 'zustand';

const STORAGE_KEY = 'dashboard:activeWorkspaceId';

function readStoredId(): string | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v && v !== 'all' ? v : null;
}

interface ActiveWorkspaceState {
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
}

export const useActiveWorkspaceStore = create<ActiveWorkspaceState>((set) => ({
  activeWorkspaceId: readStoredId(),
  setActiveWorkspaceId: (id) => {
    if (typeof window !== 'undefined') {
      if (id) window.localStorage.setItem(STORAGE_KEY, id);
      else window.localStorage.removeItem(STORAGE_KEY);
    }
    set({ activeWorkspaceId: id });
  },
}));
