import { useCallback } from "react";
import { useAppStore } from "../../stores/useAppStore";
import { featureConfig } from "../../data/featureConfig";
import { ANALYTICS_EVENTS, logEvent } from "../../services/analyticsService";
import { markFirstActivationAction } from "../../services/activationService";

interface InviteModalContext {
  source: string;
}

const TAB_LABELS: Record<string, string> = {
  home: "Home",
  quran: "Quran",
  assistant: "Assistant",
  community: "Community",
  prayers: "Prayer Times",
};

const buildTabScreenPayload = (tab: string, source: string) => ({
  screen_name: `tab_${tab}`,
  screen_class: `tab_${tab}`,
  screen_title: TAB_LABELS[tab] || tab,
  screen_type: "tab",
  tab,
  source,
});

const buildFeatureScreenPayload = (feature: string, source: string) => {
  const config = featureConfig[feature];

  return {
    screen_name: `feature_${feature}`,
    screen_class: `feature_${feature}`,
    screen_title: feature,
    screen_type: "feature",
    feature,
    feature_category: config?.category || "unknown",
    feature_module: config?.module || "unknown",
    has_upgrade: config?.hasUpgrade === true,
    source,
  };
};

export function useNavigationState() {
  const activeFeature = useAppStore((s) => s.activeFeature);
  const activeTab = useAppStore((s) => s.activeTab);
  const showHamburgerMenu = useAppStore((s) => s.showHamburgerMenu);
  const showMoodSelector = useAppStore((s) => s.showMoodSelector);
  const showSplash = useAppStore((s) => s.showSplash);
  const showInviteModal = useAppStore((s) => s.showInviteModal);
  const inviteModalContext = useAppStore((s) => s.inviteModalContext);

  const setActiveFeatureState = useAppStore((s) => s.setActiveFeature);
  const setActiveTabState = useAppStore((s) => s.setActiveTab);
  const setShowHamburgerMenu = useAppStore((s) => s.setShowHamburgerMenu);
  const setShowMoodSelector = useAppStore((s) => s.setShowMoodSelector);
  const hideSplashState = useAppStore((s) => s.hideSplash);
  const openInviteModalState = useAppStore((s) => s.openInviteModal);
  const closeInviteModalState = useAppStore((s) => s.closeInviteModal);

  const setActiveFeature = useCallback(
    (feature: string | null, source = "direct"): boolean => {
      if (feature && !featureConfig[feature]) {
        logEvent(ANALYTICS_EVENTS.FEATURE_OPEN_FAILED, {
          feature,
          source,
          reason: "unknown_feature",
        });
        setActiveFeatureState(null);
        return false;
      }

      setActiveFeatureState(feature);
      if (feature) {
        const featurePayload = buildFeatureScreenPayload(feature, source);
        logEvent(ANALYTICS_EVENTS.FEATURE_OPENED, featurePayload);
        logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, featurePayload);
        logEvent(ANALYTICS_EVENTS.FEATURE_SCREEN_VIEWED, featurePayload);
        markFirstActivationAction({ feature, source });
      }
      return true;
    },
    [setActiveFeatureState]
  );

  const setActiveTab = useCallback(
    (tab: string, source = "direct"): boolean => {
      if (typeof tab !== "string" || tab.length === 0) {
        return false;
      }

      setActiveTabState(tab);
      logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, buildTabScreenPayload(tab, source));
      return true;
    },
    [setActiveTabState]
  );

  const openInviteModal = useCallback(
    (context: InviteModalContext = { source: "invite_modal" }): void => {
      openInviteModalState(context);
    },
    [openInviteModalState]
  );

  const closeInviteModal = useCallback((): void => {
    closeInviteModalState();
  }, [closeInviteModalState]);

  const hideSplash = useCallback((): void => {
    hideSplashState();
  }, [hideSplashState]);

  return {
    activeFeature,
    setActiveFeature,
    activeTab,
    setActiveTab,
    showHamburgerMenu,
    setShowHamburgerMenu,
    showMoodSelector,
    setShowMoodSelector,
    showSplash,
    hideSplash,
    showInviteModal,
    openInviteModal,
    closeInviteModal,
    inviteModalContext,
  };
}
