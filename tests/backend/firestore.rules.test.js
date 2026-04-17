import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const PROJECT_ID = 'huzur-backend-tests';

const getEmulatorHostConfig = () => {
  const hostValue = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
  const [host, portValue] = hostValue.split(':');
  return {
    host,
    port: Number(portValue || '8080'),
  };
};

const docRefFromPath = (firestore, path) => doc(firestore, ...path.split('/'));

const seedDocs = async (testEnv, docs) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const firestore = context.firestore();
    for (const [path, value] of Object.entries(docs)) {
      await setDoc(docRefFromPath(firestore, path), value);
    }
  });
};

describe('Firestore security rules', () => {
  let testEnv;

  beforeAll(async () => {
    const { host, port } = getEmulatorHostConfig();
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host,
        port,
        rules: readFileSync(join(process.cwd(), 'firestore.rules'), 'utf8'),
      },
    });
  });

  afterEach(async () => {
    await testEnv.clearFirestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('allows owners to create their user document without server-managed fields', async () => {
    const firestore = testEnv.authenticatedContext('user-alpha').firestore();
    await assertSucceeds(
      setDoc(doc(firestore, 'users', 'user-alpha'), {
        displayName: 'Ali',
        city: 'Istanbul',
      })
    );
  });

  it('denies owners from writing fcmTokens directly', async () => {
    const firestore = testEnv.authenticatedContext('user-alpha').firestore();

    await assertFails(
      setDoc(doc(firestore, 'users', 'user-alpha'), {
        displayName: 'Ali',
        fcmTokens: ['token-direct-write'],
      })
    );

    await seedDocs(testEnv, {
      'users/user-alpha': {
        displayName: 'Ali',
      },
    });

    await assertFails(
      updateDoc(doc(firestore, 'users', 'user-alpha'), {
        fcmTokens: ['token-direct-write'],
      })
    );
  });

  it('denies owners from writing server-managed social and progression fields directly', async () => {
    const firestore = testEnv.authenticatedContext('user-alpha').firestore();

    await seedDocs(testEnv, {
      'users/user-alpha': {
        displayName: 'Ali',
      },
    });

    await assertFails(
      updateDoc(doc(firestore, 'users', 'user-alpha'), {
        socialPreferences: {
          miniLeague: {
            optedIn: true,
            visibilityMode: 'league',
          },
        },
      })
    );

    await assertFails(
      updateDoc(doc(firestore, 'users', 'user-alpha'), {
        streaks: {
          prayer_count: 999,
        },
      })
    );
  });

  it('allows owners to read their dua amin docs but denies client writes', async () => {
    await seedDocs(testEnv, {
      'users/user-alpha': {
        displayName: 'Ali',
      },
      'users/user-alpha/duaAmins/dua-1': {
        duaId: 'dua-1',
      },
    });

    const ownerFirestore = testEnv.authenticatedContext('user-alpha').firestore();
    const otherFirestore = testEnv.authenticatedContext('user-beta').firestore();

    await assertSucceeds(getDoc(doc(ownerFirestore, 'users', 'user-alpha', 'duaAmins', 'dua-1')));

    await assertFails(
      setDoc(doc(ownerFirestore, 'users', 'user-alpha', 'duaAmins', 'dua-2'), {
        duaId: 'dua-2',
      })
    );

    await assertFails(getDoc(doc(otherFirestore, 'users', 'user-alpha', 'duaAmins', 'dua-1')));
  });

  it('denies direct client dua creation even with safe content', async () => {
    const firestore = testEnv.authenticatedContext('dua-author').firestore();
    await assertFails(
      setDoc(doc(firestore, 'duas', 'dua-safe'), {
        text: 'Allah rizasi icin dua bekliyorum.',
        authorId: 'dua-author',
        authorName: 'Bir Mumin',
        isAnonymous: false,
        aminCount: 0,
      })
    );
  });

  it('denies direct client amin increments on existing duas', async () => {
    await seedDocs(testEnv, {
      'duas/dua-1': {
        text: 'Saglik icin dua bekliyorum.',
        authorId: 'dua-author',
        authorName: 'Bir Mumin',
        isAnonymous: false,
        aminCount: 0,
      },
    });

    const firestore = testEnv.authenticatedContext('dua-reader').firestore();
    await assertFails(
      updateDoc(doc(firestore, 'duas', 'dua-1'), {
        aminCount: 1,
      })
    );
  });

  it('denies direct client dua deletes for both authors and others', async () => {
    await seedDocs(testEnv, {
      'duas/dua-1': {
        text: 'Hayirli bir haber icin dua.',
        authorId: 'dua-author',
        authorName: 'Bir Mumin',
        isAnonymous: false,
        aminCount: 0,
      },
    });

    const authorFirestore = testEnv.authenticatedContext('dua-author').firestore();
    const otherFirestore = testEnv.authenticatedContext('other-user').firestore();

    await assertFails(deleteDoc(doc(otherFirestore, 'duas', 'dua-1')));
    await assertFails(deleteDoc(doc(authorFirestore, 'duas', 'dua-1')));
  });

  it('allows hatim members to read but denies all direct hatim writes', async () => {
    await seedDocs(testEnv, {
      'hatims/hatim-1': {
        name: 'Topluluk Hatmi',
        createdBy: 'user-alpha',
        readers: ['user-alpha'],
        parts: {
          '1': {
            status: 'free',
            takenBy: null,
            takenAt: null,
            completedAt: null,
          },
        },
        totalParts: 30,
        completedParts: 0,
        joinCode: 'ABC123',
        isPrivate: false,
      },
    });

    const ownerFirestore = testEnv.authenticatedContext('user-alpha').firestore();
    const otherFirestore = testEnv.authenticatedContext('user-beta').firestore();

    await assertSucceeds(getDoc(doc(ownerFirestore, 'hatims', 'hatim-1')));
    await assertFails(getDoc(doc(otherFirestore, 'hatims', 'hatim-1')));

    await assertFails(
      setDoc(doc(ownerFirestore, 'hatims', 'hatim-2'), {
        name: 'Yeni Hatim',
        createdBy: 'user-alpha',
        readers: ['user-alpha'],
      })
    );

    await assertFails(
      updateDoc(doc(ownerFirestore, 'hatims', 'hatim-1'), {
        completedParts: 1,
      })
    );

    await assertFails(deleteDoc(doc(ownerFirestore, 'hatims', 'hatim-1')));
  });

  it('denies direct family and family group writes from clients', async () => {
    const firestore = testEnv.authenticatedContext('user-alpha').firestore();

    await assertFails(
      setDoc(doc(firestore, 'families', 'family-1'), {
        name: 'Bizim Aile',
        adminId: 'user-alpha',
        members: ['user-alpha'],
      })
    );

    await seedDocs(testEnv, {
      'familyGroups/group-1': {
        name: 'Aksam Zikri',
        createdBy: 'user-alpha',
        memberIds: ['user-alpha'],
      },
    });

    await assertFails(
      updateDoc(doc(firestore, 'familyGroups', 'group-1'), {
        name: 'Yeni Ad',
      })
    );
  });
});
