export const ANALYTICS_STORAGE_KEYS = {
  USER_PROPERTIES: 'analytics_user_properties',
  USER_ID: 'analytics_user_id',
  SESSION_COUNT: 'app_session_count',
  EVENTS: 'analytics_events',
  LAST_FLUSH_AT: 'analytics_last_flush_at',
  SETTINGS: 'huzur_settings'
};

export const ANALYTICS_CONFIG = {
  MAX_LOCAL_EVENTS: 1000,
  FLUSH_BATCH_SIZE: 50,
  FLUSH_INTERVAL_MS: 30_000,
  MAX_RETRIES: 3
};

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
  HOME_VIEWED: 'home_viewed',
  FEATURE_OPENED: 'feature_opened',
  FEATURE_OPEN_FAILED: 'feature_open_failed',
  FIRST_ACTIVATION_CARD_VIEWED: 'first_activation_card_viewed',
  FIRST_ACTIVATION_CARD_CLICKED: 'first_activation_card_clicked',
  FIRST_ACTIVATION_FEATURE_OPENED: 'first_activation_feature_opened',
  
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
  THEME_CHANGED: 'theme_changed',

  // Growth Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  FIRST_PRAYER_ACTION_COMPLETED: 'first_prayer_action_completed',
  ONBOARDING_STEP_VIEWED: 'onboarding_step_viewed',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_GOAL_SELECTED: 'onboarding_goal_selected',
  ONBOARDING_PERMISSION_CHOICE: 'onboarding_permission_choice',
  HUZUR_RITMI_PREVIEW_VIEWED: 'huzur_ritmi_preview_viewed',
  HUZUR_RITMI_CTA_CLICKED: 'huzur_ritmi_cta_clicked',

  // Phase 2 Retention
  STREAK_INCREMENTED: 'streak_incremented',
  STREAK_RECOVERY_STARTED: 'streak_recovery_started',
  STREAK_RECOVERY_COMPLETED: 'streak_recovery_completed',
  WEEKLY_GOAL_SELECTED: 'weekly_goal_selected',
  RECOVERY_SURFACE_VIEWED: 'recovery_surface_viewed',
  PREMIUM_RECOVERY_MOMENT_OPENED: 'premium_recovery_moment_opened',

  // Phase 3 Viral - Share Cards
  SHARE_OPENED: 'share_opened',
  SHARE_SENT: 'share_sent',
  INVITE_MODAL_VIEWED: 'invite_modal_viewed',
  INVITE_CREATED: 'invite_created',
  INVITE_SHARE_OPENED: 'invite_share_opened',
  INVITE_CODE_COPIED: 'invite_code_copied',
  INVITE_LINK_COPIED: 'invite_link_copied',
  INVITE_ACCEPTED: 'invite_accepted',
  REFERRAL_REWARD_UNLOCKED: 'referral_reward_unlocked',
  REFERRAL_ATTEMPT_BLOCKED: 'referral_attempt_blocked',
  REFERRAL_ABUSE_FLAGGED: 'referral_abuse_flagged',
  REFERRAL_ONBOARDING_SURFACED: 'referral_onboarding_surfaced',
  REFERRAL_ONBOARDING_COMPLETED: 'referral_onboarding_completed',
  REFERRAL_TRIGGER_SURFACE_VIEWED: 'referral_trigger_surface_viewed',
  REFERRAL_TRIGGER_CTA_CLICKED: 'referral_trigger_cta_clicked',
  REFERRAL_REWARD_CLAIMED: 'referral_reward_claimed',
  REFERRAL_REWARD_PRO_ACTIVATED: 'referral_reward_pro_activated',

  // Growth Experiments & Campaign
  EXPERIMENT_ASSIGNED: 'experiment_assigned',
  PUSH_VARIANT_DELIVERED: 'push_variant_delivered',
  CTA_VARIANT_RENDERED: 'cta_variant_rendered',
  CAMPAIGN_RESOLVED: 'campaign_resolved',
  QUIET_HOURS_SKIPPED: 'quiet_hours_skipped',

  // Social Retention
  SPIRITUAL_WEEKLY_SUMMARY_OPENED: 'spiritual_weekly_summary_opened',
  FAMILY_SUMMARY_OPENED: 'family_summary_opened',
  FAMILY_GOAL_VIEWED: 'family_goal_viewed',
  FAMILY_GOAL_CONTRIBUTED: 'family_goal_contributed',
  FAMILY_GOAL_COMPLETED: 'family_goal_completed',
  HATIM_WEEKLY_SUMMARY_VIEWED: 'hatim_weekly_summary_viewed',
  MINI_LEAGUE_OPTED_IN: 'mini_league_opted_in',
  MINI_LEAGUE_VIEWED: 'mini_league_viewed',

  // AI Layer
  ASSISTANT_V2_REQUESTED: 'assistant_v2_requested',
  ASSISTANT_V2_RESPONDED: 'assistant_v2_responded',
  ASSISTANT_V2_FALLBACK: 'assistant_v2_fallback',
  HOME_RANKING_V2_RESOLVED: 'home_ranking_v2_resolved',
  WEEKLY_INSIGHT_V1_VIEWED: 'weekly_insight_v1_viewed',
  PUSH_HINT_V1_APPLIED: 'push_hint_v1_applied',
  AI_TRUST_SURFACED: 'ai_trust_surfaced',
  AI_HEALTH_PANEL_VIEWED: 'ai_health_panel_viewed',
  AI_RELEASE_READINESS_SURFACED: 'ai_release_readiness_surfaced',

  // Premium Moments
  PAYWALL_VIEWED: 'paywall_viewed',
  PAYWALL_PACKAGE_SELECTED: 'paywall_package_selected',
  PAYWALL_PURCHASE_STARTED: 'paywall_purchase_started',
  PAYWALL_PURCHASE_SUCCEEDED: 'paywall_purchase_succeeded',
  PAYWALL_PURCHASE_FAILED: 'paywall_purchase_failed',
  PAYWALL_RESTORE_STARTED: 'paywall_restore_started',
  PAYWALL_RESTORE_SUCCEEDED: 'paywall_restore_succeeded',
  PAYWALL_RESTORE_NOT_FOUND: 'paywall_restore_not_found',
  PREMIUM_MOMENT_OPENED: 'premium_moment_opened'
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


