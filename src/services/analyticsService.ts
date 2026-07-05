import { AnalyticsService } from "./analytics/core";
import { ANALYTICS_EVENTS, SCREENS } from "./analytics/constants";
import { registerCampaignAnalytics } from "./analytics/campaignAnalytics";
import { registerEventTrackingAnalytics } from "./analytics/eventTracking";
import { registerRevenueAnalytics } from "./analytics/revenueAnalytics";
import { registerRetentionAnalytics } from "./analytics/retentionAnalytics";

registerEventTrackingAnalytics(AnalyticsService);
registerCampaignAnalytics(AnalyticsService);
registerRevenueAnalytics(AnalyticsService);
registerRetentionAnalytics(AnalyticsService);

export { ANALYTICS_EVENTS, SCREENS };

export const analyticsService = new AnalyticsService();

export const logEvent = (name: string, params: Record<string, unknown> = {}): void =>
  analyticsService.logEvent(name, params);

export const logScreenView = (screen: string, className: string | null = null): void =>
  analyticsService.logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
    screen_name: screen,
    screen_class: className || screen,
  });

export const setUserProperty = (name: string, value: string): void => analyticsService.setUserProperty(name, value);

export const setUserId = (id: string): void => analyticsService.setUserId(id);

export const logPrayerCompleted = (prayer: string, time: string, onTime: boolean): void =>
  logEvent(ANALYTICS_EVENTS.PRAYER_COMPLETED, { prayer, time, on_time: onTime });

export const logStreakMilestone = (days: number): void =>
  logEvent(ANALYTICS_EVENTS.STREAK_MILESTONE, { days, milestone: analyticsService.getMilestoneLabel(days) });

export const logChallengeCompleted = (id: string, category: string, xp: number): void =>
  logEvent(ANALYTICS_EVENTS.CHALLENGE_COMPLETED, { challenge_id: id, category, xp });

export const logLevelUp = (level: number, xp: number): void =>
  logEvent(ANALYTICS_EVENTS.LEVEL_UP, { level, xp });

export const logBadgeEarned = (id: string, name: string): void =>
  logEvent(ANALYTICS_EVENTS.BADGE_EARNED, { badge_id: id, badge_name: name });

export const logNotificationReceived = (type: string, prayer: string | null = null): void =>
  logEvent(ANALYTICS_EVENTS.NOTIFICATION_RECEIVED, { notification_type: type, prayer });

export const logNotificationTapped = (type: string, prayer: string | null = null): void =>
  logEvent(ANALYTICS_EVENTS.NOTIFICATION_TAPPED, { notification_type: type, prayer });

export const logAppOpen = (source: string, metadata: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.APP_OPEN, { source, ...metadata });

export const logOnboardingStarted = (step: string, metadata: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.ONBOARDING_STARTED, { step, ...metadata });

export const logOnboardingCompleted = (lang: string, metadata: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, { language: lang, ...metadata });

export const logFirstActivationFeatureOpened = (
  feature: string,
  source: string,
  metadata: Record<string, unknown> = {}
): void =>
  logEvent(ANALYTICS_EVENTS.FIRST_ACTIVATION_FEATURE_OPENED, { feature, source, ...metadata });

export const logFirstPrayerActionCompleted = (source: string, metadata: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.FIRST_PRAYER_ACTION_COMPLETED, { source, ...metadata });

export const logStreakIncremented = (category: string, count: number, weeklyGoal: number | null): void =>
  logEvent(ANALYTICS_EVENTS.STREAK_INCREMENTED, { category, count, weekly_goal: weeklyGoal });

export const logStreakRecoveryStarted = (category: string, recoveryType: string): void =>
  logEvent(ANALYTICS_EVENTS.STREAK_RECOVERY_STARTED, { category, recovery_type: recoveryType });

export const logStreakRecoveryCompleted = (category: string, restoredCount: number): void =>
  logEvent(ANALYTICS_EVENTS.STREAK_RECOVERY_COMPLETED, { category, restored_count: restoredCount });

export const logWeeklyGoalSelected = (goalCount: number, source: string): void =>
  logEvent(ANALYTICS_EVENTS.WEEKLY_GOAL_SELECTED, { goal_count: goalCount, source });

export const logRecoverySurfaceViewed = (surface: string, riskBand: string, details: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.RECOVERY_SURFACE_VIEWED, { surface, risk_band: riskBand, ...details });

