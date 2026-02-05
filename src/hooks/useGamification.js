import { useContext } from 'react';
import { GamificationContext } from '../context/GamificationContext';

/**
 * useGamification Hook
 * Gamification context'ine erişim sağlar
 * 
 * @returns {Object} { points, level, earnedBadges, BADGES, addPoints, awardBadge }
 */
export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};

export default useGamification;
