const SURFACE_LABELS = {
  latestAssistantSnapshot: 'Huzur Rehberi',
  latestHomeRankingSnapshot: 'Ana ekran sirasi',
  latestWeeklyInsightSnapshot: 'Haftalik ozet',
  latestPushHintSnapshot: 'Akilli bildirim',
};

const STATUS_ORDER = {
  healthy: 0,
  watch: 1,
  action: 2,
};

const normalizeTrustScore = (value) => (
  Number.isFinite(Number(value)) ? Math.max(0, Math.min(1, Number(value))) : null
);

export const buildAiHealthSurface = (snapshotKey, snapshot) => {
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
    };
  }

  const trustScore = normalizeTrustScore(snapshot.trustScore);
  const sourceCount = Number.isFinite(Number(snapshot.sourceCount)) ? Number(snapshot.sourceCount) : 0;
  const reviewStatus = typeof snapshot.reviewStatus === 'string' ? snapshot.reviewStatus : 'unreviewed';

  let status = 'healthy';
  let warning = '';

  if (reviewStatus === 'unreviewed' || trustScore !== null && trustScore < 0.55) {
    status = 'action';
    warning = 'Guven sinyali dusuk, takip etmeye deger';
  } else if (reviewStatus === 'general_guidance' || sourceCount === 0 || trustScore !== null && trustScore < 0.72) {
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
    provider: typeof snapshot.provider === 'string' ? snapshot.provider : 'fallback',
    warning,
    updatedAtIso: typeof snapshot.updatedAtIso === 'string' ? snapshot.updatedAtIso : null,
  };
};

export const buildAiHealthSummary = (health = {}) => {
  const surfaces = [
    buildAiHealthSurface('latestAssistantSnapshot', health.latestAssistantSnapshot),
    buildAiHealthSurface('latestHomeRankingSnapshot', health.latestHomeRankingSnapshot),
    buildAiHealthSurface('latestWeeklyInsightSnapshot', health.latestWeeklyInsightSnapshot),
    buildAiHealthSurface('latestPushHintSnapshot', health.latestPushHintSnapshot),
  ];

  const overallStatus = surfaces.reduce((current, item) => (
    STATUS_ORDER[item.status] > STATUS_ORDER[current] ? item.status : current
  ), 'healthy');

  const actionCount = surfaces.filter((item) => item.status === 'action').length;
  const watchCount = surfaces.filter((item) => item.status === 'watch').length;
  const averageTrust = surfaces
    .map((item) => item.trustScore)
    .filter((value) => value !== null)
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
