package com.huzurapp.android;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import com.huzurapp.android.R;

import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class PrayerWidget extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage"; // Default Capacitor Storage
    private static final String DATA_KEY = "prayer_widget_data";

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget);

        // Fetch data from SharedPreferences
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String jsonStr = prefs.getString(DATA_KEY, "{}");
            JSONObject data = new JSONObject(jsonStr);

            String prayerName = data.optString("name", "Vakit");
            String prayerTime = data.optString("time", "--:--");
            String location = data.optString("location", "Huzur");

            views.setTextViewText(R.id.widget_prayer_name, prayerName);
            views.setTextViewText(R.id.widget_time, prayerTime);
            views.setTextViewText(R.id.widget_location, location);

        } catch (Exception e) {
            e.printStackTrace();
            views.setTextViewText(R.id.widget_prayer_name, "Hata");
        }

        // Click to open app
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_prayer_name, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_time, pendingIntent);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}
