import { create } from "zustand";

export type TSessionData = {
  address: string;
  authenticated: boolean;
  tempNonce: string;
  tempAddress: string;
};

export const defaultSession: TSessionData = {
  address: "",
  authenticated: false,
  tempNonce: "",
  tempAddress: "",
};

export const useSessionStore = create<TSessionData>(() => ({ ...defaultSession }));
