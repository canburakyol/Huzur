/**
 * Vakit bazlı kabul edilebilir fark (dakika)
 * Faz-1: global default + basit ülke override yaklaşımı
 */
export const PRAYER_TOLERANCE_MINUTES = {
  DEFAULT: {
    Fajr: 12,
    Sunrise: 10,
    Dhuhr: 8,
    Asr: 10,
    Maghrib: 8,
    Isha: 12
  },
  TR: {
    Fajr: 10,
    Sunrise: 8,
    Dhuhr: 6,
    Asr: 8,
    Maghrib: 6,
    Isha: 10
  }
};

export const PRAYER_VALIDATION_SEVERITY = {
  OK: 'ok',
  WARN: 'warn',
  CRITICAL: 'critical'
};

export const PRAYER_VALIDATION_RULES = {
  WARN_MULTIPLIER: 1,
  CRITICAL_MULTIPLIER: 2,
  SECONDARY_UNAVAILABLE_SEVERITY: PRAYER_VALIDATION_SEVERITY.WARN
};

