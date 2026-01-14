import { createContext, useContext, useState, useEffect } from 'react';
import { LEVELS, BADGES } from '../data/gamificationData';

const GamificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGamification = () => useContext(GamificationContext);

export const GamificationProvider = ({ children }) => {
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem('userPoints') || '0'));
  const [earnedBadges, setEarnedBadges] = useState(() => JSON.parse(localStorage.getItem('userBadges') || '[]'));
  
  useEffect(() => {
    localStorage.setItem('userPoints', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('userBadges', JSON.stringify(earnedBadges));
  }, [earnedBadges]);

  const getLevel = () => {
    return LEVELS.slice().reverse().find(l => points >= l.minPoints) || LEVELS[0];
  };

  const addPoints = (amount) => {
    setPoints(prev => prev + amount);
    // Here we could show a toast notification
  };

  const awardBadge = (badgeId) => {
    if (!earnedBadges.includes(badgeId)) {
      setEarnedBadges(prev => [...prev, badgeId]);
      // Show badge earned notification
    }
  };

  return (
    <GamificationContext.Provider value={{ 
      points, 
      level: getLevel(), 
      earnedBadges, 
      BADGES,
      addPoints, 
      awardBadge 
    }}>
      {children}
    </GamificationContext.Provider>
  );
};
