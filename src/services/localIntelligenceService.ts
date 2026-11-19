import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { storageService } from './storageService';
import { logger } from '../utils/logger';
import {
  buildHomeRecommendationFromIntervention,
  buildPushHintFromIntervention,
  getSpiritualIntervention
} from './spiritualInterventionService';

type SlotName = 'morning' | 'afternoon' | 'evening' | 'night';
type CandidateId = 'dailyQuests' | 'dailyDiscovery' | 'dailyContent' | 'featureGrid' | 'familyMomentum' | 'stories';
type RiskBand = 'comeback' | 'at_risk' | 'steady' | 'growing';

type LocalIntelligenceState = {
  moduleExposureCounts: Record<string, number>;
  slotUsage: Record<SlotName, number>;
  hintUsage: Record<string, number>;
  lastTopModule: string | null;
  lastHintType: string | null;
  lastRankedAt: string | null;
  updatedAt: string | null;
};

type RankingContext = {
  primaryGoal?: string;
  activityPattern?: Record<string, number>;
  lastFeature?: string;
  social?: {
    family?: boolean;
    familyWeeklyGoal?: {
      currentValue?: number;
      targetValue?: number;
    };
  };
  streak?: {
    current?: number;
    quranCount?: number;
  };
  weeklySnapshot?: {
    activeDays?: number;
  };
  dailyContent?: {
    campaignId?: string;
  };
  prayer?: {
    nextPrayerLabel?: string;
    nextPrayer?: string;
  };
};

type RankingCandidate = {
  id: string;
};

type HomeRankingResult = {
  provider: string;
  headline: string;
  explanation: string;
  socialHint: string;
  suggestedActionFeature?: string | null;
  suggestedActionLabel?: string;
  rankedModules: string[];
  riskBand: RiskBand;
};

type PushHintResult = {
  title: string;
  body: string;
  provider: string;
  reason: string;
};

const LOCAL_INTELLIGENCE_KEY = 'huzur_local_intelligence_v1';
const LAST_FEATURE_KEY = 'huzur_last_feature';

const DEFAULT_STATE: LocalIntelligenceState = Object.freeze({
  moduleExposureCounts: {},
  slotUsage: {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  },
  hintUsage: {},
  lastTopModule: null,
  lastHintType: null,
  lastRankedAt: null,
  updatedAt: null,
});

const SLOT_WEIGHTS: Record<SlotName, Partial<Record<CandidateId, number>>> = {
  morning: {
    dailyQuests: 20,
    dailyDiscovery: 14,
    dailyContent: 10,
    featureGrid: 8,
    familyMomentum: 6,
    stories: 2,
  },
  afternoon: {
    dailyDiscovery: 22,
    dailyContent: 16,
    featureGrid: 12,
    dailyQuests: 11,
    familyMomentum: 8,
    stories: 4,
  },
  evening: {
    dailyQuests: 18,
    familyMomentum: 18,
    dailyContent: 14,
    featureGrid: 10,
    stories: 8,
    dailyDiscovery: 7,
  },
  night: {
    stories: 18,
    dailyContent: 14,
    familyMomentum: 12,
    dailyDiscovery: 10,
    dailyQuests: 8,
    featureGrid: 6,
  },
};

const GOAL_WEIGHTS: Record<string, Partial<Record<CandidateId, number>>> = {
  family_consistency: {
    familyMomentum: 30,
    dailyQuests: 14,
    featureGrid: 6,
  },
  quran_learning: {
    dailyDiscovery: 26,
    dailyContent: 18,
    stories: 8,
  },
  default: {
    dailyQuests: 20,
    featureGrid: 12,
    dailyContent: 10,
  },
};

const FEATURE_TO_MODULE: Record<string, CandidateId> = {
  family: 'familyMomentum',
  hatim: 'familyMomentum',
  quran: 'dailyDiscovery',
  zikirmatik: 'dailyQuests',
  tasks: 'dailyQuests',
  assistant: 'stories',
};

let cachedState: LocalIntelligenceState = {
  ...DEFAULT_STATE,
  slotUsage: { ...DEFAULT_STATE.slotUsage },
};
let hydrated = false;

