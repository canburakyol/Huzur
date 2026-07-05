import { Gift, Send, Sparkles, Users } from 'lucide-react';

const ICON_BY_EMPHASIS = {
  reward: Gift,
  progress: Users,
  share: Sparkles,
};

function ReferralTriggerCard({ plan, onOpenInvite }) {
  if (!plan) {
    return null;
  }

  const AccentIcon = ICON_BY_EMPHASIS[plan.emphasis] || Gift;

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
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'rgba(141, 170, 157, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AccentIcon size={18} color="var(--accent-gold)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            {plan.badge}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 6 }}>
            {plan.headline}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', lineHeight: '1.55', fontWeight: '600' }}>
            {plan.description}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', lineHeight: '1.5', fontWeight: '600', marginBottom: 14 }}>
        {plan.supportLabel}
      </div>

      <button
        type="button"
        onClick={onOpenInvite}
        className="hover-lift"
        style={{
          border: '1px solid rgba(224, 169, 150, 0.2)',
          borderRadius: '16px',
          background: 'rgba(224, 169, 150, 0.12)',
          color: 'var(--text-primary)',
          padding: '14px 16px',
          fontFamily: 'var(--font-main)',
          fontWeight: '700',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <Send size={16} />
        {plan.ctaLabel}
      </button>
    </div>
  );
}

export default ReferralTriggerCard;
