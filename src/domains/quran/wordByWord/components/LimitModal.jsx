import { Crown } from 'lucide-react';

/**
 * Pro upgrade limit modal shown when free users exceed limits.
 * Pure presentational component.
 */
const LimitModal = ({ t, onUpgrade, onDismiss }) => (
  <div className="word-modal-overlay">
    <div
      className="reveal-stagger"
      style={{
        background: 'var(--nav-bg)',
        borderRadius: '32px',
        padding: '40px 24px',
        maxWidth: '360px',
        width: '85%',
        textAlign: 'center',
        boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
        border: '1px solid var(--nav-border)',
      }}
    >
      <div
        className="settings-icon-box"
        style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          background: 'var(--primary)',
          color: 'var(--on-primary)',
          boxShadow: '0 12px 24px rgba(var(--nav-accent-rgb, 249, 115, 22), 0.4)',
        }}
      >
        <Crown size={40} />
      </div>
      <h3 style={{ margin: '0 0 12px', fontSize: '1.5rem', fontWeight: '950', color: 'var(--nav-text)' }}>
        {t('wordByWord.limitTitle')}
      </h3>
      <p
        style={{
          color: 'var(--nav-text-muted)',
          fontWeight: '600',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          marginBottom: '32px',
        }}
      >
        {t('wordByWord.limitDesc')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          className="velocity-target-btn"
          style={{
            width: '100%',
            justifyContent: 'center',
            background: 'var(--nav-accent)',
            color: 'var(--on-primary)',
          }}
          onClick={() => {
            onDismiss();
            onUpgrade();
          }}
        >
          {t('wordByWord.goToPro')}
        </button>
        <button
          className="velocity-target-btn"
          style={{
            width: '100%',
            justifyContent: 'center',
            background: 'var(--nav-hover)',
            color: 'var(--nav-text)',
          }}
          onClick={onDismiss}
        >
          {t('common.cancel', 'Vazgeç')}
        </button>
      </div>
    </div>
  </div>
);

export default LimitModal;
