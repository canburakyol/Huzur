import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  query, 
  where, 
  limit,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { getCurrentUserIdEnsured } from './authService';
import { logger } from '../utils/logger';

/**
 * Generate a cryptographically secure invite code
 * @param {number} length - Code length (default: 8)
 * @returns {string} Uppercase alphanumeric code
 */
const generateSecureCode = (length = 8) => {
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(b => CHARSET[b % CHARSET.length])
    .join('');
};

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

export const familyService = {
  /**
   * Yeni bir aile oluşturur
   * @param {string} familyName - Aile adı
   * @returns {Promise<string>} Family ID
   */
  createFamily: async (familyName) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');
    const safeFamilyName = sanitizeGroupName(familyName);
    if (!safeFamilyName) throw new Error('Gecerli bir aile adi girin');

    try {
      // Generate unique invite code (8 char, cryptographically secure)
      const inviteCode = generateSecureCode(8);
      
      const newFamilyRef = doc(collection(db, COLLECTION_FAMILIES));
      const familyId = newFamilyRef.id;

      const familyData = {
        id: familyId,
        name: safeFamilyName,
        adminId: userId,
        members: [userId],
        inviteCode,
        createdAt: serverTimestamp(),
        settings: {
          allowChildTree: true
        }
      };

      await setDoc(newFamilyRef, familyData);

      // Update user's profile with familyId and role
      const userRef = doc(db, COLLECTION_USERS, userId);
      await setDoc(userRef, {
        familyId: familyId,
        role: 'parent',
        updatedAt: serverTimestamp()
      }, { merge: true });

      logger.log('[FamilyService] Family created:', familyId);
      return familyId;
    } catch (error) {
      logger.error('[FamilyService] Create family error:', error);
      throw error;
    }
  },

  /**
   * Davet kodu ile aileye katılma
   * @param {string} inviteCode 
   */
  joinFamily: async (inviteCode) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');
    const normalizedInviteCode = normalizeCode(inviteCode, 8, 8);
    if (!normalizedInviteCode) throw new Error('Gecersiz davet kodu');

    try {
      // Find family by invite code
      const q = query(
        collection(db, COLLECTION_FAMILIES), 
        where('inviteCode', '==', normalizedInviteCode),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Geçersiz davet kodu');
      }

      const familyDoc = querySnapshot.docs[0];
      const familyId = familyDoc.id;

      // Update family members
      await updateDoc(familyDoc.ref, {
        members: arrayUnion(userId)
      });

      // Update user profile
      const userRef = doc(db, COLLECTION_USERS, userId);
      await setDoc(userRef, {
        familyId: familyId,
        role: 'member', // Default role
        updatedAt: serverTimestamp()
      }, { merge: true });

      logger.log('[FamilyService] Joined family:', familyId);
      return familyId;
    } catch (error) {
      logger.error('[FamilyService] Join family error:', error);
      throw error;
    }
  },

  /**
   * Kullanıcının aile bilgilerini getirir
   */
  getMyFamily: async () => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) return null;

    try {
      // Get user doc to find familyId
      const userDoc = await getDoc(doc(db, COLLECTION_USERS, userId));
      if (!userDoc.exists()) return null;

      const userData = userDoc.data();
      if (!userData.familyId) return null;

      // Get family details
      const familyDoc = await getDoc(doc(db, COLLECTION_FAMILIES, userData.familyId));
      if (!familyDoc.exists()) return null;

      // Get all members details (bulk fetch could be optimized)
      const memberIds = familyDoc.data().members || [];
      const membersPromises = memberIds.map(mid => getDoc(doc(db, COLLECTION_USERS, mid)));
      const membersSnapshots = await Promise.all(membersPromises);
      
      const members = membersSnapshots.map(snap => {
        if (!snap.exists()) return null;
        return { 
          uid: snap.id, 
          ...snap.data() 
        };
      }).filter(Boolean);

      return {
        ...familyDoc.data(),
        membersDetails: members
      };
    } catch (error) {
      logger.error('[FamilyService] Get family error:', error);
      return null;
    }
  },

  /**
   * Ebeveyn tarafından çocuk hesabı oluşturma (Email olmadan)
   * Bu sanal bir hesap olarak aile içinde tutulur
   */
  addChildMember: async (childName) => { // eslint-disable-line no-unused-vars
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    // Bu özellik sonraki fazda implement edilecek (Sanal Hesaplar)
    // Şimdilik sadece metod taslağı
    logger.warn('[FamilyService] addChildMember not fully implemented yet');
  },

  // --- FAMILY GROUP METHODS (FamilyMode.jsx Support) ---

  /**
   * Yeni grup oluştur (FamilyMode uyumlu)
   */
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
      // 8 karakterlik kriptografik güvenli kod oluştur
      const code = generateSecureCode(8);
      
      const newGroupRef = doc(collection(db, 'familyGroups'));
      const groupId = newGroupRef.id;

      const groupData = {
        id: groupId,
        name: safeGroupName,
        code: code,
        createdBy: userId,
        createdAt: serverTimestamp(),
        members: [{
          id: safeProfileId,
          uid: userId,
          name: safeProfileName,
          avatar: safeProfileAvatar,
          role: safeProfileRole,
          isAdmin: true
        }],
        // Flat array for Firestore array-contains queries
        memberIds: [userId],
        pendingMembers: []
      };

      await setDoc(newGroupRef, groupData);
      logger.log('[FamilyService] Group created:', groupId);
      return groupData;
    } catch (error) {
      logger.error('[FamilyService] Create group error:', error);
      throw error;
    }
  },

  /**
   * Kod ile gruba katılma isteği
   */
  requestJoinGroup: async (code, activeProfile) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');
    const normalizedCode = normalizeCode(code, 6, 12);
    if (!normalizedCode) throw new Error('Gecersiz grup kodu');

    const safeProfileId = String(activeProfile?.id || '').trim().slice(0, 80);
    const safeProfileName = sanitizeDisplayName(activeProfile?.name, 'Isimsiz');
    const safeProfileAvatar = sanitizeAvatar(activeProfile?.avatar, '👤');
    const safeProfileRole = sanitizeRole(activeProfile?.role, 'child');
    if (!safeProfileId) throw new Error('Profil bilgisi eksik');

    try {
      const q = query(
        collection(db, 'familyGroups'), 
        where('code', '==', normalizedCode),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Geçersiz grup kodu');
      }

      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();
      
      // Zaten üye mi kontrol et
      const isMember = groupData.members?.some(
        (m) => m?.uid === userId || m?.id === safeProfileId
      );
      if (isMember) {
        throw new Error('Zaten bu grubun üyesisiniz');
      }

      // Zaten pending mi kontrol et
      const isPending = groupData.pendingMembers?.some(
        (m) => m?.requestedByUid === userId || m?.profileId === safeProfileId || m?.id === safeProfileId
      );
      if (isPending) {
        return { status: 'pending', message: 'Katılma isteğiniz onay bekliyor' };
      }

      // Pending members'a ekle
      const pendingMember = {
        profileId: safeProfileId,
        requestedByUid: userId,
        name: safeProfileName,
        avatar: safeProfileAvatar,
        role: safeProfileRole,
        requestedAt: new Date().toISOString() // ISO string used instead of serverTimestamp (incompatible with arrayUnion)
      };
      
      // Since serverTimestamp inside arrayUnion can be problematic in some SDK versions/contexts, 
      // strict object is safer. Let's use ISO string for date inside array for simplicity if timestamp causes issues,
      // but Firestore allows it.
      
      await updateDoc(groupDoc.ref, {
        pendingMembers: arrayUnion(pendingMember),
        updatedAt: serverTimestamp()
      });

      logger.log('[FamilyService] Join request sent:', groupDoc.id);
      return { status: 'pending', message: 'Katılma isteği gönderildi' };
    } catch (error) {
      logger.error('[FamilyService] Request join error:', error);
      throw error;
    }
  },

  /**
   * Katılma isteğini onayla
   */
  approveJoinRequest: async (groupId, pendingProfileId) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const groupRef = doc(db, 'familyGroups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        throw new Error('Grup bulunamadı');
      }

      const groupData = groupDoc.data();
      
      // Admin kontrolü: sadece grup sahibi veya admin üye onaylayabilir
      const isCreator = groupData.createdBy === userId;
      if (!isCreator) {
        throw new Error('Bu işlem için yetkiniz yok');
      }
      
      // Pending'den bul
      const pendingMember = groupData.pendingMembers?.find(
        (m) => m.requestedByUid === pendingProfileId || m.profileId === pendingProfileId || m.id === pendingProfileId
      );
      if (!pendingMember) {
        throw new Error('Bekleyen istek bulunamadı');
      }

      // Pending'den çıkar, members'a ekle
      const updatedPending = (groupData.pendingMembers || []).filter(
        (m) => !(m.requestedByUid === pendingProfileId || m.profileId === pendingProfileId || m.id === pendingProfileId)
      );
      const approvedUid = String(pendingMember.requestedByUid || '').trim();
      const newMember = {
        id: String(pendingMember.profileId || pendingMember.id || pendingProfileId).trim().slice(0, 80),
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

  /**
   * Katılma isteğini reddet
   */
  rejectJoinRequest: async (groupId, pendingProfileId) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const groupRef = doc(db, 'familyGroups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        throw new Error('Grup bulunamadı');
      }

      const groupData = groupDoc.data();

      // Admin kontrolü: sadece grup sahibi veya admin üye reddedebilir
      const isCreator = groupData.createdBy === userId;
      if (!isCreator) {
        throw new Error('Bu işlem için yetkiniz yok');
      }

      const updatedPending = (groupData.pendingMembers || []).filter(
        (m) => !(m.requestedByUid === pendingProfileId || m.profileId === pendingProfileId || m.id === pendingProfileId)
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

  /**
   * Kullanıcının gruplarını getir
   * @param {string} profileId - Opsiyonel, spesifik profil için
   */
  getMyGroups: async () => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) return [];

    try {
      // memberIds flat array üzerinden verimli Firestore sorgusu
      const q = query(
        collection(db, 'familyGroups'),
        where('memberIds', 'array-contains', userId),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      
      const groups = [];
      querySnapshot.forEach(docSnap => {
        groups.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      return groups;
    } catch (error) {
      logger.error('[FamilyService] Get groups error:', error);
      return [];
    }
  }
};

