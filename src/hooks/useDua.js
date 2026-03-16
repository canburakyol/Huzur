import { useEffect, useState } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { duaService } from '../services/duaService';
import { ensureAuthenticated } from '../services/authService';
import { logger } from '../utils/logger';
import { DUA_DISCOVERY_SEEDS } from '../features/social/discoverySeeds';

export const useDua = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duas, setDuas] = useState([]);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [prayedDuaIds, setPrayedDuaIds] = useState(() => new Set());
  const [submittingDuaIds, setSubmittingDuaIds] = useState(() => new Set());

  useEffect(() => {
    const initAuth = async () => {
      try {
        const uid = await ensureAuthenticated();
        setUserId(uid);
        logger.log('[useDua] Auth initialized, userId:', uid);
      } catch (err) {
        logger.error('[useDua] Auth error:', err);
        setError('Firebase kimlik dogrulamasi basarisiz. Internetinizi kontrol edip tekrar deneyin.');
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (authLoading || !userId) {
      return undefined;
    }

    setLoading(true);
    setError(null);

    const duaQuery = query(
      collection(db, 'duas'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(
      duaQuery,
      (snapshot) => {
        const duaList = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        const mergedDuas = [...DUA_DISCOVERY_SEEDS, ...duaList]
          .reduce((acc, dua) => {
            if (!dua?.id || acc.some((item) => item.id === dua.id)) {
              return acc;
            }

            acc.push(dua);
            return acc;
          }, [])
          .sort((a, b) => (b.createdAtMs || b.createdAt?.seconds || 0) - (a.createdAtMs || a.createdAt?.seconds || 0));

        setDuas(mergedDuas);
        setLoading(false);
      },
      (err) => {
        logger.error('[useDua] Firestore error:', err);
        if (err.code === 'permission-denied') {
          setError('Erisim izni hatasi. Lutfen uygulamayi yeniden baslatin.');
        } else {
          setError('Dualar yuklenemedi');
        }
        setLoading(false);
      }
    );
  }, [authLoading, userId]);

  useEffect(() => {
    if (authLoading || !userId) {
      return undefined;
    }

    const userAminQuery = query(collection(db, 'users', userId, 'duaAmins'));
    return onSnapshot(
      userAminQuery,
      (snapshot) => {
        const nextPrayedIds = new Set(snapshot.docs.map((docSnapshot) => docSnapshot.id));
        setPrayedDuaIds(nextPrayedIds);
      },
      (err) => {
        logger.error('[useDua] Dua amin state error:', err);
      }
    );
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
    if (submittingDuaIds.has(duaId) || prayedDuaIds.has(duaId)) {
      return { success: true, alreadyPrayed: true };
    }

    setSubmittingDuaIds((current) => {
      const next = new Set(current);
      next.add(duaId);
      return next;
    });

    try {
      const result = await duaService.prayForDua(duaId);
      setPrayedDuaIds((current) => {
        const next = new Set(current);
        next.add(duaId);
        return next;
      });
      if (typeof result?.aminCount === 'number') {
        setDuas((current) => current.map((dua) => (
          dua.id === duaId
            ? { ...dua, aminCount: result.aminCount }
            : dua
        )));
      }
      return result;
    } catch (err) {
      logger.error('Pray action error:', err);
      throw err;
    } finally {
      setSubmittingDuaIds((current) => {
        const next = new Set(current);
        next.delete(duaId);
        return next;
      });
    }
  };

  return {
    loading,
    error,
    duas,
    userId,
    prayedDuaIds,
    submittingDuaIds,
    createDua,
    prayForDua,
  };
};

export default useDua;
