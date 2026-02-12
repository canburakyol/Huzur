import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Lazy initialized functions instance
let _functions = null;
let _analytics = null;
let _analyticsLogEvent = null;

/**
 * Get Firebase Functions instance (Lazy loaded)
 * @returns {Promise<Functions>}
 */
export const getFunctionsInstance = async () => {
    if (!_functions) {
        const { getFunctions } = await import("firebase/functions");
        _functions = getFunctions(app, 'europe-west1');
    }
    return _functions;
};

/**
 * Get Firebase Analytics instance lazily
 * Works only when analytics is supported (native/web runtime dependent)
 * @returns {Promise<{ analytics: any|null, logEvent: Function|null }>}
 */
export const getAnalyticsInstance = async () => {
    if (_analytics && _analyticsLogEvent) {
        return { analytics: _analytics, logEvent: _analyticsLogEvent };
    }

    try {
        const { isSupported, getAnalytics, logEvent } = await import("firebase/analytics");
        const supported = await isSupported();
        if (!supported) {
            return { analytics: null, logEvent: null };
        }

        _analytics = getAnalytics(app);
        _analyticsLogEvent = logEvent;
        return { analytics: _analytics, logEvent: _analyticsLogEvent };
    } catch {
        return { analytics: null, logEvent: null };
    }
};

// NOT: Production'da App Check, Native Android katmanında (MainActivity.java) başlatılıyor.
// JS tarafında tekrar başlatmak çakışmaya neden oluyordu.

export { app, db, auth };
