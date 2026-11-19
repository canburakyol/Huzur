type SmokeCheckTemplate = {
  key: string;
  label: string;
  detail: string;
  expectedSignal: string;
}

type Surface = {
  key: string;
  label: string;
  status: string;
  [key: string]: unknown;
}

type HealthSummary = {
  surfaces?: Surface[];
}

type ReleaseReadiness = {
  status?: string;
  checks?: Array<{ key: string; status: string }>;
}

type RolloutGate = {
  recommendation?: string;
}

type IncidentSummary = {
  criticalCount?: number;
  last24hCount?: number;
}

interface SmokeCheck extends SmokeCheckTemplate {
  severity: string;
}

type ManualCheck = {
  key: string;
  label: string;
  detail: string;
}

type Runbook = {
  key: string;
  label: string;
  trigger: string;
  firstStep: string;
}

type AiOpsChecklistResult = {
  stage: string;
  headline: string;
  operatorActions: string[];
  smokeChecks: SmokeCheck[];
  manualConsoleChecks: ManualCheck[];
  incidentRunbooks: Runbook[];
}

type BuildChecklistOptions = {
  healthSummary?: HealthSummary | null;
  rolloutGate?: RolloutGate | null;
  releaseReadiness?: ReleaseReadiness | null;
  incidentSummary?: IncidentSummary | null;
  flags?: Record<string, boolean>;
}

const SURFACE_TO_SMOKE_CHECK: Record<string, SmokeCheckTemplate> = {
  latestAssistantSnapshot: {
    key: 'assistant_smoke',
    label: 'Assistant V2 smoke',
    detail: 'Rehber ekranında bir normal, bir hassas ve bir fallback senaryosu dene.',
    expectedSignal: 'JSON cevap, safe-mode davranışı ve trust metadata görünmeli.',
  },
  latestHomeRankingSnapshot: {
    key: 'home_smoke',
    label: 'Home ranking smoke',
    detail: 'Ana ekranı iki kez açıp sıralama ve kart tekrarlarını kontrol et.',
    expectedSignal: 'İlk modüller anlamlı kalmalı, duplicate ve boş durum olmamalı.',
  },
  latestWeeklyInsightSnapshot: {
    key: 'weekly_smoke',
    label: 'Weekly insight smoke',
    detail: 'Haftalık özet modalını açıp kısa ve yargısız bir özet geldiğini doğrula.',
    expectedSignal: 'Risk bandı ve trust sinyali ile uyumlu metin görünmeli.',
  },
  latestPushHintSnapshot: {
    key: 'push_smoke',
    label: 'Push hint smoke',
    detail: 'Bildirim akışını tetikleyip kopya ve zaman önerilerinin sakin tonda kaldığını incele.',
    expectedSignal: 'Schedule bozulmadan yeni hint metadata loglara dusmeli.',
  },
};

const buildSurfaceAction = (surface: Surface): string => {
  if (surface.status === 'action') {
    return `Önce ${surface.label} yüzeyini gözden geçir; trust düşük veya review eksik görünüyor.`;
  }
  if (surface.status === 'watch') {
    return `${surface.label} yüzeyini smoke test ve log ile izlemeye devam et.`;
  }
  return `${surface.label} yüzeyi sağlam görünüyor; yalnızca canlı metrikleri izle.`;
};

const dedupeByKey = (items: Array<{ key: string } | null> = []): Array<{ key: string }> => {
  const seen = new Set<string>();
  return items.filter((item): item is { key: string } => {
    if (!item?.key || seen.has(item.key)) {
      return false;
    }
    seen.add(item.key);
    return true;
  });
};

