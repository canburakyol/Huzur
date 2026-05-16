import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, HeartHandshake, Target } from 'lucide-react';
import { getPrimaryGoalConfig, getStoredPrimaryGoal } from '../../../utils/primaryGoal';

const iconMap = {
  dailyTasks: <Target size={18} color="var(--nav-accent)" />,
  dailyQuiz: <BookOpen size={18} color="var(--bg-emerald-light)" />,
  family: <HeartHandshake size={18} color="var(--bg-emerald-light)" />
};

const HomePriorityCard = memo(function HomePriorityCard({ onSelectFeature, streakData }) {
  const { t } = useTranslation();
  const primaryGoal = getStoredPrimaryGoal();
  const goalConfig = getPrimaryGoalConfig(primaryGoal);
  const action = goalConfig.homeAction;
  const supportingCopy = streakData?.current > 0
    ? t('homeFeed.priorityCard.supportingStreak', { count: streakData.current })
    : t('homeFeed.priorityCard.supportingStart');

  return (
    <div
      className="settings-card reveal-stagger"
      style={{
        margin: '0 5px 16px',
        padding: '22px 20px',
        flexDirection: 'column',
        alignItems: 'stretch',
        background: 'linear-gradient(145deg, rgba(15, 118, 110, 0.14), rgba(212, 175, 55, 0.10))',
        border: '1px solid rgba(212, 175, 55, 0.18)',
        borderRadius: '24px'
      }}
    >
      <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
        {t('homeFeed.priorityCard.eyebrow')}
      </div>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {iconMap[action.feature] || <Target size={18} color="var(--nav-accent)" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.02rem', fontWeight: '900', color: 'var(--nav-text)', marginBottom: '6px' }}>
            {action.title}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--nav-text-muted)', lineHeight: '1.55', fontWeight: '600', marginBottom: '10px' }}>
            {action.description}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--nav-text-muted)', lineHeight: '1.5', fontWeight: '600' }}>
            {supportingCopy}
          </div>
        </div>
      </div>

      <button
        onClick={() => onSelectFeature(action.feature, 'home_priority_card')}
        className="hover-lift"
        style={{
          marginTop: '16px',
          border: 'none',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--nav-accent), var(--bg-emerald-light))',
          color: '#fff',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: '900',
          cursor: 'pointer'
        }}
      >
        {action.cta}
        <ArrowRight size={16} />
      </button>
    </div>
  );
});

export default HomePriorityCard;
