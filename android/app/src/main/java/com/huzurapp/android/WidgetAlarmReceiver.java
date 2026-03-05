package com.huzurapp.android;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/**
 * Widget Alarm Receiver
 * Namaz vakitlerinde widget'ı güncellemek için AlarmManager ile çalışır
 */
public class WidgetAlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "WidgetAlarmReceiver";
    private static final String ACTION_UPDATE_WIDGET = "com.huzurapp.android.UPDATE_WIDGET";
    private static final String ACTION_SCHEDULE_ALARMS = "com.huzurapp.android.SCHEDULE_ALARMS";
    private static final String PREFS_PRAYER_TIMES = "PrayerTimes";
    
    // Namaz vakitleri (dakika cinsinden önce bildirim)
    private static final int NOTIFICATION_MINUTES_BEFORE = 1; // Vakit geldiğinde güncelle

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "Alarm received: " + action);

        if (ACTION_UPDATE_WIDGET.equals(action)) {
            // Widget'ı güncelle
            updateWidget(context);
        } else if (ACTION_SCHEDULE_ALARMS.equals(action)) {
            // Tüm namaz vakitleri için alarm kur
            schedulePrayerAlarms(context);
        }
    }

    /**
     * Widget'ı manuel olarak güncelle
     */
    private void updateWidget(Context context) {
        try {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName widgetComponent = new ComponentName(context, PrayerWidget.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(widgetComponent);

            // Widget'ı güncelle
            Intent updateIntent = new Intent(context, PrayerWidget.class);
            updateIntent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
            context.sendBroadcast(updateIntent);

            Log.d(TAG, "Widget updated for " + appWidgetIds.length + " widgets");
        } catch (Exception e) {
            Log.e(TAG, "Error updating widget", e);
        }
    }

    /**
     * Namaz vakitleri için alarmları kur
     * Bu metod JavaScript tarafından namaz vakitleri güncellendiğinde çağrılmalı
     */
    public static void schedulePrayerAlarms(Context context) {
        Log.d(TAG, "Scheduling prayer alarms...");

        // SharedPreferences'dan namaz vakitlerini al
        SharedPreferences prefs = context.getSharedPreferences(PREFS_PRAYER_TIMES, Context.MODE_PRIVATE);
        String prayerTimesJson = prefs.getString("times", null);

        if (prayerTimesJson == null) {
            Log.w(TAG, "No prayer times found in preferences");
            return;
        }

        try {
            JSONObject times = new JSONObject(prayerTimesJson);
            String[] prayers = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};

            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

            for (String prayer : prayers) {
                if (times.has(prayer)) {
                    String timeStr = times.getString(prayer);
                    scheduleAlarmForPrayer(context, alarmManager, prayer, timeStr);
                }
            }

            Log.d(TAG, "Prayer alarms scheduled successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling alarms", e);
        }
    }

    /**
     * Belirli bir namaz vakti için alarm kur
     */
    private static void scheduleAlarmForPrayer(Context context, AlarmManager alarmManager, 
                                                String prayerName, String timeStr) {
        try {
            // Saat:dakika formatını parse et
            String[] parts = timeStr.split(":");
            int hour = Integer.parseInt(parts[0]);
            int minute = Integer.parseInt(parts[1]);

            // Alarm zamanını hesapla
            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.HOUR_OF_DAY, hour);
            calendar.set(Calendar.MINUTE, minute);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);

            // Eğer vakit geçtiyse yarın için kur
            if (calendar.getTimeInMillis() <= System.currentTimeMillis()) {
                calendar.add(Calendar.DAY_OF_YEAR, 1);
            }

            // Intent oluştur
            Intent intent = new Intent(context, WidgetAlarmReceiver.class);
            intent.setAction(ACTION_UPDATE_WIDGET);
            intent.putExtra("prayer", prayerName);

            // Benzersiz request code için prayer hash'ini kullan
            int requestCode = prayerName.hashCode();
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context, 
                requestCode, 
                intent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // Mevcut alarmı iptal et (varsa)
            alarmManager.cancel(pendingIntent);

            // Yeni alarm kur
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                // Android 12+ için exact alarm izni kontrolü
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        calendar.getTimeInMillis(),
                        pendingIntent
                    );
                } else {
                    // Exact alarm izni yoksa normal alarm kullan
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        calendar.getTimeInMillis(),
                        pendingIntent
                    );
                }
            } else {
                // Android 7-11 (minSdk is 24, so no need to check for API 23)
                // Android 6 öncesi
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    calendar.getTimeInMillis(),
                    pendingIntent
                );
            }

            SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
            Log.d(TAG, "Alarm scheduled for " + prayerName + " at " + sdf.format(calendar.getTime()));

        } catch (Exception e) {
            Log.e(TAG, "Error scheduling alarm for " + prayerName, e);
        }
    }

    /**
     * JavaScript tarafından namaz vakitleri güncellendiğinde çağrılacak
     */
    public static void updatePrayerTimes(Context context, String timesJson) {
        try {
            // Namaz vakitlerini kaydet
            SharedPreferences prefs = context.getSharedPreferences(PREFS_PRAYER_TIMES, Context.MODE_PRIVATE);
            prefs.edit().putString("times", timesJson).apply();

            Log.d(TAG, "Prayer times updated");

            // Alarmları yeniden kur
            schedulePrayerAlarms(context);
        } catch (Exception e) {
            Log.e(TAG, "Error updating prayer times", e);
        }
    }

    /**
     * Tüm alarmları iptal et
     */
    public static void cancelAllAlarms(Context context) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            String[] prayers = {"Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"};

            for (String prayer : prayers) {
                Intent intent = new Intent(context, WidgetAlarmReceiver.class);
                intent.setAction(ACTION_UPDATE_WIDGET);
                int requestCode = prayer.hashCode();
                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context, 
                    requestCode, 
                    intent, 
                    PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
                );

                if (pendingIntent != null) {
                    alarmManager.cancel(pendingIntent);
                    pendingIntent.cancel();
                }
            }

            Log.d(TAG, "All alarms cancelled");
        } catch (Exception e) {
            Log.e(TAG, "Error cancelling alarms", e);
        }
    }
}
