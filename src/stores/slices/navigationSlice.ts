import { StateCreator } from "zustand";
import { AppStoreState, NavigationSlice, InviteModalContext } from "./types";

export const createNavigationSlice: StateCreator<
  AppStoreState,
  [],
  [],
  NavigationSlice
> = (set) => ({
  activeFeature: null,
  activeTab: "home",
  showHamburgerMenu: false,
  showMoodSelector: false,
  showSplash: false,
  showInviteModal: false,
  inviteModalContext: { source: "invite_modal" } as InviteModalContext,

  setActiveFeature: (feature: string | null) => set({ activeFeature: feature }),
  setActiveTab: (tab: string) => set({ activeTab: tab }),
  setShowHamburgerMenu: (show: boolean) => set({ showHamburgerMenu: show }),
  setShowMoodSelector: (show: boolean) => set({ showMoodSelector: show }),
  hideSplash: () => {
    sessionStorage.setItem("splashShown", "true");
    set({ showSplash: false });
  },
  openInviteModal: (context: string | InviteModalContext = { source: "invite_modal" }) => {
    const safeContext =
      typeof context === "string"
        ? { source: context }
        : context && typeof context === "object"
        ? context
        : { source: "invite_modal" };
    set({ showInviteModal: true, inviteModalContext: safeContext });
  },
  closeInviteModal: () => set({ showInviteModal: false }),
});
