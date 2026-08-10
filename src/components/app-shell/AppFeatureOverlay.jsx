import { Suspense, lazy } from 'react';
import LoadingSpinner from '../LoadingSpinner';

const FeatureManager = lazy(() => import('../FeatureManager'));
const BottomNav = lazy(() => import('../BottomNav'));

function AppFeatureOverlay({
  activeFeature,
  setActiveFeature,
  activeTab,
  setActiveTab,
  onShowMenu,
  locationName,
  location,
  isProUser,
}) {
  const isQuranScreen = activeFeature === 'quran';

  const handleSelectTab = (tab, source) => {
    setActiveFeature(null, 'feature_bottom_nav');
    setActiveTab(tab, source);
  };

  const handleShowMenu = () => {
    setActiveFeature(null, 'feature_menu');
    onShowMenu();
  };

  return (
    <div
      data-i18n-autolocalize="true"
      className={`app-container feature-route-shell${!isQuranScreen && !isProUser ? ' has-bottom-banner' : ''}`}
    >
      <Suspense fallback={<LoadingSpinner height="100vh" />}>
        <FeatureManager
          activeFeature={activeFeature}
          setActiveFeature={setActiveFeature}
          locationName={locationName}
          location={location}
          reserveBottomStack={!isQuranScreen}
        />

        {!isQuranScreen && (
          <BottomNav
            activeTab={activeTab}
            setActiveTab={handleSelectTab}
            onShowMenu={handleShowMenu}
          />
        )}
      </Suspense>
    </div>
  );
}

export default AppFeatureOverlay;
