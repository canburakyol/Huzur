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

const CORE_FEATURES = [
  { id: 'dailyTasks', icon: <Target size={22} />, labelKey: 'menu.dailyTasks', span: 2 },
  { id: 'spiritualJourney', icon: <Award size={22} />, labelKey: 'journey.title', span: 2 },
  { id: 'qibla', icon: <Compass size={22} />, labelKey: 'features.qibla' },
  { id: 'zikirmatik', icon: <Sparkles size={22} />, labelKey: 'features.dhikr' }
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
    { id: 'quran', icon: <BookOpen size={22} />, labelKey: 'features.quran' },
    { id: 'wordByWord', icon: <Type size={22} />, labelKey: 'features.wordByWord' },
    { id: 'tajweedTutor', icon: <Mic2 size={22} />, labelKey: 'features.tajweedTutor' }
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

  const handleKeyDown = (featureId) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectFeature(featureId);
    }
  };

  const features = useMemo(() => {
    const goalFeatures = GOAL_FEATURE_MAP[primaryGoal] || GOAL_FEATURE_MAP.prayer_rhythm;
    return [...CORE_FEATURES, ...goalFeatures];
  }, [primaryGoal]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ padding: '0 8px', marginBottom: '12px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
          {t('features.quickAccess', 'Hedefe göre hızlı erişim')}
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
          onClick={() => onSelectFeature(feature.id)}
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
          transform: scale(1.08);
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
