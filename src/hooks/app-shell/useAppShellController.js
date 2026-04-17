import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocus } from '../../context/FocusContext';
import { useBackButton } from '../useBackButton';
import { usePrayerTimes, useStickyNotification, useAndroidWidget } from '../usePrayerTimes';
import { useLocationConsent } from '../useLocationConsent';
import { useAppInit } from '../useAppInit';
import { useDailyContent } from '../useDailyContent';
import { useDirection } from '../useDirection';
import { useRuntimeAutoLocalization } from '../useRuntimeAutoLocalization';
import { useBootstrapEffects } from './useBootstrapEffects';
import { useDeepLinkBridge } from './useDeepLinkBridge';
import { useInstallReferrerBridge } from './useInstallReferrerBridge';
import { useGrowthOnboardingFlow } from './useGrowthOnboardingFlow';
import { useNavigationState } from './useNavigationState';
import { useStreakGuards } from './useStreakGuards';

export function useAppShellController() {
  const { t } = useTranslation();
  const { isFocusMode } = useFocus();

  const navigation = useNavigationState();
  const streak = useStreakGuards();
  const prayer = usePrayerTimes();
  const { fetchPrayerTimes, handleEnableNotifications, nextPrayer, timings } = prayer;

  const handleLocationUpdate = useCallback((coords) => {
    fetchPrayerTimes(coords);
  }, [fetchPrayerTimes]);

  const location = useLocationConsent(handleLocationUpdate);
  const appInit = useAppInit(timings);
  const { dailyContent } = useDailyContent();

  useDirection();
  useRuntimeAutoLocalization();

  useBackButton({
    showMoodSelector: navigation.showMoodSelector,
    activeFeature: navigation.activeFeature,
    activeTab: navigation.activeTab,
    setShowMoodSelector: navigation.setShowMoodSelector,
    setActiveFeature: navigation.setActiveFeature,
    setActiveTab: navigation.setActiveTab
  });

  useStickyNotification(timings, nextPrayer);
  useAndroidWidget(timings, nextPrayer, location.locationName);

  useBootstrapEffects();
  useDeepLinkBridge();
  useInstallReferrerBridge();

  const growthOnboarding = useGrowthOnboardingFlow({
    handleLocationConsent: location.handleLocationConsent,
    handleEnableNotifications,
    setActiveTab: navigation.setActiveTab,
    isProUser: appInit.isProUser
  });

  return {
    t,
    isFocusMode,
    hasBlockingOverlay: navigation.showSplash || growthOnboarding.showGrowthOnboarding,
    navigation,
    streak,
    prayer,
    location,
    appInit,
    dailyContent,
    growthOnboarding
  };
}
