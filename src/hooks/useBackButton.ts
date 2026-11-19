import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";

type UseBackButtonOptions = {
  showMoodSelector: boolean;
  showHamburgerMenu?: boolean;
  activeFeature: string | null;
  activeTab: string;
  setShowMoodSelector: (show: boolean) => void;
  setShowHamburgerMenu?: (show: boolean) => void;
  setActiveFeature: (feature: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const useBackButton = ({
  showMoodSelector,
  showHamburgerMenu = false,
  activeFeature,
  activeTab,
  setShowMoodSelector,
  setShowHamburgerMenu,
  setActiveFeature,
  setActiveTab,
}: UseBackButtonOptions): void => {
  useEffect(() => {
    let backButtonListener: { remove: () => void } | undefined;
    let disposed = false;

    const setupBackButton = async () => {
      const listener = await CapacitorApp.addListener("backButton", () => {
        if (showMoodSelector) {
          setShowMoodSelector(false);
        } else if (showHamburgerMenu && setShowHamburgerMenu) {
          setShowHamburgerMenu(false);
        } else if (activeFeature) {
          setActiveFeature(null);
        } else if (activeTab !== "home") {
          setActiveTab("home");
        } else {
          CapacitorApp.exitApp();
        }
      });
      // The effect may have been cleaned up while addListener was pending; never leave a stale listener behind.
      if (disposed) {
        listener.remove();
      } else {
        backButtonListener = listener;
      }
    };

    void setupBackButton();

    return () => {
      disposed = true;
      backButtonListener?.remove();
    };
  }, [activeFeature, activeTab, showMoodSelector, showHamburgerMenu, setShowMoodSelector, setShowHamburgerMenu, setActiveFeature, setActiveTab]);
};

export default useBackButton;
