const functionsV1 = require('firebase-functions/v1');
const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const axios = require('axios');
const crypto = require('crypto');
const reviewedSourceCatalog = require('../reviewedSourceCatalog.json');

// Initialize Firebase Admin
admin.initializeApp();

// Firestore reference
const db = admin.firestore();

// Secret definitions - Firebase Secrets Manager
const REVENUECAT_WEBHOOK_TOKEN = defineSecret('REVENUECAT_WEBHOOK_TOKEN');
const REVENUECAT_API_KEY = defineSecret('REVENUECAT_API_KEY');
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

// Rate limiting in-memory store (production'da Redis Ã¶nerilir)
// NOT: Bubellek tabanlÄ± rate limiting, tek instance Ã§alÄ±ÅŸan local emÃ¼latÃ¶rde doÄŸru Ã§alÄ±ÅŸÄ±r.
// Ancak Cloud Functions production'da birden fazla instance'a Ã¶lÃ§eklenebilir.
// Ã–nerilen: Firebase Realtime Database veya Redis kullanarak daÄŸÄ±tÄ±k rate limiting implementasyonu.
const rateLimitStore = new Map();
const RATE_LIMIT_MAX_KEYS = 10000;

function pruneRateLimitStore(now = Date.now()) {
  for (const [key, value] of rateLimitStore.entries()) {
    if (!value || now > value.resetAt) {
      rateLimitStore.delete(key);
    }
  }

  if (rateLimitStore.size > RATE_LIMIT_MAX_KEYS) {
    let overflow = rateLimitStore.size - RATE_LIMIT_MAX_KEYS;
    for (const key of rateLimitStore.keys()) {
      rateLimitStore.delete(key);
      overflow -= 1;
      if (overflow <= 0) break;
    }
  }
}

function safeTokenEquals(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function isValidUid(uid) {
  return typeof uid === 'string' && uid.length > 0 && uid.length <= 128 && !uid.includes('/');
}

function isValidDocumentId(value, max = 200) {
  return typeof value === 'string' && value.length > 0 && value.length <= max && !value.includes('/');
}

function normalizeCode(value, min = 6, max = 12) {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  if (normalized.length < min || normalized.length > max) {
    return null;
  }

  return normalized;
}

function normalizeFcmToken(value) {
  const normalized = String(value || '').trim();
  if (normalized.length < 20 || normalized.length > 4096) {
    return null;
  }
  if (/\s/.test(normalized)) {
    return null;
  }
  return normalized;
}

function sanitizeDisplayName(value, fallback = 'Isimsiz') {
  const normalized = String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 80);
  return normalized || fallback;
}

function sanitizeAvatar(value, fallback = 'ğŸ‘¤') {
  const normalized = String(value || '').trim().slice(0, 16);
  return normalized || fallback;
}

function sanitizeRole(value, fallback = 'member') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .slice(0, 20);

  if (!normalized) return fallback;
  if (!['parent', 'member', 'child'].includes(normalized)) return fallback;
  return normalized;
}

function sanitizeProfileId(value) {
  const normalized = String(value || '').trim().slice(0, 80);
  return normalized || null;
}

function timestampToMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value === 'number') return value;
  return 0;
}

function countCompletedHatimParts(parts) {
  if (!parts || typeof parts !== 'object') return 0;

  return Object.values(parts).filter((part) => part?.status === 'completed').length;
}

function sanitizePublicHatim(doc, viewerUid) {
  const data = doc.data() || {};
  const totalParts = Number.isInteger(data.totalParts) && data.totalParts > 0 ? data.totalParts : 30;
  const completedParts = countCompletedHatimParts(data.parts);
  const readers = Array.isArray(data.readers) ? data.readers.filter(isValidUid) : [];
  const isMember = isValidUid(viewerUid) && readers.includes(viewerUid);
  const safeName = typeof data.name === 'string' && data.name.trim().length > 0
    ? data.name.trim().slice(0, 100)
    : (typeof data.title === 'string' && data.title.trim().length > 0
        ? data.title.trim().slice(0, 100)
        : 'Hatim');
  const safeDescription = typeof data.description === 'string'
    ? data.description.trim().slice(0, 160)
    : '';

  return {
    id: doc.id,
    name: safeName,
    description: safeDescription,
    totalParts,
    completedParts,
    progressPercent: Math.max(0, Math.min(100, Math.round((completedParts / totalParts) * 100))),
    memberCount: readers.length,
    isMember,
    joinCode: isMember ? normalizeCode(data.joinCode, 6, 12) : null,
    createdAtMs: timestampToMillis(data.createdAt),
    isSeed: data.isSeed === true,
    seedSource: typeof data.seedSource === 'string' ? data.seedSource.slice(0, 40) : null,
  };
}

const DISCOVERY_SEED_HATIMS = [
  {
    id: 'seed-hatim-sabir',
    name: 'Huzur Toplulugu Sabir Hatmi',
    description: 'Zor zamanlardan gecenler icin birlikte niyet edilen acik hatim halkasi.',
    totalParts: 30,
    completedParts: 18,
    progressPercent: 60,
    memberCount: 24,
    isMember: false,
    joinCode: null,
    createdAtMs: Date.parse('2026-03-10T08:00:00.000Z'),
    isSeed: true,
    seedSource: 'huzur',
  },
  {
    id: 'seed-hatim-cuma',
    name: 'Cuma Bereket Hatmi',
    description: 'Cuma gunu dualarinda bulusmak isteyenler icin haftalik topluluk hatmi.',
    totalParts: 30,
    completedParts: 9,
    progressPercent: 30,
    memberCount: 17,
    isMember: false,
    joinCode: null,
    createdAtMs: Date.parse('2026-03-12T11:30:00.000Z'),
    isSeed: true,
    seedSource: 'huzur',
  },
];

const DISCOVERY_SEED_FAMILIES = [
  {
    id: 'seed-family-dua',
    name: 'Huzur Dua Cemberi',
    isSeed: true,
    seedSource: 'huzur',
    createdAtMs: Date.parse('2026-03-09T09:00:00.000Z'),
  },
  {
    id: 'seed-family-bereket',
    name: 'Bereket Sofrasi Ailesi',
    isSeed: true,
    seedSource: 'huzur',
    createdAtMs: Date.parse('2026-03-11T18:30:00.000Z'),
  },
];

function sanitizePublicFamily(doc) {
  const data = doc.data() || {};
  const safeName = typeof data.name === 'string' && data.name.trim().length > 0
    ? data.name.trim().slice(0, 80)
    : 'Aile';

  return {
    id: doc.id,
    name: safeName,
    isSeed: data.isSeed === true,
    seedSource: typeof data.seedSource === 'string' ? data.seedSource.slice(0, 40) : null,
    createdAtMs: timestampToMillis(data.createdAt),
  };
}

function sanitizeDuaText(value) {
  const normalized = String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 1000);

  return normalized.length >= 5 ? normalized : null;
}

function sanitizeHatimName(value) {
  const normalized = String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 100);

  return normalized || null;
}

function sanitizeHatimDescription(value) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 240);
}

