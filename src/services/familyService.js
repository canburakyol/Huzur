import { httpsCallable } from 'firebase/functions';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db, getFunctionsInstance } from './firebase';
import { getCurrentUserIdEnsured } from './authService';
import { storageService } from './storageService';
import { logger } from '../utils/logger';

const COLLECTION_FAMILIES = 'families';
const COLLECTION_USERS = 'users';
const FAMILY_LOCAL_STATE_KEY = 'huzur_family_profiles';

const normalizeCode = (value, min = 6, max = 12) => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  if (normalized.length < min || normalized.length > max) return null;
  return normalized;
};

const sanitizeDisplayName = (value, fallback = 'Isimsiz') => {
  const normalized = String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 80);
  return normalized || fallback;
};

const sanitizeGroupName = (value) => {
  const normalized = String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 80);
  return normalized || null;
};

const sanitizeRole = (value, fallback = 'member') => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .slice(0, 20);

  if (!normalized) return fallback;
  if (!['parent', 'member', 'child'].includes(normalized)) return fallback;
  return normalized;
};

const sanitizeAvatar = (value, fallback = '👤') => {
  const normalized = String(value || '').trim().slice(0, 16);
  return normalized || fallback;
};

const getDefaultLocalState = () => ({
  profiles: [],
  activeProfileId: null,
  currentGroup: null
});

const callFamilyFunction = async (name, payload = {}) => {
  const functions = await getFunctionsInstance();
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return result?.data || null;
};

export const familyService = {
  getProfiles: async () => {
    return storageService.getItem(FAMILY_LOCAL_STATE_KEY, getDefaultLocalState());
  },

  saveProfiles: (state) => {
    return storageService.setItem(FAMILY_LOCAL_STATE_KEY, {
      ...getDefaultLocalState(),
      ...(state || {})
    });
  },

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

  addChildMember: async () => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');
    logger.warn('[FamilyService] addChildMember not fully implemented yet');
  },

  createGroup: async (name, activeProfile) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    const safeGroupName = sanitizeGroupName(name);
    if (!safeGroupName) throw new Error('Gecerli bir grup adi girin');

    const safeProfileId = String(activeProfile?.id || userId).trim().slice(0, 80) || userId;
    const safeProfileName = sanitizeDisplayName(activeProfile?.name, 'Isimsiz');
    const safeProfileAvatar = sanitizeAvatar(activeProfile?.avatar, '👤');
    const safeProfileRole = sanitizeRole(activeProfile?.role, 'parent');

    try {
      const result = await callFamilyFunction('createFamilyGroup', {
        name: safeGroupName,
        profile: {
          id: safeProfileId,
          name: safeProfileName,
          avatar: safeProfileAvatar,
          role: safeProfileRole
        }
      });

      logger.log('[FamilyService] Group created:', result?.groupId);
      return result?.group || null;
    } catch (error) {
      logger.error('[FamilyService] Create group error:', error);
      throw error;
    }
  },

  requestJoinGroup: async (code, activeProfile) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    const normalizedCode = normalizeCode(code, 6, 12);
    if (!normalizedCode) throw new Error('Gecersiz grup kodu');

    const safeProfileId = String(activeProfile?.id || '').trim().slice(0, 80);
    if (!safeProfileId) throw new Error('Profil bilgisi eksik');

    const safeProfileName = sanitizeDisplayName(activeProfile?.name, 'Isimsiz');
    const safeProfileAvatar = sanitizeAvatar(activeProfile?.avatar, '👤');
    const safeProfileRole = sanitizeRole(activeProfile?.role, 'child');

    try {
      const result = await callFamilyFunction('requestFamilyGroupJoinByCode', {
        code: normalizedCode,
        profile: {
          id: safeProfileId,
          name: safeProfileName,
          avatar: safeProfileAvatar,
          role: safeProfileRole
        }
      });

      if (result?.status === 'member') {
        return { status: 'member', message: 'Zaten bu grubun uyesisiniz' };
      }

      logger.log('[FamilyService] Join request sent:', result?.groupId);
      return { status: 'pending', message: 'Katilma istegi gonderildi' };
    } catch (error) {
      logger.error('[FamilyService] Request join error:', error);
      throw error;
    }
  },

  approveJoinRequest: async (groupId, pendingProfileId) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const groupRef = doc(db, 'familyGroups', groupId);
      const groupDoc = await getDoc(groupRef);
      if (!groupDoc.exists()) throw new Error('Grup bulunamadi');

      const groupData = groupDoc.data();
      if (groupData.createdBy !== userId) {
        throw new Error('Bu islem icin yetkiniz yok');
      }

      const pendingMember = (groupData.pendingMembers || []).find(
        (member) =>
          member.requestedByUid === pendingProfileId ||
          member.profileId === pendingProfileId ||
          member.id === pendingProfileId
      );

      if (!pendingMember) {
        throw new Error('Bekleyen istek bulunamadi');
      }

      const updatedPending = (groupData.pendingMembers || []).filter(
        (member) =>
          !(
            member.requestedByUid === pendingProfileId ||
            member.profileId === pendingProfileId ||
            member.id === pendingProfileId
          )
      );

      const approvedUid = String(pendingMember.requestedByUid || '').trim();
      const newMember = {
        id: String(pendingMember.profileId || pendingProfileId).trim().slice(0, 80),
        uid: approvedUid,
        name: sanitizeDisplayName(pendingMember.name, 'Isimsiz'),
        avatar: sanitizeAvatar(pendingMember.avatar, '👤'),
        role: sanitizeRole(pendingMember.role, 'member'),
        isAdmin: false
      };

      if (!newMember.uid) {
        throw new Error('Bekleyen istek uid bilgisi eksik');
      }

      await updateDoc(groupRef, {
        members: arrayUnion(newMember),
        memberIds: arrayUnion(newMember.uid),
        pendingMembers: updatedPending,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        members: [...(groupData.members || []), newMember],
        pendingMembers: updatedPending
      };
    } catch (error) {
      logger.error('[FamilyService] Approve request error:', error);
      throw error;
    }
  },

  rejectJoinRequest: async (groupId, pendingProfileId) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const groupRef = doc(db, 'familyGroups', groupId);
      const groupDoc = await getDoc(groupRef);
      if (!groupDoc.exists()) throw new Error('Grup bulunamadi');

      const groupData = groupDoc.data();
      if (groupData.createdBy !== userId) {
        throw new Error('Bu islem icin yetkiniz yok');
      }

      const updatedPending = (groupData.pendingMembers || []).filter(
        (member) =>
          !(
            member.requestedByUid === pendingProfileId ||
            member.profileId === pendingProfileId ||
            member.id === pendingProfileId
          )
      );

      await updateDoc(groupRef, {
        pendingMembers: updatedPending,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        pendingMembers: updatedPending
      };
    } catch (error) {
      logger.error('[FamilyService] Reject request error:', error);
      throw error;
    }
  },

  getMyGroups: async () => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) return [];

    try {
      const groupsQuery = query(
        collection(db, 'familyGroups'),
        where('memberIds', 'array-contains', userId),
        limit(50)
      );
      const querySnapshot = await getDocs(groupsQuery);

      return querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    } catch (error) {
      logger.error('[FamilyService] Get groups error:', error);
      return [];
    }
  }
};

export default familyService;
