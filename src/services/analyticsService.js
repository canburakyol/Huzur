/**
 * Analytics Service — Centralized API
 *
 * Primary API: logEvent(eventName, params = {})
 * All convenience methods are deprecated proxies (remove in v19).
 */
import { AnalyticsService } from './analytics/core';
import { ANALYTICS_EVENTS, SCREENS } from './analytics/constants';
import { registerCampaignAnalytics } from './analytics/campaignAnalytics';
import { registerEventTrackingAnalytics } from './analytics/eventTracking';
import { registerRevenueAnalytics } from './analytics/revenueAnalytics';
import { registerRetentionAnalytics } from './analytics/retentionAnalytics';

registerEventTrackingAnalytics(AnalyticsService);
registerCampaignAnalytics(AnalyticsService);
registerRevenueAnalytics(AnalyticsService);
registerRetentionAnalytics(AnalyticsService);

export { ANALYTICS_EVENTS, SCREENS };

export const analyticsService = new AnalyticsService();

// ─── Primary API ──────────────────────────────────────────────────
export const logEvent = (name, params = {}) => analyticsService.logEvent(name, params);
export const logScreenView = (screen, className) => analyticsService.logScreenView(screen, className);
export const setUserProperty = (name, value) => analyticsService.setUserProperty(name, value);
export const setUserId = (id) => analyticsService.setUserId(id);

// ─── Deprecated Convenience Proxies (remove in v19) ───────────────
// Each proxy maps positional args → logEvent(EVENT_NAME, params)
// Consumers should migrate to: logEvent(ANALYTICS_EVENTS.X, { ... })

export const logPrayerCompleted = (prayer, time, onTime) =>
  logEvent(ANALYTICS_EVENTS.PRAYER_COMPLETED, { prayer, time, on_time: onTime });

export const logStreakMilestone = (days) =>
  logEvent(ANALYTICS_EVENTS.STREAK_MILESTONE, { days, milestone: analyticsService.getMilestoneLabel(days) });

export const logChallengeCompleted = (id, category, xp) =>
  logEvent(ANALYTICS_EVENTS.CHALLENGE_COMPLETED, { challenge_id: id, category, xp });

export const logLevelUp = (level, xp) =>
  logEvent(ANALYTICS_EVENTS.LEVEL_UP, { level, xp });

export const logBadgeEarned = (id, name) =>
  logEvent(ANALYTICS_EVENTS.BADGE_EARNED, { badge_id: id, badge_name: name });

export const logNotificationReceived = (type, prayer) =>
  logEvent(ANALYTICS_EVENTS.NOTIFICATION_RECEIVED, { notification_type: type, prayer });

export const logNotificationTapped = (type, prayer) =>
  logEvent(ANALYTICS_EVENTS.NOTIFICATION_TAPPED, { notification_type: type, prayer });

export const logAppOpen = (source, metadata) =>
  logEvent(ANALYTICS_EVENTS.APP_OPEN, { source, ...metadata });

export const logOnboardingStarted = (step, metadata) =>
  logEvent(ANALYTICS_EVENTS.ONBOARDING_STARTED, { step, ...metadata });

export const logOnboardingCompleted = (lang, metadata) =>
  logEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, { language: lang, ...metadata });

export const logFirstActivationFeatureOpened = (feature, source) =>
  logEvent(ANALYTICS_EVENTS.FIRST_ACTIVATION_FEATURE_OPENED, { feature, source });

export const logFirstPrayerActionCompleted = (source) =>
  logEvent(ANALYTICS_EVENTS.FIRST_PRAYER_ACTION_COMPLETED, { source });

export const logStreakIncremented = (category, count, weeklyGoal) =>
  logEvent(ANALYTICS_EVENTS.STREAK_INCREMENTED, { category, count, weekly_goal: weeklyGoal });

export const logStreakRecoveryStarted = (category, recoveryType) =>
  logEvent(ANALYTICS_EVENTS.STREAK_RECOVERY_STARTED, { category, recovery_type: recoveryType });

export const logStreakRecoveryCompleted = (category, restoredCount) =>
  logEvent(ANALYTICS_EVENTS.STREAK_RECOVERY_COMPLETED, { category, restored_count: restoredCount });

