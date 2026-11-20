// New users see no bottom banner for their first days: the first impression is the prayer times, not an ad.
export const AD_GRACE_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

export const isInAdGracePeriod = (installDateMs: number, nowMs: number = Date.now()): boolean =>
  Number.isFinite(installDateMs) && installDateMs > 0 && nowMs - installDateMs < AD_GRACE_PERIOD_MS;
