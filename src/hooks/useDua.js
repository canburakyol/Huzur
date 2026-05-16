import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { duaService } from '../services/duaService';
import { ensureAuthenticated } from '../services/authService';
import { logger } from '../utils/logger';
import { DUA_DISCOVERY_SEEDS } from '../features/social/discoverySeeds';

const mergeDuasWithSeeds = (duaList = []) => [...DUA_DISCOVERY_SEEDS, ...duaList]
  .reduce((acc, dua) => {
    if (!dua?.id || acc.some((item) => item.id === dua.id)) {
      return acc;
    }

    acc.push(dua);
    return acc;
  }, [])
  .sort((a, b) => (b.createdAtMs || b.createdAt?.seconds || 0) - (a.createdAtMs || a.createdAt?.seconds || 0));

export const useDua = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duas, setDuas] = useState(() => mergeDuasWithSeeds());
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [prayedDuaIds, setPrayedDuaIds] = useState(() => new Set());
  const [submittingDuaIds, setSubmittingDuaIds] = useState(() => new Set());

  const loadRecentDuas = async () => {
    try {
      const duaList = await duaService.getRecentDuas(25);
      setDuas(mergeDuasWithSeeds(duaList));
      setError(null);
    } catch (err) {
      logger.warn('[useDua] Falling back to seed duas:', err);
      setDuas(mergeDuasWithSeeds());
      setError(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const uid = await ensureAuthenticated();
        if (!uid) {
          throw new Error('Firebase auth returned no user');
        }
        setUserId(uid);
        logger.log('[useDua] Auth initialized, userId:', uid);
      } catch (err) {
        logger.warn('[useDua] Auth unavailable, using seed duas:', err);
        setDuas(mergeDuasWithSeeds());
        setLoading(false);
        setError(null);
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

    let isMounted = true;

    const fetchDuas = async () => {
      setLoading(true);
      setError(null);

      try {
        await loadRecentDuas();
      } catch (err) {
        logger.error('[useDua] Fetch duas error:', err);
        if (isMounted) {
          setError('Dualar yuklenemedi');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDuas();

    return () => {
      isMounted = false;
    };
  }, [authLoading, userId]);

  useEffect(() => {
    if (authLoading || !userId) {
      return undefined;
    }

    let isMounted = true;

    const fetchPrayedDuas = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users', userId, 'duaAmins'));
        if (!isMounted) return;

        const nextPrayedIds = new Set(snapshot.docs.map((docSnapshot) => docSnapshot.id));
        setPrayedDuaIds(nextPrayedIds);
      } catch (err) {
        logger.error('[useDua] Dua amin state error:', err);
      }
    };

    fetchPrayedDuas();

    return () => {
      isMounted = false;
    };
  }, [authLoading, userId]);

  const createDua = async (text, isAnonymous, authorName) => {
    try {
      const createdDua = await duaService.createDua(text, isAnonymous, authorName);
      if (createdDua?.id) {
        setDuas((current) => {
          const withoutDuplicate = current.filter((dua) => dua.id !== createdDua.id);
          return [createdDua, ...withoutDuplicate].sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
        });
      }
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
    refreshDuas: loadRecentDuas,
  };
};

export default useDua;
