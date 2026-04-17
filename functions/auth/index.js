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
};
