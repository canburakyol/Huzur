import { Suspense, lazy } from 'react';
import LoadingSpinner from '../LoadingSpinner';

const FeatureManager = lazy(() => import('../FeatureManager'));

function AppFeatureOverlay({ activeFeature, setActiveFeature, locationName }) {
  return (
    <div data-i18n-autolocalize="true">
      <Suspense fallback={<LoadingSpinner height="100vh" />}>
        <FeatureManager
          activeFeature={activeFeature}
          setActiveFeature={setActiveFeature}
          locationName={locationName}
        />
      </Suspense>
    </div>
  );
}

export default AppFeatureOverlay;
