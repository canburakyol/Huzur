const {
  onCall,
  functionsV1,
  HttpsError,
  admin,
  db,
  isValidUid,
  isValidDocumentId,
  normalizeCode,
  sanitizeProfileId,
  sanitizeDisplayName,
  sanitizeAvatar,
  sanitizeRole,
  sanitizeDuaText,
  sanitizePublicDua,
  sanitizePublicFamily,
  checkRateLimit,
  checkDistributedRateLimit,
  generateSecureCode,
  hashValue,
  canonicalizeTextForFingerprint,
  logSecurityEvent,
  DISCOVERY_SEED_FAMILIES,
  buildDefaultWeeklyGoal,
  normalizeWeekKey,
  getWeekKey,
  getDateKey,
  sanitizeMiniLeaguePreferences,
  secureCallableOptions,
  REGION,
  MAX_EVENT_INSTANCES,
  sendPushToUser,
} = require('../common/runtime');

/**
 * Join Family by Invite Code
 */
function createJoinFamilyByInviteCodeHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;

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

    const distributedRateCheck = await distributedRateLimitFn({
      dbRef,
      adminSdk,
      namespace: 'joinFamily',
      identifier: userId,
      maxRequests: 20,
      windowMs: 3600000,
    });
    if (!distributedRateCheck.allowed) {
      logSecurityEvent('join_family_rate_limited', { userId }, 'WARNING');
      throw new HttpsError('resource-exhausted', 'Cok fazla davet kodu denemesi yaptiniz. Lutfen daha sonra tekrar deneyin.');
    }

    const familySnapshot = await dbRef.collection('families')
      .where('inviteCode', '==', inviteCode)
      .limit(1)
      .get();

    if (familySnapshot.empty) {
      logSecurityEvent('join_family_invalid_code', { userId, inviteCode }, 'WARNING');
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
  secureCallableOptions(),
  joinFamilyByInviteCodeHandler
);

/**
 * Create Family - Sunucu tarafÄ±nda aile oluÅŸtur
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

    // GÃ¼venli aile adÄ± - HTML tag'lerini temizle
    const safeFamilyName = familyName.replace(/[<>]/g, '');
    if (!safeFamilyName) {
      throw new HttpsError('invalid-argument', 'Gecersiz aile adi.');
    }

    // Davet kodu oluÅŸtur
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
      isDiscoverable: true,
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
  secureCallableOptions(),
  createFamilyHandler
);

/**
 * Create Family Group - Sunucu tarafÄ±nda grup oluÅŸtur
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
    const profileAvatar = sanitizeAvatar(profile.avatar, 'ğŸ‘¤');
    const profileRole = sanitizeRole(profile.role, 'parent');

    if (!isValidUid(userId) || !groupName) {
      throw new HttpsError('invalid-argument', 'Gecersiz grup adi.');
    }

    // GÃ¼venli grup adÄ±
    const safeGroupName = groupName.replace(/[<>]/g, '');
    if (!safeGroupName) {
      throw new HttpsError('invalid-argument', 'Gecersiz grup adi.');
    }

    const rateCheck = rateLimitFn(`createFamilyGroup:${userId}`, 10, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla grup olusturdunuz. Lutfen biraz bekleyin.');
    }

    // Grup kodu oluÅŸtur
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
  secureCallableOptions(),
  createFamilyGroupHandler
);


/**
 * Request to Join Family Group by Code
 */