function sanitizePublicDua(doc) {
  const data = doc.data() || {};
  const isAnonymous = data.isAnonymous === true;
  const safeText = typeof data.text === 'string'
    ? data.text.trim().slice(0, 1000)
    : '';

  return {
    id: doc.id,
    text: safeText,
    isAnonymous,
    authorName: isAnonymous ? 'Bir Mumin' : sanitizeDisplayName(data.authorName, 'Isimsiz'),
    aminCount: Math.max(0, Number(data.aminCount) || 0),
    createdAtMs: timestampToMillis(data.createdAt),
    featured: data.featured === true,
  };
}

function buildHatimParts(totalParts = 30) {
  const parts = {};

  for (let i = 1; i <= totalParts; i += 1) {
    parts[i] = {
      status: 'free',
      takenBy: null,
      takenAt: null,
      completedAt: null,
    };
  }

  return parts;
}

function getWeekKey(date = new Date()) {
  const base = new Date(date);
  const day = base.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + diff);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
}

function getDateKey(date = new Date(), timeZone = 'Europe/Istanbul') {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    return new Date(date).toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}

function buildDefaultWeeklyGoal(memberCount = 1) {
  const safeMembers = Math.max(1, Number(memberCount) || 1);
  const targetValue = Math.max(7, safeMembers * 4);

  return {
    goalType: 'active_days',
    title: 'Haftalik aile odagi',
    description: 'Bu hafta ailecek her gun kucuk bir ibadet adimi ile ritmi canli tutun.',
    targetValue,
    currentValue: 0,
    status: 'active',
    contributors: {},
  };
}

function normalizeWeekKey(value) {
  const normalized = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
}

function canonicalizeTextForFingerprint(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function hashValue(value) {
  return crypto.createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

function sanitizeMiniLeaguePreferences(value = {}) {
  const visibilityMode = String(value?.visibilityMode || '')
    .trim()
    .toLowerCase();

  return {
    optedIn: value?.optedIn === true,
    visibilityMode: ['private', 'group', 'league'].includes(visibilityMode)
      ? visibilityMode
      : 'private',
  };
}

function logSecurityEvent(eventType, payload = {}, severity = 'INFO') {
  const safePayload = Object.entries(payload).reduce((acc, [key, value]) => {
    if (value === undefined) {
      return acc;
    }
    if (typeof value === 'string') {
      acc[key] = value.slice(0, 200);
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});

  console.log(JSON.stringify({
    severity,
    eventType,
    ...safePayload,
  }));
}

function logAiObservabilityEvent(eventType, payload = {}, severity = 'INFO') {
  const safePayload = Object.entries(payload).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) {
      return acc;
    }
    if (typeof value === 'string') {
      acc[key] = value.slice(0, 200);
      return acc;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      acc[key] = value;
      return acc;
    }
    return acc;
  }, {});

  console.log(JSON.stringify({
    severity,
    eventType,
    channel: 'ai_observability',
    ...safePayload,
  }));
}

const AI_SURFACES = ['assistant', 'home_ranking', 'weekly_insight', 'push_hint'];
const AI_RELEASE_THRESHOLDS = {
  watchFallbackRate: 0.25,
  criticalFallbackRate: 0.4,
  watchLowTrustRate: 0.2,
  staleSurfaceWindowMs: 24 * 60 * 60 * 1000,
  weeklyCronHealthyWindowMs: 8 * 24 * 60 * 60 * 1000,
};

function getIstanbulDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getAiMetricsDailyDoc(dbRef = db, dateKey = getIstanbulDateKey(new Date())) {
  return dbRef.collection('ops').doc('aiMetrics').collection('daily').doc(dateKey);
}

function getAiMetricsStateDoc(dbRef = db) {
  return dbRef.collection('ops').doc('aiMetrics');
}

function getAiReleaseStatusDoc(dbRef = db) {
  return dbRef.collection('ops').doc('aiReleaseStatus');
}

function sanitizeOpsFieldKey(value, fallback = 'unknown') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .slice(0, 60);
  return normalized || fallback;
}

function toFiniteCount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

function toMillisSafe(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === 'number') return value;
  return 0;
}

