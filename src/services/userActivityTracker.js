/**
 * User Activity Tracker
 * Kullanıcının uygulamayı hangi saatlerde açtığını kaydeder.
 * Akıllı bildirim zamanlaması için kullanılır.
 */

import { storageService } from './storageService';

// ── Sabitler ────────────────────────────────────────────────────
const STORAGE_KEY = 'huzur_app_open_history';
const MAX_HISTORY_DAYS = 14;

// Fallback saatler (kullanıcı verisi yoksa)
const FALLBACK_REMINDER_HOURS = {
  morning:   10,
  afternoon: 14,
  evening:   18,
};

// ── Yardımcı ────────────────────────────────────────────────────

/** @returns {{ date: string, hour: number }[]} */
const getHistory = () => {
  return storageService.getItem(STORAGE_KEY) || [];
};

const saveHistory = (history) => {
  storageService.setItem(STORAGE_KEY, history);
};

const getTodayStr = () => new Date().toISOString().split('T')[0];

// ── Ana API ──────────────────────────────────────────────────────

/**
 * Uygulama açılışını kaydet.
 * Her uygulama başlangıcında bir kez çağrılmalı.
 */
export const recordAppOpen = () => {
  const history = getHistory();
  const now = new Date();
  const entry = {
    date: getTodayStr(),
    hour: now.getHours(),
    ts: now.getTime(),
  };

  // Aynı gün içinde aynı saati tekrar kaydetme (1 saat tolerans)
  const recentSameHour = history.find(
    (h) => h.date === entry.date && Math.abs(h.hour - entry.hour) < 1
  );
  if (recentSameHour) return;

  history.unshift(entry);

  // Eski kayıtları temizle
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_HISTORY_DAYS);
  const cutoffTs = cutoff.getTime();
  const trimmed = history.filter((h) => h.ts > cutoffTs);

  saveHistory(trimmed);
};

/**
 * Son N günün aktivite geçmişine göre en optimal hatırlatıcı saatini döner.
 * @param {'morning' | 'afternoon' | 'evening'} slot
 * @returns {number} Saat (0-23)
 */
export const getOptimalReminderHour = (slot = 'morning') => {
  const history = getHistory();
  if (history.length < 3) {
    return FALLBACK_REMINDER_HOURS[slot] ?? 10;
  }

  // Slot'a göre saat aralığı
  const ranges = {
    morning:   [5, 12],
    afternoon: [12, 17],
    evening:   [17, 22],
  };
  const [rangeStart, rangeEnd] = ranges[slot] ?? [5, 12];

  // O aralıktaki açılışları say
  const hourCounts = {};
  history.forEach(({ hour }) => {
    if (hour >= rangeStart && hour < rangeEnd) {
      hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
    }
  });

  if (Object.keys(hourCounts).length === 0) {
    return FALLBACK_REMINDER_HOURS[slot] ?? 10;
  }

  // En sık açılan saati bul
  const optimalHour = Object.entries(hourCounts).reduce(
    (best, [hour, count]) => (count > best.count ? { hour: Number(hour), count } : best),
    { hour: FALLBACK_REMINDER_HOURS[slot], count: 0 }
  ).hour;

  return optimalHour;
};

/**
 * Sabah / öğle / akşam aktivite dağılımını döner.
 * @returns {{ morning: number, afternoon: number, evening: number }}
 */
export const getActivityPattern = () => {
  const history = getHistory();
  const pattern = { morning: 0, afternoon: 0, evening: 0 };

  history.forEach(({ hour }) => {
    if (hour >= 5 && hour < 12)  pattern.morning++;
    else if (hour >= 12 && hour < 17) pattern.afternoon++;
    else if (hour >= 17 && hour < 22) pattern.evening++;
  });

  return pattern;
};

/**
 * Aktivite geçmişini temizle (test / sıfırlama için).
 */
export const clearActivityHistory = () => {
  storageService.removeItem(STORAGE_KEY);
};
