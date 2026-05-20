import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";

interface UseBackButtonOptions {
  showMoodSelector: boolean;
  activeFeature: string | null;
  activeTab: string;
  setShowMoodSelector: (show: boolean) => void;
  setActiveFeature: (feature: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const useBackButton = ({
  showMoodSelector,
  activeFeature,
  activeTab,
  setShowMoodSelector,
  setActiveFeature,
  setActiveTab,
}: UseBackButtonOptions): void => {
  useEffect(() => {
    let backButtonListener: { remove: () => void } | undefined;

    const setupBackButton = async () => {
      backButtonListener = await CapacitorApp.addListener("backButton", () => {
        if (showMoodSelector) {
          setShowMoodSelector(false);
        } else if (activeFeature) {
          setActiveFeature(null);
        } else if (activeTab !== "home") {
          setActiveTab("home");
        } else {
          CapacitorApp.exitApp();
        }
      });
    };

    setupBackButton();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [activeFeature, activeTab, showMoodSelector, setShowMoodSelector, setActiveFeature, setActiveTab]);
};

export default useBackButton;
