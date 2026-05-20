import { getActiveCampaign } from './campaignService';
import { mergeReferralProgress } from './referralGrowthService';

interface ReferralStep {
  id: string;
  label: string;
  description: string;
  status: 'done' | 'active' | 'pending';
}

interface ReferralOnboardingPlan {
  invitedByCode: string;
  rewardReady: boolean;
  onboardingDone: boolean;
  firstIbadahDone: boolean;
  remainingCount: number;
  completedCount: number;
  totalCount: number;
  badge: string;
  headline: string;
  description: string;
  tone: string;
  supportNote: string;
  syncIssue: string;
  steps: ReferralStep[];
  signature: string;
}

interface BuildPlanOptions {
  localProgress?: Record<string, unknown>;
  serverSnapshot?: Record<string, unknown>;
  currentStep?: string;
  selectedGoal?: string;
  campaign?: { id?: string; [key: string]: unknown };
}

const buildStep = (id: string, label: string, description: string, status: 'done' | 'active' | 'pending'): ReferralStep => ({
  id,
  label,
  description,
  status,
});

export const buildReferralOnboardingPlan = ({
  localProgress = {},
  serverSnapshot = {},
  currentStep = 'language',
  selectedGoal = 'prayer_rhythm',
  campaign = getActiveCampaign(),
}: BuildPlanOptions = {}): ReferralOnboardingPlan | null => {
  const progress = mergeReferralProgress(localProgress as Record<string, unknown>, serverSnapshot as Record<string, unknown>);
  const cameFromInvite = Boolean(progress?.invitedByCode);

  if (!cameFromInvite) {
    return null;
  }

  const onboardingDone = Boolean(progress?.onboardingCompletedAt);
  const firstIbadahDone = Boolean(progress?.firstIbadahCompletedAt);
  const rewardReady = Boolean((progress as Record<string, unknown>)?.rewards && (progress as Record<string, unknown>).rewards?.inviteeUnlockedAt);
  const syncIssue = (progress as Record<string, unknown>)?.server && ((progress as Record<string, unknown>).server as Record<string, unknown>)?.inviteeSummary && (((progress as Record<string, unknown>).server as Record<string, unknown>).inviteeSummary as Record<string, unknown>)?.syncIssue || '';

  const steps = [
    buildStep(
      'invite_accept',
      'Davet baglandi',
      'Davet linki yakalandi. Simdi kurulumu sakin sekilde tamamlayabilirsin.',
      'done'
    ),
    buildStep(
      'onboarding',
      'Kurulum tamamlansin',
      'Dil, izinler ve ana odak secimi bittiginde ilk halka kapanir.',
      onboardingDone ? 'done' : currentStep === 'goal' ? 'active' : 'pending'
    ),
    buildStep(
      'first_ibadah',
      'Ilk ibadet acilsin',
      selectedGoal === 'family_consistency'
        ? 'Aile ritmine uygun ilk manevi adimla starter paket destegi acilir.'
        : 'Ilk manevi adimla starter paket destegi acilir.',
      rewardReady || firstIbadahDone ? 'done' : onboardingDone ? 'active' : 'pending'
    ),
  ];

  const completedCount = steps.filter((step) => step.status === 'done').length;
  const remainingCount = Math.max(0, steps.length - completedCount);

  let headline = 'Bir davetle geldin';
  let description = 'Kurulumu tamamlayinca ilk manevi adimla birlikte davet starter paketin acilacak.';
  let badge = 'Davet akisi';
  let tone = 'active';

  if (rewardReady) {
    headline = 'Starter paket akisin hazir';
    description = 'Davet zincirin tamamlandi. Artik Huzur deneyimini bir sonraki kisiye tasiyabilirsin.';
    badge = 'Odul acildi';
    tone = 'reward_ready';
  } else if (onboardingDone) {
    headline = 'Bir adim kaldi';
    description = 'Kurulum tamam. Ilk manevi adimla davet akisini tamamen acabilirsin.';
    badge = 'Son halka';
  } else if (currentStep === 'permissions') {
    headline = 'Kurulumu bitirmeye yakinsin';
    description = 'Bu iki tercih sonrasi ana odagini secip davet akisini tamamlayabilirsin.';
    badge = '2 kisa adim';
  }

  const supportNote = syncIssue
    ? 'Davet iliskisi sunucuda henuz tam eslesmedi, ama akisin korunuyor. Ilk tamamlama ile otomatik netlesecek.'
    : campaign?.id === 'ramadan'
      ? 'Ramazan doneminde gelen davetler genelde daha hizli aktivasyona doner.'
      : 'Bu onboarding sadece ilk deger anina odaklanir; geri kalan her sey sonra sakin sekilde gelir.';

  return {
    invitedByCode: (progress as Record<string, unknown>)?.invitedByCode as string || '',
    rewardReady,
    onboardingDone,
    firstIbadahDone,
    remainingCount,
    completedCount,
    totalCount: steps.length,
    badge,
    headline,
    description,
    tone,
    supportNote,
    syncIssue,
    steps,
    signature: [
      currentStep,
      selectedGoal,
      rewardReady ? 'ready' : 'pending',
      onboardingDone ? 'on' : 'off',
      firstIbadahDone ? 'ibadah' : 'wait',
    ].join(':'),
  };
};

export const buildReferralOnboardingAnalyticsPayload = (plan: Partial<ReferralOnboardingPlan> = {}, extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  ...(plan?.invitedByCode ? {
    referred_user: true,
    referral_code: plan?.invitedByCode || undefined,
    referral_reward_ready: plan?.rewardReady === true,
    referral_remaining_steps: Math.max(0, Number(plan?.remainingCount) || 0),
    referral_completed_steps: Math.max(0, Number(plan?.completedCount) || 0),
    referral_tone: plan?.tone || 'active',
  } : {}),
  ...extra,
});

export default {
  buildReferralOnboardingAnalyticsPayload,
  buildReferralOnboardingPlan,
};
