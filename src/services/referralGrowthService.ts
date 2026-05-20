import { getActiveCampaign } from './campaignService';
import { getExperimentVariant } from './experimentService';

interface Campaign {
  id?: string;
  region?: string;
  variant?: string;
  [key: string]: unknown;
}

interface InviterSummary {
  ownCode?: string;
  inviteCreatedAt?: string | null;
  acceptedCount?: number;
  onboardingCompletedCount?: number;
  firstIbadahCompletedCount?: number;
  convertedCount?: number;
  rewardUnlockedCount?: number;
  latestInviterRewardAt?: string | null;
}

interface InviteeSummary {
  invitedByCode?: string;
  inviteAcceptedAt?: string | null;
  onboardingCompletedAt?: string | null;
  firstIbadahCompletedAt?: string | null;
  inviteeRewardUnlockedAt?: string | null;
  inviterId?: string;
  syncIssue?: string;
}

interface ServerData {
  inviterSummary: InviterSummary;
  inviteeSummary: InviteeSummary;
}

interface Rewards {
  inviterUnlockedAt?: string | null;
  inviteeUnlockedAt?: string | null;
  [key: string]: unknown;
}

interface LocalProgress {
  ownCode?: string;
  inviteCreatedAt?: string | null;
  invitedByCode?: string;
  inviteAcceptedAt?: string | null;
  onboardingCompletedAt?: string | null;
  firstIbadahCompletedAt?: string | null;
  rewards?: Rewards;
  antiAbuse?: { blockedUntil?: string | null };
  [key: string]: unknown;
}

interface MergedProgress extends LocalProgress {
  server: ServerData;
}

interface GrowthStep {
  id: string;
  label: string;
  description: string;
  status: 'done' | 'pending' | 'active';
}

interface GrowthStat {
  id: string;
  label: string;
  value: string;
}

export interface ReferralGrowthPlan {
  source: string;
  campaign: Campaign | undefined;
  shareVariant: string;
  shareLabel: string;
  shareSupportLabel: string;
  headline: string;
  description: string;
  badge: string;
  riskState: string;
  steps: GrowthStep[];
  stats: GrowthStat[];
  acceptedCount: number;
  convertedCount: number;
  waitingCount: number;
  hasOwnInvite: boolean;
  inviteeRewardReady: boolean;
  inviterRewardReady: boolean;
  cameFromInvite: boolean;
  blockedUntil: string | null;
  supportingNote: string;
  syncIssue: string;
  signature: string;
}

interface ShareTextOptions {
  inviteCode?: string;
  inviteUrl?: string;
  variant?: string;
  lang?: string;
  campaign?: Campaign;
}

interface ShareTextResult {
  title: string;
  dialogTitle: string;
  text: string;
}

interface GrowthPlanOptions {
  localProgress?: LocalProgress;
  serverSnapshot?: Record<string, unknown>;
  surface?: string;
  shareVariant?: string;
  campaign?: Campaign;
}

const sanitizeIso = (value: string | null | undefined): string | null => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
};

const isBlocked = (blockedUntil: string | null | undefined): boolean => {
  const blockedUntilMs = Date.parse(blockedUntil || '');
  return Number.isFinite(blockedUntilMs) && blockedUntilMs > Date.now();
};

const resolveShareVariant = (explicitVariant: string | undefined): string => {
  if (['A', 'B', 'C'].includes(explicitVariant || '')) return explicitVariant!;
  return getExperimentVariant('share_cta_v1');
};

interface ShareLabels {
  primary: string;
  secondary: string;
}

const getShareLabels = (variant = 'A'): ShareLabels => {
  if (variant === 'B') {
    return {
      primary: 'Bir dostuna gonder',
      secondary: 'Sessiz ve samimi bir davet metni hazir',
    };
  }

  if (variant === 'C') {
    return {
      primary: 'Ritmi birlikte baslat',
      secondary: 'Daha guclu bir davet cagrisi hazir',
    };
  }

  return {
    primary: 'Linki paylas',
    secondary: 'Hazir davet metnini bir tikla gonder',
  };
};

const getCampaignSupportingCopy = (campaign: Campaign | undefined): string => {
  switch (campaign?.id) {
    case 'ramadan':
      return 'Ramazan akisi icin paylasilan davetler daha anlamli bir geri donus uretebilir.';
    case 'friday':
      return 'Cuma bereketi etrafinda yapilan davetler daha sicak bir neden sunar.';
    case 'kandil':
      return 'Kandil gibi ozel gunlerde davetler daha yavas ama daha derin bir bag kurar.';
    default:
      return 'Davet akisini sakin, samimi ve tek bir fayda cevresinde kurman en iyi sonucu verir.';
  }
};

