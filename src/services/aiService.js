import { getFunctionsInstance } from './firebase';
import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';
import { storageService } from './storageService';
import { recordAiIncident } from './aiIncidentService';
import { getLocalHomeRanking, getLocalPushHint } from './localIntelligenceService';
import { buildWeeklyInsightFallback } from './spiritualInterventionService';

const callAiFunction = async (name, payload = {}) => {
  const { httpsCallable } = await import('firebase/functions');
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return result?.data || null;
};

const buildAiIncidentMetadata = (payload = {}) => ({
  hasContext: Boolean(payload?.context),
  hasMessage: typeof payload?.message === 'string' && payload.message.trim().length > 0,
  hasSessionId: typeof payload?.sessionId === 'string' && payload.sessionId.length > 0,
  candidateCount: Array.isArray(payload?.candidates) ? payload.candidates.length : 0,
  weekKey: typeof payload?.weekKey === 'string' ? payload.weekKey.slice(0, 40) : undefined,
  notificationType: typeof payload?.notificationType === 'string' ? payload.notificationType.slice(0, 40) : undefined,
});

export const getAssistantSessionState = () => ({
  sessionId: storageService.getString(STORAGE_KEYS.AI_ASSISTANT_SESSION_ID, ''),
  summary: storageService.getString(STORAGE_KEYS.AI_ASSISTANT_SESSION_SUMMARY, ''),
});

export const saveAssistantSessionState = (response) => {
  if (response?.sessionId) {
    storageService.setString(STORAGE_KEYS.AI_ASSISTANT_SESSION_ID, response.sessionId);
  }
  if (typeof response?.sessionSummary === 'string') {
    storageService.setString(STORAGE_KEYS.AI_ASSISTANT_SESSION_SUMMARY, response.sessionSummary);
  }
};

export const askAssistantV2 = async (payload = {}) => {
  try {
    const session = getAssistantSessionState();
    const result = await callAiFunction('askAssistantV2', {
      ...payload,
      sessionId: payload.sessionId || session.sessionId || undefined,
      sessionSummary: payload.sessionSummary || session.summary || undefined,
    });
    saveAssistantSessionState(result);
    return result;
  } catch (error) {
    recordAiIncident('assistant', 'callable_failed', error, buildAiIncidentMetadata(payload));
    logger.warn('[AIService] askAssistantV2 failed', error);
    return null;
  }
};

export const getHomeRankingV2 = async (payload = {}) => {
  try {
    return await getLocalHomeRanking(payload);
  } catch (error) {
    recordAiIncident('home_ranking', 'local_heuristic_failed', error, buildAiIncidentMetadata(payload));
    logger.warn('[AIService] getHomeRankingV2 failed', error);
    return {
      provider: 'local_fallback',
      headline: 'Ana ekran yerelde siralaniyor',
      explanation: 'Bulut cagri kapatildi. Cihaz ici kurallar varsayilan sirayi uyguladi.',
      socialHint: '',
      rankedModules: Array.isArray(payload?.candidates) ? payload.candidates.map((candidate) => candidate.id).filter(Boolean) : [],
      riskBand: 'steady',
    };
  }
};

export const generateWeeklyInsightsV1 = async (payload = {}) => {
  try {
    return await callAiFunction('generateWeeklyInsightsV1', payload);
  } catch (error) {
    recordAiIncident('weekly_insight', 'callable_failed', error, buildAiIncidentMetadata(payload));
    logger.warn('[AIService] generateWeeklyInsightsV1 failed', error);
    return buildWeeklyInsightFallback({
      context: payload?.context,
      weekKey: payload?.weekKey
    });
  }
};

export const getPersonalizedPushHintsV1 = async (payload = {}) => {
  try {
    return await getLocalPushHint(payload);
  } catch (error) {
    recordAiIncident('push_hint', 'local_heuristic_failed', error, buildAiIncidentMetadata(payload));
    logger.warn('[AIService] getPersonalizedPushHintsV1 failed', error);
    return {
      title: payload?.fallbackTitle || 'Bugun tek bir manevi mola yeter',
      body: payload?.fallbackBody || 'Hatirlatma metni cihaz icindeki son kullanim sinyallerine gore secildi.',
      provider: 'local_fallback',
      reason: 'fallback',
    };
  }
};

export default {
  askAssistantV2,
  getHomeRankingV2,
  generateWeeklyInsightsV1,
  getPersonalizedPushHintsV1,
  getAssistantSessionState,
  saveAssistantSessionState,
};
