interface Decision {
  key: string;
  label: string;
  tone: string;
  summary: string;
}

interface ReleaseReadiness {
  status?: string;
  checks?: Array<{ status: string; label: string; detail: string }>;
}

interface RolloutGate {
  recommendation?: string;
}

interface GlobalStatus {
  status?: string;
  recommendedAction?: string;
}

interface IncidentSummary {
  latestIncident?: { kind: string; stage: string };
  last24hCount?: number;
}

interface HealthSummary {
  averageTrust?: number | null;
  actionCount?: number;
  watchCount?: number;
}

interface OpsChecklist {
  operatorActions?: string[];
}

interface AiReleaseBriefResult extends Decision {
  enabledFlagCount: number;
  totalFlagCount: number;
  averageTrust: number | null;
  actionCount: number;
  watchCount: number;
  incident24hCount: number;
  globalStatus: string;
  risks: string[];
  nextSteps: string[];
}

interface BuildBriefOptions {
  healthSummary?: HealthSummary | null;
  rolloutGate?: RolloutGate | null;
  releaseReadiness?: ReleaseReadiness | null;
  opsChecklist?: OpsChecklist | null;
  incidentSummary?: IncidentSummary | null;
  globalStatus?: GlobalStatus | null;
  flags?: Record<string, boolean>;
}

const mapDecision = (releaseReadiness: ReleaseReadiness | null, rolloutGate: RolloutGate | null, globalStatus: GlobalStatus | null): Decision => {
  if (globalStatus?.status === 'critical') {
    return {
      key: 'no_ship',
      label: 'Beklet',
      tone: 'critical',
      summary: globalStatus.recommendedAction || 'Global release health kritik; yeni rollout acma.',
    };
  }

  if (releaseReadiness?.status === 'blocked' || rolloutGate?.recommendation === 'hold') {
    return {
      key: 'no_ship',
      label: 'Beklet',
      tone: 'critical',
      summary: 'Yeni rollout acmadan once kritik AI sinyallerini temizle.',
    };
  }

  if (
    globalStatus?.status === 'watch'
    || releaseReadiness?.status === 'monitor'
    || rolloutGate?.recommendation === 'cautious'
  ) {
    return {
      key: 'staged',
      label: 'Kademeli devam et',
      tone: 'watch',
      summary: 'Release mumkun, ancak smoke ve canli log izlemesi zorunlu.',
    };
  }

  return {
    key: 'ship',
    label: 'Devam et',
    tone: 'healthy',
    summary: 'AI katmani ship icin saglam gorunuyor; standart gozlemle devam et.',
  };
};

const buildRiskList = (releaseReadiness: ReleaseReadiness | null, incidentSummary: IncidentSummary | null, opsChecklist: OpsChecklist | null, globalStatus: GlobalStatus | null): string[] => {
  const risks: string[] = [];

  if (globalStatus?.status && globalStatus.status !== 'healthy') {
    risks.push(`Global AI durumu: ${globalStatus.recommendedAction || globalStatus.status}`);
  }

  (releaseReadiness?.checks || [])
    .filter((check) => check.status !== 'pass')
    .slice(0, 2)
    .forEach((check) => {
      risks.push(`${check.label}: ${check.detail}`);
    });

  if (incidentSummary?.latestIncident) {
    risks.push(
      `Son incident: ${incidentSummary.latestIncident.kind} / ${incidentSummary.latestIncident.stage}`
    );
  }

  (opsChecklist?.operatorActions || []).slice(0, 2).forEach((action) => {
    risks.push(action);
  });

  return [...new Set(risks)].slice(0, 4);
};

export const buildAiReleaseBrief = ({
  healthSummary = null,
  rolloutGate = null,
  releaseReadiness = null,
  opsChecklist = null,
  incidentSummary = null,
  globalStatus = null,
  flags = {},
}: BuildBriefOptions = {}): AiReleaseBriefResult => {
  const decision = mapDecision(releaseReadiness, rolloutGate, globalStatus);
  const enabledFlagCount = Object.values(flags || {}).filter((value) => value === true).length;
  const totalFlagCount = Object.keys(flags || {}).length;
  const risks = buildRiskList(releaseReadiness, incidentSummary, opsChecklist, globalStatus);

  const nextSteps = decision.key === 'no_ship'
    ? [
        'Kritik incident veya action bandindeki yuzeyleri kapat.',
        'Assistant, Home, Weekly ve Push smoke setini yeniden kos.',
        'Firebase loglari ve snapshot tazeligini yeniden dogrula.',
      ]
    : decision.key === 'staged'
      ? [
          'Rolloutu kademeli tut ve ilk 24 saat incident trendini izle.',
          'Watch bandindeki yuzeyleri cihaz smoke testiyle dogrula.',
          'Fallback ve trust eventlerinde sivrilme var mi kontrol et.',
        ]
      : [
          'Flag kapsamini koru ve standart release akisina devam et.',
          'Ilk 24 saat AI trust ve fallback trendini izle.',
          'Haftalik ozet ve push hint snapshotlarinin taze kaldigini dogrula.',
        ];

  return {
    ...decision,
    enabledFlagCount,
    totalFlagCount,
    averageTrust: healthSummary?.averageTrust ?? null,
    actionCount: Number(healthSummary?.actionCount) || 0,
    watchCount: Number(healthSummary?.watchCount) || 0,
    incident24hCount: Number(incidentSummary?.last24hCount) || 0,
    globalStatus: globalStatus?.status || 'watch',
    risks,
    nextSteps,
  };
};

export default {
  buildAiReleaseBrief,
};
