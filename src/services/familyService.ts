import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { getDb, getFunctionsInstance } from './firebase';
import { getCurrentUserIdEnsured } from './authService';
import { logger } from '../utils/logger';

type FamilyMember = {
  uid: string;
  [key: string]: unknown;
}

type FamilyData = {
  members?: string[];
  [key: string]: unknown;
}

type FamilyResult = {
  familyId: string | null;
  [key: string]: unknown;
}

type FamilyWeeklyGoalResult = {
  goal: unknown | null;
}

interface FamilyWithMembers extends DocumentData {
  membersDetails: FamilyMember[];
}

type ContributeOptions = {
  familyId?: string | null;
  weekKey?: string | null;
  amount?: number;
  contributionType?: string;
}

const COLLECTION_FAMILIES = 'families';
const COLLECTION_USERS = 'users';

const normalizeCode = (value: unknown, min = 6, max = 12): string | null => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  if (normalized.length < min || normalized.length > max) return null;
  return normalized;
};

const sanitizeGroupName = (value: unknown): string | null => {
  const normalized = String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 80);
  return normalized || null;
};

const callFamilyFunction = async (name: string, payload: Record<string, unknown> = {}): Promise<Record<string, unknown> | null> => {
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return (result?.data as Record<string, unknown>) || null;
};

export const familyService = {
  createFamily: async (familyName: string): Promise<string | null> => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    const safeFamilyName = sanitizeGroupName(familyName);
    if (!safeFamilyName) throw new Error('Gecerli bir aile adi girin');

    try {
      const result = await callFamilyFunction('createFamily', {
        familyName: safeFamilyName
      });
      logger.log('[FamilyService] Family created:', result?.familyId);
      return (result?.familyId as string) || null;
    } catch (error) {
      logger.error('[FamilyService] Create family error:', error);
      throw error;
    }
  },

  joinFamily: async (inviteCode: string): Promise<string | null> => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    const normalizedInviteCode = normalizeCode(inviteCode, 8, 8);
    if (!normalizedInviteCode) throw new Error('Gecersiz davet kodu');

    try {
      const result = await callFamilyFunction('joinFamilyByInviteCode', {
        inviteCode: normalizedInviteCode
      });
      logger.log('[FamilyService] Joined family:', result?.familyId);
      return (result?.familyId as string) || null;
    } catch (error) {
      logger.error('[FamilyService] Join family error:', error);
      throw error;
    }
  },

  listPublicFamilies: async (): Promise<unknown[]> => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const result = await callFamilyFunction('listPublicFamilies');
      return Array.isArray(result?.families) ? result.families as unknown[] : [];
    } catch (error) {
      logger.error('[FamilyService] List public families error:', error);
      throw error;
    }
  },

  getMyFamily: async (): Promise<FamilyWithMembers | null> => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) return null;

    try {
      const database = await getDb();
      const userDoc = await getDoc(doc(database, COLLECTION_USERS, userId));
      if (!userDoc.exists()) return null;

      const userData = userDoc.data();
      if (!userData.familyId) return null;

      const familyDoc = await getDoc(doc(database, COLLECTION_FAMILIES, userData.familyId));
      if (!familyDoc.exists()) return null;

      // Rules only let users read their own doc; other members come from the server projection.
      let members: FamilyMember[] = [{ uid: userId, ...userData }];
      try {
        const result = await callFamilyFunction('getFamilyMembers');
        if (Array.isArray(result?.members)) {
          members = result.members as FamilyMember[];
        }
      } catch (error) {
        logger.warn('[FamilyService] Family members unavailable, showing current user only:', error);
      }

      return {
        ...familyDoc.data(),
        membersDetails: members
      };
    } catch (error) {
      logger.error('[FamilyService] Get family error:', error);
      return null;
    }
  },

  getWeeklyGoal: async (familyId: string | null = null, weekKey: string | null = null): Promise<unknown | null> => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const result = await callFamilyFunction('getOrCreateFamilyWeeklyGoal', {
        familyId,
        weekKey
      });
      return (result as FamilyWeeklyGoalResult)?.goal || null;
    } catch (error) {
      logger.error('[FamilyService] Get weekly goal error:', error);
      throw error;
    }
  },

  contributeWeeklyGoal: async ({ familyId = null, weekKey = null, amount = 1, contributionType = 'manual_checkin' }: ContributeOptions = {}): Promise<unknown | null> => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const result = await callFamilyFunction('contributeToFamilyWeeklyGoal', {
        familyId,
        weekKey,
        amount,
        contributionType
      });
      return (result as FamilyWeeklyGoalResult)?.goal || null;
    } catch (error) {
      logger.error('[FamilyService] Contribute weekly goal error:', error);
      throw error;
    }
  },

  addChildMember: async (): Promise<void> => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');
    logger.warn('[FamilyService] addChildMember not fully implemented yet');
  }
};

export default familyService;
