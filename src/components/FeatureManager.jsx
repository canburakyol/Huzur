import { Suspense } from 'react';

import { featureConfig } from '../data/featureConfig';
import LoadingSpinner from './LoadingSpinner';

/**
 * FeatureManager Component
 * Handles rendering of active features as an overlay
 */
const FeatureManager = ({ activeFeature, setActiveFeature, locationName }) => {
  if (!activeFeature) return null;

  const closeFeature = () => setActiveFeature(null);
  const goToPro = () => setActiveFeature('pro');

  const FeatureComponent = featureConfig[activeFeature]?.component;

  if (!FeatureComponent) {
    console.warn(`Feature "${activeFeature}" not found in configuration.`);
    return null;
  }

  const extraProps = {};
  if (featureConfig[activeFeature]?.hasUpgrade) {
    extraProps.onUpgrade = goToPro;
  }

  return (
    <div className="app-container">
      <Suspense fallback={<LoadingSpinner height="100vh" />}>
        <FeatureComponent onClose={closeFeature} locationName={locationName} {...extraProps} />
      </Suspense>
    </div>
  );
};

export default FeatureManager;
