import { useState, useEffect, useCallback } from "react";
import { onSnapshot, doc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { getDb } from "../services/firebase";
import { hatimService } from "../services/hatimService";
import { ensureAuthenticated } from "../services/authService";
import { logger } from "../utils/logger";
import { HATIM_DISCOVERY_SEEDS } from "../features/social/discoverySeeds";

interface Hatim {
  id: string;
  name: string;
  description?: string;
  parts?: number;
  readers?: string[];
  createdAtMs?: number;
  createdAt?: { seconds: number };
  [key: string]: unknown;
}

interface UseGroupHatimResult {
  loading: boolean;
  error: string | null;
  activeHatims: Hatim[];
  hatimDetails: Hatim | null;
  userId: string | null;
  fetchMyHatims: () => Promise<void>;
  fetchAllPublicHatims: () => Promise<void>;
  createHatim: (name: string, desc: string, parts: number) => Promise<unknown>;
  joinHatim: (code: string) => Promise<unknown>;
  takePart: (partId: string) => Promise<void>;
  releasePart: (partId: string) => Promise<void>;
  completePart: (partId: string) => Promise<void>;
}

const mergeHatimsWithSeeds = (hatims: Hatim[] = []): Hatim[] =>
  [...HATIM_DISCOVERY_SEEDS, ...hatims]
    .reduce((acc: Hatim[], hatim) => {
      if (!hatim?.id || acc.some((item) => item.id === hatim.id)) {
        return acc;
      }
      acc.push(hatim);
      return acc;
    }, [])
    .sort((a, b) => (b.createdAtMs || b.createdAt?.seconds || 0) - (a.createdAtMs || a.createdAt?.seconds || 0));

export const useGroupHatim = (hatimId: string | null = null): UseGroupHatimResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeHatims, setActiveHatims] = useState<Hatim[]>(() => mergeHatimsWithSeeds());
  const [hatimDetails, setHatimDetails] = useState<Hatim | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const loadMemberHatims = useCallback(async (uid: string): Promise<Hatim[]> => {
    const database = await getDb();
    const q = query(collection(database, "hatims"), where("readers", "array-contains", uid), limit(20));
    const snapshot = await getDocs(q);
    const hatims = snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() })) as Hatim[];
    hatims.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return hatims;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const uid = await ensureAuthenticated();
        if (!uid) {
          throw new Error("Firebase auth returned no user");
        }
        if (isMounted) {
          setUserId(uid);
          setAuthReady(true);
          logger.log("[useGroupHatim] Auth initialized, userId:", uid);
        }
      } catch (err) {
        logger.warn("[useGroupHatim] Auth unavailable, using seed hatims:", err);
        if (isMounted) {
          setActiveHatims(mergeHatimsWithSeeds());
          setLoading(false);
          setError(null);
          setAuthReady(true);
        }
      }
    };
    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchMyHatims = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const uid = await ensureAuthenticated({ requireFirebaseUser: true });
      if (!uid) {
        setActiveHatims(mergeHatimsWithSeeds());
        return;
      }

      const hatims = await loadMemberHatims(uid);
      setActiveHatims(mergeHatimsWithSeeds(hatims));
    } catch (err) {
      logger.warn("[useGroupHatim] Falling back to seed hatims:", err);
      setActiveHatims(mergeHatimsWithSeeds());
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [loadMemberHatims]);

  const fetchAllPublicHatims = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const uid = await ensureAuthenticated({ requireFirebaseUser: true });
      if (!uid) {
        setActiveHatims(mergeHatimsWithSeeds());
        return;
      }

      const [publicResult, memberResult] = await Promise.allSettled([
        hatimService.listPublicHatims(),
        loadMemberHatims(uid),
      ]);

      const publicHatims = publicResult.status === "fulfilled" && Array.isArray(publicResult.value) ? publicResult.value : [];
      const memberHatims = memberResult.status === "fulfilled" && Array.isArray(memberResult.value) ? memberResult.value : [];

      setActiveHatims(mergeHatimsWithSeeds([...memberHatims, ...publicHatims]));

      if (publicResult.status === "rejected" && memberResult.status === "rejected") {
        throw publicResult.reason || memberResult.reason || new Error("Hatimler yuklenemedi");
      }
    } catch (err) {
      logger.warn("[useGroupHatim] Falling back to seed hatims:", err);
      setActiveHatims(mergeHatimsWithSeeds());
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [loadMemberHatims]);

  useEffect(() => {
    if (!hatimId || !authReady || !userId) return;

    setLoading(true);
    setError(null);

    let unsub: (() => void) | null = null;
    let isCancelled = false;

    const subscribe = async () => {
      try {
        const database = await getDb();
        if (isCancelled) return;

        unsub = onSnapshot(
          doc(database, "hatims", hatimId),
          (docSnap) => {
            if (docSnap.exists()) {
              setHatimDetails({ id: docSnap.id, ...docSnap.data() } as Hatim);
              setError(null);
            } else {
              setError("Hatim bulunamadi");
              setHatimDetails(null);
            }
            setLoading(false);
          },
          (err) => {
            logger.error("[useGroupHatim] Hatim subscription error:", err);
            if ((err as { code?: string }).code === "permission-denied") {
              setError("Erisim izni hatasi. Lutfen uygulamayi yeniden baslatin.");
            } else {
              setError("Veri guncellenemedi");
            }
            setLoading(false);
          }
        );
      } catch (err) {
        logger.error("[useGroupHatim] Hatim subscription setup error:", err);
        if (!isCancelled) {
          setError("Veri guncellenemedi");
          setLoading(false);
        }
      }
    };

    void subscribe();

    return () => {
      logger.log(`[useGroupHatim] Unsubscribing from hatim: ${hatimId}`);
      isCancelled = true;
      unsub?.();
    };
  }, [hatimId, authReady, userId]);

  const createHatim = async (name: string, desc: string, parts: number): Promise<unknown> => {
    const result = await hatimService.createGroupHatim(name, desc, parts);
    await fetchMyHatims();
    return result;
  };

  const joinHatim = async (code: string): Promise<unknown> => {
    const result = await hatimService.joinGroupHatim(code);
    await fetchAllPublicHatims();
    return result;
  };

  const takePart = async (partId: string): Promise<void> => {
    try {
      const visibleName = `Mumin-${userId ? userId.substring(0, 4) : "User"}`;
      await hatimService.updatePartStatus(hatimId, partId, "taken", { name: visibleName });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const releasePart = async (partId: string): Promise<void> => {
    try {
      await hatimService.updatePartStatus(hatimId, partId, "free", null);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const completePart = async (partId: string): Promise<void> => {
    try {
      const visibleName = `Mumin-${userId ? userId.substring(0, 4) : "User"}`;
      await hatimService.updatePartStatus(hatimId, partId, "completed", { name: visibleName });
    } catch (err) {
      setError((err as Error).message);
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
    completePart,
  };
};
