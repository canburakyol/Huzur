import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getDailyContent } from "../services/contentService";
import { TIMING } from "../constants";

type DailyContent = {
  [key: string]: unknown;
}

export const useDailyContent = (): { dailyContent: DailyContent } => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const [dailyContent, setDailyContent] = useState<DailyContent>(() => getDailyContent(language));

  useEffect(() => {
    setDailyContent(getDailyContent(language));

    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0).getTime() - now.getTime();
    let interval: ReturnType<typeof setInterval> | null = null;

    const timeout = setTimeout(() => {
      setDailyContent(getDailyContent(language));

      interval = setInterval(() => {
        setDailyContent(getDailyContent(language));
      }, TIMING.DAILY_REFRESH_INTERVAL_MS);
    }, msUntilMidnight);

    return () => {
      clearTimeout(timeout);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [language]);

  return { dailyContent };
};

export default useDailyContent;
