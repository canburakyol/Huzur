const {
  onCall,
  HttpsError,
  admin,
  db,
  isValidUid,
  normalizeCode,
  checkRateLimit,
  checkDistributedRateLimit,
  secureCallableOptions,
} = require('../common/runtime');

const REFERRAL_REWARD_DURATION_MS = 24 * 60 * 60 * 1000;

function sanitizeIsoTimestamp(value) {
  if (!value) return null;

  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (typeof value.toMillis === 'function') {
    return new Date(value.toMillis()).toISOString();
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? new Date(value).toISOString() : null;
  }

  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

function timestampFromIso(adminSdk, isoValue) {
  const parsed = Date.parse(isoValue || '');
  if (!Number.isFinite(parsed)) return null;
  return adminSdk.firestore.Timestamp.fromMillis(parsed);
}

function buildReferralRewardGrant({ inviterId, inviteeId, conversionId, grantedAtIso, adminSdk }) {
  const grantedAtMs = Date.parse(grantedAtIso || '');
  if (!Number.isFinite(grantedAtMs)) return null;

  return {
    isPro: true,
    entitlementId: 'referral_reward',
    source: 'referral_reward',
    rewardType: 'inviter_24h_pro',
    inviterId,
    inviteeId,
    conversionId,
    grantedAt: adminSdk.firestore.Timestamp.fromMillis(grantedAtMs),
    expiresAt: adminSdk.firestore.Timestamp.fromMillis(grantedAtMs + REFERRAL_REWARD_DURATION_MS),
    updatedAt: adminSdk.firestore.FieldValue.serverTimestamp(),
  };
}

function normalizeNonNegativeInteger(value) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized < 0) return 0;
  return Math.floor(normalized);
}

function buildReferralServerSnapshot(referralSummaryData = {}, referralStateData = {}) {
  return {
    inviterSummary: {
      ownCode: normalizeCode(referralSummaryData?.ownCode, 6, 12) || '',
      inviteCreatedAt: sanitizeIsoTimestamp(referralSummaryData?.inviteCreatedAt),
      acceptedCount: normalizeNonNegativeInteger(referralSummaryData?.acceptedCount),
      onboardingCompletedCount: normalizeNonNegativeInteger(referralSummaryData?.onboardingCompletedCount),
      firstIbadahCompletedCount: normalizeNonNegativeInteger(referralSummaryData?.firstIbadahCompletedCount),
      convertedCount: normalizeNonNegativeInteger(referralSummaryData?.convertedCount),
      rewardUnlockedCount: normalizeNonNegativeInteger(referralSummaryData?.rewardUnlockedCount),
      latestInviterRewardAt: sanitizeIsoTimestamp(referralSummaryData?.latestInviterRewardAt),
    },
    inviteeSummary: {
      invitedByCode: normalizeCode(referralStateData?.invitedByCode, 6, 12) || '',
      inviteAcceptedAt: sanitizeIsoTimestamp(referralStateData?.inviteAcceptedAt),
      onboardingCompletedAt: sanitizeIsoTimestamp(referralStateData?.onboardingCompletedAt),
      firstIbadahCompletedAt: sanitizeIsoTimestamp(referralStateData?.firstIbadahCompletedAt),
      inviteeRewardUnlockedAt: sanitizeIsoTimestamp(referralStateData?.inviteeRewardUnlockedAt),
      inviterId: isValidUid(referralStateData?.inviterId) ? referralStateData.inviterId : '',
      syncIssue: typeof referralStateData?.syncIssue === 'string' ? referralStateData.syncIssue.slice(0, 40) : '',
    },
  };
}

async function readReferralServerSnapshot(dbRef, userId) {
  const [summarySnapshot, referralStateSnapshot] = await Promise.all([
    dbRef.collection('referrals').doc(userId).get(),
    dbRef.collection('users').doc(userId).collection('data').doc('referralServerState').get(),
  ]);

  return buildReferralServerSnapshot(
    summarySnapshot.exists ? summarySnapshot.data() || {} : {},
    referralStateSnapshot.exists ? referralStateSnapshot.data() || {} : {}
  );
}

