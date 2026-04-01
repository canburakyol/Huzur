import { ANALYTICS_EVENTS } from './constants';

class CampaignAnalyticsMethods {
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

  logInviteModalViewed(source = 'invite_modal', details = {}) {
    const safeDetails = details && typeof details === 'object' ? details : {};
    this.logEvent(ANALYTICS_EVENTS.INVITE_MODAL_VIEWED, {
      source,
      ...safeDetails
    });
  }

  /**
   * Track invite created
   */
  logInviteCreated(referralCode, source = 'app_share', campaign = 'evergreen', lang = 'tr', metadata = {}) {
    const safeMetadata = metadata && typeof metadata === 'object' ? metadata : {};
    this.logEvent(ANALYTICS_EVENTS.INVITE_CREATED, {
      referral_code: referralCode,
      source,
      campaign,
      lang,
      ...safeMetadata
    });
  }

  logInviteShareOpened(source = 'invite_modal', channel = 'native_share', details = {}) {
    const safeDetails = details && typeof details === 'object' ? details : {};
    this.logEvent(ANALYTICS_EVENTS.INVITE_SHARE_OPENED, {
      source,
      channel,
      ...safeDetails
    });
  }

  logInviteCodeCopied(referralCode, source = 'invite_modal', details = {}) {
    const safeDetails = details && typeof details === 'object' ? details : {};
    this.logEvent(ANALYTICS_EVENTS.INVITE_CODE_COPIED, {
      referral_code: referralCode,
      source,
      ...safeDetails
    });
  }

  logInviteLinkCopied(source = 'invite_modal', details = {}) {
    const safeDetails = details && typeof details === 'object' ? details : {};
    this.logEvent(ANALYTICS_EVENTS.INVITE_LINK_COPIED, {
      source,
      ...safeDetails
    });
  }

  logReferralTriggerSurfaceViewed(surface = 'unknown', triggerId = 'default', details = {}) {
    const safeDetails = details && typeof details === 'object' ? details : {};
    this.logEvent(ANALYTICS_EVENTS.REFERRAL_TRIGGER_SURFACE_VIEWED, {
      surface,
      trigger_id: triggerId,
      ...safeDetails
    });
  }

  logReferralTriggerCtaClicked(surface = 'unknown', triggerId = 'default', details = {}) {
    const safeDetails = details && typeof details === 'object' ? details : {};
    this.logEvent(ANALYTICS_EVENTS.REFERRAL_TRIGGER_CTA_CLICKED, {
      surface,
      trigger_id: triggerId,
      ...safeDetails
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
}

export const registerCampaignAnalytics = (AnalyticsService) => {
  Object.getOwnPropertyNames(CampaignAnalyticsMethods.prototype)
    .filter((name) => name !== 'constructor')
    .forEach((name) => {
      AnalyticsService.prototype[name] = CampaignAnalyticsMethods.prototype[name];
    });
};
