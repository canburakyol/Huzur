import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LEVELS, BADGES } from '../data/gamificationData';
import { getRandomDailyQuests } from '../data/questsData';
import { GamificationContext } from './GamificationContext';
import { storageService } from '../services/storageService';
import { recordXpEvent } from '../services/engagementSummaryService';
import { ANALYTICS_EVENTS, logBadgeEarned, logEvent, logLevelUp } from '../services/analyticsService';
import { markFirstIbadahActionCompleted } from '../services/activationService';
import { contributeFamilyGoalOncePerDay } from '../services/familyGoalContributionService';
import { getXpMultiplier } from '../utils/xpMultiplier';

const GAMIFICATION_KEYS = {
  USER_POINTS: 'userPoints',
  USER_BADGES: 'userBadges',
  DAILY_QUESTS: 'dailyQuests'
};

export const GamificationProvider = ({ children }) => {
  const [points, setPoints] = useState(() => parseInt(storageService.getString(GAMIFICATION_KEYS.USER_POINTS, '0'), 10) || 0);
  const [earnedBadges, setEarnedBadges] = useState(() => storageService.getItem(GAMIFICATION_KEYS.USER_BADGES, []));
  
  // Derived Level State
  const level = useMemo(() => LEVELS.slice().reverse().find(l => points >= l.minPoints) || LEVELS[0], [points]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(level);
  const prevBadgesRef = useRef(earnedBadges);

  // Daily Quests State
  const [dailyQuests, setDailyQuests] = useState(() => {
    const saved = storageService.getItem(GAMIFICATION_KEYS.DAILY_QUESTS, {});
    const today = new Date().toDateString();
    if (saved.date !== today) {
        return { date: today, quests: getRandomDailyQuests() };
    }
    return saved;
  });

  useEffect(() => {
    storageService.setString(GAMIFICATION_KEYS.USER_POINTS, points.toString());
    
    // Check for Level Up
    let levelUpTimer;
    if (level.level > prevLevelRef.current.level) {
      logLevelUp(level.level, points);
      levelUpTimer = setTimeout(() => setShowLevelUp(true), 0);
      // Play sound or other effects here if needed
    }
    prevLevelRef.current = level;

    return () => {
      if (levelUpTimer) clearTimeout(levelUpTimer);
    };
  }, [points, level]);

  useEffect(() => {
    storageService.setItem(GAMIFICATION_KEYS.USER_BADGES, earnedBadges);
  }, [earnedBadges]);

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

  useEffect(() => {
    storageService.setItem(GAMIFICATION_KEYS.DAILY_QUESTS, dailyQuests);
  }, [dailyQuests]);


  // Removed getLevel function as we now use state


  const addPoints = useCallback((amount, options = {}) => {
    const numericAmount = Number(amount) || 0;
    if (numericAmount === 0) return 0;

    const {
      applyMultiplier = true,
      source = 'general'
    } = options;

    const multiplier = applyMultiplier ? getXpMultiplier() : 1;
    const appliedAmount = Math.round(numericAmount * multiplier);

    setPoints(prev => prev + appliedAmount);
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
    setEarnedBadges(prev => {
      if (!prev.includes(badgeId)) {
        return [...prev, badgeId];
      }
      return prev;
    });
  }, []);

  /**
   * Görev ilerlemesini güncelle
   * @param {string} type - Görev tipi (zikir, reading, social)
   * @param {string} subType - Alt tip (örn: subhanallah) - null ise tüm quests güncellenir
   * @param {number} amount - İlerleme miktarı
   */
  const checkQuestProgress = useCallback((type, subType, amount = 1) => {
    setDailyQuests(prev => {
        let updated = false;
        const newQuests = prev.quests.map(q => {
            if (q.completed) return q;
            
            // Tip eşleşiyor mu?
            const typeMatch = q.type === type;
            
            // subType null geçilirse, tüm ilgili tipdeki görevleri güncelle
            // subType verilirse, sadece o subType'a sahip görevleri güncelle
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

  // Listen for Streak Service Events to award XP
  useEffect(() => {
    const handleStreakActivity = async (event) => {
      const { category, count } = event.detail;
      
      
      // Award XP
      addPoints(50, { source: `streak_${category}` }); // Base XP for any activity
      
      // Update Daily Quests
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
