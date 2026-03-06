package com.huzurapp.android

import android.content.Context
import android.util.Log
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.Calendar
import java.util.concurrent.TimeUnit

/**
 * Background Worker that periodically fetches monthly prayer times
 * and stores them in SharedPreferences for offline access.
 *
 * Runs once per day when network is available, using WorkManager constraints.
 * This ensures that even if the user doesn't open the app, prayer data is fresh.
 */
class PrayerDataSyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    companion object {
        private const val TAG = "PrayerDataSyncWorker"
        private const val WORK_NAME = "prayer_data_sync"
        private const val PREFS_NAME = "PrayerDataSync"
        private const val KEY_MONTHLY_DATA = "monthly_prayer_data"
        private const val KEY_LAST_SYNC = "last_sync_timestamp"
        private const val KEY_LATITUDE = "latitude"
        private const val KEY_LONGITUDE = "longitude"

        // Diyanet calculation method
        private const val CALCULATION_METHOD = 13
        private const val API_TIMEOUT_MS = 15_000

        // Default: Istanbul
        private const val DEFAULT_LAT = 41.0082
        private const val DEFAULT_LON = 28.9784

        /**
         * Enqueue the periodic sync worker. Call this once from app initialization.
         */
        fun enqueue(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = PeriodicWorkRequestBuilder<PrayerDataSyncWorker>(
                repeatInterval = 1,
                repeatIntervalTimeUnit = TimeUnit.DAYS
            )
                .setConstraints(constraints)
                .setInitialDelay(1, TimeUnit.HOURS) // First run after 1 hour
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP, // Don't replace if already scheduled
                request
            )

            Log.d(TAG, "PrayerDataSyncWorker enqueued (daily, network-required)")
        }

        /**
         * Update user coordinates (called from JS when location changes).
         */
        fun updateCoordinates(context: Context, latitude: Double, longitude: Double) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit()
                .putFloat(KEY_LATITUDE, latitude.toFloat())
                .putFloat(KEY_LONGITUDE, longitude.toFloat())
                .apply()
        }

        /**
         * Get stored monthly data for offline use.
         */
        fun getStoredMonthlyData(context: Context): String? {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return prefs.getString(KEY_MONTHLY_DATA, null)
        }
    }

    override suspend fun doWork(): Result {
        return try {
            val prefs = applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val latitude = prefs.getFloat(KEY_LATITUDE, DEFAULT_LAT.toFloat()).toDouble()
            val longitude = prefs.getFloat(KEY_LONGITUDE, DEFAULT_LON.toFloat()).toDouble()

            val now = Calendar.getInstance()
            val year = now.get(Calendar.YEAR)
            val month = now.get(Calendar.MONTH) + 1

            val apiUrl = "https://api.aladhan.com/v1/calendar/$year/$month" +
                "?latitude=$latitude&longitude=$longitude&method=$CALCULATION_METHOD"

            val response = fetchFromApi(apiUrl)

            if (response != null) {
                val jsonResponse = JSONObject(response)
                if (jsonResponse.has("data")) {
                    prefs.edit()
                        .putString(KEY_MONTHLY_DATA, response)
                        .putLong(KEY_LAST_SYNC, System.currentTimeMillis())
                        .apply()

                    Log.d(TAG, "Monthly prayer data synced successfully for $year-$month")
                    Result.success()
                } else {
                    Log.w(TAG, "API response missing 'data' field")
                    Result.retry()
                }
            } else {
                Log.w(TAG, "Failed to fetch prayer data, will retry")
                Result.retry()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Sync worker error", e)
            Result.retry()
        }
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
                val reader = BufferedReader(InputStreamReader(connection.inputStream))
                val response = reader.readText()
                reader.close()
                response
            } else {
                Log.w(TAG, "API returned status: ${connection.responseCode}")
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Network fetch error", e)
            null
        } finally {
            connection?.disconnect()
        }
    }
}
