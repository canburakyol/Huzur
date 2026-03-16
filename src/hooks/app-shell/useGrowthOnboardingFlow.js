import { useEffect, useState } from 'react';
import { storageService } from '../../services/storageService';
import { STORAGE_KEYS } from '../../constants';
import { changeLanguage } from '../../services/languageService';
import { logger } from '../../utils/logger';
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
  const [onboardingStep, setOnboardingStep] = useState(() => {
    const storedStep = storageService.getNumber(STORAGE_KEYS.ONBOARDING_STEP, 0);
    return Math.max(0, Math.min(storedStep, 4));
  });

  const [onboardingLanguage, setOnboardingLanguage] = useState(() => {
    return storageService.getString('i18nextLng', 'tr');
  });

  const persistOnboardingStep = (step) => {
    const normalizedStep = Math.max(0, Math.min(Number(step) || 0, 4));
    setOnboardingStep(normalizedStep);
    storageService.setNumber(STORAGE_KEYS.ONBOARDING_STEP, normalizedStep);
    return normalizedStep;
  };

  useEffect(() => {
    if (showGrowthOnboarding && !storageService.getBoolean(STORAGE_KEYS.ONBOARDING_STARTED, false)) {
      storageService.setBoolean(STORAGE_KEYS.ONBOARDING_STARTED, true);
      logOnboardingStarted('language_selection');
    }
  }, [showGrowthOnboarding]);

  const handleGrowthLanguageSelect = async (lang) => {
    const selectedLang = lang || 'tr';
    setOnboardingLanguage(selectedLang);
    try {
      const changed = await changeLanguage(selectedLang);
      if (!changed) {
        throw new Error(`Language change rejected for ${selectedLang}`);
      }
      return { success: true };
    } catch (error) {
      logger.warn('[useGrowthOnboardingFlow] Language change failed:', error);
      return { success: false, error: error?.message || 'Language change failed' };
    }
  };

  const handleGrowthLocationRequest = async (accepted = true) => {
    try {
      await handleLocationConsent(accepted);
      return { success: true };
    } catch (error) {
      logger.warn('[useGrowthOnboardingFlow] Location request failed:', error);
      return { success: false, error: error?.message || 'Location permission failed' };
    }
  };

  const handleGrowthNotificationRequest = async (accepted = true) => {
    try {
      if (accepted) {
        await handleEnableNotifications();
        return { success: true };
      }

      storageService.setBoolean(STORAGE_KEYS.HAS_SEEN_WELCOME, true);
      return { success: true };
    } catch (error) {
      storageService.setBoolean(STORAGE_KEYS.HAS_SEEN_WELCOME, true);
      logger.warn('[useGrowthOnboardingFlow] Notification request failed:', error);
      return { success: false, error: error?.message || 'Notification permission failed' };
    }
  };

  const handleGrowthComplete = () => {
    storageService.setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    storageService.removeItem(STORAGE_KEYS.ONBOARDING_STEP);
    setShowGrowthOnboarding(false);
    setOnboardingStep(0);
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
    onboardingStep,
    setOnboardingStep: persistOnboardingStep,
    onboardingLanguage,
    setOnboardingLanguage,
    handleGrowthLanguageSelect,
    handleGrowthLocationRequest,
    handleGrowthNotificationRequest,
    handleGrowthComplete
  };
}
