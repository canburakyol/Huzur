const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const axios = require('axios');
const crypto = require('crypto');

// Initialize Firebase Admin
admin.initializeApp();

// Firestore reference
const db = admin.firestore();

// Secret definitions - Firebase Secrets Manager
const REVENUECAT_WEBHOOK_TOKEN = defineSecret('REVENUECAT_WEBHOOK_TOKEN');
const REVENUECAT_API_KEY = defineSecret('REVENUECAT_API_KEY');

// Rate limiting in-memory store (production'da Redis önerilir)
// NOT: Bubellek tabanlı rate limiting, tek instance çalışan local emülatörde doğru çalışır.
// Ancak Cloud Functions production'da birden fazla instance'a ölçeklenebilir.
// Önerilen: Firebase Realtime Database veya Redis kullanarak dağıtık rate limiting implementasyonu.
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

function sanitizeAvatar(value, fallback = '👤') {
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

const REGION = 'europe-west1';

/**
 * RevenueCat Webhook Handler
 * Pro subscription durumunu server-side dogrulama
 */
exports.revenueCatWebhook = onRequest(
  { region: REGION, secrets: [REVENUECAT_WEBHOOK_TOKEN] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // 1. Webhook authentication
    const authHeader = req.headers.authorization || '';
    const expectedToken = REVENUECAT_WEBHOOK_TOKEN.value();

    if (!expectedToken) {
      console.error('[RevenueCatWebhook] Missing REVENUECAT_WEBHOOK_TOKEN secret');
      res.status(503).send('Service Unavailable');
      return;
    }

    if (!safeTokenEquals(authHeader, `Bearer ${expectedToken}`)) {
      res.status(401).send('Unauthorized');
      return;
    }

    try {
      const event = req.body;
      const eventType = event?.event?.type;

      if (!event || typeof event !== 'object' || typeof eventType !== 'string') {
        res.status(400).send('Invalid payload');
        return;
      }

      const userId = event.app_user_id;
      if (!isValidUid(userId)) {
        res.status(400).send('Invalid user id');
        return;
      }

      // 2. Process different event types
      switch (eventType) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL':
        case 'UNCANCELLATION':
          // User purchased or renewed Pro
          await activateProSubscription(userId, event);
          break;

        case 'CANCELLATION':
        case 'EXPIRATION':
        case 'SUBSCRIPTION_PAUSED':
          // User cancelled or Pro expired
          await deactivateProSubscription(userId, event);
          break;

        case 'TRANSFER':
          // Subscription transferred to another user
          await transferProSubscription(event);
          break;

        default:
          // Unhandled event type - no action needed
          break;
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('[RevenueCatWebhook] Processing failed', {
        message: error?.message || 'unknown',
      });
      res.status(500).send('Internal Server Error');
    }
  }
);

/**
 * Activate Pro subscription
 */
async function activateProSubscription(userId, event) {
  const entitlement = event.entitlements?.pro_access;

  if (!userId || !entitlement) {
    return;
  }

  const subscriptionData = {
    isPro: true,
    entitlementId: 'pro_access',
    productId: event.product_id,
    expiresAt: admin.firestore.Timestamp.fromMillis(entitlement.expires_date_ms),
    purchaseDate: admin.firestore.Timestamp.fromMillis(entitlement.purchase_date_ms),
    store: event.store,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    environment: event.environment, // sandbox or production
  };

  await db.collection('users').doc(userId).collection('subscription').doc('status').set(subscriptionData);
}

/**
 * Deactivate Pro subscription
 */
async function deactivateProSubscription(userId, event) {
  if (!userId) {
    return;
  }

  const subscriptionData = {
    isPro: false,
    entitlementId: null,
    productId: null,
    expiresAt: null,
    cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    cancellationReason: event.event.type,
  };

  await db.collection('users').doc(userId).collection('subscription').doc('status').set(subscriptionData);
}

/**
 * Transfer Pro subscription between users
 */
async function transferProSubscription(event) {
  const fromUserId = event.transferred_from?.[0];
  const toUserId = event.transferred_to?.[0];

  if (fromUserId) {
    await deactivateProSubscription(fromUserId, event);
  }

  if (toUserId) {
    await activateProSubscription(toUserId, event);
  }
}

/**
 * Check Pro Status (Callable Function)
 * Client-side Pro dogrulama icin
 * Rate limited: 20 istek/dakika
 */
exports.checkProStatus = onCall(
  { region: REGION, enforceAppCheck: true },
  async (request) => {
    // 1. Authentication kontrolu
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Bu islem icin giris yapmaniz gerekiyor.'
      );
    }

    const userId = request.auth.uid;
    if (!isValidUid(userId)) {
      throw new HttpsError('invalid-argument', 'Invalid user id');
    }

    // Rate limiting: 20 requests per minute
    const rateLimitKey = `checkProStatus:${userId}`;
    const rateCheck = checkRateLimit(rateLimitKey, 20, 60000);
    
    if (!rateCheck.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        'Cok fazla istek gonderdiniz. Lutfen biraz bekleyin.',
        { retryAfterSeconds: Math.ceil((rateCheck.resetAt - Date.now()) / 1000) }
      );
    }

    try {
      // 2. Firestore'dan subscription durumunu al
      const subDoc = await db.collection('users').doc(userId).collection('subscription').doc('status').get();

      if (!subDoc.exists) {
        return {
          isPro: false,
          expiresAt: null,
          message: 'No subscription found',
        };
      }

      const subData = subDoc.data();
      const now = admin.firestore.Timestamp.now();
      const expiresAt = subData.expiresAt;

      // 3. Expiry kontrolu
      let isPro = subData.isPro;
      if (isPro && expiresAt && expiresAt.toMillis() < now.toMillis()) {
        isPro = false;
        // Update Firestore
        await subDoc.ref.update({
          isPro: false,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return {
        isPro,
        expiresAt: expiresAt ? expiresAt.toDate().toISOString() : null,
        productId: subData.productId,
        store: subData.store,
      };
    } catch (error) {
      throw new HttpsError(
        'internal',
        'Pro durumu kontrol edilirken bir hata olustu.'
      );
    }
  }
);

/**
 * Sync Pro Status with RevenueCat (Callable Function)
 * Manuel senkronizasyon icin
 * Rate limited: 5 istek/dakika (RevenueCat API korumasi icin)
 */
exports.syncProStatus = onCall(
  { region: REGION, secrets: [REVENUECAT_API_KEY], enforceAppCheck: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Bu islem icin giris yapmaniz gerekiyor.'
      );
    }

    const userId = request.auth.uid;
    if (!isValidUid(userId)) {
      throw new HttpsError('invalid-argument', 'Invalid user id');
    }
    const revenueCatApiKey = REVENUECAT_API_KEY.value();

    if (!revenueCatApiKey) {
      throw new HttpsError(
        'internal',
        'RevenueCat API key not configured'
      );
    }

    // Rate limiting: 5 requests per minute (RevenueCat API limit)
    const rateLimitKey = `syncProStatus:${userId}`;
    const rateCheck = checkRateLimit(rateLimitKey, 5, 60000);
    
    if (!rateCheck.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        'Cok fazla senkronizasyon istegi. Lutfen daha sonra deneyin.',
        { retryAfterSeconds: Math.ceil((rateCheck.resetAt - Date.now()) / 1000) }
      );
    }

    try {
      // RevenueCat API'den kullanici bilgilerini al
      const response = await axios.get(
        `https://api.revenuecat.com/v1/subscribers/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${revenueCatApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const subscriber = response.data.subscriber;
      const proEntitlement = subscriber.entitlements?.pro_access;

      if (proEntitlement) {
        // Pro aktif
        const subscriptionData = {
          isPro: true,
          entitlementId: 'pro_access',
          expiresAt: admin.firestore.Timestamp.fromMillis(proEntitlement.expires_date_ms),
          lastSynced: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection('users').doc(userId).collection('subscription').doc('status').set(subscriptionData, { merge: true });

        return {
          success: true,
          isPro: true,
          expiresAt: new Date(proEntitlement.expires_date_ms).toISOString(),
        };
      } else {
        // Pro degil
        await db.collection('users').doc(userId).collection('subscription').doc('status').set({
          isPro: false,
          lastSynced: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        return {
          success: true,
          isPro: false,
        };
      }
    } catch (error) {
      throw new HttpsError(
        'internal',
        'Senkronizasyon hatasi.'
      );
    }
  }
);

/**
 * Join Family by Invite Code
 */
function createJoinFamilyByInviteCodeHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const inviteCode = normalizeCode(request.data?.inviteCode, 8, 8);
    if (!isValidUid(userId) || !inviteCode) {
      throw new HttpsError('invalid-argument', 'Gecersiz davet kodu.');
    }

    const rateCheck = rateLimitFn(`joinFamily:${userId}`, 10, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla deneme yaptiniz. Lutfen biraz bekleyin.');
    }

    const familySnapshot = await dbRef.collection('families')
      .where('inviteCode', '==', inviteCode)
      .limit(1)
      .get();

    if (familySnapshot.empty) {
      throw new HttpsError('not-found', 'Gecersiz davet kodu.');
    }

    const familyDoc = familySnapshot.docs[0];
    const familyData = familyDoc.data() || {};
    const members = Array.isArray(familyData.members) ? familyData.members.filter(isValidUid) : [];

    if (members.includes(userId)) {
      return { success: true, familyId: familyDoc.id, alreadyMember: true };
    }

    const batch = dbRef.batch();
    batch.update(familyDoc.ref, {
      members: adminSdk.firestore.FieldValue.arrayUnion(userId),
      updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
    });
    batch.set(
      dbRef.collection('users').doc(userId),
      {
        familyId: familyDoc.id,
        role: 'member',
        updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    await batch.commit();

    return { success: true, familyId: familyDoc.id, alreadyMember: false };
  };
}

const joinFamilyByInviteCodeHandler = createJoinFamilyByInviteCodeHandler();
exports.joinFamilyByInviteCode = onCall(
  { region: REGION, enforceAppCheck: true },
  joinFamilyByInviteCodeHandler
);

/**
 * Create Family - Sunucu tarafında aile oluştur
 */
function createCreateFamilyHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const familyName = String(request.data?.familyName || '').trim().slice(0, 80);

    if (!isValidUid(userId) || !familyName) {
      throw new HttpsError('invalid-argument', 'Gecersiz aile adi.');
    }

    const rateCheck = rateLimitFn(`createFamily:${userId}`, 5, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla aile olusturdunuz. Lutfen biraz bekleyin.');
    }

    // Güvenli aile adı - HTML tag'lerini temizle
    const safeFamilyName = familyName.replace(/[<>]/g, '');
    if (!safeFamilyName) {
      throw new HttpsError('invalid-argument', 'Gecersiz aile adi.');
    }

    // Davet kodu oluştur
    const inviteCode = generateSecureCode(8);

    const familyRef = dbRef.collection('families').doc();
    const familyId = familyRef.id;

    const batch = dbRef.batch();
    batch.set(familyRef, {
      id: familyId,
      name: safeFamilyName,
      adminId: userId,
      members: [userId],
      inviteCode,
      createdAt: adminSdk.firestore.FieldValue.serverTimestamp(),
      settings: {
        allowChildTree: true
      }
    });

    batch.set(
      dbRef.collection('users').doc(userId),
      {
        familyId,
        role: 'parent',
        updatedAt: adminSdk.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    await batch.commit();

    return { success: true, familyId, inviteCode };
  };
}

const createFamilyHandler = createCreateFamilyHandler();
exports.createFamily = onCall(
  { region: REGION, enforceAppCheck: true },
  createFamilyHandler
);

/**
 * Create Family Group - Sunucu tarafında grup oluştur
 */
function createCreateFamilyGroupHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const groupName = String(request.data?.name || '').trim().slice(0, 80);
    const profile = request.data?.profile || {};

    const profileId = sanitizeProfileId(profile.id) || userId;
    const profileName = sanitizeDisplayName(profile.name, 'Isimsiz');
    const profileAvatar = sanitizeAvatar(profile.avatar, '👤');
    const profileRole = sanitizeRole(profile.role, 'parent');

    if (!isValidUid(userId) || !groupName) {
      throw new HttpsError('invalid-argument', 'Gecersiz grup adi.');
    }

    // Güvenli grup adı
    const safeGroupName = groupName.replace(/[<>]/g, '');
    if (!safeGroupName) {
      throw new HttpsError('invalid-argument', 'Gecersiz grup adi.');
    }

    const rateCheck = rateLimitFn(`createFamilyGroup:${userId}`, 10, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla grup olusturdunuz. Lutfen biraz bekleyin.');
    }

    // Grup kodu oluştur
    const code = generateSecureCode(8);

    const groupRef = dbRef.collection('familyGroups').doc();
    const groupId = groupRef.id;

    const groupData = {
      id: groupId,
      name: safeGroupName,
      code,
      createdBy: userId,
      createdAt: adminSdk.firestore.FieldValue.serverTimestamp(),
      members: [
        {
          id: profileId,
          uid: userId,
          name: profileName,
          avatar: profileAvatar,
          role: profileRole,
          isAdmin: true
        }
      ],
      memberIds: [userId],
      pendingMembers: []
    };

    await dbRef.collection('familyGroups').doc(groupId).set(groupData);

    return { success: true, groupId, code, group: groupData };
  };
}

const createFamilyGroupHandler = createCreateFamilyGroupHandler();
exports.createFamilyGroup = onCall(
  { region: REGION, enforceAppCheck: true },
  createFamilyGroupHandler
);

// Yardımcı fonksiyon: Güvenli kod üret
function generateSecureCode(length = 8) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes).map((byte) => charset[byte % charset.length]).join('');
}

/**
 * Request to Join Family Group by Code
 */
exports.requestFamilyGroupJoinByCode = onCall(
  { region: REGION, enforceAppCheck: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const code = normalizeCode(request.data?.code, 6, 12);
    const profileId = sanitizeProfileId(request.data?.profile?.id);
    const profileName = sanitizeDisplayName(request.data?.profile?.name, 'Isimsiz');
    const profileAvatar = sanitizeAvatar(request.data?.profile?.avatar, '👤');
    const profileRole = sanitizeRole(request.data?.profile?.role, 'child');

    if (!isValidUid(userId) || !code || !profileId) {
      throw new HttpsError('invalid-argument', 'Gecersiz grup kodu.');
    }

    const rateCheck = checkRateLimit(`joinFamilyGroup:${userId}`, 10, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla deneme yaptiniz. Lutfen biraz bekleyin.');
    }

    const groupSnapshot = await db.collection('familyGroups')
      .where('code', '==', code)
      .limit(1)
      .get();

    if (groupSnapshot.empty) {
      throw new HttpsError('not-found', 'Gecersiz grup kodu.');
    }

    const groupDoc = groupSnapshot.docs[0];
    const groupData = groupDoc.data() || {};
    const members = Array.isArray(groupData.members) ? groupData.members : [];
    const pendingMembers = Array.isArray(groupData.pendingMembers) ? groupData.pendingMembers : [];

    const isMember = members.some((member) => member?.uid === userId || member?.id === profileId);
    if (isMember) {
      return { status: 'member', groupId: groupDoc.id };
    }

    const isPending = pendingMembers.some((member) => member?.requestedByUid === userId || member?.profileId === profileId);
    if (isPending) {
      return { status: 'pending', groupId: groupDoc.id };
    }

    await groupDoc.ref.update({
      pendingMembers: admin.firestore.FieldValue.arrayUnion({
        profileId,
        requestedByUid: userId,
        name: profileName,
        avatar: profileAvatar,
        role: profileRole,
        requestedAt: new Date().toISOString(),
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { status: 'pending', groupId: groupDoc.id };
  }
);

/**
 * List Public Hatims for Discovery
 */
exports.listPublicHatims = onCall(
  { region: REGION, enforceAppCheck: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    if (!isValidUid(userId)) {
      throw new HttpsError('invalid-argument', 'Invalid user id');
    }

    const snapshot = await db.collection('hatims')
      .where('type', '==', 'group')
      .where('isPrivate', '==', false)
      .limit(50)
      .get();

    const hatims = snapshot.docs
      .map((doc) => sanitizePublicHatim(doc, userId))
      .sort((a, b) => b.createdAtMs - a.createdAtMs);

    return { hatims };
  }
);

/**
 * Join Hatim by Invite Code
 */
function createJoinHatimByCodeHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const code = normalizeCode(request.data?.code, 6, 12);
    if (!isValidUid(userId) || !code) {
      throw new HttpsError('invalid-argument', 'Gecersiz hatim kodu.');
    }

    const rateCheck = rateLimitFn(`joinHatim:${userId}`, 10, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla deneme yaptiniz. Lutfen biraz bekleyin.');
    }

    const hatimSnapshot = await dbRef.collection('hatims')
      .where('joinCode', '==', code)
      .limit(1)
      .get();

    if (hatimSnapshot.empty) {
      throw new HttpsError('not-found', 'Gecersiz hatim kodu.');
    }

    const hatimDoc = hatimSnapshot.docs[0];
    const hatimData = hatimDoc.data() || {};
    if (hatimData.type !== 'group') {
      throw new HttpsError('failed-precondition', 'Bu hatime katilim desteklenmiyor.');
    }

    const readers = Array.isArray(hatimData.readers) ? hatimData.readers.filter(isValidUid) : [];
    if (readers.includes(userId)) {
      return { success: true, hatimId: hatimDoc.id, alreadyJoined: true };
    }

    await hatimDoc.ref.update({
      readers: adminSdk.firestore.FieldValue.arrayUnion(userId),
      updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, hatimId: hatimDoc.id, alreadyJoined: false };
  };
}

const joinHatimByCodeHandler = createJoinHatimByCodeHandler();
exports.joinHatimByCode = onCall(
  { region: REGION, enforceAppCheck: true },
  joinHatimByCodeHandler
);

/**
 * Sync an FCM token to a server-managed user document field.
 */
function createSyncFcmTokenHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const token = normalizeFcmToken(request.data?.token);
    if (!isValidUid(userId) || !token) {
      throw new HttpsError('invalid-argument', 'Gecersiz bildirim tokeni.');
    }

    const rateCheck = rateLimitFn(`syncFcmToken:${userId}`, 20, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla token senkronizasyon denemesi yaptiniz.');
    }

    const userRef = dbRef.collection('users').doc(userId);
    const result = await dbRef.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const currentTokens = Array.isArray(userDoc.data()?.fcmTokens)
        ? userDoc.data().fcmTokens.map((item) => normalizeFcmToken(item)).filter(Boolean)
        : [];

      const nextTokens = [token, ...currentTokens.filter((item) => item !== token)].slice(0, 8);

      transaction.set(
        userRef,
        {
          fcmTokens: nextTokens,
          updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return {
        success: true,
        alreadySynced: currentTokens.includes(token),
        tokenCount: nextTokens.length,
      };
    });

    return result;
  };
}

const syncFcmTokenHandler = createSyncFcmTokenHandler();
exports.syncFcmToken = onCall(
  { region: REGION, enforceAppCheck: true },
  syncFcmTokenHandler
);

/**
 * Say amin to a dua once per user.
 */
function createPrayForDuaHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const duaId = String(request.data?.duaId || '').trim();
    if (!isValidUid(userId) || !isValidDocumentId(duaId)) {
      throw new HttpsError('invalid-argument', 'Gecersiz dua istegi.');
    }

    const rateCheck = rateLimitFn(`prayForDua:${userId}`, 30, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla amin denemesi yaptiniz. Lutfen biraz bekleyin.');
    }

    const duaRef = dbRef.collection('duas').doc(duaId);
    const userAminRef = dbRef.collection('users').doc(userId).collection('duaAmins').doc(duaId);

    return dbRef.runTransaction(async (transaction) => {
      const [duaDoc, userAminDoc] = await Promise.all([
        transaction.get(duaRef),
        transaction.get(userAminRef),
      ]);

      if (!duaDoc.exists) {
        throw new HttpsError('not-found', 'Dua bulunamadi.');
      }

      const currentAminCount = Number.isInteger(duaDoc.data()?.aminCount) ? duaDoc.data().aminCount : 0;

      if (userAminDoc.exists) {
        return {
          success: true,
          alreadyPrayed: true,
          aminCount: currentAminCount,
        };
      }

      transaction.set(userAminRef, {
        duaId,
        createdAt: adminSdk.firestore.FieldValue.serverTimestamp(),
      });
      transaction.update(duaRef, {
        aminCount: adminSdk.firestore.FieldValue.increment(1),
      });

      return {
        success: true,
        alreadyPrayed: false,
        aminCount: currentAminCount + 1,
      };
    });
  };
}

const prayForDuaHandler = createPrayForDuaHandler();
exports.prayForDua = onCall(
  { region: REGION, enforceAppCheck: true },
  prayForDuaHandler
);

/**
 * ============================================================
 * SOCIAL NOTIFICATIONS (Hatim & Dua)
 * ============================================================
 */

/**
 * Trigger: When a user says "Amin" to a Dua
 * Watch for changes in 'duas/{duaId}'
 */
exports.onDuaUpdate = onDocumentUpdated(
  { document: 'duas/{duaId}', region: REGION },
  async (event) => {
    const newData = event.data.after.data();
    const previousData = event.data.before.data();

    const newAminCount = Number.isInteger(newData?.aminCount) ? newData.aminCount : 0;
    const previousAminCount = Number.isInteger(previousData?.aminCount) ? previousData.aminCount : 0;

    // Notify only when aminCount increases.
    if (newAminCount <= previousAminCount) {
      return null;
    }

    // Server-side throttle to reduce notification spam on rapid amin bursts.
    const toMillis = (value) => {
      if (!value) return 0;
      if (typeof value.toMillis === 'function') return value.toMillis();
      if (typeof value === 'number') return value;
      return 0;
    };

    const lastNotificationAt = toMillis(newData?.lastAminNotificationAt || previousData?.lastAminNotificationAt);
    const now = Date.now();
    const DUA_NOTIFICATION_THROTTLE_MS = 60 * 1000;
    if (lastNotificationAt > 0 && now - lastNotificationAt < DUA_NOTIFICATION_THROTTLE_MS) {
      return null;
    }

    const authorId = newData.authorId || newData.userId;
    const safeText = typeof newData.text === 'string' ? newData.text : '';
    const result = await sendPushToUser(authorId, {
      title: 'Bir mumin duana amin dedi',
      body: `"${safeText.substring(0, 30)}..." duan icin yeni bir amin var.`,
      data: { type: 'dua_amin', duaId: event.params.duaId },
    });

    await event.data.after.ref.set(
      { lastAminNotificationAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    return result;
  }
);

/**
 * Trigger: When a Hatim member joins or status changes
 * Watch for changes in 'hatims/{hatimId}'
 */
exports.onHatimUpdate = onDocumentUpdated(
  { document: 'hatims/{hatimId}', region: REGION },
  async (event) => {
    const newData = event.data.after.data();
    const previousData = event.data.before.data();

    const previousReaders = Array.isArray(previousData.readers)
      ? previousData.readers.filter(isValidUid)
      : [];
    const currentReaders = Array.isArray(newData.readers)
      ? newData.readers.filter(isValidUid)
      : [];

    // Only notify for a single, newly-added valid reader to reduce abuse/noise.
    if (currentReaders.length > previousReaders.length) {
      const newlyJoined = currentReaders.filter((uid) => !previousReaders.includes(uid));
      if (newlyJoined.length !== 1) {
        return null;
      }

      const joinedUserId = newlyJoined[0];
      const ownerId = isValidUid(newData.createdBy)
        ? newData.createdBy
        : (isValidUid(newData.adminId) ? newData.adminId : null);

      if (!ownerId || ownerId === joinedUserId) {
        return null;
      }

      const safeTitle = typeof newData.title === 'string' && newData.title.trim().length > 0
        ? newData.title.trim().slice(0, 60)
        : (typeof newData.name === 'string' && newData.name.trim().length > 0
            ? newData.name.trim().slice(0, 60)
            : 'Hatim');

      return sendPushToUser(ownerId, {
        title: 'Grubuna yeni bir hafiz katildi',
        body: `${safeTitle} hatmi icin okumaya baslayanlar var.`,
        data: { type: 'hatim_join', hatimId: event.params.hatimId, joinedUserId },
      });
    }

    return null;
  }
);

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

exports.__test = {
  createJoinFamilyByInviteCodeHandler,
  createJoinHatimByCodeHandler,
  createSyncFcmTokenHandler,
  createPrayForDuaHandler,
  normalizeCode,
  normalizeFcmToken,
};

/**
 * ============================================================
 * ANALYTICS STATS (DAU/MAU)
 * ============================================================
 */

// GA4 Property ID - Replace with your actual property ID
const GA4_PROPERTY_ID = '123456789';

/**
 * Get DAU/MAU statistics from Google Analytics Data API
 * Returns daily active users and monthly active users
 */
exports.getAnalyticsStats = onCall(
  { region: REGION, enforceAppCheck: true },
  async (request) => {
    if (!request.auth?.token?.admin) {
      throw new HttpsError(
        'permission-denied',
        'Bu islem icin admin yetkisi gerekiyor.'
      );
    }

    // Import Google Analytics Data API client lazily
    const { BetaAnalyticsDataClient } = require('@google-analytics/data');
    
    // Initialize client with default credentials (from service account)
    const analyticsDataClient = new BetaAnalyticsDataClient();
    
    try {
      // Get DAU (Daily Active Users) - last 1 day
      const [dauResponse] = await analyticsDataClient.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: 'today',
            endDate: 'today',
          },
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
      });
      
      const dau = dauResponse.rows?.length > 0 
        ? parseInt(dauResponse.rows[0].metricValues[0].value, 10) 
        : 0;

      // Get previous day DAU for comparison
      const [prevDauResponse] = await analyticsDataClient.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: '1dayAgo',
            endDate: '1dayAgo',
          },
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
      });
      
      const prevDau = prevDauResponse.rows?.length > 0 
        ? parseInt(prevDauResponse.rows[0].metricValues[0].value, 10) 
        : 0;

      // Calculate DAU change percentage
      const dauChange = prevDau > 0 
        ? Math.round(((dau - prevDau) / prevDau) * 100 * 10) / 10
        : 0;

      // Get MAU (Monthly Active Users) - last 30 days
      const [mauResponse] = await analyticsDataClient.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: '30daysAgo',
            endDate: 'today',
          },
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
      });
      
      const mau = mauResponse.rows?.length > 0 
        ? parseInt(mauResponse.rows[0].metricValues[0].value, 10) 
        : 0;

      // Get previous month MAU for comparison (31-60 days ago)
      const [prevMauResponse] = await analyticsDataClient.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: '60daysAgo',
            endDate: '31daysAgo',
          },
        ],
        metrics: [
          {
            name: 'activeUsers',
          },
        ],
      });
      
      const prevMau = prevMauResponse.rows?.length > 0 
        ? parseInt(prevMauResponse.rows[0].metricValues[0].value, 10) 
        : 0;

      // Calculate MAU change percentage
      const mauChange = prevMau > 0 
        ? Math.round(((mau - prevMau) / prevMau) * 100 * 10) / 10
        : 0;

      return {
        dau,
        mau,
        dauChange,
        mauChange,
        date: new Date().toISOString().split('T')[0],
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[getAnalyticsStats] Error:', error.message);
      throw new HttpsError(
        'internal',
        'Analytics verileri alinirken bir hata olustu.',
        { error: error.message }
      );
    }
  }
);

