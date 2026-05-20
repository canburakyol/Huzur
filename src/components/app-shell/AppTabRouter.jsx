import { Suspense, lazy } from 'react';
import LoadingFallback from './home/LoadingFallback';

const Prayers = lazy(() => import('../../domains/prayer/components/Prayers'));
const Quran = lazy(() => import('../../domains/quran/components/Quran'));
const SocialDashboard = lazy(() => import('../../domains/social/components/SocialDashboard'));
const Assistant = lazy(() => import('../../domains/assistant/components/AssistantShell'));

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
          <Prayers onClose={() => setActiveTab('home', 'tab_close')} />
        </Suspense>
      )}

      {activeTab === 'quran' && (
        <Suspense fallback={<LoadingFallback height="100vh" />}>
          <Quran onClose={() => setActiveTab('home', 'tab_close')} />
        </Suspense>
      )}

      {activeTab === 'community' && (
        <Suspense fallback={<LoadingFallback height="100vh" />}>
          <SocialDashboard onClose={() => setActiveTab('home', 'tab_close')} />
        </Suspense>
      )}

      {activeTab === 'assistant' && (
        <Suspense fallback={<LoadingFallback height="100vh" />}>
          <Assistant
            onClose={() => setActiveTab('home', 'tab_close')}
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