function createSyncReferralStateHandler(deps = {}) {
  const dbRef = deps.db || db;
  const adminSdk = deps.admin || admin;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;
  const nowIsoFn = deps.nowIso || (() => new Date().toISOString());

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    if (!isValidUid(userId)) {
      throw new HttpsError('invalid-argument', 'Gecersiz kullanici.');
    }

    const ownCode = normalizeCode(request.data?.ownCode, 6, 12);
    const invitedByCode = normalizeCode(request.data?.invitedByCode, 6, 12);
    const inviteCreatedAt = sanitizeIsoTimestamp(request.data?.inviteCreatedAt);
    const inviteAcceptedAt = sanitizeIsoTimestamp(request.data?.inviteAcceptedAt);
    const onboardingCompletedAt = sanitizeIsoTimestamp(request.data?.onboardingCompletedAt);
    const firstIbadahCompletedAt = sanitizeIsoTimestamp(request.data?.firstIbadahCompletedAt);

    const rateCheck = rateLimitFn(`syncReferralState:${userId}`, 20, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla referral senkronizasyonu denemesi yaptiniz.');
    }

    const distributedRateCheck = await distributedRateLimitFn({
      dbRef,
      adminSdk,
      namespace: 'syncReferralState',
      identifier: userId,
      maxRequests: 120,
      windowMs: 3600000,
    });

    if (!distributedRateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Referral senkronizasyonu gecici olarak yavaslatildi.');
    }

    const fieldValue = adminSdk.firestore.FieldValue;
    const referralSummaryRef = dbRef.collection('referrals').doc(userId);
    const referralStateRef = dbRef.collection('users').doc(userId).collection('data').doc('referralServerState');

    if (ownCode) {
      await dbRef.collection('referralCodes').doc(ownCode).set({
        inviteCode: ownCode,
        inviterId: userId,
        updatedAt: fieldValue.serverTimestamp(),
        createdAt: fieldValue.serverTimestamp(),
      }, { merge: true });

      await referralSummaryRef.set({
        inviterId: userId,
        ownCode,
        inviteCreatedAt: inviteCreatedAt || null,
        updatedAt: fieldValue.serverTimestamp(),
      }, { merge: true });
    }

    if (invitedByCode) {
      const acceptedAtCandidate = inviteAcceptedAt || nowIsoFn();
      const inviterCodeSnapshot = await dbRef.collection('referralCodes').doc(invitedByCode).get();
      const inviterId = inviterCodeSnapshot.exists && isValidUid(inviterCodeSnapshot.data()?.inviterId)
        ? inviterCodeSnapshot.data().inviterId
        : null;

      if (!inviterId || inviterId === userId) {
        await referralStateRef.set({
          invitedByCode,
          inviteAcceptedAt: acceptedAtCandidate,
          onboardingCompletedAt: onboardingCompletedAt || null,
          firstIbadahCompletedAt: firstIbadahCompletedAt || null,
          inviterId: inviterId || null,
          syncIssue: inviterId === userId ? 'self_referral' : 'inviter_not_found',
          syncedAt: fieldValue.serverTimestamp(),
        }, { merge: true });
      } else {
        const inviterSummaryRef = dbRef.collection('referrals').doc(inviterId);
        const conversionRef = dbRef.collection('referralConversions').doc(`${inviterId}_${userId}`);
        const inviterRewardRef = dbRef.collection('users').doc(inviterId).collection('subscription').doc('referralReward');

        await dbRef.runTransaction(async (transaction) => {
          const [conversionSnapshot, inviterSummarySnapshot, inviteeStateSnapshot, inviterRewardSnapshot] = await Promise.all([
            transaction.get(conversionRef),
            transaction.get(inviterSummaryRef),
            transaction.get(referralStateRef),
            transaction.get(inviterRewardRef),
          ]);

          const conversionData = conversionSnapshot.exists ? conversionSnapshot.data() || {} : {};
          const inviterSummaryData = inviterSummarySnapshot.exists ? inviterSummarySnapshot.data() || {} : {};
          const inviteeStateData = inviteeStateSnapshot.exists ? inviteeStateSnapshot.data() || {} : {};
          const inviterRewardData = inviterRewardSnapshot.exists ? inviterRewardSnapshot.data() || {} : {};

          const resolvedAcceptedAt = sanitizeIsoTimestamp(conversionData?.acceptedAt)
            || sanitizeIsoTimestamp(inviteeStateData?.inviteAcceptedAt)
            || acceptedAtCandidate;
          const resolvedOnboardingAt = sanitizeIsoTimestamp(conversionData?.onboardingCompletedAt)
            || sanitizeIsoTimestamp(inviteeStateData?.onboardingCompletedAt)
            || onboardingCompletedAt;
          const resolvedFirstIbadahAt = sanitizeIsoTimestamp(conversionData?.firstIbadahCompletedAt)
            || sanitizeIsoTimestamp(inviteeStateData?.firstIbadahCompletedAt)
            || firstIbadahCompletedAt;
          const resolvedConvertedAt = sanitizeIsoTimestamp(conversionData?.convertedAt)
            || ((resolvedAcceptedAt && resolvedOnboardingAt && resolvedFirstIbadahAt) ? nowIsoFn() : null);
          const existingInviteeRewardAt = sanitizeIsoTimestamp(inviteeStateData?.inviteeRewardUnlockedAt);

          transaction.set(conversionRef, {
            inviterId,
            inviteeId: userId,
            inviteCode: invitedByCode,
            acceptedAt: resolvedAcceptedAt || null,
            onboardingCompletedAt: resolvedOnboardingAt || null,
            firstIbadahCompletedAt: resolvedFirstIbadahAt || null,
            convertedAt: resolvedConvertedAt || null,
            updatedAt: fieldValue.serverTimestamp(),
            createdAt: conversionData?.createdAt || fieldValue.serverTimestamp(),
          }, { merge: true });

          const inviterSummaryUpdate = {
            inviterId,
            ownCode: normalizeCode(inviterSummaryData?.ownCode, 6, 12) || invitedByCode,
            updatedAt: fieldValue.serverTimestamp(),
          };

          if (resolvedAcceptedAt && !sanitizeIsoTimestamp(conversionData?.acceptedAt)) {
            inviterSummaryUpdate.acceptedCount = fieldValue.increment(1);
          }

          if (resolvedOnboardingAt && !sanitizeIsoTimestamp(conversionData?.onboardingCompletedAt)) {
            inviterSummaryUpdate.onboardingCompletedCount = fieldValue.increment(1);
          }

          if (resolvedFirstIbadahAt && !sanitizeIsoTimestamp(conversionData?.firstIbadahCompletedAt)) {
            inviterSummaryUpdate.firstIbadahCompletedCount = fieldValue.increment(1);
          }

          if (resolvedConvertedAt && !sanitizeIsoTimestamp(conversionData?.convertedAt)) {
            inviterSummaryUpdate.convertedCount = fieldValue.increment(1);
            inviterSummaryUpdate.rewardUnlockedCount = fieldValue.increment(1);
            inviterSummaryUpdate.latestInviterRewardAt = resolvedConvertedAt;
          }

          transaction.set(inviterSummaryRef, inviterSummaryUpdate, { merge: true });

          transaction.set(referralStateRef, {
            invitedByCode,
            inviterId,
            inviteAcceptedAt: resolvedAcceptedAt || null,
            onboardingCompletedAt: resolvedOnboardingAt || null,
            firstIbadahCompletedAt: resolvedFirstIbadahAt || null,
            inviteeRewardUnlockedAt: resolvedConvertedAt || existingInviteeRewardAt || null,
            syncIssue: null,
            syncedAt: fieldValue.serverTimestamp(),
          }, { merge: true });

          if (resolvedConvertedAt && !sanitizeIsoTimestamp(conversionData?.rewardGrantedAt)) {
            const conversionId = `${inviterId}_${userId}`;
            const rewardGrant = buildReferralRewardGrant({
              inviterId,
              inviteeId: userId,
              conversionId,
              grantedAtIso: resolvedConvertedAt,
              adminSdk,
            });

            if (rewardGrant) {
              transaction.set(inviterRewardRef, {
                ...rewardGrant,
                createdAt: inviterRewardData?.createdAt || fieldValue.serverTimestamp(),
              }, { merge: true });
              transaction.set(conversionRef, {
                rewardGrantedAt: timestampFromIso(adminSdk, resolvedConvertedAt),
                rewardExpiresAt: rewardGrant.expiresAt,
              }, { merge: true });
            }
          }
        });
      }
    }

    const snapshot = await readReferralServerSnapshot(dbRef, userId);
    return {
      success: true,
      snapshot,
    };
  };
}

