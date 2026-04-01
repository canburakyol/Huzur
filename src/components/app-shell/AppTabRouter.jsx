import { Suspense, lazy } from 'react';
import LoadingFallback from './home/LoadingFallback';

const Prayers = lazy(() => import('../Prayers'));
const Quran = lazy(() => import('../Quran'));
const SocialDashboard = lazy(() => import('../social/SocialDashboard'));
const Assistant = lazy(() => import('../Assistant'));

function AppTabRouter({
  activeTab,
  setActiveTab,
  onSelectFeature,
  timings,
  nextPrayer,
  locationName,
  streakData,
  dailyContent,
  isProUser,
  onOpenInvite,
}) {
  return (
    <>
      {activeTab === 'prayers' && (
        <Suspense fallback={<LoadingFallback height="100vh" />}>
          <Prayers onClose={() => setActiveTab('home')} />
        </Suspense>
      )}

      {activeTab === 'quran' && (
        <Suspense fallback={<LoadingFallback height="100vh" />}>
          <Quran onClose={() => setActiveTab('home')} />
        </Suspense>
      )}

      {activeTab === 'community' && (
        <Suspense fallback={<LoadingFallback height="100vh" />}>
          <SocialDashboard onClose={() => setActiveTab('home')} />
        </Suspense>
      )}

      {activeTab === 'assistant' && (
        <Suspense fallback={<LoadingFallback height="100vh" />}>
          <Assistant
            onClose={() => setActiveTab('home')}
            onSelectFeature={onSelectFeature}
            onSelectTab={setActiveTab}
            timings={timings}
            nextPrayer={nextPrayer}
            locationName={locationName}
            streakData={streakData}
            dailyContent={dailyContent}
            isProUser={isProUser}
            onOpenInvite={onOpenInvite}
          />
        </Suspense>
      )}
    </>
  );
}

export default AppTabRouter;
