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
 *
 * Original Assistant.jsx was 766 lines. This shell is ~160 lines.
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
        text: `${t('assistant.welcomeMessage')}\n\n${t('assistant.betaWelcomeHint', 'Hazir sorulardan birine dokunabilir veya benzer bir soru yazabilirsiniz.')}`,
        meta: null,
      },
    ]);
  }, [t, setMessages]);

  return (
    <div
      className="assistant-container reveal-stagger"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'var(--nav-bg)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        className="settings-card"
        style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderRadius: '0 0 32px 32px',
          background: 'linear-gradient(135deg, var(--nav-bg), var(--nav-hover))',
          zIndex: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: 'none',
          borderBottom: '1px solid var(--nav-border)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'var(--nav-hover)',
            border: '1px solid var(--nav-border)',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--nav-text)',
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div
          className="settings-icon-box"
          style={{
            width: '48px',
            height: '48px',
            background: 'var(--nav-accent)',
            color: 'white',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bot size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: 'var(--nav-text)', fontSize: '1.25rem', fontWeight: '950' }}>
            {t('assistant.title', 'Huzur Rehberi')}
          </h3>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--accent-gold-light, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '800',
            }}
          >
            <span
              className="pulse"
              style={{
                width: '8px',
                height: '8px',
                background: 'var(--accent-gold-light, #f59e0b)',
                borderRadius: '50%',
              }}
            />
            {assistantV2Enabled
              ? t('assistant.readyAiMode', 'Sakin ve kisisel rehber modu')
              : t('assistant.readyQaMode', 'Hazir soru-cevap modu')}
          </div>
        </div>
      </div>

      {/* Recommendations (rarely shown — dead-code fallback) */}
      {recommendations.suggestions.length > 0 && (
        <div style={{ padding: '16px 20px 0', background: 'var(--nav-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Lightbulb size={14} color="var(--nav-accent)" />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                color: 'var(--nav-text-muted)',
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
                  background: 'var(--nav-hover)',
                  border: '1px solid var(--nav-border)',
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
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--nav-text)', lineHeight: 1.2 }}>
                    {suggestion.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--nav-text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                    {suggestion.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          background: 'var(--nav-bg)',
        }}
      >
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} msg={msg} onSuggestedAction={handleSuggestedAction} />
        ))}

        {isTyping && (
          <div
            style={{
              alignSelf: 'flex-start',
              background: 'var(--nav-hover)',
              padding: '16px 20px',
              borderRadius: '24px 24px 24px 4px',
              border: '1px solid var(--nav-border)',
            }}
          >
            <div className="typing-indicator">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Premium Moment */}
      <PremiumMomentCard premiumMoment={premiumMoment} onAction={handlePremiumMomentClick} />

      {/* Referral */}
      {referralTriggerPlan && (
        <div style={{ padding: '0 20px 8px', background: 'var(--nav-bg)' }}>
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