export const mergeReferralProgress = (localProgress: LocalProgress = {}, serverSnapshot: Record<string, unknown> = {}): MergedProgress => {
  const inviterSummary = (serverSnapshot?.inviterSummary || {}) as InviterSummary;
  const inviteeSummary = (serverSnapshot?.inviteeSummary || {}) as InviteeSummary;

  return {
    ...localProgress,
    rewards: {
      ...(localProgress?.rewards || {}),
      inviterUnlockedAt: sanitizeIso(localProgress?.rewards?.inviterUnlockedAt as string) || sanitizeIso(inviterSummary?.latestInviterRewardAt as string),
      inviteeUnlockedAt: sanitizeIso(localProgress?.rewards?.inviteeUnlockedAt as string) || sanitizeIso(inviteeSummary?.inviteeRewardUnlockedAt as string),
    },
    invitedByCode: localProgress?.invitedByCode || inviteeSummary?.invitedByCode || '',
    inviteAcceptedAt: sanitizeIso(localProgress?.inviteAcceptedAt as string) || sanitizeIso(inviteeSummary?.inviteAcceptedAt as string),
    onboardingCompletedAt: sanitizeIso(localProgress?.onboardingCompletedAt as string) || sanitizeIso(inviteeSummary?.onboardingCompletedAt as string),
    firstIbadahCompletedAt: sanitizeIso(localProgress?.firstIbadahCompletedAt as string) || sanitizeIso(inviteeSummary?.firstIbadahCompletedAt as string),
    server: {
      inviterSummary: {
        ownCode: inviterSummary?.ownCode || localProgress?.ownCode || '',
        inviteCreatedAt: sanitizeIso(inviterSummary?.inviteCreatedAt as string) || sanitizeIso(localProgress?.inviteCreatedAt as string),
        acceptedCount: Math.max(0, Number(inviterSummary?.acceptedCount) || 0),
        onboardingCompletedCount: Math.max(0, Number(inviterSummary?.onboardingCompletedCount) || 0),
        firstIbadahCompletedCount: Math.max(0, Number(inviterSummary?.firstIbadahCompletedCount) || 0),
        convertedCount: Math.max(0, Number(inviterSummary?.convertedCount) || 0),
        rewardUnlockedCount: Math.max(0, Number(inviterSummary?.rewardUnlockedCount) || 0),
        latestInviterRewardAt: sanitizeIso(inviterSummary?.latestInviterRewardAt as string),
      },
      inviteeSummary: {
        invitedByCode: inviteeSummary?.invitedByCode || localProgress?.invitedByCode || '',
        inviteAcceptedAt: sanitizeIso(inviteeSummary?.inviteAcceptedAt as string) || sanitizeIso(localProgress?.inviteAcceptedAt as string),
        onboardingCompletedAt: sanitizeIso(inviteeSummary?.onboardingCompletedAt as string) || sanitizeIso(localProgress?.onboardingCompletedAt as string),
        firstIbadahCompletedAt: sanitizeIso(inviteeSummary?.firstIbadahCompletedAt as string) || sanitizeIso(localProgress?.firstIbadahCompletedAt as string),
        inviteeRewardUnlockedAt: sanitizeIso(inviteeSummary?.inviteeRewardUnlockedAt as string) || sanitizeIso(localProgress?.rewards?.inviteeUnlockedAt as string),
        inviterId: inviteeSummary?.inviterId || '',
        syncIssue: inviteeSummary?.syncIssue || '',
      },
    },
  };
};

