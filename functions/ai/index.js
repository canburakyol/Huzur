const {
  functionsV1,
  onCall,
  onSchedule,
  HttpsError,
  admin,
  db,
  OPENAI_API_KEY,
  GEMINI_API_KEY,
  REGION,
  MAX_V1_CALLABLE_INSTANCES,
  secureCallableOptions,
  AI_PROVIDER,
  getAiFlags,
  sanitizeAssistantMessage,
  sanitizeAiContext,
  getRiskBand,
  buildContextSources,
  calculateTrustScore,
  deriveReviewStatus,
  buildAssistantFallbackResponseV2,
  detectAssistantSafetyCategory,
  buildAssistantSafetyResponse,
  buildHomeRankingFallback,
  buildWeeklyInsightFallback,
  buildPushHintFallback,
  getAiDeploySecrets,
  resolveAiJson,
  recordAiOpsMetric,
  getIstanbulDateKey,
  getAiMetricsDailyDoc,
  getAiMetricsStateDoc,
  getAiReleaseStatusDoc,
  logAiObservabilityEvent,
  buildAiReleaseStatusFromMetrics,
  getWeekKey,
} = require('../common/runtime');

function buildAssistantSystemPrompt() {
  return [
    'You are Huzur â€” a gentle, empathetic Islamic lifestyle companion, not a scholar or mufti.',
    '',
    'Persona Rules:',
    '- Speak like a wise elder sibling: warm, calm, zero judgment.',
    '- Never issue fatwa, legal rulings, or sectarian opinions.',
    '- If uncertain, say "Bu konuda bir Ä°slam alimine danÄ±ÅŸmanÄ± Ã¶neririm" and set confidence to "low".',
    '- If the user sounds stressed or overwhelmed, actively reduce the goal: "BugÃ¼n sadece bir Fatiha okumak bile gÃ¼zel bir adÄ±m."',
    '',
    'Response Architecture:',
    '- Open with emotional validation (1 sentence).',
    '- Provide the core guidance (2-3 sentences max).',
    '- Close with exactly ONE small, achievable next step.',
    '- Never exceed 150 words total.',
    '',
    'Tone Calibration:',
    '- Default: calm_supportive',
    '- If streak is 0 or riskBand is "at_risk": compassionate_recovery (no guilt, only hope)',
    '- If streak > 14: celebratory_gentle (acknowledge without over-praising)',
    '',
    'Safety Guardrails:',
    '- Never discuss politics, other religions negatively, or inter-sect debates.',
    '- If asked about mental health crises, respond: "Profesyonel destek almanÄ± Ã¶neriyorum. 182 ALO Psikiyatri hattÄ±nÄ± arayabilirsin."',
    '- For medical/legal questions: redirect immediately.',
    '',
    'Source Attribution:',
    '- When citing Quran, use format: "Sure Ad:Ayet" (e.g., "Bakara:286")',
    '- When citing Hadith, mention collection: "Buhari" or "MÃ¼slim"',
    '- If no specific source, use type: "general_islamic_guidance"',
    '',
    'Return strictly valid JSON: { answer, tone, confidence, suggestedActions[], safeModeNotice, sources[], sessionSummary }',
  ].join('\n');
}

function buildAssistantUserPrompt(userMessage, context, sessionSummary = '') {
  return JSON.stringify({
    userMessage,
    sessionSummary,
    context,
    outputRules: {
      suggestedActionsMax: 3,
      confidenceValues: ['high', 'medium', 'low'],
      noMarkdown: true,
    }
  });
}

function buildAssistantSystemPromptV2() {
  return [
    'You are Huzur - a calm Islamic wellbeing companion for modern Muslims.',
    '',
    'Role Boundaries:',
    '- You are not a mufti, scholar, therapist, doctor, or lawyer.',
    '- Never issue fatwa, legal rulings, sectarian opinions, or certain claims when the context is incomplete.',
    '- If confidence is limited, say "Bu konuda guvenilir bir ilim ehline danisman daha dogru olur." and set confidence to "low".',
    '- For mental health crisis, self-harm, violence, abuse, or severe panic: advise immediate human and professional support.',
    '- For medical or legal questions: redirect immediately and keep guidance short.',
    '- If the user asks for comparison between sects, communities, or political-religious disputes, do not take sides.',
    '',
    'Tone Rules:',
    '- Speak in warm Turkish using "sen".',
    '- Sound like a wise, non-judgmental older sibling: calm, hopeful, grounded.',
    '- Never shame, pressure, preach harshly, or compare the user to others.',
    '- If the user sounds tired, guilty, overwhelmed, or broken in rhythm, reduce the goal dramatically.',
    '',
    'Context Priorities:',
    '- Use the provided context actively: nextPrayer, streak, weeklySnapshot, primaryGoal, family state, and dailyContent.',
    '- If a prayer time is near, prefer a prayer-related next step.',
    '- If riskBand is "rebuild" or "at_risk", recommend the smallest realistic action, not an ambitious plan.',
    '- If family or social context exists, social nudges must stay gentle and optional.',
    '- If the user asks "simdi ne yapayim", give the smallest meaningful action first.',
    '',
    'Response Architecture:',
    '- Sentence 1: emotionally validate the user or reflect their intention.',
    '- Sentences 2-3: give the core guidance tied to the user context.',
    '- Final sentence: exactly one tiny next step the user can do now.',
    '- Keep the full answer under 140 words.',
    '',
    'Tone Calibration:',
    '- Default: calm_supportive',
    '- If streak is low or riskBand is "rebuild"/"at_risk": compassionate_recovery (no guilt, only hope)',
    '- If streak > 14: celebratory_gentle (acknowledge without over-praising)',
    '',
    'Safety Guardrails:',
    '- Never discuss politics, other religions negatively, or inter-sect debates.',
    '- Never present worship as a guilt tool, scoreboard, or threat.',
    '- Never generate manipulative urgency.',
    '- If a safety-sensitive topic appears, shorten the answer and prioritize human support over app navigation.',
    '',
    'Source Attribution:',
    '- Use at most 2 source items.',
    '- When citing Quran, use format "Sure:Ayet" (example: "Bakara:286").',
    '- When citing Hadith, mention collection only if reasonably confident.',
    '- If no specific source is needed, use type "general_islamic_guidance".',
    '',
    'Suggested Actions Rules:',
    '- suggestedActions may contain 0 to 3 items.',
    '- Each action must have { id, label } and optionally one target: feature or tab.',
    '- Allowed tabs: home, prayers, quran, community, assistant.',
    '- Allowed features: zikirmatik, duaTracker, qibla, hadiths, esmaUlHusna, tracker, hatimCoach, deedJournal, prayerTeacher, quranMemorize, dailyQuiz.',
    '- Prefer action labels that sound easy and gentle.',
    '- Avoid suggesting more than one step when confidence is low.',
    '',
    'Return strictly valid JSON: { answer, tone, confidence, suggestedActions[], safeModeNotice, sources[], sessionSummary }',
  ].join('\n');
}

