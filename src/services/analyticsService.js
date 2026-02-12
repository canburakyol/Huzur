/**
 * Analytics Service
 * Tracks user events and app metrics for Firebase Analytics
 */
import { logger } from '../utils/logger';
import { getAnalyticsInstance } from './firebase';
import { storageService } from './storageService';

const ANALYTICS_STORAGE_KEYS = {
  USER_PROPERTIES: 'analytics_user_properties',
  USER_ID: 'analytics_user_id',
  SESSION_COUNT: 'app_session_count',
  EVENTS: 'analytics_events',
  LAST_FLUSH_AT: 'analytics_last_flush_at',
  SETTINGS: 'huzur_settings'
};

const ANALYTICS_CONFIG = {
  MAX_LOCAL_EVENTS: 1000,
  FLUSH_BATCH_SIZE: 50,
  FLUSH_INTERVAL_MS: 30_000,
  MAX_RETRIES: 3
};

// Event names
export const ANALYTICS_EVENTS = {
  // Prayer Events
  PRAYER_COMPLETED: 'prayer_completed',
  PRAYER_MISSED: 'prayer_missed',
  PRAYER_QADHA_ADDED: 'prayer_qadha_added',
  PRAYER_QADHA_COMPLETED: 'prayer_qadha_completed',
  
  // Streak Events
  STREAK_STARTED: 'streak_started',
  STREAK_BROKEN: 'streak_broken',
  STREAK_RECOVERED: 'streak_recovered',
  STREAK_MILESTONE: 'streak_milestone',
  
  // Challenge Events
  CHALLENGE_STARTED: 'challenge_started',
  CHALLENGE_COMPLETED: 'challenge_completed',
  CHALLENGE_PROGRESS: 'challenge_progress',
  
  // App Events
  APP_OPEN: 'app_open',
  APP_BACKGROUND: 'app_background',
  SCREEN_VIEW: 'screen_view',
  
  // User Actions
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_TAPPED: 'notification_tapped',
  WIDGET_ADDED: 'widget_added',
  WIDGET_UPDATED: 'widget_updated',
  
  // Gamification
  LEVEL_UP: 'level_up',
  BADGE_EARNED: 'badge_earned',
  XP_EARNED: 'xp_earned',
  
  // Settings
  SETTINGS_CHANGED: 'settings_changed',
  LANGUAGE_CHANGED: 'language_changed',
  THEME_CHANGED: 'theme_changed',

  // Growth Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_PRAYER_ACTION_COMPLETED: 'first_prayer_action_completed',

  // Phase 2 Retention
  STREAK_INCREMENTED: 'streak_incremented',
  STREAK_RECOVERY_STARTED: 'streak_recovery_started',
  STREAK_RECOVERY_COMPLETED: 'streak_recovery_completed',
  WEEKLY_GOAL_SELECTED: 'weekly_goal_selected',

  // Phase 3 Viral - Share Cards
  SHARE_OPENED: 'share_opened',
  SHARE_SENT: 'share_sent',
  INVITE_CREATED: 'invite_created',
  INVITE_ACCEPTED: 'invite_accepted',
  REFERRAL_REWARD_UNLOCKED: 'referral_reward_unlocked',
  REFERRAL_ATTEMPT_BLOCKED: 'referral_attempt_blocked',
  REFERRAL_ABUSE_FLAGGED: 'referral_abuse_flagged',

  // Growth Experiments & Campaign
  EXPERIMENT_ASSIGNED: 'experiment_assigned',
  PUSH_VARIANT_DELIVERED: 'push_variant_delivered',
  CTA_VARIANT_RENDERED: 'cta_variant_rendered',
  CAMPAIGN_RESOLVED: 'campaign_resolved',
  QUIET_HOURS_SKIPPED: 'quiet_hours_skipped'
};

// Screen names
export const SCREENS = {
  HOME: 'home',
  PRAYER_TIMES: 'prayer_times',
  QADHA_TRACKER: 'qadha_tracker',
  CHALLENGES: 'challenges',
  PROFILE: 'profile',
  SETTINGS: 'settings',
  QURAN: 'quran',
  ZIKIR: 'zikir',
  COMPASS: 'compass'
};

