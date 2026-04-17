import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import { db, getFunctionsInstance } from './firebase';
import { getCurrentUserIdEnsured } from './authService';
import { logger } from '../utils/logger';

const COLLECTION_FAMILIES = 'families';
const COLLECTION_USERS = 'users';

const normalizeCode = (value, min = 6, max = 12) => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  if (normalized.length < min || normalized.length > max) return null;
  return normalized;
};

const sanitizeGroupName = (value) => {
  const normalized = String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 80);
  return normalized || null;
};

const callFamilyFunction = async (name, payload = {}) => {
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return result?.data || null;
};

export const familyService = {
  createFamily: async (familyName) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    const safeFamilyName = sanitizeGroupName(familyName);
    if (!safeFamilyName) throw new Error('Gecerli bir aile adi girin');

    try {
      const result = await callFamilyFunction('createFamily', {
        familyName: safeFamilyName
      });
      logger.log('[FamilyService] Family created:', result?.familyId);
      return result?.familyId || null;
    } catch (error) {
      logger.error('[FamilyService] Create family error:', error);
      throw error;
    }
  },

  joinFamily: async (inviteCode) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    const normalizedInviteCode = normalizeCode(inviteCode, 8, 8);
    if (!normalizedInviteCode) throw new Error('Gecersiz davet kodu');

    try {
      const result = await callFamilyFunction('joinFamilyByInviteCode', {
        inviteCode: normalizedInviteCode
      });
      logger.log('[FamilyService] Joined family:', result?.familyId);
      return result?.familyId || null;
    } catch (error) {
      logger.error('[FamilyService] Join family error:', error);
      throw error;
    }
  },

  listPublicFamilies: async () => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const result = await callFamilyFunction('listPublicFamilies');
      return Array.isArray(result?.families) ? result.families : [];
    } catch (error) {
      logger.error('[FamilyService] List public families error:', error);
      throw error;
    }
  },

  getMyFamily: async () => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) return null;

    try {
      const userDoc = await getDoc(doc(db, COLLECTION_USERS, userId));
      if (!userDoc.exists()) return null;

      const userData = userDoc.data();
      if (!userData.familyId) return null;

      const familyDoc = await getDoc(doc(db, COLLECTION_FAMILIES, userData.familyId));
      if (!familyDoc.exists()) return null;

      const memberIds = familyDoc.data().members || [];
      const memberSnapshots = await Promise.all(
        memberIds.map((memberId) => getDoc(doc(db, COLLECTION_USERS, memberId)))
      );

      const members = memberSnapshots
        .map((snapshot) => (snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null))
        .filter(Boolean);

      return {
        ...familyDoc.data(),
        membersDetails: members
      };
    } catch (error) {
      logger.error('[FamilyService] Get family error:', error);
      return null;
    }
  },

  getWeeklyGoal: async (familyId = null, weekKey = null) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const result = await callFamilyFunction('getOrCreateFamilyWeeklyGoal', {
        familyId,
        weekKey
      });
      return result?.goal || null;
    } catch (error) {
      logger.error('[FamilyService] Get weekly goal error:', error);
      throw error;
    }
  },

  contributeWeeklyGoal: async ({ familyId = null, weekKey = null, amount = 1, contributionType = 'manual_checkin' } = {}) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const result = await callFamilyFunction('contributeToFamilyWeeklyGoal', {
        familyId,
        weekKey,
        amount,
        contributionType
      });
      return result?.goal || null;
    } catch (error) {
      logger.error('[FamilyService] Contribute weekly goal error:', error);
      throw error;
    }
  },

  addChildMember: async () => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');
    logger.warn('[FamilyService] addChildMember not fully implemented yet');
  }
};

export default familyService;
