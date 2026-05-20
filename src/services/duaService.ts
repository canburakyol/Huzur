import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from './firebase';
import { getCurrentUserIdEnsured } from './authService';
import { logger } from '../utils/logger';

type DuaResult = {
  dua?: { id?: string; [key: string]: unknown };
  [key: string]: unknown;
};

const callDuaFunction = async (name: string, payload: Record<string, unknown> = {}): Promise<unknown> => {
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return (result as { data?: unknown })?.data || null;
};

export const duaService = {
  async createDua(text: string, isAnonymous: boolean, authorName?: string) {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await callDuaFunction('createDua', {
        text,
        isAnonymous,
        authorName,
      }) as DuaResult | null;
      logger.log('[DuaService] Dua created:', result?.dua?.id);
      return result?.dua || null;
    } catch (error) {
      logger.error('[DuaService] Create dua error:', error);
      throw error;
    }
  },

  async getRecentDuas(limitCount = 20) {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await callDuaFunction('listRecentDuas', { limitCount }) as { duas?: unknown[] } | null;
      return Array.isArray(result?.duas) ? result.duas : [];
    } catch (error) {
      logger.error('[DuaService] Get duas error:', error);
      return [];
    }
  },

  async prayForDua(duaId: string) {
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
