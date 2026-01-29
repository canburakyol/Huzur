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
