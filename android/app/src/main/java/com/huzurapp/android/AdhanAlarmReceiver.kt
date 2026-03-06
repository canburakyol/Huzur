package com.huzurapp.android

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat

/**
 * BroadcastReceiver that triggers when AlarmManager fires at exact prayer times.
 * Starts AdhanForegroundService to play the Adhan audio.
 *
 */
class AdhanAlarmReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "AdhanAlarmReceiver"
        const val ACTION_PLAY_ADHAN = "com.huzurapp.android.ACTION_PLAY_ADHAN"
        const val EXTRA_PRAYER_NAME = "prayer_name"
        const val EXTRA_PRAYER_NAME_LOCALIZED = "prayer_name_localized"
        const val EXTRA_ADHAN_SOUND = "adhan_sound"

        // Request code base for prayer alarms (must not collide with WidgetAlarmReceiver)
        private const val REQUEST_CODE_BASE = 5000

        private val PRAYER_KEYS = listOf("Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha")
        private val PRAYER_REQUEST_CODES = PRAYER_KEYS.mapIndexed { index, _ -> REQUEST_CODE_BASE + index }

        /**
         * Schedule exact alarm for a specific prayer time.
         * Uses AlarmManager.setAlarmClock() which is the most reliable method —
         * it shows in the system alarm status bar and is NOT affected by Doze mode.
         */
        fun scheduleAdhanAlarm(
            context: Context,
            prayerKey: String,
            triggerAtMillis: Long,
            localizedName: String,
            adhanSound: String?
        ) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val index = PRAYER_KEYS.indexOf(prayerKey)
            if (index < 0) {
                Log.w(TAG, "Unknown prayer key: $prayerKey")
                return
            }

            // Skip if trigger time is in the past
            if (triggerAtMillis <= System.currentTimeMillis()) {
                Log.d(TAG, "Skipping $prayerKey — time already passed")
                return
            }

            val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
                action = ACTION_PLAY_ADHAN
                putExtra(EXTRA_PRAYER_NAME, prayerKey)
                putExtra(EXTRA_PRAYER_NAME_LOCALIZED, localizedName)
                if (adhanSound != null) putExtra(EXTRA_ADHAN_SOUND, adhanSound)
            }

            val requestCode = PRAYER_REQUEST_CODES[index]
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // setAlarmClock is the most aggressive API — it wakes the device from Doze,
            // shows an alarm icon in the status bar, and is critical-path for prayer apps.
            val showIntent = PendingIntent.getActivity(
                context,
                requestCode,
                Intent(context, MainActivity::class.java),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setAlarmClock(
                        AlarmManager.AlarmClockInfo(triggerAtMillis, showIntent),
                        pendingIntent
                    )
                } else {
                    // Fallback to inexact but still-while-idle alarm
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                    )
                }
            } else {
                alarmManager.setAlarmClock(
                    AlarmManager.AlarmClockInfo(triggerAtMillis, showIntent),
                    pendingIntent
                )
            }

            Log.d(TAG, "Adhan alarm scheduled for $prayerKey at $triggerAtMillis")
        }

        /**
         * Cancel all scheduled Adhan alarms.
         */
        fun cancelAllAdhanAlarms(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            PRAYER_KEYS.forEachIndexed { index, _ ->
                val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
                    action = ACTION_PLAY_ADHAN
                }
                val pendingIntent = PendingIntent.getBroadcast(
                    context,
                    PRAYER_REQUEST_CODES[index],
                    intent,
                    PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
                )
                pendingIntent?.let {
                    alarmManager.cancel(it)
                    it.cancel()
                }
            }
            Log.d(TAG, "All Adhan alarms cancelled")
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            ACTION_PLAY_ADHAN -> {
                val prayerKey = intent.getStringExtra(EXTRA_PRAYER_NAME) ?: "Dhuhr"
                val localizedName = intent.getStringExtra(EXTRA_PRAYER_NAME_LOCALIZED) ?: prayerKey
                val adhanSound = intent.getStringExtra(EXTRA_ADHAN_SOUND)

                Log.d(TAG, "Adhan alarm fired for $prayerKey, starting foreground service")

                // Start the foreground service to play Adhan
                val serviceIntent = Intent(context, AdhanForegroundService::class.java).apply {
                    putExtra(AdhanForegroundService.EXTRA_PRAYER_NAME, prayerKey)
                    putExtra(AdhanForegroundService.EXTRA_PRAYER_NAME_LOCALIZED, localizedName)
                    if (adhanSound != null) {
                        putExtra(AdhanForegroundService.EXTRA_ADHAN_SOUND, adhanSound)
                    }
                }

                ContextCompat.startForegroundService(context, serviceIntent)
            }        }
    }
}


