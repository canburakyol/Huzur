import spiritualInterventions from '../data/spiritualInterventions/index.js';

type SourceMeta = {
  confidence: string;
  origin: string;
  reviewStatus: string;
  type: string;
};

type SuggestedAction = {
  feature: string;
  id: string;
  label: string;
};

type InterventionContent = {
  greeting: string;
  coreMessage: string;
  reference: string;
  reflection: string;
};

type TriggerCondition = {
  timeOfDay: string;
  dayOfWeek: string;
  userState: string;
};

type SanitizedIntervention = {
  id: string;
  trigger_condition: TriggerCondition;
  content: InterventionContent;
  suggestedAction: string;
  resolvedAction: SuggestedAction;
  sourceMeta: {
    sourceId: string;
    label: string;
    type: string;
    reviewStatus: string;
    confidence: string;
    origin: string;
    sourceUrl: string;
  };
};

type SpiritualContext = {
  streak?: {
    current?: number;
  };
  weeklySnapshot?: {
    activeDays?: number;
  };
};

type InterventionWithTrigger = SanitizedIntervention & {
  resolvedTrigger: {
    dayOfWeek: string;
    timeOfDay: string;
    userState: string;
  };
};

type HomeRecommendation = {
  explanation: string;
  headline: string;
  socialHint: string;
  suggestedActionFeature: string | null;
  suggestedActionLabel: string;
};

type PushHint = {
  body: string;
  title: string;
};

type WeeklyInsight = {
  confidence: string;
  provider: string;
  reviewStatus: string;
  riskBand: string;
  socialHint: string;
  sourceCount: number;
  sources: Array<SanitizedIntervention['sourceMeta']>;
  summary: string;
  trustScore: number;
  weekKey: string;
};

const SOURCE_META_TEMPLATES: Record<string, SourceMeta> = {
  daily_content: {
    confidence: 'high',
    origin: 'local_curated',
    reviewStatus: 'reviewed',
    type: 'daily_content'
  },
  daily_dua: {
    confidence: 'high',
    origin: 'local_curated',
    reviewStatus: 'reviewed',
    type: 'daily_dua'
  },
  hadith: {
    confidence: 'medium',
    origin: 'local_curated',
    reviewStatus: 'reviewed',
    type: 'hadith'
  },
  general_islamic_guidance: {
    confidence: 'low',
    origin: 'policy',
    reviewStatus: 'general_guidance',
    type: 'general_islamic_guidance'
  }
};

const TRUST_SCORE_BY_CONFIDENCE: Record<string, number> = {
  high: 0.86,
  low: 0.32,
  medium: 0.72
};

const ACTION_MAP: Record<string, SuggestedAction> = {
  do_zikir: {
    feature: 'zikirmatik',
    id: 'do_zikir',
    label: 'Zikre gec'
  },
  open_quran: {
    feature: 'quran',
    id: 'open_quran',
    label: "Kur'an'a git"
  },
  play_huzur_audio: {
    feature: 'library',
    id: 'play_huzur_audio',
    label: 'Huzur seslerini ac'
  }
};

const DEFAULT_CONTENT: InterventionContent = {
  greeting: 'Bugun kalbine iyi gelebilecek kucuk bir durak var.',
  coreMessage: '',
  reference: '',
  reflection: 'Kucuk ama duzenli bir manevi temas, gunun ritmini yumusatabilir.'
};

const getSourceTemplate = (sourceType: string = 'general_islamic_guidance'): SourceMeta => (
  SOURCE_META_TEMPLATES[sourceType] || SOURCE_META_TEMPLATES.general_islamic_guidance
);

const truncate = (value: string | undefined, maxLength: number): string => {
  const normalized = String(value || '').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
};

