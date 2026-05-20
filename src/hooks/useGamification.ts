import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../stores/useAppStore";
import { LEVELS, BADGES } from "../data/gamificationData";
import { getRandomDailyQuests } from "../data/questsData";
import { getXpMultiplier } from "../utils/xpMultiplier";
import { recordXpEvent } from "../services/engagementSummaryService";
import { ANALYTICS_EVENTS, logEvent, logBadgeEarned } from "../services/analyticsService";
import { getCurrentUserId } from "../services/authService";
import { doc, updateDoc, increment, arrayUnion, serverTimestamp } from "firebase/firestore";
import { getDb } from "../services/firebase";
import crashlyticsReporter from "../utils/crashlyticsReporter";
import { logger } from "../utils/logger";

interface AddPointsOptions {
  applyMultiplier?: boolean;
  source?: string;
}

interface GamificationResult {
  points: number;
  level: typeof LEVELS[number];
  title: string;
  showLevelUp: boolean;
  setShowLevelUp: (show: boolean) => void;
  earnedBadges: string[];
  badgeDetails: (typeof BADGES)[string][];
  badges: (typeof BADGES)[string][];
  dailyQuests: { date: string; quests: Array<{ id: string; type: string; subType?: string; progress: number; target: number; completed: boolean; isClaimed?: boolean; xp: number }> };
  BADGES: typeof BADGES;
  addPoints: (amount: number, options?: AddPointsOptions) => number;
  awardBadge: (badgeId: string) => void;
  checkQuestProgress: (type: string, subType?: string, amount?: number) => void;
  claimQuestReward: (questId: string) => void;
  refreshQuests: () => void;
  setPoints: (points: number) => void;
  setBadges: (badges: string[]) => void;
  setDailyQuests: (quests: { date: string; quests: Array<{ id: string; type: string; subType?: string; progress: number; target: number; completed: boolean; isClaimed?: boolean; xp: number }> }) => void;
}

const writeUserDoc = async (userId: string, updates: Record<string, unknown>): Promise<void> => {
  try {
    const database = await getDb();
    await updateDoc(doc(database, "users", userId), updates);
  } catch (err) {
    logger.error("[useGamification] Firestore write failed:", err);
    crashlyticsReporter.logExceptionWithContext(err as Error, { surface: "gamification_write" });
  }
};

export const useGamification = (): GamificationResult => {
  const { t } = useTranslation();

  const points = useAppStore((s) => s.points);
  const earnedBadges = useAppStore((s) => s.earnedBadges);
  const showLevelUp = useAppStore((s) => s.showLevelUp);
  const setShowLevelUp = useAppStore((s) => s.setShowLevelUp);
  const dailyQuests = useAppStore((s) => s.dailyQuests);
  const updatePoints = useAppStore((s) => s.updatePoints);
  const addBadge = useAppStore((s) => s.addBadge);
  const updateQuestProgress = useAppStore((s) => s.updateQuestProgress);
  const claimQuestReward = useAppStore((s) => s.claimQuestReward);
  const refreshQuests = useAppStore((s) => s.refreshQuests);
  const setPoints = useAppStore((s) => s.setPoints);
  const setBadges = useAppStore((s) => s.setBadges);
  const setDailyQuests = useAppStore((s) => s.setDailyQuests);

  const level = useMemo(
    () => LEVELS.slice().reverse().find((l) => points >= l.minPoints) || LEVELS[0],
    [points]
  );

  const badgeDetails = useMemo(() => {
    const badgeIds = earnedBadges.map((badge) => (typeof badge === "string" ? badge : badge?.badgeId || badge?.id));
    return badgeIds.map((badgeId) => Object.values(BADGES).find((badge) => badge.id === badgeId)).filter(Boolean) as (typeof BADGES)[string][];
  }, [earnedBadges]);

  const addPoints = useCallback(
    (amount: number, options: AddPointsOptions = {}): number => {
      const numericAmount = Number(amount) || 0;
      if (numericAmount === 0) return 0;

      const { applyMultiplier = true, source = "general" } = options;
      const multiplier = applyMultiplier ? getXpMultiplier() : 1;
      const appliedAmount = Math.round(numericAmount * multiplier);

      updatePoints(appliedAmount);

      const userId = getCurrentUserId();
      if (userId) {
        void writeUserDoc(userId, {
          points: increment(appliedAmount),
          updatedAt: serverTimestamp(),
        });
      }

      recordXpEvent({ baseAmount: numericAmount, appliedAmount, source });
      logEvent(ANALYTICS_EVENTS.XP_EARNED, {
        source,
        base_amount: numericAmount,
        applied_amount: appliedAmount,
        multiplier_applied: applyMultiplier,
        multiplier_value: multiplier,
      });

      return appliedAmount;
    },
    [updatePoints]
  );

  const awardBadge = useCallback(
    (badgeId: string): void => {
      addBadge(badgeId);

      const userId = getCurrentUserId();
      if (userId) {
        void writeUserDoc(userId, {
          earnedBadges: arrayUnion({ badgeId, earnedAt: new Date().toISOString() }),
          updatedAt: serverTimestamp(),
        });
      }

      const badgeMeta = Object.values(BADGES).find((item) => item.id === badgeId);
      logBadgeEarned(badgeId, badgeMeta?.name || badgeId);
    },
    [addBadge]
  );

  const checkQuestProgress = useCallback(
    (type: string, subType?: string, amount = 1): void => {
      updateQuestProgress(type, subType, amount);
    },
    [updateQuestProgress]
  );

  const doClaimQuestReward = useCallback(
    (questId: string): void => {
      claimQuestReward(questId, addPoints);
    },
    [claimQuestReward, addPoints]
  );

  const doRefreshQuests = useCallback((): void => {
    refreshQuests(getRandomDailyQuests);
  }, [refreshQuests]);

  return {
    points,
    level,
    title: level?.title || t("gamification.beginnerTitle"),
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
    claimQuestReward: doClaimQuestReward,
    refreshQuests: doRefreshQuests,
    setPoints,
    setBadges,
    setDailyQuests,
  };
};

export default useGamification;
