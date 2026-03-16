package com.huzurapp.android

import android.content.Context
import org.json.JSONObject

object PrayerScheduleStore {
    private const val PREFS_NAME = "PrayerScheduleStore"
    private const val KEY_CONTEXT = "schedule_context"

    data class ScheduleContext(
        val timingsJson: String,
        val latitude: Double?,
        val longitude: Double?,
        val locationName: String?,
        val adhanSound: String?,
        val updatedAt: Long
    )

    @JvmStatic
    fun saveScheduleContext(
        context: Context,
        timingsJson: String,
        latitude: Double?,
        longitude: Double?,
        locationName: String?,
        adhanSound: String?
    ) {
        val payload = JSONObject().apply {
            put("timingsJson", timingsJson)
            put("latitude", latitude)
            put("longitude", longitude)
            put("locationName", locationName)
            put("adhanSound", adhanSound)
            put("updatedAt", System.currentTimeMillis())
        }

        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_CONTEXT, payload.toString())
            .apply()
    }

    @JvmStatic
    fun getScheduleContext(context: Context): ScheduleContext? {
        val raw = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_CONTEXT, null)
            ?: return null

        return try {
            val payload = JSONObject(raw)
            ScheduleContext(
                timingsJson = payload.getString("timingsJson"),
                latitude = payload.optDoubleOrNull("latitude"),
                longitude = payload.optDoubleOrNull("longitude"),
                locationName = payload.optString("locationName").ifBlank { null },
                adhanSound = payload.optString("adhanSound").ifBlank { null },
                updatedAt = payload.optLong("updatedAt", 0L)
            )
        } catch (_: Exception) {
            null
        }
    }

    @JvmStatic
    fun clear(context: Context) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .remove(KEY_CONTEXT)
            .apply()
    }
}

private fun JSONObject.optDoubleOrNull(key: String): Double? {
    if (isNull(key)) {
        return null
    }

    val value = optDouble(key, Double.NaN)
    return if (value.isNaN()) null else value
}
