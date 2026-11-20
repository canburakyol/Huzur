export type Toast = {
  id: number;
  message: string;
  type: string;
  duration: number;
}

export type Quest = {
  id: string;
  type: string;
  subType?: string;
  progress: number;
  target: number;
  completed: boolean;
  isClaimed?: boolean;
  xp: number;
}

export type DailyQuests = {
  date: string;
  quests: Quest[];
}

export type InviteModalContext = {
  source: string;
}

export type Settings = {
  language: string;
  theme: string;
  notifications: boolean;
  stickyNotification: boolean;
}

export type Family = {
  id: string;
  name: string;
  [key: string]: unknown;
}

export type WeeklyGoal = {
  id: string;
  [key: string]: unknown;
}

export type PrayerTimes = {
  [key: string]: unknown;
}

export type NextPrayer = {
  name: string;
  [key: string]: unknown;
}

export type SettingsSlice = {
  settings: Settings;
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  setNotifications: (enabled: boolean) => void;
  setStickyNotification: (enabled: boolean) => void;
}

export type FocusSlice = {
  isFocusMode: boolean;
  activeFocusSession: import("../../services/focusSessionService").FocusSession | null;
  setActiveFocusSession: (session: import("../../services/focusSessionService").FocusSession | null) => void;
  toggleFocusMode: () => void;
  enableFocusMode: () => void;
  disableFocusMode: () => void;
}

export type TimeSlice = {
  timeOfDay: string;
  greetingKey: string;
  refreshTimeState: () => void;
}

export type ToastSlice = {
  toasts: Toast[];
  showToast: (message: string, type?: string, duration?: number) => void;
  removeToast: (id: number) => void;
}

export type GamificationSlice = {
  points: number;
  level: number | null;
  earnedBadges: string[];
  badgeDetails: Record<string, unknown>[];
  showLevelUp: boolean;
  dailyQuests: DailyQuests;
  dailyQuestsLoaded: boolean;
  setPoints: (points: number) => void;
  setBadges: (badges: string[]) => void;
  setShowLevelUp: (show: boolean) => void;
  setDailyQuests: (quests: DailyQuests) => void;
  updatePoints: (appliedAmount: number) => void;
  addBadge: (badgeId: string) => void;
  updateQuestProgress: (type: string, subType?: string, amount?: number) => void;
  claimQuestReward: (questId: string, addPointsFn: (amount: number, meta: { source: string }) => void) => void;
  refreshQuests: (getRandomQuests: () => Quest[]) => void;
}

export type NavigationSlice = {
  activeFeature: string | null;
  activeTab: string;
  showHamburgerMenu: boolean;
  showMoodSelector: boolean;
  showSplash: boolean;
  showInviteModal: boolean;
  inviteModalContext: InviteModalContext;
  setActiveFeature: (feature: string | null) => void;
  setActiveTab: (tab: string) => void;
  setShowHamburgerMenu: (show: boolean) => void;
  setShowMoodSelector: (show: boolean) => void;
  hideSplash: () => void;
  openInviteModal: (context?: string | InviteModalContext) => void;
  closeInviteModal: () => void;
}

export type ProSlice = {
  isProUser: boolean;
  setIsProUser: (active: boolean) => void;
}

export type FamilySlice = {
  family: Family | null;
  publicFamilies: Family[];
  weeklyGoal: WeeklyGoal | null;
  weeklyGoalLoading: boolean;
  familyLoading: boolean;
  familyError: string | null;
  setFamily: (family: Family | null) => void;
  setPublicFamilies: (families: Family[]) => void;
  setWeeklyGoal: (goal: WeeklyGoal | null) => void;
  setFamilyLoading: (loading: boolean) => void;
  setFamilyError: (error: string | null) => void;
  setWeeklyGoalLoading: (loading: boolean) => void;
}

export type PrayerSlice = {
  prayerTimes: PrayerTimes | null;
  nextPrayer: NextPrayer | null;
  setPrayerTimes: (times: PrayerTimes | null) => void;
  setNextPrayer: (prayer: NextPrayer | null) => void;
}

export type AppStoreState = SettingsSlice &
  FocusSlice &
  TimeSlice &
  ToastSlice &
  GamificationSlice &
  NavigationSlice &
  ProSlice &
  FamilySlice &
  PrayerSlice;