async function recordAiOpsMetric(dbRef = db, {
  surface,
  provider,
  usedFallback = false,
  trustScore = null,
  isCriticalIncident = false,
  weeklyCronStatus = null,
  occurredAt = new Date(),
} = {}) {
  const normalizedSurface = sanitizeOpsFieldKey(surface, 'unknown');
  const normalizedProvider = sanitizeOpsFieldKey(provider, 'fallback');
  const dateKey = getIstanbulDateKey(occurredAt);
  const lowTrust = Number.isFinite(Number(trustScore)) && Number(trustScore) < 0.55;
  const dailyDocRef = getAiMetricsDailyDoc(dbRef, dateKey);
  const stateDocRef = getAiMetricsStateDoc(dbRef);

  const dailyUpdate = {
    requestCount: admin.firestore.FieldValue.increment(surface ? 1 : 0),
    fallbackCount: admin.firestore.FieldValue.increment(usedFallback ? 1 : 0),
    lowTrustCount: admin.firestore.FieldValue.increment(lowTrust ? 1 : 0),
    criticalIncidentCount: admin.firestore.FieldValue.increment(isCriticalIncident ? 1 : 0),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (surface) {
    dailyUpdate[`providerBreakdown.${normalizedProvider}`] = admin.firestore.FieldValue.increment(1);
    dailyUpdate[`surfaceBreakdown.${normalizedSurface}`] = admin.firestore.FieldValue.increment(1);
    dailyUpdate[`lastSeenAtBySurface.${normalizedSurface}`] = admin.firestore.FieldValue.serverTimestamp();
    if (usedFallback || lowTrust) {
      dailyUpdate[`riskSurfaceBreakdown.${normalizedSurface}`] = admin.firestore.FieldValue.increment(1);
    }
  }

  if (weeklyCronStatus === 'success') {
    dailyUpdate.weeklyCronSuccessCount = admin.firestore.FieldValue.increment(1);
  } else if (weeklyCronStatus === 'failure') {
    dailyUpdate.weeklyCronFailureCount = admin.firestore.FieldValue.increment(1);
  }

  const stateUpdate = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (surface) {
    stateUpdate[`lastSeenAtBySurface.${normalizedSurface}`] = admin.firestore.FieldValue.serverTimestamp();
    stateUpdate[`lastProviderBySurface.${normalizedSurface}`] = normalizedProvider;
    if (Number.isFinite(Number(trustScore))) {
      stateUpdate[`lastTrustScoreBySurface.${normalizedSurface}`] = Math.max(0.2, Math.min(0.99, Number(trustScore)));
    }
  }

  if (weeklyCronStatus === 'success') {
    stateUpdate.lastWeeklyCronSuccessAt = admin.firestore.FieldValue.serverTimestamp();
  } else if (weeklyCronStatus === 'failure') {
    stateUpdate.lastWeeklyCronFailureAt = admin.firestore.FieldValue.serverTimestamp();
  }

  await Promise.all([
    dailyDocRef.set(dailyUpdate, { merge: true }),
    stateDocRef.set(stateUpdate, { merge: true }),
  ]);
}

function getTopKey(record = {}) {
  const entries = Object.entries(record || {})
    .filter(([, value]) => Number.isFinite(Number(value)) && Number(value) > 0)
    .sort((left, right) => Number(right[1]) - Number(left[1]));
  return entries[0]?.[0] || null;
}

function buildAiReleaseStatusFromMetrics({
  dailyMetrics = {},
  rollingState = {},
  now = new Date(),
} = {}) {
  const nowMs = now instanceof Date ? now.getTime() : Date.now();
  const requestCount = toFiniteCount(dailyMetrics.requestCount);
  const fallbackCount = toFiniteCount(dailyMetrics.fallbackCount);
  const lowTrustCount = toFiniteCount(dailyMetrics.lowTrustCount);
  const criticalIncidentCount24h = toFiniteCount(dailyMetrics.criticalIncidentCount);
  const fallbackRate = requestCount > 0 ? fallbackCount / requestCount : 0;
  const lowTrustRate = requestCount > 0 ? lowTrustCount / requestCount : 0;
  const lastSeenAtBySurface = rollingState?.lastSeenAtBySurface || {};
  const staleSurfaceCount = AI_SURFACES.reduce((count, surface) => {
    const seenAt = toMillisSafe(lastSeenAtBySurface?.[surface]);
    if (!seenAt || nowMs - seenAt > AI_RELEASE_THRESHOLDS.staleSurfaceWindowMs) {
      return count + 1;
    }
    return count;
  }, 0);
  const lastWeeklyCronSuccessAt = toMillisSafe(rollingState?.lastWeeklyCronSuccessAt);
  const lastWeeklyCronFailureAt = toMillisSafe(rollingState?.lastWeeklyCronFailureAt);
  const weeklyCronHealthy = lastWeeklyCronFailureAt > 0
    ? lastWeeklyCronFailureAt < lastWeeklyCronSuccessAt
    : (lastWeeklyCronSuccessAt === 0 || nowMs - lastWeeklyCronSuccessAt <= AI_RELEASE_THRESHOLDS.weeklyCronHealthyWindowMs);

  let status = 'healthy';
  let recommendedAction = 'AI rollout saglam gorunuyor; standart smoke ve log izlemesiyle devam et.';

  if (
    fallbackRate > AI_RELEASE_THRESHOLDS.criticalFallbackRate
    || criticalIncidentCount24h > 0
    || weeklyCronHealthy === false
  ) {
    status = 'critical';
    recommendedAction = 'Rolloutu yavaslat; fallback, incident ve weekly cron sinyallerini temizlemeden yeni acilim yapma.';
  } else if (
    fallbackRate > AI_RELEASE_THRESHOLDS.watchFallbackRate
    || lowTrustRate > AI_RELEASE_THRESHOLDS.watchLowTrustRate
    || staleSurfaceCount > 1
  ) {
    status = 'watch';
    recommendedAction = 'Watch bandindeki yuzeyleri smoke test ve loglarla izle; rolloutu kademeli tut.';
  }

  return {
    status,
    updatedAt: admin.firestore.Timestamp.fromDate(now instanceof Date ? now : new Date(nowMs)),
    fallbackRate: Math.round(fallbackRate * 1000) / 1000,
    lowTrustRate: Math.round(lowTrustRate * 1000) / 1000,
    criticalIncidentCount24h,
    staleSurfaceCount,
    weeklyCronHealthy,
    topProvider: getTopKey(dailyMetrics.providerBreakdown) || 'fallback',
    topRiskSurface: getTopKey(dailyMetrics.riskSurfaceBreakdown) || getTopKey(dailyMetrics.surfaceBreakdown) || null,
    recommendedAction,
  };
}

/**
 * Rate limiting middleware
 * @param {string} identifier - User ID or IP
 * @param {number} maxRequests - Max requests allowed
 * @param {number} windowMs - Time window in ms
 * @returns {object} { allowed: boolean, remaining: number, resetAt: number }
 */
function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  pruneRateLimitStore(now);
  const key = `ratelimit:${identifier}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  
  const record = rateLimitStore.get(key);
  
  // Window expired, reset
  if (now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }
  
  // Rate limited
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

async function checkDistributedRateLimit({
  dbRef = db,
  adminSdk = admin,
  namespace,
  identifier,
  maxRequests = 10,
  windowMs = 60000,
  nowMs = Date.now(),
}) {
  const safeNamespace = String(namespace || 'default').replace(/[^a-zA-Z0-9:_-]/g, '').slice(0, 80) || 'default';
  const safeIdentifier = String(identifier || 'anonymous').replace(/[^a-zA-Z0-9:_-]/g, '').slice(0, 120) || 'anonymous';
  const bucketStart = nowMs - (nowMs % windowMs);
  const resetAt = bucketStart + windowMs;
  const rateKey = `${safeNamespace}:${safeIdentifier}:${bucketStart}`;
  const rateRef = dbRef.collection('_security').doc('rateLimits').collection('entries').doc(hashValue(rateKey));

  return dbRef.runTransaction(async (transaction) => {
    const rateDoc = await transaction.get(rateRef);
    const currentCount = rateDoc.exists ? Math.max(0, Number(rateDoc.data()?.count) || 0) : 0;

    if (currentCount >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    transaction.set(rateRef, {
      namespace: safeNamespace,
      identifier: safeIdentifier,
      count: currentCount + 1,
      bucketStart,
      windowMs,
      resetAt,
      expiresAt: adminSdk.firestore.Timestamp.fromMillis(resetAt + 86400000),
      updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
      createdAt: rateDoc.exists
        ? rateDoc.data()?.createdAt || adminSdk.firestore.FieldValue.serverTimestamp()
        : adminSdk.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - currentCount - 1),
      resetAt,
    };
  });
}

const REGION = 'europe-west1';
const MAX_V1_CALLABLE_INSTANCES = 5;
const MAX_V2_CALLABLE_INSTANCES = 10;
const MAX_WEBHOOK_INSTANCES = 3;
const MAX_EVENT_INSTANCES = 3;

function secureCallableOptions(extra = {}) {
  return {
    region: REGION,
    enforceAppCheck: true,
    maxInstances: MAX_V2_CALLABLE_INSTANCES,
    ...extra,
  };
}

const AI_PROVIDER = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  FALLBACK: 'fallback',
};

const AI_FLAG_DEFAULTS = {
  assistant_v2_enabled: false,
  home_ranking_v2_enabled: false,
  weekly_insights_v1_enabled: false,
  push_personalization_v1_enabled: false,
  social_ai_hints_v1_enabled: false,
  ai_ops_rollup_v1_enabled: false,
  remote_onboarding_v1_enabled: false,
  premium_moments_v1_enabled: false,
};

const TRUST_REVIEW_STATUS = {
  REVIEWED: 'reviewed',
  CONTEXTUAL: 'contextual',
  GENERAL: 'general_guidance',
  UNREVIEWED: 'unreviewed',
};

function normalizeAiFlags(value = {}) {
  return {
    assistant_v2_enabled: value.assistant_v2_enabled === true,
    home_ranking_v2_enabled: value.home_ranking_v2_enabled === true,
    weekly_insights_v1_enabled: value.weekly_insights_v1_enabled === true,
    push_personalization_v1_enabled: value.push_personalization_v1_enabled === true,
    social_ai_hints_v1_enabled: value.social_ai_hints_v1_enabled === true,
    ai_ops_rollup_v1_enabled: value.ai_ops_rollup_v1_enabled === true,
    remote_onboarding_v1_enabled: value.remote_onboarding_v1_enabled === true,
    premium_moments_v1_enabled: value.premium_moments_v1_enabled === true,
  };
}

async function getAiFlags(dbRef = db) {
  try {
    const snapshot = await dbRef.collection('config').doc('aiFlags').get();
    if (!snapshot.exists) return AI_FLAG_DEFAULTS;
    return {
      ...AI_FLAG_DEFAULTS,
      ...normalizeAiFlags(snapshot.data()),
    };
  } catch (error) {
    console.warn('[AIFlags] read failed', error?.message || 'unknown');
    return AI_FLAG_DEFAULTS;
  }
}

function sanitizeAssistantMessage(value) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 1200);
}

function sanitizeAiContext(value = {}) {
  const safe = value && typeof value === 'object' ? value : {};
  return {
    activeTab: typeof safe.activeTab === 'string' ? safe.activeTab.slice(0, 40) : 'home',
    activeFeature: typeof safe.activeFeature === 'string' ? safe.activeFeature.slice(0, 80) : null,
    isProUser: safe.isProUser === true,
    locationName: typeof safe.locationName === 'string' ? safe.locationName.slice(0, 120) : '',
    primaryGoal: typeof safe.primaryGoal === 'string' ? safe.primaryGoal.slice(0, 60) : 'prayer_rhythm',
    userIntentSegment: typeof safe.userIntentSegment === 'string' ? safe.userIntentSegment.slice(0, 60) : 'prayer_rhythm',
    weeklyGoalPreference: Number.isFinite(Number(safe.weeklyGoalPreference)) ? Number(safe.weeklyGoalPreference) : 3,
    lastFeature: typeof safe.lastFeature === 'string' ? safe.lastFeature.slice(0, 80) : null,
    streak: safe.streak && typeof safe.streak === 'object' ? {
      current: Number(safe.streak.current) || 0,
      longest: Number(safe.streak.longest) || 0,
      prayerCount: Number(safe.streak.prayerCount) || 0,
      quranCount: Number(safe.streak.quranCount) || 0,
      zikirCount: Number(safe.streak.zikirCount) || 0,
    } : { current: 0, longest: 0, prayerCount: 0, quranCount: 0, zikirCount: 0 },
    prayer: safe.prayer && typeof safe.prayer === 'object' ? {
      nextPrayer: typeof safe.prayer.nextPrayer === 'string' ? safe.prayer.nextPrayer.slice(0, 20) : null,
      nextPrayerLabel: typeof safe.prayer.nextPrayerLabel === 'string' ? safe.prayer.nextPrayerLabel.slice(0, 40) : null,
      timings: safe.prayer.timings && typeof safe.prayer.timings === 'object' ? safe.prayer.timings : null,
    } : { nextPrayer: null, nextPrayerLabel: null, timings: null },
    dailyContent: safe.dailyContent && typeof safe.dailyContent === 'object' ? {
      esmaName: typeof safe.dailyContent.esmaName === 'string' ? safe.dailyContent.esmaName.slice(0, 60) : '',
      duaTitle: typeof safe.dailyContent.duaTitle === 'string' ? safe.dailyContent.duaTitle.slice(0, 120) : '',
      verseReference: typeof safe.dailyContent.verseReference === 'string' ? safe.dailyContent.verseReference.slice(0, 120) : '',
      campaignId: typeof safe.dailyContent.campaignId === 'string' ? safe.dailyContent.campaignId.slice(0, 40) : 'evergreen',
      sources: Array.isArray(safe.dailyContent.sources)
        ? safe.dailyContent.sources
            .filter((item) => item && typeof item === 'object')
            .slice(0, 4)
            .map((item) => ({
              sourceId: typeof item.sourceId === 'string' ? item.sourceId.slice(0, 120) : null,
              label: typeof item.label === 'string' ? item.label.slice(0, 120) : 'Genel rehberlik',
              type: typeof item.type === 'string' ? item.type.slice(0, 40) : 'context',
              reviewStatus: normalizeTrustReviewStatus(item.reviewStatus, TRUST_REVIEW_STATUS.CONTEXTUAL),
              confidence: ['high', 'medium', 'low'].includes(item.confidence) ? item.confidence : 'medium',
              origin: typeof item.origin === 'string' ? item.origin.slice(0, 60) : 'context',
            }))
        : [],
    } : null,
    activityPattern: safe.activityPattern && typeof safe.activityPattern === 'object' ? {
      morning: Number(safe.activityPattern.morning) || 0,
      afternoon: Number(safe.activityPattern.afternoon) || 0,
      evening: Number(safe.activityPattern.evening) || 0,
    } : { morning: 0, afternoon: 0, evening: 0 },
    weeklySnapshot: safe.weeklySnapshot && typeof safe.weeklySnapshot === 'object' ? {
      activeDays: Number(safe.weeklySnapshot.activeDays) || 0,
      prayerDays: Number(safe.weeklySnapshot.prayerDays) || 0,
      quranDays: Number(safe.weeklySnapshot.quranDays) || 0,
      dhikrDays: Number(safe.weeklySnapshot.dhikrDays) || 0,
      routinesCompleted: Number(safe.weeklySnapshot.routinesCompleted) || 0,
      tasksCompleted: Number(safe.weeklySnapshot.tasksCompleted) || 0,
      quizzesCompleted: Number(safe.weeklySnapshot.quizzesCompleted) || 0,
      discoveryViews: Number(safe.weeklySnapshot.discoveryViews) || 0,
      xpEarned: Number(safe.weeklySnapshot.xpEarned) || 0,
      hasActivity: safe.weeklySnapshot.hasActivity === true,
    } : null,
    social: safe.social && typeof safe.social === 'object' ? {
      family: safe.social.family && typeof safe.social.family === 'object' ? {
        id: typeof safe.social.family.id === 'string' ? safe.social.family.id.slice(0, 120) : null,
        name: typeof safe.social.family.name === 'string' ? safe.social.family.name.slice(0, 120) : 'Aile',
        memberCount: Number(safe.social.family.memberCount) || 0,
      } : null,
      familyWeeklyGoal: safe.social.familyWeeklyGoal && typeof safe.social.familyWeeklyGoal === 'object' ? {
        title: typeof safe.social.familyWeeklyGoal.title === 'string' ? safe.social.familyWeeklyGoal.title.slice(0, 120) : '',
        currentValue: Number(safe.social.familyWeeklyGoal.currentValue) || 0,
        targetValue: Number(safe.social.familyWeeklyGoal.targetValue) || 0,
      } : null,
      socialSummary: safe.social.socialSummary && typeof safe.social.socialSummary === 'object' ? safe.social.socialSummary : null,
    } : { family: null, familyWeeklyGoal: null, socialSummary: null },
  };
}

function getRiskBand(context) {
  const activeDays = Number(context?.weeklySnapshot?.activeDays) || 0;
  const currentStreak = Number(context?.streak?.current) || 0;
  if (activeDays <= 1 && currentStreak <= 1) return 'rebuild';
  if (activeDays <= 3) return 'at_risk';
  if (activeDays >= 6) return 'steady';
  return 'recovering';
}

function getCanonicalSourceTemplate(type = 'content', namespace = 'content') {
  const types = reviewedSourceCatalog?.types || {};
  const namespaces = reviewedSourceCatalog?.namespaces || {};
  const resolvedType = types[type] ? type : (namespaces[namespace] || 'content');

  return {
    type: 'content',
    reviewStatus: TRUST_REVIEW_STATUS.REVIEWED,
    confidence: 'medium',
    origin: 'local_curated',
    ...(types[resolvedType] || {}),
  };
}

function buildContextSources(context, options = {}) {
  const safeOptions = options && typeof options === 'object' ? options : {};
  const sources = Array.isArray(context?.dailyContent?.sources)
    ? context.dailyContent.sources
        .filter((item) => item && typeof item === 'object')
        .slice(0, 3)
        .map((item) => normalizeCanonicalSourceMeta(item, {
          namespace: 'content',
          label: 'Genel rehberlik',
          reviewStatus: TRUST_REVIEW_STATUS.CONTEXTUAL,
          origin: 'context',
        }))
    : [];

  if (context?.dailyContent?.verseReference) {
    const existingVerse = sources.some((item) => item?.type === 'daily_content');
    if (!existingVerse) {
      sources.push(normalizeCanonicalSourceMeta({
        sourceId: `verse:${String(context.dailyContent.verseReference).slice(0, 80)}`,
        label: String(context.dailyContent.verseReference).slice(0, 120),
        type: 'daily_content',
        confidence: 'medium',
      }, {
        namespace: 'verse',
        reviewStatus: TRUST_REVIEW_STATUS.REVIEWED,
        origin: 'daily_content',
      }));
    }
  }

  if (safeOptions.includeGeneralGuidance === true) {
    sources.push(normalizeCanonicalSourceMeta({
      sourceId: 'general_islamic_guidance',
      label: 'Genel Islami rehberlik',
      type: 'general_islamic_guidance',
      confidence: 'low',
    }, {
      namespace: 'content',
      reviewStatus: TRUST_REVIEW_STATUS.GENERAL,
      origin: 'policy',
    }));
  }

  return sources.slice(0, 3);
}

function normalizeTrustReviewStatus(value, fallbackValue = TRUST_REVIEW_STATUS.UNREVIEWED) {
  return Object.values(TRUST_REVIEW_STATUS).includes(value) ? value : fallbackValue;
}

function normalizeCanonicalSourceMeta(value = {}, defaults = {}) {
  const safeValue = value && typeof value === 'object' ? value : {};
  const safeDefaults = defaults && typeof defaults === 'object' ? defaults : {};
  const namespace = typeof safeValue.namespace === 'string'
    ? safeValue.namespace.trim().slice(0, 40)
    : (typeof safeDefaults.namespace === 'string' ? safeDefaults.namespace.trim().slice(0, 40) : 'content');
  const sourceId = typeof safeValue.sourceId === 'string' && safeValue.sourceId.trim()
    ? safeValue.sourceId.trim().slice(0, 120)
    : `${namespace}:${String(safeValue.id || safeDefaults.id || 'item').trim().slice(0, 60)}`;
  const template = getCanonicalSourceTemplate(
    typeof safeValue.type === 'string' ? safeValue.type.trim().slice(0, 40) : (safeDefaults.type || 'content'),
    namespace
  );

  return {
    sourceId,
    label: typeof safeValue.label === 'string' && safeValue.label.trim()
      ? safeValue.label.trim().slice(0, 120)
      : String(safeDefaults.label || 'Genel rehberlik').slice(0, 120),
    type: typeof safeValue.type === 'string' && safeValue.type.trim()
      ? safeValue.type.trim().slice(0, 40)
      : template.type,
    reviewStatus: normalizeTrustReviewStatus(
      safeValue.reviewStatus,
      normalizeTrustReviewStatus(safeDefaults.reviewStatus, template.reviewStatus)
    ),
    confidence: ['high', 'medium', 'low'].includes(safeValue.confidence)
      ? safeValue.confidence
      : (['high', 'medium', 'low'].includes(safeDefaults.confidence) ? safeDefaults.confidence : template.confidence),
    origin: typeof safeValue.origin === 'string' && safeValue.origin.trim()
      ? safeValue.origin.trim().slice(0, 60)
      : String(safeDefaults.origin || template.origin || 'context').slice(0, 60),
  };
}

function calculateTrustScore({ confidence = 'medium', sources = [], provider = AI_PROVIDER.FALLBACK, safetyCategory = null }) {
  let score = confidence === 'high' ? 0.88 : confidence === 'medium' ? 0.7 : 0.45;
  const reviewedCount = Array.isArray(sources)
    ? sources.filter((source) => source?.reviewStatus === TRUST_REVIEW_STATUS.REVIEWED).length
    : 0;
  const generalCount = Array.isArray(sources)
    ? sources.filter((source) => source?.reviewStatus === TRUST_REVIEW_STATUS.GENERAL).length
    : 0;

  score += Math.min(0.1, reviewedCount * 0.05);
  score -= Math.min(0.08, generalCount * 0.04);

  if (provider === 'safety_policy' || safetyCategory) {
    score = Math.min(score, 0.52);
  }

  if (provider === AI_PROVIDER.FALLBACK) {
    score -= 0.05;
  }

  return Math.max(0.2, Math.min(0.99, Math.round(score * 100) / 100));
}

function deriveReviewStatus({ sources = [], confidence = 'medium', safetyCategory = null }) {
  if (Array.isArray(sources) && sources.some((source) => source?.reviewStatus === TRUST_REVIEW_STATUS.REVIEWED)) {
    return TRUST_REVIEW_STATUS.REVIEWED;
  }
  if (safetyCategory) {
    return TRUST_REVIEW_STATUS.GENERAL;
  }
  if (Array.isArray(sources) && sources.some((source) => source?.reviewStatus === TRUST_REVIEW_STATUS.CONTEXTUAL)) {
    return TRUST_REVIEW_STATUS.CONTEXTUAL;
  }
  if (confidence === 'low') {
    return TRUST_REVIEW_STATUS.GENERAL;
  }
  return TRUST_REVIEW_STATUS.UNREVIEWED;
}

function buildAssistantFallbackResponse(userMessage, context) {
  const currentStreak = Number(context?.streak?.current) || 0;
  const nextPrayer = context?.prayer?.nextPrayerLabel || context?.prayer?.nextPrayer || 'bir sonraki vakit';
  const mentionsHardship = /zor|uzgun|yorgun|yetisem|yetisemiyorum|bunald|stres|kaygi/i.test(userMessage);
  const answer = mentionsHardship
    ? 'Bugun kendini zorlamak yerine hedefi kucultelim. Sadece tek bir net adim sec: bir sonraki vakit icin hazirlan ya da iki dakikalik kisa bir zikirle basla.'
    : `Bugun ritmini korumak icin en iyi adim, ${nextPrayer} oncesi kisa ve net bir niyet belirlemek. Kucuk ama surekli adimlar daha kalici olur.`;

  return {
    provider: AI_PROVIDER.FALLBACK,
    answer,
    tone: 'calm_supportive',
    confidence: 'medium',
    suggestedActions: [
      { id: 'open_prayers', label: 'Vakitleri ac', feature: 'prayers' },
      { id: 'open_daily_tasks', label: currentStreak > 0 ? 'Seriyi koru' : 'Bugune basla', feature: 'dailyTasks' }
    ],
    safeModeNotice: 'Bu yanit genel rehberlik amaclidir; hassas dini konularda guvenilir kaynaklara veya ehil kisilere danismak faydali olur.',
    sources: buildContextSources(context),
    sessionSummary: `goal:${context?.primaryGoal || 'prayer_rhythm'} risk:${getRiskBand(context)} message:${userMessage.slice(0, 120)}`,
  };
}

function buildAssistantFallbackResponseV2(userMessage, context) {
  const currentStreak = Number(context?.streak?.current) || 0;
  const nextPrayer = context?.prayer?.nextPrayerLabel || context?.prayer?.nextPrayer || 'bir sonraki vakit';
  const lowerMessage = String(userMessage || '').toLowerCase();
  const mentionsHardship = /zor|uzgun|yorgun|yetisem|yetisemiyorum|bunald|stres|kaygi/i.test(userMessage);
  const suggestions = [];

  if (/namaz|vakit|ezan|farz|sabah|ogle|ikindi|aksam|yatsi/.test(lowerMessage)) {
    suggestions.push({ id: 'open_prayers', label: 'Vakitleri ac', tab: 'prayers' });
  }
  if (/kuran|ayet|sure|meal|ezber|hafiz/.test(lowerMessage)) {
    suggestions.push({ id: 'open_quran', label: 'Kurani ac', tab: 'quran' });
  }
  if (/dua|niyet|amin|istek/.test(lowerMessage)) {
    suggestions.push({ id: 'open_dua_tracker', label: 'Dua listene gec', feature: 'duaTracker' });
  }
  if (/zikir|tesbih|tespih|esma/.test(lowerMessage)) {
    suggestions.push({ id: 'open_zikirmatik', label: 'Kisa zikirle basla', feature: 'zikirmatik' });
  }
  if ((/aile|hatim|cemaat|topluluk/.test(lowerMessage) || context?.social?.family) && suggestions.length < 3) {
    suggestions.push({ id: 'open_community', label: 'Topluluga goz at', tab: 'community' });
  }

  if (suggestions.length === 0) {
    suggestions.push({ id: 'open_prayers', label: 'Vakitleri ac', tab: 'prayers' });
    if (currentStreak <= 1) {
      suggestions.push({ id: 'open_zikirmatik', label: 'Kisa zikirle basla', feature: 'zikirmatik' });
    } else {
      suggestions.push({ id: 'open_tracker', label: 'Ritmini kontrol et', feature: 'tracker' });
    }
  }

  const answer = mentionsHardship
    ? 'Bugun kendini zorlamak yerine hedefi kucultelim. Sadece tek bir net adim sec: bir sonraki vakit icin hazirlan ya da iki dakikalik kisa bir zikirle basla.'
    : `Bugun ritmini korumak icin en iyi adim, ${nextPrayer} oncesi kisa ve net bir niyet belirlemek. Kucuk ama surekli adimlar daha kalici olur.`;

  return {
    provider: AI_PROVIDER.FALLBACK,
    answer,
    tone: currentStreak <= 1 ? 'compassionate_recovery' : 'calm_supportive',
    confidence: 'medium',
    suggestedActions: suggestions.slice(0, 3),
    safeModeNotice: 'Bu yanit genel rehberlik amaclidir; hassas dini konularda guvenilir kaynaklara veya ehil kisilere danismak faydali olur.',
    sources: buildContextSources(context),
    sessionSummary: `goal:${context?.primaryGoal || 'prayer_rhythm'} risk:${getRiskBand(context)} message:${userMessage.slice(0, 120)}`,
  };
}

function detectAssistantSafetyCategory(userMessage) {
  const message = String(userMessage || '').toLowerCase();
  if (!message.trim()) return null;

  const crisisPattern = /intihar|kendimi oldur|yasamak istem|kendime zarar|oz kiy|siddet gor|beni dov|panic attack|panik atak|kriz gecir|yardim edin/i;
  if (crisisPattern.test(message)) {
    return 'crisis_support';
  }

  const medicalLegalPattern = /ilac|ameliyat|hamile|gebelik|doktor|tedavi|hukuk|mahkeme|bosanma|miras|dava|suc|ceza/i;
  if (medicalLegalPattern.test(message)) {
    return 'medical_legal_redirect';
  }

  const sectarianPattern = /mezhep|hangi mezhep|sunni|sÃ¼nni|selefi|salafi|sii|ÅŸi[iÃ®]|alevi|tarikat|cemaat kavgas|kim hakli/i;
  if (sectarianPattern.test(message)) {
    return 'sectarian_sensitivity';
  }

  return null;
}

function buildAssistantSafetyResponse(category, context) {
  const nextPrayer = context?.prayer?.nextPrayerLabel || context?.prayer?.nextPrayer || 'bir sonraki vakit';
  const base = {
    provider: AI_PROVIDER.FALLBACK,
    tone: 'calm_supportive',
    confidence: 'low',
    safeModeNotice: 'Bu yanit guvenlik odakli kisa bir yonlendirmedir. Hassas konularda insan destegi ve guvenilir uzman gorusu onceliklidir.',
    sources: buildContextSources(context, { includeGeneralGuidance: true }),
    sessionSummary: `safety:${category} risk:${getRiskBand(context)}`,
  };

  if (category === 'crisis_support') {
    return {
      ...base,
      provider: 'safety_policy',
      answer: 'Su an bunu tek basina tasimaya calisma. Guvendigin bir yakinina hemen haber ver ve bulundugun yerde acil destek iste. Turkiye\'de acil durumda 112\'yi ara; psikolojik destek icin en yakin saglik kurumu veya profesyonel destekle hemen temas kur.',
      tone: 'compassionate_recovery',
      suggestedActions: [
        { id: 'open_support', label: 'Destek istemeyi oncele', tab: 'home' }
      ],
    };
  }

  if (category === 'medical_legal_redirect') {
    return {
      ...base,
      provider: 'safety_policy',
      answer: 'Bu konu tibbi ya da hukuki sonuclari olabilecek bir alan. Ben sadece genel rehberlik sunabilirim; en dogru adim guvenilir bir doktor, avukat veya ilgili uzmanla dogrudan gorusmek olur.',
      suggestedActions: [
        { id: 'open_prayers', label: `${nextPrayer} oncesi sakinles`, tab: 'prayers' }
      ],
    };
  }

  return {
    ...base,
    provider: 'safety_policy',
    answer: 'Bu konuda kesin ve ayristirici bir hukum vermek dogru olmaz. Daha saglikli olan, guvenilir bir ilim ehlinin aciklamasina basvurmak ve kendi ibadet ritmini yargisiz sekilde korumaya odaklanmaktir.',
    suggestedActions: [
      { id: 'open_quran', label: 'Kurani sakince ac', tab: 'quran' },
      { id: 'open_prayers', label: `${nextPrayer} icin hazirlan`, tab: 'prayers' }
    ],
  };
}

function buildHomeRankingFallback(context, candidates = []) {
  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const baseline = buildHomeRankingBaseline(context, safeCandidates);
  const topIds = baseline.rankedModules;
  const sources = buildContextSources(context);
  return {
    provider: AI_PROVIDER.FALLBACK,
    rankedModules: topIds,
    headline: baseline.familyGoalActive
      ? 'Bu hafta ritmi korurken aile hedefine de dokunabilecegin bir akis secildi.'
      : 'Bugun once ritmi kurup sonra kesif ve icerikle devam edebilecegin bir akis secildi.',
    explanation: baseline.riskBand === 'at_risk' || baseline.riskBand === 'rebuild'
      ? 'Ritmi yeniden yakalamaya yardim edecek kartlar one alindi.'
      : baseline.topReason || 'Son kullanim ve haftalik ilerleme sinyallerine gore sakin bir oncelik sirasi kuruldu.',
    riskBand: baseline.riskBand,
    socialHint: baseline.familyGoalActive
      ? 'Bu hafta aile hedefine kucuk bir katki yapmak momentumu guclendirebilir.'
      : null,
    confidence: 'medium',
    reviewStatus: deriveReviewStatus({ sources, confidence: 'medium' }),
    sourceCount: sources.length,
    trustScore: calculateTrustScore({
      confidence: 'medium',
      sources,
      provider: AI_PROVIDER.FALLBACK,
    }),
    sources,
  };
}

function scoreHomeRankingCandidate(context, candidate, index) {
  const weeklySnapshot = context?.weeklySnapshot || {};
  const familyGoal = context?.social?.familyWeeklyGoal;
  const family = context?.social?.family;
  const riskBand = getRiskBand(context);
  const nextPrayerLabel = String(context?.prayer?.nextPrayerLabel || context?.prayer?.nextPrayer || '').toLowerCase();
  const scoreParts = [];
  let score = Math.max(1, 10 - index);

  if (candidate.id === 'dailyQuests') {
    score += 5;
    scoreParts.push('gunluk ritim kurucu');
    if (riskBand === 'rebuild' || riskBand === 'at_risk') {
      score += 4;
      scoreParts.push('en kolay geri donus noktasi');
    }
  }

  if (candidate.id === 'featureGrid' && (Number(weeklySnapshot.tasksCompleted) || 0) < 3) {
    score += 3;
    scoreParts.push('eksik rutini tamamlama alani');
  }

  if (candidate.id === 'dailyDiscovery' && (Number(weeklySnapshot.quranDays) || 0) < 3) {
    score += 4;
    scoreParts.push('hafif kesif firsati');
  }

  if (candidate.id === 'dailyContent' && context?.dailyContent?.campaignId === 'ramadan') {
    score += 3;
    scoreParts.push('donemsel icerik onceligi');
  }

  if (candidate.id === 'familyMomentum' && familyGoal?.targetValue) {
    score += 6;
    scoreParts.push('aile hedefi aktif');
  } else if (candidate.id === 'familyMomentum' && family) {
    score += 2;
    scoreParts.push('sosyal bag korunuyor');
  }

  if (candidate.id === 'stories' && riskBand === 'steady') {
    score += 2;
    scoreParts.push('hafif ilham katmani');
  }

  if (candidate.id === 'dailyQuests' && nextPrayerLabel) {
    score += 1;
    scoreParts.push('vakit oncesi hazirlik icin uygun');
  }

  return {
    id: candidate.id,
    title: candidate.title || candidate.id,
    score,
    reasons: scoreParts.slice(0, 3),
  };
}

function buildHomeRankingBaseline(context, candidates = []) {
  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  const riskBand = getRiskBand(context);
  const scoredCandidates = safeCandidates
    .map((candidate, index) => scoreHomeRankingCandidate(context, candidate, index))
    .sort((left, right) => right.score - left.score);

  return {
    riskBand,
    familyGoalActive: Boolean(context?.social?.familyWeeklyGoal?.targetValue),
    topReason: scoredCandidates[0]?.reasons?.[0]
      ? `${scoredCandidates[0].reasons[0]} one alindi.`
      : 'Sakin bir oncelik sirasi kuruldu.',
    scoredCandidates,
    rankedModules: scoredCandidates.map((item) => item.id),
  };
}

function buildWeeklyInsightBaseline(context, weekKey) {
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

function buildWeeklyInsightFallback(context, weekKey) {
  const summary = context?.weeklySnapshot || {};
  const activeDays = Number(summary.activeDays) || 0;
  const riskBand = getRiskBand(context);
  const sources = buildContextSources(context);
  let body = 'Bu hafta kucuk ama duzenli adimlarla ritmini korumaya devam et.';
  if (!summary.hasActivity) {
    body = 'Gecen hafta daha sakindi. Yeni haftaya tek bir net adimla baslamak yeterli olabilir.';
  } else if (riskBand === 'steady') {
    body = `Gecen hafta ${activeDays} farkli gunde uygulamaya dokundun. Bu istikrari ayni sadelikle surdurmen yeterli.`;
  } else if (riskBand === 'at_risk') {
    body = 'Ritim biraz dagilmis gorunuyor. Yeni haftada once tek bir temel akisi sabitlemek en saglikli adim olur.';
  }

  return {
    provider: AI_PROVIDER.FALLBACK,
    weekKey,
    title: 'Haftalik Huzur Ozeti',
    summary: body,
    riskBand,
    priority: riskBand === 'steady' ? 'maintain' : 'recover',
    confidence: 'medium',
    reviewStatus: deriveReviewStatus({ sources, confidence: 'medium' }),
    sourceCount: sources.length,
    trustScore: calculateTrustScore({
      confidence: 'medium',
      sources,
      provider: AI_PROVIDER.FALLBACK,
    }),
    sources,
    socialHint: context?.social?.family
      ? 'Aile alaninda haftalik hedefe kucuk bir katkÄ± eklemek ritmi gorunur kilabilir.'
      : null,
  };
}

function buildPushHintFallback(type, context) {
  const nextPrayer = context?.prayer?.nextPrayerLabel || 'bir sonraki vakit';
  const riskBand = getRiskBand(context);
  const sources = buildContextSources(context, { includeGeneralGuidance: true });
  return {
    provider: AI_PROVIDER.FALLBACK,
    title: type === 'reminder' ? 'Bugun icin kucuk bir adim sec' : `${nextPrayer} icin kisa bir hazirlik`,
    body: riskBand === 'at_risk'
      ? 'Ritmi toparlamak icin bugun sadece tek bir net adim atman yeterli.'
      : 'Kisa bir mola ile niyetini tazeleyip gunun akisina devam edebilirsin.',
    reason: riskBand === 'at_risk' ? 'streak_recovery' : 'gentle_guidance',
    sendWindow: {
      startHour: riskBand === 'at_risk' ? 18 : 10,
      endHour: riskBand === 'at_risk' ? 21 : 14,
    },
    confidence: 'medium',
    reviewStatus: deriveReviewStatus({ sources, confidence: 'medium' }),
    sourceCount: sources.length,
    trustScore: calculateTrustScore({
      confidence: 'medium',
      sources,
      provider: AI_PROVIDER.FALLBACK,
    }),
    sources,
  };
}

function buildPushHintBaselineV2(type, context) {
  const nextPrayer = context?.prayer?.nextPrayerLabel || 'bir sonraki vakit';
  const riskBand = getRiskBand(context);
  const hasFamily = Boolean(context?.social?.family);

  if (type === 'streak_recovery') {
    return {
      title: 'Bugun tek bir adim yeterli',
      body: riskBand === 'rebuild'
        ? 'Ritme donmek icin bugun sadece kucuk bir baslangic yapman yeterli.'
        : 'Kisa bir dokunusla bugunun ritmini yeniden yakalayabilirsin.',
      reason: 'streak_recovery',
      sendWindow: { startHour: 18, endHour: 21 },
    };
  }

  if (type === 'social' && hasFamily) {
    return {
      title: 'Aile ritmine kucuk bir dokunus',
      body: 'Bu hafta aile alanina kisa bir katkÄ± eklemek momentumu canlandirabilir.',
      reason: 'family_momentum',
      sendWindow: { startHour: 17, endHour: 20 },
    };
  }

  if (type === 'discovery') {
    return {
      title: 'Bugun yeni bir pencere ac',
      body: 'Kisa bir kesif ile gunun akisini daha sakin ve anlamli hale getirebilirsin.',
      reason: 'gentle_discovery',
      sendWindow: { startHour: 11, endHour: 15 },
    };
  }

  return {
    title: `${nextPrayer} icin kisa bir hazirlik`,
    body: riskBand === 'at_risk' || riskBand === 'rebuild'
      ? 'Bugun tek bir kucuk niyetle ritmi toparlamak yeterli olabilir.'
      : 'Kisa bir mola ile niyetini tazeleyip gunun akisina devam edebilirsin.',
    reason: 'gentle_guidance',
    sendWindow: { startHour: riskBand === 'at_risk' ? 18 : 10, endHour: riskBand === 'at_risk' ? 21 : 14 },
  };
}

function buildJsonSchemaInstruction(schemaName) {
  return `Return valid JSON only for schema ${schemaName}. Do not wrap in markdown.`;
}

function parseJsonResponse(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function callOpenAiJson({ apiKey, systemPrompt, userPrompt, schemaName }) {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini',
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: `${systemPrompt}\n${buildJsonSchemaInstruction(schemaName)}` },
      { role: 'user', content: userPrompt }
    ]
  }, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  return parseJsonResponse(response?.data?.choices?.[0]?.message?.content || '');
}

async function callGeminiJson({ apiKey, systemPrompt, userPrompt }) {
  const response = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    {
      systemInstruction: {
        parts: [{ text: `${systemPrompt}\nReturn valid JSON only.` }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    },
    {
      params: { key: apiKey },
      timeout: 15000,
    }
  );

  const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return parseJsonResponse(text);
}

async function resolveAiJson({
  task = 'assistant',
  systemPrompt,
  userPrompt,
  openAiSecret,
  geminiSecret,
  fallbackFactory,
}) {
  const openAiKey = openAiSecret?.value?.();
  const geminiKey = geminiSecret?.value?.();

  if (openAiKey) {
    try {
      const result = await callOpenAiJson({
        apiKey: openAiKey,
        systemPrompt,
        userPrompt,
        schemaName: task,
      });
      if (result && typeof result === 'object') {
        return {
          ...result,
          provider: AI_PROVIDER.OPENAI,
        };
      }
    } catch (error) {
      console.warn(`[AI] OpenAI ${task} failed`, error?.message || 'unknown');
    }
  }

  if (geminiKey) {
    try {
      const result = await callGeminiJson({
        apiKey: geminiKey,
        systemPrompt,
        userPrompt,
      });
      if (result && typeof result === 'object') {
        return {
          ...result,
          provider: AI_PROVIDER.GEMINI,
        };
      }
    } catch (error) {
      console.warn(`[AI] Gemini ${task} failed`, error?.message || 'unknown');
    }
  }

  return fallbackFactory();
}

function getAiDeploySecrets({ includeOpenAi = false, includeGemini = true } = {}) {
  const secrets = [];
  if (includeOpenAi) secrets.push(OPENAI_API_KEY);
  if (includeGemini) secrets.push(GEMINI_API_KEY);
  return secrets;
}

// YardÄ±mcÄ± fonksiyon: GÃ¼venli kod Ã¼ret
function generateSecureCode(length = 8) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes).map((byte) => charset[byte % charset.length]).join('');
}

/**
 * Helper: Send Push Notification to User
 */
async function sendPushToUser(userId, notification) {
  if (!isValidUid(userId)) return null;

  try {
    // 1. Get User's FCM Tokens
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return null;

    const userData = userDoc.data();
    const tokens = Array.isArray(userData.fcmTokens)
      ? userData.fcmTokens.filter((t) => typeof t === 'string' && t.length > 0).slice(0, 500)
      : [];

    if (tokens.length === 0) {
      return null;
    }

    // 2. Prepare Payload
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      tokens, // Multicast to all user devices
    };

    // 3. Send using Admin SDK
    const response = await admin.messaging().sendEachForMulticast(message);

    // 4. Cleanup invalid tokens
    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((resp, idx) => (!resp.success ? tokens[idx] : null))
        .filter(Boolean);

      if (failedTokens.length > 0) {
        await db.collection('users').doc(userId).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...failedTokens),
        });
      }
    }

    return response;
  } catch (error) {
    return null;
  }
}

module.exports = {
  functionsV1,
  onRequest,
  onCall,
  onSchedule,
  HttpsError,
  admin,
  axios,
  db,
  REVENUECAT_WEBHOOK_TOKEN,
  REVENUECAT_API_KEY,
  OPENAI_API_KEY,
  GEMINI_API_KEY,
  safeTokenEquals,
  isValidUid,
  isValidDocumentId,
  normalizeCode,
  normalizeFcmToken,
  sanitizeDisplayName,
  sanitizeAvatar,
  sanitizeRole,
  sanitizeProfileId,
  timestampToMillis,
  countCompletedHatimParts,
  sanitizePublicHatim,
  DISCOVERY_SEED_HATIMS,
  DISCOVERY_SEED_FAMILIES,
  sanitizePublicFamily,
  sanitizeDuaText,
  sanitizeHatimName,
  sanitizeHatimDescription,
  sanitizePublicDua,
  buildHatimParts,
  getWeekKey,
  getDateKey,
  buildDefaultWeeklyGoal,
  normalizeWeekKey,
  canonicalizeTextForFingerprint,
  hashValue,
  sanitizeMiniLeaguePreferences,
  logSecurityEvent,
  logAiObservabilityEvent,
  getIstanbulDateKey,
  getAiMetricsDailyDoc,
  getAiMetricsStateDoc,
  getAiReleaseStatusDoc,
  sanitizeOpsFieldKey,
  toFiniteCount,
  toMillisSafe,
  recordAiOpsMetric,
  getTopKey,
  buildAiReleaseStatusFromMetrics,
  checkRateLimit,
  checkDistributedRateLimit,
  REGION,
  MAX_V1_CALLABLE_INSTANCES,
  MAX_V2_CALLABLE_INSTANCES,
  MAX_WEBHOOK_INSTANCES,
  MAX_EVENT_INSTANCES,
  secureCallableOptions,
  AI_PROVIDER,
  AI_FLAG_DEFAULTS,
  TRUST_REVIEW_STATUS,
  normalizeAiFlags,
  getAiFlags,
  sanitizeAssistantMessage,
  sanitizeAiContext,
  getRiskBand,
  getCanonicalSourceTemplate,
  buildContextSources,
  normalizeTrustReviewStatus,
  normalizeCanonicalSourceMeta,
  calculateTrustScore,
  deriveReviewStatus,
  buildAssistantFallbackResponse,
  buildAssistantFallbackResponseV2,
  detectAssistantSafetyCategory,
  buildAssistantSafetyResponse,
  buildHomeRankingFallback,
  scoreHomeRankingCandidate,
  buildHomeRankingBaseline,
  buildWeeklyInsightBaseline,
  buildWeeklyInsightFallback,
  buildPushHintFallback,
  buildPushHintBaselineV2,
  buildJsonSchemaInstruction,
  parseJsonResponse,
  callOpenAiJson,
  callGeminiJson,
  resolveAiJson,
  getAiDeploySecrets,
  generateSecureCode,
  sendPushToUser,
};
