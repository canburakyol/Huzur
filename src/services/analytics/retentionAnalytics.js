import { ANALYTICS_EVENTS } from './constants';

class RetentionAnalyticsMethods {
  logOnboardingStarted(step = 'language_selection', metadata = {}) {
    this.logEvent(ANALYTICS_EVENTS.ONBOARDING_STARTED, {
      step,
      ...(metadata && typeof metadata === 'object' ? metadata : {})
    });
  }

  /**
   * Track onboarding completed
   */
  logOnboardingCompleted(selectedLanguage = 'tr', metadata = {}) {
    this.logEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
      selected_language: selectedLanguage,
      ...(metadata && typeof metadata === 'object' ? metadata : {})
    });
  }

  logFirstActivationFeatureOpened(feature = 'unknown', actionSource = 'onboarding') {
    this.logEvent(ANALYTICS_EVENTS.FIRST_ACTIVATION_FEATURE_OPENED, {
      feature,
      source: actionSource
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

  logRecoverySurfaceViewed(surface = 'unknown', riskBand = 'steady', details = {}) {
    const safeDetails = details && typeof details === 'object' ? details : {};
    this.logEvent(ANALYTICS_EVENTS.RECOVERY_SURFACE_VIEWED, {
      surface,
      risk_band: riskBand,
      ...safeDetails
    });
  }


  logAiHealthPanelViewed(overallStatus = 'healthy', watchCount = 0, actionCount = 0) {
    this.logEvent(ANALYTICS_EVENTS.AI_HEALTH_PANEL_VIEWED, {
      overall_status: overallStatus,
      watch_count: watchCount,
      action_count: actionCount,
    });
  }

  logAiReleaseReadinessSurfaced(status = 'monitor', recommendation = 'cautious', actionCount = 0, watchCount = 0, incidentCount = 0) {
    this.logEvent(ANALYTICS_EVENTS.AI_RELEASE_READINESS_SURFACED, {
      status,
      recommendation,
      action_count: actionCount,
      watch_count: watchCount,
      incident_count: incidentCount,
    });
  }

  logSpiritualWeeklySummaryOpened(weekKey, consistencyBand) {
    this.logEvent(ANALYTICS_EVENTS.SPIRITUAL_WEEKLY_SUMMARY_OPENED, {
      week_key: weekKey,
      consistency_band: consistencyBand
    });
  }

  logFamilySummaryOpened(familyId, weekKey, memberCount = 0) {
    this.logEvent(ANALYTICS_EVENTS.FAMILY_SUMMARY_OPENED, {
      family_id: familyId,
      week_key: weekKey,
      member_count: memberCount
    });
  }

  logFamilyGoalViewed(familyId, weekKey, goalType = 'active_days', progressPercent = 0) {
    this.logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_VIEWED, {
      family_id: familyId,
      week_key: weekKey,
      goal_type: goalType,
      goal_progress_percent: progressPercent
    });
  }

  logFamilyGoalContributed(familyId, weekKey, goalType = 'active_days', amount = 1, progressPercent = 0) {
    this.logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_CONTRIBUTED, {
      family_id: familyId,
      week_key: weekKey,
      goal_type: goalType,
      amount,
      goal_progress_percent: progressPercent
    });
  }

  logFamilyGoalCompleted(familyId, weekKey, goalType = 'active_days') {
    this.logEvent(ANALYTICS_EVENTS.FAMILY_GOAL_COMPLETED, {
      family_id: familyId,
      week_key: weekKey,
      goal_type: goalType
    });
  }

  logHatimWeeklySummaryViewed(hatimId, weekKey, completedThisWeek = 0) {
    this.logEvent(ANALYTICS_EVENTS.HATIM_WEEKLY_SUMMARY_VIEWED, {
      hatim_id: hatimId,
      week_key: weekKey,
      completed_this_week: completedThisWeek
    });
  }

  logMiniLeagueOptedIn(visibilityMode = 'private') {
    this.logEvent(ANALYTICS_EVENTS.MINI_LEAGUE_OPTED_IN, {
      visibility_mode: visibilityMode
    });
  }

  logMiniLeagueViewed(weekKey, rankBand = 'closed', visibilityMode = 'private') {
    this.logEvent(ANALYTICS_EVENTS.MINI_LEAGUE_VIEWED, {
      week_key: weekKey,
      rank_band: rankBand,
      visibility_mode: visibilityMode
    });
  }

  logAssistantV2Requested(source = 'assistant_tab', mode = 'chat', metadata = {}) {
    this.logEvent(ANALYTICS_EVENTS.ASSISTANT_V2_REQUESTED, {
      source,
      mode,
      has_family: metadata.hasFamily === true,
      is_pro: metadata.isPro === true,
      has_streak: metadata.hasStreak === true
    });
  }

  logAssistantV2Responded(confidence = 'medium', hadActions = false, provider = 'fallback', latencyMs = null, actionCount = 0, trustMetadata = {}) {
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
      source_count: Math.max(0, Number(trustMetadata.sourceCount) || 0)
    });
  }

  logAssistantV2Fallback(reason = 'network_error', provider = 'fallback', latencyMs = null) {
    this.logEvent(ANALYTICS_EVENTS.ASSISTANT_V2_FALLBACK, {
      reason,
      provider,
      latency_ms: Number.isFinite(latencyMs) ? Math.max(0, Math.round(latencyMs)) : undefined
    });
  }

  logHomeRankingV2Resolved(source = 'home', rankedCount = 0, provider = 'rules', latencyMs = null, riskBand = 'steady') {
    this.logEvent(ANALYTICS_EVENTS.HOME_RANKING_V2_RESOLVED, {
      source,
      ranked_count: rankedCount,
      provider,
      latency_ms: Number.isFinite(latencyMs) ? Math.max(0, Math.round(latencyMs)) : undefined,
      risk_band: riskBand
    });
  }

  logWeeklyInsightV1Viewed(weekKey, riskBand = 'steady', provider = 'fallback', latencyMs = null, trustMetadata = {}) {
    this.logEvent(ANALYTICS_EVENTS.WEEKLY_INSIGHT_V1_VIEWED, {
      week_key: weekKey,
      risk_band: riskBand,
      provider,
      latency_ms: Number.isFinite(latencyMs) ? Math.max(0, Math.round(latencyMs)) : undefined,
      review_status: trustMetadata.reviewStatus || undefined,
      trust_score: Number.isFinite(Number(trustMetadata.trustScore))
        ? Math.round(Number(trustMetadata.trustScore) * 100) / 100
        : undefined,
      source_count: Math.max(0, Number(trustMetadata.sourceCount) || 0)
    });
  }

  logPushHintV1Applied(reason = 'none', provider = 'rules') {
    this.logEvent(ANALYTICS_EVENTS.PUSH_HINT_V1_APPLIED, {
      reason,
      provider
    });
  }

  logAiTrustSurfaced(surface = 'assistant', metadata = {}) {
    this.logEvent(ANALYTICS_EVENTS.AI_TRUST_SURFACED, {
      surface,
      provider: metadata.provider || 'fallback',
      confidence: metadata.confidence || 'medium',
      review_status: metadata.reviewStatus || 'unreviewed',
      trust_score: Number.isFinite(Number(metadata.trustScore))
        ? Math.round(Number(metadata.trustScore) * 100) / 100
        : undefined,
      source_count: Math.max(0, Number(metadata.sourceCount) || 0)
    });
  }
}

export const registerRetentionAnalytics = (AnalyticsService) => {
  Object.getOwnPropertyNames(RetentionAnalyticsMethods.prototype)
    .filter((name) => name !== 'constructor')
    .forEach((name) => {
      AnalyticsService.prototype[name] = RetentionAnalyticsMethods.prototype[name];
    });
};
