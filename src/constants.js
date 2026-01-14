/**
 * Application Constants
 * Centralized configuration values to replace magic numbers throughout the codebase
 * 
 * Benefits:
 * - Single source of truth for configuration
 * - Easier maintenance and updates
 * - Better code readability
 * - Type-safe with JSDoc comments
 */

// ============================================================
// TIMING CONSTANTS
// ============================================================

/**
 * Interval timings in milliseconds
 */
export const TIMING = {
  /** Refresh interval for prayer time checks (1 minute) */
  REFRESH_INTERVAL_MS: 60000,
  
  /** Daily content refresh interval (24 hours) */
  DAILY_REFRESH_INTERVAL_MS: 86400000,
  
  /** AdMob initialization delay for better cold start (2 seconds) */
  ADMOB_DELAY_MS: 2000,
  
  /** FCM initialization delay (2.5 seconds) */
  FCM_DELAY_MS: 2500,
  
  /** Scroll to element delay */
  SCROLL_DELAY_MS: 100
};

// ============================================================
// CACHE CONSTANTS
// ============================================================

/**
 * Cache configuration
 */
export const CACHE = {
  /** Prayer times cache key prefix */
  PRAYER_TIMES_PREFIX: 'prayerTimes_',
  
  /** Fallback cache key for offline mode */
  FALLBACK_KEY: 'prayerTimes_fallback',
  
  /** Maximum cache age in hours before considered stale */
  MAX_AGE_HOURS: 48
};

// ============================================================
// AD CONSTANTS
// ============================================================

/**
 * Advertisement configuration
 */
export const AD = {
  /** Time between popup ads (5 minutes) - Policy compliant */
  POPUP_INTERVAL_MS: 300000,
  
  /** Maximum popups per session to avoid disruption */
  MAX_POPUPS_PER_SESSION: 2,
  
  /** Test Banner ID (Google Official) */
  TEST_BANNER_ID: 'ca-app-pub-3940256099942544/6300978111',
  
  /** Real Banner ID (Huzur App) */
  REAL_BANNER_ID: 'ca-app-pub-3074026744164717/3228028982'
};

// ============================================================
// NOTIFICATION CONSTANTS
// ============================================================

/**
 * Notification configuration
 */
export const NOTIFICATION = {
  /** Default pre-alert minutes before prayer time */
  DEFAULT_PRE_ALERT_MINUTES: 15,
  
  /** Sticky notification ID */
  STICKY_NOTIFICATION_ID: 1001,
  
  /** Prayer notification ID range start */
  PRAYER_NOTIFICATION_ID_START: 3000,
  
  /** Prayer notification ID range end */
  PRAYER_NOTIFICATION_ID_END: 4000,
  
  /** Notification channels */
  CHANNELS: {
    PRAYER_TIMES: 'prayer_times',
    PRAYER_REMINDERS: 'prayer_reminders',
    STICKY_COUNTER: 'sticky_counter'
  }
};

// ============================================================
// LOCATION CONSTANTS
// ============================================================

/**
 * Default location (Istanbul, Turkey)
 */
export const DEFAULT_LOCATION = {
  LATITUDE: 41.0082,
  LONGITUDE: 28.9784,
  NAME: 'İstanbul'
};

/**
 * Application Version
 */
export const APP_VERSION = '1.0.0';

// ============================================================
// PRO/PREMIUM CONSTANTS
// ============================================================

/**
 * Free tier limits
 */
export const FREE_LIMITS = {
  /** Nüzul sebebi AI queries per day */
  NUZUL_AI: 2,
  
  /** Tajweed AI recordings per day */
  TAJWEED_AI: 1,
  
  /** Word root analysis per day */
  WORD_ANALYSIS: 3,
  
  /** Word-by-Word surah limit */
  WORD_BY_WORD: 4,
  
  /** Memorization surah limit */
  MEMORIZE_SURAHS: 5,
  
  /** Hatim tracking limit */
  HATIM_COUNT: 1,
  
  /** Deed journal history days */
  AMEL_HISTORY_DAYS: 7,
  
  /** Theme options */
  THEMES: 3
};

/**
 * Free Word-by-Word surah numbers
 */
export const FREE_WORD_BY_WORD_SURAHS = [1, 112, 113, 114]; // Fatiha, İhlas, Felak, Nas

/**
 * Free Memorization surah numbers
 */
export const FREE_MEMORIZE_SURAHS = [1, 112, 113, 114, 111]; // Fatiha, İhlas, Felak, Nas, Tebbet

// ============================================================
// STORAGE KEYS
// ============================================================

/**
 * LocalStorage key constants
 */
export const STORAGE_KEYS = {
  // App State
  PRO_STATUS: 'huzur_pro_status',
  DAILY_LIMITS: 'huzur_daily_limits',
  APP_THEME: 'app_theme',
  
  // User Preferences
  LOCATION_CONSENT: 'locationConsentGiven',
  HAS_SEEN_WELCOME: 'hasSeenWelcome',
  STICKY_NOTIFICATION: 'stickyNotification',
  
  // Prayer Settings
  PRE_ALERT_MINUTES: 'preAlertMinutes',
  ENABLE_PRE_ALERT: 'enablePreAlert',
  ENABLE_MAIN_ALERT: 'enableMainAlert',
  LAST_PRAYER_SCHEDULE: 'lastPrayerSchedule',
  
  // Quran
  QURAN_FAVORITES: 'quranFavorites',
  QURAN_LAST_READ: 'quranLastRead',
  
  // Daily Reminders
  MORNING_REMINDER: 'morningReminderEnabled',
  EVENING_REMINDER: 'eveningReminderEnabled',
  
  // FCM
  FCM_TOKEN: 'fcm_token',
  
  // Theme
  THEME: 'app_theme',
  
  // Gemini
  GEMINI_API_KEY: 'gemini_api_key'
};

export default {
  TIMING,
  CACHE,
  AD,
  NOTIFICATION,
  DEFAULT_LOCATION,
  APP_VERSION,
  FREE_LIMITS,
  FREE_WORD_BY_WORD_SURAHS,
  FREE_MEMORIZE_SURAHS,
  STORAGE_KEYS
};
