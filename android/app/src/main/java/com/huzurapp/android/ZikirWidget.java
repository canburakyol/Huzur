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

public class ZikirWidget extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String DATA_KEY = "zikir_widget_data";

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.zikir_widget);

        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String jsonStr = prefs.getString(DATA_KEY, "{}");
            JSONObject data = new JSONObject(jsonStr);

            int count = data.optInt("count", 0);
            int target = data.optInt("target", 100);

            views.setTextViewText(R.id.widget_zikir_count, String.valueOf(count));
            views.setTextViewText(R.id.widget_zikir_target, "/ " + target);

        } catch (Exception e) {
            e.printStackTrace();
        }

        // Open App on click
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_zikir_btn, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_zikir_count, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
}
