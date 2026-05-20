interface AiHealthSnapshot {
  trustScore?: number;
  sourceCount?: number;
  reviewStatus?: string;
  provider?: string;
  updatedAtIso?: string;
}

interface AiHealthSurface {
  key: string;
  label: string;
  status: 'healthy' | 'watch' | 'action';
  trustScore: number | null;
  reviewStatus: string;
  sourceCount: number;
  provider: string;
  warning: string;
  updatedAtIso: string | null;
}

interface AiHealthSummary {
  overallStatus: 'healthy' | 'watch' | 'action';
  actionCount: number;
  watchCount: number;
  averageTrust: number | null;
  surfaces: AiHealthSurface[];
  latestAiHealthAt: string | null;
}

interface HealthData {
  latestAssistantSnapshot?: AiHealthSnapshot;
  latestHomeRankingSnapshot?: AiHealthSnapshot;
  latestWeeklyInsightSnapshot?: AiHealthSnapshot;
  latestPushHintSnapshot?: AiHealthSnapshot;
  latestAiHealthAt?: string;
}

const SURFACE_LABELS: Record<string, string> = {
  latestAssistantSnapshot: 'Huzur Rehberi',
  latestHomeRankingSnapshot: 'Ana ekran sirasi',
  latestWeeklyInsightSnapshot: 'Haftalik ozet',
  latestPushHintSnapshot: 'Akilli bildirim',
};

const STATUS_ORDER: Record<string, number> = {
  healthy: 0,
  watch: 1,
  action: 2,
};

const normalizeTrustScore = (value: unknown): number | null => (
  Number.isFinite(Number(value)) ? Math.max(0, Math.min(1, Number(value))) : null
);

export const buildAiHealthSurface = (snapshotKey: string, snapshot: unknown): AiHealthSurface => {
  if (!snapshot || typeof snapshot !== 'object') {
    return {
      key: snapshotKey,
      label: SURFACE_LABELS[snapshotKey] || snapshotKey,
      status: 'watch',
      trustScore: null,
      reviewStatus: 'unreviewed',
      sourceCount: 0,
      provider: 'fallback',
      warning: 'Henüz guncel sinyal yok',
      updatedAtIso: null,
    };
  }

  const obj = snapshot as AiHealthSnapshot;
  const trustScore = normalizeTrustScore(obj.trustScore);
  const sourceCount = Number.isFinite(Number(obj.sourceCount)) ? Number(obj.sourceCount) : 0;
  const reviewStatus = typeof obj.reviewStatus === 'string' ? obj.reviewStatus : 'unreviewed';

  let status: 'healthy' | 'watch' | 'action' = 'healthy';
  let warning = '';

  if (reviewStatus === 'unreviewed' || (trustScore !== null && trustScore < 0.55)) {
    status = 'action';
    warning = 'Guven sinyali dusuk, takip etmeye deger';
  } else if (reviewStatus === 'general_guidance' || sourceCount === 0 || (trustScore !== null && trustScore < 0.72)) {
    status = 'watch';
    warning = sourceCount === 0
      ? 'Kaynak destegi sinirli'
      : 'Baglamsal izleme onerilir';
  }

  return {
    key: snapshotKey,
    label: SURFACE_LABELS[snapshotKey] || snapshotKey,
    status,
    trustScore,
    reviewStatus,
    sourceCount,
    provider: typeof obj.provider === 'string' ? obj.provider : 'fallback',
    warning,
    updatedAtIso: typeof obj.updatedAtIso === 'string' ? obj.updatedAtIso : null,
  };
};

export const buildAiHealthSummary = (health: HealthData = {}): AiHealthSummary => {
  const surfaces = [
    buildAiHealthSurface('latestAssistantSnapshot', health.latestAssistantSnapshot),
    buildAiHealthSurface('latestHomeRankingSnapshot', health.latestHomeRankingSnapshot),
    buildAiHealthSurface('latestWeeklyInsightSnapshot', health.latestWeeklyInsightSnapshot),
    buildAiHealthSurface('latestPushHintSnapshot', health.latestPushHintSnapshot),
  ];

  const overallStatus = surfaces.reduce((current, item) => (
    STATUS_ORDER[item.status] > STATUS_ORDER[current] ? item.status : current
  ), 'healthy') as 'healthy' | 'watch' | 'action';

  const actionCount = surfaces.filter((item) => item.status === 'action').length;
  const watchCount = surfaces.filter((item) => item.status === 'watch').length;
  const averageTrust = surfaces
    .map((item) => item.trustScore)
    .filter((value): value is number => value !== null)
    .reduce((sum, value, _, arr) => sum + value / arr.length, 0);

  return {
    overallStatus,
    actionCount,
    watchCount,
    averageTrust: Number.isFinite(averageTrust) ? averageTrust : null,
    surfaces,
    latestAiHealthAt: typeof health.latestAiHealthAt === 'string' ? health.latestAiHealthAt : null,
  };
};

export default {
  buildAiHealthSurface,
  buildAiHealthSummary,
};
