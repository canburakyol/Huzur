import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFamily } from '../../../context/FamilyContext';
import { getAiFeatureFlags } from '../../../services/aiFeatureFlagService';
import { askAssistantV2 } from '../../../services/aiService';
import { buildAiContext } from '../../../services/aiContextService';
import { ASSISTANT_FAQ_ITEMS, getAssistantFaqAnswer } from '../../../services/assistantFaqService';
import { getDailyContent } from '../../../services/contentService';
import {
  buildPremiumMomentAnalyticsPayload,
  getPremiumMoment,
  openPremiumMoment,
} from '../../../services/premiumMomentService';
import { buildWeeklySocialSummary } from '../../../services/weeklySocialService';
import {
  ANALYTICS_EVENTS,
  analyticsService,
  logEvent,
  logAssistantV2Fallback,
  logAssistantV2Requested,
  logAssistantV2Responded,
  logAiTrustSurfaced,
} from '../../../services/analyticsService';
import { useReferralTriggerSurface } from '../../../hooks/useReferralTriggerSurface';
import { logger } from '../../../utils/logger';

const TAB_TARGETS = new Set(['home', 'prayers', 'quran', 'community', 'assistant']);
const COMMUNITY_FEATURES = new Set(['community', 'social']);

const getPersonalizedSuggestions = () => ({ suggestions: [], context: '' });

interface AssistantMessage {
  id: number;
  type: 'user' | 'bot';
  text: string;
  meta: Record<string, unknown> | null;
}

interface UseAssistantProps {
  streakData?: Record<string, unknown>;
  dailyContent?: Record<string, unknown>;
  timings?: Record<string, unknown>;
  nextPrayer?: string;
  locationName?: string;
  isProUser?: boolean;
  onSelectFeature?: (feature: string) => void;
  onSelectTab?: (tab: string) => void;
  onOpenInvite?: (source: string) => void;
}

