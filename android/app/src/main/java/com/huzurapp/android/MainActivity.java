package com.huzurapp.android;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.google.android.gms.ads.MobileAds;
import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.FirebaseAppCheck;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "HuzurAppCheck";
    private static boolean appCheckInitialized = false;
    private static boolean adMobInitialized = false;

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
        registerPlugin(InstallReferrerPlugin.class);

        super.onCreate(savedInstanceState);

        // Defer periodic scheduling until the first frame has been attached.
        getWindow().getDecorView().post(() -> PrayerDataSyncWorker.Companion.enqueueIfStale(this));
    }

    private static synchronized boolean initializeAdMob(Context context) {
        if (adMobInitialized) {
            return true;
        }

        try {
            Context appContext = context.getApplicationContext() != null ? context.getApplicationContext() : context;
            MobileAds.initialize(appContext, initializationStatus -> Log.i(TAG, "AdMob SDK initialized after telemetry consent"));
            adMobInitialized = true;
            return true;
        } catch (Exception e) {
            Log.e(TAG, "AdMob initialization error: " + e.getMessage(), e);
            return false;
        }
    }

    private static boolean configureFirebaseAnalyticsCollection(Context context, boolean enabled) {
        if (!isFirebaseInitialized(context)) {
            Log.w(TAG, "Skipping Firebase Analytics collection config because Firebase is unavailable.");
            return false;
        }

        try {
            Class<?> analyticsClass = Class.forName("com.google.firebase.analytics.FirebaseAnalytics");
            Object analytics = analyticsClass.getMethod("getInstance", Context.class).invoke(null, context);
            analyticsClass.getMethod("setAnalyticsCollectionEnabled", Boolean.TYPE).invoke(analytics, enabled);
            return true;
        } catch (ClassNotFoundException e) {
            Log.i(TAG, "Firebase Analytics SDK is not bundled in this build; native analytics skipped.");
            return false;
        } catch (Exception e) {
            Log.w(TAG, "Firebase Analytics collection config failed", e);
            return false;
        }
    }

    private static boolean setCrashlyticsCollection(Context context, boolean enabled) {
        if (!isFirebaseInitialized(context)) {
            Log.w(TAG, "Skipping Crashlytics collection config because Firebase is unavailable.");
            return false;
        }

        try {
            FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(enabled);
            return true;
        } catch (Exception e) {
            Log.w(TAG, "Crashlytics collection config failed", e);
            return false;
        }
    }

    private static synchronized boolean initializeAppCheck(Context context) {
        if (appCheckInitialized) {
            return true;
        }

        try {
            if (!isFirebaseInitialized(context)) {
                FirebaseApp initializedApp = FirebaseApp.initializeApp(context);
                if (initializedApp != null) {
                    Log.i(TAG, "Firebase App initialized after telemetry consent");
                } else {
                    Log.w(TAG, "Firebase App could not be initialized. google-services configuration is missing.");
                }
            }

            if (!isFirebaseInitialized(context)) {
                Log.w(TAG, "Skipping App Check initialization because Firebase is unavailable in this build.");
                return false;
            }

            FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance();
            firebaseAppCheck.setTokenAutoRefreshEnabled(true);

            Log.i(TAG, "BuildConfig.DEBUG: " + BuildConfig.DEBUG);

            firebaseAppCheck.installAppCheckProviderFactory(
                AppCheckProviderResolver.getFactory()
            );

            if (BuildConfig.DEBUG) {
                Log.i(TAG, "App Check: Debug provider installed");
                logDebugTokenMetadata();
            } else {
                Log.i(TAG, "App Check: Play Integrity provider installed");
            }

            appCheckInitialized = true;
            return true;
        } catch (Exception e) {
            Log.e(TAG, "App Check initialization error: " + e.getMessage(), e);
            return false;
        }
    }

    private static void logDebugTokenMetadata() {
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

    @com.getcapacitor.annotation.CapacitorPlugin(name = "AppCheck")
    public static class AppCheckPlugin extends Plugin {

        @com.getcapacitor.PluginMethod
        public void initializePrivacySdks(PluginCall call) {
            boolean telemetryEnabled = Boolean.TRUE.equals(call.getBoolean("telemetryEnabled", false));
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("platform", "android");
            ret.put("telemetryEnabled", telemetryEnabled);

            if (!telemetryEnabled) {
                ret.put("skipped", true);
                ret.put("firebaseInitialized", MainActivity.isFirebaseInitialized(getContext()));
                ret.put("analyticsConfigured", false);
                ret.put("crashlyticsEnabled", false);
                ret.put("adMobInitialized", false);
                call.resolve(ret);
                return;
            }

            boolean firebaseInitialized = MainActivity.initializeAppCheck(getContext());
            boolean analyticsConfigured = MainActivity.configureFirebaseAnalyticsCollection(getContext(), true);
            boolean crashlyticsEnabled = MainActivity.setCrashlyticsCollection(getContext(), true);
            boolean adMobInitialized = MainActivity.initializeAdMob(getContext());

            ret.put("firebaseInitialized", firebaseInitialized);
            ret.put("analyticsConfigured", analyticsConfigured);
            ret.put("crashlyticsEnabled", crashlyticsEnabled);
            ret.put("adMobInitialized", adMobInitialized);
            call.resolve(ret);
        }

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
                if (!MainActivity.isFirebaseInitialized(getContext())) {
                    JSObject ret = new JSObject();
                    ret.put("success", false);
                    ret.put("error", "Firebase is not initialized. Telemetry consent is required before App Check status can be read.");
                    call.resolve(ret);
                    return;
                }

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
                if (!MainActivity.isFirebaseInitialized(getContext())) {
                    JSObject ret = new JSObject();
                    ret.put("success", false);
                    ret.put("error", "Firebase is not initialized. Telemetry consent is required before App Check tokens can refresh.");
                    call.resolve(ret);
                    return;
                }

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
