/**
 * Analytics Service
 * Tracks user events and app metrics for Firebase Analytics
 */
import { logger } from '../utils/logger';

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
  THEME_CHANGED: 'theme_changed'
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
  }

  /**
   * Initialize analytics
   */
  init() {
    if (this.initialized) return;
    
    // Check if analytics is enabled in settings
    const settings = localStorage.getItem('huzur_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.enabled = parsed.analytics !== false;
    }

    this.initialized = true;
    
    // Process queued events
    this.processQueue();
    
    logger.log('[Analytics] Initialized');
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    logger.log('[Analytics]', enabled ? 'Enabled' : 'Disabled');
  }

  /**
   * Track an event
   */
  logEvent(eventName, params = {}) {
    if (!this.enabled) return;

    const event = {
      name: eventName,
      params: {
        ...params,
        timestamp: new Date().toISOString(),
        platform: this.getPlatform()
      }
    };

    // If not initialized, queue the event
    if (!this.initialized) {
      this.queue.push(event);
      return;
    }

    this.sendEvent(event);
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
    const properties = JSON.parse(localStorage.getItem('analytics_user_properties') || '{}');
    properties[name] = value;
    localStorage.setItem('analytics_user_properties', JSON.stringify(properties));
    
    logger.log('[Analytics] User Property:', name, value);
  }

  /**
   * Set user ID
   */
  setUserId(userId) {
    if (!this.enabled) return;
    localStorage.setItem('analytics_user_id', userId);
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
    const count = parseInt(localStorage.getItem('app_session_count') || '0');
    return count;
  }

  /**
   * Increment session count
   */
  incrementSessionCount() {
    const count = this.getSessionCount() + 1;
    localStorage.setItem('app_session_count', count.toString());
    return count;
  }

  /**
   * Process queued events
   */
  processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      this.sendEvent(event);
    }
  }

  /**
   * Send event to analytics
   * (Currently logs to console, can be extended to Firebase Analytics)
   */
  sendEvent(event) {
    // Log to console in development
    logger.log('[Analytics]', event.name, event.params);

    // TODO: Integrate with Firebase Analytics when available
    // Example: firebase.analytics().logEvent(event.name, event.params);
    
    // Store event locally for batching
    this.storeEventLocally(event);
  }

  /**
   * Store event locally for batch upload
   */
  storeEventLocally(event) {
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push(event);
      
      // Keep only last 1000 events
      if (events.length > 1000) {
        events.shift();
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch {
      // Silent fail for analytics storage errors
    }
  }

  /**
   * Get stored events
   */
  getStoredEvents() {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored events
   */
  clearStoredEvents() {
    localStorage.removeItem('analytics_events');
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
export const setUserProperty = (name, value) => analyticsService.setUserProperty(name, value);
export const setUserId = (id) => analyticsService.setUserId(id);