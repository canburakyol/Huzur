import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp
} from 'firebase/firestore';
import { getCurrentUserId } from './authService';
import { logger } from '../utils/logger';

const COLLECTION_DUAS = 'duas';

export const duaService = {
  /**
   * Yeni bir dua isteği oluştur
   * @param {string} text - Dua metni
   * @param {boolean} isAnonymous - Anonim mi?
   * @param {string} authorName - Yazar adı (Anonim değilse)
   */
  createDua: async (text, isAnonymous, authorName) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const duaData = {
        text,
        isAnonymous,
        authorId: userId, // Güvenlik için tutulur ama client'a anonimse gönderilmemeli (UI'da gizlenmeli)
        authorName: isAnonymous ? 'Bir Mümin' : (authorName || 'İsimsiz'),
        createdAt: serverTimestamp(),
        aminCount: 0,
        supporters: [] // Kimlerin dua ettiğini tutabiliriz (isteğe bağlı)
      };

      const docRef = await addDoc(collection(db, COLLECTION_DUAS), duaData);
      logger.log('[DuaService] Dua created:', docRef.id);
      return docRef.id;
    } catch (error) {
      logger.error('[DuaService] Create dua error:', error);
      throw error;
    }
  },

  /**
   * Son eklenen duaları getir
   * @param {number} limitCount - Kaç tane getirilsin
   */
  getRecentDuas: async (limitCount = 20) => {
    try {
      const q = query(
        collection(db, COLLECTION_DUAS),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('[DuaService] Get duas error:', error);
      return [];
    }
  },

  /**
   * Bir duaya "Amin" de (Destek ol)
   * @param {string} duaId 
   */
  prayForDua: async (duaId) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    try {
      const duaRef = doc(db, COLLECTION_DUAS, duaId);
      
      // Kullanıcının daha önce destek olup olmadığını kontrol etmek iyi olurdu
      // Ancak basitlik adına şimdilik direkt increment yapıyoruz.
      // İdealde 'supporters' subcollection veya array kullanılır.
      
      await updateDoc(duaRef, {
        aminCount: increment(1),
        // supporters: arrayUnion(userId) // Array limitlerine takılabilir, dikkat
      });
      
      logger.log('[DuaService] Prayed for dua:', duaId);
      return true;
    } catch (error) {
      logger.error('[DuaService] Pray error:', error);
      throw error;
    }
  }
};
