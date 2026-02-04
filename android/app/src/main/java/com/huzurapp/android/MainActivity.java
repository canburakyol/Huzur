package com.huzurapp.android;

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
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory;
import com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "HuzurAppCheck";
    private static final String JS_TAG = "AppCheckJS";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Firebase App Check
        initializeAppCheck();

        registerPlugin(WidgetPlugin.class);
        registerPlugin(AppCheckPlugin.class);
        registerPlugin(CrashlyticsPlugin.class);
    }
    
    /**
     * Firebase App Check'i başlat
     * Debug ve Release modları için ayrı provider'lar kullanır
     */
    private void initializeAppCheck() {
        try {
            // Firebase App'i başlat (eğer başlatılmadıysa)
            if (FirebaseApp.getApps(this).isEmpty()) {
                FirebaseApp.initializeApp(this);
                Log.i(TAG, "Firebase App initialized");
            }
            
            FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance();
            
            // Token otomatik yenileme süresi (saat cinsinden)
            firebaseAppCheck.setTokenAutoRefreshEnabled(true);
            
            Log.i(TAG, "BuildConfig.DEBUG: " + BuildConfig.DEBUG);
            
            if (BuildConfig.DEBUG) {
                // Debug mod: Debug token kullan
                // NOT: Firebase Console > App Check > Manage debug tokens 
                // bölümünden debug token oluşturun ve local.properties'e ekleyin
                firebaseAppCheck.installAppCheckProviderFactory(
                    DebugAppCheckProviderFactory.getInstance()
                );
                Log.i(TAG, "App Check: Debug provider installed");
                
                // Debug token'ı logla (Firebase Console'a eklenmesi için)
                logDebugToken();
            } else {
                // Release mod: Play Integrity kullan
                firebaseAppCheck.installAppCheckProviderFactory(
                    PlayIntegrityAppCheckProviderFactory.getInstance()
                );
                Log.i(TAG, "App Check: Play Integrity provider installed");
            }
        } catch (Exception e) {
            Log.e(TAG, "App Check initialization error: " + e.getMessage(), e);
        }
    }
    
    /**
     * Debug token'ı logla (Firebase Console'a manuel eklemek için)
     */
    private void logDebugToken() {
        try {
            // Debug token'ı al ve logla
            FirebaseAppCheck.getInstance().getAppCheckToken(false)
                .addOnSuccessListener(token -> {
                    Log.d(TAG, "=== DEBUG TOKEN (Firebase Console'a ekleyin) ===");
                    Log.d(TAG, token.getToken());
                    Log.d(TAG, "==============================================");
                })
                .addOnFailureListener(e -> {
                    Log.w(TAG, "Debug token alınamadı: " + e.getMessage());
                });
        } catch (Exception e) {
            Log.w(TAG, "Debug token logging error: " + e.getMessage());
        }
    }
    
    /**
     * App Check durumunu JavaScript tarafına ileten Plugin
     */
    @com.getcapacitor.annotation.CapacitorPlugin(name = "AppCheck")
    public static class AppCheckPlugin extends Plugin {
        
        @com.getcapacitor.annotation.PermissionCallback
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
        
        @com.getcapacitor.annotation.PermissionCallback
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

