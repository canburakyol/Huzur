import { getActiveCampaign } from './campaignService';
import { getExperimentVariant } from './experimentService';
import i18n from '../i18n';

const tx = (key: string, fallback: string, options: Record<string, unknown> = {}): string =>
  String(i18n.t(`referral.${key}`, { ...options, defaultValue: fallback }));

type Campaign = {
  id?: string;
  region?: string;
  variant?: string;
  [key: string]: unknown;
}

type InviterSummary = {
  ownCode?: string;
  inviteCreatedAt?: string | null;
  acceptedCount?: number;
  onboardingCompletedCount?: number;
  firstIbadahCompletedCount?: number;
  convertedCount?: number;
  rewardUnlockedCount?: number;
  latestInviterRewardAt?: string | null;
}

type InviteeSummary = {
  invitedByCode?: string;
  inviteAcceptedAt?: string | null;
  onboardingCompletedAt?: string | null;
  firstIbadahCompletedAt?: string | null;
  inviteeRewardUnlockedAt?: string | null;
  inviterId?: string;
  syncIssue?: string;
}

type ServerData = {
  inviterSummary: InviterSummary;
  inviteeSummary: InviteeSummary;
}

type Rewards = {
  inviterUnlockedAt?: string | null;
  inviteeUnlockedAt?: string | null;
  [key: string]: unknown;
}

