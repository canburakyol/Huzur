import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Award,
  Bell,
  BookOpen,
  Brain,
  Compass,
  HeartHandshake,
  Mic2,
  PenTool,
  Sparkles,
  Sun,
  Target,
  Type
} from 'lucide-react';
import { getPrimaryGoalConfig, getStoredPrimaryGoal } from '../utils/primaryGoal';
import './FeatureGrid.css';

const CORE_FEATURES = [
  { id: 'dailyTasks', icon: <Target size={22} />, labelKey: 'menu.dailyTasks', span: 2 },
  { id: 'spiritualJourney', icon: <Award size={22} />, labelKey: 'journey.title', span: 2 },
  { id: 'quran', icon: <BookOpen size={22} />, labelKey: 'features.quran' },
  { id: 'zikirmatik', icon: <Sparkles size={22} />, labelKey: 'features.dhikr' },
  { id: 'qibla', icon: <Compass size={22} />, labelKey: 'features.qibla' }
];

const GOAL_FEATURE_MAP = {
  prayer_rhythm: [
    { id: 'prayers', icon: <HeartHandshake size={22} />, labelKey: 'features.prayers' },
    { id: 'routineBuilder', icon: <PenTool size={22} />, labelKey: 'routine.title' },
    { id: 'adhkar', icon: <Sun size={22} />, labelKey: 'features.adhkar' },
    { id: 'muezzinSelector', icon: <Bell size={22} />, labelKey: 'features.muezzinSelector' }
  ],
  quran_learning: [
    { id: 'dailyQuiz', icon: <Brain size={22} />, labelKey: 'quiz.title' },
    { id: 'wordByWord', icon: <Type size={22} />, labelKey: 'features.wordByWord' },
    { id: 'tajweedTutor', icon: <Mic2 size={22} />, labelKey: 'features.tajweedTutor' },
    { id: 'adhkar', icon: <Sun size={22} />, labelKey: 'features.adhkar' }
  ],
  family_consistency: [
    { id: 'family', icon: <HeartHandshake size={22} />, labelKey: 'family.title' },
    { id: 'social', icon: <Sparkles size={22} />, labelKey: 'social.title' },
    { id: 'hatimCoach', icon: <BookOpen size={22} />, labelKey: 'features.hatimCoach' },
    { id: 'dailyQuiz', icon: <Brain size={22} />, labelKey: 'quiz.title' }
  ]
};

const FeatureGrid = memo(({ onSelectFeature }) => {
  const { t } = useTranslation();
  const primaryGoal = getStoredPrimaryGoal();
  const primaryGoalConfig = getPrimaryGoalConfig(primaryGoal);

  const features = useMemo(() => {
    const goalFeatures = GOAL_FEATURE_MAP[primaryGoal] || GOAL_FEATURE_MAP.prayer_rhythm;
    return [...CORE_FEATURES, ...goalFeatures];
  }, [primaryGoal]);

  const handleKeyDown = (featureId) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectFeature(featureId, 'home_feature_grid');
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ padding: '0 8px', marginBottom: '12px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
          {t('features.quickAccess', 'Hedefe gore hizli erisim')}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
          {primaryGoalConfig.label}
        </div>
      </div>

      <div className="bento-grid" role="group" aria-label={t('features.quickAccess', 'Quick access')}>
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`bento-btn ${feature.span ? `span-${feature.span}` : ''}`}
            onClick={() => onSelectFeature(feature.id, 'home_feature_grid')}
            onKeyDown={handleKeyDown(feature.id)}
            role="button"
            tabIndex={0}
            aria-label={t(feature.labelKey, feature.id)}
          >
            <span className="bento-icon">{feature.icon}</span>
            <span className="bento-label">{t(feature.labelKey, feature.id)}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

FeatureGrid.displayName = 'FeatureGrid';

export default FeatureGrid;
