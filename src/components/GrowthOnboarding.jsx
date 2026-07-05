import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  BookOpen,
  Check,
  Crown,
  Globe2,
  HeartHandshake,
  MapPinned,
  Send,
  Sparkles,
  Target
} from 'lucide-react';
import { ANALYTICS_EVENTS, logEvent } from '../services/analyticsService';
import { DEFAULT_ONBOARDING_CONFIG } from '../services/onboardingConfigService';
import {
  buildReferralOnboardingAnalyticsPayload,
  buildReferralOnboardingPlan,
} from '../services/referralOnboardingService';
import { useAppStore } from '../stores/useAppStore';
import { SUPPORTED_LANGUAGE_OPTIONS } from '../config/i18nConfig';
import { STORAGE_KEYS } from '../constants';
import { storageService } from '../services/storageService';
import { DEFAULT_PRIMARY_GOAL, normalizePrimaryGoal, setStoredPrimaryGoal } from '../utils/primaryGoal';
import {
  buildHuzurRitmiAnalyticsPayload,
  getHuzurRitmiPreview,
} from '../services/huzurRitmiPreviewService';
import {
  buildPremiumMomentAnalyticsPayload,
  openPremiumMoment,
} from '../services/premiumMomentService';

const baseButton = {
  border: 'none',
  borderRadius: 14,
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer'
};

const choiceButtonStyle = (selected = false) => ({
  ...baseButton,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  textAlign: 'left',
  width: '100%',
  background: selected ? 'color-mix(in srgb, var(--tertiary) 20%, transparent)' : 'color-mix(in srgb, var(--on-primary) 7%, transparent)',
  color: selected ? 'var(--tertiary)' : 'var(--on-primary)',
  border: selected ? '1px solid var(--tertiary)' : '1px solid color-mix(in srgb, var(--on-primary) 12%, transparent)',
  transition: 'all 0.2s ease'
});

const permissionButtonStyle = (selected = false, primary = false) => ({
  ...baseButton,
  padding: '8px 12px',
  background: selected
    ? (primary ? 'var(--tertiary)' : 'color-mix(in srgb, var(--on-primary) 12%, transparent)')
    : 'color-mix(in srgb, var(--on-primary) 4%, transparent)',
  color: selected && primary ? 'var(--on-tertiary)' : 'var(--on-primary)',
  border: selected
    ? `1px solid ${primary ? 'var(--tertiary)' : 'color-mix(in srgb, var(--on-primary) 18%, transparent)'}`
    : '1px solid color-mix(in srgb, var(--on-primary) 10%, transparent)',
  minWidth: 110
});

const GOAL_ICONS = {
  prayer_rhythm: <Target size={20} />,
  quran_learning: <BookOpen size={20} />,
  family_consistency: <HeartHandshake size={20} />
};

// Permissions are requested contextually after a meaningful user action.
const ALLOWED_STEPS = ['language', 'goal', 'preview'];