function buildAssistantUserPromptV2(userMessage, context, sessionSummary = '') {
  return JSON.stringify({
    userMessage,
    sessionSummary,
    context,
    riskBand: getRiskBand(context),
    responseGoals: {
      maxWords: 140,
      shouldValidateEmotionFirst: true,
      nextStepCount: 1,
      avoidGuilt: true,
      avoidHarshPreaching: true,
    },
    outputRules: {
      suggestedActionsMax: 3,
      confidenceValues: ['high', 'medium', 'low'],
      noMarkdown: true,
      allowedTabs: ['home', 'prayers', 'quran', 'community', 'assistant'],
      allowedFeatures: ['zikirmatik', 'duaTracker', 'qibla', 'hadiths', 'esmaUlHusna', 'tracker', 'hatimCoach', 'deedJournal', 'prayerTeacher', 'quranMemorize', 'dailyQuiz'],
    }
  });
}

function normalizeAssistantResponse(value, fallbackValue) {
  const fallback = fallbackValue || {};
  const safe = value && typeof value === 'object' ? value : {};
  const suggestedActions = Array.isArray(safe.suggestedActions)
    ? safe.suggestedActions
        .filter((item) => item && typeof item === 'object')
        .slice(0, 3)
        .map((item, index) => ({
          id: typeof item.id === 'string' ? item.id.slice(0, 60) : `action_${index + 1}`,
          label: typeof item.label === 'string' ? item.label.slice(0, 80) : 'Oneriyi ac',
          feature: typeof item.feature === 'string' ? item.feature.slice(0, 80) : null,
          tab: typeof item.tab === 'string' ? item.tab.slice(0, 40) : null,
        }))
    : [];
  const sources = Array.isArray(safe.sources)
    ? safe.sources
        .filter((item) => item && typeof item === 'object')
        .slice(0, 3)
        .map((item) => normalizeCanonicalSourceMeta(item, {
          namespace: 'content',
          reviewStatus: TRUST_REVIEW_STATUS.CONTEXTUAL,
          origin: 'context',
        }))
    : [];
  const normalizedConfidence = ['high', 'medium', 'low'].includes(safe.confidence) ? safe.confidence : (fallback.confidence || 'medium');
  const normalizedSources = sources.length > 0 ? sources : (Array.isArray(fallback.sources) ? fallback.sources : []);
  const reviewStatus = normalizeTrustReviewStatus(
    safe.reviewStatus || fallback.reviewStatus,
    deriveReviewStatus({
      sources: normalizedSources,
      confidence: normalizedConfidence,
      safetyCategory: safe.safetyCategory || fallback.safetyCategory || null,
    })
  );
  const sourceCount = Math.max(
    0,
    Math.min(
      3,
      Number.isFinite(Number(safe.sourceCount))
        ? Number(safe.sourceCount)
        : (Number.isFinite(Number(fallback.sourceCount)) ? Number(fallback.sourceCount) : normalizedSources.length)
    )
  );
  const trustScore = Number.isFinite(Number(safe.trustScore))
    ? Math.max(0.2, Math.min(0.99, Number(safe.trustScore)))
    : Number.isFinite(Number(fallback.trustScore))
      ? Math.max(0.2, Math.min(0.99, Number(fallback.trustScore)))
    : calculateTrustScore({
        confidence: normalizedConfidence,
        sources: normalizedSources,
        provider: typeof safe.provider === 'string' ? safe.provider : fallback.provider || AI_PROVIDER.FALLBACK,
        safetyCategory: safe.safetyCategory || fallback.safetyCategory || null,
      });

  return {
    provider: typeof safe.provider === 'string' ? safe.provider : fallback.provider || AI_PROVIDER.FALLBACK,
    answer: typeof safe.answer === 'string' && safe.answer.trim()
      ? safe.answer.trim().slice(0, 1200)
      : fallback.answer || 'Bugun tek bir net adim secerek baslayalim.',
    tone: typeof safe.tone === 'string' ? safe.tone.slice(0, 40) : (fallback.tone || 'calm_supportive'),
    confidence: normalizedConfidence,
    suggestedActions: suggestedActions.length > 0 ? suggestedActions : (fallback.suggestedActions || []),
    safeModeNotice: typeof safe.safeModeNotice === 'string'
      ? safe.safeModeNotice.slice(0, 280)
      : (fallback.safeModeNotice || ''),
    sources: normalizedSources,
    reviewStatus,
    sourceCount,
    trustScore,
    safetyCategory: typeof safe.safetyCategory === 'string'
      ? safe.safetyCategory.slice(0, 60)
      : (typeof fallback.safetyCategory === 'string' ? fallback.safetyCategory.slice(0, 60) : null),
    sessionSummary: typeof safe.sessionSummary === 'string'
      ? safe.sessionSummary.slice(0, 500)
      : (fallback.sessionSummary || ''),
  };
}

function normalizeProvider(value, fallbackValue = AI_PROVIDER.FALLBACK) {
  return typeof value === 'string' && value.trim()
    ? value.trim().slice(0, 40)
    : fallbackValue;
}

function normalizeRiskBand(value, fallbackValue = 'recovering') {
  return ['steady', 'recovering', 'at_risk', 'rebuild'].includes(value)
    ? value
    : fallbackValue;
}

function normalizePriority(value, fallbackValue = 'recover') {
  return ['maintain', 'recover', 'rebuild'].includes(value)
    ? value
    : fallbackValue;
}

function normalizeShortText(value, fallbackValue, maxLength) {
  return typeof value === 'string' && value.trim()
    ? value.trim().slice(0, maxLength)
    : fallbackValue;
}

function buildNormalizedModuleOrder(rawRankedModules, candidates = [], fallbackRankedModules = []) {
  const candidateIds = Array.isArray(candidates)
    ? candidates
        .map((candidate) => (typeof candidate?.id === 'string' ? candidate.id : null))
        .filter(Boolean)
    : [];
  const allowedIds = new Set(candidateIds);
  const seen = new Set();
  const normalized = [];
  const pushIfAllowed = (id) => {
    if (!allowedIds.has(id) || seen.has(id)) return;
    seen.add(id);
    normalized.push(id);
  };

  if (Array.isArray(rawRankedModules)) {
    rawRankedModules.forEach((id) => {
      if (typeof id === 'string') {
        pushIfAllowed(id);
      }
    });
  }

  if (Array.isArray(fallbackRankedModules)) {
    fallbackRankedModules.forEach((id) => {
      if (typeof id === 'string') {
        pushIfAllowed(id);
      }
    });
  }

  candidateIds.forEach(pushIfAllowed);
  return normalized;
}

