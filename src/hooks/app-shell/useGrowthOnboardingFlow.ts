import { useEffect, useState } from "react";
import { storageService } from "../../services/storageService";
import { STORAGE_KEYS } from "../../constants";
import { changeLanguage } from "../../services/languageService";
import { logger } from "../../utils/logger";
import { ANALYTICS_EVENTS, logEvent, logOnboardingStarted, logOnboardingCompleted } from "../../services/analyticsService";
import {
  buildPremiumMomentAnalyticsPayload,
  getAiFeatureFlags,
  getExperimentVariant,
  getOnboardingConfig,
  getPremiumMomentsConfig,
  getReferralProgress,
  getReferralServerSnapshot,
  markOnboardingCompletedForReferral,
  openPremiumMoment,
  resolveOnboardingExperienceConfig,
  syncReferralState,
} from "../../services/domains/onboarding";
import { getStoredPrimaryGoal } from "../../utils/primaryGoal";

interface GrowthOnboardingOptions {
  handleLocationConsent: (accepted: boolean) => Promise<unknown>;
  handleEnableNotifications: () => Promise<void>;
  setActiveTab: (tab: string, source?: string) => void;
  isProUser?: boolean;
}

interface ReferralProgress {
  invitedByCode?: string;
  firstIbadahCompletedAt?: string;
  rewards?: { inviteeUnlockedAt?: string };
  [key: string]: unknown;
}

interface ReferralServerSnapshot {
  [key: string]: unknown;
}

interface OnboardingConfig {
  enabled?: boolean;
  steps?: string[];
  flowVersion?: string;
  experimentContext?: {
    signature?: string;
    onboardingHeadlineVariant?: string;
    onboardingGoalStepVariant?: string;
  };
}

interface GrowthOnboardingResult {
  showGrowthOnboarding: boolean;
  setShowGrowthOnboarding: (show: boolean) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => number;
  onboardingConfig: OnboardingConfig | null;
  onboardingLanguage: string;
  referralProgress: ReferralProgress;
  referralServerSnapshot: ReferralServerSnapshot | null;
  setOnboardingLanguage: (lang: string) => void;
  handleGrowthLanguageSelect: (lang: string) => Promise<{ success: boolean; error?: string }>;
  handleGrowthLocationRequest: (accepted?: boolean) => Promise<{ success: boolean; error?: string }>;
  handleGrowthNotificationRequest: (accepted?: boolean) => Promise<{ success: boolean; error?: string }>;
  handleGrowthComplete: (options?: { premiumTeaserEnabled?: boolean; selectedGoal?: string }) => Promise<void>;
}

