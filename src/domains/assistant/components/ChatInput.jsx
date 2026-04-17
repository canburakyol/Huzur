import { Send, Sparkles } from 'lucide-react';

/**
 * FAQ quick-action bar + text input with send button.
 */
const ChatInput = ({ t, inputValue, onInputChange, onSend, onKeyDown, assistantV2Enabled, faqItems }) => (
  <>
    {/* FAQ Quick Actions */}
    <div
      style={{
        padding: '0 20px 16px 20px',
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        background: 'var(--nav-bg)',
        scrollbarWidth: 'none',
      }}
    >
      {faqItems.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSend(t(item.key))}
          className="settings-card"
          style={{
            padding: '12px 20px',
            background: 'var(--nav-hover)',
            border: '1px solid var(--nav-border)',
            borderRadius: '16px',
            fontSize: '0.85rem',
            color: 'var(--nav-text)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '800',
          }}
        >
          <Sparkles size={16} color="var(--nav-accent)" />
          {t(item.key)}
        </button>
      ))}
    </div>

    {/* Text Input */}
    <div
      style={{
        padding: '16px 20px',
        background: 'var(--nav-bg)',
        borderTop: '1px solid var(--nav-border)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      }}
    >
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            assistantV2Enabled
              ? t('assistant.aiInputPlaceholder', 'Bugun neye ihtiyacin oldugunu kisaca yaz')
              : t('assistant.betaInputPlaceholder', 'Hazir sorulardan birini yazin veya alttan secin')
          }
          style={{
            width: '100%',
            padding: '16px 24px',
            paddingRight: '60px',
            borderRadius: '24px',
            border: '2px solid var(--nav-border)',
            fontSize: '1rem',
            outline: 'none',
            background: 'var(--nav-hover)',
            color: 'var(--nav-text)',
            fontWeight: '600',
            transition: 'all 0.3s ease',
          }}
        />
        <button
          onClick={() => onSend()}
          disabled={!inputValue.trim()}
          style={{
            position: 'absolute',
            right: '6px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '20px',
            background: inputValue.trim() ? 'var(--nav-accent)' : 'var(--nav-border)',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputValue.trim() ? 'pointer' : 'default',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  </>
);

export default ChatInput;
