/**
 * Authentication Service
 * Firebase Anonymous Auth ile güvenli kullanıcı kimliği yönetimi
 * 
 * Avantajları:
 * - Tahmin edilemez, güvenli kullanıcı ID
 * - Cihaz değişse bile kullanıcı verilerine erişim potansiyeli
 * - Firebase Security Rules ile entegrasyon
 * - Otomatik token yenileme
 */

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { storageService } from './storageService';
import { logger } from '../utils/logger';

// Auth state
let currentUser = null;
let authListeners = [];
let authInitialized = false;
let authPromiseResolve = null;

// Auth hazır olana kadar beklemek için promise
const authReadyPromise = new Promise((resolve) => {
  authPromiseResolve = resolve;
});

/**
 * Auth state listener'ı başlat
 */
const initAuthListener = () => {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    authInitialized = true;
    
    if (user) {
      logger.log('[AuthService] User authenticated');
      // Eski localStorage ID'sini migration için sakla
      // Eski localStorage ID'sini migration için sakla
      const oldLocalId = localStorage.getItem('hatim_user_id');
      // Check if migration already done (async check inside sync callback is tricky, but we can fire and forget or use then)
      storageService.getItemAsync('auth_migrated').then(migrated => {
        if (oldLocalId && !migrated) {
          storageService.setItemAsync('old_local_user_id', oldLocalId);
          logger.log('[AuthService] Old local ID saved for migration (secure)');
        }
      });
    } else {
      logger.log('[AuthService] No user, will sign in anonymously');
    }
    
    // Auth hazır olduğunda promise'i resolve et
    if (authPromiseResolve) {
      authPromiseResolve(user);
      authPromiseResolve = null;
    }
    
    // Tüm listener'ları bilgilendir
    authListeners.forEach(listener => listener(user));
  });
};

// Listener'ı hemen başlat
initAuthListener();

/**
 * Anonim olarak giriş yap (hesap yoksa oluşturur)
 * @returns {Promise<string|null>} User ID veya null
 */
export const ensureAuthenticated = async (options = {}) => {
  const { requireFirebaseUser = false } = options;
  try {
    // Eğer zaten giriş yapılmışsa, mevcut kullanıcıyı döndür
    if (currentUser) {
      return currentUser.uid;
    }
    
    // Auth henüz initialize olmadıysa bekle
    if (!authInitialized) {
      await authReadyPromise;
      if (currentUser) {
        return currentUser.uid;
      }
    }
    
    // Anonim giriş yap
    logger.log('[AuthService] Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    currentUser = userCredential.user;
    
    logger.log('[AuthService] Signed in anonymously');
    
    // Migration flag'ini ayarla
    // Migration flag'ini ayarla (secure)
    await storageService.setItemAsync('auth_migrated', true);
    
    return currentUser.uid;
    
  } catch (error) {
    logger.error('[AuthService] Anonymous sign in error:', error);
    
    // Firebase hata kodlarına göre fallback
    if (error.code === 'auth/network-request-failed') {
      logger.warn('[AuthService] Network error, using fallback');
    }
    
    // Firebase Auth zorunlu ise fallback'e düşme, hatayı yukarı taşı
    if (requireFirebaseUser) {
      const authError = new Error('Firebase Auth kullanılamıyor. Lütfen internet bağlantısını ve Anonymous Auth ayarını kontrol edin.');
      authError.code = error?.code || 'auth/firebase-unavailable';
      throw authError;
    }

    // Fallback: Eğer Firebase Auth çalışmazsa, güvenli random ID oluştur
    // Bu sadece Firestore bağımlı olmayan akışlar için son çare olarak kullanılmalı
    return await generateSecureFallbackId();
  }
};

/**
 * Mevcut kullanıcı ID'sini al (senkron)
 * @returns {string|null}
 */
export const getCurrentUserId = () => {
  return currentUser?.uid || null;
};

/**
 * Auth state değişikliklerini dinle
 * @param {Function} callback - (user) => void
 * @returns {Function} Unsubscribe fonksiyonu
 */
export const onAuthChange = (callback) => {
  authListeners.push(callback);
  
  // Eğer zaten user varsa hemen bilgilendir
  if (authInitialized) {
    callback(currentUser);
  }
  
  // Unsubscribe fonksiyonu döndür
  return () => {
    authListeners = authListeners.filter(l => l !== callback);
  };
};

/**
 * Auth hazır olana kadar bekle
 * @returns {Promise<User|null>}
 */
export const waitForAuth = async () => {
  if (authInitialized) {
    return currentUser;
  }
  return authReadyPromise;
};

/**
 * Güvenli fallback ID oluştur (Firebase çalışmazsa)
 * Crypto API kullanarak tahmin edilemez ID üretir
 * @returns {string}
 */
const generateSecureFallbackId = async () => {
  // Önce secureStorage'da mevcut güvenli ID var mı kontrol et
  const existingId = await storageService.getStringAsync('secure_fallback_uid');
  if (existingId) {
    return existingId;
  }
  
  // Crypto API ile güvenli random bytes oluştur
  let newId;
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    newId = 'fallback_' + crypto.randomUUID();
  } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    newId = 'fallback_' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Son çare - daha az güvenli ama hala Math.random()'dan iyi
    newId = 'fallback_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 16);
  }
  
  await storageService.setStringAsync('secure_fallback_uid', newId);
  logger.warn('[AuthService] Using fallback ID (Firebase Auth unavailable)');
  
  return newId;
};

/**
 * Eski localStorage ID'sini al (migration için)
 * @returns {string|null}
 */
export const getOldLocalUserId = async () => {
  const secureId = await storageService.getItemAsync('old_local_user_id');
  return secureId || localStorage.getItem('hatim_user_id');
};

/**
 * Migration tamamlandığında eski ID'yi temizle
 */
export const clearMigrationData = async () => {
  await storageService.removeItemAsync('old_local_user_id');
  localStorage.removeItem('hatim_user_id');
  logger.log('[AuthService] Migration data cleared');
};

export default {
  ensureAuthenticated,
  getCurrentUserId,
  onAuthChange,
  waitForAuth,
  getOldLocalUserId,
  clearMigrationData
};
