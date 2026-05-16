import { Capacitor } from "@capacitor/core";
import { FirebaseAppCheck } from "@capacitor-firebase/app-check";
import { initializeApp } from "firebase/app";
import {
    CustomProvider,
    ReCaptchaEnterpriseProvider,
    ReCaptchaV3Provider,
    initializeAppCheck,
} from "firebase/app-check";
import { getAuth } from "firebase/auth";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from "firebase/firestore";
import { isTelemetryEnabledSync } from "./privacyModeService";
import { logger } from "../utils/logger";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const isNativeRuntime = () => {
    try {
        return Capacitor.getPlatform() !== "web";
    } catch (error) {
        logger.error('[Firebase] Native platform detection failed', error);
        return false;
    }
};

const getFallbackExpireTimeMillis = () => Date.now() + (30 * 60 * 1000);

const configureWebAppCheckDebugToken = () => {
    if (!import.meta.env.DEV || typeof self === "undefined") {
        return;
    }

    const debugToken = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN
        || import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;

    if (!debugToken) {
        return;
    }

    self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken === "true" ? true : debugToken;
};

const getWebAppCheckProvider = () => {
    const enterpriseSiteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;
    const recaptchaSiteKey = enterpriseSiteKey || import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const providerType = String(import.meta.env.VITE_RECAPTCHA_PROVIDER || "").toLowerCase();

    if (!recaptchaSiteKey) {
        return null;
    }

    if (enterpriseSiteKey || providerType === "enterprise") {
        return new ReCaptchaEnterpriseProvider(recaptchaSiteKey);
    }

    return new ReCaptchaV3Provider(recaptchaSiteKey);
};

// ─── Lazy Singletons ────────────────────────────────────────────
// Firebase SDK instances are NOT created on module load.
// Each singleton is created on first access via the exported
// getter functions, so cold start has zero Firebase network activity.

let _app = null;
let _db = null;
let _auth = null;
let _appCheck = null;
let _appCheckDisabled = false;
let _functions = null;
let _analytics = null;
let _analyticsLogEvent = null;
let _remoteConfig = null;

/**
 * Lazy App Check — initialized after app is created.
 */
const ensureAppCheck = (app) => {
    if (_appCheck || _appCheckDisabled) {
        return _appCheck;
    }

    if (!isNativeRuntime()) {
        const provider = getWebAppCheckProvider();
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

    const provider = new CustomProvider({
        getToken: async () => {
            try {
                const result = await FirebaseAppCheck.getToken({ forceRefresh: false });
                return {
                    token: result.token,
                    expireTimeMillis: result.expireTimeMillis || getFallbackExpireTimeMillis(),
                };
            } catch (error) {
                logger.warn("[Firebase] App Check token unavailable, bypassing native provider", error);
                _appCheckDisabled = true;
                return {
                    token: "debug-app-check-bypassed",
                    expireTimeMillis: getFallbackExpireTimeMillis(),
                };
            }
        },
    });

    _appCheck = initializeAppCheck(app, {
        provider,
        isTokenAutoRefreshEnabled: true,
    });

    return _appCheck;
};

/**
 * Lazy Firebase App — initialized on first call, not on import.
 */
const ensureApp = () => {
    if (!_app) {
        _app = initializeApp(firebaseConfig);
    }
    return _app;
};

const createLazyProxy = (factory) => new Proxy({}, {
    get(_target, prop) {
        return Reflect.get(factory(), prop);
    },
    set(_target, prop, value) {
        return Reflect.set(factory(), prop, value);
    },
    has(_target, prop) {
        return Reflect.has(factory(), prop);
    },
    ownKeys() {
        return Reflect.ownKeys(factory());
    },
    getOwnPropertyDescriptor(_target, prop) {
        const descriptor = Reflect.getOwnPropertyDescriptor(factory(), prop);
        if (!descriptor) return undefined;
        return {
            ...descriptor,
            configurable: true,
        };
    },
    defineProperty(_target, prop, descriptor) {
        return Reflect.defineProperty(factory(), prop, descriptor);
    },
    deleteProperty(_target, prop) {
        return Reflect.deleteProperty(factory(), prop);
    },
    getPrototypeOf() {
        return Reflect.getPrototypeOf(factory());
    },
});

const getDbInstance = () => {
    if (!_db) {
        const app = ensureApp();
        ensureAppCheck(app);
        _db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager(),
            }),
        });
    }
    return _db;
};

const getAuthRaw = () => {
    if (!_auth) {
        const app = ensureApp();
        ensureAppCheck(app);
        _auth = getAuth(app);
    }
    return _auth;
};

export const db = createLazyProxy(getDbInstance);
export const auth = createLazyProxy(getAuthRaw);

export const getDb = getDbInstance;
export const getAuthInstance = getAuthRaw;

/**
 * Get Firebase Functions instance (Lazy loaded)
 * @returns {Promise<Functions>}
 */
export const getFunctionsInstance = async () => {
    if (!_functions) {
        const { getFunctions } = await import("firebase/functions");
        const app = ensureApp();
        ensureAppCheck(app);
        _functions = getFunctions(app, "europe-west1");
    }
    return _functions;
};

/**
 * Get Firebase Analytics instance lazily
 * @returns {Promise<{ analytics: object|null, logEvent: Function|null }>}
 */
export const getAnalyticsInstance = async () => {
    if (!isTelemetryEnabledSync()) {
        _analytics = null;
        _analyticsLogEvent = null;
        return { analytics: null, logEvent: null };
    }

    if (_analytics && _analyticsLogEvent) {
        return { analytics: _analytics, logEvent: _analyticsLogEvent };
    }

    try {
        const { isSupported, getAnalytics, logEvent } = await import("firebase/analytics");
        const supported = await isSupported();
        if (!supported) {
            return { analytics: null, logEvent: null };
        }

        const app = ensureApp();
        _analytics = getAnalytics(app);
        _analyticsLogEvent = logEvent;
        return { analytics: _analytics, logEvent: _analyticsLogEvent };
    } catch (error) {
        logger.error('[Firebase] Analytics initialization failed', error);
        return { analytics: null, logEvent: null };
    }
};

/**
 * Get Firebase Remote Config instance lazily.
 * Remote Config is used for operational safety switches and low-risk experiments.
 * @returns {Promise<{ remoteConfig: object|null, fetchAndActivate: Function|null, getValue: Function|null }>}
 */
export const getRemoteConfigInstance = async () => {
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

        const app = ensureApp();
        _remoteConfig = getRemoteConfig(app);
        _remoteConfig.settings = {
            minimumFetchIntervalMillis: import.meta.env.DEV ? 60_000 : 15 * 60 * 1000,
            fetchTimeoutMillis: 8_000,
        };
        return { remoteConfig: _remoteConfig, fetchAndActivate, getValue };
    } catch (error) {
        logger.warn('[Firebase] Remote Config unavailable', error);
        return { remoteConfig: null, fetchAndActivate: null, getValue: null };
    }
};
