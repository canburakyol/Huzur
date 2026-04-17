import { getActiveCampaign } from './campaignService';
import { getExperimentVariant } from './experimentService';

const sanitizeIso = (value) => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
};

const isBlocked = (blockedUntil) => {
  const blockedUntilMs = Date.parse(blockedUntil || '');
  return Number.isFinite(blockedUntilMs) && blockedUntilMs > Date.now();
};

const resolveShareVariant = (explicitVariant) => {
  if (['A', 'B', 'C'].includes(explicitVariant)) return explicitVariant;
  return getExperimentVariant('share_cta_v1');
};

const getShareLabels = (variant = 'A') => {
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

const getCampaignSupportingCopy = (campaign) => {
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

export const mergeReferralProgress = (localProgress = {}, serverSnapshot = {}) => {
  const inviterSummary = serverSnapshot?.inviterSummary || {};
  const inviteeSummary = serverSnapshot?.inviteeSummary || {};

  return {
    ...localProgress,
    rewards: {
      ...(localProgress?.rewards || {}),
      inviterUnlockedAt: sanitizeIso(localProgress?.rewards?.inviterUnlockedAt) || sanitizeIso(inviterSummary?.latestInviterRewardAt),
      inviteeUnlockedAt: sanitizeIso(localProgress?.rewards?.inviteeUnlockedAt) || sanitizeIso(inviteeSummary?.inviteeRewardUnlockedAt),
    },
    invitedByCode: localProgress?.invitedByCode || inviteeSummary?.invitedByCode || '',
    inviteAcceptedAt: sanitizeIso(localProgress?.inviteAcceptedAt) || sanitizeIso(inviteeSummary?.inviteAcceptedAt),
    onboardingCompletedAt: sanitizeIso(localProgress?.onboardingCompletedAt) || sanitizeIso(inviteeSummary?.onboardingCompletedAt),
    firstIbadahCompletedAt: sanitizeIso(localProgress?.firstIbadahCompletedAt) || sanitizeIso(inviteeSummary?.firstIbadahCompletedAt),
    server: {
      inviterSummary: {
        ownCode: inviterSummary?.ownCode || localProgress?.ownCode || '',
        inviteCreatedAt: sanitizeIso(inviterSummary?.inviteCreatedAt) || sanitizeIso(localProgress?.inviteCreatedAt),
        acceptedCount: Math.max(0, Number(inviterSummary?.acceptedCount) || 0),
        onboardingCompletedCount: Math.max(0, Number(inviterSummary?.onboardingCompletedCount) || 0),
        firstIbadahCompletedCount: Math.max(0, Number(inviterSummary?.firstIbadahCompletedCount) || 0),
        convertedCount: Math.max(0, Number(inviterSummary?.convertedCount) || 0),
        rewardUnlockedCount: Math.max(0, Number(inviterSummary?.rewardUnlockedCount) || 0),
        latestInviterRewardAt: sanitizeIso(inviterSummary?.latestInviterRewardAt),
      },
      inviteeSummary: {
        invitedByCode: inviteeSummary?.invitedByCode || localProgress?.invitedByCode || '',
        inviteAcceptedAt: sanitizeIso(inviteeSummary?.inviteAcceptedAt) || sanitizeIso(localProgress?.inviteAcceptedAt),
        onboardingCompletedAt: sanitizeIso(inviteeSummary?.onboardingCompletedAt) || sanitizeIso(localProgress?.onboardingCompletedAt),
        firstIbadahCompletedAt: sanitizeIso(inviteeSummary?.firstIbadahCompletedAt) || sanitizeIso(localProgress?.firstIbadahCompletedAt),
        inviteeRewardUnlockedAt: sanitizeIso(inviteeSummary?.inviteeRewardUnlockedAt) || sanitizeIso(localProgress?.rewards?.inviteeUnlockedAt),
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
} = {}) => {
  const progress = mergeReferralProgress(localProgress, serverSnapshot);
  const resolvedShareVariant = resolveShareVariant(shareVariant);
  const shareLabels = getShareLabels(resolvedShareVariant);
  const blocked = isBlocked(progress?.antiAbuse?.blockedUntil);
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

  const steps = [
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

  const stats = [
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
    blockedUntil: sanitizeIso(progress?.antiAbuse?.blockedUntil),
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
} = {}) => {
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

export const buildReferralAnalyticsPayload = (plan = {}, extra = {}) => ({
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
