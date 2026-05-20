import { logger } from "../../utils/logger";
import { getAnalyticsInstance } from "../firebase";
import { storageService } from "../storageService";
import { getPrivacySettingsSync, setTelemetryConsent } from "../privacyModeService";
import { ANALYTICS_CONFIG, ANALYTICS_EVENTS, ANALYTICS_STORAGE_KEYS } from "./constants";
import type { Analytics, LogEventFn } from "firebase/analytics";

const PII_FIELDS = ["userId", "referralCode", "familyId", "email", "phone", "uid", "user_id"];

interface AnalyticsEvent {
  name: string;
  params: Record<string, unknown>;
  retryCount?: number;
}

interface AnalyticsSummary {
  totalEvents: number;
  eventsByType: Record<string, number>;
  lastEvent: string | null;
}

const hashAnonymize = (value: string): string | null => {
  if (!value || typeof value !== "string") return null;
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `h_${Math.abs(hash).toString(36)}`;
};

const sanitizeParams = (params: Record<string, unknown>): Record<string, unknown> => {
  const sanitized = { ...params };
  PII_FIELDS.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = hashAnonymize(sanitized[field] as string);
    }
  });
  sanitized.pii_sanitized = true;
  return sanitized;
};

export class AnalyticsService {
  enabled: boolean;
  queue: AnalyticsEvent[];
  initialized: boolean;
  flushTimer: ReturnType<typeof setInterval> | null;
  firebaseAnalytics: Analytics | null;
  firebaseLogEvent: LogEventFn | null;
  consentGiven: boolean;
  flushInFlight: boolean;
  privacyListenerAttached: boolean;
  private boundHandler: () => void;
  private boundOnlineHandler: () => void;
  private boundOfflineHandler: () => void;

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
    this.boundHandler = this.handlePrivacySettingsUpdated.bind(this);
    this.boundOnlineHandler = this.handleNetworkOnline.bind(this);
    this.boundOfflineHandler = this.handleNetworkOffline.bind(this);
  }

  isOnline(): boolean {
    if (typeof navigator === "undefined" || typeof navigator.onLine !== "boolean") {
      return true;
    }

    return navigator.onLine;
  }

  attachNetworkListeners(): void {
    if (typeof window === "undefined") return;

    window.removeEventListener("online", this.boundOnlineHandler);
    window.removeEventListener("offline", this.boundOfflineHandler);
    window.addEventListener("online", this.boundOnlineHandler);
    window.addEventListener("offline", this.boundOfflineHandler);
  }

  detachNetworkListeners(): void {
    if (typeof window === "undefined") return;

    window.removeEventListener("online", this.boundOnlineHandler);
    window.removeEventListener("offline", this.boundOfflineHandler);
  }

  handleNetworkOnline(): void {
    if (!this.enabled || !this.consentGiven) return;

    logger.log("[Analytics] Network online; resuming flush");
    void this.initializeBackend().then(() => {
      this.startPeriodicFlush();
      void this.flushStoredEvents();
    });
  }

  handleNetworkOffline(): void {
    logger.log("[Analytics] Network offline; pausing flush");
    this.stopPeriodicFlush();
  }

  syncPrivacyMode(): { telemetryEnabled: boolean } {
    const settings = getPrivacySettingsSync();
    this.enabled = settings.telemetryEnabled === true;
    this.consentGiven = settings.telemetryEnabled === true;
    return settings;
  }

  handlePrivacySettingsUpdated(): void {
    const wasEnabled = this.enabled;
    const settings = this.syncPrivacyMode();

    if (!settings.telemetryEnabled) {
      this.queue = [];
      this.clearStoredEvents();
      this.stopPeriodicFlush();
      this.detachNetworkListeners();
      this.firebaseAnalytics = null;
      this.firebaseLogEvent = null;
      logger.log("[Analytics] Telemetry hard-killed");
      return;
    }

    if (this.initialized && !wasEnabled) {
      void this.initializeBackend();
      this.startPeriodicFlush();
    }
  }

  stubEvent(eventName: string, params: Record<string, unknown> = {}): null {
    logger.log("[AnalyticsStub]", eventName, params);
    return null;
  }

  init(): void {
    if (this.initialized) return;

    this.syncPrivacyMode();
    this.initialized = true;

    if (!this.privacyListenerAttached && typeof window !== "undefined") {
      window.addEventListener("huzur:privacy-settings-updated", this.boundHandler);
      this.privacyListenerAttached = true;
    }
    this.attachNetworkListeners();

    if (!this.enabled || !this.consentGiven) {
      this.queue = [];
      this.clearStoredEvents();
      this.stopPeriodicFlush();
      logger.log("[Analytics] Zero-telemetry mode active; backend disabled");
      return;
    }

    void this.initializeBackend();
    this.processQueue();
    this.startPeriodicFlush();

    logger.log("[Analytics] Initialized");
  }

  async initializeBackend(): Promise<void> {
    if (!this.enabled || !this.consentGiven) {
      this.firebaseAnalytics = null;
      this.firebaseLogEvent = null;
      return;
    }

    if (!this.isOnline()) {
      logger.log("[Analytics] Backend initialization skipped while offline");
      return;
    }

    try {
      const { analytics, logEvent } = await getAnalyticsInstance();
      this.firebaseAnalytics = analytics;
      this.firebaseLogEvent = logEvent;
      if (analytics && logEvent) {
        logger.log("[Analytics] Firebase backend ready");
        await this.flushStoredEvents();
      } else {
        logger.warn("[Analytics] Firebase backend unavailable, local queue mode");
      }
    } catch (error) {
      logger.error("[Analytics] Backend initialization failed", error);
    }
  }

  startPeriodicFlush(): void {
    if (this.flushTimer || !this.enabled || !this.consentGiven) return;
    if (!this.isOnline()) return;
    this.flushTimer = setInterval(() => {
      void this.flushStoredEvents();
    }, ANALYTICS_CONFIG.FLUSH_INTERVAL_MS);
  }

  stopPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  setEnabled(enabled: boolean): void {
    const previous = this.enabled;
    const settings = setTelemetryConsent(enabled === true);
    this.enabled = settings.telemetryEnabled === true;
    this.consentGiven = settings.telemetryEnabled === true;

    if (!this.enabled) {
      this.queue = [];
      this.clearStoredEvents();
      this.stopPeriodicFlush();
      this.detachNetworkListeners();
      this.firebaseAnalytics = null;
      this.firebaseLogEvent = null;
    } else if (this.initialized && !previous) {
      this.attachNetworkListeners();
      void this.initializeBackend();
      this.startPeriodicFlush();
      void this.flushStoredEvents();
    }

    logger.log("[Analytics]", this.enabled ? "Enabled" : "Disabled");
  }

  logEvent(eventName: string, params: Record<string, unknown> = {}): void {
    if (!this.enabled || !this.consentGiven) {
      return this.stubEvent(eventName, params);
    }

    const sanitizedParams = sanitizeParams(params);

    const event: AnalyticsEvent = {
      name: eventName,
      params: {
        ...sanitizedParams,
        timestamp: new Date().toISOString(),
        platform: this.getPlatform(),
        locale: this.getLocale(),
        country: this.getCountry(),
        timezone: this.getTimezone(),
      },
    };

    if (!this.initialized) {
      this.queue.push(event);
      return;
    }

    void this.sendEvent(event);
  }

  setUserProperty(name: string, value: string): void {
    if (!this.enabled || !this.consentGiven) {
      return this.stubEvent("user_property", { name, value });
    }

    const properties = storageService.getItem<Record<string, string>>(ANALYTICS_STORAGE_KEYS.USER_PROPERTIES, {});
    properties[name] = value;
    storageService.setItem(ANALYTICS_STORAGE_KEYS.USER_PROPERTIES, properties);

    if (this.firebaseAnalytics) {
      import("firebase/analytics")
        .then(({ setUserProperties }) => {
          try {
            setUserProperties(this.firebaseAnalytics!, { [name]: value });
          } catch (error) {
            logger.error("[Analytics] setUserProperties failed", error);
          }
        })
        .catch((error) => {
          logger.error("[Analytics] firebase/analytics import for setUserProperties failed", error);
        });
    }

    logger.log("[Analytics] User Property:", name, value);
  }

  setUserId(userId: string): void {
    if (!this.enabled || !this.consentGiven) {
      return this.stubEvent("user_id", { userId });
    }
    storageService.setString(ANALYTICS_STORAGE_KEYS.USER_ID, userId);

    if (this.firebaseAnalytics) {
      import("firebase/analytics")
        .then(({ setUserId }) => {
          try {
            setUserId(this.firebaseAnalytics!, userId);
          } catch (error) {
            logger.error("[Analytics] setUserId failed", error);
          }
        })
        .catch((error) => {
          logger.error("[Analytics] firebase/analytics import for setUserId failed", error);
        });
    }

    logger.log("[Analytics] User ID set");
  }

  getPlatform(): string {
    const userAgent = navigator.userAgent;
    if (/Android/i.test(userAgent)) return "android";
    if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
    if (/Windows/i.test(userAgent)) return "windows";
    if (/Mac/i.test(userAgent)) return "macos";
    if (/Linux/i.test(userAgent)) return "linux";
    return "web";
  }

  getLocale(): string {
    try {
      return storageService.getString("i18nextLng", navigator.language || "tr");
    } catch (error) {
      logger.error("[Analytics] getLocale failed", error);
      return "tr";
    }
  }

  getCountry(): string {
    try {
      const locale = this.getLocale();
      const localeStr = Array.isArray(locale) ? locale[0] : String(locale);
      const normalized = localeStr.replace("_", "-");
      const parts = normalized.split("-");
      return (parts[1] || "TR").toUpperCase();
    } catch (error) {
      logger.error("[Analytics] getCountry failed", error);
      return "TR";
    }
  }

  getTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul";
    } catch (error) {
      logger.error("[Analytics] getTimezone failed", error);
      return "Europe/Istanbul";
    }
  }

  getMilestoneLabel(days: number): string {
    if (days >= 365) return "1_year";
    if (days >= 180) return "6_months";
    if (days >= 90) return "3_months";
    if (days >= 30) return "1_month";
    if (days >= 14) return "2_weeks";
    if (days >= 7) return "1_week";
    return `${days}_days`;
  }

  getSessionCount(): number {
    const count = parseInt(storageService.getString(ANALYTICS_STORAGE_KEYS.SESSION_COUNT, "0"), 10);
    return count;
  }

  incrementSessionCount(): number {
    const count = this.getSessionCount() + 1;
    storageService.setString(ANALYTICS_STORAGE_KEYS.SESSION_COUNT, count.toString());
    return count;
  }

  processQueue(): void {
    if (!this.enabled || !this.consentGiven) {
      this.queue = [];
      return;
    }

    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) void this.sendEvent(event);
    }
  }

  async sendEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.enabled || !this.consentGiven) {
      return this.stubEvent(event?.name || "unknown", event?.params || {});
    }

    logger.log("[Analytics]", event.name, event.params);

    if (!this.isOnline()) {
      this.storeEventLocally({ ...event, retryCount: event.retryCount || 0 });
      return;
    }

    if (this.firebaseAnalytics && this.firebaseLogEvent) {
      try {
        this.firebaseLogEvent(this.firebaseAnalytics, event.name, event.params);
        storageService.setString(ANALYTICS_STORAGE_KEYS.LAST_FLUSH_AT, new Date().toISOString());
        return;
      } catch (error) {
        logger.error("[Analytics] Immediate Firebase event send failed", error);
      }
    }

    this.storeEventLocally({ ...event, retryCount: event.retryCount || 0 });
  }

  async flushStoredEvents(): Promise<void> {
    if (!this.enabled || !this.consentGiven) {
      this.clearStoredEvents();
      return;
    }
    if (!this.isOnline()) return;
    if (this.flushInFlight) return;
    if (!this.firebaseAnalytics || !this.firebaseLogEvent) return;

    const events = this.getStoredEvents();
    if (!events.length) return;

    this.flushInFlight = true;
    try {
      const batch = events.slice(0, ANALYTICS_CONFIG.FLUSH_BATCH_SIZE);
      const remaining: AnalyticsEvent[] = [];

      for (const event of batch) {
        try {
          this.firebaseLogEvent!(this.firebaseAnalytics!, event.name, event.params);
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
      logger.error("[Analytics] flushStoredEvents failed", error);
    } finally {
      this.flushInFlight = false;
    }
  }

  storeEventLocally(event: AnalyticsEvent): void {
    try {
      const events = storageService.getItem<AnalyticsEvent[]>(ANALYTICS_STORAGE_KEYS.EVENTS, []);
      events.push(event);

      if (events.length > ANALYTICS_CONFIG.MAX_LOCAL_EVENTS) {
        events.splice(0, events.length - ANALYTICS_CONFIG.MAX_LOCAL_EVENTS);
      }

      storageService.setItem(ANALYTICS_STORAGE_KEYS.EVENTS, events);
    } catch (error) {
      logger.error("[Analytics] storeEventLocally failed", error);
    }
  }

  getStoredEvents(): AnalyticsEvent[] {
    try {
      return storageService.getItem<AnalyticsEvent[]>(ANALYTICS_STORAGE_KEYS.EVENTS, []);
    } catch (error) {
      logger.error("[Analytics] getStoredEvents failed", error);
      return [];
    }
  }

  clearStoredEvents(): void {
    storageService.removeItem(ANALYTICS_STORAGE_KEYS.EVENTS);
  }

  getSummary(): AnalyticsSummary {
    const events = this.getStoredEvents();
    const summary: AnalyticsSummary = {
      totalEvents: events.length,
      eventsByType: {},
      lastEvent: events.length > 0 ? (events[events.length - 1].params.timestamp as string) || null : null,
    };

    events.forEach((event) => {
      summary.eventsByType[event.name] = (summary.eventsByType[event.name] || 0) + 1;
    });

    return summary;
  }
}
