import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { getDb, getFunctionsInstance } from './firebase';
import { getCurrentUserIdEnsured } from './authService';
import { logger } from '../utils/logger';

interface HatimResult {
  hatimId?: string | null;
  joinCode?: string | null;
  alreadyJoined?: boolean;
  success?: boolean;
}

interface HatimDetails extends DocumentData {
  id: string;
}

interface HatimListResult {
  hatims?: unknown[];
}

const COLLECTION_HATIMS = 'hatims';

const callHatimFunction = async (name: string, payload: Record<string, unknown> = {}): Promise<HatimResult | null> => {
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return (result?.data as HatimResult) || null;
};

export const hatimService = {
  createGroupHatim: async (name: string, description: string, totalParts = 30): Promise<{ id: string | null; joinCode: string | null }> => {
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

  joinGroupHatim: async (code: string): Promise<{ id: string | null; alreadyJoined: boolean }> => {
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

  updatePartStatus: async (hatimId: string, partNumber: number, status: string, userProfile: unknown): Promise<boolean> => {
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

  getHatimDetails: async (hatimId: string): Promise<HatimDetails | null> => {
    try {
      const database = await getDb();
      const hatimDoc = await getDoc(doc(database, COLLECTION_HATIMS, hatimId));
      if (!hatimDoc.exists()) return null;
      return { id: hatimDoc.id, ...hatimDoc.data() };
    } catch (error) {
      logger.error('[HatimService] Get details error:', error);
      return null;
    }
  },

  listPublicHatims: async (): Promise<unknown[]> => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const result = await callHatimFunction('listPublicHatims');
      return Array.isArray((result as HatimListResult)?.hatims) ? (result as HatimListResult).hatims as unknown[] : [];
    } catch (error) {
      logger.error('[HatimService] List public hatims error:', error);
      throw error;
    }
  }
};

export default hatimService;
