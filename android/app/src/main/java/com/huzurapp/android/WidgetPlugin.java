package com.huzurapp.android;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

import org.json.JSONObject;

@CapacitorPlugin(name = "Widget")
public class WidgetPlugin extends Plugin {
    private static final String TAG = "WidgetPlugin";

    @PluginMethod
    public void updateWidget(PluginCall call) {
        String nextPrayer = call.getString("nextPrayer");
        String timeRemaining = call.getString("timeRemaining");
        String location = call.getString("location");

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(WidgetConstants.PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();

        if (nextPrayer != null)
            editor.putString(WidgetConstants.KEY_NEXT_PRAYER, nextPrayer);
        if (timeRemaining != null)
            editor.putString(WidgetConstants.KEY_TIME_REMAINING, timeRemaining);
        if (location != null)
            editor.putString(WidgetConstants.KEY_LOCATION, location);

        editor.apply();

        // Trigger widget update
        Intent intent = new Intent(context, PrayerWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(context)
                .getAppWidgetIds(new ComponentName(context, PrayerWidget.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);

        call.resolve();
    }

    /**
     * Namaz vakitlerini widget alarm receiver'a ilet
     * @param call prayerTimes JSON objesi içermeli
     */
    @PluginMethod
    public void scheduleWidgetAlarms(PluginCall call) {
        try {
            JSObject prayerTimes = call.getObject("prayerTimes");
            if (prayerTimes == null) {
                call.reject("Prayer times object is required");
                return;
            }

            // Namaz vakitlerini kaydet ve alarmları kur
            Context context = getContext();
            WidgetAlarmReceiver.updatePrayerTimes(context, prayerTimes.toString());

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("message", "Widget alarms scheduled successfully");
            call.resolve(result);

            Log.d(TAG, "Widget alarms scheduled with prayer times");
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling widget alarms", e);
            call.reject("Error scheduling alarms: " + e.getMessage());
        }
    }

    /**
     * Widget alarmlarını iptal et
     */
    @PluginMethod
    public void cancelWidgetAlarms(PluginCall call) {
        try {
            Context context = getContext();
            WidgetAlarmReceiver.cancelAllAlarms(context);

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("message", "Widget alarms cancelled");
            call.resolve(result);

            Log.d(TAG, "Widget alarms cancelled");
        } catch (Exception e) {
            Log.e(TAG, "Error cancelling widget alarms", e);
            call.reject("Error cancelling alarms: " + e.getMessage());
        }
    }
}
