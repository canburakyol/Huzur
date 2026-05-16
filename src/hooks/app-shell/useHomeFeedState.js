import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useFamily } from '../../context/FamilyContext';
import { useReferralTriggerSurface } from '../useReferralTriggerSurface';
import {
  ANALYTICS_EVENTS,
  logEvent,
  logHomeRankingV2Resolved,
  logRecoverySurfaceViewed
} from '../../services/analyticsService';
import {
  buildAiContext,
  getHomeRankingV2,
  getRecoveryLoopPlan
} from '../../services/domains/home';
import { logger } from '../../utils/logger';
import { getStoredPrimaryGoal } from '../../utils/primaryGoal';

const HOME_MODULE_TITLES = {
  familyMomentum: 'Aile momentumu',
  dailyQuests: 'Gunluk gorevler',
  featureGrid: 'Ozellikler',
  dailyDiscovery: 'Gunluk kesif',
  dailyContent: 'Gunluk icerik',
};

export function useHomeFeedState({
  timings,
  nextPrayer,
  locationName,
  streakData,
  dailyContent,
  isProUser,
  onOpenInvite,
  referralSurfaceEnabled = true
}) {
  const primaryGoal = getStoredPrimaryGoal();
  const { family, weeklyGoal } = useFamily();
  const recoveryPlan = getRecoveryLoopPlan();
  const { plan: referralTriggerPlan } = useReferralTriggerSurface({
    surface: 'home',
    enabled: referralSurfaceEnabled,
  });
  const [rankingState, setRankingState] = useState({
    headline: '',
    explanation: '',
    socialHint: '',
    rankedModules: null,
    suggestedActionFeature: null,
    suggestedActionLabel: '',
    riskBand: 'steady',
  });

  const defaultSectionOrder = useMemo(() => {
    if (primaryGoal === 'family_consistency') {
      return ['familyMomentum', 'featureGrid', 'dailyQuests', 'dailyDiscovery', 'dailyContent'];
    }

    if (primaryGoal === 'quran_learning') {
      return ['dailyDiscovery', 'featureGrid', 'dailyQuests', 'dailyContent'];
    }

    return ['dailyQuests', 'featureGrid', 'dailyDiscovery', 'dailyContent'];
  }, [primaryGoal]);

  const rankingInput = useMemo(() => ({
    candidates: defaultSectionOrder.map((id) => ({
      id,
      title: HOME_MODULE_TITLES[id] || id,
    })),
    context: buildAiContext({
      activeTab: 'home',
      streakData,
      dailyContent,
      timings,
      nextPrayer,
      locationName,
      isProUser,
      family,
      familyWeeklyGoal: weeklyGoal,
    }),
  }), [dailyContent, defaultSectionOrder, family, isProUser, locationName, nextPrayer, streakData, timings, weeklyGoal]);

  const deferredRankingInput = useDeferredValue(rankingInput);

  useEffect(() => {
    logRecoverySurfaceViewed('home_hero', recoveryPlan.riskBand, {
      primary_goal: primaryGoal,
      is_pro: isProUser === true
    });
  }, [isProUser, primaryGoal, recoveryPlan.riskBand]);

  useEffect(() => {
    if (isProUser || !['at_risk', 'comeback'].includes(recoveryPlan?.riskBand)) {
      return;
    }

    logRecoverySurfaceViewed('home_recovery_support', recoveryPlan.riskBand, {
      primary_goal: primaryGoal,
      recovery_feature: recoveryPlan.feature
    });
  }, [isProUser, primaryGoal, recoveryPlan?.feature, recoveryPlan?.riskBand]);

  useEffect(() => {
    if (!referralTriggerPlan) {
      return;
    }

    logEvent(ANALYTICS_EVENTS.REFERRAL_TRIGGER_SURFACE_VIEWED, {
      surface: 'home',
      trigger_id: referralTriggerPlan.triggerId,
      ...referralTriggerPlan.analyticsPayload,
    });
  }, [referralTriggerPlan]);

  useEffect(() => {
    let isCancelled = false;

    const resolveRanking = async () => {
      try {
        if (!deferredRankingInput?.candidates?.length) {
          return;
        }

        const startedAt = Date.now();
        const result = await getHomeRankingV2(deferredRankingInput);
        if (isCancelled || !result) {
          return;
        }

        startTransition(() => {
          setRankingState({
            headline: result.headline || '',
            explanation: result.explanation || '',
            socialHint: result.socialHint || '',
            rankedModules: Array.isArray(result.rankedModules) ? result.rankedModules : null,
            suggestedActionFeature: result.suggestedActionFeature || null,
            suggestedActionLabel: result.suggestedActionLabel || '',
            riskBand: result.riskBand || 'steady',
          });
        });

        logHomeRankingV2Resolved(
          'home',
          Array.isArray(result.rankedModules) ? result.rankedModules.length : 0,
          result.provider || 'fallback',
          Date.now() - startedAt,
          result.riskBand || 'steady'
        );
      } catch (error) {
        logger.warn('[useHomeFeedState] AI ranking fallback', error);
      }
    };

    void resolveRanking();

    return () => {
      isCancelled = true;
    };
  }, [deferredRankingInput]);

  const handleOpenReferralInvite = () => {
    if (!referralTriggerPlan || typeof onOpenInvite !== 'function') {
      return;
    }

    logEvent(ANALYTICS_EVENTS.REFERRAL_TRIGGER_CTA_CLICKED, {
      surface: 'home',
      trigger_id: referralTriggerPlan.triggerId,
      ...referralTriggerPlan.analyticsPayload,
    });
    onOpenInvite(referralTriggerPlan.entrySource);
  };

  return {
    primaryGoal,
    family,
    rankingState,
    recoveryPlan,
    referralTriggerPlan,
    handleOpenReferralInvite,
    sectionOrder: rankingState.rankedModules || defaultSectionOrder
  };
}
