import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { db, getFunctionsInstance } from './firebase';
import { getCurrentUserIdEnsured } from './authService';
import { logger } from '../utils/logger';

const COLLECTION_HATIMS = 'hatims';

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
      const result = await callHatimFunction('createGroupHatim', {
        name,
        description,
        totalParts
      });

      logger.log('[HatimService] Group Hatim created:', result?.hatimId);
      return {
        id: result?.hatimId || null,
        joinCode: result?.joinCode || null
      };
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
      const result = await callHatimFunction('updateHatimPart', {
        hatimId,
        partNumber,
        status,
        userProfile
      });

      logger.log(`[HatimService] Part ${partNumber} updated to ${status}`);
      return result?.success === true;
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
