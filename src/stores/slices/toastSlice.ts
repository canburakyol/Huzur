import { StateCreator } from "zustand";
import { AppStoreState, ToastSlice, Toast } from "./types";

export const createToastSlice: StateCreator<
  AppStoreState,
  [],
  [],
  ToastSlice
> = (set) => ({
  toasts: [] as Toast[],
  showToast: (message: string, type = "info", duration = 4000) =>
    set((state) => {
      const id = Date.now() + Math.random();
      const next = [...state.toasts, { id, message, type, duration }];
      return { toasts: next.length > 3 ? next.slice(-3) : next };
    }),
  removeToast: (id: number) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
});