function normalizeHomeRankingResponse(value, fallbackValue, candidates = []) {
  const fallback = fallbackValue || {};
  const safe = value && typeof value === 'object' ? value : {};
  const normalizedConfidence = ['high', 'medium', 'low'].includes(safe.confidence) ? safe.confidence : (fallback.confidence || 'medium');
  const normalizedSources = Array.isArray(safe.sources)
    ? safe.sources
        .filter((item) => item && typeof item === 'object')
        .slice(0, 3)
        .map((item) => normalizeCanonicalSourceMeta(item, {
          namespace: 'content',
          reviewStatus: TRUST_REVIEW_STATUS.CONTEXTUAL,
          origin: 'context',
        }))
    : (Array.isArray(fallback.sources) ? fallback.sources : []);
  const reviewStatus = normalizeTrustReviewStatus(
    safe.reviewStatus || fallback.reviewStatus,
    deriveReviewStatus({ sources: normalizedSources, confidence: normalizedConfidence })
  );
  const sourceCount = Math.max(
    0,
    Math.min(
      3,
      Number.isFinite(Number(safe.sourceCount))
        ? Number(safe.sourceCount)
        : (Number.isFinite(Number(fallback.sourceCount)) ? Number(fallback.sourceCount) : normalizedSources.length)
    )
  );
  const trustScore = Number.isFinite(Number(safe.trustScore))
    ? Math.max(0.2, Math.min(0.99, Number(safe.trustScore)))
    : Number.isFinite(Number(fallback.trustScore))
      ? Math.max(0.2, Math.min(0.99, Number(fallback.trustScore)))
      : calculateTrustScore({
          confidence: normalizedConfidence,
          sources: normalizedSources,
          provider: normalizeProvider(safe.provider, fallback.provider || AI_PROVIDER.FALLBACK),
        });
  const rankedModules = buildNormalizedModuleOrder(
    safe.rankedModules,
    candidates,
    Array.isArray(fallback.rankedModules) ? fallback.rankedModules : []
  );

  return {
    provider: normalizeProvider(safe.provider, fallback.provider || AI_PROVIDER.FALLBACK),
    rankedModules: rankedModules.length > 0 ? rankedModules : (fallback.rankedModules || []),
    headline: normalizeShortText(safe.headline, fallback.headline || 'Bugun icin sakin bir oncelik sirasi hazirlandi.', 160),
    explanation: normalizeShortText(safe.explanation, fallback.explanation || 'Mevcut ritmine gore sade ve destekleyici bir akis secildi.', 240),
    riskBand: normalizeRiskBand(safe.riskBand, fallback.riskBand || 'recovering'),
    socialHint: normalizeShortText(safe.socialHint, fallback.socialHint || null, 180),
    confidence: normalizedConfidence,
    reviewStatus,
    sourceCount,
    trustScore,
    sources: normalizedSources,
  };
}

function normalizeWeeklyInsightResponse(value, fallbackValue, weekKey) {
  const fallback = fallbackValue || {};
  const safe = value && typeof value === 'object' ? value : {};
  const normalizedConfidence = ['high', 'medium', 'low'].includes(safe.confidence) ? safe.confidence : (fallback.confidence || 'medium');
  const normalizedSources = Array.isArray(safe.sources)
    ? safe.sources
        .filter((item) => item && typeof item === 'object')
        .slice(0, 3)
        .map((item) => normalizeCanonicalSourceMeta(item, {
          namespace: 'content',
          reviewStatus: TRUST_REVIEW_STATUS.CONTEXTUAL,
          origin: 'context',
        }))
    : (Array.isArray(fallback.sources) ? fallback.sources : []);
  const reviewStatus = normalizeTrustReviewStatus(
    safe.reviewStatus || fallback.reviewStatus,
    deriveReviewStatus({ sources: normalizedSources, confidence: normalizedConfidence })
  );
  const sourceCount = Math.max(
    0,
    Math.min(
      3,
      Number.isFinite(Number(safe.sourceCount))
        ? Number(safe.sourceCount)
        : (Number.isFinite(Number(fallback.sourceCount)) ? Number(fallback.sourceCount) : normalizedSources.length)
    )
  );
  const trustScore = Number.isFinite(Number(safe.trustScore))
    ? Math.max(0.2, Math.min(0.99, Number(safe.trustScore)))
    : Number.isFinite(Number(fallback.trustScore))
      ? Math.max(0.2, Math.min(0.99, Number(fallback.trustScore)))
    : calculateTrustScore({
        confidence: normalizedConfidence,
        sources: normalizedSources,
        provider: normalizeProvider(safe.provider, fallback.provider || AI_PROVIDER.FALLBACK),
      });

  return {
    provider: normalizeProvider(safe.provider, fallback.provider || AI_PROVIDER.FALLBACK),
    weekKey: normalizeWeekKey(safe.weekKey) || weekKey || fallback.weekKey || getWeekKey(new Date()),
    title: normalizeShortText(safe.title, fallback.title || 'Haftalik Huzur Ozeti', 120),
    summary: normalizeShortText(safe.summary, fallback.summary || 'Bu hafta ritmini korumak icin kucuk ve duzenli adimlar yeterli olabilir.', 480),
    riskBand: normalizeRiskBand(safe.riskBand, fallback.riskBand || 'recovering'),
    priority: normalizePriority(safe.priority, fallback.priority || 'recover'),
    socialHint: normalizeShortText(safe.socialHint, fallback.socialHint || null, 180),
    confidence: normalizedConfidence,
    reviewStatus,
    sourceCount,
    trustScore,
    sources: normalizedSources,
    generatedAt: typeof safe.generatedAt === 'string' && safe.generatedAt.trim()
      ? safe.generatedAt.trim().slice(0, 80)
      : new Date().toISOString(),
  };
}

function normalizeSendWindow(value, fallbackValue) {
  const fallback = fallbackValue && typeof fallbackValue === 'object'
    ? fallbackValue
    : { startHour: 10, endHour: 14 };

  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const startHour = Math.max(0, Math.min(23, Number(value.startHour)));
  const endHour = Math.max(0, Math.min(23, Number(value.endHour)));
  if (!Number.isFinite(startHour) || !Number.isFinite(endHour) || startHour > endHour) {
    return fallback;
  }

  return { startHour, endHour };
}

