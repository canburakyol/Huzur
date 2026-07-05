import { ANALYTICS_EVENTS } from "./constants";
import type { AnalyticsService } from "./core";

interface RetentionThis extends AnalyticsService {
  logEvent: (name: string, params?: Record<string, unknown>) => void;
  getMilestoneLabel: (days: number) => string;
}

class RetentionAnalyticsMethods {
  logOnboardingStarted(this: RetentionThis, step = "language_selection", metadata: Record<string, unknown> = {}): void {
    this.logEvent(ANALYTICS_EVENTS.ONBOARDING_STARTED, {
      step,
      ...(metadata && typeof metadata === "object" ? metadata : {}),
    });
  }

  logOnboardingCompleted(this: RetentionThis, selectedLanguage = "tr", metadata: Record<string, unknown> = {}): void {
    this.logEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
      selected_language: selectedLanguage,
      ...(metadata && typeof metadata === "object" ? metadata : {}),
    });
  }

  logFirstActivationFeatureOpened(
    this: RetentionThis,
    feature = "unknown",
    actionSource = "onboarding",
    metadata: Record<string, unknown> = {}
  ): void {
    this.logEvent(ANALYTICS_EVENTS.FIRST_ACTIVATION_FEATURE_OPENED, {
      feature,
      source: actionSource,
      ...(metadata && typeof metadata === "object" ? metadata : {}),
    });
  }

  logFirstPrayerActionCompleted(
    this: RetentionThis,
    actionSource = "onboarding",
    metadata: Record<string, unknown> = {}
  ): void {
    this.logEvent(ANALYTICS_EVENTS.FIRST_PRAYER_ACTION_COMPLETED, {
      source: actionSource,
      ...(metadata && typeof metadata === "object" ? metadata : {}),
    });
  }

  logStreakIncremented(this: RetentionThis, category: string, count: number, weeklyGoal: number | null = null): void {
    this.logEvent(ANALYTICS_EVENTS.STREAK_INCREMENTED, {
      category,
      streak_count: count,
      weekly_goal: weeklyGoal,
    });
  }

  logStreakRecoveryStarted(this: RetentionThis, category: string, recoveryType = "24h_window"): void {
    this.logEvent(ANALYTICS_EVENTS.STREAK_RECOVERY_STARTED, {
      category,
      recovery_type: recoveryType,
    });
  }

  logStreakRecoveryCompleted(this: RetentionThis, category: string, restoredCount: number): void {
    this.logEvent(ANALYTICS_EVENTS.STREAK_RECOVERY_COMPLETED, {
      category,
      restored_count: restoredCount,
    });
  }

  logWeeklyGoalSelected(this: RetentionThis, goalCount: number, source = "settings"): void {
    this.logEvent(ANALYTICS_EVENTS.WEEKLY_GOAL_SELECTED, {
      goal_count: goalCount,
      source,
    });
  }

  logRecoverySurfaceViewed(
    this: RetentionThis,
    surface = "unknown",
    riskBand = "steady",
    details: Record<string, unknown> = {}
  ): void {
    const safeDetails = details && typeof details === "object" ? details : {};
    this.logEvent(ANALYTICS_EVENTS.RECOVERY_SURFACE_VIEWED, {
      surface,
      risk_band: riskBand,
      ...safeDetails,
    });
  }

  logAiHealthPanelViewed(this: RetentionThis, overallStatus = "healthy", watchCount = 0, actionCount = 0): void {
    this.logEvent(ANALYTICS_EVENTS.AI_HEALTH_PANEL_VIEWED, {
      overall_status: overallStatus,
      watch_count: watchCount,
      action_count: actionCount,
    });
  }

  logAiReleaseReadinessSurfaced(
    this: RetentionThis,
    status = "monitor",
    recommendation = "cautious",
    actionCount = 0,
    watchCount = 0,
    incidentCount = 0
  ): void {
    this.logEvent(ANALYTICS_EVENTS.AI_RELEASE_READINESS_SURFACED, {
      status,
      recommendation,
      action_count: actionCount,
      watch_count: watchCount,
      incident_count: incidentCount,
    });
  }

  logSpiritualWeeklySummaryOpened(this: RetentionThis, weekKey: string, consistencyBand: string): void {
    this.logEvent(ANALYTICS_EVENTS.SPIRITUAL_WEEKLY_SUMMARY_OPENED, {
      week_key: weekKey,
      consistency_band: consistencyBand,
    });
  }

  logFamilySummaryOpened(this: RetentionThis, familyId: string, weekKey: string, memberCount = 0): void {
    this.logEvent(ANALYTICS_EVENTS.FAMILY_SUMMARY_OPENED, {
      family_id: familyId,
      week_key: weekKey,
      member_count: memberCount,
    });
  }

  logFamilyGoalViewed(
    this: RetentionThis,
    familyId: string,
    weekKey: string,
    goalType = "active_days",
    progressPercent = 0
  ): void {
    this.logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_VIEWED, {
      family_id: familyId,
      week_key: weekKey,
      goal_type: goalType,
      goal_progress_percent: progressPercent,
    });
  }

  logFamilyGoalContributed(
    this: RetentionThis,
    familyId: string,
    weekKey: string,
    goalType = "active_days",
    amount = 1,
    progressPercent = 0
  ): void {
    this.logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_CONTRIBUTED, {
      family_id: familyId,
      week_key: weekKey,
      goal_type: goalType,
      amount,
      goal_progress_percent: progressPercent,
    });
  }

  logFamilyGoalCompleted(this: RetentionThis, familyId: string, weekKey: string, goalType = "active_days"): void {
    this.logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_COMPLETED, {
      family_id: familyId,
      week_key: weekKey,
      goal_type: goalType,
    });
  }

  logHatimWeeklySummaryViewed(this: RetentionThis, hatimId: string, weekKey: string, completedThisWeek = 0): void {
    this.logEvent(ANALYTICS_EVENTS.HATIM_WEEKLY_SUMMARY_VIEWED, {
      hatim_id: hatimId,
      week_key: weekKey,
      completed_this_week: completedThisWeek,
    });
  }

  logMiniLeagueOptedIn(this: RetentionThis, visibilityMode = "private"): void {
    this.logEvent(ANALYTICS_EVENTS.MINI_LEAGUE_OPTED_IN, {
      visibility_mode: visibilityMode,
    });
  }

  logMiniLeagueViewed(
    this: RetentionThis,
    weekKey: string,
    rankBand = "closed",
    visibilityMode = "private"
  ): void {
    this.logEvent(ANALYTICS_EVENTS.MINI_LEAGUE_VIEWED, {
      week_key: weekKey,
      rank_band: rankBand,
      visibility_mode: visibilityMode,
    });
  }

  logAssistantV2Requested(
    this: RetentionThis,
    source = "assistant_tab",
    mode = "chat",
    metadata: Record<string, unknown> = {}
  ): void {
    this.logEvent(ANALYTICS_EVENTS.ASSISTANT_V2_REQUESTED, {
      source,
      mode,
      has_family: metadata.hasFamily === true,
      is_pro: metadata.isPro === true,
      has_streak: metadata.hasStreak === true,
    });
  }

  logAssistantV2Responded(
    this: RetentionThis,
    confidence = "medium",
    hadActions = false,
    provider = "fallback",
    latencyMs: number | null = null,
    actionCount = 0,
    trustMetadata: Record<string, unknown> = {}
  ): void {
    this.logEvent(ANALYTICS_EVENTS.ASSISTANT_V2_RESPONDED, {
      confidence,
      had_actions: hadActions === true,
      provider,
      latency_ms: Number.isFinite(latencyMs) ? Math.max(0, Math.round(latencyMs)) : undefined,
      action_count: Math.max(0, Number(actionCount) || 0),
      review_status: trustMetadata.reviewStatus || undefined,
      trust_score: Number.isFinite(Number(trustMetadata.trustScore))
        ? Math.round(Number(trustMetadata.trustScore) * 100) / 100
        : undefined,
      source_count: Math.max(0, Number(trustMetadata.sourceCount) || 0),
    });
  }

  logAssistantV2Fallback(
    this: RetentionThis,
    reason = "network_error",
    provider = "fallback",
    latencyMs: number | null = null
  ): void {
    this.logEvent(ANALYTICS_EVENTS.ASSISTANT_V2_FALLBACK, {
      reason,
      provider,
      latency_ms: Number.isFinite(latencyMs) ? Math.max(0, Math.round(latencyMs)) : undefined,
    });
  }

  logHomeRankingV2Resolved(
    this: RetentionThis,
    source = "home",
    rankedCount = 0,
    provider = "rules",
    latencyMs: number | null = null,
    riskBand = "steady"
  ): void {
    this.logEvent(ANALYTICS_EVENTS.HOME_RANKING_V2_RESOLVED, {
      source,
      ranked_count: rankedCount,
      provider,
      latency_ms: Number.isFinite(latencyMs) ? Math.max(0, Math.round(latencyMs)) : undefined,
      risk_band: riskBand,
    });
  }

  logWeeklyInsightV1Viewed(
    this: RetentionThis,
    weekKey: string,
    riskBand = "steady",
    provider = "fallback",
    latencyMs: number | null = null,
    trustMetadata: Record<string, unknown> = {}
  ): void {
    this.logEvent(ANALYTICS_EVENTS.WEEKLY_INSIGHT_V1_VIEWED, {
      week_key: weekKey,
      risk_band: riskBand,
      provider,
      latency_ms: Number.isFinite(latencyMs) ? Math.max(0, Math.round(latencyMs)) : undefined,
      review_status: trustMetadata.reviewStatus || undefined,
      trust_score: Number.isFinite(Number(trustMetadata.trustScore))
        ? Math.round(Number(trustMetadata.trustScore) * 100) / 100
        : undefined,
      source_count: Math.max(0, Number(trustMetadata.sourceCount) || 0),
    });
  }

  logPushHintV1Applied(this: RetentionThis, reason = "none", provider = "rules"): void {
    this.logEvent(ANALYTICS_EVENTS.PUSH_HINT_V1_APPLIED, {
      reason,
      provider,
    });
  }

  logAiTrustSurfaced(this: RetentionThis, surface = "assistant", metadata: Record<string, unknown> = {}): void {
    this.logEvent(ANALYTICS_EVENTS.AI_TRUST_SURFACED, {
      surface,
      provider: metadata.provider || "fallback",
      confidence: metadata.confidence || "medium",
      review_status: metadata.reviewStatus || "unreviewed",
      trust_score: Number.isFinite(Number(metadata.trustScore))
        ? Math.round(Number(metadata.trustScore) * 100) / 100
        : undefined,
      source_count: Math.max(0, Number(metadata.sourceCount) || 0),
    });
  }
}

export const registerRetentionAnalytics = (AnalyticsServiceClass: typeof AnalyticsService): void => {
  Object.getOwnPropertyNames(RetentionAnalyticsMethods.prototype)
    .filter((name) => name !== "constructor")
    .forEach((name) => {
      (AnalyticsServiceClass.prototype as Record<string, unknown>)[name] = (RetentionAnalyticsMethods.prototype as Record<string, unknown>)[name];
    });
};