exports.requestFamilyGroupJoinByCode = onCall(
  secureCallableOptions(),
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const code = normalizeCode(request.data?.code, 6, 12);
    const profileId = sanitizeProfileId(request.data?.profile?.id);
    const profileName = sanitizeDisplayName(request.data?.profile?.name, 'Isimsiz');
    const profileAvatar = sanitizeAvatar(request.data?.profile?.avatar, 'ğŸ‘¤');
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

function createCreateDuaHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;
  const nowMs = deps.nowMs || (() => Date.now());

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const text = sanitizeDuaText(request.data?.text);
    const isAnonymous = request.data?.isAnonymous === true;
    const authorName = isAnonymous
      ? 'Bir Mumin'
      : sanitizeDisplayName(request.data?.authorName, 'Isimsiz');

    if (!isValidUid(userId) || !text) {
      throw new HttpsError('invalid-argument', 'Gecersiz dua metni.');
    }

    const rateCheck = rateLimitFn(`createDua:${userId}`, 5, 3600000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla dua paylastiniz. Lutfen daha sonra tekrar deneyin.');
    }

    const distributedRateCheck = await distributedRateLimitFn({
      dbRef,
      adminSdk,
      namespace: 'createDua',
      identifier: userId,
      maxRequests: 10,
      windowMs: 86400000,
    });
    if (!distributedRateCheck.allowed) {
      logSecurityEvent('create_dua_daily_quota_exceeded', { userId }, 'WARNING');
      throw new HttpsError('resource-exhausted', 'Gunluk dua paylasim limitine ulastiniz. Lutfen daha sonra tekrar deneyin.');
    }

    const textFingerprint = hashValue(canonicalizeTextForFingerprint(text));
    const dedupWindowMs = 6 * 60 * 60 * 1000;
    const duaRef = dbRef.collection('duas').doc();
    const fingerprintRef = dbRef
      .collection('users')
      .doc(userId)
      .collection('security')
      .doc(`dua-${textFingerprint}`);

    await dbRef.runTransaction(async (transaction) => {
      const fingerprintDoc = await transaction.get(fingerprintRef);
      const lastSeenAt = fingerprintDoc.exists ? Math.max(0, Number(fingerprintDoc.data()?.lastSeenAtMs) || 0) : 0;

      if (lastSeenAt && (nowMs() - lastSeenAt) < dedupWindowMs) {
        logSecurityEvent('create_dua_duplicate_blocked', { userId }, 'WARNING');
        throw new HttpsError('already-exists', 'Benzer bir duayi cok kisa sure once paylastiniz.');
      }

      transaction.set(duaRef, {
        text,
        textFingerprint,
        isAnonymous,
        authorId: userId,
        authorName,
        aminCount: 0,
        featured: false,
        createdAt: adminSdk.firestore.FieldValue.serverTimestamp(),
        updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
      });
      transaction.set(fingerprintRef, {
        lastSeenAtMs: nowMs(),
        updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    });

    return {
      success: true,
      dua: {
        id: duaRef.id,
        text,
        isAnonymous,
        authorName,
        aminCount: 0,
        createdAtMs: Date.now(),
        featured: false,
      },
    };
  };
}

const createDuaHandler = createCreateDuaHandler();
exports.createDua = onCall(
  secureCallableOptions(),
  createDuaHandler
);

function createListRecentDuasHandler(deps = {}) {
  const dbRef = deps.db || db;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    if (!isValidUid(userId)) {
      throw new HttpsError('invalid-argument', 'Gecersiz kullanici.');
    }

    const limitCount = Math.max(1, Math.min(25, Number(request.data?.limitCount) || 20));
    const rateCheck = rateLimitFn(`listRecentDuas:${userId}`, 30, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla dua listeleme istegi gonderdiniz.');
    }

    const snapshot = await dbRef.collection('duas')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    return {
      duas: snapshot.docs.map((doc) => sanitizePublicDua(doc)),
    };
  };
}

const listRecentDuasHandler = createListRecentDuasHandler();
exports.listRecentDuas = onCall(
  secureCallableOptions(),
  listRecentDuasHandler
);


/**
 * List Public Families for Discovery
 */
exports.listPublicFamilies = onCall(
  secureCallableOptions(),
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    if (!isValidUid(userId)) {
      throw new HttpsError('invalid-argument', 'Invalid user id');
    }

    const rateCheck = checkRateLimit(`listPublicFamilies:${userId}`, 20, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla listeleme istegi gonderdiniz.');
    }

    const snapshot = await db.collection('families')
      .limit(50)
      .get();

    const families = snapshot.docs
      .filter((doc) => doc.data()?.isDiscoverable !== false)
      .map((doc) => sanitizePublicFamily(doc))
      .concat(DISCOVERY_SEED_FAMILIES)
      .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));

    return { families };
  });

