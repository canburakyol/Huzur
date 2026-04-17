const {
  onCall,
  functionsV1,
  HttpsError,
  admin,
  db,
  isValidUid,
  isValidDocumentId,
  normalizeCode,
  sanitizeHatimName,
  sanitizeHatimDescription,
  sanitizeDisplayName,
  sanitizePublicHatim,
  countCompletedHatimParts,
  checkRateLimit,
  checkDistributedRateLimit,
  buildHatimParts,
  generateSecureCode,
  logSecurityEvent,
  DISCOVERY_SEED_HATIMS,
  secureCallableOptions,
  REGION,
  MAX_EVENT_INSTANCES,
  sendPushToUser,
} = require('../common/runtime');

function createCreateGroupHatimHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const name = sanitizeHatimName(request.data?.name);
    const description = sanitizeHatimDescription(request.data?.description);
    const totalParts = Math.max(1, Math.min(30, Number(request.data?.totalParts) || 30));

    if (!isValidUid(userId) || !name) {
      throw new HttpsError('invalid-argument', 'Gecersiz hatim bilgisi.');
    }

    const rateCheck = rateLimitFn(`createGroupHatim:${userId}`, 3, 3600000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla hatim olusturdunuz. Lutfen daha sonra tekrar deneyin.');
    }

    const distributedRateCheck = await distributedRateLimitFn({
      dbRef,
      adminSdk,
      namespace: 'createGroupHatim',
      identifier: userId,
      maxRequests: 6,
      windowMs: 86400000,
    });
    if (!distributedRateCheck.allowed) {
      logSecurityEvent('create_group_hatim_daily_quota_exceeded', { userId }, 'WARNING');
      throw new HttpsError('resource-exhausted', 'Gunluk hatim olusturma limitine ulastiniz.');
    }

    const hatimRef = dbRef.collection('hatims').doc();
    const joinCode = generateSecureCode(6);

    await hatimRef.set({
      id: hatimRef.id,
      type: 'group',
      name,
      description,
      createdBy: userId,
      createdAt: adminSdk.firestore.FieldValue.serverTimestamp(),
      updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
      joinCode,
      parts: buildHatimParts(totalParts),
      readers: [userId],
      isPrivate: false,
      isDiscoverable: true,
      completedParts: 0,
      totalParts,
    });

    return {
      success: true,
      hatimId: hatimRef.id,
      joinCode,
    };
  };
}

const createGroupHatimHandler = createCreateGroupHatimHandler();
exports.createGroupHatim = onCall(
  secureCallableOptions(),
  createGroupHatimHandler
);

function createUpdateHatimPartHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const hatimId = String(request.data?.hatimId || '').trim();
    const partNumber = Number(request.data?.partNumber);
    const status = String(request.data?.status || '').trim();
    const profileName = sanitizeDisplayName(request.data?.userProfile?.name, 'Anonim');

    if (!isValidUid(userId) || !isValidDocumentId(hatimId) || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 30) {
      throw new HttpsError('invalid-argument', 'Gecersiz hatim parcasi istegi.');
    }

    if (!['free', 'taken', 'completed'].includes(status)) {
      throw new HttpsError('invalid-argument', 'Gecersiz durum guncellemesi.');
    }

    const rateCheck = rateLimitFn(`updateHatimPart:${userId}`, 60, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla hatim parcasi guncellemesi yaptiniz.');
    }

    const distributedRateCheck = await distributedRateLimitFn({
      dbRef,
      adminSdk,
      namespace: 'updateHatimPart',
      identifier: userId,
      maxRequests: 200,
      windowMs: 86400000,
    });
    if (!distributedRateCheck.allowed) {
      logSecurityEvent('update_hatim_part_daily_quota_exceeded', { userId, hatimId }, 'WARNING');
      throw new HttpsError('resource-exhausted', 'Gunluk hatim parcasi guncelleme limitine ulastiniz.');
    }

    const hatimRef = dbRef.collection('hatims').doc(hatimId);
    const nowIso = new Date().toISOString();

    return dbRef.runTransaction(async (transaction) => {
      const hatimDoc = await transaction.get(hatimRef);
      if (!hatimDoc.exists) {
        throw new HttpsError('not-found', 'Hatim bulunamadi.');
      }

      const hatimData = hatimDoc.data() || {};
      const readers = Array.isArray(hatimData.readers) ? hatimData.readers.filter(isValidUid) : [];
      if (!readers.includes(userId)) {
        throw new HttpsError('permission-denied', 'Bu hatime erisiminiz yok.');
      }

      const partKey = String(partNumber);
      const currentPart = hatimData.parts?.[partKey];
      if (!currentPart || typeof currentPart !== 'object') {
        throw new HttpsError('not-found', 'Hatim parcasi bulunamadi.');
      }

      const ownerUid = currentPart.takenBy?.uid || null;
      if (ownerUid && ownerUid !== userId) {
        throw new HttpsError('failed-precondition', 'Bu cuz baskasi tarafindan alinmis.');
      }

      let nextPart;
      if (status === 'free') {
        nextPart = {
          status: 'free',
          takenBy: null,
          takenAt: null,
          completedAt: null,
        };
      } else if (status === 'taken') {
        nextPart = {
          status: 'taken',
          takenBy: { uid: userId, name: profileName },
          takenAt: currentPart.takenAt || nowIso,
          completedAt: null,
        };
      } else {
        nextPart = {
          status: 'completed',
          takenBy: { uid: userId, name: profileName },
          takenAt: currentPart.takenAt || nowIso,
          completedAt: nowIso,
        };
      }

      const nextParts = {
        ...(hatimData.parts || {}),
        [partKey]: nextPart,
      };
      const completedParts = countCompletedHatimParts(nextParts);

      transaction.update(hatimRef, {
        [`parts.${partKey}`]: nextPart,
        completedParts,
        readers: adminSdk.firestore.FieldValue.arrayUnion(userId),
        updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        part: nextPart,
        completedParts,
      };
    });
  };
}

