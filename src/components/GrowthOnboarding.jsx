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
  background: selected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.07)',
  color: selected ? '#d4af37' : '#fff',
  border: selected ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.12)',
  transition: 'all 0.2s ease'
});

const permissionButtonStyle = (selected = false, primary = false) => ({
  ...baseButton,
  padding: '8px 12px',
  background: selected
    ? (primary ? '#d4af37' : 'rgba(255,255,255,0.12)')
    : 'rgba(255,255,255,0.04)',
  color: selected && primary ? '#14352a' : '#fff',
  border: selected
    ? `1px solid ${primary ? '#d4af37' : 'rgba(255,255,255,0.18)'}`
    : '1px solid rgba(255,255,255,0.1)',
  minWidth: 110
});

const GOAL_ICONS = {
  prayer_rhythm: <Target size={20} />,
  quran_learning: <BookOpen size={20} />,
  family_consistency: <HeartHandshake size={20} />
};

const ALLOWED_STEPS = ['language', 'permissions', 'goal', 'preview'];

const sanitizeSteps = (steps = []) => {
  if (!Array.isArray(steps)) return DEFAULT_ONBOARDING_CONFIG.steps;
  const normalized = steps
    .map((item) => (typeof item === 'string' ? item.trim().toLowerCase() : null))
    .filter((item) => ALLOWED_STEPS.includes(item));
  const deduped = normalized.length > 0 ? [...new Set(normalized)] : DEFAULT_ONBOARDING_CONFIG.steps;
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
      label: t('growth.goal.prayerRhythm', 'Namazimi ve gunluk ritmimi kacirmamak'),
      subtitle: t('growth.goal.prayerRhythmDesc', 'Vakit hatirlatmasi ve 2 dakikalik adimla bugunu bos gecirme.')
    },
    {
      id: 'quran_learning',
      label: t('growth.goal.quranLearning', 'Her gun Kuran veya dua ile bag kurmak'),
      subtitle: t('growth.goal.quranLearningDesc', 'Uzun ders degil; kisa okuma, dua ve anlam adimlari one ciksin.')
    },
    {
      id: 'family_consistency',
      label: t('growth.goal.familyConsistency', 'Ailece kucuk bir ibadet ritmi kurmak'),
      subtitle: t('growth.goal.familyConsistencyDesc', 'Aile hedefleri buyumeden, bugun yapilacak tek adimi gorunur kil.')
    }
  ]), [t]);

  const steps = useMemo(() => {
    const headlineVariant = resolvedConfig.headlineVariant;
    const permissionEmphasis = resolvedConfig.permissionEmphasis;

    return {
      language: {
        title: headlineVariant === 'direct'
          ? t('growth.onboarding.languageTitleDirect', 'Gunluk ritmini kendi dilinde kur')
          : t('growth.onboarding.languageTitle', 'Dilini sec'),
        description: headlineVariant === 'direct'
          ? t('growth.onboarding.languageDescriptionDirect', 'Namaz, Kuran ve dua ritmini sana en rahat gelen dilde baslatalim.')
          : t('growth.onboarding.languageDescription', 'Once dili netlestirelim; sonra seni tek bir kucuk ibadet adimina goturecegiz.'),
        actionLabel: t('growth.onboarding.continue', 'Devam et'),
      },
      permissions: {
        title: t('growth.onboarding.permissionsTitle', 'Ritmi kacirmamak icin iki ayar'),
        description: permissionEmphasis === 'notifications_first'
          ? t('growth.onboarding.permissionsDescriptionNotifications', 'Bildirim ve konum, ilk gun namaz vaktini ve kisa hatirlatmayi dogru kurar.')
          : t('growth.onboarding.permissionsDescription', 'Sadece namaz vakti ve gunluk hatirlatma icin gereken ayarlari hazirlayalim.'),
        actionLabel: t('growth.onboarding.continue', 'Hazirim'),
      },
      goal: {
        title: t('growth.onboarding.goalTitle', 'Bugun hangi ritmi baslatalim?'),
        description: t('growth.onboarding.goalDescription', 'Ana ekran once tek bir net adim gosterecek; diger ozellikler sonra kalabilir.'),
        actionLabel: resolvedConfig.premiumTeaserEnabled && !isProUser
          ? t('growth.onboarding.startWithTeaser', 'Devam et')
          : t('growth.onboarding.startNow', 'Ilk adimi ac'),
      },
      preview: {
        title: t('growth.onboarding.previewTitle', 'Huzur ritmin hazir'),
        description: t('growth.onboarding.previewDescription', 'Bugun icin tek sakin adimi gor; istersen derin plani Pro ile veya bir dost davetiyle ac.'),
        actionLabel: t('growth.onboarding.previewFinish', 'Ritmi baslat'),
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
      window.dispatchEvent(new CustomEvent('openInviteModal', {
        detail: {
          source: 'onboarding_huzur_ritmi_reward',
          primaryGoal: selectedGoal,
        },
      }));
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
        background: 'rgba(12, 32, 25, 0.92)',
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
          background: 'linear-gradient(135deg, #0f3d2e 0%, #1a5c45 100%)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          padding: 20,
          color: '#f7f5ef',
          boxShadow: '0 18px 50px rgba(0,0,0,0.45)'
        }}
      >
        <div style={{ marginBottom: 16, fontSize: 13, opacity: 0.8 }}>
          {t('growth.onboarding.stepCounter', 'Adim {{current}} / {{total}}', { current: normalizedStep + 1, total: totalSteps })}
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: 22, color: '#d4af37' }}>{currentStep.title}</h2>
        <p style={{ margin: '0 0 20px', lineHeight: 1.6, color: '#d9e6db' }}>{currentStep.description}</p>

        {referralPlan && (
          <div
            style={{
              marginBottom: 16,
              padding: 16,
              borderRadius: 16,
              border: referralPlan.rewardReady
                ? '1px solid rgba(16, 185, 129, 0.28)'
                : '1px solid rgba(212, 175, 55, 0.24)',
              background: referralPlan.rewardReady
                ? 'rgba(16, 185, 129, 0.10)'
                : 'rgba(212, 175, 55, 0.10)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8, alignItems: 'center' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 999,
                padding: '6px 10px',
                background: 'rgba(255,255,255,0.08)',
                fontSize: 12,
                fontWeight: 900,
                color: referralPlan.rewardReady ? '#d1fae5' : '#f3d27b',
              }}>
                <Sparkles size={14} />
                {referralPlan.badge}
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(247,245,239,0.84)' }}>
                {referralPlan.completedCount}/{referralPlan.totalCount}
              </span>
            </div>

            <div style={{ fontSize: 16, fontWeight: 900, color: '#f7f5ef', marginBottom: 6 }}>
              {referralPlan.headline}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: '#d9e6db', marginBottom: 12 }}>
              {referralPlan.description}
            </div>

            <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
              {referralPlan.steps.map((step) => (
                <div
                  key={step.id}
                  style={{
                    borderRadius: 12,
                    padding: '10px 12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: step.status === 'done'
                      ? 'rgba(16, 185, 129, 0.12)'
                      : step.status === 'active'
                        ? 'rgba(212, 175, 55, 0.10)'
                        : 'rgba(255,255,255,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                    <strong style={{ fontSize: 13, color: '#f7f5ef' }}>{step.label}</strong>
                    <span style={{ fontSize: 11, fontWeight: 900, color: step.status === 'done' ? '#86efac' : '#f3d27b' }}>
                      {step.status === 'done' ? 'Hazir' : step.status === 'active' ? 'Siradaki' : 'Bekliyor'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(247,245,239,0.78)' }}>
                    {step.description}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, lineHeight: 1.55, color: 'rgba(247,245,239,0.74)' }}>
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
              border: '1px solid rgba(248, 113, 113, 0.35)',
              background: 'rgba(127, 29, 29, 0.28)',
              color: '#fee2e2',
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
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              padding: 16
            }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(212, 175, 55, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d4af37',
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
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              padding: 16
            }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
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
                    background: selected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255,255,255,0.06)',
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
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.22)',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(212, 175, 55, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d4af37',
                  flexShrink: 0
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, color: '#f7f5ef', marginBottom: 4 }}>
                    {t('growth.onboarding.premiumTeaserTitle', 'Ritim oturunca daha derin destek acilabilir')}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(247,245,239,0.84)' }}>
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
              border: '1px solid rgba(212, 175, 55, 0.24)',
              background: 'rgba(255,255,255,0.07)'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
                borderRadius: 999,
                padding: '6px 10px',
                background: 'rgba(212, 175, 55, 0.14)',
                color: '#f3d27b',
                fontSize: 12,
                fontWeight: 900
              }}>
                <Sparkles size={14} />
                {t('growth.onboarding.previewBadge', 'Bugunluk ritim')}
              </div>
              <h3 style={{ margin: '0 0 6px', color: '#f7f5ef', fontSize: 20 }}>
                {huzurRitmiPreview.title}
              </h3>
              <p style={{ margin: 0, color: 'rgba(247,245,239,0.82)', lineHeight: 1.55, fontSize: 14 }}>
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
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.05)'
                }}
              >
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(16, 185, 129, 0.14)',
                  color: '#86efac',
                  fontWeight: 900,
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#f7f5ef', marginBottom: 4 }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(247,245,239,0.78)' }}>
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
                    background: '#f3d27b',
                    color: '#14352a'
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
                    background: 'rgba(255,255,255,0.08)',
                    color: '#f7f5ef',
                    border: '1px solid rgba(255,255,255,0.14)'
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
            background: '#d4af37',
            color: '#14352a',
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