export const logWeeklyGoalSelected = (goalCount, source) =>
  logEvent(ANALYTICS_EVENTS.WEEKLY_GOAL_SELECTED, { goal_count: goalCount, source });

export const logRecoverySurfaceViewed = (surface, riskBand, details) =>
  logEvent(ANALYTICS_EVENTS.RECOVERY_SURFACE_VIEWED, { surface, risk_band: riskBand, ...details });

export const logPremiumRecoveryMomentOpened = (surface, riskBand, recoveryFeature) =>
  logEvent(ANALYTICS_EVENTS.PREMIUM_RECOVERY_MOMENT_OPENED, { surface, risk_band: riskBand, recovery_feature: recoveryFeature });

// Campaign mixin proxies (defined in campaignAnalytics.js)
export const logShareOpened = (cardType, source = 'daily_content') =>
  logEvent(ANALYTICS_EVENTS.SHARE_OPENED, { card_type: cardType, source });

export const logShareSent = (cardType, channel = 'native_share') =>
  logEvent(ANALYTICS_EVENTS.SHARE_SENT, { card_type: cardType, channel });

export const logInviteModalViewed = (source = 'invite_modal', details = {}) =>
  logEvent(ANALYTICS_EVENTS.INVITE_MODAL_VIEWED, { source, ...details });

export const logInviteCreated = (referralCode, source = 'app_share', campaign = 'evergreen', lang = 'tr', metadata = {}) =>
  logEvent(ANALYTICS_EVENTS.INVITE_CREATED, { referral_code: referralCode, source, campaign, lang, ...metadata });

export const logInviteShareOpened = (source = 'invite_modal', channel = 'native_share', details = {}) =>
  logEvent(ANALYTICS_EVENTS.INVITE_SHARE_OPENED, { source, channel, ...details });

export const logInviteCodeCopied = (referralCode, source = 'invite_modal', details = {}) =>
  logEvent(ANALYTICS_EVENTS.INVITE_CODE_COPIED, { referral_code: referralCode, source, ...details });

export const logInviteLinkCopied = (source = 'invite_modal', details = {}) =>
  logEvent(ANALYTICS_EVENTS.INVITE_LINK_COPIED, { source, ...details });

export const logInviteAccepted = (referralCode, source) =>
  logEvent(ANALYTICS_EVENTS.INVITE_ACCEPTED, { referral_code: referralCode, source });

export const logReferralRewardUnlocked = (referralCode, rewardType) =>
  logEvent(ANALYTICS_EVENTS.REFERRAL_REWARD_UNLOCKED, { referral_code: referralCode, reward_type: rewardType });

export const logReferralAttemptBlocked = (referralCode, reason, source, blockedUntil) =>
  logEvent(ANALYTICS_EVENTS.REFERRAL_ATTEMPT_BLOCKED, { referral_code: referralCode, reason, source, blocked_until: blockedUntil });

export const logReferralAbuseFlagged = (reason, severity, details) =>
  logEvent(ANALYTICS_EVENTS.REFERRAL_ABUSE_FLAGGED, { reason, severity, ...details });

export const logExperimentAssigned = (experimentKey, variant, source) =>
  logEvent(ANALYTICS_EVENTS.EXPERIMENT_ASSIGNED, { experiment_key: experimentKey, variant, source });

export const logPushVariantDelivered = (variant, campaign, notificationType) =>
  logEvent(ANALYTICS_EVENTS.PUSH_VARIANT_DELIVERED, { variant, campaign, notification_type: notificationType });

export const logCtaVariantRendered = (variant, placement) =>
  logEvent(ANALYTICS_EVENTS.CTA_VARIANT_RENDERED, { variant, placement });

export const logCampaignResolved = (campaignId, region, variant) =>
  logEvent(ANALYTICS_EVENTS.CAMPAIGN_RESOLVED, { campaign_id: campaignId, region, variant });

export const logQuietHoursSkipped = (type, scheduledHour, scheduledMinute) =>
  logEvent(ANALYTICS_EVENTS.QUIET_HOURS_SKIPPED, { type, scheduled_hour: scheduledHour, scheduled_minute: scheduledMinute });

