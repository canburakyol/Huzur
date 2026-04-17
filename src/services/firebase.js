import { Capacitor } from "@capacitor/core";
import { FirebaseAppCheck } from "@capacitor-firebase/app-check";
import { initializeApp } from "firebase/app";
import { CustomProvider, initializeAppCheck } from "firebase/app-check";
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

/**
 * Lazy Firebase App — initialized on first call, not on import.
 */
const ensureApp = () => {
    if (!_app) {
        _app = initializeApp(firebaseConfig);
    }
    return _app;
};

/**
 * Lazy App Check — initialized after app is created.
 */
const ensureAppCheck = (app) => {
    if (_appCheck || _appCheckDisabled || !isNativeRuntime()) {
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

// ─── Lazy Getter Proxy ──────────────────────────────────────────
// These proxy objects allow existing `import { db }` / `import { auth }`
// consumers to keep working WITHOUT code changes. The Firestore/Auth
// instances are created on FIRST property access, not on import.

const createLazyProxy = (factory) => new Proxy({}, {
    get(_target, prop) {
        return Reflect.get(factory(), prop);
    },
    has(_target, prop) {
        return Reflect.has(factory(), prop);
    },
    ownKeys() {
        return Reflect.ownKeys(factory());
    },
    getOwnPropertyDescriptor(_target, prop) {
        return Reflect.getOwnPropertyDescriptor(factory(), prop);
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

/**
 * Lazy Firestore proxy — initialized on first property access.
 * Consumers can keep using `import { db }` without changes.
 */
export const db = createLazyProxy(getDbInstance);

/**
 * Lazy Auth proxy — initialized on first property access.
 * Consumers can keep using `import { auth }` without changes.
 */
export const auth = createLazyProxy(getAuthRaw);

/**
 * Direct getter for Firestore (for new code).
 */
export const getDb = getDbInstance;

/**
 * Direct getter for Auth (for new code).
 */
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
