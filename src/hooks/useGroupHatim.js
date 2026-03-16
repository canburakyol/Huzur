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

  const loadMemberHatims = useCallback(async (uid) => {
    const q = query(
      collection(db, 'hatims'),
      where('readers', 'array-contains', uid),
      limit(20)
    );
    const snapshot = await getDocs(q);
    const hatims = snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }));
    hatims.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return hatims;
  }, []);

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
          setError('Firebase kimlik dogrulamasi basarisiz. Internetinizi kontrol edip tekrar deneyin.');
          setAuthReady(true);
        }
      }
    };
    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchMyHatims = useCallback(async () => {
    const uid = await ensureAuthenticated({ requireFirebaseUser: true });
    if (!uid) return;

    setLoading(true);
    setError(null);
    try {
      const hatims = await loadMemberHatims(uid);
      setActiveHatims(hatims);
    } catch (err) {
      logger.error('Error fetching my hatims:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadMemberHatims]);

  const fetchAllPublicHatims = useCallback(async () => {
    const uid = await ensureAuthenticated({ requireFirebaseUser: true });
    if (!uid) return;

    setLoading(true);
    setError(null);
    try {
      const [publicResult, memberResult] = await Promise.allSettled([
        hatimService.listPublicHatims(),
        loadMemberHatims(uid),
      ]);

      const publicHatims = publicResult.status === 'fulfilled' && Array.isArray(publicResult.value)
        ? publicResult.value
        : [];
      const memberHatims = memberResult.status === 'fulfilled' && Array.isArray(memberResult.value)
        ? memberResult.value
        : [];

      const mergedHatims = [...memberHatims, ...publicHatims]
        .reduce((acc, hatim) => {
          if (!hatim?.id || acc.some((item) => item.id === hatim.id)) {
            return acc;
          }

          acc.push(hatim);
          return acc;
        }, [])
        .sort((a, b) => (b.createdAtMs || b.createdAt?.seconds || 0) - (a.createdAtMs || a.createdAt?.seconds || 0));

      setActiveHatims(mergedHatims);

      if (publicResult.status === 'rejected' && memberResult.status === 'rejected') {
        throw publicResult.reason || memberResult.reason || new Error('Hatimler yuklenemedi');
      }
    } catch (err) {
      logger.error('Error fetching all hatims:', err);
      setError(err?.message || 'Hatimler yuklenemedi');
    } finally {
      setLoading(false);
    }
  }, [loadMemberHatims]);

  useEffect(() => {
    if (!hatimId || !authReady || !userId) return;

    setLoading(true);
    setError(null);

    const unsub = onSnapshot(
      doc(db, 'hatims', hatimId),
      (docSnap) => {
        if (docSnap.exists()) {
          setHatimDetails({ id: docSnap.id, ...docSnap.data() });
          setError(null);
        } else {
          setError('Hatim bulunamadi');
          setHatimDetails(null);
        }
        setLoading(false);
      },
      (err) => {
        logger.error('[useGroupHatim] Hatim subscription error:', err);
        if (err.code === 'permission-denied') {
          setError('Erisim izni hatasi. Lutfen uygulamayi yeniden baslatin.');
        } else {
          setError('Veri guncellenemedi');
        }
        setLoading(false);
      }
    );

    return () => {
      logger.log(`[useGroupHatim] Unsubscribing from hatim: ${hatimId}`);
      unsub();
    };
  }, [hatimId, authReady, userId]);

  const createHatim = async (name, desc, parts) => {
    const result = await hatimService.createGroupHatim(name, desc, parts);
    await fetchMyHatims();
    return result;
  };

  const joinHatim = async (code) => {
    const result = await hatimService.joinGroupHatim(code);
    await fetchAllPublicHatims();
    return result;
  };

  const takePart = async (partId) => {
    try {
      const visibleName = `Mumin-${userId ? userId.substring(0, 4) : 'User'}`;
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
      const visibleName = `Mumin-${userId ? userId.substring(0, 4) : 'User'}`;
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
    userId,
    fetchMyHatims,
    fetchAllPublicHatims,
    createHatim,
    joinHatim,
    takePart,
    releasePart,
    completePart
  };
};
