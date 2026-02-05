import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LEVELS, BADGES } from '../data/gamificationData';
import { getRandomDailyQuests } from '../data/questsData';

export const GamificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGamification = () => useContext(GamificationContext);

export const GamificationProvider = ({ children }) => {
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem('userPoints') || '0'));
  const [earnedBadges, setEarnedBadges] = useState(() => JSON.parse(localStorage.getItem('userBadges') || '[]'));
  
  // Derived Level State
  const level = LEVELS.slice().reverse().find(l => points >= l.minPoints) || LEVELS[0];
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(level);

  // Daily Quests State
  const [dailyQuests, setDailyQuests] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('dailyQuests') || '{}');
    const today = new Date().toDateString();
    if (saved.date !== today) {
        return { date: today, quests: getRandomDailyQuests() };
    }
    return saved;
  });

  useEffect(() => {
    localStorage.setItem('userPoints', points.toString());
    
    // Check for Level Up
    if (level.id > prevLevelRef.current.id) {
      setShowLevelUp(true);
      // Play sound or other effects here if needed
    }
    prevLevelRef.current = level;
  }, [points, level]);

  useEffect(() => {
    localStorage.setItem('userBadges', JSON.stringify(earnedBadges));
  }, [earnedBadges]);

  useEffect(() => {
    localStorage.setItem('dailyQuests', JSON.stringify(dailyQuests));
  }, [dailyQuests]);


  // Removed getLevel function as we now use state


  const addPoints = (amount) => {
    setPoints(prev => prev + amount);
  };

  const awardBadge = (badgeId) => {
    if (!earnedBadges.includes(badgeId)) {
      setEarnedBadges(prev => [...prev, badgeId]);
    }
  };

  /**
   * Görev ilerlemesini güncelle
   * @param {string} type - Görev tipi (zikir, reading, social)
   * @param {string} subType - Alt tip (örn: subhanallah)
   * @param {number} amount - İlerleme miktarı
   */
  const checkQuestProgress = (type, subType, amount = 1) => {
    setDailyQuests(prev => {
        let updated = false;
        const newQuests = prev.quests.map(q => {
            if (q.completed) return q;
            
            // Tip ve Alt Tip eşleşiyor mu?
            // subType yoksa sadece type kontrol edilir (genel görev)
            const typeMatch = q.type === type;
            const subTypeMatch = !q.subType || q.subType === subType;

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
  };

  const claimQuestReward = (questId) => {
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
  };

  const refreshQuests = () => {
      const today = new Date().toDateString();
      setDailyQuests({ date: today, quests: getRandomDailyQuests() });
  };

  // Listen for Streak Service Events to award XP
  useEffect(() => {
    const handleStreakActivity = (event) => {
      const { category, count } = event.detail;
      console.log('XP Awarded via Streak:', category, count);
      
      // Award XP
      addPoints(50); // Base XP for any activity
      
      // Update Daily Quests
      if (category === 'zikir') {
        checkQuestProgress('zikir', null, count || 1);
        
        // Update Native Zikir Widget
        // Dynamically import to avoid build errors on web
        import('@capacitor/core').then(({ Plugins }) => {
            const { Widget } = Plugins;
            if (Widget) {
                // Determine target (default 100 or fetch from settings if available)
                const target = 100; // You might want to get this from storage
                // We need the TOTAL count for today. 
                // Since this event might only have the increment, let's trust the 'count' passed 
                // from streakService which is the total for the day.
                Widget.updateZikirWidget({
                    count: count || 1,
                    target: target
                }).catch(err => console.error('Zikir widget update failed', err));
            }
        });

      } else if (category === 'prayer') {
        checkQuestProgress('prayer', null, 1);
      } else if (category === 'quran') {
        checkQuestProgress('reading', null, 1);
      }
    };

    window.addEventListener('streak:activity', handleStreakActivity);
    return () => window.removeEventListener('streak:activity', handleStreakActivity);
  }, []);

  return (
    <GamificationContext.Provider value={{ 
      points, 
      level, // Now from state
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
    }}>
      {children}
    </GamificationContext.Provider>
  );
};
