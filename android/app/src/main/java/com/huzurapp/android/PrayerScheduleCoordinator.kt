package com.huzurapp.android

import android.content.Context
import android.util.Log
import org.json.JSONObject
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

object PrayerScheduleCoordinator {
    private const val TAG = "PrayerScheduleCoordinator"
    private const val PREFS_NAME = "PrayerScheduleCoordinator"
    private const val KEY_LAST_SYNC_SIGNATURE = "last_sync_signature"
    private const val KEY_LAST_SYNC_AT = "last_sync_at"
    private const val SCHEDULE_WINDOW_DAYS = 2
    private val SYNC_DEBOUNCE_MS = TimeUnit.MINUTES.toMillis(15)

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
            val signature = buildScheduleSignature(
                timingsJson = timingsJson,
                latitude = latitude,
                longitude = longitude,
                locationName = locationName,
                adhanSound = adhanSound
            )

            if (shouldSkipDuplicateSync(context, signature)) {
                logSchedule("sync_skipped_duplicate:$source")
                return true
            }

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
            PrayerDataSyncWorker.enqueueImmediateIfStale(context)
            markSyncCompleted(context, signature)
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
        Log.d(TAG, "[PrayerSchedule] $message")
    }

    private fun shouldSkipDuplicateSync(context: Context, signature: String): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val lastSignature = prefs.getString(KEY_LAST_SYNC_SIGNATURE, null)
        val lastSyncAt = prefs.getLong(KEY_LAST_SYNC_AT, 0L)
        val ageMs = System.currentTimeMillis() - lastSyncAt

        return lastSignature == signature && ageMs in 0 until SYNC_DEBOUNCE_MS
    }

    private fun markSyncCompleted(context: Context, signature: String) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_LAST_SYNC_SIGNATURE, signature)
            .putLong(KEY_LAST_SYNC_AT, System.currentTimeMillis())
            .apply()
    }

    private fun buildScheduleSignature(
        timingsJson: String,
        latitude: Double?,
        longitude: Double?,
        locationName: String?,
        adhanSound: String?
    ): String {
        val raw = listOf(
            timingsJson,
            latitude?.let { String.format("%.4f", it) } ?: "",
            longitude?.let { String.format("%.4f", it) } ?: "",
            locationName.orEmpty(),
            adhanSound.orEmpty()
        ).joinToString("|")

        val digest = MessageDigest.getInstance("SHA-256").digest(raw.toByteArray(Charsets.UTF_8))
        return digest.joinToString("") { "%02x".format(it) }
    }
}
