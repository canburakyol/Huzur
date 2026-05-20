import { StateCreator } from "zustand";
import { AppStoreState, FocusSlice } from "./types";

export const createFocusSlice: StateCreator<
  AppStoreState,
  [],
  [],
  FocusSlice
> = (set) => ({
  isFocusMode: false,
  toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
  enableFocusMode: () => set({ isFocusMode: true }),
  disableFocusMode: () => set({ isFocusMode: false }),
});
