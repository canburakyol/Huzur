import { Gift, Send, Sparkles, Users } from 'lucide-react';

const ICON_BY_EMPHASIS = {
  reward: Gift,
  progress: Users,
  share: Sparkles,
};

const BACKGROUND_BY_EMPHASIS = {
  reward: 'linear-gradient(145deg, rgba(212, 175, 55, 0.14), rgba(15, 118, 110, 0.12))',
  progress: 'linear-gradient(145deg, rgba(15, 118, 110, 0.14), rgba(180, 83, 9, 0.10))',
  share: 'linear-gradient(145deg, rgba(15, 118, 110, 0.12), rgba(255, 255, 255, 0.04))',
};

function ReferralTriggerCard({ plan, onOpenInvite }) {
  if (!plan) {
    return null;
  }

  const AccentIcon = ICON_BY_EMPHASIS[plan.emphasis] || Gift;

  return (
    <div
      className="settings-card reveal-stagger"
      style={{
        margin: '0 5px 16px',
        padding: '18px 18px',
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRadius: '22px',
        background: BACKGROUND_BY_EMPHASIS[plan.emphasis] || BACKGROUND_BY_EMPHASIS.share,
        border: '1px solid rgba(212, 175, 55, 0.18)',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AccentIcon size={18} color="var(--nav-accent)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
            {plan.badge}
          </div>
          <div style={{ fontSize: '0.96rem', fontWeight: '900', color: 'var(--nav-text)', marginBottom: 6 }}>
            {plan.headline}
          </div>
          <div style={{ fontSize: '0.79rem', color: 'var(--nav-text-muted)', lineHeight: '1.55', fontWeight: '600' }}>
            {plan.description}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.74rem', color: 'var(--nav-text-muted)', lineHeight: '1.5', fontWeight: '700', marginBottom: 14 }}>
        {plan.supportLabel}
      </div>

      <button
        type="button"
        onClick={onOpenInvite}
        className="hover-lift"
        style={{
          border: 'none',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, var(--nav-accent), var(--accent-gold))',
          color: '#fff',
          padding: '12px 14px',
          fontWeight: '900',
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
