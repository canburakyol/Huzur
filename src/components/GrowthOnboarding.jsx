import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  BookOpen,
  Check,
  Globe2,
  HeartHandshake,
  MapPinned,
  Sparkles,
  Target
} from 'lucide-react';
import { ANALYTICS_EVENTS, logEvent } from '../services/analyticsService';
import { DEFAULT_ONBOARDING_CONFIG } from '../services/onboardingConfigService';
import {
  buildReferralOnboardingAnalyticsPayload,
  buildReferralOnboardingPlan,
} from '../services/referralOnboardingService';
import { SUPPORTED_LANGUAGE_OPTIONS } from '../config/i18nConfig';
import { STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';
import { DEFAULT_PRIMARY_GOAL, normalizePrimaryGoal, setStoredPrimaryGoal } from '../utils/primaryGoal';

const baseButton = {
  border: 'none',
  borderRadius: 12,
  padding: '10px 12px',
  fontWeight: 700,
  cursor: 'pointer'
};

const choiceButtonStyle = (selected = false) => ({
  ...baseButton,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  textAlign: 'left',
  width: '100%',
  background: selected ? 'var(--tertiary-container)' : 'var(--surface-container-lowest)',
  color: selected ? 'var(--on-tertiary-container)' : 'var(--on-surface)',
  border: selected ? '1px solid var(--tertiary)' : '1px solid var(--outline-variant)',
  boxShadow: selected ? '0 10px 24px rgba(71, 53, 22, 0.12)' : 'none',
  transition: 'all 0.2s ease'
});

const permissionButtonStyle = (selected = false, primary = false) => ({
  ...baseButton,
  padding: '7px 10px',
  background: selected
    ? (primary ? 'var(--primary)' : 'var(--surface-container-high)')
    : 'var(--surface-container-lowest)',
  color: selected && primary ? 'var(--on-primary)' : 'var(--on-surface)',
  border: selected
    ? `1px solid ${primary ? 'var(--primary)' : 'var(--outline)'}`
    : '1px solid var(--outline-variant)',
  minWidth: 96
});

const GOAL_ICONS = {
  prayer_rhythm: <Target size={20} />,
  quran_learning: <BookOpen size={20} />,
  family_consistency: <HeartHandshake size={20} />
};

// Permissions are requested contextually after a meaningful user action.
const ALLOWED_STEPS = ['language', 'goal'];

const sanitizeSteps = (steps = []) => {
  if (!Array.isArray(steps)) return DEFAULT_ONBOARDING_CONFIG.steps;
  const normalized = steps
    .map((item) => (typeof item === 'string' ? item.trim().toLowerCase() : null))
    .filter((item) => ALLOWED_STEPS.includes(item));
  return normalized.length > 0 ? [...new Set(normalized)] : DEFAULT_ONBOARDING_CONFIG.steps;
};

function GrowthOnboarding({
  initialStep = 0,
  initialLanguage = 'tr',
  flowConfig = null,
  referralProgress = null,
  referralServerSnapshot = null,
  isProUser = false,
  onSelectLanguage,
  onRequestLocation,
  onRequestNotifications,
  onComplete,
  onStepChange,
  loadingLocation = false,
  loadingNotifications = false
}) {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [selectedGoal, setSelectedGoal] = useState(DEFAULT_PRIMARY_GOAL);
  const [locationPreference, setLocationPreference] = useState(null);
  const [notificationPreference, setNotificationPreference] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const overlayRef = useRef(null);
  const lastViewedStepRef = useRef('');
  const lastGoalRef = useRef('');

  const resolvedConfig = useMemo(() => {
    const safe = flowConfig && typeof flowConfig === 'object' ? flowConfig : {};
    return {
      ...DEFAULT_ONBOARDING_CONFIG,
      ...safe,
      steps: sanitizeSteps(safe.steps),
    };
  }, [flowConfig]);

  const languageOptions = useMemo(() => SUPPORTED_LANGUAGE_OPTIONS, []);
  const goals = useMemo(() => ([
    {
      id: 'prayer_rhythm',
      label: t('growth.goal.prayerRhythm', 'Namazlarımı takip etmek'),
      subtitle: t('growth.goal.prayerRhythmDesc', 'Vakitler, hatırlatmalar ve günlük zikir')
    },
    {
      id: 'quran_learning',
      label: t('growth.goal.quranLearning', "Kur'an ve dua ile bağımı güçlendirmek"),
      subtitle: t('growth.goal.quranLearningDesc', 'Her gün kısa bir okuma ve dua')
    },
    {
      id: 'family_consistency',
      label: t('growth.goal.familyConsistency', 'Ailemle birlikte ibadet etmek'),
      subtitle: t('growth.goal.familyConsistencyDesc', 'Ortak hedefler ve birlikte hatim')
    }
  ]), [t]);

  const steps = useMemo(() => {
    const headlineVariant = resolvedConfig.headlineVariant;
    const permissionEmphasis = resolvedConfig.permissionEmphasis;

    return {
      language: {
        title: headlineVariant === 'direct'
          ? t('growth.onboarding.languageTitleDirect', 'Huzur, kendi dilinde başlar')
          : t('growth.onboarding.languageTitle', 'Dilini seç'),
        description: headlineVariant === 'direct'
          ? t('growth.onboarding.languageDescriptionDirect', "Huzur'u hangi dilde kullanmak istersin?")
          : t('growth.onboarding.languageDescription', "Huzur'u hangi dilde kullanmak istersin?"),
        actionLabel: t('growth.onboarding.continue', 'Devam et'),
      },
      permissions: {
        title: t('growth.onboarding.permissionsTitle', 'İbadet rutinini kaçırmamak için iki ayar'),
        description: permissionEmphasis === 'notifications_first'
          ? t('growth.onboarding.permissionsDescriptionNotifications', 'Bildirim ve konum, namaz vaktini ve günlük kısa ibadet adımını doğru kurar.')
          : t('growth.onboarding.permissionsDescription', 'Sadece namaz vakti ve günlük ibadet hatırlatması için gereken ayarlari hazırlayalım.'),
        actionLabel: t('growth.onboarding.continue', 'Hazirim'),
      },
      goal: {
        title: t('growth.onboarding.goalTitle', "Huzur'u en çok ne için kullanacaksın?"),
        description: t('growth.onboarding.goalDescription', 'Ana sayfayı buna göre düzenleyelim. Daha sonra ayarlardan değiştirebilirsin.'),
        actionLabel: resolvedConfig.premiumTeaserEnabled && !isProUser
          ? t('growth.onboarding.startWithTeaser', 'Devam et')
          : t('growth.onboarding.startNow', 'Başla'),
      },
    };
  }, [isProUser, resolvedConfig.headlineVariant, resolvedConfig.permissionEmphasis, resolvedConfig.premiumTeaserEnabled, t]);

  const stepOrder = resolvedConfig.steps;
  const totalSteps = stepOrder.length;
  const normalizedStep = Math.max(0, Math.min(initialStep, totalSteps - 1));
  const currentStepKey = stepOrder[normalizedStep];
  const currentStep = steps[currentStepKey];
  const isBusy = loading || loadingLocation || loadingNotifications;
  const permissionsReady = locationPreference !== null && notificationPreference !== null;
  const experimentContext = resolvedConfig.experimentContext || {
    onboardingHeadlineVariant: 'A',
    onboardingGoalStepVariant: 'A',
    signature: 'A|A'
  };
  const referralPlan = useMemo(() => buildReferralOnboardingPlan({
    localProgress: referralProgress,
    serverSnapshot: referralServerSnapshot,
    currentStep: currentStepKey,
    selectedGoal,
  }), [currentStepKey, referralProgress, referralServerSnapshot, selectedGoal]);

  useEffect(() => {
    setSelectedLanguage(initialLanguage);
  }, [initialLanguage]);

  useEffect(() => {
    overlayRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [normalizedStep]);

  useEffect(() => {
    const storedGoal = storageService.getString(
      STORAGE_KEYS.USER_PRIMARY_GOAL,
      resolvedConfig.goalDefault || DEFAULT_PRIMARY_GOAL
    );
    setSelectedGoal(normalizePrimaryGoal(storedGoal));
  }, [resolvedConfig.goalDefault]);

  useEffect(() => {
    if (!currentStepKey || lastViewedStepRef.current === currentStepKey) return;
    lastViewedStepRef.current = currentStepKey;

    logEvent(ANALYTICS_EVENTS.ONBOARDING_STEP_VIEWED, {
      step_name: currentStepKey,
      step_number: normalizedStep + 1,
      flow_version: resolvedConfig.flowVersion,
      headline_variant: resolvedConfig.headlineVariant,
      experiment_variant: experimentContext.signature,
      onboarding_headline_variant: experimentContext.onboardingHeadlineVariant,
      onboarding_goal_step_variant: experimentContext.onboardingGoalStepVariant,
      ...buildReferralOnboardingAnalyticsPayload(referralPlan),
    });
  }, [
    currentStepKey,
    experimentContext.onboardingGoalStepVariant,
    experimentContext.onboardingHeadlineVariant,
    experimentContext.signature,
    normalizedStep,
    referralPlan,
    resolvedConfig.flowVersion,
    resolvedConfig.headlineVariant,
    selectedGoal
  ]);

  useEffect(() => {
    if (!referralPlan) return;

    logEvent(ANALYTICS_EVENTS.REFERRAL_ONBOARDING_SURFACED, {
      step_name: currentStepKey,
      flow_version: resolvedConfig.flowVersion,
      experiment_variant: experimentContext.signature,
      ...buildReferralOnboardingAnalyticsPayload(referralPlan),
    });
  }, [currentStepKey, experimentContext.signature, referralPlan, resolvedConfig.flowVersion]);

  const syncStep = (nextStep) => {
    const boundedStep = Math.max(0, Math.min(nextStep, totalSteps - 1));
    onStepChange?.(boundedStep);
    return boundedStep;
  };

  const logStepCompleted = (stepName, extra = {}) => {
    logEvent(ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED, {
      step_name: stepName,
      step_number: normalizedStep + 1,
      flow_version: resolvedConfig.flowVersion,
      experiment_variant: experimentContext.signature,
      onboarding_headline_variant: experimentContext.onboardingHeadlineVariant,
      onboarding_goal_step_variant: experimentContext.onboardingGoalStepVariant,
      ...buildReferralOnboardingAnalyticsPayload(referralPlan),
      ...extra,
    });
  };

  const handleGoalChange = (goalId) => {
    setSelectedGoal(goalId);
    if (lastGoalRef.current === goalId) return;
    lastGoalRef.current = goalId;
    logEvent(ANALYTICS_EVENTS.ONBOARDING_GOAL_SELECTED, {
      goal: goalId,
      flow_version: resolvedConfig.flowVersion,
      source: 'growth_onboarding',
      experiment_variant: experimentContext.signature,
      onboarding_headline_variant: experimentContext.onboardingHeadlineVariant,
      onboarding_goal_step_variant: experimentContext.onboardingGoalStepVariant,
      ...buildReferralOnboardingAnalyticsPayload(referralPlan),
    });
  };

  const completeOnboarding = ({ logGoalStep = false, premiumTeaserOverride = undefined } = {}) => {
    setStoredPrimaryGoal(selectedGoal);
    // New users already learn the navigation in onboarding; the migration notice
    // is reserved for existing users upgrading from the old navigation.
    storageService.setBoolean(STORAGE_KEYS.NAVIGATION_UPDATE_V1_SEEN, true);
    if (logGoalStep) {
      logStepCompleted('goal', {
        selected_goal: selectedGoal,
        premium_teaser_enabled: resolvedConfig.premiumTeaserEnabled === true,
      });
    }
    onComplete?.({
      selectedGoal,
      premiumTeaserEnabled: typeof premiumTeaserOverride === 'boolean'
        ? premiumTeaserOverride
        : resolvedConfig.premiumTeaserEnabled === true,
    });
  };

  const handleContinue = async () => {
    setErrorMessage('');

    try {
      if (currentStepKey === 'language') {
        setLoading(true);
        const result = await onSelectLanguage?.(selectedLanguage);
        logStepCompleted('language', {
          selected_language: selectedLanguage,
          success: result?.success !== false,
        });
        if (result?.success === false) {
          setErrorMessage(
            result.error || t('growth.onboarding.languageError', 'Dil seçimi uygulanamadı. Varsayılan dille devam ediyoruz.')
          );
        }
        
        if (normalizedStep + 1 >= totalSteps) {
          completeOnboarding();
        } else {
          syncStep(normalizedStep + 1);
        }
        return;
      }

      if (currentStepKey === 'permissions') {
        if (!permissionsReady) {
          setErrorMessage(t('growth.onboarding.permissionsRequired', 'Devam etmeden önce iki tercih yap.'));
          return;
        }

        setLoading(true);
        const [locationResult, notificationResult] = await Promise.all([
          onRequestLocation?.(locationPreference === 'allow'),
          onRequestNotifications?.(notificationPreference === 'allow')
        ]);

        logEvent(ANALYTICS_EVENTS.ONBOARDING_PERMISSION_CHOICE, {
          permission: 'location',
          choice: locationPreference,
          flow_version: resolvedConfig.flowVersion,
          experiment_variant: experimentContext.signature,
        });
        logEvent(ANALYTICS_EVENTS.ONBOARDING_PERMISSION_CHOICE, {
          permission: 'notifications',
          choice: notificationPreference,
          flow_version: resolvedConfig.flowVersion,
          experiment_variant: experimentContext.signature,
        });
        logStepCompleted('permissions', {
          location_choice: locationPreference,
          notification_choice: notificationPreference,
          success: locationResult?.success !== false && notificationResult?.success !== false,
        });

        if (locationResult?.success === false || notificationResult?.success === false) {
          setErrorMessage(
            locationResult?.error ||
            notificationResult?.error ||
            t('growth.onboarding.permissionsError', 'Bazı izinler şu an uygulanamadi. Yine de devam edebilirsin.')
          );
        }

        syncStep(normalizedStep + 1);
        return;
      }

      completeOnboarding({
        logGoalStep: currentStepKey === 'goal',
      });
    } catch (error) {
      setErrorMessage(error?.message || t('growth.onboarding.genericError', 'Bu adım tamamlanırken bir sorun oluştu.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="growth-onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="growth-onboarding-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface-page) 96%, var(--primary) 4%), var(--surface-page))',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'max(10px, env(safe-area-inset-top, 0px)) max(12px, env(safe-area-inset-right, 0px)) max(10px, env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left, 0px))',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div
        className="growth-onboarding-card"
        style={{
          width: '100%',
          maxWidth: 380,
          minWidth: 0,
          boxSizing: 'border-box',
          margin: 'auto 0',
          borderRadius: 18,
          background: 'var(--surface-container-lowest)',
          border: '1px solid var(--outline-variant)',
          padding: 'clamp(12px, 3.5vw, 16px)',
          color: 'var(--on-surface)',
          boxShadow: 'var(--elevation-medium)'
        }}
      >
        <div style={{ marginBottom: 10, fontSize: 12, color: 'var(--on-surface-variant)' }}>
          {t('growth.onboarding.stepCounter', 'Adım {{current}} / {{total}}', { current: normalizedStep + 1, total: totalSteps })}
        </div>

        <h2 id="growth-onboarding-title" style={{ margin: '0 0 6px', fontSize: 20, color: 'var(--primary)' }}>{currentStep.title}</h2>
        <p style={{ margin: '0 0 14px', lineHeight: 1.5, fontSize: 14, color: 'var(--on-surface-variant)' }}>{currentStep.description}</p>

        {referralPlan && (
          <div
            style={{
              marginBottom: 16,
              padding: 16,
              borderRadius: 16,
              border: referralPlan.rewardReady
                ? '1px solid color-mix(in srgb, var(--secondary) 28%, transparent)'
                : '1px solid color-mix(in srgb, var(--tertiary) 24%, transparent)',
              background: referralPlan.rewardReady
                ? 'color-mix(in srgb, var(--secondary) 10%, transparent)'
                : 'color-mix(in srgb, var(--tertiary) 10%, transparent)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8, alignItems: 'center' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 999,
                padding: '6px 10px',
                background: 'var(--surface-container-low)',
                fontSize: 12,
                fontWeight: 900,
                color: referralPlan.rewardReady ? 'var(--on-secondary-container)' : 'var(--on-tertiary-container)',
              }}>
                <Sparkles size={14} />
                {referralPlan.badge}
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--on-surface-variant)' }}>
                {referralPlan.completedCount}/{referralPlan.totalCount}
              </span>
            </div>

            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--on-surface)', marginBottom: 6 }}>
              {referralPlan.headline}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
              {referralPlan.description}
            </div>

            <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
              {referralPlan.steps.map((step) => (
                <div
                  key={step.id}
                  style={{
                    borderRadius: 12,
                    padding: '10px 12px',
                    border: '1px solid var(--outline-variant)',
                    background: step.status === 'done'
                      ? 'color-mix(in srgb, var(--secondary) 12%, transparent)'
                      : step.status === 'active'
                        ? 'color-mix(in srgb, var(--tertiary) 10%, transparent)'
                        : 'var(--surface-container-low)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                    <strong style={{ fontSize: 13, color: 'var(--on-surface)' }}>{step.label}</strong>
                    <span style={{ fontSize: 11, fontWeight: 900, color: step.status === 'done' ? 'var(--secondary)' : 'var(--on-tertiary-container)' }}>
                      {step.status === 'done' ? t('growth.referralStep.done', 'Hazır') : step.status === 'active' ? t('growth.referralStep.active', 'Sıradaki') : t('growth.referralStep.pending', 'Bekliyor')}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--on-surface-variant)' }}>
                    {step.description}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--on-surface-variant)' }}>
              {referralPlan.supportNote}
            </div>
          </div>
        )}

        {!!errorMessage && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 14px',
              borderRadius: 14,
              border: '1px solid color-mix(in srgb, var(--error) 35%, transparent)',
              background: 'color-mix(in srgb, var(--error-container) 28%, transparent)',
              color: 'var(--on-error-container)',
              fontSize: 13,
              lineHeight: 1.5
            }}
          >
            {errorMessage}
          </div>
        )}

        {currentStepKey === 'language' && (
          <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            {languageOptions.map((item) => (
              <button
                key={item.code}
                onClick={() => setSelectedLanguage(item.code)}
                disabled={isBusy}
                style={{
                  ...choiceButtonStyle(selectedLanguage === item.code),
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Globe2 size={18} />
                  {item.nativeName}
                </span>
                {selectedLanguage === item.code && <Check size={18} />}
              </button>
            ))}
          </div>
        )}

        {currentStepKey === 'permissions' && (
          <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
            <div style={{
              borderRadius: 16,
              border: '1px solid var(--outline-variant)',
              background: 'var(--surface-container-low)',
              padding: 16
            }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'color-mix(in srgb, var(--tertiary) 14%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--tertiary)',
                  flexShrink: 0
                }}>
                  <MapPinned size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{t('growth.onboarding.locationTitleShort', 'Konum')}</div>
                  <div style={{ fontSize: 13, opacity: 0.82, lineHeight: 1.5 }}>
                    {t('growth.onboarding.locationDescriptionShort', 'Namaz vakitlerini bulundugun yere göre doğru hesaplar.')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setLocationPreference('allow')}
                  disabled={isBusy}
                  style={permissionButtonStyle(locationPreference === 'allow', true)}
                >
                  {t('growth.onboarding.allow', 'İzin ver')}
                </button>
                <button
                  onClick={() => setLocationPreference('skip')}
                  disabled={isBusy}
                  style={permissionButtonStyle(locationPreference === 'skip')}
                >
                  {t('growth.onboarding.skipForNow', 'Simdilik geç')}
                </button>
              </div>
            </div>

            <div style={{
              borderRadius: 16,
              border: '1px solid var(--outline-variant)',
              background: 'var(--surface-container-low)',
              padding: 16
            }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'color-mix(in srgb, var(--secondary) 14%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--secondary)',
                  flexShrink: 0
                }}>
                  <Bell size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{t('growth.onboarding.notificationsTitleShort', 'Bildirimler')}</div>
                  <div style={{ fontSize: 13, opacity: 0.82, lineHeight: 1.5 }}>
                    {t('growth.onboarding.notificationsDescriptionShort', 'Vakitleri ve 2 dakikalik günlük adimi kacirmamana yardım eder.')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setNotificationPreference('allow')}
                  disabled={isBusy}
                  style={permissionButtonStyle(notificationPreference === 'allow', true)}
                >
                  {t('growth.onboarding.turnOn', 'Aç')}
                </button>
                <button
                  onClick={() => setNotificationPreference('skip')}
                  disabled={isBusy}
                  style={permissionButtonStyle(notificationPreference === 'skip')}
                >
                  {t('growth.onboarding.skipForNow', 'Simdilik geç')}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStepKey === 'goal' && (
          <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
            {goals.map((goal) => {
              const selected = selectedGoal === goal.id;

              return (
                <button
                  key={goal.id}
                  onClick={() => handleGoalChange(goal.id)}
                  disabled={isBusy}
                  style={choiceButtonStyle(selected)}
                >
                  <span style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    background: selected ? 'var(--tertiary-container)' : 'var(--surface-container-low)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {GOAL_ICONS[goal.id]}
                  </span>
                  <span style={{ flex: 1 }}>
                    <strong style={{ display: 'block', marginBottom: 3, fontSize: 14 }}>{goal.label}</strong>
                    <span style={{ opacity: 0.8, fontSize: 12 }}>{goal.subtitle}</span>
                  </span>
                  {selected && <Check size={18} />}
                </button>
              );
            })}

            {resolvedConfig.premiumTeaserEnabled && !isProUser && (
              <div style={{
                borderRadius: 16,
                padding: '12px 14px',
                background: 'color-mix(in srgb, var(--tertiary) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--tertiary) 22%, transparent)',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  background: 'color-mix(in srgb, var(--tertiary) 18%, transparent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--tertiary)',
                  flexShrink: 0
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, color: 'var(--on-surface)', marginBottom: 4 }}>
                    {t('growth.onboarding.premiumTeaserTitle', 'Düzenin oturunca daha fazla destek açılabilir')}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--on-surface-variant)' }}>
                    {t('growth.onboarding.premiumTeaserDesc', 'Önce ilk adımı tamamla; sonra haftalık içgörüler ve rehberlik için Pro önerisi gösterebiliriz.')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{
          position: 'sticky',
          bottom: 0,
          paddingTop: 12,
          paddingBottom: 2,
          background: 'var(--surface-container-lowest)'
        }}>
          <button
            onClick={handleContinue}
            disabled={isBusy}
            style={{
              ...baseButton,
              width: '100%',
              background: 'var(--tertiary)',
              color: 'var(--on-tertiary)',
              opacity: isBusy ? 0.7 : 1
            }}
          >
            {isBusy ? t('common.loading', 'Yükleniyor...') : currentStep.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GrowthOnboarding;
