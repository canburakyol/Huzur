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
      const oldLocalId = storageService.getString('hatim_user_id', '');
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
export const ensureAuthenticated = async () => {
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
    
    // Firebase Auth zorunlu — fallback ID kullanmak Firestore rules'u bypass eder
    // Null döndürüp çağıran yerde hata yönetimi yapılmasını sağla
    return null;
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
 * Mevcut kullanıcı ID'sini garanti eder.
 * Auth henüz hazır değilse veya kullanıcı yoksa anonim login dener.
 * @returns {Promise<string|null>}
 */
export const getCurrentUserIdEnsured = async () => {
  if (currentUser?.uid) return currentUser.uid;
  return ensureAuthenticated();
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
 * Eski localStorage ID'sini al (migration için)
 * @returns {string|null}
 */
export const getOldLocalUserId = async () => {
  const secureId = await storageService.getItemAsync('old_local_user_id');
  return secureId || storageService.getString('hatim_user_id', '');
};

/**
 * Migration tamamlandığında eski ID'yi temizle
 */
export const clearMigrationData = async () => {
  await storageService.removeItemAsync('old_local_user_id');
  storageService.removeItem('hatim_user_id');
  logger.log('[AuthService] Migration data cleared');
};

export default {
  ensureAuthenticated,
  getCurrentUserId,
  getCurrentUserIdEnsured,
  onAuthChange,
  waitForAuth,
  getOldLocalUserId,
  clearMigrationData
};
