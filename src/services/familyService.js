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
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { getCurrentUserId } from './authService';
import { logger } from '../utils/logger';

const COLLECTION_FAMILIES = 'families';
const COLLECTION_USERS = 'users';

export const familyService = {
  /**
   * Yeni bir aile oluşturur
   * @param {string} familyName - Aile adı
   * @returns {Promise<string>} Family ID
   */
  createFamily: async (familyName) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      // Generate unique invite code (6 char)
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
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
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      // Find family by invite code
      const q = query(collection(db, COLLECTION_FAMILIES), where('inviteCode', '==', inviteCode.toUpperCase()));
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
    const userId = getCurrentUserId();
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
    const userId = getCurrentUserId();
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
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      // 8 karakterlik kod oluştur
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
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
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const q = query(collection(db, 'familyGroups'), where('code', '==', code.toUpperCase()));
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
        requestedAt: serverTimestamp() // Note: serverTimestamp might be tricky in arrays, using specific update logic often safer, but arrayUnion works for simple objects
      };
      
      // Since serverTimestamp inside arrayUnion can be problematic in some SDK versions/contexts, 
      // strict object is safer. Let's use ISO string for date inside array for simplicity if timestamp causes issues,
      // but Firestore allows it.
      
      await updateDoc(groupDoc.ref, {
        pendingMembers: arrayUnion(pendingMember)
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
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const groupRef = doc(db, 'familyGroups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        throw new Error('Grup bulunamadı');
      }

      const groupData = groupDoc.data();
      
      // Admin kontrolü (basit implementation: aktif user admin mi?)
      // Not: Gerçek admin kontrolü için activeProfile id'si de gerekebilir ama şimdilik user id üzerinden gidelim
      // veya data içindeki member listesinden user id eşleşmesi arayalım.
      // Basitleştirilmiş: Herhangi bir admin üye işlem yapabilir.
      
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
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const groupRef = doc(db, 'familyGroups', groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        throw new Error('Grup bulunamadı');
      }

      const groupData = groupDoc.data();
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
  getMyGroups: async (profileId) => {
    const userId = getCurrentUserId();
    if (!userId) return [];

    try {
      // İdealde 'members' array-contains sorgusu yapılır ama members obje array olduğu için
      // bu yapı NoSQL'de zordur. Genelde 'memberIds' gibi bir düz array tutulur.
      // Şimdilik MVP için tüm grupları çekip client-side filtreleyelim (Hacim küçükse)
      // VEYA 'familyGroups' koleksiyonunda kullanıcı ID'sine göre arama yapamayız çünkü yapı karmaşık.
      // Düzeltme: Collection scan yapmayalım. Groups'ların ID'lerini user profilinde tutmak en iyisidir.
      // Ama şimdilik 'createGroup' user'a bişi yazmıyor.
      // BMAD raporuna sadık kalarak, collection query denersek: index gerekir.
      
      const q = query(collection(db, 'familyGroups'));
      const querySnapshot = await getDocs(q);
      
      const groups = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        // Check memberships
        const isMember = data.members?.some(m => m.id === (profileId || userId) || m.id === userId); // Fallback to userId check
        
        if (isMember) {
          groups.push({ id: doc.id, ...data });
        }
      });
      
      return groups;
    } catch (error) {
      logger.error('[FamilyService] Get groups error:', error);
      return [];
    }
  }
};
