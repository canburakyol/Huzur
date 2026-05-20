import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { __test } = require('../../functions/index.js');

const NOW_MS = Date.parse('2026-03-27T12:00:00.000Z');

const fieldValue = {
  serverTimestamp: () => ({ __op: 'serverTimestamp' }),
};

const makeTimestamp = (value) => ({
  toMillis: () => value,
  toDate: () => new Date(value),
});

const adminMock = {
  firestore: {
    FieldValue: fieldValue,
    Timestamp: {
      now: () => makeTimestamp(NOW_MS),
      fromMillis: makeTimestamp,
    },
  },
};

const createFirestoreDocSnapshot = (store, path, ref) => ({
  exists: store.has(path),
  ref,
  data: () => store.get(path),
});

const createFirestoreMock = (initialDocs = {}) => {
  const store = new Map(
    Object.entries(initialDocs).map(([path, value]) => [path, value])
  );

  const createDocRef = (path) => ({
    path,
    async get() {
      return createFirestoreDocSnapshot(store, path, this);
    },
    async set(data, options = {}) {
      const current = options?.merge ? (store.get(path) || {}) : {};
      store.set(path, { ...current, ...data });
    },
    async update(data) {
      store.set(path, { ...(store.get(path) || {}), ...data });
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
  };
};

describe('Pro status with referral rewards', () => {
  it('returns Pro when only a referral reward is active', async () => {
    const dbMock = createFirestoreMock({
      'users/user-1/subscription/referralReward': {
        isPro: true,
        entitlementId: 'referral_reward',
        expiresAt: makeTimestamp(Date.parse('2026-03-27T18:00:00.000Z')),
      },
    });

    const result = await __test.readCombinedProStatus(dbMock, adminMock, 'user-1');

    expect(result).toMatchObject({
      isPro: true,
      entitlementId: 'referral_reward',
      source: 'referral_reward',
      productId: 'referral_reward_24h',
      store: 'referral',
      expiresAt: '2026-03-27T18:00:00.000Z',
    });
  });

  it('expires an old referral reward and returns non-Pro', async () => {
    const dbMock = createFirestoreMock({
      'users/user-1/subscription/referralReward': {
        isPro: true,
        entitlementId: 'referral_reward',
        expiresAt: makeTimestamp(Date.parse('2026-03-27T10:00:00.000Z')),
      },
    });

    const result = await __test.readCombinedProStatus(dbMock, adminMock, 'user-1');

    expect(result.isPro).toBe(false);
    expect(dbMock.store.get('users/user-1/subscription/referralReward').isPro).toBe(false);
  });

  it('prefers a paid subscription over a referral reward', async () => {
    const dbMock = createFirestoreMock({
      'users/user-1/subscription/status': {
        isPro: true,
        entitlementId: 'pro_access',
        productId: 'huzur_yearly',
        store: 'play_store',
        expiresAt: makeTimestamp(Date.parse('2026-04-27T12:00:00.000Z')),
      },
      'users/user-1/subscription/referralReward': {
        isPro: true,
        entitlementId: 'referral_reward',
        expiresAt: makeTimestamp(Date.parse('2026-03-27T18:00:00.000Z')),
      },
    });

    const result = await __test.readCombinedProStatus(dbMock, adminMock, 'user-1');

    expect(result).toMatchObject({
      isPro: true,
      entitlementId: 'pro_access',
      source: 'revenuecat',
      productId: 'huzur_yearly',
      store: 'play_store',
    });
  });

  it('treats expired RevenueCat entitlements as inactive', () => {
    const result = __test.resolveRevenueCatProEntitlement({
      entitlements: {
        pro_access: {
          expires_date_ms: Date.parse('2026-03-27T10:00:00.000Z'),
          product_identifier: 'huzur_monthly',
          store: 'PLAY_STORE',
        },
      },
    }, NOW_MS);

    expect(result).toMatchObject({
      active: false,
      expiresAtMs: null,
    });
  });

  it('accepts only unexpired RevenueCat entitlements as active', () => {
    const result = __test.resolveRevenueCatProEntitlement({
      entitlements: {
        pro_access: {
          expires_date_ms: Date.parse('2026-03-27T18:00:00.000Z'),
          product_identifier: 'huzur_monthly',
          store: 'PLAY_STORE',
        },
      },
    }, NOW_MS);

    expect(result).toMatchObject({
      active: true,
      expiresAtMs: Date.parse('2026-03-27T18:00:00.000Z'),
      productId: 'huzur_monthly',
      store: 'PLAY_STORE',
    });
  });
});
