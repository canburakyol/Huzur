import { Send, Sparkles } from 'lucide-react';

/**
 * FAQ quick-action bar + text input with send button.
 */
const ChatInput = ({ t, inputValue, onInputChange, onSend, onKeyDown, assistantV2Enabled, faqItems }) => (
  <>
    {/* FAQ Quick Actions */}
    <div className="assistant-faq-scroll">
      {faqItems.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSend(t(item.key))}
          className="assistant-faq-btn"
          type="button"
        >
          <Sparkles size={14} color="var(--brand-primary)" />
          {t(item.key)}
        </button>
      ))}
    </div>

    {/* Text Input Container */}
    <div className="assistant-chat-input-container">
      <div className="assistant-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            assistantV2Enabled
              ? t('assistant.aiInputPlaceholder', 'Bugün neye ihtiyacın olduğunu kısaca yaz')
              : t('assistant.betaInputPlaceholder', 'Hazır sorulardan birini yazın veya alttan seçin')
          }
          className="assistant-input-field"
        />
        <button
          onClick={() => onSend()}
          disabled={!inputValue.trim()}
          className="assistant-send-btn"
          type="button"
          aria-label="Gönder"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  </>
);

export default ChatInput;