export const getReferralGrowthPlan = ({
  localProgress = {},
  serverSnapshot = {},
  surface = 'invite_modal',
  shareVariant,
  campaign = getActiveCampaign(),
}: GrowthPlanOptions = {}): ReferralGrowthPlan => {
  const progress = mergeReferralProgress(localProgress, serverSnapshot);
  const resolvedShareVariant = resolveShareVariant(shareVariant);
  const shareLabels = getShareLabels(resolvedShareVariant);
  const blocked = isBlocked((progress as Record<string, unknown>)?.antiAbuse && ((progress as Record<string, unknown>).antiAbuse as Record<string, unknown>)?.blockedUntil as string);
  const acceptedCount = progress?.server?.inviterSummary?.acceptedCount || 0;
  const convertedCount = progress?.server?.inviterSummary?.convertedCount || 0;
  const waitingCount = Math.max(acceptedCount - convertedCount, 0);
  const inviterRewardReady = Boolean(progress?.rewards?.inviterUnlockedAt);
  const inviteeRewardReady = Boolean(progress?.rewards?.inviteeUnlockedAt);
  const hasOwnInvite = Boolean(progress?.ownCode || progress?.server?.inviterSummary?.ownCode);
  const cameFromInvite = Boolean(progress?.invitedByCode);

  let headline = 'Huzur\'u sakin bir davetle yay';
  let description = 'En iyi davet anlari, kisiye gercekten iyi gelebilecegini hissettigin sakin anlardir.';
  let badge = 'Cift tarafli deger';
  let riskState = 'healthy';

  if (blocked) {
    headline = 'Davet akisi gecici olarak dinleniyor';
    description = 'Guvenlik nedeniyle kisa bir sure bekliyoruz. Sure dolunca ayni akistan devam edebilirsin.';
    badge = 'Guvenlik molasi';
    riskState = 'blocked';
  } else if (inviterRewardReady || convertedCount > 0) {
    headline = 'Davet halkan calismaya basladi';
    description = convertedCount > 1
      ? `${convertedCount} tamamlanan davet ile Huzur etkini buyutuyorsun.`
      : 'Ilk tamamlanan davetin gorundu. Bu sakin ve duzenli loop buyumeye hazir.';
    badge = 'Donusen davet';
  } else if (cameFromInvite && inviteeRewardReady) {
    headline = 'Senin davet odulun hazir';
    description = 'Ilk adimlari tamamladin. Simdi ayni sakin deneyimi bir dostuna tasiyabilirsin.';
    badge = 'Odul acildi';
  } else if (hasOwnInvite) {
    headline = waitingCount > 0
      ? 'Davetlerin ilerliyor'
      : 'Ilk sakin davetini gonder';
    description = waitingCount > 0
      ? `${waitingCount} davet ilk adimlarini bekliyor. Kisa bir hatirlatma fark yaratabilir.`
      : 'Tek bir kisiye, neden iyi gelebilecegini kisaca soyleyerek paylasman yeterli.';
    badge = 'Hazir link';
  }

  if (!blocked && surface === 'onboarding_huzur_ritmi_reward') {
    headline = inviterRewardReady || convertedCount > 0
      ? '24 saatlik Pro ritmin hazir'
      : 'Bir dostuna gonder, 24 saatlik Pro ritmini ac';
    description = inviterRewardReady || convertedCount > 0
      ? 'Davet halkan tamamlandi. Derin ritim destegini sakin sekilde kullanabilirsin.'
      : 'Tek bir samimi davet yeterli. Davet tamamlaninca derin ritim destegi 24 saatligine acilir.';
    badge = '24 saat Pro';
  }

  const steps: GrowthStep[] = [
    {
      id: 'link',
      label: 'Linkini hazirla',
      description: 'Davet kodunu olustur ve kime gonderecegine karar ver.',
      status: hasOwnInvite ? 'done' : 'pending',
    },
    {
      id: 'accept',
      label: 'Dostun ilk adimi atsin',
      description: 'Davet linkiyle gelip kurulumu tamamlayan ilk kisi loopu baslatir.',
      status: acceptedCount > 0 ? 'done' : 'pending',
    },
    {
      id: 'convert',
      label: 'Ilk ibadetle odul acilsin',
      description: 'Onboarding ve ilk ibadet tamamlaninca davet halkasi gercekten calisir.',
      status: inviterRewardReady || convertedCount > 0 ? 'done' : 'pending',
    },
  ];

  if (cameFromInvite) {
    steps.push({
      id: 'invitee',
      label: 'Senin starter paket akisin',
      description: inviteeRewardReady
        ? 'Senin davet odulun acildi. Bu deneyimi bir sonraki kisiye tasiyabilirsin.'
        : 'Kendi davet akisin tamamlanirsa senin tarafinda da destek acilir.',
      status: inviteeRewardReady ? 'done' : 'active',
    });
  }

  const stats: GrowthStat[] = [
    {
      id: 'converted',
      label: 'Tamamlanan davet',
      value: String(convertedCount),
    },
    {
      id: 'waiting',
      label: 'Bekleyen akis',
      value: String(waitingCount),
    },
    {
      id: 'reward',
      label: 'Senin durumun',
      value: inviteeRewardReady || inviterRewardReady ? 'Hazir' : 'Takipte',
    },
  ];

  return {
    source: surface,
    campaign,
    shareVariant: resolvedShareVariant,
    shareLabel: shareLabels.primary,
    shareSupportLabel: shareLabels.secondary,
    headline,
    description,
    badge,
    riskState,
    steps,
    stats,
    acceptedCount,
    convertedCount,
    waitingCount,
    hasOwnInvite,
    inviteeRewardReady,
    inviterRewardReady,
    cameFromInvite,
    blockedUntil: sanitizeIso((progress as Record<string, unknown>)?.antiAbuse && ((progress as Record<string, unknown>).antiAbuse as Record<string, unknown>)?.blockedUntil as string),
    supportingNote: getCampaignSupportingCopy(campaign),
    syncIssue: progress?.server?.inviteeSummary?.syncIssue || '',
    signature: [
      resolvedShareVariant,
      campaign?.id || 'evergreen',
      riskState,
      convertedCount,
      waitingCount,
      inviteeRewardReady ? 'invitee' : 'none',
      inviterRewardReady ? 'inviter' : 'none',
    ].join(':'),
  };
};

