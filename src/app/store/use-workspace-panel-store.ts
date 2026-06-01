import { create } from 'zustand';

const STORAGE_KEY = 'dashboard:workspacePanelExpanded';

function readExpanded(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(STORAGE_KEY) !== 'false';
}

interface WorkspacePanelState {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  toggleExpanded: () => void;
}

export const useWorkspacePanelStore = create<WorkspacePanelState>((set, get) => ({
  expanded: readExpanded(),
  setExpanded: (value) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    }
    set({ expanded: value });
  },
  toggleExpanded: () => {
    get().setExpanded(!get().expanded);
  },
}));
