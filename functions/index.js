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

// Rate limiting in-memory store (production'da Redis onerilir)
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

