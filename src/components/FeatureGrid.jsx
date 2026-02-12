import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * FeatureGrid Component
 * Grid of buttons to access various app features
 * Memoized to prevent unnecessary re-renders
 */
const FeatureGrid = memo(({ onSelectFeature }) => {
  const { t } = useTranslation();

  // Memoize features array - 10 features for cleaner homepage
  const features = useMemo(() => [
    { id: 'qibla', icon: '🧭', labelKey: 'features.qibla', span: 2 }, // Larger
    { id: 'zikirmatik', icon: '📿', labelKey: 'features.dhikr', span: 2 }, // Larger
    { id: 'hatimCoach', icon: '🧠', labelKey: 'features.smartKhatm' },
    { id: 'family', icon: '👨‍👩‍👧', labelKey: 'features.family' },
    { id: 'social', icon: '🤲', labelKey: 'social.title' },
    { id: 'imsakiye', icon: '🌙', labelKey: 'features.imsakiye' },
    { id: 'hadiths', icon: '📖', labelKey: 'features.hadith' },
    { id: 'radio', icon: '📻', labelKey: 'features.radio' },
    { id: 'seerahMap', icon: '🗺️', labelKey: 'features.seerah' },
    { id: 'adhkar', icon: '☀️', labelKey: 'features.tasbih' },
  ], []);

  return (
    <div className="bento-grid" style={{ marginBottom: '20px' }}>
      {features.map(feature => (
        <div 
          key={feature.id} 
          className={`bento-btn ${feature.span ? `span-${feature.span}` : ''}`}
          onClick={() => onSelectFeature(feature.id)}
        >
          <span className="bento-icon">{feature.icon}</span>
          <span className="bento-label">{t(feature.labelKey)}</span>
        </div>
      ))}
      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          padding: 0 5px;
        }
        .bento-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px 10px;
          background: var(--glass-bg);
          border-radius: 20px;
          border: 1px solid var(--glass-border);
          transition: var(--transition-smooth);
          cursor: pointer;
        }
        .bento-btn:active {
          transform: scale(0.95);
          background: rgba(255,255,255,0.1);
        }
        .span-2 {
          grid-column: span 2;
          flex-direction: row !important;
          gap: 12px;
          justify-content: center;
        }
        .bento-icon {
          font-size: 24px;
          transition: transform 0.3s;
        }
        .bento-btn:hover .bento-icon {
          transform: scale(1.15) rotate(5deg);
        }
        .bento-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-color);
          text-align: center;
        }
        .span-2 .bento-label {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
});

FeatureGrid.displayName = 'FeatureGrid';

export default FeatureGrid;

