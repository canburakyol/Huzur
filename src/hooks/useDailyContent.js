import { useState, useEffect } from 'react';
import { getDailyContent } from '../services/contentService';
import { TIMING } from '../constants';

/**
 * Daily Content Hook
 * Manages daily content (verse, hadith, dua) with midnight refresh
 * 
 * @returns {Object} Daily content state
 */
export const useDailyContent = () => {
  const [dailyContent, setDailyContent] = useState(() => getDailyContent());

  // Daily Content Logic (Midnight Update)
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    ) - now;

    const timeout = setTimeout(() => {
      setDailyContent(getDailyContent());
      
      // After first update, set interval for every 24h
      const interval = setInterval(() => {
        setDailyContent(getDailyContent());
      }, TIMING.DAILY_REFRESH_INTERVAL_MS);
      
      // Note: This cleanup won't run as the component likely won't unmount
      // but we include it for correctness
      return () => clearInterval(interval);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return { dailyContent };
};

export default useDailyContent;
