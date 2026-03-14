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

export const useDua = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duas, setDuas] = useState([]);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [prayedDuaIds, setPrayedDuaIds] = useState(() => new Set());

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
        setDuas(duaList);
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
    try {
      const result = await duaService.prayForDua(duaId);
      setPrayedDuaIds((current) => {
        const next = new Set(current);
        next.add(duaId);
        return next;
      });
      return result;
    } catch (err) {
      logger.error('Pray action error:', err);
      throw err;
    }
  };

  return {
    loading,
    error,
    duas,
    userId,
    prayedDuaIds,
    createDua,
    prayForDua,
  };
};

export default useDua;
