import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from './firebase';
import { getCurrentUserIdEnsured } from './authService';
import { logger } from '../utils/logger';

export type ServerDua = {
  id: string;
  text: string;
  authorName?: string;
  isAnonymous?: boolean;
  aminCount?: number;
  createdAtMs?: number;
  createdAt?: { seconds: number };
  [key: string]: unknown;
};

type PrayResult = { success: boolean; alreadyPrayed?: boolean; aminCount?: number };

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
      return (result?.dua as ServerDua | undefined) || null;
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
      return Array.isArray(result?.duas) ? (result.duas as ServerDua[]) : [];
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
      const result = await callDuaFunction('prayForDua', { duaId }) as PrayResult | null;
      logger.log('[DuaService] Prayed for dua:', duaId);
      return result;
    } catch (error) {
      logger.error('[DuaService] Pray error:', error);
      throw error;
    }
  },
};

export default duaService;
