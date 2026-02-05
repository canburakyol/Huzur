const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin
admin.initializeApp();

// Firestore reference
const db = admin.firestore();

/**
 * RevenueCat Webhook Handler
 * Pro subscription durumunu server-side doğrulama
 */
exports.revenueCatWebhook = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    
    // 1. Webhook authentication
    const authHeader = req.headers.authorization;
    const expectedToken = functions.config().revenuecat?.webhook_token;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      console.error('Invalid webhook authorization');
      res.status(401).send('Unauthorized');
      return;
    }

    try {
      const event = req.body;
      const userId = event.app_user_id;
      const eventType = event.event.type;
      
      console.log(`RevenueCat Event: ${eventType} for user: ${userId}`);

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
          console.log(`Unhandled event type: ${eventType}`);
      }

      res.status(200).send('OK');
      
    } catch (error) {
      console.error('RevenueCat webhook error:', error);
      res.status(500).send('Internal Server Error');
    }
  });

/**
 * Activate Pro subscription
 */
async function activateProSubscription(userId, event) {
  const entitlement = event.entitlements?.pro_access;
  
  if (!entitlement) {
    console.log('No pro_access entitlement found');
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
    environment: event.environment // sandbox or production
  };

  // Save to Firestore
  await db.collection('users').doc(userId).collection('subscription').doc('status').set(subscriptionData);
  
  console.log(`Pro activated for user: ${userId}`);
}

/**
 * Deactivate Pro subscription
 */
async function deactivateProSubscription(userId, event) {
  const subscriptionData = {
    isPro: false,
    entitlementId: null,
    productId: null,
    expiresAt: null,
    cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    cancellationReason: event.event.type
  };

  await db.collection('users').doc(userId).collection('subscription').doc('status').set(subscriptionData);
  
  console.log(`Pro deactivated for user: ${userId}`);
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
  
  console.log(`Pro transferred from ${fromUserId} to ${toUserId}`);
}

/**
 * Check Pro Status (Callable Function)
 * Client-side Pro doğrulama için
 */
exports.checkProStatus = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    
    // 1. Authentication kontrolü
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Bu işlem için giriş yapmanız gerekiyor.'
      );
    }

    const userId = context.auth.uid;

    try {
      // 2. Firestore'dan subscription durumunu al
      const subDoc = await db.collection('users').doc(userId).collection('subscription').doc('status').get();
      
      if (!subDoc.exists) {
        return {
          isPro: false,
          expiresAt: null,
          message: 'No subscription found'
        };
      }

      const subData = subDoc.data();
      const now = admin.firestore.Timestamp.now();
      const expiresAt = subData.expiresAt;
      
      // 3. Expiry kontrolü
      let isPro = subData.isPro;
      if (isPro && expiresAt && expiresAt.toMillis() < now.toMillis()) {
        isPro = false;
        // Update Firestore
        await subDoc.ref.update({
          isPro: false,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return {
        isPro: isPro,
        expiresAt: expiresAt ? expiresAt.toDate().toISOString() : null,
        productId: subData.productId,
        store: subData.store
      };

    } catch (error) {
      console.error('Check Pro Status Error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Pro durumu kontrol edilirken bir hata oluştu.'
      );
    }
  });

/**
 * Sync Pro Status with RevenueCat (Callable Function)
 * Manuel senkronizasyon için
 */
exports.syncProStatus = functions
  .region('europe-west1')
  .https.onCall(async (data, context) => {
    
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Bu işlem için giriş yapmanız gerekiyor.'
      );
    }

    const userId = context.auth.uid;
    const revenueCatApiKey = functions.config().revenuecat?.api_key;
    
    if (!revenueCatApiKey) {
      throw new functions.https.HttpsError(
        'internal',
        'RevenueCat API key not configured'
      );
    }

    try {
      // RevenueCat API'den kullanıcı bilgilerini al
      const response = await axios.get(
        `https://api.revenuecat.com/v1/subscribers/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${revenueCatApiKey}`,
            'Content-Type': 'application/json'
          }
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
          lastSynced: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(userId).collection('subscription').doc('status').set(subscriptionData, { merge: true });
        
        return {
          success: true,
          isPro: true,
          expiresAt: new Date(proEntitlement.expires_date_ms).toISOString()
        };
      } else {
        // Pro değil
        await db.collection('users').doc(userId).collection('subscription').doc('status').set({
          isPro: false,
          lastSynced: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        return {
          success: true,
          isPro: false
        };
      }
    } catch (error) {
      console.error('Sync Pro Status Error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Senkronizasyon hatası.'
      );
    }
  });

/**
 * ============================================================
 * SOCIAL NOTIFICATIONS (Hatim & Dua)
 * ============================================================
 */

/**
 * Trigger: When a user says "Amin" to a Dua
 * Watch for changes in 'duas/{duaId}'
 */
exports.onDuaUpdate = functions
  .region('europe-west1')
  .firestore
  .document('duas/{duaId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    // Check if aminCount increased
    if (newData.aminCount > previousData.aminCount) {
      const authorId = newData.userId;
      
      // Don't notify if author says amin to themselves (unlikely but possible)
      // We don't have the 'who' in this simple check, but usually acceptable.
      
      return sendPushToUser(authorId, {
        title: 'Bir Mümin Duana Amin Dedi! 🤲',
        body: `"${newData.text.substring(0, 30)}..." duan için yeni bir amin var.`,
        data: { type: 'dua_amin', duaId: context.params.duaId }
      });
    }
    
    return null;
  });

/**
 * Trigger: When a Hatim member joins or status changes
 * Watch for changes in 'hatims/{hatimId}'
 */
exports.onHatimUpdate = functions
  .region('europe-west1')
  .firestore
  .document('hatims/{hatimId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    
    // Case 1: New participant joined (readers array changed)
    // Arrays comparison is tricky, but let's check length
    if (newData.readers && previousData.readers && newData.readers.length > previousData.readers.length) {
      const adminId = newData.adminId; // Notify admin
      
      // Find who joined? We can't easily tell from array diff without loop, 
      // but we can just notify admin.
      return sendPushToUser(adminId, {
        title: 'Grubuna Yeni Bir Hafız Katıldı! 📖',
        body: `${newData.title} hatmi için okumaya başlayanlar var.`,
        data: { type: 'hatim_join', hatimId: context.params.hatimId }
      });
    }

    // Case 2: A part was completed (parts array changed)
    // This requires deep checking part status, might be too noisy.
    // Let's stick to Join notifications for now to save quota.
    
    return null;
  });

/**
 * Helper: Send Push Notification to User
 */
async function sendPushToUser(userId, notification) {
  if (!userId) return null;

  try {
    // 1. Get User's FCM Tokens
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return null;

    const userData = userDoc.data();
    const tokens = userData.fcmTokens;

    if (!tokens || tokens.length === 0) {
      console.log(`User ${userId} has no FCM tokens.`);
      return null;
    }

    // 2. Prepare Payload
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      tokens: tokens, // Multicast to all user devices
    };

    // 3. Send using Admin SDK
    const response = await admin.messaging().sendMulticast(message);
    
    // 4. Cleanup invalid tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      
      if (failedTokens.length > 0) {
        await db.collection('users').doc(userId).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...failedTokens)
        });
        console.log(`Cleaned up ${failedTokens.length} invalid tokens.`);
      }
    }

    return response;

  } catch (error) {
    console.error('Error sending push:', error);
    return null;
  }
}