function createGetOrCreateFamilyWeeklyGoalHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    if (!isValidUid(userId)) {
      throw new HttpsError('invalid-argument', 'Gecersiz kullanici.');
    }

    const userDoc = await dbRef.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};
    const familyId = isValidDocumentId(request.data?.familyId)
      ? String(request.data.familyId)
      : userData.familyId;

    if (!isValidDocumentId(familyId)) {
      throw new HttpsError('failed-precondition', 'Aktif bir aile bulunamadi.');
    }

    const familyRef = dbRef.collection('families').doc(familyId);
    const familyDoc = await familyRef.get();
    if (!familyDoc.exists) {
      throw new HttpsError('not-found', 'Aile bulunamadi.');
    }

    const familyData = familyDoc.data() || {};
    const members = Array.isArray(familyData.members) ? familyData.members.filter(isValidUid) : [];
    if (!members.includes(userId)) {
      throw new HttpsError('permission-denied', 'Bu aileye erisim izniniz yok.');
    }

    const weekKey = normalizeWeekKey(request.data?.weekKey) || getWeekKey();
    const goalRef = familyRef.collection('weeklyGoals').doc(weekKey);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      const defaultGoal = buildDefaultWeeklyGoal(members.length);
      await goalRef.set({
        weekKey,
        familyId,
        createdAt: adminSdk.firestore.FieldValue.serverTimestamp(),
        updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
        ...defaultGoal
      });
    }

    const freshGoalDoc = await goalRef.get();
    return {
      familyId,
      weekKey,
      goal: {
        id: freshGoalDoc.id,
        ...freshGoalDoc.data()
      }
    };
  };
}

const getOrCreateFamilyWeeklyGoalHandler = createGetOrCreateFamilyWeeklyGoalHandler();
exports.getOrCreateFamilyWeeklyGoal = onCall(
  secureCallableOptions(),
  getOrCreateFamilyWeeklyGoalHandler
);

function createContributeToFamilyWeeklyGoalHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;
  const getCurrentDateKey = deps.getCurrentDateKey || getDateKey;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    const amount = Math.max(1, Math.min(5, Number(request.data?.amount) || 1));
    const contributionType = String(request.data?.contributionType || 'manual_checkin').trim().slice(0, 40);

    const rateCheck = rateLimitFn(`familyGoalContribution:${userId}`, 20, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok hizli ilerliyorsunuz. Lutfen biraz bekleyin.');
    }

    const distributedRateCheck = await distributedRateLimitFn({
      dbRef,
      adminSdk,
      namespace: 'familyGoalContribution',
      identifier: userId,
      maxRequests: 100,
      windowMs: 86400000,
    });
    if (!distributedRateCheck.allowed) {
      logSecurityEvent('family_goal_daily_quota_exceeded', { userId }, 'WARNING');
      throw new HttpsError('resource-exhausted', 'Gunluk aile katki limitine ulastiniz.');
    }

    const userDoc = await dbRef.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() || {} : {};
    const familyId = isValidDocumentId(request.data?.familyId)
      ? String(request.data.familyId)
      : userData.familyId;

    if (!isValidDocumentId(familyId)) {
      throw new HttpsError('failed-precondition', 'Aktif bir aile bulunamadi.');
    }

    const familyRef = dbRef.collection('families').doc(familyId);
    const familyDoc = await familyRef.get();
    if (!familyDoc.exists) {
      throw new HttpsError('not-found', 'Aile bulunamadi.');
    }

    const familyData = familyDoc.data() || {};
    const members = Array.isArray(familyData.members) ? familyData.members.filter(isValidUid) : [];
    if (!members.includes(userId)) {
      throw new HttpsError('permission-denied', 'Bu aileye erisim izniniz yok.');
    }

    const weekKey = normalizeWeekKey(request.data?.weekKey) || getWeekKey();
    const todayKey = getCurrentDateKey();
    const goalRef = familyRef.collection('weeklyGoals').doc(weekKey);

    await dbRef.runTransaction(async (transaction) => {
      const goalDoc = await transaction.get(goalRef);
      const defaultGoal = buildDefaultWeeklyGoal(members.length);
      const goalData = goalDoc.exists
        ? goalDoc.data() || {}
        : {
            weekKey,
            familyId,
            ...defaultGoal
          };

      const contributors = goalData.contributors && typeof goalData.contributors === 'object'
        ? { ...goalData.contributors }
        : {};
      const currentValue = Math.max(0, Number(goalData.currentValue) || 0);
      const targetValue = Math.max(1, Number(goalData.targetValue) || defaultGoal.targetValue);
      const nextValue = Math.min(targetValue, currentValue + amount);
      const existingContributor = contributors[userId] && typeof contributors[userId] === 'object'
        ? contributors[userId]
        : { count: 0 };
      const contributionDates = existingContributor.contributionDates && typeof existingContributor.contributionDates === 'object'
        ? { ...existingContributor.contributionDates }
        : {};

      if (contributionDates[contributionType] === todayKey) {
        throw new HttpsError(
          'already-exists',
          'Bugun bu katki zaten kaydedildi.'
        );
      }

      contributionDates[contributionType] = todayKey;

      contributors[userId] = {
        count: Math.max(0, Number(existingContributor.count) || 0) + amount,
        lastContributionType: contributionType,
        lastContributionDateKey: todayKey,
        contributionDates,
        updatedAt: new Date().toISOString()
      };

      transaction.set(goalRef, {
        weekKey,
        familyId,
        goalType: goalData.goalType || defaultGoal.goalType,
        title: goalData.title || defaultGoal.title,
        description: goalData.description || defaultGoal.description,
        targetValue,
        currentValue: nextValue,
        status: nextValue >= targetValue ? 'completed' : 'active',
        contributors,
        lastContributionAt: adminSdk.firestore.FieldValue.serverTimestamp(),
        updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
        createdAt: goalData.createdAt || adminSdk.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });

    const freshGoalDoc = await goalRef.get();
    return {
      familyId,
      weekKey,
      goal: {
        id: freshGoalDoc.id,
        ...freshGoalDoc.data()
      }
    };
  };
}

