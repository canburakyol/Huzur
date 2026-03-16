package com.huzurapp.android;

import android.content.Context;
import android.os.Bundle;
import com.huzurapp.android.BuildConfig;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.FirebaseAppCheck;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "HuzurAppCheck";
    private static final String JS_TAG = "AppCheckJS";

    static boolean isFirebaseInitialized(Context context) {
        try {
            return !FirebaseApp.getApps(context).isEmpty();
        } catch (Exception e) {
            Log.w(TAG, "Firebase initialization state check failed", e);
            return false;
        }
    }

    static boolean hasFirebaseResourceConfig(Context context) {
        try {
            int googleAppIdRes = context.getResources().getIdentifier("google_app_id", "string", context.getPackageName());
            int senderIdRes = context.getResources().getIdentifier("gcm_defaultSenderId", "string", context.getPackageName());
            return googleAppIdRes != 0 && senderIdRes != 0;
        } catch (Exception e) {
            Log.w(TAG, "Firebase resource config check failed", e);
            return false;
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetPlugin.class);
        registerPlugin(AppCheckPlugin.class);
        registerPlugin(CrashlyticsPlugin.class);
        registerPlugin(PrayerAlarmPlugin.class);
        registerPlugin(PrayerSchedulePlugin.class);
        registerPlugin(NativeAdBridgePlugin.class);

        super.onCreate(savedInstanceState);
        
        // Initialize Firebase App Check
        initializeAppCheck();

        // Enqueue background prayer data sync (runs daily when network available)
        PrayerDataSyncWorker.Companion.enqueue(this);
    }
    
    /**
     * Firebase App Check'i başlat
     * Debug ve Release modları için ayrı provider'lar kullanır
     */
    private void initializeAppCheck() {
        try {
            // Firebase App'i başlat (eğer başlatılmadıysa)
            if (!isFirebaseInitialized(this)) {
                FirebaseApp initializedApp = FirebaseApp.initializeApp(this);
                if (initializedApp != null) {
                    Log.i(TAG, "Firebase App initialized");
                } else {
                    Log.w(TAG, "Firebase App could not be initialized. google-services configuration is missing.");
                }
            }

            if (!isFirebaseInitialized(this)) {
                Log.w(TAG, "Skipping App Check initialization because Firebase is unavailable in this build.");
                return;
            }
            
            FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance();
            
            // Token otomatik yenileme süresi (saat cinsinden)
            firebaseAppCheck.setTokenAutoRefreshEnabled(true);
            
            Log.i(TAG, "BuildConfig.DEBUG: " + BuildConfig.DEBUG);

            firebaseAppCheck.installAppCheckProviderFactory(
                AppCheckProviderResolver.getFactory()
            );

            if (BuildConfig.DEBUG) {
                Log.i(TAG, "App Check: Debug provider installed");
                
                // Debug build: only log token metadata (never token value)
                logDebugTokenMetadata();
            } else {
                Log.i(TAG, "App Check: Play Integrity provider installed");
            }
        } catch (Exception e) {
            Log.e(TAG, "App Check initialization error: " + e.getMessage(), e);
        }
    }
    
    /**
     * In debug builds, only log token retrieval metadata.
     * Never print the App Check token value.
     */
    private void logDebugTokenMetadata() {
        try {
            FirebaseAppCheck.getInstance().getAppCheckToken(false)
                .addOnSuccessListener(token -> {
                    String fullToken = token.getToken();
                    int tokenLength = fullToken != null ? fullToken.length() : 0;
                    Log.d(TAG, "Debug App Check token retrieved (length only): " + tokenLength);
                })
                .addOnFailureListener(e -> {
                    Log.w(TAG, "Debug token metadata fetch failed: " + e.getMessage());
                });
        } catch (Exception e) {
            Log.w(TAG, "Debug token metadata logging error: " + e.getMessage());
        }
    }

    /**
     * App Check durumunu JavaScript tarafına ileten Plugin
     */
    @com.getcapacitor.annotation.CapacitorPlugin(name = "AppCheck")
    public static class AppCheckPlugin extends Plugin {
        
        @com.getcapacitor.PluginMethod
        public void getFirebaseStatus(PluginCall call) {
            JSObject ret = new JSObject();
            boolean initialized = MainActivity.isFirebaseInitialized(getContext());
            boolean configured = initialized || MainActivity.hasFirebaseResourceConfig(getContext());
            ret.put("success", true);
            ret.put("initialized", initialized);
            ret.put("configured", configured);
            ret.put("messagingAvailable", initialized);
            ret.put("debuggable", BuildConfig.DEBUG);
            call.resolve(ret);
        }
        
        @com.getcapacitor.PluginMethod
        public void getAppCheckStatus(PluginCall call) {
            try {
                FirebaseAppCheck.getInstance().getAppCheckToken(false)
                    .addOnSuccessListener(token -> {
                        JSObject ret = new JSObject();
                        ret.put("success", true);
                        ret.put("tokenPresent", token.getToken() != null && !token.getToken().isEmpty());
                        ret.put("expireTimeMillis", token.getExpireTimeMillis());
                        call.resolve(ret);
                    })
                    .addOnFailureListener(e -> {
                        JSObject ret = new JSObject();
                        ret.put("success", false);
                        ret.put("error", e.getMessage());
                        call.resolve(ret);
                    });
            } catch (Exception e) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", e.getMessage());
                call.resolve(ret);
            }
        }
        
        @com.getcapacitor.PluginMethod
        public void forceRefreshToken(PluginCall call) {
            try {
                FirebaseAppCheck.getInstance().getAppCheckToken(true)
                    .addOnSuccessListener(token -> {
                        JSObject ret = new JSObject();
                        ret.put("success", true);
                        ret.put("message", "Token refreshed successfully");
                        call.resolve(ret);
                    })
                    .addOnFailureListener(e -> {
                        JSObject ret = new JSObject();
                        ret.put("success", false);
                        ret.put("error", e.getMessage());
                        call.resolve(ret);
                    });
            } catch (Exception e) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", e.getMessage());
                call.resolve(ret);
            }
        }
    }
}

