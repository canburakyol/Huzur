package com.huzurapp.android

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONObject

class ZikirWidget : AppWidgetProvider() {

    companion object {
        private const val PREFS_NAME = "CapacitorStorage"
        private const val DATA_KEY = "zikir_widget_data"

        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.zikir_widget)

            try {
                val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                val jsonStr = prefs.getString(DATA_KEY, "{}") ?: "{}"
                val data = JSONObject(jsonStr)

                val count = data.optInt("count", 0)
                val target = data.optInt("target", 100)

                views.setTextViewText(R.id.widget_zikir_count, count.toString())
                views.setTextViewText(R.id.widget_zikir_target, "/ $target")

            } catch (e: Exception) {
                e.printStackTrace()
            }

            // Open App on click
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_zikir_btn, pendingIntent)
            views.setOnClickPendingIntent(R.id.widget_zikir_count, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }
}
