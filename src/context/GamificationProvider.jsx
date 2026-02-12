import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { LEVELS, BADGES } from '../data/gamificationData';
import { getRandomDailyQuests } from '../data/questsData';
import { GamificationContext } from './GamificationContext';
import { storageService } from '../services/storageService';

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
    if (level.id > prevLevelRef.current.id) {
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
    storageService.setItem(GAMIFICATION_KEYS.DAILY_QUESTS, dailyQuests);
  }, [dailyQuests]);


  // Removed getLevel function as we now use state


  const addPoints = useCallback((amount) => {
    setPoints(prev => prev + amount);
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
            addPoints(quest.xp);
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
      addPoints(50); // Base XP for any activity
      
      // Update Daily Quests
      if (category === 'zikir') {
        checkQuestProgress('zikir', null, count || 1);

      } else if (category === 'prayer') {
        checkQuestProgress('prayer', null, 1);
      } else if (category === 'quran') {
        checkQuestProgress('reading', null, 1);
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

  const contextValue = useMemo(() => ({
    points,
    level,
    showLevelUp,
    setShowLevelUp,
    earnedBadges,
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
