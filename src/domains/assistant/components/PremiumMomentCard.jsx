/**
 * Premium moment upgrade card shown after successful AI interactions.
 */
const PremiumMomentCard = ({ premiumMoment, onAction }) => {
  if (!premiumMoment?.showUpgrade) return null;

  return (
    <div style={{ padding: '0 20px 16px', background: 'var(--nav-bg)' }}>
      <div
        className="settings-card"
        style={{
          padding: '16px 18px',
          borderRadius: '20px',
          border: '1px solid rgba(212, 175, 55, 0.22)',
          background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.12), rgba(15, 118, 110, 0.08))',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: '900',
            color: 'var(--nav-accent)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Premium moment
        </div>
        <div style={{ fontSize: '0.96rem', fontWeight: '900', color: 'var(--nav-text)' }}>
          {premiumMoment.headline}
        </div>
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--nav-text-muted)',
            lineHeight: '1.55',
            fontWeight: '600',
          }}
        >
          {premiumMoment.description}
        </div>
        <button
          type="button"
          onClick={onAction}
          style={{
            border: 'none',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--nav-accent), var(--accent-gold))',
            color: '#fff',
            padding: '12px 14px',
            fontWeight: '900',
            cursor: 'pointer',
          }}
        >
          Daha derin destegi gor
        </button>
      </div>
    </div>
  );
};

export default PremiumMomentCard;
