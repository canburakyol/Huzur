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

const PRO_ENTITLEMENT_ID = 'pro_access';
const ACTIVE_PRO_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'SUBSCRIPTION_EXTENDED',
  'TEMPORARY_ENTITLEMENT_GRANT',
]);

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
      const body = req.body;
      const event = body?.event;
      const eventType = event?.type;

      if (!body || typeof body !== 'object' || !event || typeof event !== 'object' || typeof eventType !== 'string') {
        res.status(400).send('Invalid payload');
        return;
      }

      if (eventType === 'TEST') {
        console.info('[RevenueCatWebhook] TEST event received', {
          eventId: event.id || null,
          environment: event.environment || null,
        });
        res.status(200).send('OK');
        return;
      }

      const processed = await processWithIdempotency(event, async (transaction) => {
        if (ACTIVE_PRO_EVENTS.has(eventType)) {
          const userId = event.app_user_id;
          if (!isValidUid(userId)) {
            throw new WebhookValidationError('Invalid user id');
          }
          await activateProSubscription(userId, event, transaction);
          return;
        }

        switch (eventType) {
          case 'EXPIRATION': {
            const userId = event.app_user_id;
            if (!isValidUid(userId)) {
              throw new WebhookValidationError('Invalid user id');
            }
            await deactivateProSubscription(userId, event, transaction);
            break;
          }

          case 'CANCELLATION':
            await writeSubscriptionMetadata(event.app_user_id, event, 'cancellation', transaction);
            break;

          case 'BILLING_ISSUE':
            await writeSubscriptionMetadata(event.app_user_id, event, 'billingIssue', transaction);
            break;

          case 'SUBSCRIPTION_PAUSED':
            await writeSubscriptionMetadata(event.app_user_id, event, 'paused', transaction);
            break;

          case 'TRANSFER':
            await transferProSubscription(event, transaction);
            break;

          default:
            console.info('[RevenueCatWebhook] Unhandled event type', {
              eventId: event.id || null,
              eventType,
            });
            break;
        }
      });

      if (!processed) {
        console.info('[RevenueCatWebhook] Duplicate event ignored', {
          eventId: event.id,
          eventType,
        });
      }

      res.status(200).send('OK');
    } catch (error) {
      if (error instanceof WebhookValidationError) {
        res.status(400).send(error.message);
        return;
      }

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
async function activateProSubscription(userId, event, transaction) {
  if (!userId || !hasProEntitlement(event)) {
    console.info('[RevenueCatWebhook] Active event without pro entitlement ignored', {
      eventId: event.id || null,
      eventType: event.type,
      userId,
      entitlementIds: event.entitlement_ids || null,
    });
    return;
  }

  const statusRef = getSubscriptionStatusRef(userId);
  const subscriptionData = {
    isPro: true,
    entitlementId: PRO_ENTITLEMENT_ID,
    productId: event.product_id || null,
    expiresAt: timestampFromMillis(event.expiration_at_ms),
    purchaseDate: timestampFromMillis(event.purchased_at_ms),
    store: event.store || null,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    environment: event.environment || null,
    revenueCatEventId: event.id || null,
    revenueCatEventType: event.type,
  };

  await setDoc(statusRef, subscriptionData, transaction);
}

/**
 * Deactivate Pro subscription
 */
async function deactivateProSubscription(userId, event, transaction) {
  if (!userId) {
    return;
  }

  const statusRef = getSubscriptionStatusRef(userId);
  const subscriptionData = {
    isPro: false,
    entitlementId: null,
    productId: null,
    expiresAt: null,
    expiredAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    cancellationReason: event.expiration_reason || event.type,
    revenueCatEventId: event.id || null,
    revenueCatEventType: event.type,
    store: event.store || null,
    environment: event.environment || null,
  };

  await setDoc(statusRef, subscriptionData, transaction);
}

/**
 * Transfer Pro subscription between users
 */
async function transferProSubscription(event, transaction) {
  const fromUserId = event.transferred_from?.[0];
  const toUserId = event.transferred_to?.[0];

  if (isValidUid(fromUserId)) {
    await deactivateProSubscription(fromUserId, event, transaction);
    await writeTransferMetadata(fromUserId, event, 'sent', transaction);
  } else if (fromUserId) {
    console.warn('[RevenueCatWebhook] Invalid transfer source user ignored', {
      eventId: event.id || null,
      fromUserId,
    });
  }

  if (isValidUid(toUserId) && hasProEntitlement(event)) {
    await activateProSubscription(toUserId, event, transaction);
  } else if (toUserId) {
    await writeTransferMetadata(toUserId, event, 'received', transaction);
    console.warn('[RevenueCatWebhook] Transfer destination not activated', {
      eventId: event.id || null,
      toUserId,
      hasProEntitlement: hasProEntitlement(event),
    });
  }
}

async function writeSubscriptionMetadata(userId, event, metadataType, transaction) {
  if (!isValidUid(userId)) {
    throw new WebhookValidationError('Invalid user id');
  }

  const baseData = {
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    revenueCatEventId: event.id || null,
    revenueCatEventType: event.type,
    productId: event.product_id || null,
    store: event.store || null,
    environment: event.environment || null,
  };

  if (metadataType === 'cancellation') {
    await setDoc(
      getSubscriptionStatusRef(userId),
      {
        ...baseData,
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        cancellationReason: event.cancel_reason || event.type,
        cancelReason: event.cancel_reason || null,
      },
      transaction,
      { merge: true }
    );
    return;
  }

  if (metadataType === 'billingIssue') {
    await setDoc(
      getSubscriptionStatusRef(userId),
      {
        ...baseData,
        billingIssueAt: admin.firestore.FieldValue.serverTimestamp(),
        gracePeriodExpiresAt: timestampFromMillis(event.grace_period_expiration_at_ms),
      },
      transaction,
      { merge: true }
    );
    return;
  }

  if (metadataType === 'paused') {
    await setDoc(
      getSubscriptionStatusRef(userId),
      {
        ...baseData,
        pausedAt: admin.firestore.FieldValue.serverTimestamp(),
        autoResumeAt: timestampFromMillis(event.auto_resume_at_ms),
      },
      transaction,
      { merge: true }
    );
  }
}

async function writeTransferMetadata(userId, event, direction, transaction) {
  if (!isValidUid(userId)) {
    return;
  }

  await setDoc(
    getSubscriptionStatusRef(userId),
    {
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      revenueCatEventId: event.id || null,
      revenueCatEventType: event.type,
      transferDirection: direction,
      transferProcessedAt: admin.firestore.FieldValue.serverTimestamp(),
      store: event.store || null,
      environment: event.environment || null,
    },
    transaction,
    { merge: true }
  );
}

async function processWithIdempotency(event, processEvent) {
  if (!event.id) {
    await processEvent(null);
    return true;
  }

  const eventRef = db.collection('revenueCatWebhookEvents').doc(toFirestoreDocId(event.id));
  let processed = true;

  await db.runTransaction(async (transaction) => {
    const existingEvent = await transaction.get(eventRef);
    if (existingEvent.exists) {
      processed = false;
      return;
    }

    await processEvent(transaction);
    transaction.set(eventRef, {
      eventId: event.id,
      eventType: event.type,
      appUserId: event.app_user_id || null,
      environment: event.environment || null,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  return processed;
}

function hasProEntitlement(event) {
  return Array.isArray(event.entitlement_ids) && event.entitlement_ids.includes(PRO_ENTITLEMENT_ID);
}

function getSubscriptionStatusRef(userId) {
  return db.collection('users').doc(userId).collection('subscription').doc('status');
}

function setDoc(ref, data, transaction, options) {
  if (transaction) {
    transaction.set(ref, data, options);
    return Promise.resolve();
  }

  return ref.set(data, options);
}

function timestampFromMillis(value) {
  return Number.isFinite(value) ? admin.firestore.Timestamp.fromMillis(value) : null;
}

function toFirestoreDocId(value) {
  return Buffer.from(String(value), 'utf8').toString('base64url');
}

class WebhookValidationError extends Error {}