const normalizeState = (value: Partial<LocalIntelligenceState> = {}): LocalIntelligenceState => ({
  moduleExposureCounts: value?.moduleExposureCounts && typeof value.moduleExposureCounts === 'object'
    ? value.moduleExposureCounts
    : {},
  slotUsage: {
    ...DEFAULT_STATE.slotUsage,
    ...(value?.slotUsage && typeof value.slotUsage === 'object' ? value.slotUsage : {}),
  },
  hintUsage: value?.hintUsage && typeof value.hintUsage === 'object' ? value.hintUsage : {},
  lastTopModule: typeof value?.lastTopModule === 'string' ? value.lastTopModule : null,
  lastHintType: typeof value?.lastHintType === 'string' ? value.lastHintType : null,
  lastRankedAt: value?.lastRankedAt || null,
  updatedAt: value?.updatedAt || null,
});

let hasPendingChanges = false;
let persistTimeout: any = null;
const isTest = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || typeof (globalThis as unknown as Record<string, unknown>).it === 'function');

const forcePersistState = async (): Promise<void> => {
  if (!hasPendingChanges) return;
  hasPendingChanges = false;
  try {
    await Preferences.set({
      key: LOCAL_INTELLIGENCE_KEY,
      value: JSON.stringify(cachedState),
    });
  } catch (error) {
    logger.warn('[LocalIntelligence] Failed to persist state', error);
  }
};

const persistStateDebounced = (): void => {
  hasPendingChanges = true;
  if (isTest) {
    void forcePersistState();
    return;
  }
  if (persistTimeout) {
    return;
  }
  persistTimeout = setTimeout(async () => {
    persistTimeout = null;
    await forcePersistState();
  }, 300000);
};

try {
  App.addListener('appStateChange', (state) => {
    if (!state.isActive && hasPendingChanges) {
      if (persistTimeout) {
        clearTimeout(persistTimeout);
        persistTimeout = null;
      }
      void forcePersistState();
    }
  });
} catch (error) {
  logger.debug('[LocalIntelligence] App state listener not registered', error);
}

if (typeof window !== 'undefined') {
  const handleUnload = () => {
    if (hasPendingChanges) {
      void forcePersistState();
    }
  };
  window.addEventListener('beforeunload', handleUnload);
  window.addEventListener('pagehide', handleUnload);
}

export const hydrateLocalIntelligenceState = async (): Promise<LocalIntelligenceState> => {
  if (hydrated) {
    return cachedState;
  }

  try {
    const { value } = await Preferences.get({ key: LOCAL_INTELLIGENCE_KEY });
    cachedState = normalizeState(value ? JSON.parse(value) : DEFAULT_STATE);
  } catch (error) {
    logger.warn('[LocalIntelligence] Failed to hydrate state', error);
    cachedState = normalizeState(DEFAULT_STATE);
  }

  hydrated = true;
  return cachedState;
};

const updateCachedState = (updater: ((state: LocalIntelligenceState) => LocalIntelligenceState) | LocalIntelligenceState): LocalIntelligenceState => {
  const next = typeof updater === 'function' ? updater(cachedState) : updater;
  cachedState = normalizeState(next);
  persistStateDebounced();
  return cachedState;
};

const getCurrentSlot = (date: Date = new Date()): SlotName => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

const getMostActiveSlot = (pattern: Record<string, number> = {}): SlotName => {
  const ranked = Object.entries({
    morning: Number(pattern?.morning) || 0,
    afternoon: Number(pattern?.afternoon) || 0,
    evening: Number(pattern?.evening) || 0,
  }).sort((left, right) => right[1] - left[1]);

  return (ranked[0]?.[0] as SlotName) || 'morning';
};

const deriveRiskBand = (context: RankingContext = {}): RiskBand => {
  const streak = Number(context?.streak?.current) || 0;
  const activeDays = Number(context?.weeklySnapshot?.activeDays) || 0;

  if (streak <= 0 && activeDays <= 1) {
    return 'comeback';
  }

  if (streak <= 2 || activeDays <= 2) {
    return 'at_risk';
  }

  if (streak >= 7 && activeDays >= 4) {
    return 'growing';
  }

  return 'steady';
};

