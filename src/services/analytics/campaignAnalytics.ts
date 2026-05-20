import { ANALYTICS_EVENTS } from "./constants";
import type { AnalyticsService } from "./core";

interface CampaignAnalyticsThis extends AnalyticsService {
  logEvent: (name: string, params?: Record<string, unknown>) => void;
}

class CampaignAnalyticsMethods {
  logShareOpened(this: CampaignAnalyticsThis, cardType: string, source = "daily_content"): void {
    this.logEvent(ANALYTICS_EVENTS.SHARE_OPENED, {
      card_type: cardType,
      source,
    });
  }

  logShareSent(this: CampaignAnalyticsThis, cardType: string, channel = "native_share"): void {
    this.logEvent(ANALYTICS_EVENTS.SHARE_SENT, {
      card_type: cardType,
      channel,
    });
  }

  logInviteModalViewed(this: CampaignAnalyticsThis, source = "invite_modal", details: Record<string, unknown> = {}): void {
    const safeDetails = details && typeof details === "object" ? details : {};
    this.logEvent(ANALYTICS_EVENTS.INVITE_MODAL_VIEWED, {
      source,
      ...safeDetails,
    });
  }

  logInviteCreated(
    this: CampaignAnalyticsThis,
    referralCode: string,
    source = "app_share",
    campaign = "evergreen",
    lang = "tr",
    metadata: Record<string, unknown> = {}
  ): void {
    const safeMetadata = metadata && typeof metadata === "object" ? metadata : {};
    this.logEvent(ANALYTICS_EVENTS.INVITE_CREATED, {
      referral_code: referralCode,
      source,
      campaign,
      lang,
      ...safeMetadata,
    });
  }

  logInviteShareOpened(
    this: CampaignAnalyticsThis,
    source = "invite_modal",
    channel = "native_share",
    details: Record<string, unknown> = {}
  ): void {
    const safeDetails = details && typeof details === "object" ? details : {};
    this.logEvent(ANALYTICS_EVENTS.INVITE_SHARE_OPENED, {
      source,
      channel,
      ...safeDetails,
    });
  }

  logInviteCodeCopied(
    this: CampaignAnalyticsThis,
    referralCode: string,
    source = "invite_modal",
    details: Record<string, unknown> = {}
  ): void {
    const safeDetails = details && typeof details === "object" ? details : {};
    this.logEvent(ANALYTICS_EVENTS.INVITE_CODE_COPIED, {
      referral_code: referralCode,
      source,
      ...safeDetails,
    });
  }

  logInviteLinkCopied(this: CampaignAnalyticsThis, source = "invite_modal", details: Record<string, unknown> = {}): void {
    const safeDetails = details && typeof details === "object" ? details : {};
    this.logEvent(ANALYTICS_EVENTS.INVITE_LINK_COPIED, {
      source,
      ...safeDetails,
    });
  }

  logReferralTriggerSurfaceViewed(
    this: CampaignAnalyticsThis,
    surface = "unknown",
    triggerId = "default",
    details: Record<string, unknown> = {}
  ): void {
    const safeDetails = details && typeof details === "object" ? details : {};
    this.logEvent(ANALYTICS_EVENTS.REFERRAL_TRIGGER_SURFACE_VIEWED, {
      surface,
      trigger_id: triggerId,
      ...safeDetails,
    });
  }

  logReferralTriggerCtaClicked(
    this: CampaignAnalyticsThis,
    surface = "unknown",
    triggerId = "default",
    details: Record<string, unknown> = {}
  ): void {
    const safeDetails = details && typeof details === "object" ? details : {};
    this.logEvent(ANALYTICS_EVENTS.REFERRAL_TRIGGER_CTA_CLICKED, {
      surface,
      trigger_id: triggerId,
      ...safeDetails,
    });
  }

  logInviteAccepted(this: CampaignAnalyticsThis, referralCode: string, source = "deep_link"): void {
    this.logEvent(ANALYTICS_EVENTS.INVITE_ACCEPTED, {
      referral_code: referralCode,
      source,
    });
  }

  logReferralRewardUnlocked(this: CampaignAnalyticsThis, referralCode: string, rewardType = "content_unlock"): void {
    this.logEvent(ANALYTICS_EVENTS.REFERRAL_REWARD_UNLOCKED, {
      referral_code: referralCode,
      reward_type: rewardType,
    });
  }

  logReferralAttemptBlocked(
    this: CampaignAnalyticsThis,
    referralCode: string,
    reason = "rule_violation",
    source = "deep_link",
    blockedUntil: string | null = null
  ): void {
    this.logEvent(ANALYTICS_EVENTS.REFERRAL_ATTEMPT_BLOCKED, {
      referral_code: referralCode,
      reason,
      source,
      blocked_until: blockedUntil,
    });
  }

  logReferralAbuseFlagged(
    this: CampaignAnalyticsThis,
    reason = "suspicious_pattern",
    severity = "medium",
    details: Record<string, unknown> = {}
  ): void {
    const safeDetails = details && typeof details === "object" ? details : {};
    this.logEvent(ANALYTICS_EVENTS.REFERRAL_ABUSE_FLAGGED, {
      reason,
      severity,
      ...safeDetails,
    });
  }

  logExperimentAssigned(this: CampaignAnalyticsThis, experimentKey: string, variant: string, source = "runtime"): void {
    this.logEvent(ANALYTICS_EVENTS.EXPERIMENT_ASSIGNED, {
      experiment_key: experimentKey,
      variant,
      source,
    });
  }

  logPushVariantDelivered(this: CampaignAnalyticsThis, variant: string, campaign: string, notificationType = "reminder"): void {
    this.logEvent(ANALYTICS_EVENTS.PUSH_VARIANT_DELIVERED, {
      variant,
      campaign,
      notification_type: notificationType,
    });
  }

  logCtaVariantRendered(this: CampaignAnalyticsThis, variant: string, placement = "home_header"): void {
    this.logEvent(ANALYTICS_EVENTS.CTA_VARIANT_RENDERED, {
      variant,
      placement,
    });
  }

  logCampaignResolved(this: CampaignAnalyticsThis, campaignId: string, region: string, variant: string): void {
    this.logEvent(ANALYTICS_EVENTS.CAMPAIGN_RESOLVED, {
      campaign_id: campaignId,
      region,
      variant,
    });
  }

  logQuietHoursSkipped(this: CampaignAnalyticsThis, type: string, scheduledHour: number, scheduledMinute: number): void {
    this.logEvent(ANALYTICS_EVENTS.QUIET_HOURS_SKIPPED, {
      type,
      scheduled_hour: scheduledHour,
      scheduled_minute: scheduledMinute,
    });
  }
}

export const registerCampaignAnalytics = (AnalyticsServiceClass: typeof AnalyticsService): void => {
  Object.getOwnPropertyNames(CampaignAnalyticsMethods.prototype)
    .filter((name) => name !== "constructor")
    .forEach((name) => {
      (AnalyticsServiceClass.prototype as Record<string, unknown>)[name] = (CampaignAnalyticsMethods.prototype as Record<string, unknown>)[name];
    });
};
