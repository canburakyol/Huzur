import { StateCreator } from "zustand";
import { AppStoreState, FocusSlice } from "./types";

export const createFocusSlice: StateCreator<
  AppStoreState,
  [],
  [],
  FocusSlice
> = (set) => ({
  isFocusMode: false,
  activeFocusSession: null,
  setActiveFocusSession: (activeFocusSession) => set({ activeFocusSession }),
  toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
  enableFocusMode: () => set({ isFocusMode: true }),
  disableFocusMode: () => set({ isFocusMode: false }),
});
