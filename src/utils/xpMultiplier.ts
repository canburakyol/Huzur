import { storageService } from '../services/storageService';

const COMEBACK_KEY = 'huzur_comeback_bonus';

export function isXpMultiplierActive(): boolean {
  const bonus = storageService.getItem(COMEBACK_KEY, {}) as { multiplierActive?: boolean; multiplierExpiry?: string };
  if (!bonus.multiplierActive || !bonus.multiplierExpiry) return false;
  return new Date(bonus.multiplierExpiry) > new Date();
}

export function getXpMultiplier(): number {
  return isXpMultiplierActive() ? 2 : 1;
}