export const buildAiOpsChecklist = ({
  healthSummary = null,
  rolloutGate = null,
  releaseReadiness = null,
  incidentSummary = null,
  flags = {},
}: BuildChecklistOptions = {}): AiOpsChecklistResult => {
  const surfaces = Array.isArray(healthSummary?.surfaces) ? healthSummary.surfaces : [];
  const enabledFlagCount = Object.values(flags || {}).filter((value) => value === true).length;
  const totalFlagCount = Object.keys(flags || {}).length;
  const actionSurfaces = surfaces.filter((item) => item.status === 'action');
  const watchSurfaces = surfaces.filter((item) => item.status === 'watch');

  let stage = 'stable';
  let headline = 'Canlı AI akışlarını izleyerek devam et.';

  if (releaseReadiness?.status === 'blocked' || rolloutGate?.recommendation === 'hold') {
    stage = 'intervene';
    headline = 'Rolloutu yavaşlat ve düşük trust sinyallerini kapatmadan yeni açılım yapma.';
  } else if (releaseReadiness?.status === 'monitor' || rolloutGate?.recommendation === 'cautious') {
    stage = 'verify';
    headline = 'Yeni açılımdan önce çekirdek smoke setini ve canlı logları yeniden doğrula.';
  }

  const operatorActions: string[] = [];

  if (releaseReadiness?.checks?.some((check) => check.key === 'freshness' && check.status !== 'pass')) {
    operatorActions.push('AI health taze değil; Assistant, Home ve Weekly akışlarını cihazda bir kez tetikle.');
  }

  if (Number(incidentSummary?.criticalCount) > 0) {
    operatorActions.push('Son 24 saatte kritik AI incident var; yeni rollout acmadan once bunu kapat.');
  } else if (Number(incidentSummary?.last24hCount) > 0) {
    operatorActions.push('Son AI incidentlerini log ve Crashlytics tarafında doğrula; tekrar etmiyorsa rollouta kontrollü devam et.');
  }

  actionSurfaces.forEach((surface) => {
    operatorActions.push(buildSurfaceAction(surface));
  });

  if (!actionSurfaces.length) {
    watchSurfaces.slice(0, 2).forEach((surface) => {
      operatorActions.push(buildSurfaceAction(surface));
    });
  }

  if (enabledFlagCount < totalFlagCount) {
    operatorActions.push('Tüm AI flagleri açık değil; kademeli rollout mantığını koru ve eksik yüzeyleri sonradan aç.');
  } else {
    operatorActions.push('Tüm AI flagleri açık; 24 saat boyunca fallback ve trust trendini yakından izle.');
  }

  const smokeChecks = dedupeByKey(
    surfaces
      .filter((surface) => surface.status !== 'healthy')
      .concat(surfaces.filter((surface) => surface.key === 'latestAssistantSnapshot'))
      .map((surface) => {
        const template = SURFACE_TO_SMOKE_CHECK[surface.key];
        if (!template) {
          return null;
        }
        return {
          ...template,
          severity: surface.status,
        };
      })
      .filter(Boolean)
  ) as SmokeCheck[];

  const manualConsoleChecks: ManualCheck[] = [
    {
      key: 'functions_logs',
      label: 'Functions loglari',
      detail: 'assistant_v2_resolved, home_ranking_v2_resolved ve weekly_insight_v1_resolved loglarını kontrol et.',
    },
    {
      key: 'firestore_health',
      label: 'Firestore AI health',
      detail: 'users/{uid}/aiProfile/profile icinde latest*Snapshot alanlarinin guncel kaldigini dogrula.',
    },
    {
      key: 'analytics_trend',
      label: 'Analytics trendi',
      detail: 'assistant_v2_fallback, ai_trust_surfaced ve ai_release_readiness_surfaced eventlerinde anormal artış var mi bak.',
    },
    {
      key: 'incident_log',
      label: 'Yerel AI incident kayitlari',
      detail: Number(incidentSummary?.last24hCount) > 0
        ? `Son 24 saatte ${Number(incidentSummary?.last24hCount) || 0} incident goruldu; Settings panelindeki son incident ozetini incele.`
        : 'Son 24 saatte yeni incident kaydi yok.',
    },
  ];

  const incidentRunbooks: Runbook[] = [
    {
      key: 'assistant_trust_drop',
      label: 'Assistant trust dususu',
      trigger: 'Assistant action bandine dusuyor veya fallback hizi artiyor.',
      firstStep: 'Assistant smoke setini koş, safe-mode ve provider fallback loglarını incele.',
    },
    {
      key: 'home_regression',
      label: 'Home ranking regresyonu',
      trigger: 'Ana ekranda anlamsiz sira, duplicate veya bos kart raporu geliyor.',
      firstStep: 'Home smoke testini koş ve home_ranking_v2_resolved loglarında ranked_count/risk_band uyumuna bak.',
    },
    {
      key: 'weekly_push_drift',
      label: 'Weekly veya push drift',
      trigger: 'Özet tazi değil, push kopyası sert veya alakasız hissettiriyor.',
      firstStep: 'Weekly insight ve push hint snapshotlarını tazele, source_count ve review_status alanlarını kontrol et.',
    },
  ];

  return {
    stage,
    headline,
    operatorActions: [...new Set(operatorActions)].slice(0, 4),
    smokeChecks: smokeChecks.slice(0, 4),
    manualConsoleChecks,
    incidentRunbooks,
  };
};

export default {
  buildAiOpsChecklist,
};
