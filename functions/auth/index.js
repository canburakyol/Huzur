const {
  functionsV1,
  onCall,
  HttpsError,
  admin,
  axios,
  db,
  REVENUECAT_API_KEY,
  isValidUid,
  normalizeFcmToken,
  checkRateLimit,
  checkDistributedRateLimit,
  logSecurityEvent,
  REGION,
  MAX_V1_CALLABLE_INSTANCES,
  secureCallableOptions,
} = require('../common/runtime');

function timestampToMillis(value) {
  if (!value) return null;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function timestampToIso(value) {
  const millis = timestampToMillis(value);
  return Number.isFinite(millis) ? new Date(millis).toISOString() : null;
}

function resolveActiveStatus(data = {}, nowMillis = Date.now()) {
  const expiresAtMs = timestampToMillis(data?.expiresAt);
  const active = data?.isPro === true && (!expiresAtMs || expiresAtMs > nowMillis);
  return {
    active,
    expiresAt: timestampToIso(data?.expiresAt),
    productId: data?.productId || null,
    store: data?.store || null,
    entitlementId: data?.entitlementId || null,
    source: data?.source || (data?.entitlementId === 'referral_reward' ? 'referral_reward' : 'revenuecat'),
  };
}

async function readCombinedProStatus(dbRef, adminSdk, userId) {
  const now = adminSdk.firestore.Timestamp.now();
  const nowMillis = now.toMillis();
  const subscriptionRef = dbRef.collection('users').doc(userId).collection('subscription').doc('status');
  const referralRewardRef = dbRef.collection('users').doc(userId).collection('subscription').doc('referralReward');
  const [subDoc, referralRewardDoc] = await Promise.all([
    subscriptionRef.get(),
    referralRewardRef.get(),
  ]);

  const subData = subDoc.exists ? subDoc.data() || {} : {};
  const rewardData = referralRewardDoc.exists ? referralRewardDoc.data() || {} : {};
  const paid = subDoc.exists ? resolveActiveStatus(subData, nowMillis) : { active: false };
  const reward = referralRewardDoc.exists ? resolveActiveStatus(rewardData, nowMillis) : { active: false };

  if (subDoc.exists && subData?.isPro === true && !paid.active) {
    await subDoc.ref.update({
      isPro: false,
      lastUpdated: adminSdk.firestore.FieldValue.serverTimestamp(),
    });
  }

  if (referralRewardDoc.exists && rewardData?.isPro === true && !reward.active) {
    await referralRewardDoc.ref.update({
      isPro: false,
      lastUpdated: adminSdk.firestore.FieldValue.serverTimestamp(),
    });
  }

  if (paid.active) {
    return {
      isPro: true,
      expiresAt: paid.expiresAt,
      productId: paid.productId,
      store: paid.store,
      entitlementId: paid.entitlementId || 'pro_access',
      source: 'revenuecat',
    };
  }

  if (reward.active) {
    return {
      isPro: true,
      expiresAt: reward.expiresAt,
      productId: 'referral_reward_24h',
      store: 'referral',
      entitlementId: 'referral_reward',
      source: 'referral_reward',
    };
  }

  return {
    isPro: false,
    expiresAt: null,
    productId: null,
    store: null,
    entitlementId: null,
    source: 'none',
  };
}

/**
 * Check Pro Status (Callable Function)
 * Client-side Pro dogrulama icin
 * Rate limited: 20 istek/dakika
 */
exports.checkProStatus = functionsV1
  .region(REGION)
  .runWith({ enforceAppCheck: true, maxInstances: MAX_V1_CALLABLE_INSTANCES })
  .https.onCall(async (data, context) => {
    const request = { data, auth: context.auth, app: context.app };
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

    const distributedRateCheck = await checkDistributedRateLimit({
      dbRef: db,
      adminSdk: admin,
      namespace: 'checkProStatus',
      identifier: userId,
      maxRequests: 120,
      windowMs: 86400000,
    });

    if (!distributedRateCheck.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        'Gunluk pro durum sorgulama limitine ulastiniz.'
      );
    }

    try {
      return readCombinedProStatus(db, admin, userId);
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
exports.syncProStatus = functionsV1
  .region(REGION)
  .runWith({ secrets: ['REVENUECAT_API_KEY'], enforceAppCheck: true, maxInstances: MAX_V1_CALLABLE_INSTANCES })
  .https.onCall(async (data, context) => {
    const request = { data, auth: context.auth, app: context.app };
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

    const distributedRateCheck = await checkDistributedRateLimit({
      dbRef: db,
      adminSdk: admin,
      namespace: 'syncProStatus',
      identifier: userId,
      maxRequests: 20,
      windowMs: 86400000,
    });

    if (!distributedRateCheck.allowed) {
      throw new HttpsError(
        'resource-exhausted',
        'Gunluk pro senkronizasyon limitine ulastiniz.'
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

        const combinedStatus = await readCombinedProStatus(db, admin, userId);
        return {
          success: true,
          ...combinedStatus,
        };
      }
    } catch (error) {
      throw new HttpsError(
        'internal',
        'Senkronizasyon hatasi.'
      );
    }
  });

/**
 * Sync an FCM token to a server-managed user document field.
 */
function createSyncFcmTokenHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;

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

    const distributedRateCheck = await distributedRateLimitFn({
      dbRef,
      adminSdk,
      namespace: 'syncFcmToken',
      identifier: userId,
      maxRequests: 100,
      windowMs: 86400000,
    });
    if (!distributedRateCheck.allowed) {
      logSecurityEvent('sync_fcm_token_daily_quota_exceeded', { userId }, 'WARNING');
      throw new HttpsError('resource-exhausted', 'Gunluk token senkronizasyon limitine ulastiniz.');
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
  secureCallableOptions(),
  syncFcmTokenHandler
);

exports.__test = {
  createSyncFcmTokenHandler,
  readCombinedProStatus,
  resolveActiveStatus,
};
