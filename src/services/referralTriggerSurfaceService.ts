import { getActiveCampaign } from './campaignService';
import i18n from '../i18n';
import { buildReferralAnalyticsPayload, getReferralGrowthPlan, ReferralGrowthPlan } from './referralGrowthService';

type Campaign = {
  id?: string;
  region?: string;
  variant?: string;
  [key: string]: unknown;
}

type WeeklyStats = {
  activeDays?: number;
  tasksCompleted?: number;
  xpEarned?: number;
  [key: string]: unknown;
}

type AssistantMeta = {
  answered?: boolean;
  confidence?: string;
  safeModeNotice?: boolean;
  sources?: unknown[];
  [key: string]: unknown;
}

type SurfacePlan = {
  triggerId: string;
  entrySource: string;
  badge: string;
  headline: string;
  description: string;
  supportLabel: string;
  ctaLabel: string;
  emphasis: string;
}

type TriggerSurfacePlan = SurfacePlan & {
  surface: string;
  shareVariant: string;
  riskState: string;
  campaign: Campaign | undefined;
  analyticsPayload: Record<string, unknown>;
  signature: string;
}

type BuildPlanOptions = {
  surface?: string;
  localProgress?: Record<string, unknown>;
  serverSnapshot?: Record<string, unknown>;
  weeklyStats?: WeeklyStats | null;
  assistantMeta?: AssistantMeta | null;
  campaign?: Campaign;
}

const normalizeCount = (value: number | undefined | null): number => Math.max(0, Number(value) || 0);

const hasWeeklyMomentum = (weeklyStats: WeeklyStats | null | undefined = {}): boolean => (
  normalizeCount(weeklyStats?.activeDays) >= 3 ||
  normalizeCount(weeklyStats?.tasksCompleted) >= 4 ||
  normalizeCount(weeklyStats?.xpEarned) >= 120
);

const hasHelpfulAssistantMoment = (assistantMeta: AssistantMeta | null | undefined = {}): boolean => (
  assistantMeta?.answered === true &&
  assistantMeta?.confidence !== 'low' &&
  assistantMeta?.safeModeNotice !== true
);

// Copy lives in referral.triggers.<triggerId>.*; these Turkish strings are the fallbacks.
const TRIGGER_COPY: Record<string, Record<string, string>> = {
  reward_ready: {
    badge: 'Davet ödülün hazır',
    headline: 'Hoş geldin hediyen açıldı, sıradaki daveti sen gönder',
    description: 'İlk davetin tamamlandı. Şimdi aynı başlangıcı bir dostuna da ulaştırabilirsin.',
    support: 'Tek bir kişiye samimi bir not bırakman yeterli.',
    cta: 'Bir dostunu davet et',
  },
  inviter_progress: {
    badge: 'Tamamlanan davet',
    headline: 'Davetlerin sonuç veriyor',
    description: '{{n}} davetin tamamlandı. İstersen bir kişiyi daha davet edebilirsin.',
    support: 'En iyi davet, birine gerçekten iyi geleceğini hissettiğin andadır.',
    cta: 'Yeni bir davet gönder',
  },
  invite_waiting: {
    badge: 'Bekleyen davet',
    headline: 'Davetin ilk adımı bekliyor',
    description: '{{n}} kişi başlamaya yakın. Bugün kısa bir hatırlatma iyi gelebilir.',
    support: 'Baskı kurmadan, tek bir faydayı anlatan davetler daha iyi sonuç verir.',
    cta: 'Davetini aç',
  },
  weekly_reward_ready: {
    badge: 'Haftanın daveti',
    headline: 'Bu haftaki ritmini bir dostunla paylaşabilirsin',
    description: 'Davet ödülün açıldı. İyi geçen bir haftanın ardından yapılan paylaşımlar daha sıcak karşılanır.',
    support: 'Haftalık özeti kapatmadan önce bir davet linki hazırlayabilirsin.',
    cta: 'Haftanın davetini hazırla',
  },
  weekly_progress: {
    badge: 'Davetlerin',
    headline: 'Haftalık ritmini büyütmek için doğru zaman',
    descriptionWaiting: '{{n}} davet ilk adımını bekliyor. Bu haftaki ivmen yeni bir davete de taşınabilir.',
    description: '{{n}} davetin tamamlandı. İstersen bir kişiyi daha davet edebilirsin.',
    support: 'Hafta kapanışları, sakin bir davet için en uygun anlardan biridir.',
    cta: 'Bir dostunu ekle',
  },
  weekly_momentum: {
    badge: 'İyi bir hafta',
    headline: 'Bu haftaki ritmin paylaşmaya değer',
    description: 'İyi giden bir haftanın ardından tek bir kişiye yapılan davet, Huzur\'u daha doğal şekilde tanıtır.',
    support: 'Link bir kez hazırlandıktan sonra tekrar tekrar kullanabilirsin.',
    cta: 'Davet linkini hazırla',
  },
  assistant_reward_ready: {
    badge: 'Davetin hazır',
    headline: 'Bu deneyimi bir dostunla da paylaşabilirsin',
    description: 'Davet ödülün açıldı. Rehberlik işine yaradıysa bir kişiye daha önerebilirsin.',
    support: 'Birine iyi gelebileceğini düşündüğün tek bir konuya odaklanman yeterli.',
    cta: 'Davetini aç',
  },
  assistant_progress: {
    badge: 'Davetlerin',
    headline: 'Faydayı çevrene yayabilirsin',
    description: 'Davetlerin zaten sonuç veriyor. Faydalı bir cevabın hemen ardından yapılan davetler daha doğal hissettirir.',
    support: 'Kısa, yargısız ve tek bir faydaya odaklanan notlar en iyi sonucu verir.',
    cta: 'Yeni bir davet gönder',
  },
  assistant_value_moment: {
    badge: 'Faydalı bir an',
    headline: 'Bu cevap işine yaradıysa bir dostuna da yarayabilir',
    description: 'Huzur Rehberi gerçekten işine yaradığında yapılan bir davet daha samimi olur.',
    support: 'Davet metni hazırlanır; sen sadece kime göndereceğine karar verirsin.',
    cta: 'Bir dostunu davet et',
  },
};