type LocalProgress = {
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

type MergedProgress = LocalProgress & {
  server: ServerData;
}

type GrowthStep = {
  id: string;
  label: string;
  description: string;
  status: 'done' | 'pending' | 'active';
}

type GrowthStat = {
  id: string;
  label: string;
  value: string;
}

export type ReferralGrowthPlan = {
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

type ShareTextOptions = {
  inviteCode?: string;
  inviteUrl?: string;
  variant?: string;
  lang?: string;
  campaign?: Campaign;
}

type ShareTextResult = {
  title: string;
  dialogTitle: string;
  text: string;
}

type GrowthPlanOptions = {
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

type ShareLabels = {
  primary: string;
  secondary: string;
}

const getShareLabels = (variant = 'A'): ShareLabels => {
  const v = ['B', 'C'].includes(variant) ? variant : 'A';
  const fallback: Record<string, ShareLabels> = {
    A: { primary: 'Linki paylaş', secondary: 'Hazır davet metnini tek dokunuşla gönder' },
    B: { primary: 'Bir dostuna gönder', secondary: 'Sade ve samimi bir davet metni hazır' },
    C: { primary: 'Ritmi birlikte başlat', secondary: 'Daha güçlü bir davet çağrısı hazır' },
  };
  return {
    primary: tx(`shareCta.${v}.primary`, fallback[v].primary),
    secondary: tx(`shareCta.${v}.secondary`, fallback[v].secondary),
  };
};

const getCampaignSupportingCopy = (campaign: Campaign | undefined): string => {
  switch (campaign?.id) {
    case 'ramadan':
      return tx('note.ramadan', 'Ramazan\'da paylaşılan davetler daha anlamlı olabilir.');
    case 'friday':
      return tx('note.friday', 'Cuma bereketiyle yapılan davetler daha sıcak bir sebep sunar.');
    case 'kandil':
      return tx('note.kandil', 'Kandil gibi özel günlerde davetler daha derin bir bağ kurar.');
    default:
      return tx('note.default', 'Daveti sakin, samimi ve tek bir faydaya odaklanarak yapman en iyi sonucu verir.');
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

  let headline = tx('plan.headline.default', 'Huzur\'u samimi bir davetle paylaş');
  let description = tx('plan.description.default', 'En iyi davet, birine gerçekten iyi geleceğini hissettiğin sakin bir anda yapılır.');
  let badge = tx('plan.badge.default', 'İki taraf da kazanır');
  let riskState = 'healthy';

  if (blocked) {
    headline = tx('plan.headline.blocked', 'Davetler kısa bir süre duraklatıldı');
    description = tx('plan.description.blocked', 'Güvenlik nedeniyle kısa bir süre bekliyoruz. Süre dolunca kaldığın yerden devam edebilirsin.');
    badge = tx('plan.badge.blocked', 'Güvenlik molası');
    riskState = 'blocked';
  } else if (inviterRewardReady || convertedCount > 0) {
    headline = tx('plan.headline.converted', 'Davetlerin sonuç vermeye başladı');
    description = convertedCount > 1
      ? tx('plan.description.convertedMany', '{{n}} davetin tamamlandı. Huzur\'u çevrende büyütüyorsun.', { n: convertedCount })
      : tx('plan.description.convertedOne', 'İlk davetin tamamlandı. Bir sonraki kişiye de gönderebilirsin.');
    badge = tx('plan.badge.converted', 'Tamamlanan davet');
  } else if (cameFromInvite && inviteeRewardReady) {
    headline = tx('plan.headline.inviteeReward', 'Davet ödülün hazır');
    description = tx('plan.description.inviteeReward', 'İlk adımları tamamladın. Şimdi aynı deneyimi bir dostuna da ulaştırabilirsin.');
    badge = tx('plan.badge.inviteeReward', 'Ödül açıldı');
  } else if (hasOwnInvite) {
    headline = waitingCount > 0
      ? tx('plan.headline.waiting', 'Davetlerin ilerliyor')
      : tx('plan.headline.firstInvite', 'İlk davetini gönder');
    description = waitingCount > 0
      ? tx('plan.description.waiting', '{{n}} davet ilk adımlarını bekliyor. Kısa bir hatırlatma fark yaratabilir.', { n: waitingCount })
      : tx('plan.description.firstInvite', 'Tek bir kişiye, neden iyi gelebileceğini kısaca söyleyerek göndermen yeterli.');
    badge = tx('plan.badge.linkReady', 'Link hazır');
  }

  if (!blocked && surface === 'onboarding_huzur_ritmi_reward') {
    const proReady = inviterRewardReady || convertedCount > 0;
    headline = proReady ? tx('plan.headline.proReady', '24 saatlik Pro\'n hazır') : tx('plan.headline.proInvite', 'Bir dostuna gönder, 24 saatlik Pro\'yu aç');
    description = proReady ? tx('plan.description.proReady', 'Davetin tamamlandı. Pro özelliklerini 24 saat boyunca kullanabilirsin.') : tx('plan.description.proInvite', 'Tek bir samimi davet yeterli. Davet tamamlanınca Pro özellikleri 24 saatliğine açılır.');
    badge = tx('plan.badge.pro', '24 saat Pro');
  }

  const steps: GrowthStep[] = [
    {
      id: 'link',
      label: tx('steps.link.label', 'Linkini hazırla'),
      description: tx('steps.link.description', 'Davet kodunu oluştur ve kime göndereceğine karar ver.'),
      status: hasOwnInvite ? 'done' : 'pending',
    },
    {
      id: 'accept',
      label: tx('steps.accept.label', 'Dostun ilk adımı atsın'),
      description: tx('steps.accept.description', 'Davet linkinle gelip kurulumu tamamlayan ilk kişi süreci başlatır.'),
      status: acceptedCount > 0 ? 'done' : 'pending',
    },
    {
      id: 'convert',
      label: tx('steps.convert.label', 'İlk ibadetle ödül açılsın'),
      description: tx('steps.convert.description', 'Dostun kurulumu ve ilk ibadetini tamamlayınca davet tamamlanmış sayılır.'),
      status: inviterRewardReady || convertedCount > 0 ? 'done' : 'pending',
    },
  ];

  if (cameFromInvite) {
    steps.push({
      id: 'invitee',
      label: tx('steps.invitee.label', 'Senin hoş geldin hediyen'),
      description: inviteeRewardReady
        ? tx('steps.invitee.doneDescription', 'Davet ödülün açıldı. Bu deneyimi bir sonraki kişiye ulaştırabilirsin.')
        : tx('steps.invitee.pendingDescription', 'İlk adımlarını tamamlayınca senin tarafında da ödül açılır.'),
      status: inviteeRewardReady ? 'done' : 'active',
    });
  }

  const stats: GrowthStat[] = [
    { id: 'converted', label: tx('stats.converted', 'Tamamlanan davet'), value: String(convertedCount) },
    { id: 'waiting', label: tx('stats.waiting', 'Bekleyen davet'), value: String(waitingCount) },
    {
      id: 'reward',
      label: tx('stats.reward', 'Senin durumun'),
      value: inviteeRewardReady || inviterRewardReady ? tx('stats.ready', 'Hazır') : tx('stats.tracking', 'Takipte'),
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
  lang,
  campaign = getActiveCampaign(),
}: ShareTextOptions = {}): ShareTextResult => {
  const safeCode = String(inviteCode || '').trim().toUpperCase();
  const safeUrl = String(inviteUrl || '').trim();
  // Text follows the given language (defaults to the app language); the invite link carries its own lang.
  const lng = lang || i18n.language;
  const t = (key: string, fallback: string, options: Record<string, unknown> = {}) => tx(key, fallback, { ...options, lng });
  const v = ['B', 'C'].includes(variant) ? variant : 'A';
  const introFallback: Record<string, string> = {
    A: 'Huzur\'a birlikte başlayalım. Tek bir sakin adımla ritim kurmak daha kolay oluyor.',
    B: 'Sana iyi gelebileceğini düşündüğüm bir Huzur daveti bıraktım.',
    C: 'Bu hafta Huzur\'da daha sakin bir ritim kurmak istersen buradan başlayabilirsin.',
  };
  const intro = t(`shareText.intro.${v}`, introFallback[v]);
  const seasonalNote = campaign?.id === 'friday'
    ? t('shareText.seasonal.friday', ' Cuma bereketi için de güzel bir başlangıç olur.')
    : campaign?.id === 'ramadan'
      ? t('shareText.seasonal.ramadan', ' Ramazan için de iyi bir eşlik olabilir.')
      : '';

  return {
    title: t('shareText.title', 'Huzur Daveti'),
    dialogTitle: t('shareText.dialogTitle', 'Arkadaşını Davet Et'),
    text: `${intro}${seasonalNote}\n\n${t('shareText.codeLine', 'Davet kodum: {{code}}', { code: safeCode })}\n${safeUrl}`.trim(),
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
