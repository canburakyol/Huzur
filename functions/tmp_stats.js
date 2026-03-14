
const admin = require('firebase-admin');

// Initialize with application default credentials
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

async function getStats() {
  try {
    const usersSnapshot = await db.collection('users').count().get();
    const userCount = usersSnapshot.data().count;
    console.log(`---STATS_START---`);
    console.log(`TOTAL_USERS: ${userCount}`);

    // Check for recent activity in growth_logs
    const recentLogs = await db.collectionGroup('growth_logs').orderBy('timestamp', 'desc').limit(5).get();
    if (!recentLogs.empty) {
      console.log(`RECENT_EVENTS:`);
      recentLogs.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.eventName} (${data.timestamp?.toDate()?.toISOString() || 'no-date'})`);
      });
    }

    // Check for premium users
    const premiumSnapshot = await db.collectionGroup('subscription').where('isPro', '==', true).get();
    console.log(`PREMIUM_USERS: ${premiumSnapshot.size}`);

    console.log(`---STATS_END---`);

  } catch (error) {
    console.error(`ERROR: ${error.message}`);
  }
}

getStats();