const surfacePlan = (
  triggerId: string,
  entrySource: string,
  emphasis: SurfacePlan['emphasis'],
  n = 0,
  descriptionKey = 'description',
): SurfacePlan => {
  const copy = (field: string) =>
    String(i18n.t(`referral.triggers.${triggerId}.${field}`, { n, defaultValue: TRIGGER_COPY[triggerId][field] }));
  return {
    triggerId,
    entrySource,
    badge: copy('badge'),
    headline: copy('headline'),
    description: copy(descriptionKey),
    supportLabel: copy('support'),
    ctaLabel: copy('cta'),
    emphasis,
  };
};

const buildSurfacePlan = (basePlan: ReferralGrowthPlan | null, surface: string, weeklyStats: WeeklyStats | null | undefined, assistantMeta: AssistantMeta | null | undefined): SurfacePlan | null => {
  if (!basePlan || basePlan.riskState === 'blocked') {
    return null;
  }

  if (surface === 'home') {
    if (basePlan.inviteeRewardReady) return surfacePlan('reward_ready', 'home_referral_trigger', 'reward');
    if (basePlan.convertedCount > 0) return surfacePlan('inviter_progress', 'home_referral_trigger', 'progress', basePlan.convertedCount);
    if (basePlan.waitingCount > 0) return surfacePlan('invite_waiting', 'home_referral_trigger', 'progress', basePlan.waitingCount);
    return null;
  }

  if (surface === 'weekly_report') {
    if (basePlan.inviteeRewardReady) return surfacePlan('weekly_reward_ready', 'weekly_report_referral', 'reward');
    if (basePlan.convertedCount > 0 || basePlan.waitingCount > 0) {
      return basePlan.waitingCount > 0
        ? surfacePlan('weekly_progress', 'weekly_report_referral', 'progress', basePlan.waitingCount, 'descriptionWaiting')
        : surfacePlan('weekly_progress', 'weekly_report_referral', 'progress', basePlan.convertedCount);
    }
    if (hasWeeklyMomentum(weeklyStats)) return surfacePlan('weekly_momentum', 'weekly_report_referral', 'share');
    return null;
  }

  if (surface === 'assistant') {
    if (basePlan.inviteeRewardReady) return surfacePlan('assistant_reward_ready', 'assistant_referral', 'reward');
    if (basePlan.convertedCount > 0) return surfacePlan('assistant_progress', 'assistant_referral', 'progress');
    if (hasHelpfulAssistantMoment(assistantMeta)) return surfacePlan('assistant_value_moment', 'assistant_referral', 'share');
    return null;
  }

  return null;
};

export const buildReferralTriggerSurfacePlan = ({
  surface = 'home',
  localProgress = {},
  serverSnapshot = {},
  weeklyStats = null,
  assistantMeta = null,
  campaign = getActiveCampaign(),
}: BuildPlanOptions = {}): TriggerSurfacePlan | null => {
  const basePlan = getReferralGrowthPlan({
    localProgress,
    serverSnapshot,
    surface,
    campaign,
  });
  const surfacePlan = buildSurfacePlan(basePlan, surface, weeklyStats, assistantMeta);

  if (!surfacePlan) {
    return null;
  }

  return {
    ...surfacePlan,
    surface,
    shareVariant: basePlan.shareVariant,
    riskState: basePlan.riskState,
    campaign,
    analyticsPayload: buildReferralAnalyticsPayload(basePlan, {
      trigger_id: surfacePlan.triggerId,
      trigger_surface: surface,
      trigger_emphasis: surfacePlan.emphasis,
      weekly_active_days: normalizeCount(weeklyStats?.activeDays),
      weekly_xp_earned: normalizeCount(weeklyStats?.xpEarned),
      assistant_confidence: assistantMeta?.confidence || undefined,
      assistant_has_sources: Array.isArray(assistantMeta?.sources) && assistantMeta.sources.length > 0,
    }),
    signature: [
      surface,
      surfacePlan.triggerId,
      basePlan.signature,
      normalizeCount(weeklyStats?.activeDays),
      assistantMeta?.confidence || 'na',
    ].join(':'),
  };
};

export default {
  buildReferralTriggerSurfacePlan,
};
