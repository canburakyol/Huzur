import { useState, useEffect, useCallback } from 'react';
import { 
  onSnapshot, 
  doc, 
  collection, 
  query, 
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { hatimService } from '../services/hatimService';
import { ensureAuthenticated } from '../services/authService';
import { logger } from '../utils/logger';

export const useGroupHatim = (hatimId = null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeHatims, setActiveHatims] = useState([]);
  const [hatimDetails, setHatimDetails] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Auth initialization
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const uid = await ensureAuthenticated();
        if (isMounted) {
          setUserId(uid);
          setAuthReady(true);
          logger.log('[useGroupHatim] Auth initialized, userId:', uid);
        }
      } catch (err) {
        logger.error('[useGroupHatim] Auth error:', err);
        if (isMounted) {
          setError('Firebase kimlik doğrulaması başarısız. İnternetinizi kontrol edip tekrar deneyin.');
          setAuthReady(true); // Set true even on error to stop loading
        }
      }
    };
    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Fetch User's Active Hatims (List View)
  const fetchMyHatims = useCallback(async () => {
    // Ensure auth first
    const uid = await ensureAuthenticated({ requireFirebaseUser: true });
    if (!uid) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'hatims'),
        where('readers', 'array-contains', uid),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const hatims = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      hatims.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      setActiveHatims(hatims);
    } catch (err) {
      logger.error('Error fetching my hatims:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 1b. Fetch All Public Group Hatims (Discovery View)
  const fetchAllPublicHatims = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'hatims'),
        where('type', '==', 'group'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const hatims = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by creation date
      hatims.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setActiveHatims(hatims);
    } catch (err) {
      logger.error('Error fetching all hatims:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Real-time Subscription to Specific Hatim (Detail View)
  useEffect(() => {
    if (!hatimId || !authReady || !userId) return;

    setLoading(true);
    setError(null);
    
    const unsub = onSnapshot(doc(db, 'hatims', hatimId), 
      (docSnap) => {
        if (docSnap.exists()) {
          setHatimDetails({ id: docSnap.id, ...docSnap.data() });
          setError(null);
        } else {
          setError('Hatim bulunamadı');
          setHatimDetails(null);
        }
        setLoading(false);
      },
      (err) => {
        logger.error('[useGroupHatim] Hatim subscription error:', err);
        if (err.code === 'permission-denied') {
          setError('Erişim izni hatası. Lütfen uygulamayı yeniden başlatın.');
        } else {
          setError('Veri güncellenemedi');
        }
        setLoading(false);
      }
    );

    // Düzgün bir cleanup işlemi dönüyoruz
    return () => {
       logger.log(`[useGroupHatim] Unsubscribing from hatim: ${hatimId}`);
       unsub();
    };
  }, [hatimId, authReady, userId]);

  // Actions
  const createHatim = async (name, desc, parts) => {
    const result = await hatimService.createGroupHatim(name, desc, parts);
    await fetchMyHatims(); // Refresh list
    return result;
  };

  const joinHatim = async (code) => {
    const result = await hatimService.joinGroupHatim(code);
    await fetchMyHatims(); // Refresh list
    return result;
  };

  const takePart = async (partId) => {
    // Optimistic UI updates could be added here, but Firestore listener handles sync
    try {
      // Get user profile if possible (from context or auth)
      const visibleName = `Mümin-${userId ? userId.substring(0, 4) : 'User'}`;
      await hatimService.updatePartStatus(hatimId, partId, 'taken', { name: visibleName }); 
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const releasePart = async (partId) => {
    try {
      await hatimService.updatePartStatus(hatimId, partId, 'free', null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const completePart = async (partId) => {
    try {
      const visibleName = `Mümin-${userId ? userId.substring(0, 4) : 'User'}`;
      await hatimService.updatePartStatus(hatimId, partId, 'completed', { name: visibleName });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    loading,
    error,
    activeHatims,
    hatimDetails,
    fetchMyHatims,
    fetchAllPublicHatims,
    createHatim,
    joinHatim,
    takePart,
    releasePart,
    completePart
  };
};
