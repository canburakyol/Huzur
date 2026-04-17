import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { __test } = require('../../functions/index.js');

const fieldValue = {
  increment: (value) => ({ __op: 'increment', value }),
  serverTimestamp: () => ({ __op: 'serverTimestamp' }),
};

const adminMock = {
  firestore: {
    FieldValue: fieldValue,
  },
};

const allowRateLimit = () => ({
  allowed: true,
  remaining: 9,
  resetAt: Date.now() + 60_000,
});

const allowDistributedRateLimit = async () => ({
  allowed: true,
  remaining: 99,
  resetAt: Date.now() + 60_000,
});

const isPlainObject = (value) => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !('__op' in value)
);

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const mergeData = (existing = {}, patch = {}) => {
  const next = { ...(existing || {}) };

  Object.entries(patch || {}).forEach(([key, value]) => {
    if (value && typeof value === 'object' && value.__op === 'increment') {
      next[key] = (Number(next[key]) || 0) + value.value;
      return;
    }

    if (value && typeof value === 'object' && value.__op === 'serverTimestamp') {
      next[key] = '2026-03-27T12:00:00.000Z';
      return;
    }

    if (isPlainObject(value) && isPlainObject(next[key])) {
      next[key] = mergeData(next[key], value);
      return;
    }

    next[key] = value;
  });

  return next;
};

const createFirestoreDocSnapshot = (store, path) => ({
  exists: store.has(path),
  data: () => {
    const value = store.get(path);
    return value ? deepClone(value) : undefined;
  },
});

const createFirestoreMock = (initialDocs = {}) => {
  const store = new Map(
    Object.entries(initialDocs).map(([path, value]) => [path, deepClone(value)])
  );

  const createDocRef = (path) => ({
    path,
    async get() {
      return createFirestoreDocSnapshot(store, path);
    },
    async set(data, options = {}) {
      const current = options?.merge ? (store.get(path) || {}) : {};
      store.set(path, mergeData(current, data));
    },
    collection(name) {
      return createCollectionRef(`${path}/${name}`);
    },
  });

  const createCollectionRef = (path) => ({
    doc(id) {
      return createDocRef(`${path}/${id}`);
    },
  });

  return {
    store,
    collection(name) {
      return createCollectionRef(name);
    },
    async runTransaction(callback) {
      const transaction = {
        async get(ref) {
          return ref.get();
        },
        set(ref, data, options) {
          return ref.set(data, options);
        },
        update(ref, data) {
          return ref.set(data, { merge: true });
        },
      };

      return callback(transaction);
    },
  };
};

describe('Referral server sync handlers', () => {
  it('registers own invite code and returns inviter summary', async () => {
    const dbMock = createFirestoreMock();
    const handler = __test.createSyncReferralStateHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
      checkDistributedRateLimit: allowDistributedRateLimit,
      nowIso: () => '2026-03-27T12:00:00.000Z',
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: {
        ownCode: 'HZRLOCAL1',
        inviteCreatedAt: '2026-03-27T11:30:00.000Z',
      },
    });

    expect(result.success).toBe(true);
    expect(result.snapshot.inviterSummary).toMatchObject({
      ownCode: 'HZRLOCAL1',
      inviteCreatedAt: '2026-03-27T11:30:00.000Z',
      acceptedCount: 0,
      onboardingCompletedCount: 0,
      firstIbadahCompletedCount: 0,
      convertedCount: 0,
      rewardUnlockedCount: 0,
    });
    expect(dbMock.store.get('referralCodes/HZRLOCAL1')).toMatchObject({
      inviteCode: 'HZRLOCAL1',
      inviterId: 'user-1',
    });
    expect(dbMock.store.get('referrals/user-1')).toMatchObject({
      inviterId: 'user-1',
      ownCode: 'HZRLOCAL1',
      inviteCreatedAt: '2026-03-27T11:30:00.000Z',
    });
  });

  it('increments accepted and converted counts only once for the same invitee', async () => {
    const dbMock = createFirestoreMock({
      'referralCodes/HZRFRIEND1': {
        inviteCode: 'HZRFRIEND1',
        inviterId: 'inviter-1',
      },
      'referrals/inviter-1': {
        inviterId: 'inviter-1',
        ownCode: 'HZRFRIEND1',
        acceptedCount: 0,
        convertedCount: 0,
      },
    });

    const handler = __test.createSyncReferralStateHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
      checkDistributedRateLimit: allowDistributedRateLimit,
      nowIso: () => '2026-03-27T12:00:00.000Z',
    });

    const request = {
      auth: { uid: 'invitee-1' },
      data: {
        invitedByCode: 'HZRFRIEND1',
        inviteAcceptedAt: '2026-03-27T11:00:00.000Z',
        onboardingCompletedAt: '2026-03-27T11:05:00.000Z',
        firstIbadahCompletedAt: '2026-03-27T11:10:00.000Z',
      },
    };

    const firstResult = await handler(request);
    const secondResult = await handler(request);

    expect(firstResult.success).toBe(true);
    expect(secondResult.success).toBe(true);

    expect(dbMock.store.get('referrals/inviter-1')).toMatchObject({
      acceptedCount: 1,
      onboardingCompletedCount: 1,
      firstIbadahCompletedCount: 1,
      convertedCount: 1,
      rewardUnlockedCount: 1,
      latestInviterRewardAt: '2026-03-27T12:00:00.000Z',
    });
    expect(dbMock.store.get('users/invitee-1/data/referralServerState')).toMatchObject({
      invitedByCode: 'HZRFRIEND1',
      inviteeRewardUnlockedAt: '2026-03-27T12:00:00.000Z',
      inviterId: 'inviter-1',
      syncIssue: null,
    });
    expect(firstResult.snapshot.inviteeSummary.inviteeRewardUnlockedAt).toBe('2026-03-27T12:00:00.000Z');
  });
});
