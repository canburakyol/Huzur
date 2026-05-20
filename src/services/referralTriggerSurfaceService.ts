import { getActiveCampaign } from './campaignService';
import { buildReferralAnalyticsPayload, getReferralGrowthPlan, ReferralGrowthPlan } from './referralGrowthService';

interface Campaign {
  id?: string;
  region?: string;
  variant?: string;
  [key: string]: unknown;
}

interface WeeklyStats {
  activeDays?: number;
  tasksCompleted?: number;
  xpEarned?: number;
  [key: string]: unknown;
}

interface AssistantMeta {
  answered?: boolean;
  confidence?: string;
  safeModeNotice?: boolean;
  sources?: unknown[];
  [key: string]: unknown;
}

interface SurfacePlan {
  triggerId: string;
  entrySource: string;
  badge: string;
  headline: string;
  description: string;
  supportLabel: string;
  ctaLabel: string;
  emphasis: string;
}

interface TriggerSurfacePlan extends SurfacePlan {
  surface: string;
  shareVariant: string;
  riskState: string;
  campaign: Campaign | undefined;
  analyticsPayload: Record<string, unknown>;
  signature: string;
}

interface BuildPlanOptions {
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

const buildSurfacePlan = (basePlan: ReferralGrowthPlan | null, surface: string, weeklyStats: WeeklyStats | null | undefined, assistantMeta: AssistantMeta | null | undefined): SurfacePlan | null => {
  if (!basePlan || basePlan.riskState === 'blocked') {
    return null;
  }

  if (surface === 'home') {
    if (basePlan.inviteeRewardReady) {
      return {
        triggerId: 'reward_ready',
        entrySource: 'home_referral_trigger',
        badge: 'Davet halkasi hazir',
        headline: 'Starter paketin acildi, siradaki daveti sen baslat',
        description: 'Ilk davet zincirin tamamlandi. Simdi ayni sakin baslangici tek bir dosta tasiyabilirsin.',
        supportLabel: 'Tek bir kisiye samimi bir not birakman yeterli.',
        ctaLabel: 'Bir dostunu davet et',
        emphasis: 'reward',
      };
    }

    if (basePlan.convertedCount > 0) {
      return {
        triggerId: 'inviter_progress',
        entrySource: 'home_referral_trigger',
        badge: 'Donusen davet',
        headline: 'Davet halkan buyuyor',
        description: `${basePlan.convertedCount} tamamlanan davet ile Huzur etkini buyutuyorsun. Istersen ikinci halkayi da ayni sadelikle acabilirsin.`,
        supportLabel: 'En iyi davet anlari, birine gercekten iyi gelebilecegini hissettigin anlardir.',
        ctaLabel: 'Yeni bir davet baslat',
        emphasis: 'progress',
      };
    }

    if (basePlan.waitingCount > 0) {
      return {
        triggerId: 'invite_waiting',
        entrySource: 'home_referral_trigger',
        badge: 'Bekleyen akis',
        headline: 'Bir davetin ilk adimini bekliyor',
        description: `${basePlan.waitingCount} kisi ilk ritmini kurmaya yakin. Bugun bir kisiye daha sakin bir davet birakmak loopu guclendirebilir.`,
        supportLabel: 'Baski kurmadan, tek bir faydayi soyleyen davet metinleri daha iyi doner.',
        ctaLabel: 'Davetini ac',
        emphasis: 'progress',
      };
    }

    return null;
  }

  if (surface === 'weekly_report') {
    if (basePlan.inviteeRewardReady) {
      return {
        triggerId: 'weekly_reward_ready',
        entrySource: 'weekly_report_referral',
        badge: 'Haftanin daveti',
        headline: 'Bu haftaki ritmi bir dostuna da tasiyabilirsin',
        description: 'Kendi davet akisin acildi. Haftalik istikrar anindan sonra yapilan paylasimlar daha sicak bir bag kurar.',
        supportLabel: 'Haftalik ozeti kapatmadan once tek bir davet linki hazirlayabilirsin.',
        ctaLabel: 'Haftanin davetini hazirla',
        emphasis: 'reward',
      };
    }

    if (basePlan.convertedCount > 0 || basePlan.waitingCount > 0) {
      return {
        triggerId: 'weekly_progress',
        entrySource: 'weekly_report_referral',
        badge: 'Growth loop',
        headline: 'Haftalik ritmini buyutmek icin dogru andasin',
        description: basePlan.waitingCount > 0
          ? `${basePlan.waitingCount} davet ilk manevi adimini bekliyor. Bu haftaki ivme yeni bir halkayi da tasiyabilir.`
          : `${basePlan.convertedCount} davet bu hafta tamamlandi. Istersen ayni akisi bir kisi daha icin baslatabilirsin.`,
        supportLabel: 'Haftalik kapanislar, sakin ve guvenli davet anlari icin en temiz yerlerden biridir.',
        ctaLabel: 'Bir dostunu ekle',
        emphasis: 'progress',
      };
    }

    if (hasWeeklyMomentum(weeklyStats)) {
      return {
        triggerId: 'weekly_momentum',
        entrySource: 'weekly_report_referral',
        badge: 'Iyi hafta momenti',
        headline: 'Bu haftaki ritim paylasmaya deger',
        description: 'Iyi giden bir haftanin ardindan yapilan tek kisilik davet, Huzur deneyimini daha dogal sekilde yayar.',
        supportLabel: 'Hazir link bir kez olustugunda tekrar tekrar kullanabilirsin.',
        ctaLabel: 'Davet linkini hazirla',
        emphasis: 'share',
      };
    }

    return null;
  }

  if (surface === 'assistant') {
    if (basePlan.inviteeRewardReady) {
      return {
        triggerId: 'assistant_reward_ready',
        entrySource: 'assistant_referral',
        badge: 'Davet akisi hazir',
        headline: 'Bu sakin deneyimi bir dostuna da acabilirsin',
        description: 'Kendi davet akisin tamamlandi. Rehberlik faydali geldiyse ayni kapayi bir kisi daha icin aralayabilirsin.',
        supportLabel: 'Birine iyi gelebilecegini dusundugun tek bir ana odak secmen yeterli.',
        ctaLabel: 'Davet akisini ac',
        emphasis: 'reward',
      };
    }

    if (basePlan.convertedCount > 0) {
      return {
        triggerId: 'assistant_progress',
        entrySource: 'assistant_referral',
        badge: 'Davet zinciri',
        headline: 'Rehberlik momentini buyutebilirsin',
        description: 'Davet halkan zaten calisiyor. Fayda anindan hemen sonra yapilan davetler daha dogal hissedilir.',
        supportLabel: 'Kisa, yargisiz ve tek faydali notlar en iyi donusu verir.',
        ctaLabel: 'Yeni davet baslat',
        emphasis: 'progress',
      };
    }

    if (hasHelpfulAssistantMoment(assistantMeta)) {
      return {
        triggerId: 'assistant_value_moment',
        entrySource: 'assistant_referral',
        badge: 'Fayda ani',
        headline: 'Bu cevap iyi geldiyse bir dosta da kapi olabilir',
        description: 'Huzur Rehberi tam bir fayda ani yakaladiginda, tek kisilik davet daha samimi ve daha yuksek niyetli olur.',
        supportLabel: 'Davet metni hazirlanir; sadece kime gonderecegine karar verirsin.',
        ctaLabel: 'Bir dostunu davet et',
        emphasis: 'share',
      };
    }

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
