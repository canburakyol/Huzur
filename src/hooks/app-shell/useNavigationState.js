import { useEffect, useState } from 'react';

export function useNavigationState() {
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splashShown'));
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    const handleOpenFeature = (e) => setActiveFeature(e.detail);
    const handleSetActiveTab = (e) => {
      const tab = e?.detail;
      if (typeof tab === 'string' && tab.length > 0) {
        setActiveTab(tab);
      }
    };

    window.addEventListener('openFeature', handleOpenFeature);
    window.addEventListener('setActiveTab', handleSetActiveTab);

    return () => {
      window.removeEventListener('openFeature', handleOpenFeature);
      window.removeEventListener('setActiveTab', handleSetActiveTab);
    };
  }, []);

  const hideSplash = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
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
    hideSplash
  };
}