export const getCurrentSpiritualTimeOfDay = (date: Date = new Date()): string => {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) {
    return 'morning';
  }

  if (hour >= 11 && hour < 14) {
    return 'noon';
  }

  if (hour >= 14 && hour < 18) {
    return 'afternoon';
  }

  if (hour >= 18 && hour < 22) {
    return 'evening';
  }

  if (hour >= 22 || hour < 3) {
    return 'night';
  }

  return 'late_night';
};

export const deriveSpiritualUserState = (context: SpiritualContext = {}): string => {
  const currentStreak = Number(context?.streak?.current) || 0;
  const activeDays = Number(context?.weeklySnapshot?.activeDays) || 0;

  if (currentStreak <= 2 || activeDays <= 2) {
    return 'low_iman_streak';
  }

  if (currentStreak >= 5 && activeDays >= 4) {
    return 'steady';
  }

  return 'stressed';
};

const normalizeDayOfWeek = (date: Date = new Date()): string => (
  date.getDay() === 5 ? 'friday' : 'any'
);

const sanitizeIntervention = (entry: Record<string, unknown> = {}, index: number = 0): SanitizedIntervention => {
  const action = ACTION_MAP[entry?.suggestedAction as string] || ACTION_MAP.do_zikir;
  const sourceTemplate = getSourceTemplate(entry?.sourceType as string);
  const content = {
    ...DEFAULT_CONTENT,
    ...(entry?.content && typeof entry.content === 'object' ? entry.content as InterventionContent : {})
  };

  const interventionId = String(entry?.id || `spiritual_intervention_${index + 1}`);

  return {
    id: interventionId,
    trigger_condition: {
      timeOfDay: String(entry?.trigger_condition?.timeOfDay || 'morning'),
      dayOfWeek: String(entry?.trigger_condition?.dayOfWeek || 'any'),
      userState: String(entry?.trigger_condition?.userState || 'steady')
    },
    content: {
      greeting: String(content.greeting || DEFAULT_CONTENT.greeting),
      coreMessage: String(content.coreMessage || DEFAULT_CONTENT.coreMessage),
      reference: String(content.reference || DEFAULT_CONTENT.reference),
      reflection: String(content.reflection || DEFAULT_CONTENT.reflection)
    },
    suggestedAction: action.id,
    resolvedAction: action,
    sourceMeta: {
      sourceId: String(entry?.sourceId || `spiritual_intervention:${interventionId}`).slice(0, 120),
      label: String(content.reference || content.greeting || 'Spiritual intervention').slice(0, 120),
      type: String(sourceTemplate.type).slice(0, 40),
      reviewStatus: String(entry?.reviewStatus || sourceTemplate.reviewStatus),
      confidence: String(entry?.confidence || sourceTemplate.confidence),
      origin: String(entry?.origin || sourceTemplate.origin).slice(0, 60),
      sourceUrl: typeof entry?.sourceUrl === 'string' ? entry.sourceUrl : ''
    }
  };
};

const SANITIZED_INTERVENTIONS: SanitizedIntervention[] = (spiritualInterventions as Record<string, unknown>[]).map(sanitizeIntervention);

const computeSeed = ({ context = {}, now = new Date() }: {
  context?: SpiritualContext;
  now?: Date;
} = {}): number => {
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const currentStreak = Number(context?.streak?.current) || 0;
  const activeDays = Number(context?.weeklySnapshot?.activeDays) || 0;

  return Math.max(0, dayOfYear + currentStreak + activeDays);
};

const pickDeterministicMatch = (items: SanitizedIntervention[] | null, seed: number): SanitizedIntervention | null => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return items[seed % items.length];
};

