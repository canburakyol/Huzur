import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { storageService } from './storageService';
import { logger } from '../utils/logger';

const PULSE_ENABLED_KEY = 'huzur_ambient_pulse_enabled';
const PULSE_INTERVAL_MS = 1200;
const PULSE_PATTERN_COOLDOWN_MS = 30_000;

let pulseTimerId: ReturnType<typeof setInterval> | null = null;
let lastPulseAt = 0;

const executePulsePattern = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Haptics.impact({ style: ImpactStyle.Light });

    await delay(180);

    await Haptics.impact({ style: ImpactStyle.Medium });

    lastPulseAt = Date.now();
  } catch (error) {
    logger.error('[AmbientPrayerPulse] executePulsePattern failed', error);
  }
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const startAmbientPulse = (
  durationMs = PULSE_PATTERN_COOLDOWN_MS,
  intervalMs = PULSE_INTERVAL_MS
): void => {
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

export const stopAmbientPulse = (): void => {
  if (pulseTimerId !== null) {
    clearInterval(pulseTimerId);
    pulseTimerId = null;
    logger.log('[AmbientPulse] Pulse stopped');
  }
};

export const isAmbientPulseEnabled = (): boolean => {
  return storageService.getBoolean(PULSE_ENABLED_KEY, false);
};

export const setAmbientPulseEnabled = (enabled: boolean): void => {
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
