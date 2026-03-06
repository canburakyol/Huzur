import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  arrayUnion,
  query,
  where,
  limit,
  getDocs
} from 'firebase/firestore';
import { getCurrentUserIdEnsured } from './authService';
import { logger } from '../utils/logger';

const COLLECTION_HATIMS = 'hatims';

const generateJoinCode = (length = 6) => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => charset[b % charset.length]).join('');
};

export const hatimService = {
  /**
   * Yeni bir Grup Hatim oluştur
   * @param {string} name - Hatim başlığı (Örn: "Babaannem için")
   * @param {string} description - Açıklama
   * @param {number} totalParts - Toplam parça (Genelde 30 Cüz)
   */
  createGroupHatim: async (name, description, totalParts = 30) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      // Cryptographically secure join code
      const joinCode = generateJoinCode(6);
      
      const newHatimRef = doc(collection(db, COLLECTION_HATIMS));
      const hatimId = newHatimRef.id;

      // Cüzlerin başlangıç durumu: hepsi boş
      const parts = {};
      for (let i = 1; i <= totalParts; i++) {
        parts[i] = {
          status: 'free', // free, taken, completed
          takenBy: null,
          takenAt: null,
          completedAt: null
        };
      }

      const hatimData = {
        id: hatimId,
        type: 'group', // 'personal' or 'group'
        name,
        description,
        createdBy: userId,
        createdAt: serverTimestamp(),
        joinCode,
        parts,
        readers: [userId], // Katılımcı listesi
        isPrivate: true, // Sadece link/kod ile erişilebilir
        completedParts: 0,
        totalParts
      };

      await setDoc(newHatimRef, hatimData);
      logger.log('[HatimService] Group Hatim created:', hatimId);
      return { id: hatimId, joinCode };
    } catch (error) {
      logger.error('[HatimService] Create hatim error:', error);
      throw error;
    }
  },

  /**
   * Kod ile Hatime katıl
   * @param {string} code 
   */
  joinGroupHatim: async (code) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const q = query(
        collection(db, COLLECTION_HATIMS), 
        where('joinCode', '==', code.toUpperCase()),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Geçersiz hatim kodu');
      }

      const hatimDoc = querySnapshot.docs[0];
      const hatimId = hatimDoc.id;

      // Okuyucu listesine ekle
      await updateDoc(hatimDoc.ref, {
        readers: arrayUnion(userId)
      });

      return { id: hatimId, ...hatimDoc.data() };
    } catch (error) {
      logger.error('[HatimService] Join hatim error:', error);
      throw error;
    }
  },

  /**
   * Cüz al veya durumu güncelle
   * @param {string} hatimId 
   * @param {number} partNumber 
   * @param {string} status - 'taken' | 'completed' | 'free'
   * @param {object} userProfile - { name: 'Ali' }
   */
  updatePartStatus: async (hatimId, partNumber, status, userProfile) => {
    const userId = await getCurrentUserIdEnsured();
    if (!userId) throw new Error('User not authenticated');

    try {
      const hatimRef = doc(db, COLLECTION_HATIMS, hatimId);
      const hatimDoc = await getDoc(hatimRef);
      
      if (!hatimDoc.exists()) throw new Error('Hatim bulunamadı');

      const currentData = hatimDoc.data();
      const currentPart = currentData.parts[partNumber];

      // Kontrol: Başkası almışsa elleme (Admin hariç - şimdilik admin yok)
      if (currentPart.status !== 'free' && currentPart.takenBy && currentPart.takenBy.uid !== userId && status === 'taken') {
         throw new Error('Bu cüz başkası tarafından alınmış');
      }

      // Yeni parça verisi
      const partUpdate = {
        status,
        takenBy: status === 'free' ? null : { uid: userId, name: userProfile?.name || 'Anonim' },
        takenAt: status === 'taken' ? new Date().toISOString() : currentPart.takenAt, // Timestamp yerine ISO string güvenli
        completedAt: status === 'completed' ? new Date().toISOString() : null
      };

      // Nested update (Dot notation for map fields)
      await updateDoc(hatimRef, {
        [`parts.${partNumber}`]: partUpdate
      });

      logger.log(`[HatimService] Part ${partNumber} updated to ${status}`);
      return true;
    } catch (error) {
      logger.error('[HatimService] Update part error:', error);
      throw error;
    }
  },

  /**
   * Hatim detaylarını getir
   */
  getHatimDetails: async (hatimId) => {
    try {
      const hatimDoc = await getDoc(doc(db, COLLECTION_HATIMS, hatimId));
      if (!hatimDoc.exists()) return null;
      return { id: hatimDoc.id, ...hatimDoc.data() };
    } catch (error) {
      logger.error('[HatimService] Get details error:', error);
      return null;
    }
  }
};
