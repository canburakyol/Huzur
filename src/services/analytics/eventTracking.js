import { ANALYTICS_EVENTS } from './constants';

class EventTrackingAnalyticsMethods {
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
    if (!this.enabled || !this.consentGiven) {
      return this.stubEvent(ANALYTICS_EVENTS.APP_OPEN, { source });
    }

    this.incrementSessionCount();
    this.logEvent(ANALYTICS_EVENTS.APP_OPEN, {
      source: source,
      session_count: this.getSessionCount()
    });
  }
}

export const registerEventTrackingAnalytics = (AnalyticsService) => {
  Object.getOwnPropertyNames(EventTrackingAnalyticsMethods.prototype)
    .filter((name) => name !== 'constructor')
    .forEach((name) => {
      AnalyticsService.prototype[name] = EventTrackingAnalyticsMethods.prototype[name];
    });
};
