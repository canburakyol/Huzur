import { ANALYTICS_EVENTS } from "./constants";
import type { AnalyticsService } from "./core";

interface EventTrackingThis extends AnalyticsService {
  logEvent: (name: string, params?: Record<string, unknown>) => void;
  stubEvent: (name: string, params?: Record<string, unknown>) => null;
  enabled: boolean;
  consentGiven: boolean;
  incrementSessionCount: () => number;
  getSessionCount: () => number;
}

class EventTrackingAnalyticsMethods {
  logScreenView(this: EventTrackingThis, screenName: string, screenClass: string | null = null): void {
    this.logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }

  logPrayerCompleted(this: EventTrackingThis, prayerName: string, prayerTime: string, onTime = true): void {
    this.logEvent(ANALYTICS_EVENTS.PRAYER_COMPLETED, {
      prayer_name: prayerName,
      prayer_time: prayerTime,
      on_time: onTime,
    });
  }

  logStreakMilestone(this: EventTrackingThis, streakDays: number): void {
    this.logEvent(ANALYTICS_EVENTS.STREAK_MILESTONE, {
      streak_days: streakDays,
      milestone: this.getMilestoneLabel(streakDays),
    });
  }

  logChallengeCompleted(this: EventTrackingThis, challengeId: string, challengeCategory: string, rewardXP: number): void {
    this.logEvent(ANALYTICS_EVENTS.CHALLENGE_COMPLETED, {
      challenge_id: challengeId,
      challenge_category: challengeCategory,
      reward_xp: rewardXP,
    });
  }

  logLevelUp(this: EventTrackingThis, newLevel: number, totalXP: number): void {
    this.logEvent(ANALYTICS_EVENTS.LEVEL_UP, {
      level: newLevel,
      total_xp: totalXP,
    });
  }

  logBadgeEarned(this: EventTrackingThis, badgeId: string, badgeName: string): void {
    this.logEvent(ANALYTICS_EVENTS.BADGE_EARNED, {
      badge_id: badgeId,
      badge_name: badgeName,
    });
  }

  logNotificationReceived(this: EventTrackingThis, notificationType: string, prayerName: string | null = null): void {
    this.logEvent(ANALYTICS_EVENTS.NOTIFICATION_RECEIVED, {
      notification_type: notificationType,
      prayer_name: prayerName,
    });
  }

  logNotificationTapped(this: EventTrackingThis, notificationType: string, prayerName: string | null = null): void {
    this.logEvent(ANALYTICS_EVENTS.NOTIFICATION_TAPPED, {
      notification_type: notificationType,
      prayer_name: prayerName,
    });
  }

  logAppOpen(this: EventTrackingThis, source = "direct", metadata: Record<string, unknown> = {}): void {
    if (!this.enabled || !this.consentGiven) {
      return this.stubEvent(ANALYTICS_EVENTS.APP_OPEN, { source, ...metadata });
    }

    this.incrementSessionCount();
    this.logEvent(ANALYTICS_EVENTS.APP_OPEN, {
      source,
      session_count: this.getSessionCount(),
      ...metadata,
    });
  }
}

export const registerEventTrackingAnalytics = (AnalyticsServiceClass: typeof AnalyticsService): void => {
  Object.getOwnPropertyNames(EventTrackingAnalyticsMethods.prototype)
    .filter((name) => name !== "constructor")
    .forEach((name) => {
      (AnalyticsServiceClass.prototype as Record<string, unknown>)[name] = (EventTrackingAnalyticsMethods.prototype as Record<string, unknown>)[name];
    });
};