function normalizePushHintResponse(value, fallbackValue) {
  const fallback = fallbackValue || {};
  const safe = value && typeof value === 'object' ? value : {};
  const normalizedConfidence = ['high', 'medium', 'low'].includes(safe.confidence) ? safe.confidence : (fallback.confidence || 'medium');
  const normalizedSources = Array.isArray(safe.sources)
    ? safe.sources
        .filter((item) => item && typeof item === 'object')
        .slice(0, 3)
        .map((item) => normalizeCanonicalSourceMeta(item, {
          namespace: 'content',
          reviewStatus: TRUST_REVIEW_STATUS.CONTEXTUAL,
          origin: 'context',
        }))
    : (Array.isArray(fallback.sources) ? fallback.sources : []);
  const reviewStatus = normalizeTrustReviewStatus(
    safe.reviewStatus || fallback.reviewStatus,
    deriveReviewStatus({ sources: normalizedSources, confidence: normalizedConfidence })
  );
  const sourceCount = Math.max(
    0,
    Math.min(
      3,
      Number.isFinite(Number(safe.sourceCount))
        ? Number(safe.sourceCount)
        : (Number.isFinite(Number(fallback.sourceCount)) ? Number(fallback.sourceCount) : normalizedSources.length)
    )
  );
  const trustScore = Number.isFinite(Number(safe.trustScore))
    ? Math.max(0.2, Math.min(0.99, Number(safe.trustScore)))
    : Number.isFinite(Number(fallback.trustScore))
      ? Math.max(0.2, Math.min(0.99, Number(fallback.trustScore)))
      : calculateTrustScore({
          confidence: normalizedConfidence,
          sources: normalizedSources,
          provider: normalizeProvider(safe.provider, fallback.provider || AI_PROVIDER.FALLBACK),
        });

  return {
    provider: normalizeProvider(safe.provider, fallback.provider || AI_PROVIDER.FALLBACK),
    title: normalizeShortText(safe.title, fallback.title || 'Bugun icin kucuk bir adim sec', 80),
    body: normalizeShortText(safe.body, fallback.body || 'Kisa bir mola ile niyetini tazeleyebilirsin.', 180),
    reason: normalizeShortText(safe.reason, fallback.reason || 'gentle_guidance', 60),
    sendWindow: normalizeSendWindow(safe.sendWindow, fallback.sendWindow),
    confidence: normalizedConfidence,
    reviewStatus,
    sourceCount,
    trustScore,
    sources: normalizedSources,
  };
}

function summarizeTrustSources(sources = [], limit = 3) {
  if (!Array.isArray(sources)) return [];
  return sources
    .filter((item) => item && typeof item === 'object')
    .slice(0, limit)
    .map((item) => normalizeCanonicalSourceMeta(item, {
      namespace: 'content',
      reviewStatus: TRUST_REVIEW_STATUS.CONTEXTUAL,
      origin: 'context',
    }));
}

function buildAiHealthSnapshot(kind, value = {}, extra = {}) {
  const safeKind = typeof kind === 'string' ? kind.slice(0, 40) : 'unknown';
  const safeValue = value && typeof value === 'object' ? value : {};
  const safeExtra = extra && typeof extra === 'object' ? extra : {};
  const snapshot = {
    kind: safeKind,
    provider: normalizeProvider(safeValue.provider, AI_PROVIDER.FALLBACK),
    confidence: ['high', 'medium', 'low'].includes(safeValue.confidence) ? safeValue.confidence : null,
    reviewStatus: normalizeTrustReviewStatus(safeValue.reviewStatus, TRUST_REVIEW_STATUS.UNREVIEWED),
    trustScore: Number.isFinite(Number(safeValue.trustScore))
      ? Math.max(0.2, Math.min(0.99, Number(safeValue.trustScore)))
      : null,
    sourceCount: Number.isFinite(Number(safeValue.sourceCount))
      ? Math.max(0, Math.min(3, Number(safeValue.sourceCount)))
      : (Array.isArray(safeValue.sources) ? Math.min(3, safeValue.sources.length) : 0),
    sources: summarizeTrustSources(safeValue.sources),
    updatedAtIso: new Date().toISOString(),
  };

  if (typeof safeValue.riskBand === 'string') {
    snapshot.riskBand = normalizeRiskBand(safeValue.riskBand, 'recovering');
  }
  if (typeof safeValue.reason === 'string' && safeValue.reason.trim()) {
    snapshot.reason = safeValue.reason.trim().slice(0, 60);
  }
  if (typeof safeValue.safetyCategory === 'string' && safeValue.safetyCategory.trim()) {
    snapshot.safetyCategory = safeValue.safetyCategory.trim().slice(0, 60);
  }
  if (Array.isArray(safeValue.rankedModules)) {
    snapshot.moduleCount = Math.min(8, safeValue.rankedModules.length);
  }

  Object.entries(safeExtra).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null) return;
    if (typeof rawValue === 'string') {
      snapshot[key] = rawValue.slice(0, 120);
      return;
    }
    if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
      snapshot[key] = rawValue;
    }
  });

  return snapshot;
}

function createAskAssistantV2Handler(deps = {}) {
  const dbRef = deps.db || db;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;
  const resolveAiFn = deps.resolveAiJson || resolveAiJson;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const message = sanitizeAssistantMessage(request.data?.message);
    if (!message) {
      throw new HttpsError('invalid-argument', 'Gecerli bir mesaj gerekli.');
    }

    const flags = await getAiFlags(dbRef);
    if (!flags.assistant_v2_enabled) {
      throw new HttpsError('failed-precondition', 'assistant_v2_enabled kapali.');
    }

    const localRate = rateLimitFn(`askAssistantV2:${userId}`, 8, 60000);
    if (!localRate.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla istek gonderdiniz. Lutfen biraz bekleyin.');
    }

    const distributedRate = await distributedRateLimitFn({
      dbRef,
      adminSdk: admin,
      namespace: 'askAssistantV2',
      identifier: userId,
      maxRequests: 40,
      windowMs: 3600000,
    });
    if (!distributedRate.allowed) {
      throw new HttpsError('resource-exhausted', 'Saatlik AI rehber limiti doldu. Lutfen daha sonra tekrar deneyin.');
    }

    const startedAt = Date.now();
    const context = sanitizeAiContext(request.data?.context || {});
    const safetyCategory = detectAssistantSafetyCategory(message);
    const fallback = buildAssistantFallbackResponseV2(message, context);
    const safetyResponse = safetyCategory ? buildAssistantSafetyResponse(safetyCategory, context) : null;
    const baseResult = safetyResponse || fallback;
    const aiResult = await resolveAiFn({
      task: 'assistant',
      systemPrompt: buildAssistantSystemPromptV2(),
      userPrompt: buildAssistantUserPromptV2(message, context, String(request.data?.sessionSummary || '').slice(0, 500)),
      openAiSecret: undefined,
      geminiSecret: GEMINI_API_KEY,
      fallbackFactory: () => baseResult,
    });
    const normalized = normalizeAssistantResponse(aiResult, baseResult);
    const sessionId = isValidDocumentId(String(request.data?.sessionId || '').trim(), 120)
      ? String(request.data.sessionId).trim()
      : `session_${Date.now().toString(36)}`;

    const profileRef = dbRef.collection('users').doc(userId).collection('aiProfile').doc('profile');
    const sessionRef = dbRef.collection('users').doc(userId).collection('assistantSessions').doc(sessionId);

    await Promise.all([
      profileRef.set({
        lastAssistantAt: admin.firestore.FieldValue.serverTimestamp(),
        lastProvider: normalized.provider,
        lastRiskBand: getRiskBand(context),
        lastSafetyCategory: safetyCategory || null,
        lastConfidence: normalized.confidence,
        lastReviewStatus: normalized.reviewStatus,
        lastTrustScore: normalized.trustScore,
        lastSourceCount: normalized.sourceCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        contextSnapshot: {
          primaryGoal: context.primaryGoal,
          userIntentSegment: context.userIntentSegment,
          streakCurrent: context.streak.current,
          nextPrayer: context.prayer.nextPrayer,
        },
        latestAssistantSnapshot: buildAiHealthSnapshot('assistant', normalized, {
          riskBand: getRiskBand(context),
          safetyCategory: safetyCategory || normalized.safetyCategory || null,
        }),
        latestAiHealthAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true }),
      sessionRef.set({
        summary: normalized.sessionSummary || fallback.sessionSummary,
        lastMessage: message.slice(0, 500),
        lastConfidence: normalized.confidence,
        lastReviewStatus: normalized.reviewStatus,
        lastTrustScore: normalized.trustScore,
        lastSourceCount: normalized.sourceCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true }),
    ]);

    logAiObservabilityEvent('assistant_v2_resolved', {
      userId,
      provider: normalized.provider,
      confidence: normalized.confidence,
      reviewStatus: normalized.reviewStatus,
      trustScore: normalized.trustScore,
      sourceCount: normalized.sourceCount,
      safetyCategory: safetyCategory || normalized.safetyCategory || null,
      latencyMs: Date.now() - startedAt,
      usedFallback: normalized.provider === AI_PROVIDER.FALLBACK || normalized.provider === 'safety_policy',
    });

    if (flags.ai_ops_rollup_v1_enabled) {
      await recordAiOpsMetric(dbRef, {
        surface: 'assistant',
        provider: normalized.provider,
        usedFallback: normalized.provider === AI_PROVIDER.FALLBACK || normalized.provider === 'safety_policy',
        trustScore: normalized.trustScore,
      });
    }

    return {
      ...normalized,
      sessionId,
    };
  };
}

