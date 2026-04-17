import { useEffect, useState } from 'react';

export function useNavigationState() {
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splashShown'));
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteModalContext, setInviteModalContext] = useState({ source: 'invite_modal' });

  useEffect(() => {
    const handleOpenFeature = (e) => setActiveFeature(e.detail);
    const handleSetActiveTab = (e) => {
      const tab = e?.detail;
      if (typeof tab === 'string' && tab.length > 0) {
        setActiveTab(tab);
      }
    };
    const handleOpenInviteModal = (e) => {
      const detail = e?.detail;
      const context = typeof detail === 'string'
        ? { source: detail }
        : detail && typeof detail === 'object'
          ? detail
          : { source: 'invite_modal' };
      setInviteModalContext(context);
      setShowInviteModal(true);
    };

    window.addEventListener('openFeature', handleOpenFeature);
    window.addEventListener('setActiveTab', handleSetActiveTab);
    window.addEventListener('openInviteModal', handleOpenInviteModal);

    return () => {
      window.removeEventListener('openFeature', handleOpenFeature);
      window.removeEventListener('setActiveTab', handleSetActiveTab);
      window.removeEventListener('openInviteModal', handleOpenInviteModal);
    };
  }, []);

  const hideSplash = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  const openInviteModal = (context = { source: 'invite_modal' }) => {
    const safeContext = typeof context === 'string'
      ? { source: context }
      : context && typeof context === 'object'
        ? context
        : { source: 'invite_modal' };
    setInviteModalContext(safeContext);
    setShowInviteModal(true);
  };

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