export const logPremiumRecoveryMomentOpened = (surface: string, riskBand: string, recoveryFeature: string): void =>
  logEvent(ANALYTICS_EVENTS.PREMIUM_RECOVERY_MOMENT_OPENED, { surface, risk_band: riskBand, recovery_feature: recoveryFeature });

export const logShareOpened = (cardType: string, source = "daily_content"): void =>
  logEvent(ANALYTICS_EVENTS.SHARE_OPENED, { card_type: cardType, source });

export const logShareSent = (cardType: string, channel = "native_share"): void =>
  logEvent(ANALYTICS_EVENTS.SHARE_SENT, { card_type: cardType, channel });

export const logInviteModalViewed = (source = "invite_modal", details: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.INVITE_MODAL_VIEWED, { source, ...details });

export const logInviteCreated = (
  referralCode: string,
  source = "app_share",
  campaign = "evergreen",
  lang = "tr",
  metadata: Record<string, unknown> = {}
): void =>
  logEvent(ANALYTICS_EVENTS.INVITE_CREATED, { referral_code: referralCode, source, campaign, lang, ...metadata });

export const logInviteShareOpened = (source = "invite_modal", channel = "native_share", details: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.INVITE_SHARE_OPENED, { source, channel, ...details });

export const logInviteCodeCopied = (referralCode: string, source = "invite_modal", details: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.INVITE_CODE_COPIED, { referral_code: referralCode, source, ...details });

export const logInviteLinkCopied = (source = "invite_modal", details: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.INVITE_LINK_COPIED, { source, ...details });

export const logInviteAccepted = (referralCode: string, source: string): void =>
  logEvent(ANALYTICS_EVENTS.INVITE_ACCEPTED, { referral_code: referralCode, source });

export const logReferralRewardUnlocked = (referralCode: string, rewardType: string): void =>
  logEvent(ANALYTICS_EVENTS.REFERRAL_REWARD_UNLOCKED, { referral_code: referralCode, reward_type: rewardType });

export const logReferralAttemptBlocked = (
  referralCode: string,
  reason: string,
  source: string,
  blockedUntil: string | null
): void =>
  logEvent(ANALYTICS_EVENTS.REFERRAL_ATTEMPT_BLOCKED, {
    referral_code: referralCode,
    reason,
    source,
    blocked_until: blockedUntil,
  });

export const logReferralAbuseFlagged = (reason: string, severity: string, details: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.REFERRAL_ABUSE_FLAGGED, { reason, severity, ...details });

export const logExperimentAssigned = (experimentKey: string, variant: string, source: string): void =>
  logEvent(ANALYTICS_EVENTS.EXPERIMENT_ASSIGNED, { experiment_key: experimentKey, variant, source });

export const logPushVariantDelivered = (variant: string, campaign: string, notificationType: string): void =>
  logEvent(ANALYTICS_EVENTS.PUSH_VARIANT_DELIVERED, { variant, campaign, notification_type: notificationType });

export const logCtaVariantRendered = (variant: string, placement: string): void =>
  logEvent(ANALYTICS_EVENTS.CTA_VARIANT_RENDERED, { variant, placement });

export const logCampaignResolved = (campaignId: string, region: string, variant: string): void =>
  logEvent(ANALYTICS_EVENTS.CAMPAIGN_RESOLVED, { campaign_id: campaignId, region, variant });

export const logQuietHoursSkipped = (type: string, scheduledHour: number, scheduledMinute: number): void =>
  logEvent(ANALYTICS_EVENTS.QUIET_HOURS_SKIPPED, { type, scheduled_hour: scheduledHour, scheduled_minute: scheduledMinute });

export const logSpiritualWeeklySummaryOpened = (weekKey: string, consistencyBand: string): void =>
  logEvent(ANALYTICS_EVENTS.SPIRITUAL_WEEKLY_SUMMARY_OPENED, { week_key: weekKey, consistency_band: consistencyBand });

export const logFamilySummaryOpened = (familyId: string, weekKey: string, memberCount = 0): void =>
  logEvent(ANALYTICS_EVENTS.FAMILY_SUMMARY_OPENED, { family_id: familyId, week_key: weekKey, member_count: memberCount });

