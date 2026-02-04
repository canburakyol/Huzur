package com.huzurapp.android;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.google.firebase.crashlytics.FirebaseCrashlytics;
import android.util.Log;

/**
 * Simple Capacitor plugin to forward JS errors to Firebase Crashlytics.
 * NOTE: This is a minimal bridge to enable reporting from JS to Crashlytics.
 */
@com.getcapacitor.annotation.CapacitorPlugin(name = "Crashlytics")
public class CrashlyticsPlugin extends Plugin {
  private static final String TAG = "CrashlyticsBridge";

  @PluginMethod
  public void log(PluginCall call) {
    String message = call.getString("message");
    if (message != null) {
      FirebaseCrashlytics.getInstance().log(message);
      Log.d(TAG, message);
    }
    call.resolve();
  }

  @PluginMethod
  public void logException(PluginCall call) {
    String message = call.getString("message");
    String stack = call.getString("stack");
    if (message != null) {
      FirebaseCrashlytics.getInstance().log(message);
      Log.e(TAG, message);
    }
    if (stack != null) {
      FirebaseCrashlytics.getInstance().recordException(new Exception(stack));
      Log.e(TAG, stack);
    } else if (message != null) {
      FirebaseCrashlytics.getInstance().recordException(new Exception(message));
      Log.e(TAG, message);
    } else {
      FirebaseCrashlytics.getInstance().log("Unknown JS error");
    }
    call.resolve();
  }
}
