import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, ChevronLeft, Lightbulb } from 'lucide-react';
import useAssistant from '../hooks/useAssistant';
import ChatMessageBubble from './ChatMessageBubble';
import ChatInput from './ChatInput';
import PremiumMomentCard from './PremiumMomentCard';
import ReferralTriggerCard from '../../../components/ReferralTriggerCard';
import './Assistant.css';

/**
 * AssistantShell — the orchestrator component.
 * All state/logic lives in useAssistant hook.
 * All UI panels are dumb presentational components.
 */
const AssistantShell = ({
  onClose,
  onSelectFeature,
  onSelectTab,
  timings = null,
  nextPrayer = null,
  locationName = '',
  streakData = null,
  dailyContent = null,
  isProUser = false,
  onOpenInvite,
}) => {
  const { t } = useTranslation();
  const {
    messages,
    inputValue,
    isTyping,
    assistantV2Enabled,
    premiumMoment,
    recommendations,
    FAQ_ITEMS,
    referralTriggerPlan,
    messagesEndRef,
    setMessages,
    setInputValue,
    handleSend,
    handleKeyDown,
    handleSuggestedAction,
    handleOpenInvite,
    handlePremiumMomentClick,
  } = useAssistant({
    streakData,
    dailyContent,
    timings,
    nextPrayer,
    locationName,
    isProUser,
    onSelectFeature,
    onSelectTab,
    onOpenInvite,
  });

  // Set initial welcome message with translation
  useEffect(() => {
    setMessages([
      {
        id: 0,
        type: 'bot',
        text: `${t('assistant.welcomeMessage')}\n\n${t('assistant.betaWelcomeHint', 'Hazır sorulardan birine dokunabilir veya benzer bir soru yazabilirsiniz.')}`,
        meta: null,
      },
    ]);
  }, [t, setMessages]);

  return (
    <div className="assistant-container reveal-stagger">
      {/* Header */}
      <div className="assistant-header">
        <button onClick={onClose} className="assistant-back-btn" aria-label="Geri">
          <ChevronLeft size={20} />
        </button>
        <div className="assistant-icon-box">
          <Bot size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="assistant-title">
            {t('assistant.title', 'Huzur Rehberi')}
          </h3>
          <div className="assistant-subtitle">
            <span className="pulse-indicator" />
            {assistantV2Enabled
              ? t('assistant.readyAiMode', 'Sakin ve kişisel rehber modu')
              : t('assistant.readyQaMode', 'Hazır soru-cevap modu')}
          </div>
        </div>
      </div>

      {/* Recommendations (rarely shown — dead-code fallback) */}
      {recommendations.suggestions.length > 0 && (
        <div style={{ padding: '16px 20px 0', background: 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Lightbulb size={14} color="var(--brand-primary)" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                color: 'var(--text-subtle)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {recommendations.context}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }}>
            {recommendations.suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                style={{
                  flexShrink: 0,
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'default',
                  minWidth: '180px',
                  maxWidth: '220px',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{suggestion.icon}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-heading)', lineHeight: 1.2 }}>
                    {suggestion.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-body)', marginTop: '2px', lineHeight: 1.3 }}>
                    {suggestion.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message list */}
      <div className="assistant-messages-list">
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} msg={msg} onSuggestedAction={handleSuggestedAction} />
        ))}

        {isTyping && (
          <div className="assistant-typing-container">
            <div className="typing-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Premium Moment */}
      <PremiumMomentCard premiumMoment={premiumMoment} onAction={handlePremiumMomentClick} />

      {/* Referral */}
      {referralTriggerPlan && (
        <div style={{ padding: '0 20px 8px', background: 'transparent' }}>
          <ReferralTriggerCard plan={referralTriggerPlan} onOpenInvite={handleOpenInvite} />
        </div>
      )}

      {/* Input */}
      <ChatInput
        t={t}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        assistantV2Enabled={assistantV2Enabled}
        faqItems={FAQ_ITEMS}
      />
    </div>
  );
};

export default AssistantShell;
