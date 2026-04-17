import { storageService } from '../services/storageService';

const COMEBACK_KEY = 'huzur_comeback_bonus';

/**
 * Check if 2x XP multiplier is currently active
 * Can be used by other components to apply bonus
 */
export function isXpMultiplierActive() {
  const bonus = storageService.getItem(COMEBACK_KEY, {});
  if (!bonus.multiplierActive || !bonus.multiplierExpiry) return false;
  return new Date(bonus.multiplierExpiry) > new Date();
}

/**
 * Get current XP multiplier value (1 or 2)
 */
export function getXpMultiplier() {
  return isXpMultiplierActive() ? 2 : 1;
}
