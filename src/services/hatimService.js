import { httpsCallable } from 'firebase/functions';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db, getFunctionsInstance } from './firebase';
import { getCurrentUserIdEnsured } from './authService';
import { logger } from '../utils/logger';

const COLLECTION_HATIMS = 'hatims';

const generateJoinCode = (length = 6) => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((byte) => charset[byte % charset.length]).join('');
};

const callHatimFunction = async (name, payload = {}) => {
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return result?.data || null;
};

export const hatimService = {
  createGroupHatim: async (name, description, totalParts = 30) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const joinCode = generateJoinCode(6);
      const newHatimRef = doc(collection(db, COLLECTION_HATIMS));
      const hatimId = newHatimRef.id;
      const parts = {};

      for (let i = 1; i <= totalParts; i += 1) {
        parts[i] = {
          status: 'free',
          takenBy: null,
          takenAt: null,
          completedAt: null
        };
      }

      await setDoc(newHatimRef, {
        id: hatimId,
        type: 'group',
        name,
        description,
        createdBy: userId,
        createdAt: serverTimestamp(),
        joinCode,
        parts,
        readers: [userId],
        isPrivate: true,
        completedParts: 0,
        totalParts
      });

      logger.log('[HatimService] Group Hatim created:', hatimId);
      return { id: hatimId, joinCode };
    } catch (error) {
      logger.error('[HatimService] Create hatim error:', error);
      throw error;
    }
  },

  joinGroupHatim: async (code) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const result = await callHatimFunction('joinHatimByCode', { code });
      return {
        id: result?.hatimId || null,
        alreadyJoined: result?.alreadyJoined === true
      };
    } catch (error) {
      logger.error('[HatimService] Join hatim error:', error);
      throw error;
    }
  },

  updatePartStatus: async (hatimId, partNumber, status, userProfile) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const hatimRef = doc(db, COLLECTION_HATIMS, hatimId);
      const hatimDoc = await getDoc(hatimRef);

      if (!hatimDoc.exists()) throw new Error('Hatim bulunamadi');

      const currentData = hatimDoc.data();
      const currentPart = currentData.parts[partNumber];

      if (
        currentPart.status !== 'free' &&
        currentPart.takenBy &&
        currentPart.takenBy.uid !== userId &&
        status === 'taken'
      ) {
        throw new Error('Bu cuz baskasi tarafindan alinmis');
      }

      const partUpdate = {
        status,
        takenBy: status === 'free' ? null : { uid: userId, name: userProfile?.name || 'Anonim' },
        takenAt: status === 'taken' ? new Date().toISOString() : currentPart.takenAt,
        completedAt: status === 'completed' ? new Date().toISOString() : null
      };

      await updateDoc(hatimRef, {
        [`parts.${partNumber}`]: partUpdate
      });

      logger.log(`[HatimService] Part ${partNumber} updated to ${status}`);
      return true;
    } catch (error) {
      logger.error('[HatimService] Update part error:', error);
      throw error;
    }
  },

  getHatimDetails: async (hatimId) => {
    try {
      const hatimDoc = await getDoc(doc(db, COLLECTION_HATIMS, hatimId));
      if (!hatimDoc.exists()) return null;
      return { id: hatimDoc.id, ...hatimDoc.data() };
    } catch (error) {
      logger.error('[HatimService] Get details error:', error);
      return null;
    }
  },

  listPublicHatims: async () => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const result = await callHatimFunction('listPublicHatims');
      return Array.isArray(result?.hatims) ? result.hatims : [];
    } catch (error) {
      logger.error('[HatimService] List public hatims error:', error);
      throw error;
    }
  }
};

export default hatimService;
