package com.huzurapp.android;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Widget")
public class WidgetPlugin extends Plugin {

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
}
