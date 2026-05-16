import { memo, useMemo } from 'react';
import { Users } from 'lucide-react';
import { useFamily } from '../../../context/FamilyContext';

const FamilyMomentumCard = memo(function FamilyMomentumCard({ onSelectFeature }) {
  const { family, weeklyGoal, weeklyGoalLoading } = useFamily();

  const progressPercent = useMemo(() => {
    if (!weeklyGoal?.targetValue) return 0;
    return Math.min(Math.round(((weeklyGoal.currentValue || 0) / weeklyGoal.targetValue) * 100), 100);
  }, [weeklyGoal]);

  if (!family) {
    return (
      <div
        className="settings-card reveal-stagger"
        style={{
          margin: '0 5px 16px',
          padding: '18px 18px',
          flexDirection: 'column',
          alignItems: 'stretch',
          borderRadius: '22px',
          background: 'linear-gradient(145deg, rgba(180, 83, 9, 0.12), rgba(15, 118, 110, 0.08))',
          border: '1px solid rgba(180, 83, 9, 0.18)'
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={18} color="var(--nav-accent)" />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '900', color: 'var(--nav-text)' }}>Ailece ilerlemeyi ac</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', lineHeight: '1.45' }}>
              Ortak hedefler ve birlikte istikrar icin bir aile grubu kur ya da bir davet kodu ile katil.
            </div>
          </div>
        </div>
        <button
          onClick={() => onSelectFeature('family')}
          className="hover-lift"
          style={{
            border: 'none',
            borderRadius: '14px',
            background: 'rgba(212, 175, 55, 0.16)',
            color: 'var(--nav-accent)',
            padding: '12px 14px',
            fontWeight: '800',
            cursor: 'pointer'
          }}
        >
          Aile alanini ac
        </button>
      </div>
    );
  }

  return (
    <div
      className="settings-card reveal-stagger"
      style={{
        margin: '0 5px 16px',
        padding: '18px 18px',
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRadius: '22px',
        background: 'linear-gradient(145deg, rgba(180, 83, 9, 0.12), rgba(15, 118, 110, 0.08))',
        border: '1px solid rgba(180, 83, 9, 0.18)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
            Aile momentumu
          </div>
          <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--nav-text)' }}>
            {family.name || 'Ailen'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--nav-text-muted)', lineHeight: '1.45', marginTop: 4 }}>
            {weeklyGoal?.title || 'Bu hafta birlikte kucuk ama istikrarli bir adim atin.'}
          </div>
        </div>
        <div style={{
          minWidth: 64,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.08)',
          padding: '10px 12px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--bg-emerald-light)' }}>
            {weeklyGoalLoading ? '...' : `${progressPercent}%`}
          </div>
          <div style={{ fontSize: '0.64rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>
            Tamam
          </div>
        </div>
      </div>

      <div style={{ height: 10, borderRadius: 999, background: 'rgba(0,0,0,0.16)', overflow: 'hidden', marginBottom: 10 }}>
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--nav-accent), var(--bg-emerald-light))'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: '0.76rem', color: 'var(--nav-text-muted)', lineHeight: '1.45' }}>
          {weeklyGoal
            ? `${weeklyGoal.currentValue || 0}/${weeklyGoal.targetValue || 0} katki kaydi var.`
            : 'Aile hedefini olusturup gunluk katkilari bir araya getirebilirsin.'}
        </div>
        <button
          onClick={() => onSelectFeature('family')}
          className="hover-lift"
          style={{
            border: 'none',
            borderRadius: '14px',
            background: 'rgba(15, 118, 110, 0.16)',
            color: 'var(--bg-emerald-light)',
            padding: '10px 14px',
            fontWeight: '800',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Detayi gor
        </button>
      </div>
    </div>
  );
});

export default FamilyMomentumCard;