const askAssistantV2Handler = createAskAssistantV2Handler();
exports.askAssistantV2 = onCall(
  secureCallableOptions({ secrets: getAiDeploySecrets({ includeGemini: true }) }),
  askAssistantV2Handler
);

function buildHomeRankingSystemPromptV2() {
  return [
    'You are the Huzur Home Personalization Engine.',
    '',
    'Goal: Rank home modules for one user to maximize spiritual momentum, clarity, and trust - not raw screen time.',
    '',
    'Ranking Priority:',
    '1. If a prayer time is close, prayer-adjacent modules come first.',
    '2. If riskBand is "rebuild" or "at_risk", put the easiest win first.',
    '3. If the user has family or hatim momentum, include one social module in the top 3.',
    '4. Keep one familiar module high for continuity.',
    '5. Keep one lighter discovery module in positions 4-5 to gently widen usage.',
    '6. If campaignId is ramadan, favor relevant daily content without crowding the top completely.',
    '',
    'Rules:',
    '- Never invent module IDs. Only use IDs from candidates.',
    '- Treat baselineRanking as the safe default order; only move items when the context clearly justifies it.',
    '- rankedModules must be a full ordering of the candidate ids, without duplicates.',
    '- headline must be Turkish, warm, and under 60 characters.',
    '- explanation must be Turkish, concise, and explain the ordering logic in under 120 characters.',
    '- socialHint must be empty when no social signal exists.',
    '- Prefer simplicity and calm over novelty.',
    '',
    'Return strictly valid JSON: { rankedModules[], headline, explanation, riskBand, socialHint }',
  ].join('\n');
}

function buildHomeRankingUserPromptV2(context, candidates = []) {
  const baseline = buildHomeRankingBaseline(context, candidates);
  return JSON.stringify({
    context,
    riskBand: baseline.riskBand,
    candidates,
    baselineRanking: baseline.rankedModules,
    scoredCandidates: baseline.scoredCandidates,
    guidance: {
      keepOneFamiliarModuleHigh: true,
      includeSocialInTop3IfRelevant: true,
      preferSmallestWinWhenAtRisk: true,
      avoidAggressiveNovelty: true,
    }
  });
}

function buildWeeklyInsightsSystemPromptV2() {
  return [
    'You are Huzur Weekly Reflection Writer.',
    '',
    'Task: Write a personalized weekly spiritual reflection for one Muslim user.',
    '',
    'Writing Style:',
    '- Sound like a caring friend reviewing the week together, never like a report card.',
    '- Use Turkish with "sen", never "siz".',
    '- Keep summary to 2-3 sentences.',
    '- Make the effort visible, even in weak weeks.',
    '- Do not use score language, guilt, or pressure.',
    '',
    'Adaptation Rules:',
    '- If activeDays >= 5: celebrate consistency and suggest maintaining the rhythm.',
    '- If activeDays is 3-4: acknowledge effort and suggest one small improvement.',
    '- If activeDays is 0-2: pure empathy, hope, and the easiest re-entry point.',
    '- Treat baselineInsight as the safe emotional starting point. Improve clarity, not drama.',
    '- If family context exists: socialHint may mention gentle shared rhythm.',
    '- Include at most one Quran or Hadith reference, and only when reasonably confident.',
    '',
    'Title Rules:',
    '- Turkish, under 50 characters, no emoji.',
    '- Calm, specific, and warm.',
    '',
    'Return strictly valid JSON: { title, summary, riskBand, priority, socialHint }',
  ].join('\n');
}

function buildWeeklyInsightBaselineV2(context, weekKey) {
  const summary = context?.weeklySnapshot || {};
  const activeDays = Number(summary.activeDays) || 0;
  const prayerDays = Number(summary.prayerDays) || 0;
  const quranDays = Number(summary.quranDays) || 0;
  const riskBand = getRiskBand(context);
  const hasFamily = Boolean(context?.social?.family);
  const hasActivity = summary.hasActivity === true;
  let title = 'Haftalik Huzur Ozeti';
  let body = 'Bu hafta kucuk ama duzenli adimlarla ritmini korumaya devam et.';
  let priority = riskBand === 'steady' ? 'maintain' : 'recover';

  if (!hasActivity) {
    title = 'Yeni bir baslangic haftasi';
    body = 'Gecen hafta daha sakindi. Yeni haftaya tek bir net adimla baslamak yeterli olabilir.';
    priority = 'rebuild';
  } else if (riskBand === 'steady') {
    title = 'Ritmin sakin bicimde guclendi';
    body = `Gecen hafta ${activeDays} farkli gunde Huzur'a dokundun. Bu istikrari ayni sadelikle surdurmen yeterli.`;
    if (prayerDays >= 5) {
      body = `Namaz ritminde gorunur bir istikrar var. Gecen hafta ${activeDays} gunluk temas bunu sakin bicimde desteklemis.`;
    }
  } else if (riskBand === 'at_risk') {
    title = 'Ritmi yeniden toplama zamani';
    body = 'Ritim biraz dagilmis gorunuyor. Yeni haftada once tek bir temel akisi sabitlemek en saglikli adim olur.';
  } else if (riskBand === 'rebuild') {
    title = 'Kucuk adimla geri don';
    body = 'Bu hafta kendine yuklenmeden yeniden baslamak en dogru adim olabilir. Kisa, kolay ve tekrar edilebilir bir baslangic yeterli.';
    priority = 'rebuild';
  }

  if (quranDays >= 3 && riskBand !== 'rebuild') {
    body = `${body} Kuranla kurdugun temas da haftaya yavas ama anlamli bir derinlik katmis gorunuyor.`;
  }

  return {
    weekKey,
    title,
    summary: body,
    riskBand,
    priority,
    socialHint: hasFamily
      ? 'Aile alaninda haftalik hedefe kucuk bir katki eklemek ritmi gorunur kilabilir.'
      : null,
  };
}

