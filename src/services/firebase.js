import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

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
const functions = getFunctions(app, 'europe-west1'); // Region önemli

// Local Development için App Check Debug Modu
/*
if (import.meta.env.DEV) {
    // Debug token'ı konsola yazdırır, bunu Firebase Console'a eklemek gerekir
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    
    import('firebase/app-check').then(({ initializeAppCheck, ReCaptchaEnterpriseProvider }) => {
        try {
            // ReCaptcha key yoksa bile DebugProvider devreye girer (self.FIREBASE... sayesinde)
            initializeAppCheck(app, {
                provider: new ReCaptchaEnterpriseProvider('debug-key'), 
                isTokenAutoRefreshEnabled: true
            });
            console.log('[Firebase] Local App Check initialized with Debug Token');
        } catch (e) {
            console.warn('[Firebase] App Check init failed:', e);
        }
    });
}
*/

// NOT: Production'da App Check, Native Android katmanında (MainActivity.java) başlatılıyor.
// JS tarafında tekrar başlatmak çakışmaya neden oluyordu.

export { app, db, auth, functions };
