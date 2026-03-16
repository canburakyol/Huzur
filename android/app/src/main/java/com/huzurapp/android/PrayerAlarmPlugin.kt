package com.huzurapp.android

import android.content.Context
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "PrayerAlarm")
class PrayerAlarmPlugin : Plugin() {

    companion object {
        private const val TAG = "PrayerAlarmPlugin"

        fun rescheduleFromStorage(context: Context) {
            PrayerScheduleCoordinator.rescheduleFromStore(context, "legacy_reschedule")
        }
    }

    @PluginMethod
    fun scheduleAdhanAlarms(call: PluginCall) {
        try {
            val timings = call.getObject("timings")
            if (timings == null) {
                call.reject("Missing 'timings' parameter")
                return
            }

            val existingContext = PrayerScheduleStore.getScheduleContext(context)
            val success = PrayerScheduleCoordinator.syncSchedule(
                context = context,
                timingsJson = timings.toString(),
                latitude = existingContext?.latitude,
                longitude = existingContext?.longitude,
                locationName = existingContext?.locationName,
                adhanSound = call.getString("adhanSound") ?: existingContext?.adhanSound,
                source = "legacy_prayer_alarm_plugin"
            )

            val ret = JSObject()
            ret.put("success", success)
            ret.put("message", if (success) "Adhan alarms scheduled" else "Adhan alarm scheduling skipped")
            call.resolve(ret)
        } catch (error: Exception) {
            Log.e(TAG, "Error in scheduleAdhanAlarms", error)
            call.reject("Failed to schedule alarms: ${error.message}")
        }
    }

    @PluginMethod
    fun cancelAdhanAlarms(call: PluginCall) {
        try {
            AdhanAlarmReceiver.cancelAllAdhanAlarms(context)
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (error: Exception) {
            call.reject("Failed to cancel alarms: ${error.message}")
        }
    }

    @PluginMethod
    fun setAdhanSound(call: PluginCall) {
        try {
            val soundName = call.getString("soundName")
            val existingContext = PrayerScheduleStore.getScheduleContext(context)

            if (existingContext != null) {
                PrayerScheduleCoordinator.syncSchedule(
                    context = context,
                    timingsJson = existingContext.timingsJson,
                    latitude = existingContext.latitude,
                    longitude = existingContext.longitude,
                    locationName = existingContext.locationName,
                    adhanSound = soundName,
                    source = "legacy_adhan_sound"
                )
            }

            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (error: Exception) {
            call.reject("Failed to set adhan sound: ${error.message}")
        }
    }

    @PluginMethod
    fun isEnabled(call: PluginCall) {
        val ret = JSObject()
        ret.put("enabled", PrayerScheduleStore.getScheduleContext(context) != null)
        call.resolve(ret)
    }
}