const getGoalWeights = (primaryGoal?: string): Partial<Record<CandidateId, number>> => {
  if (primaryGoal && GOAL_WEIGHTS[primaryGoal]) {
    return GOAL_WEIGHTS[primaryGoal];
  }

  return GOAL_WEIGHTS.default;
};

const scoreCandidate = ({ candidateId, context = {}, slot, state, riskBand }: {
  candidateId: CandidateId;
  context: RankingContext;
  slot: SlotName;
  state: LocalIntelligenceState;
  riskBand: RiskBand;
}): number => {
  let score = 10;
  score += SLOT_WEIGHTS[slot]?.[candidateId] || 0;
  score += getGoalWeights(context?.primaryGoal)?.[candidateId] || 0;

  const preferredSlot = getMostActiveSlot(context?.activityPattern);
  if (preferredSlot === slot) {
    score += 6;
  }

  const lastFeature = context?.lastFeature || storageService.getItem(LAST_FEATURE_KEY, null);
  if (FEATURE_TO_MODULE[lastFeature as string] === candidateId) {
    score += 16;
  }

  if (candidateId === 'familyMomentum') {
    score += context?.social?.family ? 14 : -28;
  }

  if (candidateId === 'dailyContent' && context?.dailyContent?.campaignId) {
    score += 10;
  }

  if (candidateId === 'dailyDiscovery' && (Number(context?.streak?.quranCount) || 0) > 0) {
    score += 10;
  }

  if (candidateId === 'dailyQuests' && ['at_risk', 'comeback'].includes(riskBand)) {
    score += 16;
  }

  if (candidateId === 'stories' && slot === 'night') {
    score += 8;
  }

  if (candidateId === 'featureGrid' && (Number(context?.weeklySnapshot?.activeDays) || 0) >= 4) {
    score += 8;
  }

  const exposureCount = Math.min(Number(state?.moduleExposureCounts?.[candidateId]) || 0, 4);
  score -= exposureCount * 2;

  if (state?.lastTopModule === candidateId) {
    score -= 6;
  }

  return score;
};

const buildHeadline = (topModule: string | null, riskBand: RiskBand): string => {
  if (riskBand === 'comeback') {
    return 'Bugün geri dönüşü kolaylaştıracak modülleri öne aldık';
  }

  if (riskBand === 'at_risk') {
    return 'Ritmi koruman için en hafif girişleri üstte tuttuk';
  }

  const titles: Record<string, string> = {
    familyMomentum: 'Aile ritmini destekleyecek akışları üstte tuttuk',
    dailyQuests: 'Bugün istikrarını koruyacak görevleri öne aldık',
    featureGrid: 'Şu an en hızlı ulaşılacak araçları üstte tuttuk',
    dailyDiscovery: 'Keşif ve Kuran odağını öne aldık',
    dailyContent: 'Günlük içerik blokları şu an senin ritmine daha uygun',
    stories: 'Daha sakin ve akıcı bir akışı üstte tuttuk',
  };

  return titles[topModule ?? ''] || 'Ana ekran cihaz içinde yerel olarak yeniden sıralandı';
};

const buildExplanation = (topModule: string | null, context: RankingContext = {}, slot: SlotName): string => {
  const streak = Number(context?.streak?.current) || 0;
  const activeDays = Number(context?.weeklySnapshot?.activeDays) || 0;
  const slotCopy: Record<SlotName, string> = {
    morning: 'sabah rutini',
    afternoon: 'öğle ritmi',
    evening: 'akşam akışı',
    night: 'gece sakinliği',
  };

  const specificCopy: Record<string, string> = {
    familyMomentum: 'Aile hedefleri ve birlikte istikrar sinyalleri bu kartı yukarı taşıdı.',
    dailyQuests: 'Kısa, tamamlanabilir adımlar bugün seni daha hızlı tekrar ritme sokar.',
    featureGrid: 'Son kullanım alışkanlıkların hızlı erişim odağını güçlendiriyor.',
    dailyDiscovery: 'Kuran ve keşif sinyalleri bu saatte daha yüksek puan aldı.',
    dailyContent: 'Günlük içerik ve kampanya bağlamı bu kartı destekledi.',
    stories: 'Akşam ve gece saatlerinde daha yumuşak tüketim akışları öne çıkıyor.',
  };

  return `${slotCopy[slot] || 'bugünkü'} ile son 7 gündeki ${activeDays} aktif gün ve ${streak} günlük seri birlikte değerlendirildi. ${specificCopy[topModule ?? ''] || 'Yerel sinyaller bu sıralamayı oluşturdu.'}`;
};

