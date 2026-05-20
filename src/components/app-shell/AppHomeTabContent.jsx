import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import FirstActivationCard from './home/FirstActivationCard';
import HomeAiRecommendationCard from './home/HomeAiRecommendationCard';
import HomePriorityCard from './home/HomePriorityCard';
import LoadingFallback from './home/LoadingFallback';
import RecoverySupportCard from './home/RecoverySupportCard';
import ReferralTriggerCard from '../ReferralTriggerCard';
import { useHomeFeedState } from '../../hooks/app-shell/useHomeFeedState';
import { ANALYTICS_EVENTS, logEvent } from '../../services/analyticsService';
import {
  hasCompletedFirstActivationAction,
  isActivationFeature,
} from '../../services/activationService';
import {
  DEFAULT_HOME_EXPERIENCE_CONFIG,
  loadHomeExperienceConfig,
} from '../../services/homeExperienceConfigService';

const PremiumHomeHero = lazy(() => import('../PremiumHomeHero'));
const HomeQuickAccessStrip = lazy(() => import('./home/HomeQuickAccessStrip'));
const FeatureGrid = lazy(() => import('../FeatureGrid'));
const NativeAdCard = lazy(() => import('../NativeAdCard'));
const DailyQuests = lazy(() => import('../../domains/ibadet/components/DailyQuests'));
const DailyContentGrid = lazy(() => import('../../domains/content/components/DailyContentGrid'));

function AppHomeTabContent({
  timings,
  nextPrayer,
  locationName,
  weather,
  streakData,
  dailyContent,
  onOpenInvite,
  onSelectFeature,
  isProUser
}) {
  const [homeExperience, setHomeExperience] = useState(null);
  const [firstActivationCompleted, setFirstActivationCompleted] = useState(() => hasCompletedFirstActivationAction());
  const resolvedHomeExperience = homeExperience || DEFAULT_HOME_EXPERIENCE_CONFIG;
  const shouldShowFirstActivation = !firstActivationCompleted;
  const {
    rankingState,
    recoveryPlan,
    referralTriggerPlan,
    handleOpenReferralInvite
  } = useHomeFeedState({
    timings,
    nextPrayer,
    locationName,
    streakData,
    dailyContent,
    isProUser,
    onOpenInvite,
    referralSurfaceEnabled: !shouldShowFirstActivation
  });

  const handleSelectFeature = useCallback((feature, source) => {
    const didOpen = onSelectFeature(feature, source);
    if (didOpen && isActivationFeature(feature)) {
      setFirstActivationCompleted(true);
    }
  }, [onSelectFeature]);

  useEffect(() => {
    let isMounted = true;

    loadHomeExperienceConfig().then((config) => {
      if (isMounted) {
        setHomeExperience(config);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!homeExperience) return;

    logEvent(ANALYTICS_EVENTS.HOME_VIEWED, {
      has_daily_content: Boolean(dailyContent),
      is_pro: isProUser === true,
      recovery_band: recoveryPlan?.riskBand || 'steady',
      first_activation_completed: firstActivationCompleted,
      home_variant: resolvedHomeExperience.variant,
      home_experiment_variant: resolvedHomeExperience.experimentVariant,
      home_config_source: resolvedHomeExperience.source,
      home_config_enabled: resolvedHomeExperience.enabled === true
    });
  }, [dailyContent, firstActivationCompleted, homeExperience, isProUser, recoveryPlan?.riskBand, resolvedHomeExperience]);

  return (
    <>
      <Suspense fallback={<LoadingFallback height="220px" />}>
        <PremiumHomeHero
          locationName={locationName}
          weather={weather}
          streakData={streakData}
          onOpenInvite={onOpenInvite}
          timings={timings}
          nextPrayer={nextPrayer}
          recoveryPlan={recoveryPlan}
          onSelectFeature={handleSelectFeature}
        />
      </Suspense>

      <div className="home-feed-content" style={{ position: 'relative', zIndex: 10, marginTop: '16px' }}>
        {shouldShowFirstActivation ? (
          <FirstActivationCard onSelectFeature={handleSelectFeature} />
        ) : null}

        {!shouldShowFirstActivation && resolvedHomeExperience.quickAccessEnabled ? (
          <Suspense fallback={<LoadingFallback height="104px" />}>
            <HomeQuickAccessStrip onSelectFeature={handleSelectFeature} />
          </Suspense>
        ) : null}

        {!shouldShowFirstActivation && resolvedHomeExperience.priorityCardEnabled ? (
          <HomePriorityCard onSelectFeature={handleSelectFeature} streakData={streakData} />
        ) : null}

        {!shouldShowFirstActivation && referralTriggerPlan ? (
          <ReferralTriggerCard plan={referralTriggerPlan} onOpenInvite={handleOpenReferralInvite} />
        ) : null}

        {!shouldShowFirstActivation ? (
          <Suspense fallback={null}>
            <NativeAdCard isProUser={isProUser} />
          </Suspense>
        ) : null}

        {!shouldShowFirstActivation && resolvedHomeExperience.recoveryCardEnabled ? (
          <RecoverySupportCard recoveryPlan={recoveryPlan} isProUser={isProUser} onSelectFeature={handleSelectFeature} />
        ) : null}

        {!shouldShowFirstActivation && resolvedHomeExperience.aiRecommendationEnabled ? (
          <HomeAiRecommendationCard rankingState={rankingState} onSelectFeature={handleSelectFeature} />
        ) : null}

        {!shouldShowFirstActivation && resolvedHomeExperience.featureGridEnabled ? (
          <Suspense fallback={<LoadingFallback height="200px" />}>
            <FeatureGrid onSelectFeature={handleSelectFeature} />
          </Suspense>
        ) : null}

        {resolvedHomeExperience.dailyContentEnabled && dailyContent ? (
          <Suspense fallback={<LoadingFallback height="120px" />}>
            <div style={{ padding: '0 5px', marginTop: '12px' }}>
              <DailyContentGrid dailyContent={dailyContent} />
            </div>
          </Suspense>
        ) : null}

        {resolvedHomeExperience.dailyQuestsEnabled ? (
          <Suspense fallback={<LoadingFallback height="150px" />}>
            <div style={{ marginTop: '16px' }}>
              <DailyQuests />
            </div>
          </Suspense>
        ) : null}
      </div>
    </>
  );
}

export default AppHomeTabContent;