export const buildReferralShareText = ({
  inviteCode = '',
  inviteUrl = '',
  variant = 'A',
  lang = 'tr',
  campaign = getActiveCampaign(),
}: ShareTextOptions = {}): ShareTextResult => {
  const safeCode = String(inviteCode || '').trim().toUpperCase();
  const safeUrl = String(inviteUrl || '').trim();
  const normalizedLang = String(lang || 'tr').toLowerCase().startsWith('en') ? 'en' : 'tr';

  if (normalizedLang === 'en') {
    const intro = variant === 'B'
      ? 'I thought Huzur could genuinely feel calming for you.'
      : variant === 'C'
        ? 'Let\'s build a calmer spiritual rhythm together in Huzur.'
        : 'Join me in Huzur and start with one calm next step.';
    const seasonalNote = campaign?.id === 'ramadan'
      ? ' Ramadan mode is especially meaningful right now.'
      : '';

    return {
      title: 'Huzur Invitation',
      dialogTitle: 'Invite a Friend',
      text: `${intro}${seasonalNote}\n\nMy invite code: ${safeCode}\n${safeUrl}`.trim(),
    };
  }

  const intro = variant === 'B'
    ? 'Sana iyi gelebilecegini dusundugum sakin bir Huzur daveti biraktim.'
    : variant === 'C'
      ? 'Bu hafta Huzur\'da daha sakin bir ritim kurmak istersen buradan baslayabilirsin.'
      : 'Huzur\'a birlikte baslayalim. Tek bir sakin adimla ritim kurmak daha kolay oluyor.';
  const seasonalNote = campaign?.id === 'friday'
    ? ' Cuma bereketi icin de guzel bir baslangic olur.'
    : campaign?.id === 'ramadan'
      ? ' Ramazan akisi icin de iyi bir eslik edebilir.'
      : '';

  return {
    title: 'Huzur Daveti',
    dialogTitle: 'Arkadasini Davet Et',
    text: `${intro}${seasonalNote}\n\nDavet kodum: ${safeCode}\n${safeUrl}`.trim(),
  };
};

export const buildReferralAnalyticsPayload = (plan: Partial<ReferralGrowthPlan> = {}, extra: Record<string, unknown> = {}): Record<string, unknown> => ({
  source: plan?.source || 'invite_modal',
  share_variant: plan?.shareVariant || 'A',
  campaign_id: plan?.campaign?.id || 'evergreen',
  campaign_region: plan?.campaign?.region || 'TR',
  campaign_variant: plan?.campaign?.variant || 'local',
  risk_state: plan?.riskState || 'healthy',
  converted_count: Math.max(0, Number(plan?.convertedCount) || 0),
  waiting_count: Math.max(0, Number(plan?.waitingCount) || 0),
  came_from_invite: plan?.cameFromInvite === true,
  invitee_reward_ready: plan?.inviteeRewardReady === true,
  inviter_reward_ready: plan?.inviterRewardReady === true,
  ...extra,
});

export default {
  buildReferralAnalyticsPayload,
  buildReferralShareText,
  getReferralGrowthPlan,
  mergeReferralProgress,
};
