import { Capacitor } from "@capacitor/core";
import { isTelemetryEnabledSync } from "./privacyModeService";
import { logger } from "../utils/logger";

type FirebaseApp = import("firebase/app").FirebaseApp;
type AppCheck = import("firebase/app-check").AppCheck;
type InitializeAppCheckOptions = Parameters<typeof import("firebase/app-check").initializeAppCheck>[1];
type AppCheckProvider = InitializeAppCheckOptions["provider"];
type Auth = import("firebase/auth").Auth;
type Firestore = import("firebase/firestore").Firestore;
type Functions = import("firebase/functions").Functions;
type Analytics = import("firebase/analytics").Analytics;
type FirebaseLogEvent = typeof import("firebase/analytics").logEvent;
type RemoteConfig = import("firebase/remote-config").RemoteConfig;
type RemoteConfigFetchAndActivate = typeof import("firebase/remote-config").fetchAndActivate;
type RemoteConfigGetValue = typeof import("firebase/remote-config").getValue;

interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId: string | undefined;
}

interface AppCheckTokenResult {
  token: string;
  expireTimeMillis: number;
}

interface AnalyticsInstanceResult {
  analytics: Analytics | null;
  logEvent: FirebaseLogEvent | null;
}

interface RemoteConfigInstanceResult {
  remoteConfig: RemoteConfig | null;
  fetchAndActivate: RemoteConfigFetchAndActivate | null;
  getValue: RemoteConfigGetValue | null;
}

interface NativePrivacySdkInitResult {
  success?: boolean;
  skipped?: boolean;
  platform?: string;
  telemetryEnabled?: boolean;
  firebaseInitialized?: boolean;
  analyticsConfigured?: boolean;
  crashlyticsEnabled?: boolean;
  adMobInitialized?: boolean;
  error?: string;
}

