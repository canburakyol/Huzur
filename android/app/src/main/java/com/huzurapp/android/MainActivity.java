package com.huzurapp.android;

import android.os.Bundle;
import com.huzurapp.android.BuildConfig;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.FirebaseAppCheck;
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory;
import com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "HuzurAppCheck";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Firebase App Check
        try {
            FirebaseApp.initializeApp(this);
            FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance();
            
            Log.e(TAG, "!!! APP CHECK ANALIZI BASLADI !!!");
            Log.e(TAG, "Debug Modu Durumu: " + BuildConfig.DEBUG);
            
            if (BuildConfig.DEBUG) {
                firebaseAppCheck.installAppCheckProviderFactory(
                    DebugAppCheckProviderFactory.getInstance()
                );
                Log.e(TAG, "!!! DEBUG PROVIDER KURULDU !!!");
            } else {
                firebaseAppCheck.installAppCheckProviderFactory(
                    PlayIntegrityAppCheckProviderFactory.getInstance()
                );
                Log.e(TAG, "!!! PLAY INTEGRITY KURULDU !!!");
            }
        } catch (Exception e) {
            Log.e(TAG, "App Check Hatası: " + e.getMessage());
        }

        registerPlugin(WidgetPlugin.class);
    }
}

