import {create} from 'zustand';

interface MnSavedState {
  saved: boolean;
  setSaved: (value: boolean) => void;
}

export const useMnSavedHook = create<MnSavedState>((set) => ({
  saved: false,
  setSaved: (value) => set({ saved: value }),
}));