const syncReferralStateHandler = createSyncReferralStateHandler();
exports.syncReferralStateV1 = onCall(
  secureCallableOptions(),
  syncReferralStateHandler
);

function createGetReferralServerSnapshotHandler(deps = {}) {
  const dbRef = deps.db || db;
  const rateLimitFn = deps.checkRateLimit || checkRateLimit;
  const adminSdk = deps.admin || admin;
  const distributedRateLimitFn = deps.checkDistributedRateLimit || checkDistributedRateLimit;

  return async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Bu islem icin giris yapmaniz gerekiyor.');
    }

    const userId = request.auth.uid;
    if (!isValidUid(userId)) {
      throw new HttpsError('invalid-argument', 'Gecersiz kullanici.');
    }

    const rateCheck = rateLimitFn(`getReferralSnapshot:${userId}`, 30, 60000);
    if (!rateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Cok fazla referral durumu sorgulandi.');
    }

    const distributedRateCheck = await distributedRateLimitFn({
      dbRef,
      adminSdk,
      namespace: 'getReferralSnapshot',
      identifier: userId,
      maxRequests: 250,
      windowMs: 86400000,
    });
    if (!distributedRateCheck.allowed) {
      throw new HttpsError('resource-exhausted', 'Gunluk referral durum sorgu limitine ulastiniz.');
    }

    return {
      success: true,
      snapshot: await readReferralServerSnapshot(dbRef, userId),
    };
  };
}

const getReferralServerSnapshotHandler = createGetReferralServerSnapshotHandler();
exports.getReferralServerSnapshotV1 = onCall(
  secureCallableOptions(),
  getReferralServerSnapshotHandler
);

exports.__test = {
  createSyncReferralStateHandler,
  createGetReferralServerSnapshotHandler,
  buildReferralServerSnapshot,
  buildReferralRewardGrant,
  REFERRAL_REWARD_DURATION_MS,
};
