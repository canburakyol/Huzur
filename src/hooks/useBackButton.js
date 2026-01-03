import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';

/**
 * Android Back Button Handler Hook
 * Handles hardware back button behavior based on current app state
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.showMoodSelector - Whether mood selector is visible
 * @param {string|null} options.activeFeature - Current active feature/screen
 * @param {string} options.activeTab - Current active tab
 * @param {Function} options.setShowMoodSelector - Setter for mood selector visibility
 * @param {Function} options.setActiveFeature - Setter for active feature
 * @param {Function} options.setActiveTab - Setter for active tab
 */
export const useBackButton = ({
  showMoodSelector,
  activeFeature,
  activeTab,
  setShowMoodSelector,
  setActiveFeature,
  setActiveTab
}) => {
  useEffect(() => {
    let backButtonListener;

    const setupBackButton = async () => {
      backButtonListener = await CapacitorApp.addListener('backButton', () => {
        // Priority order: modals -> features -> tabs -> exit
        if (showMoodSelector) {
          setShowMoodSelector(false);
        } else if (activeFeature) {
          setActiveFeature(null);
        } else if (activeTab !== 'home') {
          setActiveTab('home');
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
