import { useCallback } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { featureConfig } from '../../data/featureConfig';
import { ANALYTICS_EVENTS, logEvent } from '../../services/analyticsService';
import { markFirstActivationAction } from '../../services/activationService';

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
    (feature, source = 'direct') => {
      if (feature && !featureConfig[feature]) {
        logEvent(ANALYTICS_EVENTS.FEATURE_OPEN_FAILED, {
          feature,
          source,
          reason: 'unknown_feature',
        });
        setActiveFeatureState(null);
        return false;
      }

      setActiveFeatureState(feature);
      if (feature) {
        logEvent(ANALYTICS_EVENTS.FEATURE_OPENED, { feature, source });
        markFirstActivationAction({ feature, source });
      }
      return true;
    },
    [setActiveFeatureState]
  );

  const setActiveTab = useCallback(
    (tab, source = 'direct') => {
      if (typeof tab !== 'string' || tab.length === 0) {
        return false;
      }

      setActiveTabState(tab);
      logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
        screen_name: tab,
        screen_class: `tab_${tab}`,
        source,
      });
      return true;
    },
    [setActiveTabState]
  );

  const openInviteModal = useCallback(
    (context = { source: 'invite_modal' }) => {
      openInviteModalState(context);
    },
    [openInviteModalState]
  );

  const closeInviteModal = useCallback(() => {
    closeInviteModalState();
  }, [closeInviteModalState]);

  const hideSplash = useCallback(() => {
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