function buildWeeklyInsightFallbackV2(context, weekKey) {
  const sources = buildContextSources(context);
  const baseline = buildWeeklyInsightBaselineV2(context, weekKey);
  return {
    provider: AI_PROVIDER.FALLBACK,
    weekKey: baseline.weekKey,
    title: baseline.title,
    summary: baseline.summary,
    riskBand: baseline.riskBand,
    priority: baseline.priority,
    confidence: 'medium',
    reviewStatus: deriveReviewStatus({ sources, confidence: 'medium' }),
    sourceCount: sources.length,
    trustScore: calculateTrustScore({
      confidence: 'medium',
      sources,
      provider: AI_PROVIDER.FALLBACK,
    }),
    sources,
    socialHint: baseline.socialHint,
  };
}

function buildWeeklyInsightsUserPromptV2(context, weekKey) {
  return JSON.stringify({
    weekKey,
    context,
    baselineInsight: buildWeeklyInsightBaselineV2(context, weekKey),
    writingGoals: {
      maxSentences: 3,
      showEffortWithoutPressure: true,
      keepReEntryEasyWhenWeakWeek: true,
      optionalSocialNudgeOnly: true,
    }
  });
}

function buildPushHintSystemPromptV2() {
  return [
    'You are Huzur Notification Composer.',
    '',
    'Core Principle: Every notification must feel like a kind whisper, never a demand.',
    '',
    'Type Handling:',
    '- reminder: mention the upcoming prayer naturally.',
    '- streak_recovery: use compassion, belonging, and hope. Never guilt.',
    '- social: mention family or hatim progress gently.',
    '- discovery: invite with calm curiosity, not hype.',
    '',
    'Anti-Patterns:',
    '- Never use urgency language, scarcity, or guilt.',
    '- Never say the user failed, missed everything, or is falling behind.',
    '- Never use all caps.',
    '- Use at most one emoji, and only if it softens the tone.',
    '- Respect quiet hours and avoid late-night nudges unless context strongly supports it.',
    '- Treat baselineHint as the safe default. Improve warmth and relevance, not intensity.',
    '',
    'Output Rules:',
    '- title: Turkish, under 40 characters.',
    '- body: Turkish, under 120 characters.',
    '- reason: short machine-friendly string.',
    '- sendWindow: choose a calm local window aligned to the context.',
    '',
    'Return strictly valid JSON: { title, body, reason, sendWindow }',
  ].join('\n');
}

function buildPushHintUserPromptV2(type, context) {
  return JSON.stringify({
    type,
    context,
    baselineHint: buildPushHintBaselineV2(type, context),
    copyGoals: {
      warm: true,
      guiltFree: true,
      short: true,
      calmMomentum: true,
    }
  });
}

