import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, increment, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getCurrentUserId } from '../services/authService';
import { LEVELS, BADGES } from '../data/gamificationData';
import { getRandomDailyQuests } from '../data/questsData';
import { GamificationContext } from './GamificationContext';
import { storageService } from '../services/storageService';
import { recordXpEvent } from '../services/engagementSummaryService';
import { ANALYTICS_EVENTS, logBadgeEarned, logEvent, logLevelUp } from '../services/analyticsService';
import { markFirstIbadahActionCompleted } from '../services/activationService';
import { contributeFamilyGoalOncePerDay } from '../services/familyGoalContributionService';
import { getXpMultiplier } from '../utils/xpMultiplier';
import { logger } from '../utils/logger';
import crashlyticsReporter from '../utils/crashlyticsReporter';

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

const writeUserDoc = async (userId, updates) => {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
  } catch (err) {
    logger.error('[GamificationProvider] Firestore write failed:', err);
    crashlyticsReporter.logExceptionWithContext(err, { surface: 'gamification_write' });
  }
};

export const GamificationProvider = ({ children }) => {
  const cached = readCache();
  const [points, setPoints] = useState(cached?.points ?? 0);
  const [earnedBadges, setEarnedBadges] = useState(cached?.earnedBadges ?? []);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(null);
  const prevBadgesRef = useRef([]);

  const [dailyQuests, setDailyQuests] = useState(() => {
    const saved = storageService.getItem('dailyQuests', {});
    const today = new Date().toDateString();
    if (saved.date !== today) {
      return { date: today, quests: getRandomDailyQuests() };
    }
    return saved;
  });

  useEffect(() => {
    storageService.setItem('dailyQuests', dailyQuests);
  }, [dailyQuests]);

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
          const fsBadges = (data.earnedBadges ?? []).map((b) =>
            typeof b === 'string' ? b : b.badgeId ?? b.id ?? null
          ).filter(Boolean);

          setPoints(fsPoints);
          setEarnedBadges(fsBadges);
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
  }, []);

  const level = useMemo(() => LEVELS.slice().reverse().find((l) => points >= l.minPoints) || LEVELS[0], [points]);

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
  }, [level, points]);

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

  const addPoints = useCallback((amount, options = {}) => {
    const numericAmount = Number(amount) || 0;
    if (numericAmount === 0) return 0;

    const {
      applyMultiplier = true,
      source = 'general'
    } = options;

    const multiplier = applyMultiplier ? getXpMultiplier() : 1;
    const appliedAmount = Math.round(numericAmount * multiplier);

    setPoints((prev) => {
      const newPoints = prev + appliedAmount;
      const userId = getCurrentUserId();
      if (userId) {
        void writeUserDoc(userId, {
          points: increment(appliedAmount),
          updatedAt: serverTimestamp(),
        });
      }
      return newPoints;
    });

    recordXpEvent({
      baseAmount: numericAmount,
      appliedAmount,
      source
    });
    logEvent(ANALYTICS_EVENTS.XP_EARNED, {
      source,
      base_amount: numericAmount,
      applied_amount: appliedAmount,
      multiplier_applied: applyMultiplier,
      multiplier_value: multiplier
    });

    return appliedAmount;
  }, []);

  const awardBadge = useCallback((badgeId) => {
    setEarnedBadges((prev) => {
      if (!prev.includes(badgeId)) {
        const userId = getCurrentUserId();
        if (userId) {
          void writeUserDoc(userId, {
            earnedBadges: arrayUnion({ badgeId, earnedAt: new Date().toISOString() }),
            updatedAt: serverTimestamp(),
          });
        }
        return [...prev, badgeId];
      }
      return prev;
    });
  }, []);

  const checkQuestProgress = useCallback((type, subType, amount = 1) => {
    setDailyQuests(prev => {
        let updated = false;
        const newQuests = prev.quests.map(q => {
            if (q.completed) return q;
            
            const typeMatch = q.type === type;
            const subTypeMatch = !subType || !q.subType || q.subType === subType;

            if (typeMatch && subTypeMatch) {
                 const newProgress = Math.min(q.progress + amount, q.target);
                 if (newProgress !== q.progress) {
                      updated = true;
                      const isCompleted = newProgress >= q.target;
                      return { ...q, progress: newProgress, completed: isCompleted };
                 }
            }
            return q;
        });

        if (!updated) return prev;
        return { ...prev, quests: newQuests };
    });
  }, []);

  const claimQuestReward = useCallback((questId) => {
    setDailyQuests(prev => {
        const quest = prev.quests.find(q => q.id === questId);
        if (quest && quest.completed && !quest.isClaimed) {
            addPoints(quest.xp, { source: 'daily_quest_reward' });
            const newQuests = prev.quests.map(q => 
                q.id === questId ? { ...q, isClaimed: true } : q
            );
            return { ...prev, quests: newQuests };
        }
        return prev;
    });
  }, [addPoints]);

  const refreshQuests = useCallback(() => {
      const today = new Date().toDateString();
      setDailyQuests({ date: today, quests: getRandomDailyQuests() });
  }, []);

  useEffect(() => {
    const handleStreakActivity = async (event) => {
      const { category, count } = event.detail;
      
      addPoints(50, { source: `streak_${category}` });
      
      if (category === 'zikir') {
        markFirstIbadahActionCompleted({ feature: 'zikirmatik', source: 'streak:zikir' });
        checkQuestProgress('zikir', null, count || 1);
        void contributeFamilyGoalOncePerDay('streak_zikir', 'streak_zikir');

      } else if (category === 'prayer') {
        markFirstIbadahActionCompleted({ feature: 'dailyTasks', source: 'streak:prayer' });
        checkQuestProgress('prayer', null, 1);
        void contributeFamilyGoalOncePerDay('streak_prayer', 'streak_prayer');
      } else if (category === 'quran') {
        markFirstIbadahActionCompleted({ feature: 'quran', source: 'streak:quran' });
        checkQuestProgress('reading', null, 1);
        void contributeFamilyGoalOncePerDay('streak_quran', 'streak_quran');
      }
    };

    window.addEventListener('streak:activity', handleStreakActivity);
    return () => window.removeEventListener('streak:activity', handleStreakActivity);
  }, [addPoints, checkQuestProgress]);

  useEffect(() => {
    const handleQuestProgressEvent = (event) => {
      const { type, subType = null, amount = 1 } = event.detail || {};
      if (!type) return;
      checkQuestProgress(type, subType, amount);
    };

    window.addEventListener('quest:progress', handleQuestProgressEvent);
    return () => window.removeEventListener('quest:progress', handleQuestProgressEvent);
  }, [checkQuestProgress]);

  const badgeDetails = useMemo(() => {
    const badgeIds = earnedBadges.map((badge) => (typeof badge === 'string' ? badge : badge?.badgeId || badge?.id));

    return badgeIds
      .map((badgeId) => Object.values(BADGES).find((badge) => badge.id === badgeId))
      .filter(Boolean);
  }, [earnedBadges]);

  const contextValue = useMemo(() => ({
    points,
    level,
    title: level?.title || 'Yeni Baslayan',
    showLevelUp,
    setShowLevelUp,
    earnedBadges,
    badgeDetails,
    badges: badgeDetails,
    dailyQuests,
    BADGES,
    addPoints,
    awardBadge,
    checkQuestProgress,
    claimQuestReward,
    refreshQuests
  }), [
    points, 
    level, 
    showLevelUp, 
    earnedBadges,
    badgeDetails,
    dailyQuests,
    addPoints,
    awardBadge,
    checkQuestProgress,
    claimQuestReward,
    refreshQuests
  ]);

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
};
