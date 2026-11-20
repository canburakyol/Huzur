type HealthSummary = {
  actionCount?: number;
  watchCount?: number;
  averageTrust?: number | null;
}

type RolloutGateResult = {
  recommendation: string;
  label: string;
  enabledFlagCount: number;
  totalFlagCount: number;
  averageTrust: number | null;
  actionCount: number;
  watchCount: number;
  actions: string[];
}

type BuildGateOptions = {
  healthSummary?: HealthSummary | null;
  flags?: Record<string, unknown>;
}

const countEnabledFlags = (flags: Record<string, unknown> = {}): number => (
  Object.values(flags).filter((value) => value === true).length
);

export const buildAiRolloutGate = ({
  healthSummary = null,
  flags = {},
}: BuildGateOptions = {}): RolloutGateResult => {
  const enabledFlagCount = countEnabledFlags(flags);
  const actionCount = Number(healthSummary?.actionCount) || 0;
  const watchCount = Number(healthSummary?.watchCount) || 0;
  const averageTrust = Number.isFinite(Number(healthSummary?.averageTrust))
    ? Number(healthSummary?.averageTrust)
    : null;

  let recommendation = 'go';
  let label = 'Devam et';
  const actions: string[] = [];

  if (actionCount > 0) {
    recommendation = 'hold';
    label = 'Yavaslat';
    actions.push('Düşük trust sinyali veren yüzeyleri önce gözden geçir.');
    actions.push('Gerekirse ilgili AI flagini geçici olarak kapat.');
  } else if (watchCount > 1 || (averageTrust !== null && averageTrust < 0.7)) {
    recommendation = 'cautious';
    label = 'Izleyerek devam et';
    actions.push('Watch bandındaki yüzeyleri log ve smoke test ile izle.');
  }

  if (enabledFlagCount < 5) {
    actions.push('Tüm AI yüzeyleri açık değil; kademeli rollout mantığı korunuyor.');
  } else {
    actions.push('Tum Faz 1-2 AI flagleri aktif durumda.');
  }

  return {
    recommendation,
    label,
    enabledFlagCount,
    totalFlagCount: Object.keys(flags || {}).length,
    averageTrust,
    actionCount,
    watchCount,
    actions,
  };
};

export default {
  buildAiRolloutGate,
};