const contributeToFamilyWeeklyGoalHandler = createContributeToFamilyWeeklyGoalHandler();
exports.contributeToFamilyWeeklyGoal = onCall(
  secureCallableOptions(),
  contributeToFamilyWeeklyGoalHandler
);

function createUpdateMiniLeaguePreferencesHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    if (!isValidUid(userId)) {
      throw new HttpsError('invalid-argument', 'Gecersiz kullanici.');
    }

    const rateCheck = rateLimitFn(`miniLeaguePrefs:${userId}`, 20, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Tercihlerinizi cok hizli degistiriyorsunuz.');
    }

    const distributedRateCheck = await distributedRateLimitFn({
      dbRef,
      adminSdk,
      namespace: 'miniLeaguePrefs',
      identifier: userId,
      maxRequests: 120,
      windowMs: 86400000,
    });
    if (!distributedRateCheck.allowed) {
      logSecurityEvent('mini_league_pref_daily_quota_exceeded', { userId }, 'WARNING');
      throw new HttpsError('resource-exhausted', 'Gunluk tercih guncelleme limitine ulastiniz.');
    }

    const preferences = sanitizeMiniLeaguePreferences(request.data?.preferences);
    await dbRef.collection('users').doc(userId).set({
      socialPreferences: {
        miniLeague: {
          ...preferences,
          updatedAt: new Date().toISOString(),
        },
      },
      updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return {
      success: true,
      preferences,
    };
  };
}

const updateMiniLeaguePreferencesHandler = createUpdateMiniLeaguePreferencesHandler();
exports.updateMiniLeaguePreferences = onCall(
  secureCallableOptions(),
  updateMiniLeaguePreferencesHandler
);

/**
 * Say amin to a dua once per user.
 */
function createPrayForDuaHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;

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

    const distributedRateCheck = await distributedRateLimitFn({
      dbRef,
      adminSdk,
      namespace: 'prayForDua',
      identifier: userId,
      maxRequests: 250,
      windowMs: 86400000,
    });
    if (!distributedRateCheck.allowed) {
      logSecurityEvent('pray_for_dua_daily_quota_exceeded', { userId, duaId }, 'WARNING');
      throw new HttpsError('resource-exhausted', 'Gunluk amin limitine ulastiniz.');
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
  secureCallableOptions(),
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
exports.onDuaUpdate = functionsV1
  .region(REGION)
  .runWith({ maxInstances: MAX_EVENT_INSTANCES })
  .firestore
  .document('duas/{duaId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

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
      data: { type: 'dua_amin', duaId: context.params.duaId },
    });

    await change.after.ref.set(
      { lastAminNotificationAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

    return result;
  });

exports.__test = {
  createJoinFamilyByInviteCodeHandler,
  createCreateDuaHandler,
  createListRecentDuasHandler,
  createPrayForDuaHandler,
  createContributeToFamilyWeeklyGoalHandler,
  createUpdateMiniLeaguePreferencesHandler,
};
