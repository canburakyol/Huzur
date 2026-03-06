package com.huzurapp.android

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

/**
 * Capacitor Plugin that bridges JavaScript → Native for scheduling
 * exact Adhan alarms via AlarmManager.setAlarmClock().
 *
 * JS usage:
 *   import { registerPlugin } from '@capacitor/core';
 *   const PrayerAlarm = registerPlugin('PrayerAlarm');
 *   await PrayerAlarm.scheduleAdhanAlarms({ timings: {...}, adhanSound: 'adhan_makkah' });
 */
@CapacitorPlugin(name = "PrayerAlarm")
class PrayerAlarmPlugin : Plugin() {

    companion object {
        private const val TAG = "PrayerAlarmPlugin"
        private const val PREFS_NAME = "AdhanAlarmPrefs"
        private const val KEY_PRAYER_TIMES = "stored_prayer_times"
        private const val KEY_ADHAN_SOUND = "stored_adhan_sound"
        private const val KEY_ENABLED = "adhan_enabled"

        private val PRAYER_KEYS = listOf("Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha")
        private val PRAYER_NAMES_TR = mapOf(
            "Fajr" to "İmsak",
            "Sunrise" to "Güneş",
            "Dhuhr" to "Öğle",
            "Asr" to "İkindi",
            "Maghrib" to "Akşam",
            "Isha" to "Yatsı"
        )

        /**
         * Called from AdhanAlarmReceiver on BOOT_COMPLETED to re-register alarms.
         */
        fun rescheduleFromStorage(context: Context) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val enabled = prefs.getBoolean(KEY_ENABLED, false)
            if (!enabled) return

            val timesJson = prefs.getString(KEY_PRAYER_TIMES, null) ?: return
            val adhanSound = prefs.getString(KEY_ADHAN_SOUND, null)

            try {
                val timings = JSONObject(timesJson)
                scheduleAlarmsInternal(context, timings, adhanSound)
                Log.d(TAG, "Alarms re-scheduled from storage after boot")
            } catch (e: Exception) {
                Log.e(TAG, "Error rescheduling from storage", e)
            }
        }

        private fun scheduleAlarmsInternal(context: Context, timings: JSONObject, adhanSound: String?) {
            val today = Calendar.getInstance()

            for (prayerKey in PRAYER_KEYS) {
                if (!timings.has(prayerKey)) continue

                val timeStr = timings.getString(prayerKey)
                val triggerMillis = parseTimeToTodayMillis(timeStr, today)

                // Skip past times
                if (triggerMillis <= System.currentTimeMillis()) continue

                val localizedName = PRAYER_NAMES_TR[prayerKey] ?: prayerKey

                AdhanAlarmReceiver.scheduleAdhanAlarm(
                    context = context,
                    prayerKey = prayerKey,
                    triggerAtMillis = triggerMillis,
                    localizedName = localizedName,
                    adhanSound = adhanSound
                )
            }
        }

        private fun parseTimeToTodayMillis(timeStr: String, baseCalendar: Calendar): Long {
            return try {
                // Handle "HH:mm" or "HH:mm (TRT)" formats
                val cleanTime = timeStr.split(" ")[0].trim()
                val parts = cleanTime.split(":")
                val hour = parts[0].toInt()
                val minute = parts[1].toInt()

                val cal = baseCalendar.clone() as Calendar
                cal.set(Calendar.HOUR_OF_DAY, hour)
                cal.set(Calendar.MINUTE, minute)
                cal.set(Calendar.SECOND, 0)
                cal.set(Calendar.MILLISECOND, 0)
                cal.timeInMillis
            } catch (e: Exception) {
                Log.e(TAG, "Error parsing time: $timeStr", e)
                0L
            }
        }
    }

    /**
     * Schedule Adhan alarms for today's prayer times.
     * Called from JS with: PrayerAlarm.scheduleAdhanAlarms({ timings, adhanSound })
     */
    @PluginMethod
    fun scheduleAdhanAlarms(call: PluginCall) {
        try {
            val timingsObj = call.getObject("timings")
            val adhanSound = call.getString("adhanSound")

            if (timingsObj == null) {
                call.reject("Missing 'timings' parameter")
                return
            }

            val context = this.context

            // Persist for BOOT_COMPLETED rescheduling
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putString(KEY_PRAYER_TIMES, timingsObj.toString())
                .putString(KEY_ADHAN_SOUND, adhanSound)
                .putBoolean(KEY_ENABLED, true)
                .apply()

            // Cancel existing alarms first
            AdhanAlarmReceiver.cancelAllAdhanAlarms(context)

            // Schedule new alarms
            val timings = JSONObject(timingsObj.toString())
            scheduleAlarmsInternal(context, timings, adhanSound)

            val ret = JSObject()
            ret.put("success", true)
            ret.put("message", "Adhan alarms scheduled")
            call.resolve(ret)

            Log.d(TAG, "scheduleAdhanAlarms called from JS — alarms set")
        } catch (e: Exception) {
            Log.e(TAG, "Error in scheduleAdhanAlarms", e)
            call.reject("Failed to schedule alarms: ${e.message}")
        }
    }

    /**
     * Cancel all scheduled Adhan alarms.
     */
    @PluginMethod
    fun cancelAdhanAlarms(call: PluginCall) {
        try {
            AdhanAlarmReceiver.cancelAllAdhanAlarms(this.context)

            val prefs = this.context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putBoolean(KEY_ENABLED, false).apply()

            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to cancel alarms: ${e.message}")
        }
    }

    /**
     * Set the preferred Adhan sound name (res/raw resource name).
     */
    @PluginMethod
    fun setAdhanSound(call: PluginCall) {
        try {
            val soundName = call.getString("soundName")
            val prefs = this.context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(KEY_ADHAN_SOUND, soundName).apply()

            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to set adhan sound: ${e.message}")
        }
    }

    /**
     * Check if Adhan alarms are currently enabled.
     */
    @PluginMethod
    fun isEnabled(call: PluginCall) {
        val prefs = this.context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val enabled = prefs.getBoolean(KEY_ENABLED, false)
        val ret = JSObject()
        ret.put("enabled", enabled)
        call.resolve(ret)
    }
}
