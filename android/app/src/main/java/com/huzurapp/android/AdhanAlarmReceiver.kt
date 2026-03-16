package com.huzurapp.android

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat

class AdhanAlarmReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "AdhanAlarmReceiver"
        const val ACTION_PLAY_ADHAN = "com.huzurapp.android.ACTION_PLAY_ADHAN"
        const val EXTRA_PRAYER_NAME = "prayer_name"
        const val EXTRA_PRAYER_NAME_LOCALIZED = "prayer_name_localized"
        const val EXTRA_ADHAN_SOUND = "adhan_sound"

        private const val REQUEST_CODE_BASE = 5000
        private const val REQUEST_CODE_WINDOW_SIZE = 100
        private val prayerKeys = listOf("Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha")

        fun scheduleAdhanAlarm(
            context: Context,
            prayerKey: String,
            dayOffset: Int,
            triggerAtMillis: Long,
            localizedName: String,
            adhanSound: String?
        ) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val prayerIndex = prayerKeys.indexOf(prayerKey)
            if (prayerIndex < 0) {
                Log.w(TAG, "Unknown prayer key: $prayerKey")
                return
            }

            if (triggerAtMillis <= System.currentTimeMillis()) {
                Log.d(TAG, "Skipping $prayerKey because time already passed")
                return
            }

            val requestCode = buildRequestCode(prayerIndex, dayOffset)
            val intent = Intent(context, AdhanAlarmReceiver::class.java).apply {
                action = ACTION_PLAY_ADHAN
                putExtra(EXTRA_PRAYER_NAME, prayerKey)
                putExtra(EXTRA_PRAYER_NAME_LOCALIZED, localizedName)
                if (adhanSound != null) {
                    putExtra(EXTRA_ADHAN_SOUND, adhanSound)
                }
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val showIntent = PendingIntent.getActivity(
                context,
                requestCode,
                Intent(context, MainActivity::class.java),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setAlarmClock(
                    AlarmManager.AlarmClockInfo(triggerAtMillis, showIntent),
                    pendingIntent
                )
            }

            Log.d(TAG, "Adhan alarm scheduled for $prayerKey at $triggerAtMillis")
        }

        fun cancelAllAdhanAlarms(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            repeat(2) { dayOffset ->
                prayerKeys.forEachIndexed { prayerIndex, _ ->
                    val pendingIntent = PendingIntent.getBroadcast(
                        context,
                        buildRequestCode(prayerIndex, dayOffset),
                        Intent(context, AdhanAlarmReceiver::class.java).apply {
                            action = ACTION_PLAY_ADHAN
                        },
                        PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
                    )

                    pendingIntent?.let {
                        alarmManager.cancel(it)
                        it.cancel()
                    }
                }
            }
        }

        private fun buildRequestCode(prayerIndex: Int, dayOffset: Int): Int {
            return REQUEST_CODE_BASE + (dayOffset * REQUEST_CODE_WINDOW_SIZE) + prayerIndex
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_PLAY_ADHAN) {
            return
        }

        val prayerKey = intent.getStringExtra(EXTRA_PRAYER_NAME) ?: "Dhuhr"
        val localizedName = intent.getStringExtra(EXTRA_PRAYER_NAME_LOCALIZED) ?: prayerKey
        val adhanSound = intent.getStringExtra(EXTRA_ADHAN_SOUND)

        val serviceIntent = Intent(context, AdhanForegroundService::class.java).apply {
            putExtra(AdhanForegroundService.EXTRA_PRAYER_NAME, prayerKey)
            putExtra(AdhanForegroundService.EXTRA_PRAYER_NAME_LOCALIZED, localizedName)
            if (adhanSound != null) {
                putExtra(AdhanForegroundService.EXTRA_ADHAN_SOUND, adhanSound)
            }
        }

        ContextCompat.startForegroundService(context, serviceIntent)
        PrayerScheduleCoordinator.rescheduleFromStore(context, "adhan_alarm_fired")
    }
}
