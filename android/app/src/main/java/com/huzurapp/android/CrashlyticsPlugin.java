package com.huzurapp.android;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.google.firebase.crashlytics.FirebaseCrashlytics;
import android.util.Log;
import com.huzurapp.android.BuildConfig;

/**
 * Simple Capacitor plugin to forward JS errors to Firebase Crashlytics.
 * NOTE: This is a minimal bridge to enable reporting from JS to Crashlytics.
 */
@com.getcapacitor.annotation.CapacitorPlugin(name = "Crashlytics")
public class CrashlyticsPlugin extends Plugin {
  private static final String TAG = "CrashlyticsBridge";
  private static final int MAX_LOG_LENGTH = 500;

  @PluginMethod
  public void log(PluginCall call) {
    String message = call.getString("message");
    if (message != null) {
      FirebaseCrashlytics.getInstance().log(message);
      if (BuildConfig.DEBUG) {
        Log.d(TAG, truncate(message));
      }
    }
    call.resolve();
  }

  @PluginMethod
  public void logException(PluginCall call) {
    String message = call.getString("message");
    String stack = call.getString("stack");
    if (message != null) {
      FirebaseCrashlytics.getInstance().log(message);
      if (BuildConfig.DEBUG) {
        Log.e(TAG, truncate(message));
      }
    }
    if (stack != null) {
      FirebaseCrashlytics.getInstance().recordException(new Exception(stack));
      if (BuildConfig.DEBUG) {
        Log.e(TAG, truncate(stack));
      }
    } else if (message != null) {
      FirebaseCrashlytics.getInstance().recordException(new Exception(message));
      if (BuildConfig.DEBUG) {
        Log.e(TAG, truncate(message));
      }
    } else {
      FirebaseCrashlytics.getInstance().log("Unknown JS error");
    }
    call.resolve();
  }

  private static String truncate(String value) {
    if (value == null) {
      return "";
    }
    return value.length() > MAX_LOG_LENGTH ? value.substring(0, MAX_LOG_LENGTH) + "..." : value;
  }
}
