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

export const familyService = {
  /**
   * Yeni bir aile oluşturur
   * @param {string} familyName - Aile adı
   * @returns {Promise<string>} Family ID
   */
  createFamily: async (familyName) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      // Generate unique invite code (8 char, cryptographically secure)
      const inviteCode = generateSecureCode(8);
      
      const newFamilyRef = doc(collection(db, COLLECTION_FAMILIES));
      const familyId = newFamilyRef.id;

      const familyData = {
        id: familyId,
        name: familyName,
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

    try {
      // Find family by invite code
      const q = query(
        collection(db, COLLECTION_FAMILIES), 
        where('inviteCode', '==', inviteCode.toUpperCase()),
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

    try {
      // 8 karakterlik kriptografik güvenli kod oluştur
      const code = generateSecureCode(8);
      
      const newGroupRef = doc(collection(db, 'familyGroups'));
      const groupId = newGroupRef.id;

      const groupData = {
        id: groupId,
        name: name,
        code: code,
        createdBy: userId,
        createdAt: serverTimestamp(),
        members: [{
          id: activeProfile.id,
          name: activeProfile.name,
          avatar: activeProfile.avatar || '👤',
          role: activeProfile.role || 'parent',
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

    try {
      const q = query(
        collection(db, 'familyGroups'), 
        where('code', '==', code.toUpperCase()),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Geçersiz grup kodu');
      }

      const groupDoc = querySnapshot.docs[0];
      const groupData = groupDoc.data();
      
      // Zaten üye mi kontrol et
      const isMember = groupData.members?.some(m => m.id === activeProfile.id);
      if (isMember) {
        throw new Error('Zaten bu grubun üyesisiniz');
      }

      // Zaten pending mi kontrol et
      const isPending = groupData.pendingMembers?.some(m => m.id === activeProfile.id);
      if (isPending) {
        return { status: 'pending', message: 'Katılma isteğiniz onay bekliyor' };
      }

      // Pending members'a ekle
      const pendingMember = {
        id: activeProfile.id,
        name: activeProfile.name,
        avatar: activeProfile.avatar || '👤',
        role: activeProfile.role || 'child',
        requestedAt: new Date().toISOString() // ISO string used instead of serverTimestamp (incompatible with arrayUnion)
      };
      
      // Since serverTimestamp inside arrayUnion can be problematic in some SDK versions/contexts, 
      // strict object is safer. Let's use ISO string for date inside array for simplicity if timestamp causes issues,
      // but Firestore allows it.
      
      await updateDoc(groupDoc.ref, {
        pendingMembers: arrayUnion(pendingMember),
        // Add userId to memberIds for future query support (pending members also tracked)
        memberIds: arrayUnion(userId)
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
      const isAdmin = groupData.members?.some(m => m.id === userId && m.isAdmin === true);
      if (!isCreator && !isAdmin) {
        throw new Error('Bu işlem için yetkiniz yok');
      }
      
      // Pending'den bul
      const pendingMember = groupData.pendingMembers?.find(m => m.id === pendingProfileId);
      if (!pendingMember) {
        throw new Error('Bekleyen istek bulunamadı');
      }

      // Pending'den çıkar, members'a ekle
      const updatedPending = groupData.pendingMembers.filter(m => m.id !== pendingProfileId);
      const newMember = {
        id: pendingMember.id,
        name: pendingMember.name,
        avatar: pendingMember.avatar,
        role: pendingMember.role,
        isAdmin: false
      };

      await updateDoc(groupRef, {
        members: arrayUnion(newMember),
        memberIds: arrayUnion(pendingMember.id),
        pendingMembers: updatedPending
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
      const isAdmin = groupData.members?.some(m => m.id === userId && m.isAdmin === true);
      if (!isCreator && !isAdmin) {
        throw new Error('Bu işlem için yetkiniz yok');
      }

      const updatedPending = groupData.pendingMembers.filter(m => m.id !== pendingProfileId);

      await updateDoc(groupRef, {
        pendingMembers: updatedPending
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
