import {create} from 'zustand';

interface IntroState {
  intro: boolean;
  setIntro: (value: boolean) => void;
}

export const useIntroHook = create<IntroState>((set) => ({
  intro: false,
  setIntro: (value) => set({ intro: value }),
}));