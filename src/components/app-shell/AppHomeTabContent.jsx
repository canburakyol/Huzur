import { Suspense, lazy } from 'react';

const LoadingFallback = ({ height = '100px' }) => (
  <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="loading-spinner" />
  </div>
);

const PremiumHomeHero = lazy(() => import('../PremiumHomeHero'));
const FeatureGrid = lazy(() => import('../FeatureGrid'));
const Stories = lazy(() => import('../Stories'));
const DailyQuests = lazy(() => import('../DailyQuests'));
const DailyContentGrid = lazy(() => import('../DailyContentGrid'));

/**
 * AppHomeTabContent Component
 * Main content for the home tab
 */
function AppHomeTabContent({
  timings,
  nextPrayer,
  locationName,
  weather,
  streakData,
  dailyContent,
  onOpenInvite,
  onSelectFeature
}) {

  if (!timings) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

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
        />
      </Suspense>

      <div className="home-feed-content" style={{ marginTop: '-10px', position: 'relative', zIndex: 10 }}>
        {/* Actions Section */}
        <Suspense fallback={<LoadingFallback height="200px" />}>
          <FeatureGrid onSelectFeature={onSelectFeature} />
        </Suspense>

        {/* Engagement Section */}
        <Suspense fallback={<LoadingFallback height="100px" />}>
          <Stories />
        </Suspense>

        {/* Daily Progression */}
        <Suspense fallback={<LoadingFallback height="150px" />}>
          <DailyQuests />
        </Suspense>

        {/* Content Section */}
        {dailyContent && (
          <Suspense fallback={<LoadingFallback height="120px" />}>
            <div style={{ padding: '0 5px' }}>
              <DailyContentGrid dailyContent={dailyContent} />
            </div>
          </Suspense>
        )}
      </div>
    </>
  );
}

export default AppHomeTabContent;
