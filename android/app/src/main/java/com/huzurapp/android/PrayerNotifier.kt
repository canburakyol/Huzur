package com.huzurapp.android

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

/**
 * Plain "prayer time" notification posted natively when the adhan is on but cannot play:
 * the phone is on silent/vibrate, Android blocked the foreground service, or playback ended.
 * When the adhan is on, JS does not schedule its own main prayer notification, so this is the only one.
 */
object PrayerNotifier {
    // Same id as the JS channel NOTIFICATION_CHANNELS.PRAYER, so users manage one "prayer times" channel.
    private const val CHANNEL_ID = "prayer_times"
    private const val NOTIFICATION_ID_BASE = 7000
    private val prayerKeys = listOf("Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha")

    @JvmStatic
    fun showPrayerNotification(context: Context, prayerKey: String, localizedName: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }

        val manager = context.getSystemService(NotificationManager::class.java) ?: return
        ensureChannel(context, manager)

        val openApp = PendingIntent.getActivity(
            context,
            NOTIFICATION_ID_BASE,
            Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val title = PrayerScheduleStore.getNotificationLabel(context, "adhanTitle")?.replace("%s", localizedName)
            ?: "🕌 $localizedName Vakti"
        val body = PrayerScheduleStore.getNotificationLabel(context, "prayerTimeBody") ?: "Vakit girdi."

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(openApp)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .build()

        val index = prayerKeys.indexOf(prayerKey).coerceAtLeast(0)
        manager.notify(NOTIFICATION_ID_BASE + index, notification)
    }

    private fun ensureChannel(context: Context, manager: NotificationManager) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        if (manager.getNotificationChannel(CHANNEL_ID) != null) return
        // JS normally creates this channel with the localized name; this covers a fresh install that never opened it.
        val channel = NotificationChannel(
            CHANNEL_ID,
            PrayerScheduleStore.getNotificationLabel(context, "prayerChannelName") ?: "Namaz Vakitleri",
            NotificationManager.IMPORTANCE_HIGH
        )
        manager.createNotificationChannel(channel)
    }
}
