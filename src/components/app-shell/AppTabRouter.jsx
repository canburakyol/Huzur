import { Suspense, lazy } from 'react';

const Prayers = lazy(() => import('../Prayers'));
const Quran = lazy(() => import('../Quran'));
const SocialDashboard = lazy(() => import('../social/SocialDashboard'));
const SpiritualCoach = lazy(() => import('../SpiritualCoach'));

const LoadingFallback = ({ height = '100px' }) => (
  <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="loading-spinner" />
  </div>
);

function AppTabRouter({ activeTab, setActiveTab }) {
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
          <SpiritualCoach onClose={() => setActiveTab('home')} />
        </Suspense>
      )}
    </>
  );
}

export default AppTabRouter;
