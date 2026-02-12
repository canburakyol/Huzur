import { useCallback, useState, useMemo } from 'react';
import { usePrayerTimes, useStickyNotification, useAndroidWidget } from '../hooks/usePrayerTimes';
import { useLocationConsent } from '../hooks/useLocationConsent';
import { useAppInit } from '../hooks/useAppInit';
import { useDailyContent } from '../hooks/useDailyContent';
import { useDirection } from '../hooks/useDirection';
import { useMobileFeatures } from '../hooks/useMobileFeatures';
import { AppInitContext } from './appInitContext';

export const AppInitProvider = ({ children }) => {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splashShown'));

  // Prayer Times Hook
  const {
    timings,
    nextPrayer,
    loading,
    error,
    showWelcome,
    fetchPrayerTimes,
    handleEnableNotifications,
    handleCloseWelcome
  } = usePrayerTimes();

  // Location & Weather Hook
  const handleLocationUpdate = useCallback((coords) => {
    fetchPrayerTimes(coords);
  }, [fetchPrayerTimes]);

  const {
    weather,
    locationName,
    showLocationPrompt,
    locationConsentGiven,
    handleLocationConsent
  } = useLocationConsent(handleLocationUpdate);

  // App Initialization Hook (Badges, Streaks, Pro Status)
  const { streakData, newBadge, clearBadge, isProUser } = useAppInit(timings);

  // Daily Content Hook
  const { dailyContent } = useDailyContent();

  // RTL/LTR Direction Hook
  useDirection();

  // Mobile Features Hook (Orientation, Updates, Rate Logic)
  const { triggerRatePrompt } = useMobileFeatures();

  // Sticky Notification & Widget Hooks
  useStickyNotification(timings, nextPrayer);
  useAndroidWidget(timings, nextPrayer, locationName);

  const onHideSplash = useCallback(() => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  }, []);

  const value = useMemo(() => ({
    // UI State managed by init logic
    showSplash,
    onHideSplash,
    
    // Data
    timings,
    nextPrayer,
    loading,
    error,
    dailyContent,
    streakData,
    weather,
    locationName,
    isProUser,
    newBadge,
    
    // Actions
    fetchPrayerTimes,
    clearBadge,
    
    // Prompts
    showWelcome,
    handleEnableNotifications,
    handleCloseWelcome,
    showLocationPrompt,
    locationConsentGiven,
    handleLocationConsent,
    
    // Mobile Features
    triggerRatePrompt
  }), [
    showSplash, onHideSplash, timings, nextPrayer, loading, error, 
    dailyContent, streakData, weather, locationName, isProUser, newBadge,
    fetchPrayerTimes, clearBadge, showWelcome, handleEnableNotifications,
    handleCloseWelcome, showLocationPrompt, locationConsentGiven, 
    handleLocationConsent, triggerRatePrompt
  ]);

  return (
    <AppInitContext.Provider value={value}>
      {children}
    </AppInitContext.Provider>
  );
};

