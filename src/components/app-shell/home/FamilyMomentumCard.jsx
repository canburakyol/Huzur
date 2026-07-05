import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { useFamily } from '../../../context/FamilyContext';

const FamilyMomentumCard = memo(function FamilyMomentumCard({ onSelectFeature }) {
  const { t } = useTranslation();
  const { family, weeklyGoal, weeklyGoalLoading } = useFamily();

  const progressPercent = useMemo(() => {
    if (!weeklyGoal?.targetValue) return 0;
    return Math.min(Math.round(((weeklyGoal.currentValue || 0) / weeklyGoal.targetValue) * 100), 100);
  }, [weeklyGoal]);

  if (!family) {
    return (
      <div
        className="settings-card reveal-stagger bg-white rounded-3xl border-huzur-sage-100 shadow-huzur-soft"
        style={{
          margin: '0 5px 16px',
          padding: '22px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={18} color="var(--accent-gold)" />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 4 }}>
              {t('homeFeed.family.noFamilyTitle')}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', lineHeight: '1.45' }}>
              {t('homeFeed.family.noFamilyDesc')}
            </div>
          </div>
        </div>
        <button
          onClick={() => onSelectFeature('family')}
          className="hover-lift"
          style={{
            border: '1px solid color-mix(in srgb, var(--secondary) 20%, transparent)',
            borderRadius: '16px',
            background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
            color: 'var(--primary)',
            padding: '14px 16px',
            fontFamily: 'var(--font-main)',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          {t('homeFeed.family.noFamilyBtn')}
        </button>
      </div>
    );
  }

  return (
    <div
      className="settings-card reveal-stagger bg-white rounded-3xl border-huzur-sage-100 shadow-huzur-soft"
      style={{
        margin: '0 5px 16px',
        padding: '22px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
            {t('homeFeed.family.eyebrow')}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {family.name || 'Ailen'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', lineHeight: '1.45', marginTop: 4 }}>
            {weeklyGoal?.title || t('homeFeed.family.defaultGoal')}
          </div>
        </div>
        <div style={{
          minWidth: 64,
          borderRadius: 16,
          background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
          padding: '10px 12px',
          textAlign: 'center',
          border: '1px solid color-mix(in srgb, var(--secondary) 20%, transparent)'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--primary)', fontFamily: 'var(--font-main)' }}>
            {weeklyGoalLoading ? '...' : `${progressPercent}%`}
          </div>
          <div style={{ fontSize: '0.64rem', fontWeight: '800', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', textTransform: 'uppercase' }}>
            {t('homeFeed.family.progressLabel')}
          </div>
        </div>
      </div>

      <div style={{ height: 8, borderRadius: 10, background: 'color-mix(in srgb, var(--secondary) 12%, transparent)', overflow: 'hidden', marginBottom: 14 }}>
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent-gold-light), var(--accent-gold))',
            borderRadius: 10
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', lineHeight: '1.45' }}>
          {weeklyGoal
            ? t('homeFeed.family.hasGoalDesc', { current: weeklyGoal.currentValue || 0, target: weeklyGoal.targetValue || 0 })
            : t('homeFeed.family.noGoalDesc')}
        </div>
        <button
          onClick={() => onSelectFeature('family')}
          className="hover-lift"
          style={{
            border: '1px solid color-mix(in srgb, var(--secondary) 20%, transparent)',
            borderRadius: '16px',
            background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
            color: 'var(--primary)',
            padding: '10px 14px',
            fontFamily: 'var(--font-main)',
            fontWeight: '700',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {t('homeFeed.family.detailBtn')}
        </button>
      </div>
    </div>
  );
});

export default FamilyMomentumCard;
