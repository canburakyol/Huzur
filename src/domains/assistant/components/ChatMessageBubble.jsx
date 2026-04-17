import { Sparkles } from 'lucide-react';

const TRUST_TONE_LABELS = {
  high: 'Guven yuksek',
  medium: 'Guven dengeli',
  low: 'Genel rehberlik',
};

const REVIEW_STATUS_LABELS = {
  reviewed: 'Kaynakli',
  contextual: 'Baglamsal',
  general_guidance: 'Genel rehberlik',
  unreviewed: 'Sinirli kaynak',
};

/**
 * Single chat message bubble with trust badges, source pills, and suggested actions.
 */
const ChatMessageBubble = ({ msg, onSuggestedAction }) => {
  const isUser = msg.type === 'user';

  return (
    <div
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Bubble */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: isUser ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
          background: isUser ? 'var(--nav-accent)' : 'var(--nav-hover)',
          color: isUser ? 'white' : 'var(--nav-text)',
          fontSize: '1rem',
          lineHeight: '1.6',
          fontWeight: '600',
          border: isUser ? 'none' : '1px solid var(--nav-border)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {msg.text}
      </div>

      {/* Suggested Actions */}
      {msg.meta?.suggestedActions?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {msg.meta.suggestedActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onSuggestedAction(action)}
              style={{
                padding: '8px 12px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.10)',
                color: 'var(--nav-text)',
                border: '1px solid rgba(16, 185, 129, 0.18)',
                fontSize: '0.76rem',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Confidence badge (simple) */}
      {msg.meta?.confidence && (
        <div style={{ fontSize: '0.7rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
          Guven: {msg.meta.confidence}
        </div>
      )}

      {/* Source pills */}
      {msg.meta?.sources?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {msg.meta.sources.map((source, index) => (
            <Pill
              key={`${source.label}-${index}`}
              bg="rgba(245, 158, 11, 0.10)"
              border="rgba(245, 158, 11, 0.18)"
              label={source.label}
            />
          ))}
        </div>
      )}

      {/* Trust badges row */}
      {msg.meta && !isUser && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Pill
            bg="rgba(212, 175, 55, 0.12)"
            border="rgba(212, 175, 55, 0.2)"
            label={TRUST_TONE_LABELS[msg.meta.confidence] || 'Genel rehberlik'}
          />
          <Pill
            bg="rgba(16, 185, 129, 0.10)"
            border="rgba(16, 185, 129, 0.18)"
            label={REVIEW_STATUS_LABELS[msg.meta.reviewStatus] || 'Sinirli kaynak'}
          />
          {Number.isFinite(Number(msg.meta.trustScore)) && (
            <Pill
              bg="rgba(59, 130, 246, 0.10)"
              border="rgba(59, 130, 246, 0.18)"
              label={`Trust ${Math.round(Number(msg.meta.trustScore) * 100)}%`}
            />
          )}
          {msg.meta?.sources?.slice(0, 2).map((source, index) => (
            <Pill
              key={`trust_${source.label || 'source'}_${index}`}
              bg="var(--nav-hover)"
              border="var(--nav-border)"
              label={source.label}
              muted
            />
          ))}
        </div>
      )}
    </div>
  );
};

/** Reusable pill badge */
const Pill = ({ bg, border, label, muted = false }) => (
  <div
    style={{
      padding: '6px 10px',
      borderRadius: '999px',
      background: bg,
      border: `1px solid ${border}`,
      color: muted ? 'var(--nav-text-muted)' : 'var(--nav-text)',
      fontSize: '0.7rem',
      fontWeight: muted ? '700' : '800',
    }}
  >
    {label}
  </div>
);

export default ChatMessageBubble;