export const logFamilyGoalViewed = (familyId: string, weekKey: string, goalType: string, progressPercent: number): void =>
  logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_VIEWED, {
    family_id: familyId,
    week_key: weekKey,
    goal_type: goalType,
    progress_percent: progressPercent,
  });

export const logFamilyGoalContributed = (
  familyId: string,
  weekKey: string,
  goalType: string,
  amount: number,
  progressPercent: number
): void =>
  logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_CONTRIBUTED, {
    family_id: familyId,
    week_key: weekKey,
    goal_type: goalType,
    amount,
    progress_percent: progressPercent,
  });

export const logFamilyGoalCompleted = (familyId: string, weekKey: string, goalType: string): void =>
  logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_COMPLETED, { family_id: familyId, week_key: weekKey, goal_type: goalType });

export const logHatimWeeklySummaryViewed = (hatimId: string, weekKey: string, completedThisWeek: number): void =>
  logEvent(ANALYTICS_EVENTS.HATIM_WEEKLY_SUMMARY_VIEWED, {
    hatim_id: hatimId,
    week_key: weekKey,
    completed_this_week: completedThisWeek,
  });

export const logMiniLeagueOptedIn = (visibilityMode: string): void =>
  logEvent(ANALYTICS_EVENTS.MINI_LEAGUE_OPTED_IN, { visibility_mode: visibilityMode });

export const logMiniLeagueViewed = (weekKey: string, rankBand: string, visibilityMode: string): void =>
  logEvent(ANALYTICS_EVENTS.MINI_LEAGUE_VIEWED, { week_key: weekKey, rank_band: rankBand, visibility_mode: visibilityMode });

export const logAssistantV2Requested = (source: string, mode: string, metadata: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.ASSISTANT_V2_REQUESTED, { source, mode, ...metadata });

export const logAssistantV2Responded = (
  confidence: string,
  hadActions: boolean,
  provider: string,
  latencyMs: number | null,
  actionCount: number,
  trustMetadata: Record<string, unknown> = {}
): void =>
  logEvent(ANALYTICS_EVENTS.ASSISTANT_V2_RESPONDED, {
    confidence,
    had_actions: hadActions,
    provider,
    latency_ms: latencyMs,
    action_count: actionCount,
    ...trustMetadata,
  });

export const logAssistantV2Fallback = (reason: string, provider: string, latencyMs: number | null): void =>
  logEvent(ANALYTICS_EVENTS.ASSISTANT_V2_FALLBACK, { reason, provider, latency_ms: latencyMs });

export const logHomeRankingV2Resolved = (
  source: string,
  rankedCount: number,
  provider: string,
  latencyMs: number | null,
  riskBand: string
): void =>
  logEvent(ANALYTICS_EVENTS.HOME_RANKING_V2_RESOLVED, {
    source,
    ranked_count: rankedCount,
    provider,
    latency_ms: latencyMs,
    risk_band: riskBand,
  });

export const logWeeklyInsightV1Viewed = (
  weekKey: string,
  riskBand: string,
  provider: string,
  latencyMs: number | null,
  trustMetadata: Record<string, unknown> = {}
): void =>
  logEvent(ANALYTICS_EVENTS.WEEKLY_INSIGHT_V1_VIEWED, { week_key: weekKey, risk_band: riskBand, provider, latency_ms: latencyMs, ...trustMetadata });

export const logPushHintV1Applied = (reason: string, provider: string): void =>
  logEvent(ANALYTICS_EVENTS.PUSH_HINT_V1_APPLIED, { reason, provider });

export const logAiTrustSurfaced = (surface: string, metadata: Record<string, unknown> = {}): void =>
  logEvent(ANALYTICS_EVENTS.AI_TRUST_SURFACED, { surface, ...metadata });

export const logAiHealthPanelViewed = (overallStatus: string, watchCount: number, actionCount: number): void =>
  logEvent(ANALYTICS_EVENTS.AI_HEALTH_PANEL_VIEWED, {
    overall_status: overallStatus,
    watch_count: watchCount,
    action_count: actionCount,
  });

export const logAiReleaseReadinessSurfaced = (
  status: string,
  recommendation: string,
  actionCount: number,
  watchCount: number,
  incidentCount: number
): void =>
  logEvent(ANALYTICS_EVENTS.AI_RELEASE_READINESS_SURFACED, {
    status,
    recommendation,
    action_count: actionCount,
    watch_count: watchCount,
    incident_count: incidentCount,
  });
