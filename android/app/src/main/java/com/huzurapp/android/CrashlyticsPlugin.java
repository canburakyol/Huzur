package com.huzurapp.android;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import android.util.Log;

/**
 * Zero-telemetry safe bridge that keeps existing JS callsites intact.
 * Native reporting is intentionally disabled; messages stay in local logcat.
 */
@com.getcapacitor.annotation.CapacitorPlugin(name = "Crashlytics")
public class CrashlyticsPlugin extends Plugin {
  private static final String TAG = "CrashlyticsBridge";
  private static final int MAX_LOG_LENGTH = 500;

  @PluginMethod
  public void log(PluginCall call) {
    String message = call.getString("message");
    if (message != null) {
      Log.i(TAG, truncate(message));
    }
    call.resolve();
  }

  @PluginMethod
  public void logException(PluginCall call) {
    String message = call.getString("message");
    String stack = call.getString("stack");
    if (message != null) {
      Log.e(TAG, truncate(message));
    }
    if (stack != null) {
      Log.e(TAG, truncate(stack));
    } else if (message != null) {
      Log.e(TAG, truncate(message));
    } else {
      Log.e(TAG, "Unknown JS error");
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
