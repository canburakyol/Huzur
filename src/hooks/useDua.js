import { useState, useEffect } from 'react';
import { 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { duaService } from '../services/duaService';
import { ensureAuthenticated } from '../services/authService';
import { logger } from '../utils/logger';

export const useDua = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duas, setDuas] = useState([]);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth initialization - Firebase Auth tamamlanmadan Firestore sorgusu başlamaz
  useEffect(() => {
    const initAuth = async () => {
      try {
        const uid = await ensureAuthenticated({ requireFirebaseUser: true });
        setUserId(uid);
        logger.log('[useDua] Auth initialized, userId:', uid);
      } catch (err) {
        logger.error('[useDua] Auth error:', err);
        setError('Firebase kimlik doğrulaması başarısız. İnternetinizi kontrol edip tekrar deneyin.');
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  // Subscribe to recent duas - Auth tamamlandıktan sonra başlar
  useEffect(() => {
    // Auth henüz tamamlanmadıysa bekle
    if (authLoading || !userId) {
      return;
    }

    setLoading(true);
    setError(null);
    
    const q = query(
      collection(db, 'duas'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsub = onSnapshot(q, 
      (snapshot) => {
        const duaList = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        setDuas(duaList);
        setLoading(false);
      },
      (err) => {
        logger.error('[useDua] Firestore error:', err);
        if (err.code === 'permission-denied') {
          setError('Erişim izni hatası. Lütfen uygulamayı yeniden başlatın.');
        } else {
          setError('Dualar yüklenemedi');
        }
        setLoading(false);
      }
    );

    return () => unsub();
  }, [authLoading, userId]);

  const createDua = async (text, isAnonymous, authorName) => {
    try {
      await duaService.createDua(text, isAnonymous, authorName);
      return true;
    } catch (err) {
      logger.error('Create dua error:', err);
      throw err;
    }
  };

  const prayForDua = async (duaId) => {
    try {
      await duaService.prayForDua(duaId);
      return true;
    } catch (err) {
      logger.error('Pray action error:', err);
      throw err;
    }
  };

  return {
    loading,
    error,
    duas,
    createDua,
    prayForDua
  };
};