export function useGrowthOnboardingFlow({
  handleLocationConsent,
  handleEnableNotifications,
  setActiveTab,
  isProUser = false,
}: GrowthOnboardingOptions): GrowthOnboardingResult {
  const [showGrowthOnboarding, setShowGrowthOnboarding] = useState(() => {
    return !storageService.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
  });
  const [onboardingConfig, setOnboardingConfig] = useState<OnboardingConfig | null>(null);
  const [aiFeatureFlags, setAiFeatureFlags] = useState<Record<string, unknown> | null>(null);
  const [referralProgress, setReferralProgress] = useState<ReferralProgress>(() => getReferralProgress());
  const [referralServerSnapshot, setReferralServerSnapshot] = useState<ReferralServerSnapshot | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(() => {
    const storedStep = storageService.getNumber(STORAGE_KEYS.ONBOARDING_STEP, 0);
    return Math.max(0, Math.min(storedStep, 3));
  });

  const [onboardingLanguage, setOnboardingLanguage] = useState(() => {
    return storageService.getString("i18nextLng", "tr");
  });

  const persistOnboardingStep = (step: number): number => {
    const maxStep = Math.max(0, (onboardingConfig?.steps?.length || 3) - 1);
    const normalizedStep = Math.max(0, Math.min(Number(step) || 0, maxStep));
    setOnboardingStep(normalizedStep);
    storageService.setNumber(STORAGE_KEYS.ONBOARDING_STEP, normalizedStep);
    return normalizedStep;
  };

  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      try {
        const flags = await getAiFeatureFlags();
        if (!isMounted) return;
        setAiFeatureFlags(flags);

        if (flags.remote_onboarding_v1_enabled) {
          const resolvedVariants = {
            headlineVariant: getExperimentVariant("onboarding_headline_v1"),
            goalStepVariant: getExperimentVariant("onboarding_goal_step_v1"),
          };

          if (isMounted) {
            setOnboardingConfig(resolveOnboardingExperienceConfig(undefined, resolvedVariants));
          }

          const config = await getOnboardingConfig();
          if (isMounted) {
            setOnboardingConfig(resolveOnboardingExperienceConfig(config, resolvedVariants));
          }
        }

        if (flags.premium_moments_v1_enabled) {
          void getPremiumMomentsConfig();
        }
      } catch (error) {
        logger.warn("[useGrowthOnboardingFlow] Config load failed:", error);
      }
    };

    void loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!showGrowthOnboarding || !referralProgress?.invitedByCode) return undefined;

    let isMounted = true;

    const loadReferralSnapshot = async () => {
      const snapshot = await getReferralServerSnapshot();
      if (isMounted && snapshot) {
        setReferralServerSnapshot(snapshot);
      }
    };

    void loadReferralSnapshot();

    return () => {
      isMounted = false;
    };
  }, [referralProgress?.invitedByCode, showGrowthOnboarding]);

  useEffect(() => {
    if (showGrowthOnboarding && !storageService.getBoolean(STORAGE_KEYS.ONBOARDING_STARTED, false)) {
      storageService.setBoolean(STORAGE_KEYS.ONBOARDING_STARTED, true);
      const firstStep = onboardingConfig?.enabled ? onboardingConfig.steps?.[0] || "language" : "language";
      logOnboardingStarted(firstStep, {
        flow_version: onboardingConfig?.flowVersion || "v1",
        experiment_variant: onboardingConfig?.experimentContext?.signature || "A|A",
        onboarding_headline_variant: onboardingConfig?.experimentContext?.onboardingHeadlineVariant || "A",
        onboarding_goal_step_variant: onboardingConfig?.experimentContext?.onboardingGoalStepVariant || "A",
      });
    }
  }, [onboardingConfig, showGrowthOnboarding]);

  const handleGrowthLanguageSelect = async (lang: string): Promise<{ success: boolean; error?: string }> => {
    const selectedLang = lang || "tr";
    setOnboardingLanguage(selectedLang);
    try {
      const changed = await changeLanguage(selectedLang);
      if (!changed) {
        throw new Error(`Language change rejected for ${selectedLang}`);
      }
      return { success: true };
    } catch (error) {
      logger.warn("[useGrowthOnboardingFlow] Language change failed:", error);
      return { success: false, error: (error as Error)?.message || "Language change failed" };
    }
  };

  const handleGrowthLocationRequest = async (accepted = true): Promise<{ success: boolean; error?: string }> => {
    try {
      await handleLocationConsent(accepted);
      return { success: true };
    } catch (error) {
      logger.warn("[useGrowthOnboardingFlow] Location request failed:", error);
      return { success: false, error: (error as Error)?.message || "Location permission failed" };
    }
  };

  const handleGrowthNotificationRequest = async (accepted = true): Promise<{ success: boolean; error?: string }> => {
    try {
      if (accepted) {
        await handleEnableNotifications();
        return { success: true };
      }

      storageService.setBoolean(STORAGE_KEYS.HAS_SEEN_WELCOME, true);
      return { success: true };
    } catch (error) {
      storageService.setBoolean(STORAGE_KEYS.HAS_SEEN_WELCOME, true);
      logger.warn("[useGrowthOnboardingFlow] Notification request failed:", error);
      return { success: false, error: (error as Error)?.message || "Notification permission failed" };
    }
  };

  const handleGrowthComplete = async ({
    premiumTeaserEnabled = false,
    selectedGoal = getStoredPrimaryGoal(),
  } = {}): Promise<void> => {
    storageService.setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    storageService.removeItem(STORAGE_KEYS.ONBOARDING_STEP);
    setShowGrowthOnboarding(false);
    setOnboardingStep(0);
    logOnboardingCompleted(onboardingLanguage, {
      flow_version: onboardingConfig?.flowVersion || "v1",
      experiment_variant: onboardingConfig?.experimentContext?.signature || "A|A",
      onboarding_headline_variant: onboardingConfig?.experimentContext?.onboardingHeadlineVariant || "A",
      onboarding_goal_step_variant: onboardingConfig?.experimentContext?.onboardingGoalStepVariant || "A",
      primary_goal: selectedGoal,
      referred_user: referralProgress?.invitedByCode ? true : undefined,
      referral_code: referralProgress?.invitedByCode || undefined,
    });
    const onboardingReferralState = markOnboardingCompletedForReferral();

    const nextReferralProgress = getReferralProgress();
    setReferralProgress(nextReferralProgress);

    if (nextReferralProgress?.invitedByCode) {
      const snapshot = await syncReferralState(nextReferralProgress, {
        source: "growth_onboarding_complete",
        force: true,
      });

      if (snapshot) {
        setReferralServerSnapshot(snapshot);
      }

      logEvent(ANALYTICS_EVENTS.REFERRAL_ONBOARDING_COMPLETED, {
        referral_code: nextReferralProgress.invitedByCode,
        onboarding_completed: Boolean(onboardingReferralState?.onboardingCompletedAt),
        first_ibadah_completed: Boolean(nextReferralProgress?.firstIbadahCompletedAt),
        reward_ready: Boolean(nextReferralProgress?.rewards?.inviteeUnlockedAt),
        flow_version: onboardingConfig?.flowVersion || "v1",
        experiment_variant: onboardingConfig?.experimentContext?.signature || "A|A",
        primary_goal: selectedGoal,
      });
    }

    setActiveTab("home", "growth_onboarding_complete");

    if (premiumTeaserEnabled && aiFeatureFlags?.premium_moments_v1_enabled && !isProUser) {
      window.setTimeout(() => {
        const premiumMoment = {
          isPro: false,
          source: "onboarding",
          momentType: "onboarding_complete",
          primaryGoal: selectedGoal,
        };
        logEvent(ANALYTICS_EVENTS.PREMIUM_MOMENT_OPENED, buildPremiumMomentAnalyticsPayload(premiumMoment, {
          onboarding_experiment_variant: onboardingConfig?.experimentContext?.signature || "A|A",
        }));
        openPremiumMoment(premiumMoment);
      }, 250);
    }
  };

  return {
    showGrowthOnboarding,
    setShowGrowthOnboarding,
    onboardingStep,
    setOnboardingStep: persistOnboardingStep,
    onboardingConfig,
    onboardingLanguage,
    referralProgress,
    referralServerSnapshot,
    setOnboardingLanguage,
    handleGrowthLanguageSelect,
    handleGrowthLocationRequest,
    handleGrowthNotificationRequest,
    handleGrowthComplete,
  };
}
