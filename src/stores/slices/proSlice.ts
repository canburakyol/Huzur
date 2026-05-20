import { StateCreator } from "zustand";
import { AppStoreState, ProSlice } from "./types";

export const createProSlice: StateCreator<
  AppStoreState,
  [],
  [],
  ProSlice
> = (set) => ({
  isProUser: false,
  setIsProUser: (active: boolean) => set({ isProUser: active }),
});