function createGetHomeRankingV2Handler(deps = {}) {
  const dbRef = deps.db || db;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const resolveAiFn = deps.resolveAiJson || resolveAiJson;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const startedAt = Date.now();
    const flags = await getAiFlags(dbRef);
    if (!flags.home_ranking_v2_enabled) {
      throw new HttpsError('failed-precondition', 'home_ranking_v2_enabled kapali.');
    }

    const rateState = rateLimitFn(`getHomeRankingV2:${userId}`, 20, 60000);
    if (!rateState.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla home ranking istegi gonderdiniz.');
    }

    const context = sanitizeAiContext(request.data?.context || {});
    const candidates = Array.isArray(request.data?.candidates)
      ? request.data.candidates
          .filter((item) => item && typeof item === 'object' && typeof item.id === 'string')
          .slice(0, 12)
          .map((item) => ({
            id: item.id.slice(0, 60),
            title: typeof item.title === 'string' ? item.title.slice(0, 120) : item.id.slice(0, 60),
          }))
      : [];

    const fallback = buildHomeRankingFallback(context, candidates);
    const aiResult = await resolveAiFn({
      task: 'home_ranking',
      systemPrompt: buildHomeRankingSystemPromptV2() || [
        'You are the Huzur Home Personalization Engine.',
        '',
        'Your task: Rank home screen modules for ONE specific user based on their behavioral context.',
        '',
        'Ranking Strategy (Priority Order):',
        '1. TIMING SIGNAL: If a prayer time is within 30 minutes, prioritize prayer-related modules.',
        '2. STREAK RECOVERY: If currentStreak is 0 or riskBand is "at_risk"/"rebuild", surface the easiest-to-complete module first (e.g., daily_zikir or daily_dua).',
        '3. SOCIAL NUDGE: If user has an active family or hatim group, place social modules in top 3.',
        '4. HABIT LOOP: Place the user\'s most-used feature (from weeklySnapshot) in position 2.',
        '5. DISCOVERY: Always place one underused module in position 4-5 to encourage exploration.',
        '',
        'Rules:',
        '- NEVER invent module IDs. Only use IDs from the candidates array.',
        '- headline: Max 60 chars, Turkish, warm. Example: "AkÅŸam namazÄ±na hazÄ±r mÄ±sÄ±n? ğŸŒ™"',
        '- explanation: Max 120 chars, explain WHY this order was chosen.',
        '- riskBand: "steady" | "recovering" | "at_risk" | "rebuild" â€” based on streak + activity.',
        '- socialHint: If user has family/hatim, include a gentle social nudge. Otherwise empty string.',
        '',
        'Return strictly valid JSON: { rankedModules[], headline, explanation, riskBand, socialHint }',
      ].join('\n'),
      userPrompt: buildHomeRankingUserPromptV2(context, candidates),
      openAiSecret: undefined,
      geminiSecret: GEMINI_API_KEY,
      fallbackFactory: () => fallback,
    });

    const result = normalizeHomeRankingResponse(aiResult, fallback, candidates);

    await dbRef.collection('users').doc(userId).collection('aiProfile').doc('profile').set({
      lastHomeRankingAt: admin.firestore.FieldValue.serverTimestamp(),
      homeRankingProvider: result.provider,
      homeRankingRiskBand: result.riskBand,
      latestHomeRankingSnapshot: buildAiHealthSnapshot('home_ranking', result),
      latestAiHealthAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    logAiObservabilityEvent('home_ranking_v2_resolved', {
      userId,
      provider: result.provider,
      confidence: result.confidence,
      reviewStatus: result.reviewStatus,
      trustScore: result.trustScore,
      sourceCount: result.sourceCount,
      riskBand: result.riskBand,
      moduleCount: Array.isArray(result.rankedModules) ? result.rankedModules.length : 0,
      latencyMs: Date.now() - startedAt,
      usedFallback: result.provider === AI_PROVIDER.FALLBACK,
    });

    if (flags.ai_ops_rollup_v1_enabled) {
      await recordAiOpsMetric(dbRef, {
        surface: 'home_ranking',
        provider: result.provider,
        usedFallback: result.provider === AI_PROVIDER.FALLBACK,
        trustScore: result.trustScore,
      });
    }

    return result;
  };
}

const getHomeRankingV2Handler = createGetHomeRankingV2Handler();
exports.getHomeRankingV2 = onCall(
  secureCallableOptions({ secrets: getAiDeploySecrets({ includeGemini: true }) }),
  getHomeRankingV2Handler
);

function createGenerateWeeklyInsightsV1Handler(deps = {}) {
  const dbRef = deps.db || db;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const resolveAiFn = deps.resolveAiJson || resolveAiJson;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const flags = await getAiFlags(dbRef);
    if (!flags.weekly_insights_v1_enabled) {
      throw new HttpsError('failed-precondition', 'weekly_insights_v1_enabled kapali.');
    }

    const rateState = rateLimitFn(`generateWeeklyInsightsV1:${userId}`, 8, 60000);
    if (!rateState.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla insight istegi gonderdiniz.');
    }

    const startedAt = Date.now();
    const context = sanitizeAiContext(request.data?.context || {});
    const weekKey = normalizeWeekKey(request.data?.weekKey) || getWeekKey(new Date());
    const fallback = buildWeeklyInsightFallbackV2(context, weekKey);

    const aiResult = await resolveAiFn({
      task: 'weekly_insight',
      systemPrompt: buildWeeklyInsightsSystemPromptV2() || [
        'You are Huzur Weekly Reflection Writer.',
        '',
        'Task: Write a personalized weekly spiritual reflection for a Muslim user.',
        '',
        'Writing Style:',
        '- Like a caring friend reviewing the week together, not a report card.',
        '- Use "sen" (informal Turkish "you"), never "siz".',
        '- Max 3 sentences for summary.',
        '- Include exactly ONE Quran ayah or Hadith reference that matches the user\'s week.',
        '',
        'Contextual Adaptation:',
        '- If activeDays >= 5: Celebrate consistency. Suggest maintaining, don\'t push harder.',
        '- If activeDays 3-4: Acknowledge effort. Suggest one small improvement.',
        '- If activeDays 0-2: Pure empathy. "Herkesin durgun haftalarÄ± olur. Ã–nemli olan geri dÃ¶nmek." Suggest the absolute easiest action.',
        '- If user has family: Include a gentle family reference in socialHint.',
        '',
        'Title Rules:',
        '- Max 50 chars, Turkish, no emoji.',
        '- Examples: "Bu hafta namaz ritmin gÃ¼Ã§lendi", "Yeni bir baÅŸlangÄ±Ã§ zamanÄ±"',
        '',
        'Return strictly valid JSON: { title, summary, riskBand, priority, socialHint }',
      ].join('\n'),
      userPrompt: buildWeeklyInsightsUserPromptV2(context, weekKey),
      openAiSecret: undefined,
      geminiSecret: GEMINI_API_KEY,
      fallbackFactory: () => fallback,
    });

    const result = normalizeWeeklyInsightResponse(aiResult, fallback, weekKey);

    await dbRef.collection('users').doc(userId).collection('weeklyInsights').doc(weekKey).set({
      ...result,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      contextSnapshot: {
        activeDays: context?.weeklySnapshot?.activeDays || 0,
        prayerDays: context?.weeklySnapshot?.prayerDays || 0,
        quranDays: context?.weeklySnapshot?.quranDays || 0,
      }
    }, { merge: true });

    await dbRef.collection('users').doc(userId).collection('aiProfile').doc('profile').set({
      lastWeeklyInsightAt: admin.firestore.FieldValue.serverTimestamp(),
      weeklyInsightProvider: result.provider,
      weeklyInsightConfidence: result.confidence,
      weeklyInsightReviewStatus: result.reviewStatus,
      weeklyInsightTrustScore: result.trustScore,
      weeklyInsightSourceCount: result.sourceCount,
      latestWeeklyInsightSnapshot: buildAiHealthSnapshot('weekly_insight', result),
      latestAiHealthAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    logAiObservabilityEvent('weekly_insight_v1_resolved', {
      userId,
      provider: result.provider,
      confidence: result.confidence,
      reviewStatus: result.reviewStatus,
      trustScore: result.trustScore,
      sourceCount: result.sourceCount,
      riskBand: result.riskBand,
      latencyMs: Date.now() - startedAt,
      usedFallback: result.provider === AI_PROVIDER.FALLBACK,
    });

    if (flags.ai_ops_rollup_v1_enabled) {
      await recordAiOpsMetric(dbRef, {
        surface: 'weekly_insight',
        provider: result.provider,
        usedFallback: result.provider === AI_PROVIDER.FALLBACK,
        trustScore: result.trustScore,
      });
    }

    return result;
  };
}

const generateWeeklyInsightsV1Handler = createGenerateWeeklyInsightsV1Handler();
exports.generateWeeklyInsightsV1 = onCall(
  secureCallableOptions({ secrets: getAiDeploySecrets({ includeGemini: true }) }),
  generateWeeklyInsightsV1Handler
);

function createGetPersonalizedPushHintsV1Handler(deps = {}) {
  const dbRef = deps.db || db;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const resolveAiFn = deps.resolveAiJson || resolveAiJson;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const flags = await getAiFlags(dbRef);
    if (!flags.push_personalization_v1_enabled) {
      throw new HttpsError('failed-precondition', 'push_personalization_v1_enabled kapali.');
    }

    const rateState = rateLimitFn(`getPersonalizedPushHintsV1:${userId}`, 20, 60000);
    if (!rateState.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla push hint istegi gonderdiniz.');
    }

    const startedAt = Date.now();
    const type = typeof request.data?.type === 'string' ? request.data.type.slice(0, 40) : 'reminder';
    const context = sanitizeAiContext(request.data?.context || {});
    const fallback = {
      ...buildPushHintFallback(type, context),
      ...buildPushHintBaselineV2(type, context),
    };

    const aiResult = await resolveAiFn({
      task: 'push_hint',
      systemPrompt: buildPushHintSystemPromptV2() || [
        'You are Huzur Notification Composer â€” the gentlest reminder system in the world.',
        '',
        'Core Principle: A notification should feel like a kind whisper, never a demand.',
        '',
        'Notification Types & Strategies:',
        '- "reminder" (prayer): Reference the specific upcoming prayer by name. Keep under 8 words for title.',
        '- "streak_recovery": If streak broke, use compassion not guilt. "Seni Ã¶zledik" not "Serini kaybettin!"',
        '- "social": Mention family/hatim progress gently.',
        '- "discovery": Suggest an unexplored feature with curiosity framing: "Biliyor muydun?"',
        '',
        'Anti-Pattern Rules (NEVER do these):',
        '- Never use urgency language: "Son ÅŸans!", "Acele et!", "KaÃ§Ä±rma!"',
        '- Never guilt-trip: "BugÃ¼n hiÃ§ namaz kÄ±lmadÄ±n"',
        '- Never use ALL CAPS or excessive emoji (max 1 emoji per notification)',
        '- Never send between 22:00-06:00 unless user explicitly has night mode active',
        '',
        'Title: Max 40 chars, Turkish.',
        'Body: Max 120 chars, Turkish, warm & concise.',
        'sendWindow: { startHour, endHour } â€” respect user\'s quiet hours.',
        '',
        'Return strictly valid JSON: { title, body, reason, sendWindow }',
      ].join('\n'),
      userPrompt: buildPushHintUserPromptV2(type, context),
      openAiSecret: undefined,
      geminiSecret: GEMINI_API_KEY,
      fallbackFactory: () => fallback,
    });

    const result = normalizePushHintResponse(aiResult, fallback);

    await dbRef.collection('users').doc(userId).collection('aiProfile').doc('profile').set({
      lastPushHintAt: admin.firestore.FieldValue.serverTimestamp(),
      pushHintProvider: result.provider,
      pushHintReason: result.reason,
      latestPushHintSnapshot: buildAiHealthSnapshot('push_hint', result, {
        notificationType: type,
      }),
      latestAiHealthAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    logAiObservabilityEvent('push_hint_v1_resolved', {
      userId,
      provider: result.provider,
      type,
      reason: result.reason,
      confidence: result.confidence,
      reviewStatus: result.reviewStatus,
      trustScore: result.trustScore,
      sourceCount: result.sourceCount,
      latencyMs: Date.now() - startedAt,
      usedFallback: result.provider === AI_PROVIDER.FALLBACK,
    });

    if (flags.ai_ops_rollup_v1_enabled) {
      await recordAiOpsMetric(dbRef, {
        surface: 'push_hint',
        provider: result.provider,
        usedFallback: result.provider === AI_PROVIDER.FALLBACK,
        trustScore: result.trustScore,
      });
    }

    return result;
  };
}

const getPersonalizedPushHintsV1Handler = createGetPersonalizedPushHintsV1Handler();
exports.getPersonalizedPushHintsV1 = onCall(
  secureCallableOptions({ secrets: getAiDeploySecrets({ includeGemini: true }) }),
  getPersonalizedPushHintsV1Handler
);

exports.generateWeeklyInsightsCron = onSchedule({
  region: REGION,
  schedule: '0 7 * * 1',
  timeZone: 'Europe/Istanbul',
  maxInstances: 1,
  secrets: [OPENAI_API_KEY, GEMINI_API_KEY],
}, async () => {
  const flags = await getAiFlags(db);
  if (!flags.weekly_insights_v1_enabled) {
    return;
  }

  try {
    const weekKey = getWeekKey(new Date());
    const snapshot = await db.collection('users').limit(100).get();
    const tasks = snapshot.docs.map(async (userDoc) => {
      const context = sanitizeAiContext({
        primaryGoal: userDoc.data()?.primaryGoal || 'prayer_rhythm',
        userIntentSegment: userDoc.data()?.intentSegment || 'prayer_rhythm',
        social: {
          family: userDoc.data()?.familyId ? { id: userDoc.data().familyId, name: 'Aile', memberCount: 0 } : null,
        }
      });
      const fallback = buildWeeklyInsightFallbackV2(context, weekKey);
      await db.collection('users').doc(userDoc.id).collection('weeklyInsights').doc(weekKey).set({
        ...fallback,
        generatedAt: new Date().toISOString(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    await Promise.all(tasks);

    if (flags.ai_ops_rollup_v1_enabled) {
      await recordAiOpsMetric(db, {
        provider: AI_PROVIDER.FALLBACK,
        weeklyCronStatus: 'success',
      });
    }
  } catch (error) {
    logAiObservabilityEvent('weekly_insight_cron_failed', {
      message: error?.message || 'unknown',
    }, 'ERROR');

    if (flags.ai_ops_rollup_v1_enabled) {
      await recordAiOpsMetric(db, {
        provider: AI_PROVIDER.FALLBACK,
        isCriticalIncident: true,
        weeklyCronStatus: 'failure',
      });
    }

    throw error;
  }
});

exports.aiObservabilityRollupCron = onSchedule({
  region: REGION,
  schedule: '15 * * * *',
  timeZone: 'Europe/Istanbul',
  maxInstances: 1,
}, async () => {
  const flags = await getAiFlags(db);
  if (!flags.ai_ops_rollup_v1_enabled) {
    return;
  }

  const dateKey = getIstanbulDateKey(new Date());
  const [dailySnapshot, rollingSnapshot] = await Promise.all([
    getAiMetricsDailyDoc(db, dateKey).get(),
    getAiMetricsStateDoc(db).get(),
  ]);

  const releaseStatus = buildAiReleaseStatusFromMetrics({
    dailyMetrics: dailySnapshot.exists ? dailySnapshot.data() : {},
    rollingState: rollingSnapshot.exists ? rollingSnapshot.data() : {},
    now: new Date(),
  });

  await getAiReleaseStatusDoc(db).set(releaseStatus, { merge: true });
  logAiObservabilityEvent('ai_release_status_computed', {
    status: releaseStatus.status,
    fallbackRate: releaseStatus.fallbackRate,
    lowTrustRate: releaseStatus.lowTrustRate,
    criticalIncidentCount24h: releaseStatus.criticalIncidentCount24h,
    staleSurfaceCount: releaseStatus.staleSurfaceCount,
    weeklyCronHealthy: releaseStatus.weeklyCronHealthy,
    topProvider: releaseStatus.topProvider,
    topRiskSurface: releaseStatus.topRiskSurface,
  });
});

function createDeprecatedCallableHandler(functionName) {
  return async () => {
    throw new functionsV1.https.HttpsError(
      'unavailable',
      `${functionName} is no longer available in this deployment.`
    );
  };
}

// Keep legacy callable names exported so full deploys do not attempt to delete
// production-only functions unexpectedly. These endpoints are not referenced by
// the current app codebase.
exports.generateGeminiContent = functionsV1
  .region(REGION)
  .runWith({ enforceAppCheck: true, maxInstances: MAX_V1_CALLABLE_INSTANCES })
  .https.onCall(createDeprecatedCallableHandler('generateGeminiContent'));

exports.queryNuzulSebebi = functionsV1
  .region(REGION)
  .runWith({ enforceAppCheck: true, maxInstances: MAX_V1_CALLABLE_INSTANCES })
  .https.onCall(createDeprecatedCallableHandler('queryNuzulSebebi'));

exports.__test = {
  createAskAssistantV2Handler,
  createGenerateWeeklyInsightsV1Handler,
  buildAiHealthSnapshot,
  normalizeAssistantResponse,
  normalizeHomeRankingResponse,
  normalizePushHintResponse,
  normalizeWeeklyInsightResponse,
};
