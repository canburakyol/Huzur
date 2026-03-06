import { useEffect, useState } from 'react';
import i18n from '../../i18n';
import { storageService } from '../../services/storageService';
import { STORAGE_KEYS } from '../../constants';
import {
  logOnboardingStarted,
  logOnboardingCompleted,
  logFirstPrayerActionCompleted
} from '../../services/analyticsService';
import {
  markFirstIbadahCompletedForReferral,
  markOnboardingCompletedForReferral
} from '../../services/referralService';

export function useGrowthOnboardingFlow({ handleLocationConsent, handleEnableNotifications, setActiveTab }) {
  const [showGrowthOnboarding, setShowGrowthOnboarding] = useState(() => {
    return !storageService.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
  });

  const [onboardingLanguage, setOnboardingLanguage] = useState(() => {
    return storageService.getString('i18nextLng', 'tr');
  });

  useEffect(() => {
    if (showGrowthOnboarding && !storageService.getBoolean(STORAGE_KEYS.ONBOARDING_STARTED, false)) {
      storageService.setBoolean(STORAGE_KEYS.ONBOARDING_STARTED, true);
      logOnboardingStarted('language_selection');
    }
  }, [showGrowthOnboarding]);

  const handleGrowthLanguageSelect = async (lang) => {
    const selectedLang = lang || 'tr';
    setOnboardingLanguage(selectedLang);
    await i18n.changeLanguage(selectedLang);
  };

  const handleGrowthLocationRequest = async (accepted = true) => {
    await handleLocationConsent(accepted);
  };

  const handleGrowthNotificationRequest = async (accepted = true) => {
    if (accepted) {
      await handleEnableNotifications();
      return;
    }

    storageService.setBoolean(STORAGE_KEYS.HAS_SEEN_WELCOME, true);
  };

  const handleGrowthComplete = () => {
    storageService.setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    setShowGrowthOnboarding(false);
    logOnboardingCompleted(onboardingLanguage);
    markOnboardingCompletedForReferral();

    if (!storageService.getBoolean(STORAGE_KEYS.FIRST_IBADAH_ACTION_DONE, false)) {
      storageService.setBoolean(STORAGE_KEYS.FIRST_IBADAH_ACTION_DONE, true);
      logFirstPrayerActionCompleted('growth_onboarding');
      markFirstIbadahCompletedForReferral();
    }

    setActiveTab('home');
  };

  return {
    showGrowthOnboarding,
    setShowGrowthOnboarding,
    onboardingLanguage,
    setOnboardingLanguage,
    handleGrowthLanguageSelect,
    handleGrowthLocationRequest,
    handleGrowthNotificationRequest,
    handleGrowthComplete
  };
}
