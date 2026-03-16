package com.huzurapp.android

import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONArray
import org.json.JSONObject

@CapacitorPlugin(name = "PrayerSchedule")
class PrayerSchedulePlugin : Plugin() {
    companion object {
        private const val TAG = "PrayerSchedulePlugin"
    }

    @PluginMethod
    fun syncPrayerSchedule(call: PluginCall) {
        try {
            val timings = call.getObject("timings")
            if (timings == null) {
                call.reject("timings is required")
                return
            }

            val existingContext = PrayerScheduleStore.getScheduleContext(context)
            val latitude = call.getDouble("latitude") ?: existingContext?.latitude
            val longitude = call.getDouble("longitude") ?: existingContext?.longitude
            val locationName = call.getString("locationName") ?: existingContext?.locationName
            val adhanSound = call.getString("adhanSound") ?: existingContext?.adhanSound
            val monthlySnapshots = call.getArray("monthlySnapshots")

            saveMonthlySnapshots(monthlySnapshots)

            val success = PrayerScheduleCoordinator.syncSchedule(
                context = context,
                timingsJson = timings.toString(),
                latitude = latitude,
                longitude = longitude,
                locationName = locationName,
                adhanSound = adhanSound,
                source = "js_sync"
            )

            val ret = JSObject()
            ret.put("success", success)
            ret.put("message", if (success) "Prayer schedule synced" else "Prayer schedule sync skipped")
            call.resolve(ret)
        } catch (error: Exception) {
            Log.e(TAG, "Failed to sync prayer schedule", error)
            call.reject("Failed to sync prayer schedule: ${error.message}")
        }
    }

    private fun saveMonthlySnapshots(monthlySnapshots: JSONArray?) {
        if (monthlySnapshots == null || monthlySnapshots.length() == 0) {
            return
        }

        for (index in 0 until monthlySnapshots.length()) {
            val snapshot = monthlySnapshots.optJSONObject(index) ?: continue
            val year = snapshot.optInt("year")
            val month = snapshot.optInt("month")
            val timings = snapshot.optJSONArray("timings") ?: continue

            if (year <= 0 || month <= 0) {
                continue
            }

            val payload = JSONObject().apply {
                put("data", timings)
            }

            PrayerDataSyncWorker.saveMonthlyData(context, year, month, payload.toString())
        }
    }
}
