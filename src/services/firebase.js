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

import { initializeAppCheck, ReCaptchaV3Provider, CustomProvider } from "firebase/app-check";
import { Capacitor } from "@capacitor/core";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app, 'europe-west1'); // Region önemli

// Initialize App Check
const initAppCheck = async () => {
  if (typeof window === 'undefined') return;

  if (Capacitor.isNativePlatform()) {
    // Android/iOS: Use Native Play Integrity / App Attest via Plugin
    try {
      const { AppCheck } = await import('@capacitor-firebase/app-check');
      
      initializeAppCheck(app, {
        provider: new CustomProvider({
          getToken: async () => {
            const { token } = await AppCheck.getToken();
            return {
              token: token,
              expireTimeMillis: Date.now() + 3600000 // 1 saat geçerli varsayalım
            };
          }
        }),
        isTokenAutoRefreshEnabled: true
      });
    } catch (e) {
      console.error('App Check Native Init Error:', e);
    }
  } else {
    // Web: Use ReCaptcha v3 (Localhost debug or Web Prod)
    if (location.hostname === "localhost") {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    
    const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
    
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaKey),
      isTokenAutoRefreshEnabled: true
    });
  }
};

initAppCheck();

export { app, db, auth, functions };
