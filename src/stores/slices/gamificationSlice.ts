import { StateCreator } from "zustand";
import { AppStoreState, GamificationSlice, DailyQuests, Quest } from "./types";

export const createGamificationSlice: StateCreator<
  AppStoreState,
  [],
  [],
  GamificationSlice
> = (set) => ({
  points: 0,
  level: null,
  earnedBadges: [] as string[],
  badgeDetails: [] as Record<string, unknown>[],
  showLevelUp: false,
  dailyQuests: { date: "", quests: [] } as DailyQuests,
  dailyQuestsLoaded: false,

  setPoints: (points: number) => set({ points }),
  setBadges: (badges: string[]) => set({ earnedBadges: badges }),
  setShowLevelUp: (show: boolean) => set({ showLevelUp: show }),
  setDailyQuests: (quests: DailyQuests) => set({ dailyQuests: quests, dailyQuestsLoaded: true }),

  updatePoints: (appliedAmount: number) =>
    set((state) => ({
      points: state.points + appliedAmount,
    })),

  addBadge: (badgeId: string) =>
    set((state) => {
      if (!state.earnedBadges.includes(badgeId)) {
        return { earnedBadges: [...state.earnedBadges, badgeId] };
      }
      return state;
    }),

  updateQuestProgress: (type: string, subType?: string, amount = 1) =>
    set((state) => {
      let updated = false;
      const newQuests = state.dailyQuests.quests.map((q) => {
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

      if (!updated) return state;
      return { dailyQuests: { ...state.dailyQuests, quests: newQuests } };
    }),

  claimQuestReward: (questId: string, addPointsFn: (amount: number, meta: { source: string }) => void) =>
    set((state) => {
      const quest = state.dailyQuests.quests.find((q) => q.id === questId);
      if (quest && quest.completed && !quest.isClaimed) {
        addPointsFn(quest.xp, { source: "daily_quest_reward" });
        const newQuests = state.dailyQuests.quests.map((q) =>
          q.id === questId ? { ...q, isClaimed: true } : q
        );
        return { dailyQuests: { ...state.dailyQuests, quests: newQuests } };
      }
      return state;
    }),

  refreshQuests: (getRandomQuests: () => Quest[]) =>
    set(() => ({
      dailyQuests: { date: new Date().toDateString(), quests: getRandomQuests() },
    })),
});
