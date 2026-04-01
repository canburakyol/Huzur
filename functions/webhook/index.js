const {
  functionsV1,
  admin,
  db,
  REVENUECAT_WEBHOOK_TOKEN,
  safeTokenEquals,
  isValidUid,
  REGION,
  MAX_WEBHOOK_INSTANCES,
} = require('../common/runtime');

/**
 * RevenueCat Webhook Handler
 * Pro subscription durumunu server-side dogrulama
 */
exports.revenueCatWebhook = functionsV1
  .region(REGION)
  .runWith({ secrets: ['REVENUECAT_WEBHOOK_TOKEN'], maxInstances: MAX_WEBHOOK_INSTANCES })
  .https.onRequest(async (req, res) => {
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