const sanitizeSteps = (steps = []) => {
  if (!Array.isArray(steps)) return DEFAULT_ONBOARDING_CONFIG.steps;
  const normalized = steps
    .map((item) => (typeof item === 'string' ? item.trim().toLowerCase() : null))
    .filter((item) => ALLOWED_STEPS.includes(item));
  const deduped = normalized.length > 0 ? [...new Set(normalized)] : ['language', 'goal', 'preview'];
  return deduped.includes('preview') ? deduped : [...deduped, 'preview'];
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
      label: t('growth.goal.prayerRhythm', 'Namazimi ve gunluk ibadet rutinimi takip etmek'),
      subtitle: t('growth.goal.prayerRhythmDesc', 'Vakit, takip ve kisa zikir adimi tek sade akis olsun.')
    },
    {
      id: 'quran_learning',
      label: t('growth.goal.quranLearning', 'Kuran ve duayi gunluk rutine baglamak'),
      subtitle: t('growth.goal.quranLearningDesc', 'Uzun ders degil; kisa okuma ve dua adimi surdurulebilir olsun.')
    },
    {
      id: 'family_consistency',
      label: t('growth.goal.familyConsistency', 'Ailece ibadet aliskanligi kurmak'),
      subtitle: t('growth.goal.familyConsistencyDesc', 'Sosyal akisa dagilmadan bugunun tek namaz, dua veya zikir adimi gorunsun.')
    }
  ]), [t]);

  const steps = useMemo(() => {
    const headlineVariant = resolvedConfig.headlineVariant;
    const permissionEmphasis = resolvedConfig.permissionEmphasis;

    return {
      language: {
        title: headlineVariant === 'direct'
          ? t('growth.onboarding.languageTitleDirect', 'Huzur, kendi dilinde baslar')
          : t('growth.onboarding.languageTitle', 'Dilini sec'),
        description: headlineVariant === 'direct'
          ? t('growth.onboarding.languageDescriptionDirect', 'Zihinsel netlik, manevi huzur ve gunluk rutinler tek bir guvenli limanda.')
          : t('growth.onboarding.languageDescription', 'Zihinsel netlik, manevi huzur ve gunluk rutinler tek bir guvenli limanda.'),
        actionLabel: t('growth.onboarding.continue', 'Devam et'),
      },
      permissions: {
        title: t('growth.onboarding.permissionsTitle', 'Ibadet rutinini kacirmamak icin iki ayar'),
        description: permissionEmphasis === 'notifications_first'
          ? t('growth.onboarding.permissionsDescriptionNotifications', 'Bildirim ve konum, namaz vaktini ve gunluk kisa ibadet adimini dogru kurar.')
          : t('growth.onboarding.permissionsDescription', 'Sadece namaz vakti ve gunluk ibadet hatirlatmasi icin gereken ayarlari hazirlayalim.'),
        actionLabel: t('growth.onboarding.continue', 'Hazirim'),
      },
      goal: {
        title: t('growth.onboarding.goalTitle', 'Bugun neye alan acalim?'),
        description: t('growth.onboarding.goalDescription', 'Ana ekran sana yalnizca siradaki anlamli adimi gosterecek.'),
        actionLabel: resolvedConfig.premiumTeaserEnabled && !isProUser
          ? t('growth.onboarding.startWithTeaser', 'Devam et')
          : t('growth.onboarding.startNow', 'Ilk adimi ac'),
      },
      preview: {
        title: t('growth.onboarding.previewTitle', 'Guvenli limanin hazir'),
        description: t('growth.onboarding.previewDescription', 'Tek bir sakin adimla basla. Diger araclar ihtiyacin oldugunda Kesfet bolumunde.'),
        actionLabel: t('growth.onboarding.previewFinish', 'Huzura gir'),
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
  const huzurRitmiPreview = useMemo(() => getHuzurRitmiPreview(selectedGoal), [selectedGoal]);

  useEffect(() => {
    setSelectedLanguage(initialLanguage);
  }, [initialLanguage]);

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

    if (currentStepKey === 'preview') {
      logEvent(ANALYTICS_EVENTS.HUZUR_RITMI_PREVIEW_VIEWED, {
        ...buildHuzurRitmiAnalyticsPayload(selectedGoal),
        flow_version: resolvedConfig.flowVersion,
        experiment_variant: experimentContext.signature,
      });
    }
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

  const openPreviewPaywall = () => {
    logEvent(ANALYTICS_EVENTS.HUZUR_RITMI_CTA_CLICKED, {
      ...buildHuzurRitmiAnalyticsPayload(selectedGoal, {
        cta: 'pro',
        entry_source: 'huzur_ritmi_preview',
      }),
      flow_version: resolvedConfig.flowVersion,
      experiment_variant: experimentContext.signature,
    });

    const premiumMoment = {
      isPro: false,
      source: 'huzur_ritmi_preview',
      momentType: 'onboarding_complete',
      primaryGoal: selectedGoal,
    };

    completeOnboarding({ premiumTeaserOverride: false });

    window.setTimeout(() => {
      logEvent(ANALYTICS_EVENTS.PREMIUM_MOMENT_OPENED, buildPremiumMomentAnalyticsPayload(premiumMoment, {
        onboarding_experiment_variant: experimentContext.signature,
      }));
      openPremiumMoment(premiumMoment);
    }, 250);
  };

  const openPreviewInvite = () => {
    logEvent(ANALYTICS_EVENTS.HUZUR_RITMI_CTA_CLICKED, {
      ...buildHuzurRitmiAnalyticsPayload(selectedGoal, {
        cta: 'invite',
        entry_source: 'onboarding_huzur_ritmi_reward',
      }),
      flow_version: resolvedConfig.flowVersion,
      experiment_variant: experimentContext.signature,
    });

    completeOnboarding({ premiumTeaserOverride: false });

    window.setTimeout(() => {
      useAppStore.getState().openInviteModal({
        source: 'onboarding_huzur_ritmi_reward',
        primaryGoal: selectedGoal,
      });
    }, 250);
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
            result.error || t('growth.onboarding.languageError', 'Dil secimi uygulanamadi. Varsayilan dil ile devam ediyoruz.')
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
          setErrorMessage(t('growth.onboarding.permissionsRequired', 'Devam etmeden once iki tercih yap.'));
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
            t('growth.onboarding.permissionsError', 'Bazi izinler su an uygulanamadi. Yine de devam edebilirsin.')
          );
        }

        syncStep(normalizedStep + 1);
        return;
      }

      if (currentStepKey === 'goal' && stepOrder.includes('preview') && normalizedStep + 1 < totalSteps) {
        setStoredPrimaryGoal(selectedGoal);
        logStepCompleted('goal', {
          selected_goal: selectedGoal,
          premium_teaser_enabled: resolvedConfig.premiumTeaserEnabled === true,
        });
        syncStep(normalizedStep + 1);
        return;
      }

      completeOnboarding({
        logGoalStep: currentStepKey === 'goal',
        premiumTeaserOverride: currentStepKey === 'preview' ? false : undefined,
      });
    } catch (error) {
      setErrorMessage(error?.message || t('growth.onboarding.genericError', 'Bu adim tamamlanirken bir sorun olustu.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        background: 'color-mix(in srgb, var(--surface-page) 92%, transparent)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 20,
          background: 'linear-gradient(135deg, var(--primary-container) 0%, var(--surface-container-high) 100%)',
          border: '1px solid color-mix(in srgb, var(--tertiary) 25%, transparent)',
          padding: 20,
          color: 'var(--on-primary)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ marginBottom: 16, fontSize: 13, opacity: 0.8 }}>
          {t('growth.onboarding.stepCounter', 'Adim {{current}} / {{total}}', { current: normalizedStep + 1, total: totalSteps })}
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: 22, color: 'var(--tertiary)' }}>{currentStep.title}</h2>
        <p style={{ margin: '0 0 20px', lineHeight: 1.6, color: 'var(--on-primary-container)' }}>{currentStep.description}</p>

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
                background: 'color-mix(in srgb, var(--on-primary) 8%, transparent)',
                fontSize: 12,
                fontWeight: 900,
                color: referralPlan.rewardReady ? 'var(--on-secondary-container)' : 'var(--on-tertiary-container)',
              }}>
                <Sparkles size={14} />
                {referralPlan.badge}
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'color-mix(in srgb, var(--on-primary) 84%, transparent)' }}>
                {referralPlan.completedCount}/{referralPlan.totalCount}
              </span>
            </div>

            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--on-primary)', marginBottom: 6 }}>
              {referralPlan.headline}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--on-primary-container)', marginBottom: 12 }}>
              {referralPlan.description}
            </div>

            <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
              {referralPlan.steps.map((step) => (
                <div
                  key={step.id}
                  style={{
                    borderRadius: 12,
                    padding: '10px 12px',
                    border: '1px solid color-mix(in srgb, var(--on-primary) 10%, transparent)',
                    background: step.status === 'done'
                      ? 'color-mix(in srgb, var(--secondary) 12%, transparent)'
                      : step.status === 'active'
                        ? 'color-mix(in srgb, var(--tertiary) 10%, transparent)'
                        : 'color-mix(in srgb, var(--on-primary) 4%, transparent)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                    <strong style={{ fontSize: 13, color: 'var(--on-primary)' }}>{step.label}</strong>
                    <span style={{ fontSize: 11, fontWeight: 900, color: step.status === 'done' ? 'var(--secondary)' : 'var(--on-tertiary-container)' }}>
                      {step.status === 'done' ? 'Hazir' : step.status === 'active' ? 'Siradaki' : 'Bekliyor'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.5, color: 'color-mix(in srgb, var(--on-primary) 78%, transparent)' }}>
                    {step.description}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, lineHeight: 1.55, color: 'color-mix(in srgb, var(--on-primary) 74%, transparent)' }}>
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
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
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
              border: '1px solid color-mix(in srgb, var(--on-primary) 12%, transparent)',
              background: 'color-mix(in srgb, var(--on-primary) 6%, transparent)',
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
                    {t('growth.onboarding.locationDescriptionShort', 'Namaz vakitlerini bulundugun yere gore dogru hesaplar.')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setLocationPreference('allow')}
                  disabled={isBusy}
                  style={permissionButtonStyle(locationPreference === 'allow', true)}
                >
                  {t('growth.onboarding.allow', 'Izin ver')}
                </button>
                <button
                  onClick={() => setLocationPreference('skip')}
                  disabled={isBusy}
                  style={permissionButtonStyle(locationPreference === 'skip')}
                >
                  {t('growth.onboarding.skipForNow', 'Simdilik gec')}
                </button>
              </div>
            </div>

            <div style={{
              borderRadius: 16,
              border: '1px solid color-mix(in srgb, var(--on-primary) 12%, transparent)',
              background: 'color-mix(in srgb, var(--on-primary) 6%, transparent)',
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
                    {t('growth.onboarding.notificationsDescriptionShort', 'Vakitleri ve 2 dakikalik gunluk adimi kacirmamana yardim eder.')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setNotificationPreference('allow')}
                  disabled={isBusy}
                  style={permissionButtonStyle(notificationPreference === 'allow', true)}
                >
                  {t('growth.onboarding.turnOn', 'Ac')}
                </button>
                <button
                  onClick={() => setNotificationPreference('skip')}
                  disabled={isBusy}
                  style={permissionButtonStyle(notificationPreference === 'skip')}
                >
                  {t('growth.onboarding.skipForNow', 'Simdilik gec')}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStepKey === 'goal' && (
          <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
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
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: selected ? 'color-mix(in srgb, var(--tertiary) 12%, transparent)' : 'color-mix(in srgb, var(--on-primary) 6%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {GOAL_ICONS[goal.id]}
                  </span>
                  <span style={{ flex: 1 }}>
                    <strong style={{ display: 'block', marginBottom: 4 }}>{goal.label}</strong>
                    <span style={{ opacity: 0.8, fontSize: 13 }}>{goal.subtitle}</span>
                  </span>
                  {selected && <Check size={18} />}
                </button>
              );
            })}

            {resolvedConfig.premiumTeaserEnabled && !isProUser && (
              <div style={{
                borderRadius: 16,
                padding: '14px 16px',
                background: 'color-mix(in srgb, var(--tertiary) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--tertiary) 22%, transparent)',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
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
                  <div style={{ fontWeight: 900, color: 'var(--on-primary)', marginBottom: 4 }}>
                    {t('growth.onboarding.premiumTeaserTitle', 'Ritim oturunca daha derin destek acilabilir')}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: 'color-mix(in srgb, var(--on-primary) 84%, transparent)' }}>
                    {t('growth.onboarding.premiumTeaserDesc', 'Once ilk adimi tamamla; sonra haftalik icgoru ve daha sakin rehberlik icin Pro onerisi gosterebiliriz.')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentStepKey === 'preview' && (
          <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
            <div style={{
              borderRadius: 18,
              padding: 16,
              border: '1px solid color-mix(in srgb, var(--tertiary) 24%, transparent)',
              background: 'color-mix(in srgb, var(--on-primary) 7%, transparent)'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
                borderRadius: 999,
                padding: '6px 10px',
                background: 'color-mix(in srgb, var(--tertiary) 14%, transparent)',
                color: 'var(--on-tertiary-container)',
                fontSize: 12,
                fontWeight: 900
              }}>
                <Sparkles size={14} />
                {t('growth.onboarding.previewBadge', 'Bugunluk ritim')}
              </div>
              <h3 style={{ margin: '0 0 6px', color: 'var(--on-primary)', fontSize: 20 }}>
                {huzurRitmiPreview.title}
              </h3>
              <p style={{ margin: 0, color: 'color-mix(in srgb, var(--on-primary) 82%, transparent)', lineHeight: 1.55, fontSize: 14 }}>
                {huzurRitmiPreview.subtitle}
              </p>
            </div>

            {huzurRitmiPreview.steps.map((step, index) => (
              <div
                key={step.label}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '1px solid color-mix(in srgb, var(--on-primary) 10%, transparent)',
                  background: 'color-mix(in srgb, var(--on-primary) 5%, transparent)'
                }}
              >
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'color-mix(in srgb, var(--secondary) 14%, transparent)',
                  color: 'var(--secondary)',
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--on-primary)', marginBottom: 4 }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: 'color-mix(in srgb, var(--on-primary) 78%, transparent)' }}>
                    {step.text}
                  </div>
                </div>
              </div>
            ))}

            {!isProUser && (
              <div style={{ display: 'grid', gap: 10 }}>
                <button
                  onClick={openPreviewPaywall}
                  disabled={isBusy}
                  style={{
                    ...baseButton,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: 'var(--on-tertiary-container)',
                    color: 'var(--on-tertiary)'
                  }}
                >
                  <Crown size={18} />
                  {t('growth.onboarding.previewProCta', 'Pro ile derin plani ac')}
                </button>
                <button
                  onClick={openPreviewInvite}
                  disabled={isBusy}
                  style={{
                    ...baseButton,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    background: 'color-mix(in srgb, var(--on-primary) 8%, transparent)',
                    color: 'var(--on-primary)',
                    border: '1px solid color-mix(in srgb, var(--on-primary) 14%, transparent)'
                  }}
                >
                  <Send size={18} />
                  {t('growth.onboarding.previewInviteCta', '1 kisiyi davet et, 24 saat Pro ac')}
                </button>
              </div>
            )}
          </div>
        )}

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
          {isBusy ? t('common.loading', 'Yukleniyor...') : currentStep.actionLabel}
        </button>
      </div>
    </div>
  );
}

export default GrowthOnboarding;
