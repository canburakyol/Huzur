import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';
import { analyticsService, ANALYTICS_EVENTS } from './analyticsService';
import {
  PRAYER_TOLERANCE_MINUTES,
  PRAYER_VALIDATION_RULES,
  PRAYER_VALIDATION_SEVERITY
} from '../constants/prayerToleranceTable';
import { PRAYER_KEYS_ALL } from '../constants/prayerTimes';

const toMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const diffInMinutes = (a, b) => {
  const am = toMinutes(a);
  const bm = toMinutes(b);
  if (am === null || bm === null) return null;
  return Math.abs(am - bm);
};

const getToleranceMap = (countryCode = 'DEFAULT') => {
  const normalized = String(countryCode || 'DEFAULT').toUpperCase();
  return PRAYER_TOLERANCE_MINUTES[normalized] || PRAYER_TOLERANCE_MINUTES.DEFAULT;
};

export const validatePrayerTimings = ({ primary, secondary, countryCode = 'DEFAULT' }) => {
  if (!primary || !secondary) {
    return {
      severity: PRAYER_VALIDATION_RULES.SECONDARY_UNAVAILABLE_SEVERITY,
      reason: 'secondary_unavailable',
      perPrayerDelta: {},
      recommendedAction: 'use_primary'
    };
  }

  const tolerance = getToleranceMap(countryCode);
  const perPrayerDelta = {};
  let hasWarn = false;
  let hasCritical = false;

  PRAYER_KEYS_ALL.forEach((key) => {
    const delta = diffInMinutes(primary[key], secondary[key]);
    perPrayerDelta[key] = delta;

    if (delta === null) return;

    const base = tolerance[key] ?? tolerance.Fajr ?? 10;
    if (delta > base * PRAYER_VALIDATION_RULES.CRITICAL_MULTIPLIER) {
      hasCritical = true;
      return;
    }
    if (delta > base * PRAYER_VALIDATION_RULES.WARN_MULTIPLIER) {
      hasWarn = true;
    }
  });

  const severity = hasCritical
    ? PRAYER_VALIDATION_SEVERITY.CRITICAL
    : hasWarn
      ? PRAYER_VALIDATION_SEVERITY.WARN
      : PRAYER_VALIDATION_SEVERITY.OK;

  const result = {
    severity,
    perPrayerDelta,
    recommendedAction: severity === PRAYER_VALIDATION_SEVERITY.CRITICAL ? 'switch_or_fallback' : 'use_primary'
  };

  const eventName =
    severity === PRAYER_VALIDATION_SEVERITY.CRITICAL
      ? ANALYTICS_EVENTS.PRAYER_VALIDATION_CRITICAL
      : severity === PRAYER_VALIDATION_SEVERITY.WARN
        ? ANALYTICS_EVENTS.PRAYER_VALIDATION_WARNING
        : ANALYTICS_EVENTS.PRAYER_VALIDATION_RUN;

  analyticsService.logEvent(eventName, {
    severity,
    deltas: perPrayerDelta
  });

  storageService.setItem(STORAGE_KEYS.PRAYER_VALIDATION_LAST, {
    timestamp: new Date().toISOString(),
    ...result
  });

  return result;
};

export const getLastPrayerValidation = () => {
  return storageService.getItem(STORAGE_KEYS.PRAYER_VALIDATION_LAST, null);
};

export const saveLastSafePrayerTimings = (timings) => {
  storageService.setItem(STORAGE_KEYS.LAST_SAFE_PRAYER_TIMINGS, {
    timestamp: new Date().toISOString(),
    timings
  });
};

export const getLastSafePrayerTimings = () => {
  return storageService.getItem(STORAGE_KEYS.LAST_SAFE_PRAYER_TIMINGS, null);
};