const buildSocialHint = (context: RankingContext = {}, topModule: string | null): string => {
  const familyGoal = context?.social?.familyWeeklyGoal;

  if (context?.social?.family && familyGoal && topModule !== 'familyMomentum') {
    const currentValue = Number(familyGoal.currentValue) || 0;
    const targetValue = Number(familyGoal.targetValue) || 0;
    return `Aile hedefinde ${currentValue}/${targetValue} ilerleme var; uygun olduğunda aile alanına dönmek ritmi destekler.`;
  }

  if (context?.social?.family && topModule === 'familyMomentum') {
    return 'Aile bağlamı bugünlük motivasyonu yukarı çekiyor.';
  }

  return '';
};

const buildFallbackRanking = (candidates: RankingCandidate[] = []): HomeRankingResult => ({
  provider: 'local_fallback',
  headline: 'Ana ekran yerelde sıralanıyor',
  explanation: 'Bulut çağrı yok. Sıra, saat ve alışkanlık sayaçları cihaz içinde hesaplandı.',
  socialHint: '',
  rankedModules: Array.isArray(candidates) ? candidates.map((candidate) => candidate.id).filter(Boolean) : [],
  riskBand: 'steady',
});

export const getLocalHomeRanking = async ({ context = {}, candidates = [] }: {
  context?: RankingContext;
  candidates?: RankingCandidate[];
} = {}): Promise<HomeRankingResult> => {
  await hydrateLocalIntelligenceState();

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return buildFallbackRanking(candidates);
  }

  const slot = getCurrentSlot();
  const riskBand = deriveRiskBand(context);
  const scored = candidates
    .map((candidate) => ({
      id: candidate?.id,
      score: scoreCandidate({
        candidateId: candidate?.id as CandidateId,
        context,
        slot,
        state: cachedState,
        riskBand,
      }),
    }))
    .filter((entry) => typeof entry.id === 'string')
    .sort((left, right) => right.score - left.score);

  const rankedModules = scored.map((entry) => entry.id);
  const topModule = rankedModules[0] || candidates[0]?.id || null;
  const spiritualIntervention = getSpiritualIntervention({ context });
  const fallbackSocialHint = buildSocialHint(context, topModule);
  const homeRecommendation = buildHomeRecommendationFromIntervention(spiritualIntervention, {
    fallbackExplanation: buildExplanation(topModule, context, slot),
    fallbackHeadline: buildHeadline(topModule, riskBand),
    fallbackSocialHint
  });

  updateCachedState((previous) => ({
    ...previous,
    slotUsage: {
      ...previous.slotUsage,
      [slot]: (Number(previous.slotUsage?.[slot]) || 0) + 1,
    },
    moduleExposureCounts: topModule
      ? {
          ...previous.moduleExposureCounts,
          [topModule]: (Number(previous.moduleExposureCounts?.[topModule]) || 0) + 1,
        }
      : previous.moduleExposureCounts,
    lastTopModule: topModule,
    lastRankedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  return {
    provider: spiritualIntervention?.sourceMeta?.reviewStatus === 'reviewed'
      ? 'local_spiritual_reviewed'
      : (spiritualIntervention ? 'local_spiritual_seed' : 'local_preferences'),
    headline: homeRecommendation.headline,
    explanation: homeRecommendation.explanation,
    socialHint: homeRecommendation.socialHint,
    suggestedActionFeature: homeRecommendation.suggestedActionFeature,
    suggestedActionLabel: homeRecommendation.suggestedActionLabel,
    rankedModules,
    riskBand,
  };
};

const buildPushTitle = ({ type, fallbackTitle, nextPrayerLabel }: {
  type: string;
  fallbackTitle: string;
  nextPrayerLabel: string;
}): string => {
  if (fallbackTitle) {
    return fallbackTitle;
  }

  const titles: Record<string, string> = {
    prayer_pre: `${nextPrayerLabel} için sakin bir hazırlık`,
    prayer_main: `${nextPrayerLabel} vakti yaklaşıyor`,
    reminder: 'Bugün tek bir manevi mola yeter',
  };

  return titles[type] || 'Huzur sana göre zamanlandı';
};

const buildPushBody = ({ type, slot, riskBand, preferredSlot, lastFeature, fallbackBody }: {
  type: string;
  slot: SlotName;
  riskBand: RiskBand;
  preferredSlot: SlotName;
  lastFeature: string | null;
  fallbackBody: string;
}): string => {
  if (fallbackBody) {
    return fallbackBody;
  }

  if (type === 'prayer_pre') {
    return 'Bildirim saati, son açılış saatlerin ve vakit akışı cihaz içinde eşleştirilerek seçildi.';
  }

  if (type === 'prayer_main') {
    return riskBand === 'comeback'
      ? 'Ritmi zorlamadan yeniden kurmak için bu vakti yumuşak bir giriş olarak öne aldık.'
      : 'Son alışkanlık ritmine göre bu vakitte dönüş ihtimali daha yüksek görünüyor.';
  }

  if (lastFeature === 'quran') {
    return 'Kısa bir Kuran molası bugünkü ritmini toparlamaya yardım edebilir.';
  }

  if (preferredSlot === slot) {
    return 'Bu saat, son günlerde en tutarlı dönüş yaptığın zaman aralığına yakın.';
  }

  return riskBand === 'at_risk'
    ? 'Bugün ritmi korumak için en hafif hatırlatmayı seçtik.'
    : 'Hatırlatma metni son kullanım desenlerine göre cihaz içinde oluşturuldu.';
};

export const getLocalPushHint = async ({
  type = 'reminder',
  context = {},
  fallbackTitle = '',
  fallbackBody = '',
}: {
  type?: string;
  context?: RankingContext;
  fallbackTitle?: string;
  fallbackBody?: string;
} = {}): Promise<PushHintResult> => {
  await hydrateLocalIntelligenceState();

  const slot = getCurrentSlot();
  const riskBand = deriveRiskBand(context);
  const preferredSlot = getMostActiveSlot(context?.activityPattern);
  const nextPrayerLabel = context?.prayer?.nextPrayerLabel || context?.prayer?.nextPrayer || 'Bir sonraki vakit';
  const lastFeature = context?.lastFeature || storageService.getItem(LAST_FEATURE_KEY, null);
  const spiritualIntervention = type === 'reminder'
    ? getSpiritualIntervention({ context })
    : null;
  const interventionCopy = buildPushHintFromIntervention(spiritualIntervention, {
    fallbackBody,
    fallbackTitle
  });

  updateCachedState((previous) => ({
    ...previous,
    hintUsage: {
      ...previous.hintUsage,
      [type]: (Number(previous.hintUsage?.[type]) || 0) + 1,
    },
    lastHintType: type,
    updatedAt: new Date().toISOString(),
  }));

  return {
    title: type === 'reminder'
      ? interventionCopy.title
      : buildPushTitle({ type, fallbackTitle, nextPrayerLabel }),
    body: type === 'reminder'
      ? interventionCopy.body
      : buildPushBody({ type, slot, riskBand, preferredSlot, lastFeature, fallbackBody }),
    provider: spiritualIntervention?.sourceMeta?.reviewStatus === 'reviewed'
      ? 'local_spiritual_reviewed'
      : (spiritualIntervention ? 'local_spiritual_seed' : 'local_preferences'),
    reason: `${slot}_${riskBand}`,
  };
};

export default {
  hydrateLocalIntelligenceState,
  getLocalHomeRanking,
  getLocalPushHint,
};