const updateHatimPartHandler = createUpdateHatimPartHandler();
exports.updateHatimPart = onCall(
  secureCallableOptions(),
  updateHatimPartHandler
);

/**
 * List Public Hatims for Discovery
 */
exports.listPublicHatims = onCall(
  secureCallableOptions(),
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    if (!isValidUid(userId)) {
      throw new HttpsError('invalid-argument', 'Invalid user id');
    }

    const rateCheck = checkRateLimit(`listPublicHatims:${userId}`, 20, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla listeleme istegi gonderdiniz.');
    }

    const distributedRateCheck = await checkDistributedRateLimit({
      dbRef: db,
      adminSdk: admin,
      namespace: 'listPublicHatims',
      identifier: userId,
      maxRequests: 250,
      windowMs: 86400000,
    });
    if (!distributedRateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Gunluk hatim kesif limitine ulastiniz.');
    }

    const snapshot = await db.collection('hatims')
      .where('type', '==', 'group')
      .where('isPrivate', '==', false)
      .limit(50)
      .get();

    const hatims = snapshot.docs
      .map((doc) => sanitizePublicHatim(doc, userId))
      .concat(DISCOVERY_SEED_HATIMS)
      .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));

    return { hatims };
  });

/**
 * Join Hatim by Invite Code
 */
function createJoinHatimByCodeHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;

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

    const distributedRateCheck = await distributedRateLimitFn({
      dbRef,
      adminSdk,
      namespace: 'joinHatim',
      identifier: userId,
      maxRequests: 20,
      windowMs: 3600000,
    });
    if (!distributedRateCheck.allowed) {
      logSecurityEvent('join_hatim_rate_limited', { userId }, 'WARNING');
      throw new HttpsError('resource-exhausted', 'Cok fazla hatim kodu denemesi yaptiniz. Lutfen daha sonra tekrar deneyin.');
    }

    const hatimSnapshot = await dbRef.collection('hatims')
      .where('joinCode', '==', code)
      .limit(1)
      .get();

    if (hatimSnapshot.empty) {
      logSecurityEvent('join_hatim_invalid_code', { userId, code }, 'WARNING');
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
  secureCallableOptions(),
  joinHatimByCodeHandler
);

/**
 * Trigger: When a Hatim member joins or status changes
 * Watch for changes in 'hatims/{hatimId}'
 */
exports.onHatimUpdate = functionsV1
  .region(REGION)
  .runWith({ maxInstances: MAX_EVENT_INSTANCES })
  .firestore
  .document('hatims/{hatimId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

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
        data: { type: 'hatim_join', hatimId: context.params.hatimId, joinedUserId },
      });
    }

    return null;
  });

exports.__test = {
  createCreateGroupHatimHandler,
  createUpdateHatimPartHandler,
  createJoinHatimByCodeHandler,
};