export const getSpiritualIntervention = ({ context = {}, now = new Date() }: {
  context?: SpiritualContext;
  now?: Date;
} = {}): InterventionWithTrigger | null => {
  const timeOfDay = getCurrentSpiritualTimeOfDay(now);
  const dayOfWeek = normalizeDayOfWeek(now);
  const userState = deriveSpiritualUserState(context);
  const seed = computeSeed({ context, now });

  const exactMatches = SANITIZED_INTERVENTIONS.filter((item) => (
    item.trigger_condition.timeOfDay === timeOfDay &&
    item.trigger_condition.userState === userState &&
    (item.trigger_condition.dayOfWeek === dayOfWeek || item.trigger_condition.dayOfWeek === 'any')
  ));

  const relaxedMatches = SANITIZED_INTERVENTIONS.filter((item) => (
    item.trigger_condition.timeOfDay === timeOfDay &&
    (item.trigger_condition.dayOfWeek === dayOfWeek || item.trigger_condition.dayOfWeek === 'any')
  ));

  const selected = pickDeterministicMatch(exactMatches, seed) || pickDeterministicMatch(relaxedMatches, seed);

  if (!selected) {
    return null;
  }

  return {
    ...selected,
    resolvedTrigger: {
      dayOfWeek,
      timeOfDay,
      userState
    }
  };
};

export const buildHomeRecommendationFromIntervention = (
  intervention: InterventionWithTrigger | null,
  { fallbackExplanation = '', fallbackHeadline = '', fallbackSocialHint = '' }: {
    fallbackExplanation?: string;
    fallbackHeadline?: string;
    fallbackSocialHint?: string;
  } = {}
): HomeRecommendation => {
  if (!intervention) {
    return {
      explanation: fallbackExplanation,
      headline: fallbackHeadline,
      socialHint: fallbackSocialHint,
      suggestedActionFeature: null,
      suggestedActionLabel: ''
    };
  }

  const actionLabel = intervention.resolvedAction?.label || '';

  return {
    headline: intervention.content.greeting,
    explanation: intervention.content.reflection || fallbackExplanation,
    socialHint: fallbackSocialHint || (actionLabel ? `${actionLabel} ile devam edebilirsin.` : ''),
    suggestedActionFeature: intervention.resolvedAction?.feature || null,
    suggestedActionLabel: actionLabel
  };
};

export const buildPushHintFromIntervention = (
  intervention: InterventionWithTrigger | null,
  { fallbackBody = '', fallbackTitle = '' }: {
    fallbackBody?: string;
    fallbackTitle?: string;
  } = {}
): PushHint => {
  if (!intervention) {
    return {
      body: fallbackBody,
      title: fallbackTitle
    };
  }

  return {
    body: truncate(intervention.content.reflection || fallbackBody, 132),
    title: truncate(intervention.content.greeting || fallbackTitle, 52)
  };
};

export const buildWeeklyInsightFallback = ({ context = {}, weekKey = '', now = new Date() }: {
  context?: SpiritualContext;
  weekKey?: string;
  now?: Date;
} = {}): WeeklyInsight | null => {
  const intervention = getSpiritualIntervention({ context, now });

  if (!intervention) {
    return null;
  }

  const reviewStatus = intervention.sourceMeta?.reviewStatus || 'general_guidance';
  const confidence = intervention.sourceMeta?.confidence || 'low';
  const trustScore = TRUST_SCORE_BY_CONFIDENCE[confidence] || TRUST_SCORE_BY_CONFIDENCE.low;

  return {
    confidence,
    provider: reviewStatus === 'reviewed'
      ? 'local_spiritual_reviewed'
      : 'local_spiritual_seed',
    reviewStatus,
    riskBand: intervention.resolvedTrigger?.userState === 'steady' ? 'steady' : 'watch',
    socialHint: intervention.resolvedAction?.label
      ? `${intervention.content.reflection} ${intervention.resolvedAction.label} ile kucuk bir adim atabilirsin.`
      : intervention.content.reflection,
    sourceCount: 1,
    sources: [intervention.sourceMeta],
    summary: intervention.content.reflection,
    trustScore,
    weekKey
  };
};

export default {
  buildHomeRecommendationFromIntervention,
  buildPushHintFromIntervention,
  buildWeeklyInsightFallback,
  deriveSpiritualUserState,
  getCurrentSpiritualTimeOfDay,
  getSpiritualIntervention
};
