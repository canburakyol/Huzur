import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { storageService } from './storageService';
import { logger } from '../utils/logger';

const PULSE_ENABLED_KEY = 'huzur_ambient_pulse_enabled';
const PULSE_INTERVAL_MS = 1200;
const PULSE_PATTERN_COOLDOWN_MS = 30_000;

let pulseTimerId = null;
let lastPulseAt = 0;

/**
 * "Spiritual Heartbeat" — a gentle haptic pattern
 * that mimics a calm heartbeat before prayer time.
 *
 * Pattern: thump . . thump . . . . (rest)
 */
const executePulsePattern = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // First "heartbeat"
    await Haptics.impact({ style: ImpactStyle.Light });

    await delay(180);

    // Second "heartbeat" (slightly stronger)
    await Haptics.impact({ style: ImpactStyle.Medium });

    lastPulseAt = Date.now();
  } catch (error) {
    logger.error('[AmbientPrayerPulse] executePulsePattern failed', error);
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Start the ambient prayer pulse.
 * Should be triggered ~15 minutes before next prayer time.
 *
 * @param {number} durationMs - How long to pulse (default: 30 seconds)
 * @param {number} intervalMs - Time between pulse patterns
 */
export const startAmbientPulse = (
  durationMs = PULSE_PATTERN_COOLDOWN_MS,
  intervalMs = PULSE_INTERVAL_MS
) => {
  if (!isAmbientPulseEnabled()) return;
  if (pulseTimerId !== null) return;

  const cooldownCheck = Date.now() - lastPulseAt;
  if (cooldownCheck < PULSE_PATTERN_COOLDOWN_MS) return;

  logger.log('[AmbientPulse] Starting spiritual heartbeat');

  let elapsed = 0;
  pulseTimerId = setInterval(() => {
    elapsed += intervalMs;

    if (elapsed >= durationMs) {
      stopAmbientPulse();
      return;
    }

    void executePulsePattern();
  }, intervalMs);
};

/**
 * Stop the ambient pulse.
 */
export const stopAmbientPulse = () => {
  if (pulseTimerId !== null) {
    clearInterval(pulseTimerId);
    pulseTimerId = null;
    logger.log('[AmbientPulse] Pulse stopped');
  }
};

/**
 * Check if user has enabled ambient pulse.
 */
export const isAmbientPulseEnabled = () => {
  return storageService.getBoolean(PULSE_ENABLED_KEY, false);
};

/**
 * Toggle the ambient pulse setting.
 */
export const setAmbientPulseEnabled = (enabled) => {
  storageService.setBoolean(PULSE_ENABLED_KEY, enabled);

  if (!enabled) {
    stopAmbientPulse();
  }
};

export default {
  startAmbientPulse,
  stopAmbientPulse,
  isAmbientPulseEnabled,
  setAmbientPulseEnabled,
};