class AnalyticsService {
  constructor() {
    this.enabled = true;
    this.queue = [];
    this.initialized = false;
    this.flushTimer = null;
    this.firebaseAnalytics = null;
    this.firebaseLogEvent = null;
    this.consentGiven = true;
    this.flushInFlight = false;
  }

  /**
   * Initialize analytics
   */
  init() {
    if (this.initialized) return;
    
    // Check if analytics is enabled in settings
    const settings = storageService.getString(ANALYTICS_STORAGE_KEYS.SETTINGS, '');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        this.enabled = parsed.analytics !== false;
        this.consentGiven = parsed.analytics !== false;
      } catch {
        this.enabled = true;
        this.consentGiven = true;
      }
    }

    this.initialized = true;

    // Async backend initialization (non-blocking)
    this.initializeBackend();
    
    // Process queued events
    this.processQueue();

    this.startPeriodicFlush();
    
    logger.log('[Analytics] Initialized');
  }

  async initializeBackend() {
    try {
      const { analytics, logEvent } = await getAnalyticsInstance();
      this.firebaseAnalytics = analytics;
      this.firebaseLogEvent = logEvent;
      if (analytics && logEvent) {
        logger.log('[Analytics] Firebase backend ready');
        await this.flushStoredEvents();
      } else {
        logger.warn('[Analytics] Firebase backend unavailable, local queue mode');
      }
    } catch {
      logger.warn('[Analytics] Backend initialization failed');
    }
  }

  startPeriodicFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => {
      this.flushStoredEvents();
    }, ANALYTICS_CONFIG.FLUSH_INTERVAL_MS);
  }

  stopPeriodicFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    this.consentGiven = enabled;

    // Persist to settings for next boot
    try {
      const current = storageService.getItem(ANALYTICS_STORAGE_KEYS.SETTINGS, {});
      current.analytics = enabled;
      storageService.setItem(ANALYTICS_STORAGE_KEYS.SETTINGS, current);
    } catch {
      // Ignore settings persistence failures
    }

    if (!enabled) {
      this.queue = [];
      this.clearStoredEvents();
      this.stopPeriodicFlush();
    } else if (this.initialized) {
      this.startPeriodicFlush();
      this.flushStoredEvents();
    }

    logger.log('[Analytics]', enabled ? 'Enabled' : 'Disabled');
  }

  /**
   * Track an event
   */
  logEvent(eventName, params = {}) {
    if (!this.enabled || !this.consentGiven) return;

    const event = {
      name: eventName,
      params: {
        ...params,
        timestamp: new Date().toISOString(),
        platform: this.getPlatform(),
        locale: this.getLocale(),
        country: this.getCountry(),
        timezone: this.getTimezone()
      }
    };

    // If not initialized, queue the event
    if (!this.initialized) {
      this.queue.push(event);
      return;
    }

    void this.sendEvent(event);
  }

  /**
   * Track onboarding started
   */
  logOnboardingStarted(step = 'language_selection') {
    this.logEvent(ANALYTICS_EVENTS.ONBOARDING_STARTED, {
      step
    });
  }

  /**
   * Track onboarding completed
   */
  logOnboardingCompleted(selectedLanguage = 'tr') {
    this.logEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
      selected_language: selectedLanguage
    });
  }

  /**
   * Track first prayer action completed
   */
  logFirstPrayerActionCompleted(actionSource = 'onboarding') {
    this.logEvent(ANALYTICS_EVENTS.FIRST_PRAYER_ACTION_COMPLETED, {
      source: actionSource
    });
  }

  /**
   * Track streak increment
   */
  logStreakIncremented(category, count, weeklyGoal = null) {
    this.logEvent(ANALYTICS_EVENTS.STREAK_INCREMENTED, {
      category,
      streak_count: count,
      weekly_goal: weeklyGoal
    });
  }

  /**
   * Track streak recovery started
   */
  logStreakRecoveryStarted(category, recoveryType = '24h_window') {
    this.logEvent(ANALYTICS_EVENTS.STREAK_RECOVERY_STARTED, {
      category,
      recovery_type: recoveryType
    });
  }

  /**
   * Track streak recovery completed
   */
  logStreakRecoveryCompleted(category, restoredCount) {
    this.logEvent(ANALYTICS_EVENTS.STREAK_RECOVERY_COMPLETED, {
      category,
      restored_count: restoredCount
    });
  }

  /**
   * Track weekly goal selection
   */
  logWeeklyGoalSelected(goalCount, source = 'settings') {
    this.logEvent(ANALYTICS_EVENTS.WEEKLY_GOAL_SELECTED, {
      goal_count: goalCount,
      source
    });
  }

  /**
   * Track share card opened
   */
  logShareOpened(cardType, source = 'daily_content') {
    this.logEvent(ANALYTICS_EVENTS.SHARE_OPENED, {
      card_type: cardType,
      source
    });
  }

  /**
   * Track share sent
   */
  logShareSent(cardType, channel = 'native_share') {
    this.logEvent(ANALYTICS_EVENTS.SHARE_SENT, {
      card_type: cardType,
      channel
    });
  }

  /**
   * Track invite created
   */
  logInviteCreated(referralCode, source = 'app_share', campaign = 'evergreen', lang = 'tr') {
    this.logEvent(ANALYTICS_EVENTS.INVITE_CREATED, {
      referral_code: referralCode,
      source,
      campaign,
      lang
    });
  }

  /**
   * Track invite accepted
   */
  logInviteAccepted(referralCode, source = 'deep_link') {
    this.logEvent(ANALYTICS_EVENTS.INVITE_ACCEPTED, {
      referral_code: referralCode,
      source
    });
  }

  /**
   * Track referral reward unlocked
   */
  logReferralRewardUnlocked(referralCode, rewardType = 'content_unlock') {
    this.logEvent(ANALYTICS_EVENTS.REFERRAL_REWARD_UNLOCKED, {
      referral_code: referralCode,
      reward_type: rewardType
    });
  }

  /**
   * Track blocked referral attempt
   */
  logReferralAttemptBlocked(referralCode, reason = 'rule_violation', source = 'deep_link', blockedUntil = null) {
    this.logEvent(ANALYTICS_EVENTS.REFERRAL_ATTEMPT_BLOCKED, {
      referral_code: referralCode,
      reason,
      source,
      blocked_until: blockedUntil
    });
  }

  /**
   * Track suspicious referral pattern
   */
  logReferralAbuseFlagged(reason = 'suspicious_pattern', severity = 'medium', details = {}) {
    const safeDetails = details && typeof details === 'object' ? details : {};
    this.logEvent(ANALYTICS_EVENTS.REFERRAL_ABUSE_FLAGGED, {
      reason,
      severity,
      ...safeDetails
    });
  }

  /**
   * Track experiment assignment
   */
  logExperimentAssigned(experimentKey, variant, source = 'runtime') {
    this.logEvent(ANALYTICS_EVENTS.EXPERIMENT_ASSIGNED, {
      experiment_key: experimentKey,
      variant,
      source
    });
  }

  /**
   * Track push copy variant delivery
   */
  logPushVariantDelivered(variant, campaign, notificationType = 'reminder') {
    this.logEvent(ANALYTICS_EVENTS.PUSH_VARIANT_DELIVERED, {
      variant,
      campaign,
      notification_type: notificationType
    });
  }

  /**
   * Track CTA variant render
   */
  logCtaVariantRendered(variant, placement = 'home_header') {
    this.logEvent(ANALYTICS_EVENTS.CTA_VARIANT_RENDERED, {
      variant,
      placement
    });
  }

  /**
   * Track campaign resolution
   */
  logCampaignResolved(campaignId, region, variant) {
    this.logEvent(ANALYTICS_EVENTS.CAMPAIGN_RESOLVED, {
      campaign_id: campaignId,
      region,
      variant
    });
  }

  /**
   * Track quiet hours skip
   */
  logQuietHoursSkipped(type, scheduledHour, scheduledMinute) {
    this.logEvent(ANALYTICS_EVENTS.QUIET_HOURS_SKIPPED, {
      type,
      scheduled_hour: scheduledHour,
      scheduled_minute: scheduledMinute
    });
  }

  /**
   * Track screen view
   */
  logScreenView(screenName, screenClass = null) {
    this.logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
      screen_name: screenName,
      screen_class: screenClass || screenName
    });
  }

  /**
   * Track prayer completion
   */
  logPrayerCompleted(prayerName, prayerTime, onTime = true) {
    this.logEvent(ANALYTICS_EVENTS.PRAYER_COMPLETED, {
      prayer_name: prayerName,
      prayer_time: prayerTime,
      on_time: onTime
    });
  }

  /**
   * Track streak milestone
   */
  logStreakMilestone(streakDays) {
    this.logEvent(ANALYTICS_EVENTS.STREAK_MILESTONE, {
      streak_days: streakDays,
      milestone: this.getMilestoneLabel(streakDays)
    });
  }

  /**
   * Track challenge completion
   */
  logChallengeCompleted(challengeId, challengeCategory, rewardXP) {
    this.logEvent(ANALYTICS_EVENTS.CHALLENGE_COMPLETED, {
      challenge_id: challengeId,
      challenge_category: challengeCategory,
      reward_xp: rewardXP
    });
  }

  /**
   * Track level up
   */
  logLevelUp(newLevel, totalXP) {
    this.logEvent(ANALYTICS_EVENTS.LEVEL_UP, {
      level: newLevel,
      total_xp: totalXP
    });
  }

  /**
   * Track badge earned
   */
  logBadgeEarned(badgeId, badgeName) {
    this.logEvent(ANALYTICS_EVENTS.BADGE_EARNED, {
      badge_id: badgeId,
      badge_name: badgeName
    });
  }

  /**
   * Track notification received
   */
  logNotificationReceived(notificationType, prayerName = null) {
    this.logEvent(ANALYTICS_EVENTS.NOTIFICATION_RECEIVED, {
      notification_type: notificationType,
      prayer_name: prayerName
    });
  }

  /**
   * Track notification tapped
   */
  logNotificationTapped(notificationType, prayerName = null) {
    this.logEvent(ANALYTICS_EVENTS.NOTIFICATION_TAPPED, {
      notification_type: notificationType,
      prayer_name: prayerName
    });
  }

  /**
   * Track app open
   */
  logAppOpen(source = 'direct') {
    this.incrementSessionCount();
    this.logEvent(ANALYTICS_EVENTS.APP_OPEN, {
      source: source,
      session_count: this.getSessionCount()
    });
  }

  /**
   * Track user property
   */
  setUserProperty(name, value) {
    if (!this.enabled) return;
    
    // Store in localStorage for now
    const properties = storageService.getItem(ANALYTICS_STORAGE_KEYS.USER_PROPERTIES, {});
    properties[name] = value;
    storageService.setItem(ANALYTICS_STORAGE_KEYS.USER_PROPERTIES, properties);

    if (this.firebaseAnalytics) {
      import('firebase/analytics').then(({ setUserProperties }) => {
        try {
          setUserProperties(this.firebaseAnalytics, { [name]: value });
        } catch {
          // no-op
        }
      }).catch(() => {
        // no-op
      });
    }
    
    logger.log('[Analytics] User Property:', name, value);
  }

  /**
   * Set user ID
   */
  setUserId(userId) {
    if (!this.enabled) return;
    storageService.setString(ANALYTICS_STORAGE_KEYS.USER_ID, userId);

    if (this.firebaseAnalytics) {
      import('firebase/analytics').then(({ setUserId }) => {
        try {
          setUserId(this.firebaseAnalytics, userId);
        } catch {
          // no-op
        }
      }).catch(() => {
        // no-op
      });
    }

    logger.log('[Analytics] User ID set');
  }

  /**
   * Get platform info
   */
  getPlatform() {
    const userAgent = navigator.userAgent;
    if (/Android/i.test(userAgent)) return 'android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
    if (/Windows/i.test(userAgent)) return 'windows';
    if (/Mac/i.test(userAgent)) return 'macos';
    if (/Linux/i.test(userAgent)) return 'linux';
    return 'web';
  }

  /**
   * Get active locale
   */
  getLocale() {
    try {
      return storageService.getString('i18nextLng', navigator.language || 'tr');
    } catch {
      return 'tr';
    }
  }

  /**
   * Get country from locale
   */
  getCountry() {
    try {
      const locale = this.getLocale();
      const localeStr = Array.isArray(locale) ? locale[0] : String(locale);
      const normalized = localeStr.replace('_', '-');
      const parts = normalized.split('-');
      return (parts[1] || 'TR').toUpperCase();
    } catch {
      return 'TR';
    }
  }

  /**
   * Get timezone info
   */
  getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
    } catch {
      return 'Europe/Istanbul';
    }
  }

  /**
   * Get milestone label
   */
  getMilestoneLabel(days) {
    if (days >= 365) return '1_year';
    if (days >= 180) return '6_months';
    if (days >= 90) return '3_months';
    if (days >= 30) return '1_month';
    if (days >= 14) return '2_weeks';
    if (days >= 7) return '1_week';
    return `${days}_days`;
  }

  /**
   * Get session count
   */
  getSessionCount() {
    const count = parseInt(storageService.getString(ANALYTICS_STORAGE_KEYS.SESSION_COUNT, '0'), 10);
    return count;
  }

  /**
   * Increment session count
   */
  incrementSessionCount() {
    const count = this.getSessionCount() + 1;
    storageService.setString(ANALYTICS_STORAGE_KEYS.SESSION_COUNT, count.toString());
    return count;
  }

  /**
   * Process queued events
   */
  processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      void this.sendEvent(event);
    }
  }

  /**
   * Send event to analytics
   * Firebase available olduğunda anında gönderir, değilse local kuyruğa yazar.
   */
  async sendEvent(event) {
    // Log to console in development
    logger.log('[Analytics]', event.name, event.params);

    // 1) Primary path: Firebase Analytics backend
    if (this.firebaseAnalytics && this.firebaseLogEvent) {
      try {
        this.firebaseLogEvent(this.firebaseAnalytics, event.name, event.params);
        storageService.setString(ANALYTICS_STORAGE_KEYS.LAST_FLUSH_AT, new Date().toISOString());
        return;
      } catch {
        // fall through to local queue
      }
    }

    // 2) Fallback path: Store locally for retry/batch flush
    this.storeEventLocally({ ...event, retryCount: event.retryCount || 0 });
  }

  async flushStoredEvents() {
    if (!this.enabled || !this.consentGiven) return;
    if (this.flushInFlight) return;
    if (!this.firebaseAnalytics || !this.firebaseLogEvent) return;

    const events = this.getStoredEvents();
    if (!events.length) return;

    this.flushInFlight = true;
    try {
      const batch = events.slice(0, ANALYTICS_CONFIG.FLUSH_BATCH_SIZE);
      const remaining = [];

      for (const event of batch) {
        try {
          this.firebaseLogEvent(this.firebaseAnalytics, event.name, event.params);
        } catch {
          const nextRetry = (event.retryCount || 0) + 1;
          if (nextRetry <= ANALYTICS_CONFIG.MAX_RETRIES) {
            remaining.push({ ...event, retryCount: nextRetry });
          }
        }
      }

      const tail = events.slice(batch.length);
      const nextStore = [...remaining, ...tail].slice(-ANALYTICS_CONFIG.MAX_LOCAL_EVENTS);
      storageService.setItem(ANALYTICS_STORAGE_KEYS.EVENTS, nextStore);
      storageService.setString(ANALYTICS_STORAGE_KEYS.LAST_FLUSH_AT, new Date().toISOString());
    } catch {
      // No-op
    } finally {
      this.flushInFlight = false;
    }
  }

  /**
   * Store event locally for batch upload
   */
  storeEventLocally(event) {
    try {
      const events = storageService.getItem(ANALYTICS_STORAGE_KEYS.EVENTS, []);
      events.push(event);
      
      // Keep only last 1000 events
      if (events.length > ANALYTICS_CONFIG.MAX_LOCAL_EVENTS) {
        events.splice(0, events.length - ANALYTICS_CONFIG.MAX_LOCAL_EVENTS);
      }
      
      storageService.setItem(ANALYTICS_STORAGE_KEYS.EVENTS, events);
    } catch {
      // Silent fail for analytics storage errors
    }
  }

  /**
   * Get stored events
   */
  getStoredEvents() {
    try {
      return storageService.getItem(ANALYTICS_STORAGE_KEYS.EVENTS, []);
    } catch {
      return [];
    }
  }

  /**
   * Clear stored events
   */
  clearStoredEvents() {
    storageService.removeItem(ANALYTICS_STORAGE_KEYS.EVENTS);
  }

  /**
   * Get analytics summary
   */
  getSummary() {
    const events = this.getStoredEvents();
    const summary = {
      totalEvents: events.length,
      eventsByType: {},
      lastEvent: events.length > 0 ? events[events.length - 1].params.timestamp : null
    };

    events.forEach(event => {
      summary.eventsByType[event.name] = (summary.eventsByType[event.name] || 0) + 1;
    });

    return summary;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export convenience methods
export const logEvent = (name, params) => analyticsService.logEvent(name, params);
export const logScreenView = (screen, className) => analyticsService.logScreenView(screen, className);
export const logPrayerCompleted = (prayer, time, onTime) => analyticsService.logPrayerCompleted(prayer, time, onTime);
export const logStreakMilestone = (days) => analyticsService.logStreakMilestone(days);
export const logChallengeCompleted = (id, category, xp) => analyticsService.logChallengeCompleted(id, category, xp);
export const logLevelUp = (level, xp) => analyticsService.logLevelUp(level, xp);
export const logBadgeEarned = (id, name) => analyticsService.logBadgeEarned(id, name);
export const logNotificationReceived = (type, prayer) => analyticsService.logNotificationReceived(type, prayer);
export const logNotificationTapped = (type, prayer) => analyticsService.logNotificationTapped(type, prayer);
export const logAppOpen = (source) => analyticsService.logAppOpen(source);
export const logOnboardingStarted = (step) => analyticsService.logOnboardingStarted(step);
export const logOnboardingCompleted = (lang) => analyticsService.logOnboardingCompleted(lang);
export const logFirstPrayerActionCompleted = (source) => analyticsService.logFirstPrayerActionCompleted(source);
export const logStreakIncremented = (category, count, weeklyGoal) => analyticsService.logStreakIncremented(category, count, weeklyGoal);
export const logStreakRecoveryStarted = (category, recoveryType) => analyticsService.logStreakRecoveryStarted(category, recoveryType);
export const logStreakRecoveryCompleted = (category, restoredCount) => analyticsService.logStreakRecoveryCompleted(category, restoredCount);
export const logWeeklyGoalSelected = (goalCount, source) => analyticsService.logWeeklyGoalSelected(goalCount, source);
export const logShareOpened = (cardType, source) => analyticsService.logShareOpened(cardType, source);
export const logShareSent = (cardType, channel) => analyticsService.logShareSent(cardType, channel);
export const logInviteCreated = (referralCode, source, campaign, lang) => analyticsService.logInviteCreated(referralCode, source, campaign, lang);
export const logInviteAccepted = (referralCode, source) => analyticsService.logInviteAccepted(referralCode, source);
export const logReferralRewardUnlocked = (referralCode, rewardType) => analyticsService.logReferralRewardUnlocked(referralCode, rewardType);
export const logReferralAttemptBlocked = (referralCode, reason, source, blockedUntil) => analyticsService.logReferralAttemptBlocked(referralCode, reason, source, blockedUntil);
export const logReferralAbuseFlagged = (reason, severity, details) => analyticsService.logReferralAbuseFlagged(reason, severity, details);
export const logExperimentAssigned = (experimentKey, variant, source) => analyticsService.logExperimentAssigned(experimentKey, variant, source);
export const logPushVariantDelivered = (variant, campaign, notificationType) => analyticsService.logPushVariantDelivered(variant, campaign, notificationType);
export const logCtaVariantRendered = (variant, placement) => analyticsService.logCtaVariantRendered(variant, placement);
export const logCampaignResolved = (campaignId, region, variant) => analyticsService.logCampaignResolved(campaignId, region, variant);
export const logQuietHoursSkipped = (type, scheduledHour, scheduledMinute) => analyticsService.logQuietHoursSkipped(type, scheduledHour, scheduledMinute);
export const setUserProperty = (name, value) => analyticsService.setUserProperty(name, value);
export const setUserId = (id) => analyticsService.setUserId(id);
