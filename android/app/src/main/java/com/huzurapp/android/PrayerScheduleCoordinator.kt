package com.huzurapp.android

import android.content.Context
import android.util.Log
import com.google.firebase.crashlytics.FirebaseCrashlytics
import org.json.JSONObject

object PrayerScheduleCoordinator {
    private const val TAG = "PrayerScheduleCoordinator"
    private const val SCHEDULE_WINDOW_DAYS = 2

    private val prayerNamesTr = mapOf(
        "Fajr" to "İmsak",
        "Sunrise" to "Güneş",
        "Dhuhr" to "Öğle",
        "Asr" to "İkindi",
        "Maghrib" to "Akşam",
        "Isha" to "Yatsı"
    )

    @JvmStatic
    fun syncSchedule(
        context: Context,
        timingsJson: String,
        latitude: Double?,
        longitude: Double?,
        locationName: String?,
        adhanSound: String?,
        source: String
    ): Boolean {
        return try {
            PrayerScheduleStore.saveScheduleContext(
                context = context,
                timingsJson = timingsJson,
                latitude = latitude,
                longitude = longitude,
                locationName = locationName,
                adhanSound = adhanSound
            )

            if (latitude != null && longitude != null) {
                PrayerDataSyncWorker.updateCoordinates(context, latitude, longitude)
            }

            PrayerDataSyncWorker.enqueue(context)
            PrayerDataSyncWorker.enqueueImmediate(context)
            rescheduleFromStore(context, source)
        } catch (error: Exception) {
            logSchedule("sync_failed:$source:${error.message}")
            Log.e(TAG, "Failed to sync prayer schedule", error)
            false
        }
    }

    @JvmStatic
    fun rescheduleFromStore(context: Context, source: String): Boolean {
        val scheduleContext = PrayerScheduleStore.getScheduleContext(context) ?: return false
        val fallbackTimings = parseTimingsMap(scheduleContext.timingsJson)
        if (fallbackTimings.isEmpty()) {
            return false
        }

        val nowMillis = System.currentTimeMillis()
        val slots = PrayerScheduleCalculator.buildUpcomingSlots(
            nowMillis = nowMillis,
            fallbackTimings = fallbackTimings,
            scheduleWindowDays = SCHEDULE_WINDOW_DAYS
        ) { dayOffset ->
            PrayerDataSyncWorker.getTimingsForDayOffset(context, dayOffset)
        }

        AdhanAlarmReceiver.cancelAllAdhanAlarms(context)
        WidgetAlarmReceiver.cancelAllAlarms(context)

        slots.forEach { slot ->
            val localizedName = prayerNamesTr[slot.prayerKey] ?: slot.prayerKey

            AdhanAlarmReceiver.scheduleAdhanAlarm(
                context = context,
                prayerKey = slot.prayerKey,
                dayOffset = slot.dayOffset,
                triggerAtMillis = slot.triggerAtMillis,
                localizedName = localizedName,
                adhanSound = scheduleContext.adhanSound
            )

            WidgetAlarmReceiver.schedulePrayerAlarm(
                context,
                slot.prayerKey,
                slot.dayOffset,
                slot.triggerAtMillis
            )
        }

        logSchedule("rescheduled:$source:${slots.size}")
        Log.d(TAG, "Prayer schedule refreshed from $source with ${slots.size} alarms")
        return true
    }

    @JvmStatic
    fun parseTimingsMap(timingsJson: String): Map<String, String> {
        return try {
            val timings = JSONObject(timingsJson)
            PrayerScheduleCalculator.prayerKeys
                .mapNotNull { prayerKey ->
                    val value = timings.optString(prayerKey).trim()
                    if (value.isEmpty()) null else prayerKey to value
                }
                .toMap()
        } catch (_: Exception) {
            emptyMap()
        }
    }

    private fun logSchedule(message: String) {
        try {
            FirebaseCrashlytics.getInstance().log("[PrayerSchedule] $message")
        } catch (_: Exception) {
            // no-op
        }
    }
}
