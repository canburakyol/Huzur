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
        familyId: 'family-1',
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

  it('allows authenticated users to create duas with safe content', async () => {
    const firestore = testEnv.authenticatedContext('dua-author').firestore();
    await assertSucceeds(
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

  it('allows authors to delete their own duas and blocks others', async () => {
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

    await assertSucceeds(deleteDoc(doc(authorFirestore, 'duas', 'dua-1')));
  });
});
