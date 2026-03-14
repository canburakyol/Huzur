import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { __test } = require('../../functions/index.js');

const fieldValue = {
  arrayUnion: (...values) => ({ __op: 'arrayUnion', values }),
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
  resetAt: Date.now() + 60000,
});

const buildJoinFamilyDb = ({ familyDocData, familyId = 'family-1' }) => {
  const operations = [];
  const familyRef = { path: `families/${familyId}` };
  const userRef = { path: 'users/user-1' };

  return {
    operations,
    collection(name) {
      if (name === 'families') {
        return {
          where(field, op, value) {
            expect(field).toBe('inviteCode');
            expect(op).toBe('==');
            expect(value).toBe('ABCDEFGH');
            return {
              limit(limitCount) {
                expect(limitCount).toBe(1);
                return {
                  async get() {
                    return {
                      empty: !familyDocData,
                      docs: familyDocData
                        ? [
                            {
                              id: familyId,
                              ref: familyRef,
                              data: () => familyDocData,
                            },
                          ]
                        : [],
                    };
                  },
                };
              },
            };
          },
        };
      }

      if (name === 'users') {
        return {
          doc() {
            return userRef;
          },
        };
      }

      throw new Error(`Unexpected collection: ${name}`);
    },
    batch() {
      return {
        update(ref, data) {
          operations.push({ type: 'update', ref, data });
        },
        set(ref, data, options) {
          operations.push({ type: 'set', ref, data, options });
        },
        async commit() {
          operations.push({ type: 'commit' });
        },
      };
    },
  };
};

const buildJoinHatimDb = ({ hatimData, hatimId = 'hatim-1' }) => {
  const updates = [];
  const hatimRef = {
    path: `hatims/${hatimId}`,
    async update(data) {
      updates.push(data);
    },
  };

  return {
    updates,
    collection(name) {
      if (name !== 'hatims') {
        throw new Error(`Unexpected collection: ${name}`);
      }

      return {
        where(field, op, value) {
          expect(field).toBe('joinCode');
          expect(op).toBe('==');
          expect(value).toBe('JOIN42');
          return {
            limit(limitCount) {
              expect(limitCount).toBe(1);
              return {
                async get() {
                  return {
                    empty: !hatimData,
                    docs: hatimData
                      ? [
                          {
                            id: hatimId,
                            ref: hatimRef,
                            data: () => hatimData,
                          },
                        ]
                      : [],
                  };
                },
              };
            },
          };
        },
      };
    },
  };
};

const buildSyncTokenDb = ({ existingTokens = [] } = {}) => {
  const writes = [];
  const userRef = { path: 'users/user-1' };

  return {
    writes,
    collection(name) {
      if (name !== 'users') {
        throw new Error(`Unexpected collection: ${name}`);
      }

      return {
        doc() {
          return userRef;
        },
      };
    },
    async runTransaction(callback) {
      const transaction = {
        async get() {
          return {
            data: () => ({
              fcmTokens: existingTokens,
            }),
          };
        },
        set(ref, data, options) {
          writes.push({ ref, data, options });
        },
      };

      return callback(transaction);
    },
  };
};

const buildPrayForDuaDb = ({ aminCount = 0, alreadyPrayed = false } = {}) => {
  const writes = [];
  const duaRef = { path: 'duas/dua-1' };
  const userAminRef = { path: 'users/user-1/duaAmins/dua-1' };
  const userRef = {
    path: 'users/user-1',
    collection(name) {
      if (name !== 'duaAmins') {
        throw new Error(`Unexpected subcollection: ${name}`);
      }

      return {
        doc() {
          return userAminRef;
        },
      };
    },
  };

  return {
    writes,
    collection(name) {
      if (name === 'duas') {
        return {
          doc() {
            return duaRef;
          },
        };
      }

      if (name === 'users') {
        return {
          doc() {
            return userRef;
          },
        };
      }

      throw new Error(`Unexpected collection: ${name}`);
    },
    async runTransaction(callback) {
      const transaction = {
        async get(ref) {
          if (ref === duaRef) {
            return {
              exists: true,
              data: () => ({ aminCount }),
            };
          }

          return {
            exists: alreadyPrayed,
            data: () => ({ duaId: 'dua-1' }),
          };
        },
        set(ref, data) {
          writes.push({ type: 'set', ref, data });
        },
        update(ref, data) {
          writes.push({ type: 'update', ref, data });
        },
      };

      return callback(transaction);
    },
  };
};

