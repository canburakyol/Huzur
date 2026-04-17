const countEnabledFlags = (flags = {}) => (
  Object.values(flags).filter((value) => value === true).length
);

export const buildAiRolloutGate = ({
  healthSummary = null,
  flags = {},
} = {}) => {
  const enabledFlagCount = countEnabledFlags(flags);
  const actionCount = Number(healthSummary?.actionCount) || 0;
  const watchCount = Number(healthSummary?.watchCount) || 0;
  const averageTrust = Number.isFinite(Number(healthSummary?.averageTrust))
    ? Number(healthSummary.averageTrust)
    : null;

  let recommendation = 'go';
  let label = 'Devam et';
  const actions = [];

  if (actionCount > 0) {
    recommendation = 'hold';
    label = 'Yavaslat';
    actions.push('Dusuk trust sinyali veren yuzeyleri once gozden gecir.');
    actions.push('Gerekirse ilgili AI flagini gecici olarak kapat.');
  } else if (watchCount > 1 || (averageTrust !== null && averageTrust < 0.7)) {
    recommendation = 'cautious';
    label = 'Izleyerek devam et';
    actions.push('Watch bandindeki yuzeyleri log ve smoke test ile izle.');
  }

  if (enabledFlagCount < 5) {
    actions.push('Tum AI yuzeyleri acik degil; kademeli rollout mantigi korunuyor.');
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
