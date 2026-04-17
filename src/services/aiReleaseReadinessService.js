const FRESHNESS_WINDOW_HOURS = 72;

const toMillis = (value) => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const buildAiReleaseReadiness = ({
  healthSummary = null,
  rolloutGate = null,
  incidentSummary = null,
  flags = {},
  nowMs = Date.now(),
} = {}) => {
  const latestAiHealthAtMs = toMillis(healthSummary?.latestAiHealthAt);
  const ageHours = latestAiHealthAtMs > 0
    ? Math.max(0, Math.round(((nowMs - latestAiHealthAtMs) / 3600000) * 10) / 10)
    : null;
  const surfaces = Array.isArray(healthSummary?.surfaces) ? healthSummary.surfaces : [];
  const enabledFlagCount = Object.values(flags || {}).filter((value) => value === true).length;
  const totalFlagCount = Object.keys(flags || {}).length;
  const missingSurfaceCount = surfaces.filter((item) => !item?.updatedAtIso).length;

  const checks = [
    {
      key: 'freshness',
      label: 'Canli sinyal tazeligi',
      status: ageHours === null ? 'warn' : ageHours <= FRESHNESS_WINDOW_HOURS ? 'pass' : 'fail',
      detail: ageHours === null
        ? 'Son AI health zamani yok'
        : `${ageHours} saat once guncellendi`,
    },
    {
      key: 'rollout_gate',
      label: 'Rollout gate',
      status: rolloutGate?.recommendation === 'hold'
        ? 'fail'
        : rolloutGate?.recommendation === 'cautious'
          ? 'warn'
          : 'pass',
      detail: rolloutGate?.label || 'Degerlendirme yok',
    },
    {
      key: 'flag_coverage',
      label: 'Flag kapsami',
      status: enabledFlagCount === totalFlagCount && totalFlagCount > 0 ? 'pass' : 'warn',
      detail: `${enabledFlagCount}/${totalFlagCount} AI flag aktif`,
    },
    {
      key: 'surface_coverage',
      label: 'Yuzey kapsami',
      status: missingSurfaceCount === 0 ? 'pass' : 'warn',
      detail: missingSurfaceCount === 0
        ? 'Tum AI yuzeylerinde snapshot var'
        : `${missingSurfaceCount} yuzeyde guncel snapshot eksik`,
    },
    {
      key: 'incident_pressure',
      label: 'Incident baskisi',
      status: Number(incidentSummary?.criticalCount) > 0
        ? 'fail'
        : Number(incidentSummary?.last24hCount) > 0
          ? 'warn'
          : 'pass',
      detail: Number(incidentSummary?.last24hCount) > 0
        ? `Son 24 saatte ${Number(incidentSummary?.last24hCount) || 0} AI incident kaydi var`
        : 'Son 24 saatte kritik AI incident yok',
    },
  ];

  const failedChecks = checks.filter((item) => item.status === 'fail').length;
  const warnedChecks = checks.filter((item) => item.status === 'warn').length;

  return {
    status: failedChecks > 0 ? 'blocked' : warnedChecks > 0 ? 'monitor' : 'ready',
    failedChecks,
    warnedChecks,
    checks,
    ageHours,
  };
};

export default {
  buildAiReleaseReadiness,
};