describe('Cloud Functions callable handlers', () => {
  it('joins a family by invite code and batches the expected writes', async () => {
    const dbMock = buildJoinFamilyDb({
      familyDocData: {
        members: ['owner-1'],
      },
    });
    const handler = __test.createJoinFamilyByInviteCodeHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: { inviteCode: 'ab-cd-ef-gh' },
    });

    expect(result).toEqual({
      success: true,
      familyId: 'family-1',
      alreadyMember: false,
    });
    expect(dbMock.operations).toHaveLength(3);
    expect(dbMock.operations[0].type).toBe('update');
    expect(dbMock.operations[1].type).toBe('set');
    expect(dbMock.operations[2].type).toBe('commit');
  });

  it('returns alreadyMember when the user is already in the family', async () => {
    const dbMock = buildJoinFamilyDb({
      familyDocData: {
        members: ['user-1'],
      },
    });
    const handler = __test.createJoinFamilyByInviteCodeHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: { inviteCode: 'ABCDEFGH' },
    });

    expect(result).toEqual({
      success: true,
      familyId: 'family-1',
      alreadyMember: true,
    });
    expect(dbMock.operations).toHaveLength(0);
  });

  it('joins a group hatim and writes a reader update', async () => {
    const dbMock = buildJoinHatimDb({
      hatimData: {
        type: 'group',
        readers: ['owner-1'],
      },
    });
    const handler = __test.createJoinHatimByCodeHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: { code: 'join42' },
    });

    expect(result).toEqual({
      success: true,
      hatimId: 'hatim-1',
      alreadyJoined: false,
    });
    expect(dbMock.updates).toHaveLength(1);
    expect(dbMock.updates[0].readers).toEqual({
      __op: 'arrayUnion',
      values: ['user-1'],
    });
  });

  it('rejects non-group hatim joins', async () => {
    const dbMock = buildJoinHatimDb({
      hatimData: {
        type: 'personal',
        readers: [],
      },
    });
    const handler = __test.createJoinHatimByCodeHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
    });

    await expect(
      handler({
        auth: { uid: 'user-1' },
        data: { code: 'JOIN42' },
      })
    ).rejects.toMatchObject({
      code: 'failed-precondition',
    });
  });

  it('deduplicates synced FCM tokens and keeps the newest token first', async () => {
    const dbMock = buildSyncTokenDb({
      existingTokens: [
        'token-b-valid-12345678901234567890',
        'token-a-valid-12345678901234567890',
        'token-c-valid-12345678901234567890',
      ],
    });
    const handler = __test.createSyncFcmTokenHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: { token: 'token-a-valid-12345678901234567890' },
    });

    expect(result.success).toBe(true);
    expect(dbMock.writes).toHaveLength(1);
    expect(dbMock.writes[0].data.fcmTokens[0]).toBe('token-a-valid-12345678901234567890');
    expect(dbMock.writes[0].data.fcmTokens).toContain('token-b-valid-12345678901234567890');
    expect(dbMock.writes[0].options).toEqual({ merge: true });
  });

  it('records the first amin and increments dua count once', async () => {
    const dbMock = buildPrayForDuaDb({
      aminCount: 4,
      alreadyPrayed: false,
    });
    const handler = __test.createPrayForDuaHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: { duaId: 'dua-1' },
    });

    expect(result).toEqual({
      success: true,
      alreadyPrayed: false,
      aminCount: 5,
    });
    expect(dbMock.writes).toHaveLength(2);
    expect(dbMock.writes[0].type).toBe('set');
    expect(dbMock.writes[1]).toEqual({
      type: 'update',
      ref: { path: 'duas/dua-1' },
      data: {
        aminCount: {
          __op: 'increment',
          value: 1,
        },
      },
    });
  });

  it('returns alreadyPrayed without mutating data on duplicate amin', async () => {
    const dbMock = buildPrayForDuaDb({
      aminCount: 7,
      alreadyPrayed: true,
    });
    const handler = __test.createPrayForDuaHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: { duaId: 'dua-1' },
    });

    expect(result).toEqual({
      success: true,
      alreadyPrayed: true,
      aminCount: 7,
    });
    expect(dbMock.writes).toHaveLength(0);
  });

  it('throws unauthenticated for protected handlers without auth context', async () => {
    const handler = __test.createSyncFcmTokenHandler({
      db: buildSyncTokenDb(),
      admin: adminMock,
      checkRateLimit: allowRateLimit,
    });

    await expect(
      handler({ auth: null, data: { token: 'token-a-valid-12345678901234567890' } })
    ).rejects.toMatchObject({
      code: 'unauthenticated',
    });
  });
});