interface NativePrivacySdkPlugin {
  initializePrivacySdks?: (options: { telemetryEnabled: boolean }) => Promise<NativePrivacySdkInitResult>;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isNativeRuntime = (): boolean => {
  try {
    return Capacitor.getPlatform() !== "web";
  } catch (error) {
    logger.error("[Firebase] Native platform detection failed", error);
    return false;
  }
};

const getFallbackExpireTimeMillis = (): number => Date.now() + 30 * 60 * 1000;

const configureWebAppCheckDebugToken = (): void => {
  if (!import.meta.env.DEV || typeof self === "undefined") {
    return;
  }

  const debugToken =
    import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN ||
    import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;

  if (!debugToken) {
    return;
  }

  (self as Window & { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN =
    debugToken === "true" ? true : debugToken;
};

const getWebAppCheckProvider = async (): Promise<AppCheckProvider | null> => {
  const enterpriseSiteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;
  const recaptchaSiteKey = enterpriseSiteKey || import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const providerType = String(import.meta.env.VITE_RECAPTCHA_PROVIDER || "").toLowerCase();

  if (!recaptchaSiteKey) {
    return null;
  }

  const { ReCaptchaEnterpriseProvider, ReCaptchaV3Provider } = await import("firebase/app-check");

  if (enterpriseSiteKey || providerType === "enterprise") {
    return new ReCaptchaEnterpriseProvider(recaptchaSiteKey);
  }

  return new ReCaptchaV3Provider(recaptchaSiteKey);
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _appCheck: AppCheck | null = null;
let _functions: Functions | null = null;
let _analytics: Analytics | null = null;
let _analyticsLogEvent: FirebaseLogEvent | null = null;
let _remoteConfig: RemoteConfig | null = null;
let _nativePrivacySdkInit: Promise<NativePrivacySdkInitResult> | null = null;
let _nativePrivacySdkInitialized = false;

const ensureAppCheck = async (app: FirebaseApp): Promise<AppCheck | null> => {
  // Development-only bypass for local debug builds. Never enable this in production.
  if (import.meta.env.VITE_FIREBASE_APPCHECK_DISABLE === "true") {
    logger.warn("[Firebase] App Check disabled via VITE_FIREBASE_APPCHECK_DISABLE", {
      platform: Capacitor.getPlatform(),
    });
    return null;
  }

  if (_appCheck) {
    return _appCheck;
  }

  const { initializeAppCheck } = await import("firebase/app-check");

  if (!isNativeRuntime()) {
    const provider = await getWebAppCheckProvider();
    if (!provider) {
      logger.warn("[Firebase] Web App Check skipped: reCAPTCHA site key is missing");
      return null;
    }

    configureWebAppCheckDebugToken();

    _appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true,
    });

    return _appCheck;
  }

  // App Check is a security control, not analytics telemetry. It must be
  // initialized before Auth/Firestore even when optional telemetry is disabled.
  const nativeInitialization = await initializeTelemetryNativeSdks();
  if (nativeInitialization.success !== true) {
    logger.warn("[Firebase] Native App Check skipped: privacy SDK initialization failed", nativeInitialization);
    return null;
  }

  const [{ FirebaseAppCheck }, { CustomProvider }] = await Promise.all([
    import("@capacitor-firebase/app-check"),
    import("firebase/app-check"),
  ]);

  const provider = new CustomProvider({
    getToken: async (): Promise<AppCheckTokenResult> => {
      try {
        const result = await FirebaseAppCheck.getToken({ forceRefresh: false });
        return {
          token: result.token,
          expireTimeMillis: result.expireTimeMillis || getFallbackExpireTimeMillis(),
        };
      } catch (error) {
        logger.error("[Firebase] Native App Check token unavailable", error);
        throw error;
      }
    },
  });

  _appCheck = initializeAppCheck(app, {
    provider,
    isTokenAutoRefreshEnabled: true,
  });

  return _appCheck;
};

const ensureApp = async (): Promise<FirebaseApp> => {
  if (!_app) {
    const { initializeApp } = await import("firebase/app");
    _app = initializeApp(firebaseConfig);
  }
  return _app;
};

const getNativePrivacySdkPlugin = async (): Promise<NativePrivacySdkPlugin | null> => {
  if (!isNativeRuntime() || typeof window === "undefined") {
    return null;
  }

  const capacitor = (window as typeof window & {
    Capacitor?: {
      Plugins?: {
        AppCheck?: NativePrivacySdkPlugin;
      };
    };
  }).Capacitor;

  if (capacitor?.Plugins?.AppCheck) {
    return capacitor.Plugins.AppCheck;
  }

  try {
    const { AppCheck } = await import("../plugins/AppCheckPlugin");
    return AppCheck as NativePrivacySdkPlugin;
  } catch (error) {
    logger.warn("[Firebase] Native AppCheck plugin registration unavailable", error);
    return null;
  }
};

export const initializeTelemetryNativeSdks = async (): Promise<NativePrivacySdkInitResult> => {
  const telemetryEnabled = isTelemetryEnabledSync();

  if (!isNativeRuntime()) {
    return { success: true, skipped: true, platform: Capacitor.getPlatform(), telemetryEnabled };
  }

  if (_nativePrivacySdkInitialized) {
    return { success: true, platform: Capacitor.getPlatform(), telemetryEnabled };
  }

  const plugin = await getNativePrivacySdkPlugin();
  if (typeof plugin?.initializePrivacySdks !== "function") {
    return { success: false, skipped: true, platform: Capacitor.getPlatform(), telemetryEnabled: true };
  }

  if (!_nativePrivacySdkInit) {
    _nativePrivacySdkInit = plugin.initializePrivacySdks({ telemetryEnabled })
      .then((result) => {
        _nativePrivacySdkInitialized = result?.success === true;
        return result;
      })
      .catch((error) => {
        logger.warn("[Firebase] Native privacy SDK initialization failed", error);
        return {
          success: false,
          platform: Capacitor.getPlatform(),
          telemetryEnabled,
          error: error instanceof Error ? error.message : String(error),
        };
      })
      .finally(() => {
        _nativePrivacySdkInit = null;
      });
  }

  return _nativePrivacySdkInit;
};

const createAsyncOnlyProxy = <T extends object>(name: string): T =>
  new Proxy({} as T, {
    get() {
      throw new Error(`[Firebase] ${name} is async-only. Use get${name === "db" ? "Db" : "AuthInstance"}() instead.`);
    },
    set() {
      throw new Error(`[Firebase] ${name} is async-only. Use a getter before writing.`);
    }
  });

const getDbInstance = async (): Promise<Firestore> => {
  if (!_db) {
    const app = await ensureApp();
    await ensureAppCheck(app);
    const {
      initializeFirestore,
      persistentLocalCache,
      persistentMultipleTabManager,
    } = await import("firebase/firestore");
    _db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  }
  return _db;
};

const getAuthRaw = async (): Promise<Auth> => {
  if (!_auth) {
    const app = await ensureApp();
    await ensureAppCheck(app);
    const { getAuth } = await import("firebase/auth");
    _auth = getAuth(app);
  }
  return _auth;
};

export const db = createAsyncOnlyProxy<Firestore>("db");
export const auth = createAsyncOnlyProxy<Auth>("auth");

export const getDb = getDbInstance;
export const getAuthInstance = getAuthRaw;

export const getFunctionsInstance = async (): Promise<Functions> => {
  if (!_functions) {
    const { getFunctions } = await import("firebase/functions");
    const app = await ensureApp();
    await ensureAppCheck(app);
    _functions = getFunctions(app, "europe-west1");
  }
  return _functions;
};

export const getAnalyticsInstance = async (): Promise<AnalyticsInstanceResult> => {
  if (!isTelemetryEnabledSync()) {
    _analytics = null;
    _analyticsLogEvent = null;
    return { analytics: null, logEvent: null };
  }

  if (_analytics && _analyticsLogEvent) {
    return { analytics: _analytics, logEvent: _analyticsLogEvent };
  }

  try {
    await initializeTelemetryNativeSdks();
    const { isSupported, getAnalytics, logEvent } = await import("firebase/analytics");
    const supported = await isSupported();
    if (!supported) {
      return { analytics: null, logEvent: null };
    }

    const app = await ensureApp();
    _analytics = getAnalytics(app);
    _analyticsLogEvent = logEvent;
    return { analytics: _analytics, logEvent: _analyticsLogEvent };
  } catch (error) {
    logger.error("[Firebase] Analytics initialization failed", error);
    return { analytics: null, logEvent: null };
  }
};

export const getRemoteConfigInstance = async (): Promise<RemoteConfigInstanceResult> => {
  if (_remoteConfig) {
    const { fetchAndActivate, getValue } = await import("firebase/remote-config");
    return { remoteConfig: _remoteConfig, fetchAndActivate, getValue };
  }

  try {
    const { getRemoteConfig, fetchAndActivate, getValue, isSupported } = await import("firebase/remote-config");
    const supported = await isSupported();
    if (!supported) {
      return { remoteConfig: null, fetchAndActivate: null, getValue: null };
    }

    const app = await ensureApp();
    _remoteConfig = getRemoteConfig(app);
    _remoteConfig.settings = {
      minimumFetchIntervalMillis: import.meta.env.DEV ? 60_000 : 15 * 60 * 1000,
      fetchTimeoutMillis: 8_000,
    };
    return { remoteConfig: _remoteConfig, fetchAndActivate, getValue };
  } catch (error) {
    logger.warn("[Firebase] Remote Config unavailable", error);
    return { remoteConfig: null, fetchAndActivate: null, getValue: null };
  }
};
