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

const allowDistributedRateLimit = async () => ({
  allowed: true,
  remaining: 99,
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

const buildCreateDuaDb = ({ fingerprintLastSeenAtMs = 0 } = {}) => {
  const writes = [];
  const duaRef = {
    id: 'dua-new',
    path: 'duas/dua-new',
  };
  const fingerprintRef = { path: 'users/user-1/security/dua-fingerprint' };

  return {
    writes,
    collection(name) {
      if (name !== 'duas') {
        if (name === 'users') {
          return {
            doc(id) {
              expect(id).toBe('user-1');
              return {
                collection(subcollection) {
                  expect(subcollection).toBe('security');
                  return {
                    doc(docId) {
                      expect(docId.startsWith('dua-')).toBe(true);
                      return fingerprintRef;
                    },
                  };
                },
              };
            },
          };
        }
        throw new Error(`Unexpected collection: ${name}`);
      }

      return {
        doc() {
          return duaRef;
        },
      };
    },
    async runTransaction(callback) {
      const transaction = {
        async get(ref) {
          expect(ref).toBe(fingerprintRef);
          return {
            exists: fingerprintLastSeenAtMs > 0,
            data: () => ({ lastSeenAtMs: fingerprintLastSeenAtMs }),
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

const buildListRecentDuasDb = ({ docs }) => ({
  collection(name) {
    if (name !== 'duas') {
      throw new Error(`Unexpected collection: ${name}`);
    }

    return {
      orderBy(field, direction) {
        expect(field).toBe('createdAt');
        expect(direction).toBe('desc');
        return {
          limit(limitCount) {
            expect(limitCount).toBe(2);
            return {
              async get() {
                return { docs };
              },
            };
          },
        };
      },
    };
  },
});

const buildCreateHatimDb = () => {
  const writes = [];
  const hatimRef = {
    id: 'hatim-new',
    path: 'hatims/hatim-new',
    async set(data) {
      writes.push({ ref: hatimRef, data });
    },
  };

  return {
    writes,
    collection(name) {
      if (name !== 'hatims') {
        throw new Error(`Unexpected collection: ${name}`);
      }

      return {
        doc() {
          return hatimRef;
        },
      };
    },
  };
};

const buildUpdateHatimPartDb = ({ hatimData }) => {
  const updates = [];
  const hatimRef = { path: 'hatims/hatim-1' };

  return {
    updates,
    collection(name) {
      if (name !== 'hatims') {
        throw new Error(`Unexpected collection: ${name}`);
      }

      return {
        doc(id) {
          expect(id).toBe('hatim-1');
          return hatimRef;
        },
      };
    },
    async runTransaction(callback) {
      const transaction = {
        async get(ref) {
          expect(ref).toBe(hatimRef);
          return {
            exists: true,
            data: () => hatimData,
          };
        },
        update(ref, data) {
          updates.push({ ref, data });
        },
      };

      return callback(transaction);
    },
  };
};

const buildMiniLeaguePreferencesDb = () => {
  const writes = [];
  const userRef = { path: 'users/user-1' };

  return {
    writes,
    collection(name) {
      if (name !== 'users') {
        throw new Error(`Unexpected collection: ${name}`);
      }

      return {
        doc(id) {
          expect(id).toBe('user-1');
          return {
            set(data, options) {
              writes.push({ ref: userRef, data, options });
              return Promise.resolve();
            },
          };
        },
      };
    },
  };
};

const buildFamilyWeeklyGoalDb = ({
  userFamilyId = 'family-1',
  familyMembers = ['user-1', 'user-2'],
  goalData = null,
} = {}) => {
  const writes = [];
  const goalRef = { path: 'families/family-1/weeklyGoals/2026-03-23' };

  return {
    writes,
    collection(name) {
      if (name === 'users') {
        return {
          doc() {
            return {
              async get() {
                return {
                  exists: true,
                  data: () => ({ familyId: userFamilyId }),
                };
              },
            };
          },
        };
      }

      if (name === 'families') {
        return {
          doc(id) {
            expect(id).toBe(userFamilyId);
            return {
              async get() {
                return {
                  exists: true,
                  data: () => ({ members: familyMembers }),
                };
              },
              collection(subcollection) {
                expect(subcollection).toBe('weeklyGoals');
                return {
                  doc(docId) {
                    expect(docId).toBe('2026-03-17');
                    return goalRef;
                  },
                };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected collection: ${name}`);
    },
    async runTransaction(callback) {
      const transaction = {
        async get(ref) {
          expect(ref).toBe(goalRef);
          return {
            exists: goalData !== null,
            data: () => goalData,
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
      checkDistributedRateLimit: allowDistributedRateLimit,
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
      checkDistributedRateLimit: allowDistributedRateLimit,
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
      checkDistributedRateLimit: allowDistributedRateLimit,
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
      checkDistributedRateLimit: allowDistributedRateLimit,
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
      checkDistributedRateLimit: allowDistributedRateLimit,
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
      checkDistributedRateLimit: allowDistributedRateLimit,
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
      checkDistributedRateLimit: allowDistributedRateLimit,
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

  it('creates a dua through the callable instead of trusting direct client writes', async () => {
    const dbMock = buildCreateDuaDb();
    const handler = __test.createCreateDuaHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
      checkDistributedRateLimit: allowDistributedRateLimit,
      nowMs: () => 1700000000000,
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: {
        text: 'Saglik ve huzur icin dua bekliyorum.',
        isAnonymous: false,
        authorName: 'Can',
      },
    });

    expect(result.success).toBe(true);
    expect(result.dua).toMatchObject({
      id: 'dua-new',
      text: 'Saglik ve huzur icin dua bekliyorum.',
      authorName: 'Can',
      aminCount: 0,
      featured: false,
    });
    expect(typeof result.dua.createdAtMs).toBe('number');
    expect(dbMock.writes).toHaveLength(2);
    expect(dbMock.writes[0].data).toMatchObject({
      text: 'Saglik ve huzur icin dua bekliyorum.',
      textFingerprint: expect.any(String),
      isAnonymous: false,
      authorId: 'user-1',
      authorName: 'Can',
      aminCount: 0,
      featured: false,
    });
    expect(dbMock.writes[1].options).toEqual({ merge: true });
  });

  it('blocks duplicate dua text fingerprints during the dedup window', async () => {
    const dbMock = buildCreateDuaDb({
      fingerprintLastSeenAtMs: 1700000000000,
    });
    const handler = __test.createCreateDuaHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
      checkDistributedRateLimit: allowDistributedRateLimit,
      nowMs: () => 1700000005000,
    });

    await expect(
      handler({
        auth: { uid: 'user-1' },
        data: {
          text: 'Saglik ve huzur icin dua bekliyorum.',
          isAnonymous: false,
          authorName: 'Can',
        },
      })
    ).rejects.toMatchObject({
      code: 'already-exists',
    });
  });

  it('lists recent duas through the callable with sanitized public payloads', async () => {
    const dbMock = buildListRecentDuasDb({
      docs: [
        {
          id: 'dua-1',
          data: () => ({
            text: 'Allah sifa versin.',
            isAnonymous: true,
            authorName: 'Ignored',
            aminCount: 7,
            createdAt: 1700000000000,
            featured: true,
          }),
        },
        {
          id: 'dua-2',
          data: () => ({
            text: 'Ailem icin dua bekliyorum.',
            isAnonymous: false,
            authorName: 'Ayse',
            aminCount: 2,
            createdAt: 1700000001000,
            featured: false,
          }),
        },
      ],
    });
    const handler = __test.createListRecentDuasHandler({
      db: dbMock,
      checkRateLimit: allowRateLimit,
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: { limitCount: 2 },
    });

    expect(result).toEqual({
      duas: [
        {
          id: 'dua-1',
          text: 'Allah sifa versin.',
          isAnonymous: true,
          authorName: 'Bir Mumin',
          aminCount: 7,
          createdAtMs: 1700000000000,
          featured: true,
        },
        {
          id: 'dua-2',
          text: 'Ailem icin dua bekliyorum.',
          isAnonymous: false,
          authorName: 'Ayse',
          aminCount: 2,
          createdAtMs: 1700000001000,
          featured: false,
        },
      ],
    });
  });

  it('creates a group hatim through the callable with server-managed fields', async () => {
    const dbMock = buildCreateHatimDb();
    const handler = __test.createCreateGroupHatimHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
      checkDistributedRateLimit: allowDistributedRateLimit,
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: {
        name: 'Cuma Hatmi',
        description: 'Bu hafta topluca okuyalim.',
        totalParts: 5,
      },
    });

    expect(result.success).toBe(true);
    expect(result.hatimId).toBe('hatim-new');
    expect(result.joinCode).toMatch(/^[A-Z0-9]{6}$/);
    expect(dbMock.writes).toHaveLength(1);
    expect(dbMock.writes[0].data).toMatchObject({
      id: 'hatim-new',
      type: 'group',
      name: 'Cuma Hatmi',
      description: 'Bu hafta topluca okuyalim.',
      createdBy: 'user-1',
      readers: ['user-1'],
      isPrivate: false,
      isDiscoverable: true,
      completedParts: 0,
      totalParts: 5,
    });
    expect(Object.keys(dbMock.writes[0].data.parts)).toHaveLength(5);
  });

  it('updates a hatim part through the callable transaction', async () => {
    const dbMock = buildUpdateHatimPartDb({
      hatimData: {
        readers: ['user-1'],
        parts: {
          '3': {
            status: 'free',
            takenBy: null,
            takenAt: null,
            completedAt: null,
          },
        },
      },
    });
    const handler = __test.createUpdateHatimPartHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
      checkDistributedRateLimit: allowDistributedRateLimit,
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: {
        hatimId: 'hatim-1',
        partNumber: 3,
        status: 'taken',
        userProfile: { name: 'Ali' },
      },
    });

    expect(result.success).toBe(true);
    expect(result.completedParts).toBe(0);
    expect(result.part).toMatchObject({
      status: 'taken',
      takenBy: { uid: 'user-1', name: 'Ali' },
      completedAt: null,
    });
    expect(dbMock.updates).toHaveLength(1);
    expect(dbMock.updates[0]).toMatchObject({
      ref: { path: 'hatims/hatim-1' },
      data: {
        completedParts: 0,
        readers: {
          __op: 'arrayUnion',
          values: ['user-1'],
        },
        'parts.3': {
          status: 'taken',
          takenBy: { uid: 'user-1', name: 'Ali' },
          completedAt: null,
        },
      },
    });
    expect(typeof dbMock.updates[0].data['parts.3'].takenAt).toBe('string');
  });

  it('throws unauthenticated for protected handlers without auth context', async () => {
    const handler = __test.createSyncFcmTokenHandler({
      db: buildSyncTokenDb(),
      admin: adminMock,
      checkRateLimit: allowRateLimit,
      checkDistributedRateLimit: allowDistributedRateLimit,
    });

    await expect(
      handler({ auth: null, data: { token: 'token-a-valid-12345678901234567890' } })
    ).rejects.toMatchObject({
      code: 'unauthenticated',
    });
  });

  it('rejects duplicate family goal contributions for the same day and type', async () => {
    const dbMock = buildFamilyWeeklyGoalDb({
      goalData: {
        goalType: 'active_days',
        title: 'Haftalik aile odagi',
        description: 'Test goal',
        targetValue: 8,
        currentValue: 3,
        contributors: {
          'user-1': {
            count: 1,
            contributionDates: {
              manual_checkin: '2026-03-24',
            },
          },
        },
      },
    });

    const handler = __test.createContributeToFamilyWeeklyGoalHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
      checkDistributedRateLimit: allowDistributedRateLimit,
      getCurrentDateKey: () => '2026-03-24',
    });

    await expect(
      handler({
        auth: { uid: 'user-1' },
        data: { amount: 1, contributionType: 'manual_checkin', weekKey: '2026-03-17' },
      })
    ).rejects.toMatchObject({
      code: 'already-exists',
    });

    expect(dbMock.writes).toHaveLength(0);
  });

  it('persists mini league preferences through a callable instead of trusting direct client writes', async () => {
    const dbMock = buildMiniLeaguePreferencesDb();
    const handler = __test.createUpdateMiniLeaguePreferencesHandler({
      db: dbMock,
      admin: adminMock,
      checkRateLimit: allowRateLimit,
      checkDistributedRateLimit: allowDistributedRateLimit,
    });

    const result = await handler({
      auth: { uid: 'user-1' },
      data: {
        preferences: {
          optedIn: true,
          visibilityMode: 'league',
        },
      },
    });

    expect(result).toEqual({
      success: true,
      preferences: {
        optedIn: true,
        visibilityMode: 'league',
      },
    });
    expect(dbMock.writes).toHaveLength(1);
    expect(dbMock.writes[0].data.socialPreferences.miniLeague).toMatchObject({
      optedIn: true,
      visibilityMode: 'league',
    });
    expect(dbMock.writes[0].options).toEqual({ merge: true });
  });
});
