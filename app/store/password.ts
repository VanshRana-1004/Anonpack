import {create} from 'zustand';

interface PassState {
  pass: string;
  setPass: (value: string) => void;
}

export const usePassHook = create<PassState>((set) => ({
  pass: '',
  setPass: (value) => set({ pass: value }),
}));