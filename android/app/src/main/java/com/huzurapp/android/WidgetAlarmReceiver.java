package com.huzurapp.android;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

public class WidgetAlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "WidgetAlarmReceiver";
    private static final String ACTION_UPDATE_WIDGET = "com.huzurapp.android.UPDATE_WIDGET";
    private static final String ACTION_SCHEDULE_ALARMS = "com.huzurapp.android.SCHEDULE_ALARMS";
    private static final int REQUEST_CODE_BASE = 7000;
    private static final int REQUEST_CODE_WINDOW_SIZE = 100;
    private static final String[] PRAYERS = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : null;
        Log.d(TAG, "Alarm received: " + action);

        if (ACTION_UPDATE_WIDGET.equals(action)) {
            updateWidget(context);
            PrayerScheduleCoordinator.rescheduleFromStore(context, "widget_alarm_fired");
        } else if (ACTION_SCHEDULE_ALARMS.equals(action)) {
            PrayerScheduleCoordinator.rescheduleFromStore(context, "widget_manual_refresh");
        }
    }

    private void updateWidget(Context context) {
        try {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName widgetComponent = new ComponentName(context, PrayerWidget.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(widgetComponent);

            Intent updateIntent = new Intent(context, PrayerWidget.class);
            updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
            context.sendBroadcast(updateIntent);
        } catch (Exception e) {
            Log.e(TAG, "Error updating widget", e);
        }
    }

    public static void schedulePrayerAlarms(Context context) {
        PrayerScheduleCoordinator.rescheduleFromStore(context, "widget_schedule_request");
    }

    public static void schedulePrayerAlarm(
            Context context,
            String prayerName,
            int dayOffset,
            long triggerAtMillis
    ) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context,
                    buildRequestCode(prayerName, dayOffset),
                    new Intent(context, WidgetAlarmReceiver.class).setAction(ACTION_UPDATE_WIDGET),
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            alarmManager.cancel(pendingIntent);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
                alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                );
            } else {
                alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                );
            }
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling widget alarm for " + prayerName, e);
        }
    }

    public static void updatePrayerTimes(Context context, String timesJson) {
        try {
            PrayerScheduleStore.ScheduleContext existingContext = PrayerScheduleStore.getScheduleContext(context);
            PrayerScheduleCoordinator.syncSchedule(
                    context,
                    timesJson,
                    existingContext != null ? existingContext.getLatitude() : null,
                    existingContext != null ? existingContext.getLongitude() : null,
                    existingContext != null ? existingContext.getLocationName() : null,
                    existingContext != null ? existingContext.getAdhanSound() : null,
                    "widget_legacy_sync"
            );
        } catch (Exception e) {
            Log.e(TAG, "Error updating prayer times", e);
        }
    }

    public static void cancelAllAlarms(Context context) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

            for (int dayOffset = 0; dayOffset < 2; dayOffset++) {
                for (String prayer : PRAYERS) {
                    PendingIntent pendingIntent = PendingIntent.getBroadcast(
                            context,
                            buildRequestCode(prayer, dayOffset),
                            new Intent(context, WidgetAlarmReceiver.class).setAction(ACTION_UPDATE_WIDGET),
                            PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
                    );

                    if (pendingIntent != null) {
                        alarmManager.cancel(pendingIntent);
                        pendingIntent.cancel();
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error cancelling alarms", e);
        }
    }

    private static int buildRequestCode(String prayerName, int dayOffset) {
        for (int index = 0; index < PRAYERS.length; index++) {
            if (PRAYERS[index].equals(prayerName)) {
                return REQUEST_CODE_BASE + (dayOffset * REQUEST_CODE_WINDOW_SIZE) + index;
            }
        }

        return REQUEST_CODE_BASE + prayerName.hashCode();
    }
}
