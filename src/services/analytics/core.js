/**
 * Analytics core runtime.
 * Keeps queueing, persistence and backend initialization centralized.
 */
import { logger } from '../../utils/logger';
import { getAnalyticsInstance } from '../firebase';
import { storageService } from '../storageService';
import { getPrivacySettingsSync, setTelemetryConsent } from '../privacyModeService';
import { ANALYTICS_CONFIG, ANALYTICS_EVENTS, ANALYTICS_STORAGE_KEYS } from './constants';

export class AnalyticsService {
  constructor() {
    this.enabled = false;
    this.queue = [];
    this.initialized = false;
    this.flushTimer = null;
    this.firebaseAnalytics = null;
    this.firebaseLogEvent = null;
    this.consentGiven = false;
    this.flushInFlight = false;
    this.privacyListenerAttached = false;
    this.handlePrivacySettingsUpdated = this.handlePrivacySettingsUpdated.bind(this);
  }

  syncPrivacyMode() {
    const settings = getPrivacySettingsSync();
    this.enabled = settings.telemetryEnabled === true;
    this.consentGiven = settings.telemetryEnabled === true;
    return settings;
  }

  handlePrivacySettingsUpdated() {
    const wasEnabled = this.enabled;
    const settings = this.syncPrivacyMode();

    if (!settings.telemetryEnabled) {
      this.queue = [];
      this.clearStoredEvents();
      this.stopPeriodicFlush();
      this.firebaseAnalytics = null;
      this.firebaseLogEvent = null;
      logger.log('[Analytics] Telemetry hard-killed');
      return;
    }

    if (this.initialized && !wasEnabled) {
      void this.initializeBackend();
      this.startPeriodicFlush();
    }
  }

  stubEvent(eventName, params = {}) {
    logger.log('[AnalyticsStub]', eventName, params);
    return null;
  }

  /**
   * Initialize analytics
   */
  init() {
    if (this.initialized) return;

    this.syncPrivacyMode();
    this.initialized = true;

    if (!this.privacyListenerAttached && typeof window !== 'undefined') {
      window.addEventListener('huzur:privacy-settings-updated', this.handlePrivacySettingsUpdated);
      this.privacyListenerAttached = true;
    }

    if (!this.enabled || !this.consentGiven) {
      this.queue = [];
      this.clearStoredEvents();
      logger.log('[Analytics] Zero-telemetry mode active; backend disabled');
      return;
    }

    // Async backend initialization (non-blocking)
    void this.initializeBackend();
    
    // Process queued events
    this.processQueue();

    this.startPeriodicFlush();
    
    logger.log('[Analytics] Initialized');
  }

  async initializeBackend() {
    if (!this.enabled || !this.consentGiven) {
      this.firebaseAnalytics = null;
      this.firebaseLogEvent = null;
      return;
    }

    try {
      const { analytics, logEvent } = await getAnalyticsInstance();
      this.firebaseAnalytics = analytics;
      this.firebaseLogEvent = logEvent;
      if (analytics && logEvent) {
        logger.log('[Analytics] Firebase backend ready');
        await this.flushStoredEvents();
      } else {
        logger.warn('[Analytics] Firebase backend unavailable, local queue mode');
      }
    } catch (error) {
      logger.error('[Analytics] Backend initialization failed', error);
    }
  }

  startPeriodicFlush() {
    if (this.flushTimer || !this.enabled || !this.consentGiven) return;
    this.flushTimer = setInterval(() => {
      void this.flushStoredEvents();
    }, ANALYTICS_CONFIG.FLUSH_INTERVAL_MS);
  }

  stopPeriodicFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled) {
    const previous = this.enabled;
    const settings = setTelemetryConsent(enabled === true);
    this.enabled = settings.telemetryEnabled === true;
    this.consentGiven = settings.telemetryEnabled === true;

    if (!this.enabled) {
      this.queue = [];
      this.clearStoredEvents();
      this.stopPeriodicFlush();
      this.firebaseAnalytics = null;
      this.firebaseLogEvent = null;
    } else if (this.initialized && !previous) {
      void this.initializeBackend();
      this.startPeriodicFlush();
      void this.flushStoredEvents();
    }

    logger.log('[Analytics]', this.enabled ? 'Enabled' : 'Disabled');
  }

  /**
   * Track an event
   */
  logEvent(eventName, params = {}) {
    if (!this.enabled || !this.consentGiven) {
      return this.stubEvent(eventName, params);
    }

    const event = {
      name: eventName,
      params: {
        ...params,
        timestamp: new Date().toISOString(),
        platform: this.getPlatform(),
        locale: this.getLocale(),
        country: this.getCountry(),
        timezone: this.getTimezone()
      }
    };

    // If not initialized, queue the event
    if (!this.initialized) {
      this.queue.push(event);
      return;
    }

    void this.sendEvent(event);
  }

  setUserProperty(name, value) {
    if (!this.enabled || !this.consentGiven) {
      return this.stubEvent('user_property', { name, value });
    }
    
    // Store in localStorage for now
    const properties = storageService.getItem(ANALYTICS_STORAGE_KEYS.USER_PROPERTIES, {});
    properties[name] = value;
    storageService.setItem(ANALYTICS_STORAGE_KEYS.USER_PROPERTIES, properties);

    if (this.firebaseAnalytics) {
      import('firebase/analytics').then(({ setUserProperties }) => {
        try {
          setUserProperties(this.firebaseAnalytics, { [name]: value });
        } catch (error) {
          logger.error('[Analytics] setUserProperties failed', error);
        }
      }).catch((error) => {
        logger.error('[Analytics] firebase/analytics import for setUserProperties failed', error);
      });
    }
    
    logger.log('[Analytics] User Property:', name, value);
  }

  /**
   * Set user ID
   */
  setUserId(userId) {
    if (!this.enabled || !this.consentGiven) {
      return this.stubEvent('user_id', { userId });
    }
    storageService.setString(ANALYTICS_STORAGE_KEYS.USER_ID, userId);

    if (this.firebaseAnalytics) {
      import('firebase/analytics').then(({ setUserId }) => {
        try {
          setUserId(this.firebaseAnalytics, userId);
        } catch (error) {
          logger.error('[Analytics] setUserId failed', error);
        }
      }).catch((error) => {
        logger.error('[Analytics] firebase/analytics import for setUserId failed', error);
      });
    }

    logger.log('[Analytics] User ID set');
  }

  /**
   * Get platform info
   */
  getPlatform() {
    const userAgent = navigator.userAgent;
    if (/Android/i.test(userAgent)) return 'android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
    if (/Windows/i.test(userAgent)) return 'windows';
    if (/Mac/i.test(userAgent)) return 'macos';
    if (/Linux/i.test(userAgent)) return 'linux';
    return 'web';
  }

  /**
   * Get active locale
   */
  getLocale() {
    try {
      return storageService.getString('i18nextLng', navigator.language || 'tr');
    } catch (error) {
      logger.error('[Analytics] getLocale failed', error);
      return 'tr';
    }
  }

  /**
   * Get country from locale
   */
  getCountry() {
    try {
      const locale = this.getLocale();
      const localeStr = Array.isArray(locale) ? locale[0] : String(locale);
      const normalized = localeStr.replace('_', '-');
      const parts = normalized.split('-');
      return (parts[1] || 'TR').toUpperCase();
    } catch (error) {
      logger.error('[Analytics] getCountry failed', error);
      return 'TR';
    }
  }

  /**
   * Get timezone info
   */
  getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
    } catch (error) {
      logger.error('[Analytics] getTimezone failed', error);
      return 'Europe/Istanbul';
    }
  }

  /**
   * Get milestone label
   */
  getMilestoneLabel(days) {
    if (days >= 365) return '1_year';
    if (days >= 180) return '6_months';
    if (days >= 90) return '3_months';
    if (days >= 30) return '1_month';
    if (days >= 14) return '2_weeks';
    if (days >= 7) return '1_week';
    return `${days}_days`;
  }

  /**
   * Get session count
   */
  getSessionCount() {
    const count = parseInt(storageService.getString(ANALYTICS_STORAGE_KEYS.SESSION_COUNT, '0'), 10);
    return count;
  }

  /**
   * Increment session count
   */
  incrementSessionCount() {
    const count = this.getSessionCount() + 1;
    storageService.setString(ANALYTICS_STORAGE_KEYS.SESSION_COUNT, count.toString());
    return count;
  }

  /**
   * Process queued events
   */
  processQueue() {
    if (!this.enabled || !this.consentGiven) {
      this.queue = [];
      return;
    }

    while (this.queue.length > 0) {
      const event = this.queue.shift();
      void this.sendEvent(event);
    }
  }

  /**
   * Send event to analytics
   * Firebase available olduÄŸunda anÄ±nda gÃ¶nderir, deÄŸilse local kuyruÄŸa yazar.
   */
  async sendEvent(event) {
    if (!this.enabled || !this.consentGiven) {
      return this.stubEvent(event?.name || 'unknown', event?.params || {});
    }

    // Log to console in development
    logger.log('[Analytics]', event.name, event.params);

    // 1) Primary path: Firebase Analytics backend
    if (this.firebaseAnalytics && this.firebaseLogEvent) {
      try {
        this.firebaseLogEvent(this.firebaseAnalytics, event.name, event.params);
        storageService.setString(ANALYTICS_STORAGE_KEYS.LAST_FLUSH_AT, new Date().toISOString());
        return;
      } catch (error) {
        logger.error('[Analytics] Immediate Firebase event send failed', error);
      }
    }

    // 2) Fallback path: Store locally for retry/batch flush
    this.storeEventLocally({ ...event, retryCount: event.retryCount || 0 });
  }

  async flushStoredEvents() {
    if (!this.enabled || !this.consentGiven) {
      this.clearStoredEvents();
      return;
    }
    if (this.flushInFlight) return;
    if (!this.firebaseAnalytics || !this.firebaseLogEvent) return;

    const events = this.getStoredEvents();
    if (!events.length) return;

    this.flushInFlight = true;
    try {
      const batch = events.slice(0, ANALYTICS_CONFIG.FLUSH_BATCH_SIZE);
      const remaining = [];

      for (const event of batch) {
        try {
          this.firebaseLogEvent(this.firebaseAnalytics, event.name, event.params);
        } catch (error) {
          logger.error(`[Analytics] Batch event flush failed for ${event.name}`, error);
          const nextRetry = (event.retryCount || 0) + 1;
          if (nextRetry <= ANALYTICS_CONFIG.MAX_RETRIES) {
            remaining.push({ ...event, retryCount: nextRetry });
          }
        }
      }

      const tail = events.slice(batch.length);
      const nextStore = [...remaining, ...tail].slice(-ANALYTICS_CONFIG.MAX_LOCAL_EVENTS);
      storageService.setItem(ANALYTICS_STORAGE_KEYS.EVENTS, nextStore);
      storageService.setString(ANALYTICS_STORAGE_KEYS.LAST_FLUSH_AT, new Date().toISOString());
    } catch (error) {
      logger.error('[Analytics] flushStoredEvents failed', error);
    } finally {
      this.flushInFlight = false;
    }
  }

  /**
   * Store event locally for batch upload
   */
  storeEventLocally(event) {
    try {
      const events = storageService.getItem(ANALYTICS_STORAGE_KEYS.EVENTS, []);
      events.push(event);
      
      // Keep only last 1000 events
      if (events.length > ANALYTICS_CONFIG.MAX_LOCAL_EVENTS) {
        events.splice(0, events.length - ANALYTICS_CONFIG.MAX_LOCAL_EVENTS);
      }
      
      storageService.setItem(ANALYTICS_STORAGE_KEYS.EVENTS, events);
    } catch (error) {
      logger.error('[Analytics] storeEventLocally failed', error);
    }
  }

  /**
   * Get stored events
   */
  getStoredEvents() {
    try {
      return storageService.getItem(ANALYTICS_STORAGE_KEYS.EVENTS, []);
    } catch (error) {
      logger.error('[Analytics] getStoredEvents failed', error);
      return [];
    }
  }

  /**
   * Clear stored events
   */
  clearStoredEvents() {
    storageService.removeItem(ANALYTICS_STORAGE_KEYS.EVENTS);
  }

  /**
   * Get analytics summary
   */
  getSummary() {
    const events = this.getStoredEvents();
    const summary = {
      totalEvents: events.length,
      eventsByType: {},
      lastEvent: events.length > 0 ? events[events.length - 1].params.timestamp : null
    };

    events.forEach(event => {
      summary.eventsByType[event.name] = (summary.eventsByType[event.name] || 0) + 1;
    });

    return summary;
  }
}
