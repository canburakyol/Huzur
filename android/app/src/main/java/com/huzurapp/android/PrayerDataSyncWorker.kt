package com.huzurapp.android

import android.content.Context
import android.util.Log
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.OutOfQuotaPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.google.firebase.crashlytics.FirebaseCrashlytics
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.Calendar
import java.util.concurrent.TimeUnit

class PrayerDataSyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    companion object {
        private const val TAG = "PrayerDataSyncWorker"
        private const val WORK_NAME = "prayer_data_sync"
        private const val IMMEDIATE_WORK_NAME = "prayer_data_sync_immediate"
        private const val PREFS_NAME = "PrayerDataSync"
        private const val KEY_MONTHLY_DATA_PREFIX = "monthly_prayer_data_"
        private const val KEY_LAST_SYNC = "last_sync_timestamp"
        private const val KEY_LATITUDE = "latitude"
        private const val KEY_LONGITUDE = "longitude"
        private const val KEY_HAS_USER_COORDS = "has_user_coordinates"
        private const val CALCULATION_METHOD = 13
        private const val API_TIMEOUT_MS = 15_000
        private const val DEFAULT_LAT = 41.0082
        private const val DEFAULT_LON = 28.9784

        fun enqueue(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = PeriodicWorkRequestBuilder<PrayerDataSyncWorker>(
                repeatInterval = 1,
                repeatIntervalTimeUnit = TimeUnit.DAYS
            )
                .setConstraints(constraints)
                .setInitialDelay(1, TimeUnit.HOURS)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )
        }

        fun enqueueImmediate(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = OneTimeWorkRequestBuilder<PrayerDataSyncWorker>()
                .setConstraints(constraints)
                .setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST)
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                IMMEDIATE_WORK_NAME,
                ExistingWorkPolicy.REPLACE,
                request
            )
        }

        fun updateCoordinates(context: Context, latitude: Double, longitude: Double) {
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putFloat(KEY_LATITUDE, latitude.toFloat())
                .putFloat(KEY_LONGITUDE, longitude.toFloat())
                .putBoolean(KEY_HAS_USER_COORDS, true)
                .apply()
        }

        fun getStoredMonthlyData(context: Context): String? {
            val now = Calendar.getInstance()
            return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getString(buildMonthKey(now), null)
        }

        fun saveMonthlyData(context: Context, year: Int, month: Int, payload: String) {
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit()
                .putString(buildMonthKey(year, month), payload)
                .putLong(KEY_LAST_SYNC, System.currentTimeMillis())
                .apply()
        }

        fun getTimingsForDayOffset(context: Context, dayOffset: Int): Map<String, String>? {
            val targetDate = Calendar.getInstance().apply {
                add(Calendar.DAY_OF_YEAR, dayOffset)
            }

            return getTimingsForDate(context, targetDate)
        }

        private fun getTimingsForDate(context: Context, targetDate: Calendar): Map<String, String>? {
            val raw = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getString(buildMonthKey(targetDate), null)
                ?: return null

            return try {
                val response = JSONObject(raw)
                val data = response.optJSONArray("data") ?: return null
                val entry = data.optJSONObject(targetDate.get(Calendar.DAY_OF_MONTH) - 1) ?: return null
                val timings = entry.optJSONObject("timings") ?: return null
                PrayerScheduleCoordinator.parseTimingsMap(timings.toString())
            } catch (_: Exception) {
                null
            }
        }

        private fun buildMonthKey(calendar: Calendar): String {
            return buildMonthKey(
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH) + 1
            )
        }

        private fun buildMonthKey(year: Int, month: Int): String {
            return "${KEY_MONTHLY_DATA_PREFIX}${year}_${month}"
        }
    }

    override suspend fun doWork(): Result {
        return try {
            val prefs = applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val hasUserCoords = prefs.getBoolean(KEY_HAS_USER_COORDS, false)
            val latitude = if (hasUserCoords) {
                prefs.getFloat(KEY_LATITUDE, DEFAULT_LAT.toFloat()).toDouble()
            } else {
                DEFAULT_LAT
            }
            val longitude = if (hasUserCoords) {
                prefs.getFloat(KEY_LONGITUDE, DEFAULT_LON.toFloat()).toDouble()
            } else {
                DEFAULT_LON
            }

            val now = Calendar.getInstance()
            val tomorrow = Calendar.getInstance().apply {
                add(Calendar.DAY_OF_YEAR, 1)
            }

            val syncedCurrentMonth = syncMonth(now, latitude, longitude)
            val syncedTomorrowMonth = if (tomorrow.get(Calendar.MONTH) != now.get(Calendar.MONTH)
                || tomorrow.get(Calendar.YEAR) != now.get(Calendar.YEAR)
            ) {
                syncMonth(tomorrow, latitude, longitude)
            } else {
                true
            }

            if (PrayerScheduleStore.getScheduleContext(applicationContext) != null) {
                PrayerScheduleCoordinator.rescheduleFromStore(applicationContext, "worker_sync")
            }

            if (syncedCurrentMonth && syncedTomorrowMonth) {
                logBreadcrumb("worker_sync_success")
                Result.success()
            } else {
                logBreadcrumb("worker_sync_retry")
                Result.retry()
            }
        } catch (error: Exception) {
            Log.e(TAG, "Sync worker error", error)
            logBreadcrumb("worker_sync_error:${error.message}")
            Result.retry()
        }
    }

    private fun syncMonth(targetMonth: Calendar, latitude: Double, longitude: Double): Boolean {
        val year = targetMonth.get(Calendar.YEAR)
        val month = targetMonth.get(Calendar.MONTH) + 1
        val apiUrl = "https://api.aladhan.com/v1/calendar/$year/$month" +
            "?latitude=$latitude&longitude=$longitude&method=$CALCULATION_METHOD"

        val response = fetchFromApi(apiUrl) ?: return false
        val jsonResponse = JSONObject(response)
        if (!jsonResponse.has("data")) {
            return false
        }

        saveMonthlyData(applicationContext, year, month, response)
        return true
    }

    private fun fetchFromApi(urlString: String): String? {
        var connection: HttpURLConnection? = null
        return try {
            val url = URL(urlString)
            connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = API_TIMEOUT_MS
            connection.readTimeout = API_TIMEOUT_MS

            if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader(InputStreamReader(connection.inputStream)).use { reader ->
                    reader.readText()
                }
            } else {
                null
            }
        } catch (error: Exception) {
            Log.e(TAG, "Network fetch error", error)
            null
        } finally {
            connection?.disconnect()
        }
    }

    private fun logBreadcrumb(message: String) {
        try {
            FirebaseCrashlytics.getInstance().log("[PrayerDataSyncWorker] $message")
        } catch (_: Exception) {
            // no-op
        }
    }
}
