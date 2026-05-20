import { useState, useEffect } from "react";
import { getDailyContent } from "../services/contentService";
import { TIMING } from "../constants";

interface DailyContent {
  [key: string]: unknown;
}

export const useDailyContent = (): { dailyContent: DailyContent } => {
  const [dailyContent, setDailyContent] = useState<DailyContent>(() => getDailyContent());

  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0).getTime() - now.getTime();
    let interval: ReturnType<typeof setInterval> | null = null;

    const timeout = setTimeout(() => {
      setDailyContent(getDailyContent());

      interval = setInterval(() => {
        setDailyContent(getDailyContent());
      }, TIMING.DAILY_REFRESH_INTERVAL_MS);
    }, msUntilMidnight);

    return () => {
      clearTimeout(timeout);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return { dailyContent };
};

export default useDailyContent;
