import { Suspense } from 'react';

import { featureConfig } from '../data/featureConfig';

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

  // Check if the feature requires special props
  const extraProps = {};
  if (featureConfig[activeFeature]?.hasUpgrade) {
    extraProps.onUpgrade = goToPro;
  }

  return (
    <div className="app-container">

      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>⏳</div>}>
        <FeatureComponent onClose={closeFeature} locationName={locationName} {...extraProps} />
      </Suspense>
    </div>
  );
};

export default FeatureManager;

