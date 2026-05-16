import { useCallback, useEffect, useState } from 'react';
import { featureConfig } from '../../data/featureConfig';
import { ANALYTICS_EVENTS, logEvent } from '../../services/analyticsService';
import { markFirstActivationAction } from '../../services/activationService';

export function useNavigationState() {
  const [activeFeature, setActiveFeatureState] = useState(null);
  const [activeTab, setActiveTabState] = useState('home');
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splashShown'));
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteModalContext, setInviteModalContext] = useState({ source: 'invite_modal' });

  const hideSplash = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  const setActiveFeature = useCallback((feature, source = 'direct') => {
    if (feature && !featureConfig[feature]) {
      logEvent(ANALYTICS_EVENTS.FEATURE_OPEN_FAILED, {
        feature,
        source,
        reason: 'unknown_feature'
      });
      setActiveFeatureState(null);
      return false;
    }

    setActiveFeatureState(feature);
    if (feature) {
      logEvent(ANALYTICS_EVENTS.FEATURE_OPENED, {
        feature,
        source
      });
      markFirstActivationAction({ feature, source });
    }
    return true;
  }, []);

  const setActiveTab = useCallback((tab, source = 'direct') => {
    if (typeof tab !== 'string' || tab.length === 0) {
      return false;
    }

    setActiveTabState(tab);
    logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
      screen_name: tab,
      screen_class: `tab_${tab}`,
      source
    });
    return true;
  }, []);

  const openInviteModal = useCallback((context = { source: 'invite_modal' }) => {
    const safeContext = typeof context === 'string'
      ? { source: context }
      : context && typeof context === 'object'
        ? context
        : { source: 'invite_modal' };
    setInviteModalContext(safeContext);
    setShowInviteModal(true);
  }, []);

  useEffect(() => {
    const handleOpenFeature = (e) => setActiveFeature(e.detail, 'event');
    const handleSetActiveTab = (e) => {
      const tab = e?.detail;
      if (typeof tab === 'string' && tab.length > 0) {
        setActiveTab(tab, 'event');
      }
    };
    const handleOpenInviteModal = (e) => {
      openInviteModal(e?.detail);
    };

    window.addEventListener('openFeature', handleOpenFeature);
    window.addEventListener('setActiveTab', handleSetActiveTab);
    window.addEventListener('openInviteModal', handleOpenInviteModal);

    return () => {
      window.removeEventListener('openFeature', handleOpenFeature);
      window.removeEventListener('setActiveTab', handleSetActiveTab);
      window.removeEventListener('openInviteModal', handleOpenInviteModal);
    };
  }, [openInviteModal, setActiveFeature, setActiveTab]);

  const closeInviteModal = () => {
    setShowInviteModal(false);
  };

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
    setShowSplash,
    showInviteModal,
    setShowInviteModal,
    inviteModalContext,
    openInviteModal,
    closeInviteModal,
    hideSplash
  };
}
