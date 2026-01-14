package com.huzurapp.android;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.FirebaseAppCheck;
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "HuzurAppCheck";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Initialize Firebase App Check with Play Integrity
        try {
            FirebaseApp.initializeApp(this);
            FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance();
            firebaseAppCheck.installAppCheckProviderFactory(
                PlayIntegrityAppCheckProviderFactory.getInstance()
            );
            Log.d(TAG, "Firebase App Check initialized with Play Integrity");
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize App Check: " + e.getMessage());
        }

        registerPlugin(WidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

