/**
 * Pro Service - Premium özellikler ve günlük limit yönetimi
 * LocalStorage'da pro durumu ve günlük limitleri yönetir
 */

import { storageService } from './storageService';
import { STORAGE_KEYS } from '../constants';

// Günlük limit tanımları (Ücretsiz kullanıcılar için)
const FREE_LIMITS = {
  nuzul_ai: 2,           // Nüzul sebebi AI: 2 sorgu/gün
  tajweed_ai: 1,         // Tecvid AI: 1 kayıt/gün
  word_analysis: 3,      // Kelime kök analizi: 3 kelime/gün
  word_by_word: 4,       // Word-by-Word: 4 sure (Fatiha, İhlas, Felak, Nas)
  memorize_surahs: 5,    // Hafızlık: 5 sure
  hatim_count: 1,        // Hatim takibi: 1 hatim
  amel_history_days: 7,  // Amel defteri: 7 gün geçmiş
  themes: 3              // Tema: 3 tema
};

// Ücretsiz Word-by-Word sureleri
export const FREE_WORD_BY_WORD_SURAHS = [1, 112, 113, 114]; // Fatiha, İhlas, Felak, Nas

/**
 * Bugünün tarihini YYYY-MM-DD formatında döndürür
 */
const getTodayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * Pro durumunu kontrol et
 * @returns {boolean}
 */
export const isPro = () => {
  try {
    const status = storageService.getItem(STORAGE_KEYS.PRO_STATUS);
    if (!status) return false;
    
    // Expiry kontrolü
    if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
      storageService.removeItem(STORAGE_KEYS.PRO_STATUS);
      return false;
    }
    
    return status.active === true;
  } catch {
    return false;
  }
};

/**
 * Pro durumunu ayarla (RevenueCat callback'ten çağrılır)
 */
export const setProStatus = (active, expiresAt = null) => {
  try {
    storageService.setItem(STORAGE_KEYS.PRO_STATUS, {
      active,
      expiresAt,
      updatedAt: new Date().toISOString()
    });
    
    // Notify listeners (App.jsx) about Pro status change
    window.dispatchEvent(new CustomEvent('proStatusChanged', { detail: { active } }));
  } catch {
    console.warn('[ProService] Error setting pro status');
  }
};

/**
 * Günlük limitleri getir
 */
const getDailyLimits = () => {
  try {
    const today = getTodayString();
    const data = storageService.getItem(STORAGE_KEYS.DAILY_LIMITS);
    
    if (data && data.date === today) {
      return data;
    }
    
    // Yeni gün, yeni limitler
    return {
      date: today,
      nuzul_ai: 0,
      tajweed_ai: 0,
      word_analysis: 0
    };
  } catch {
    return { date: getTodayString(), nuzul_ai: 0, tajweed_ai: 0, word_analysis: 0 };
  }
};

/**
 * Günlük limitleri kaydet
 */
const saveDailyLimits = (limits) => {
  try {
    storageService.setItem(STORAGE_KEYS.DAILY_LIMITS, limits);
  } catch (e) {
    console.warn('[ProService] Error saving daily limits:', e);
  }
};

/**
 * Belirli bir özellik için limit kontrolü yap
 * @param {string} feature - Özellik adı (nuzul_ai, tajweed_ai, vb.)
 * @returns {{ allowed: boolean, remaining: number, max: number, isPro: boolean }}
 */
export const checkLimit = (feature) => {
  // Pro kullanıcılar için sınırsız
  if (isPro()) {
    return {
      allowed: true,
      remaining: Infinity,
      max: Infinity,
      isPro: true
    };
  }
  
  const limits = getDailyLimits();
  const used = limits[feature] || 0;
  const max = FREE_LIMITS[feature] || 0;
  const remaining = Math.max(0, max - used);
  
  return {
    allowed: remaining > 0,
    remaining,
    max,
    isPro: false
  };
};

/**
 * Limit kullan (sorgu/kayıt yapıldığında çağrılır)
 * @param {string} feature - Özellik adı
 * @returns {boolean} - Başarılı mı
 */
export const consumeLimit = (feature) => {
  // Pro kullanıcılar için limit yok
  if (isPro()) {
    return true;
  }
  
  const check = checkLimit(feature);
  if (!check.allowed) {
    return false;
  }
  
  const limits = getDailyLimits();
  limits[feature] = (limits[feature] || 0) + 1;
  saveDailyLimits(limits);
  
  return true;
};

// Alias for backward compatibility
export const useLimit = consumeLimit;

/**
 * Belirli bir sure için Word-by-Word erişimi kontrolü
 * @param {number} surahNumber - Sure numarası
 * @returns {boolean}
 */
export const canAccessWordByWord = (surahNumber) => {
  if (isPro()) return true;
  return FREE_WORD_BY_WORD_SURAHS.includes(surahNumber);
};

/**
 * Hafızlık için sure erişimi kontrolü (ilk 5 kısa sure ücretsiz)
 */
const FREE_MEMORIZE_SURAHS = [1, 112, 113, 114, 111]; // Fatiha, İhlas, Felak, Nas, Tebbet
export const canAccessMemorize = (surahNumber) => {
  if (isPro()) return true;
  return FREE_MEMORIZE_SURAHS.includes(surahNumber);
};

/**
 * Pro özellik listesi (UI için)
 */
export const PRO_FEATURES = [
  { id: 'unlimited_ai', icon: '🤖', title: 'Sınırsız AI Rehber', description: 'Nüzul sebebi ve tecvid asistanına sınırsız soru' },
  { id: 'all_surahs', icon: '📖', title: 'Tüm Sureler', description: '114 surenin tamamında kelime analizi ve hafızlık' },
  { id: 'no_ads', icon: '🚫', title: 'Reklamsız Deneyim', description: 'Odaklanmanızı bozacak hiçbir reklam yok' },
  { id: 'themes', icon: '🎨', title: 'Premium Temalar', description: 'Huzur veren 10+ özel tasarım ve renk seçeneği' },
  { id: 'history', icon: '📊', title: 'Sınırsız Geçmiş', description: 'Amel defteri ve gelişim istatistiklerine tam erişim' },
  { id: 'support', icon: '💬', title: 'Öncelikli Destek', description: 'Sorularınız için öncelikli ve hızlı yanıt' }
];

/**
 * Günlük limit durumunu UI formatında döndür
 */
export const getDailyLimitStatus = () => {
  const limits = getDailyLimits();
  const pro = isPro();
  
  return {
    isPro: pro,
    nuzul_ai: {
      used: limits.nuzul_ai || 0,
      max: pro ? Infinity : FREE_LIMITS.nuzul_ai,
      remaining: pro ? Infinity : Math.max(0, FREE_LIMITS.nuzul_ai - (limits.nuzul_ai || 0))
    },
    tajweed_ai: {
      used: limits.tajweed_ai || 0,
      max: pro ? Infinity : FREE_LIMITS.tajweed_ai,
      remaining: pro ? Infinity : Math.max(0, FREE_LIMITS.tajweed_ai - (limits.tajweed_ai || 0))
    }
  };
};

export default {
  isPro,
  setProStatus,
  checkLimit,
  consumeLimit,
  useLimit,
  canAccessWordByWord,
  canAccessMemorize,
  getDailyLimitStatus,
  PRO_FEATURES,
  FREE_WORD_BY_WORD_SURAHS
};
