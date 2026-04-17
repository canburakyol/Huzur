import { Suspense, lazy, useMemo } from 'react';
import ReferralTriggerCard from '../ReferralTriggerCard';
import HomeAiRecommendationCard from './home/HomeAiRecommendationCard';
import FamilyMomentumCard from './home/FamilyMomentumCard';
import HomePersonalizationHint from './home/HomePersonalizationHint';
import HomePriorityCard from './home/HomePriorityCard';
import HomeStoriesStrip from './home/HomeStoriesStrip';
import LoadingFallback from './home/LoadingFallback';
import RecoverySupportCard from './home/RecoverySupportCard';
import { useHomeFeedState } from '../../hooks/app-shell/useHomeFeedState';

const PremiumHomeHero = lazy(() => import('../PremiumHomeHero'));
const FeatureGrid = lazy(() => import('../FeatureGrid'));
const NativeAdCard = lazy(() => import('../NativeAdCard'));
const DailyQuests = lazy(() => import('../DailyQuests'));
const DailyContentGrid = lazy(() => import('../DailyContentGrid'));
const DailyDiscovery = lazy(() => import('../DailyDiscovery'));

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
  const {
    primaryGoal,
    family,
    rankingState,
    recoveryPlan,
    referralTriggerPlan,
    handleOpenReferralInvite,
    sectionOrder
  } = useHomeFeedState({
    timings,
    nextPrayer,
    locationName,
    streakData,
    dailyContent,
    isProUser,
    onOpenInvite
  });

  const sections = useMemo(() => ({
    familyMomentum: (
      <FamilyMomentumCard onSelectFeature={onSelectFeature} />
    ),
    dailyQuests: (
      <Suspense fallback={<LoadingFallback height="150px" />}>
        <DailyQuests />
      </Suspense>
    ),
    featureGrid: (
      <Suspense fallback={<LoadingFallback height="200px" />}>
        <FeatureGrid onSelectFeature={onSelectFeature} />
      </Suspense>
    ),
    dailyDiscovery: (
      <Suspense fallback={<LoadingFallback height="120px" />}>
        <DailyDiscovery onNavigate={onSelectFeature} />
      </Suspense>
    ),
    dailyContent: dailyContent ? (
      <Suspense fallback={<LoadingFallback height="120px" />}>
        <div style={{ padding: '0 5px' }}>
          <DailyContentGrid dailyContent={dailyContent} />
        </div>
      </Suspense>
    ) : null
  }), [dailyContent, onSelectFeature]);

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
        />
      </Suspense>

      <div className="home-feed-content" style={{ marginTop: '-10px', position: 'relative', zIndex: 10 }}>
        <HomeStoriesStrip />

        <Suspense fallback={null}>
          <NativeAdCard isProUser={isProUser} />
        </Suspense>

        <HomePriorityCard onSelectFeature={onSelectFeature} streakData={streakData} />
        <RecoverySupportCard recoveryPlan={recoveryPlan} isProUser={isProUser} onSelectFeature={onSelectFeature} />
        {referralTriggerPlan ? (
          <ReferralTriggerCard plan={referralTriggerPlan} onOpenInvite={handleOpenReferralInvite} />
        ) : null}
        <HomeAiRecommendationCard rankingState={rankingState} onSelectFeature={onSelectFeature} />

        {sectionOrder.map((sectionKey) => {
          if (sectionKey === 'familyMomentum' && primaryGoal !== 'family_consistency' && !family) {
            return null;
          }

          return (
            <div key={sectionKey}>
              {sections[sectionKey]}
            </div>
          );
        })}

        {primaryGoal !== 'family_consistency' && family ? (
          <FamilyMomentumCard onSelectFeature={onSelectFeature} />
        ) : null}

        <HomePersonalizationHint />
      </div>
    </>
  );
}

export default AppHomeTabContent;
