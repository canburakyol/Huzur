import type { PrayerKey } from './prayerTimes';

export type ToleranceTable = Record<PrayerKey, number>;

export type ToleranceRegion = 'DEFAULT' | 'TR';

export const PRAYER_TOLERANCE_MINUTES: Record<ToleranceRegion, ToleranceTable> = {
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

export type ValidationSeverity = 'ok' | 'warn' | 'critical';

export const PRAYER_VALIDATION_SEVERITY: Record<Uppercase<ValidationSeverity>, ValidationSeverity> = {
  OK: 'ok',
  WARN: 'warn',
  CRITICAL: 'critical'
};

export interface PrayerValidationRules {
  WARN_MULTIPLIER: number;
  CRITICAL_MULTIPLIER: number;
  SECONDARY_UNAVAILABLE_SEVERITY: ValidationSeverity;
}

export const PRAYER_VALIDATION_RULES: PrayerValidationRules = {
  WARN_MULTIPLIER: 1,
  CRITICAL_MULTIPLIER: 2,
  SECONDARY_UNAVAILABLE_SEVERITY: PRAYER_VALIDATION_SEVERITY.WARN
};
