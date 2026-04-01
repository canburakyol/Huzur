/**
 * Analytics Service
 * Tracks user events and app metrics for Firebase Analytics
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
export const logOnboardingStarted = (step, metadata) => analyticsService.logOnboardingStarted(step, metadata);
export const logOnboardingCompleted = (lang, metadata) => analyticsService.logOnboardingCompleted(lang, metadata);
export const logFirstPrayerActionCompleted = (source) => analyticsService.logFirstPrayerActionCompleted(source);
export const logStreakIncremented = (category, count, weeklyGoal) => analyticsService.logStreakIncremented(category, count, weeklyGoal);
export const logStreakRecoveryStarted = (category, recoveryType) => analyticsService.logStreakRecoveryStarted(category, recoveryType);
export const logStreakRecoveryCompleted = (category, restoredCount) => analyticsService.logStreakRecoveryCompleted(category, restoredCount);
export const logWeeklyGoalSelected = (goalCount, source) => analyticsService.logWeeklyGoalSelected(goalCount, source);
export const logRecoverySurfaceViewed = (surface, riskBand, details) => analyticsService.logRecoverySurfaceViewed(surface, riskBand, details);
export const logPremiumRecoveryMomentOpened = (surface, riskBand, recoveryFeature) => analyticsService.logPremiumRecoveryMomentOpened(surface, riskBand, recoveryFeature);
export const logShareOpened = (cardType, source) => analyticsService.logShareOpened(cardType, source);
export const logShareSent = (cardType, channel) => analyticsService.logShareSent(cardType, channel);
export const logInviteModalViewed = (source, details) => analyticsService.logInviteModalViewed(source, details);
export const logInviteCreated = (referralCode, source, campaign, lang, metadata) => analyticsService.logInviteCreated(referralCode, source, campaign, lang, metadata);
export const logInviteShareOpened = (source, channel, details) => analyticsService.logInviteShareOpened(source, channel, details);
export const logInviteCodeCopied = (referralCode, source, details) => analyticsService.logInviteCodeCopied(referralCode, source, details);
export const logInviteLinkCopied = (source, details) => analyticsService.logInviteLinkCopied(source, details);
export const logInviteAccepted = (referralCode, source) => analyticsService.logInviteAccepted(referralCode, source);
export const logReferralRewardUnlocked = (referralCode, rewardType) => analyticsService.logReferralRewardUnlocked(referralCode, rewardType);
export const logReferralAttemptBlocked = (referralCode, reason, source, blockedUntil) => analyticsService.logReferralAttemptBlocked(referralCode, reason, source, blockedUntil);
export const logReferralAbuseFlagged = (reason, severity, details) => analyticsService.logReferralAbuseFlagged(reason, severity, details);
export const logExperimentAssigned = (experimentKey, variant, source) => analyticsService.logExperimentAssigned(experimentKey, variant, source);
export const logPushVariantDelivered = (variant, campaign, notificationType) => analyticsService.logPushVariantDelivered(variant, campaign, notificationType);
export const logCtaVariantRendered = (variant, placement) => analyticsService.logCtaVariantRendered(variant, placement);
export const logCampaignResolved = (campaignId, region, variant) => analyticsService.logCampaignResolved(campaignId, region, variant);
export const logQuietHoursSkipped = (type, scheduledHour, scheduledMinute) => analyticsService.logQuietHoursSkipped(type, scheduledHour, scheduledMinute);
export const logSpiritualWeeklySummaryOpened = (weekKey, consistencyBand) => analyticsService.logSpiritualWeeklySummaryOpened(weekKey, consistencyBand);
export const logFamilySummaryOpened = (familyId, weekKey, memberCount) => analyticsService.logFamilySummaryOpened(familyId, weekKey, memberCount);
export const logFamilyGoalViewed = (familyId, weekKey, goalType, progressPercent) => analyticsService.logFamilyGoalViewed(familyId, weekKey, goalType, progressPercent);
export const logFamilyGoalContributed = (familyId, weekKey, goalType, amount, progressPercent) => analyticsService.logFamilyGoalContributed(familyId, weekKey, goalType, amount, progressPercent);
export const logFamilyGoalCompleted = (familyId, weekKey, goalType) => analyticsService.logFamilyGoalCompleted(familyId, weekKey, goalType);
export const logHatimWeeklySummaryViewed = (hatimId, weekKey, completedThisWeek) => analyticsService.logHatimWeeklySummaryViewed(hatimId, weekKey, completedThisWeek);
export const logMiniLeagueOptedIn = (visibilityMode) => analyticsService.logMiniLeagueOptedIn(visibilityMode);
export const logMiniLeagueViewed = (weekKey, rankBand, visibilityMode) => analyticsService.logMiniLeagueViewed(weekKey, rankBand, visibilityMode);
export const logAssistantV2Requested = (source, mode, metadata) => analyticsService.logAssistantV2Requested(source, mode, metadata);
export const logAssistantV2Responded = (confidence, hadActions, provider, latencyMs, actionCount, trustMetadata) => analyticsService.logAssistantV2Responded(confidence, hadActions, provider, latencyMs, actionCount, trustMetadata);
export const logAssistantV2Fallback = (reason, provider, latencyMs) => analyticsService.logAssistantV2Fallback(reason, provider, latencyMs);
export const logHomeRankingV2Resolved = (source, rankedCount, provider, latencyMs, riskBand) => analyticsService.logHomeRankingV2Resolved(source, rankedCount, provider, latencyMs, riskBand);
export const logWeeklyInsightV1Viewed = (weekKey, riskBand, provider, latencyMs, trustMetadata) => analyticsService.logWeeklyInsightV1Viewed(weekKey, riskBand, provider, latencyMs, trustMetadata);
export const logPushHintV1Applied = (reason, provider) => analyticsService.logPushHintV1Applied(reason, provider);
export const logAiTrustSurfaced = (surface, metadata) => analyticsService.logAiTrustSurfaced(surface, metadata);
export const logAiHealthPanelViewed = (overallStatus, watchCount, actionCount) => analyticsService.logAiHealthPanelViewed(overallStatus, watchCount, actionCount);
export const logAiReleaseReadinessSurfaced = (status, recommendation, actionCount, watchCount, incidentCount) => analyticsService.logAiReleaseReadinessSurfaced(status, recommendation, actionCount, watchCount, incidentCount);
export const setUserProperty = (name, value) => analyticsService.setUserProperty(name, value);
export const setUserId = (id) => analyticsService.setUserId(id);
