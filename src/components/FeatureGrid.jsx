import { useTranslation } from 'react-i18next';

/**
 * FeatureGrid Component
 * Grid of buttons to access various app features
 */
const FeatureGrid = ({ onSelectFeature }) => {
  const { t } = useTranslation();

  const features = [
    { id: 'qibla', icon: '🧭', labelKey: 'features.qibla' },
    { id: 'zikirmatik', icon: '📿', labelKey: 'features.dhikr' },
    { id: 'radio', icon: '📻', labelKey: 'features.radio' },
    { id: 'mosque', icon: '🕌', labelKey: 'features.mosque' },
    { id: 'calendar', icon: '📅', labelKey: 'features.days' },
    { id: 'imsakiye', icon: '🌙', labelKey: 'features.imsakiye' },
    { id: 'tracker', icon: '📝', labelKey: 'features.qada' },
    { id: 'fasting', icon: '🍽️', labelKey: 'features.fasting' },
    { id: 'hadiths', icon: '📖', labelKey: 'features.hadith' },
    { id: 'adhkar', icon: '☀️', labelKey: 'features.tasbih' },
    { id: 'zakat', icon: '🤲', labelKey: 'features.zakat' },
    { id: 'hatim', icon: '📖', labelKey: 'features.khatm' }
  ];

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
};

export default FeatureGrid;
