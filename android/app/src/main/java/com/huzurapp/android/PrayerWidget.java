package com.huzurapp.android;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Implementation of App Widget functionality.
 */
public class PrayerWidget extends AppWidgetProvider {

    private static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
            int appWidgetId) {

        // Read data from SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences(WidgetConstants.PREFS_NAME, Context.MODE_PRIVATE);
        String nextPrayer = prefs.getString(WidgetConstants.KEY_NEXT_PRAYER, "Vakit");
        String timeRemaining = prefs.getString(WidgetConstants.KEY_TIME_REMAINING, "--:--");
        String location = prefs.getString(WidgetConstants.KEY_LOCATION, "Huzur App");

        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_prayer_times);
        views.setTextViewText(R.id.widget_next_prayer_name, nextPrayer);
        views.setTextViewText(R.id.widget_time_remaining, timeRemaining);
        views.setTextViewText(R.id.widget_location, location);

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