const useAssistant = ({
  streakData,
  dailyContent,
  timings,
  nextPrayer,
  locationName,
  isProUser,
  onSelectFeature,
  onSelectTab,
  onOpenInvite,
}: UseAssistantProps) => {
  const { family, weeklyGoal } = useFamily();

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [assistantV2Enabled, setAssistantV2Enabled] = useState(false);
  const [premiumMomentsEnabled, setPremiumMomentsEnabled] = useState(false);
  const [premiumMoment, setPremiumMoment] = useState<Record<string, unknown> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const nextMessageIdRef = useRef(1);

  const recommendations = getPersonalizedSuggestions();
  const resolvedDailyContent = useMemo(() => dailyContent || getDailyContent(), [dailyContent]);
  const socialSummary = buildWeeklySocialSummary();
  const FAQ_ITEMS = useMemo(() => ASSISTANT_FAQ_ITEMS, []);

  const latestAssistantMeta = useMemo(() => {
    const latestBotMessage = [...messages].reverse().find((item) => item.type === 'bot' && item.meta);
    if (!latestBotMessage?.meta) return null;

    return {
      answered: true,
      confidence: latestBotMessage.meta.confidence || 'medium',
      reviewStatus: latestBotMessage.meta.reviewStatus || 'unreviewed',
      safeModeNotice: Boolean(latestBotMessage.meta.safeModeNotice),
      sources: latestBotMessage.meta.sources || [],
    };
  }, [messages]);

  const { plan: referralTriggerPlan } = useReferralTriggerSurface({
    surface: 'assistant',
    enabled: assistantV2Enabled,
    assistantMeta: latestAssistantMeta,
  });

  const getNextMessageId = useCallback(() => {
    const id = nextMessageIdRef.current;
    nextMessageIdRef.current += 1;
    return id;
  }, []);

  const getFaqAnswer = useCallback((query: string) => getAssistantFaqAnswer(query, undefined), []);

  const formatAssistantReply = useCallback(
    (result: Record<string, unknown>, query: string) => {
      if (!result?.answer) {
        return { text: getFaqAnswer(query), meta: null };
      }

      const parts = [result.answer as string];
      if (result.safeModeNotice) parts.push(result.safeModeNotice as string);

      return {
        text: parts.join('\n\n'),
        meta: {
          confidence: result.confidence || 'medium',
          reviewStatus: result.reviewStatus || 'unreviewed',
          trustScore: result.trustScore,
          sourceCount: result.sourceCount,
          provider: result.provider || 'fallback',
          safeModeNotice: Boolean(result.safeModeNotice),
          suggestedActions: Array.isArray(result.suggestedActions) ? result.suggestedActions : [],
          sources: Array.isArray(result.sources) ? result.sources : [],
        },
      };
    },
    [getFaqAnswer]
  );

  const buildRequestContext = useCallback(
    () =>
      buildAiContext({
        activeTab: 'assistant',
        activeFeature: 'assistant',
        streakData,
        dailyContent: resolvedDailyContent,
        timings,
        nextPrayer,
        locationName,
        isProUser,
        family,
        familyWeeklyGoal: weeklyGoal,
        socialSummary,
      }),
    [family, isProUser, locationName, nextPrayer, resolvedDailyContent, socialSummary, streakData, timings, weeklyGoal]
  );

  const handleSuggestedAction = useCallback(
    (action: Record<string, string> | null) => {
      if (!action || typeof action !== 'object') return;

      const rawTab = typeof action.tab === 'string' ? action.tab.trim() : '';
      const rawFeature = typeof action.feature === 'string' ? action.feature.trim() : '';

      if (rawTab && TAB_TARGETS.has(rawTab) && typeof onSelectTab === 'function') {
        onSelectTab(rawTab);
        return;
      }
      if (COMMUNITY_FEATURES.has(rawFeature) && typeof onSelectTab === 'function') {
        onSelectTab('community');
        return;
      }
      if (TAB_TARGETS.has(rawFeature) && typeof onSelectTab === 'function') {
        onSelectTab(rawFeature);
        return;
      }
      if (rawFeature && typeof onSelectFeature === 'function') {
        onSelectFeature(rawFeature);
      }
    },
    [onSelectFeature, onSelectTab]
  );

  const handleSend = useCallback(
    async (text?: string) => {
      const query = (text || inputValue || '').trim();
      if (!query || isTyping) return;
      const startedAt = Date.now();

      setMessages((prev) => [...prev, { id: getNextMessageId(), type: 'user', text: query, meta: null }]);
      setInputValue('');
      setIsTyping(true);

      if (!assistantV2Enabled) {
        setTimeout(() => {
          setMessages((prev) => [...prev, { id: getNextMessageId(), type: 'bot', text: getFaqAnswer(query), meta: null }]);
          setIsTyping(false);
        }, 400);
        return;
      }

      try {
        logAssistantV2Requested('assistant_tab', 'chat', {
          hasFamily: !!family,
          isPro: isProUser === true,
          hasStreak: (Number(streakData?.current) || 0) > 0,
        });

        const result = await askAssistantV2({ message: query, context: buildRequestContext() });

        if (!result?.answer) {
          logAssistantV2Fallback('empty_response', result?.provider || 'fallback', Date.now() - startedAt);
          setMessages((prev) => [...prev, { id: getNextMessageId(), type: 'bot', text: getFaqAnswer(query), meta: null }]);
          setIsTyping(false);
          return;
        }

        const reply = formatAssistantReply(result, query);
        logAssistantV2Responded(
          result.confidence || 'medium',
          Array.isArray(result.suggestedActions) && result.suggestedActions.length > 0,
          result.provider || 'fallback',
          Date.now() - startedAt,
          Array.isArray(result.suggestedActions) ? result.suggestedActions.length : 0,
          { reviewStatus: result.reviewStatus || 'unreviewed', trustScore: result.trustScore, sourceCount: result.sourceCount }
        );
        logAiTrustSurfaced('assistant', {
          provider: result.provider || 'fallback',
          confidence: result.confidence || 'medium',
          reviewStatus: result.reviewStatus || 'unreviewed',
          trustScore: result.trustScore,
          sourceCount: result.sourceCount,
        });

        setMessages((prev) => [...prev, { id: getNextMessageId(), type: 'bot', text: reply.text, meta: reply.meta }]);

        if (premiumMomentsEnabled && !isProUser) {
          setPremiumMoment(
            getPremiumMoment({
              isPro: false,
              source: 'assistant',
              momentType: 'assistant_success',
              assistantUsage: messages.filter((item) => item.type === 'bot').length + 1,
            })
          );
        }
      } catch (error) {
        logger.error('[Assistant] Failed to fetch assistant response', error);
        logAssistantV2Fallback('network_error', 'fallback', Date.now() - startedAt);
        setMessages((prev) => [...prev, { id: getNextMessageId(), type: 'bot', text: getFaqAnswer(query), meta: null }]);
      } finally {
        setIsTyping(false);
      }
    },
    [
      assistantV2Enabled,
      buildRequestContext,
      family,
      formatAssistantReply,
      getFaqAnswer,
      getNextMessageId,
      inputValue,
      isProUser,
      isTyping,
      messages,
      premiumMomentsEnabled,
      streakData,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSend();
    },
    [handleSend]
  );

  const handleOpenInvite = useCallback(() => {
    if (!referralTriggerPlan || typeof onOpenInvite !== 'function') return;
    analyticsService.logReferralTriggerCtaClicked('assistant', referralTriggerPlan.triggerId, referralTriggerPlan.analyticsPayload);
    onOpenInvite(referralTriggerPlan.entrySource);
  }, [onOpenInvite, referralTriggerPlan]);

  const handlePremiumMomentClick = useCallback(() => {
    if (!premiumMoment) return;
    logEvent(ANALYTICS_EVENTS.PREMIUM_MOMENT_OPENED, buildPremiumMomentAnalyticsPayload(premiumMoment));
    openPremiumMoment(premiumMoment);
  }, [premiumMoment]);

  useEffect(() => {
    setMessages([{ id: getNextMessageId(), type: 'bot', text: '', meta: null }]);
  }, [getNextMessageId]);

  useEffect(() => {
    let isCancelled = false;
    const resolveFlags = async () => {
      const flags = await getAiFeatureFlags();
      if (!isCancelled) {
        setAssistantV2Enabled(flags.assistant_v2_enabled === true);
        setPremiumMomentsEnabled(flags.premium_moments_v1_enabled === true);
      }
    };
    void resolveFlags();
    return () => { isCancelled = true; };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!referralTriggerPlan) return;
    analyticsService.logReferralTriggerSurfaceViewed(
      'assistant',
      referralTriggerPlan.triggerId,
      referralTriggerPlan.analyticsPayload
    );
  }, [referralTriggerPlan]);

  return {
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
  };
};

export default useAssistant;
