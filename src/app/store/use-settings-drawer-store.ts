import { create } from 'zustand';

interface SettingsDrawerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useSettingsDrawerStore = create<SettingsDrawerState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
