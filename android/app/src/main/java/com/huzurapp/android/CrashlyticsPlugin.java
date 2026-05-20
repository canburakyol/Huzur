package com.huzurapp.android;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import android.util.Log;
import com.google.firebase.crashlytics.FirebaseCrashlytics;

/**
 * Consent-gated bridge used by JS callsites. JS only invokes this plugin when
 * crash reporting consent is enabled; native auto collection stays disabled by
 * manifest default until the bridge is used.
 */
@com.getcapacitor.annotation.CapacitorPlugin(name = "Crashlytics")
public class CrashlyticsPlugin extends Plugin {
  private static final String TAG = "CrashlyticsBridge";
  private static final int MAX_LOG_LENGTH = 500;

  @PluginMethod
  public void setCollectionEnabled(PluginCall call) {
    Boolean enabled = call.getBoolean("enabled", false);
    FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(Boolean.TRUE.equals(enabled));
    call.resolve();
  }

  @PluginMethod
  public void log(PluginCall call) {
    String message = call.getString("message");
    if (message != null) {
      String safeMessage = truncate(message);
      Log.i(TAG, safeMessage);
      FirebaseCrashlytics crashlytics = FirebaseCrashlytics.getInstance();
      crashlytics.setCrashlyticsCollectionEnabled(true);
      crashlytics.log(safeMessage);
    }
    call.resolve();
  }

  @PluginMethod
  public void logException(PluginCall call) {
    String message = call.getString("message");
    String stack = call.getString("stack");
    String safeMessage = truncate(message != null ? message : "Unknown JS error");
    FirebaseCrashlytics crashlytics = FirebaseCrashlytics.getInstance();
    crashlytics.setCrashlyticsCollectionEnabled(true);

    if (message != null) {
      Log.e(TAG, safeMessage);
      crashlytics.log(safeMessage);
    }
    if (stack != null) {
      String safeStack = truncate(stack);
      Log.e(TAG, safeStack);
      crashlytics.setCustomKey("js_stack", safeStack);
    } else if (message != null) {
      Log.e(TAG, safeMessage);
    } else {
      Log.e(TAG, "Unknown JS error");
    }

    crashlytics.recordException(new Exception(safeMessage));
    call.resolve();
  }

  private static String truncate(String value) {
    if (value == null) {
      return "";
    }
    return value.length() > MAX_LOG_LENGTH ? value.substring(0, MAX_LOG_LENGTH) + "..." : value;
  }
}