export const logSpiritualWeeklySummaryOpened = (weekKey, consistencyBand) =>
  logEvent(ANALYTICS_EVENTS.SPIRITUAL_WEEKLY_SUMMARY_OPENED, { week_key: weekKey, consistency_band: consistencyBand });

export const logFamilySummaryOpened = (familyId, weekKey, memberCount) =>
  logEvent(ANALYTICS_EVENTS.FAMILY_SUMMARY_OPENED, { family_id: familyId, week_key: weekKey, member_count: memberCount });

export const logFamilyGoalViewed = (familyId, weekKey, goalType, progressPercent) =>
  logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_VIEWED, { family_id: familyId, week_key: weekKey, goal_type: goalType, progress_percent: progressPercent });

export const logFamilyGoalContributed = (familyId, weekKey, goalType, amount, progressPercent) =>
  logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_CONTRIBUTED, { family_id: familyId, week_key: weekKey, goal_type: goalType, amount, progress_percent: progressPercent });

export const logFamilyGoalCompleted = (familyId, weekKey, goalType) =>
  logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_COMPLETED, { family_id: familyId, week_key: weekKey, goal_type: goalType });

export const logHatimWeeklySummaryViewed = (hatimId, weekKey, completedThisWeek) =>
  logEvent(ANALYTICS_EVENTS.HATIM_WEEKLY_SUMMARY_VIEWED, { hatim_id: hatimId, week_key: weekKey, completed_this_week: completedThisWeek });

export const logMiniLeagueOptedIn = (visibilityMode) =>
  logEvent(ANALYTICS_EVENTS.MINI_LEAGUE_OPTED_IN, { visibility_mode: visibilityMode });

export const logMiniLeagueViewed = (weekKey, rankBand, visibilityMode) =>
  logEvent(ANALYTICS_EVENTS.MINI_LEAGUE_VIEWED, { week_key: weekKey, rank_band: rankBand, visibility_mode: visibilityMode });

export const logAssistantV2Requested = (source, mode, metadata) =>
  logEvent(ANALYTICS_EVENTS.ASSISTANT_V2_REQUESTED, { source, mode, ...metadata });

export const logAssistantV2Responded = (confidence, hadActions, provider, latencyMs, actionCount, trustMetadata) =>
  logEvent(ANALYTICS_EVENTS.ASSISTANT_V2_RESPONDED, { confidence, had_actions: hadActions, provider, latency_ms: latencyMs, action_count: actionCount, ...trustMetadata });

export const logAssistantV2Fallback = (reason, provider, latencyMs) =>
  logEvent(ANALYTICS_EVENTS.ASSISTANT_V2_FALLBACK, { reason, provider, latency_ms: latencyMs });

export const logHomeRankingV2Resolved = (source, rankedCount, provider, latencyMs, riskBand) =>
  logEvent(ANALYTICS_EVENTS.HOME_RANKING_V2_RESOLVED, { source, ranked_count: rankedCount, provider, latency_ms: latencyMs, risk_band: riskBand });

export const logWeeklyInsightV1Viewed = (weekKey, riskBand, provider, latencyMs, trustMetadata) =>
  logEvent(ANALYTICS_EVENTS.WEEKLY_INSIGHT_V1_VIEWED, { week_key: weekKey, risk_band: riskBand, provider, latency_ms: latencyMs, ...trustMetadata });

export const logPushHintV1Applied = (reason, provider) =>
  logEvent(ANALYTICS_EVENTS.PUSH_HINT_V1_APPLIED, { reason, provider });

export const logAiTrustSurfaced = (surface, metadata) =>
  logEvent(ANALYTICS_EVENTS.AI_TRUST_SURFACED, { surface, ...metadata });

export const logAiHealthPanelViewed = (overallStatus, watchCount, actionCount) =>
  logEvent(ANALYTICS_EVENTS.AI_HEALTH_PANEL_VIEWED, { overall_status: overallStatus, watch_count: watchCount, action_count: actionCount });

export const logAiReleaseReadinessSurfaced = (status, recommendation, actionCount, watchCount, incidentCount) =>
  logEvent(ANALYTICS_EVENTS.AI_RELEASE_READINESS_SURFACED, { status, recommendation, action_count: actionCount, watch_count: watchCount, incident_count: incidentCount });
