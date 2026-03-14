import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, getFunctionsInstance } from './firebase';
import { getCurrentUserIdEnsured } from './authService';
import { logger } from '../utils/logger';

const COLLECTION_DUAS = 'duas';

const callDuaFunction = async (name, payload) => {
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return result.data;
};

export const duaService = {
  async createDua(text, isAnonymous, authorName) {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const duaData = {
        text,
        isAnonymous,
        authorId: userId,
        authorName: isAnonymous ? 'Bir Mumin' : (authorName || 'Isimsiz'),
        createdAt: serverTimestamp(),
        aminCount: 0,
      };

      const docRef = await addDoc(collection(db, COLLECTION_DUAS), duaData);
      logger.log('[DuaService] Dua created:', docRef.id);
      return docRef.id;
    } catch (error) {
      logger.error('[DuaService] Create dua error:', error);
      throw error;
    }
  },

  async getRecentDuas(limitCount = 20) {
    try {
      const duaQuery = query(
        collection(db, COLLECTION_DUAS),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(duaQuery);
      return querySnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
    } catch (error) {
      logger.error('[DuaService] Get duas error:', error);
      return [];
    }
  },

  async prayForDua(duaId) {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await callDuaFunction('prayForDua', { duaId });
      logger.log('[DuaService] Prayed for dua:', duaId);
      return result;
    } catch (error) {
      logger.error('[DuaService] Pray error:', error);
      throw error;
    }
  },
};

export default duaService;
