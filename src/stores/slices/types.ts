export interface Toast {
  id: number;
  message: string;
  type: string;
  duration: number;
}

export interface Quest {
  id: string;
  type: string;
  subType?: string;
  progress: number;
  target: number;
  completed: boolean;
  isClaimed?: boolean;
  xp: number;
}

export interface DailyQuests {
  date: string;
  quests: Quest[];
}

export interface InviteModalContext {
  source: string;
}

export interface Settings {
  language: string;
  theme: string;
  accentColor: string;
  notifications: boolean;
  stickyNotification: boolean;
}

export interface Family {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface WeeklyGoal {
  id: string;
  [key: string]: unknown;
}

export interface PrayerTimes {
  [key: string]: unknown;
}

export interface NextPrayer {
  name: string;
  [key: string]: unknown;
}

export interface SettingsSlice {
  settings: Settings;
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  setAccentColor: (accentId: string) => void;
  setNotifications: (enabled: boolean) => void;
  setStickyNotification: (enabled: boolean) => void;
}

export interface FocusSlice {
  isFocusMode: boolean;
  activeFocusSession: import("../../services/focusSessionService").FocusSession | null;
  setActiveFocusSession: (session: import("../../services/focusSessionService").FocusSession | null) => void;
  toggleFocusMode: () => void;
  enableFocusMode: () => void;
  disableFocusMode: () => void;
}

export interface TimeSlice {
  timeOfDay: string;
  greetingKey: string;
  refreshTimeState: () => void;
}

export interface ToastSlice {
  toasts: Toast[];
  showToast: (message: string, type?: string, duration?: number) => void;
  removeToast: (id: number) => void;
}

export interface GamificationSlice {
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

export interface NavigationSlice {
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

export interface ProSlice {
  isProUser: boolean;
  setIsProUser: (active: boolean) => void;
}

export interface FamilySlice {
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

export interface PrayerSlice {
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
