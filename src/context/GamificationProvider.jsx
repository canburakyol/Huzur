import { useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getCurrentUserId } from '../services/authService';
import { LEVELS, BADGES } from '../data/gamificationData';
import { getRandomDailyQuests } from '../data/questsData';
import { useAppStore } from '../stores/useAppStore';
import { storageService } from '../services/storageService';
import { logger } from '../utils/logger';
import crashlyticsReporter from '../utils/crashlyticsReporter';
import { logBadgeEarned, logLevelUp } from '../services/analyticsService';
import { markFirstIbadahActionCompleted } from '../services/activationService';
import { contributeFamilyGoalOncePerDay } from '../services/familyGoalContributionService';

const CACHE_KEY = 'gamification_cache';
const CACHE_TTL_MS = 5 * 60 * 1000;

const readCache = () => {
  try {
    const raw = storageService.getItem(CACHE_KEY, null);
    if (!raw) return null;
    const { data, timestamp } = raw;
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return data;
  } catch (err) {
    logger.warn('[GamificationProvider] Cache read failed:', err);
    return null;
  }
};

const writeCache = (data) => {
  try {
    storageService.setItem(CACHE_KEY, { data, timestamp: Date.now() });
  } catch (err) {
    logger.warn('[GamificationProvider] Cache write failed:', err);
  }
};

export const GamificationProvider = ({ children }) => {
  const prevLevelRef = useRef(null);
  const prevBadgesRef = useRef([]);

  const points = useAppStore((s) => s.points);
  const earnedBadges = useAppStore((s) => s.earnedBadges);
  const dailyQuests = useAppStore((s) => s.dailyQuests);
  const dailyQuestsLoaded = useAppStore((s) => s.dailyQuestsLoaded);

  const setPoints = useAppStore((s) => s.setPoints);
  const setBadges = useAppStore((s) => s.setBadges);
  const setShowLevelUp = useAppStore((s) => s.setShowLevelUp);
  const setDailyQuests = useAppStore((s) => s.setDailyQuests);
  const addPoints = useAppStore((s) => s.addPoints);
  const updateQuestProgress = useAppStore((s) => s.updateQuestProgress);

  const level = LEVELS.slice().reverse().find((l) => points >= l.minPoints) || LEVELS[0];

  // Initialize from cache
  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setPoints(cached.points ?? 0);
      setBadges(cached.earnedBadges ?? []);
    }

    const saved = storageService.getItem('dailyQuests', {});
    const today = new Date().toDateString();
    if (saved.date !== today) {
      setDailyQuests({ date: today, quests: getRandomDailyQuests() });
    } else {
      setDailyQuests(saved);
    }
  }, [setPoints, setBadges, setDailyQuests]);

  // Persist dailyQuests
  useEffect(() => {
    if (dailyQuestsLoaded && dailyQuests.date) {
      storageService.setItem('dailyQuests', dailyQuests);
    }
  }, [dailyQuests, dailyQuestsLoaded]);

  // Firestore sync
  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const fsPoints = data.points ?? 0;
          const fsBadges = (data.earnedBadges ?? [])
            .map((b) => (typeof b === 'string' ? b : b.badgeId ?? b.id ?? null))
            .filter(Boolean);

          setPoints(fsPoints);
          setBadges(fsBadges);
          writeCache({ points: fsPoints, earnedBadges: fsBadges });
        }
      },
      (error) => {
        logger.error('[GamificationProvider] Firestore snapshot error:', error);
        crashlyticsReporter.logExceptionWithContext(error, {
          surface: 'gamification_onSnapshot',
        });
      }
    );

    return () => unsubscribe();
  }, [setPoints, setBadges]);

  // Level up detection
  useEffect(() => {
    if (!prevLevelRef.current) {
      prevLevelRef.current = level;
      return;
    }
    if (level.level > prevLevelRef.current.level) {
      logLevelUp(level.level, points);
      requestAnimationFrame(() => setShowLevelUp(true));
    }
    prevLevelRef.current = level;
  }, [level, points, setShowLevelUp]);

  // Badge detection
  useEffect(() => {
    const previousBadgeIds = new Set(
      (prevBadgesRef.current || [])
        .map((badge) => (typeof badge === 'string' ? badge : badge?.badgeId || badge?.id))
        .filter(Boolean)
    );

    earnedBadges.forEach((badge) => {
      const badgeId = typeof badge === 'string' ? badge : badge?.badgeId || badge?.id;
      if (!badgeId || previousBadgeIds.has(badgeId)) return;

      const badgeMeta = Object.values(BADGES).find((item) => item.id === badgeId);
      logBadgeEarned(badgeId, badgeMeta?.name || badgeId);
    });

    prevBadgesRef.current = earnedBadges;
  }, [earnedBadges]);

  // streak:activity event -> Zustand action
  useEffect(() => {
    const handleStreakActivity = async (event) => {
      const { category, count } = event.detail;

      addPoints(50, { source: `streak_${category}` });

      if (category === 'zikir') {
        markFirstIbadahActionCompleted({ feature: 'zikirmatik', source: 'streak:zikir' });
        updateQuestProgress('zikir', null, count || 1);
        void contributeFamilyGoalOncePerDay('streak_zikir', 'streak_zikir');
      } else if (category === 'prayer') {
        markFirstIbadahActionCompleted({ feature: 'dailyTasks', source: 'streak:prayer' });
        updateQuestProgress('prayer', null, 1);
        void contributeFamilyGoalOncePerDay('streak_prayer', 'streak_prayer');
      } else if (category === 'quran') {
        markFirstIbadahActionCompleted({ feature: 'quran', source: 'streak:quran' });
        updateQuestProgress('reading', null, 1);
        void contributeFamilyGoalOncePerDay('streak_quran', 'streak_quran');
      }
    };

    window.addEventListener('streak:activity', handleStreakActivity);
    return () => window.removeEventListener('streak:activity', handleStreakActivity);
  }, [addPoints, updateQuestProgress]);

  // quest:progress event -> Zustand action
  useEffect(() => {
    const handleQuestProgressEvent = (event) => {
      const { type, subType = null, amount = 1 } = event.detail || {};
      if (!type) return;
      updateQuestProgress(type, subType, amount);
    };

    window.addEventListener('quest:progress', handleQuestProgressEvent);
    return () => window.removeEventListener('quest:progress', handleQuestProgressEvent);
  }, [updateQuestProgress]);

  return children;
};
