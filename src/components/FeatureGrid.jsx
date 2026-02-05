import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * FeatureGrid Component
 * Grid of buttons to access various app features
 * Memoized to prevent unnecessary re-renders
 */
const FeatureGrid = memo(({ onSelectFeature }) => {
  const { t } = useTranslation();

  // Memoize features array - 9 essential features for cleaner homepage
  const features = useMemo(() => [
    { id: 'qibla', icon: '🧭', labelKey: 'features.qibla' },
    { id: 'zikirmatik', icon: '📿', labelKey: 'features.dhikr' },
    { id: 'adhkar', icon: '☀️', labelKey: 'features.tasbih' },
    { id: 'hatimCoach', icon: '🧠', labelKey: 'features.smartKhatm' },
    { id: 'family', icon: '👨‍👩‍👧', labelKey: 'features.family' },
    { id: 'social', icon: '🤲', labelKey: 'social.title' }, // New Social Feature
    { id: 'imsakiye', icon: '🌙', labelKey: 'features.imsakiye' },
    { id: 'hadiths', icon: '📖', labelKey: 'features.hadith' },
    { id: 'radio', icon: '📻', labelKey: 'features.radio' },
    { id: 'seerahMap', icon: '🗺️', labelKey: 'features.seerah' }
  ], []);

  return (
    <div className="feature-grid" style={{ marginBottom: '20px' }}>
      {features.map(feature => (
        <div 
          key={feature.id} 
          className="feature-btn" 
          onClick={() => onSelectFeature(feature.id)}
        >
          <span className="feature-icon">{feature.icon}</span>
          <span className="feature-label">{t(feature.labelKey)}</span>
        </div>
      ))}
    </div>
  );
});

FeatureGrid.displayName = 'FeatureGrid';

export default FeatureGrid;

