import {create} from 'zustand';

interface WalletState {
  wallet: boolean;
  setWallet: (value: boolean) => void;
}

export const useWalletHook = create<WalletState>((set) => ({
  wallet: false,
  setWallet: (value) => set({ wallet: value }),
}));