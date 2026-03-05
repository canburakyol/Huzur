package com.huzurapp.android

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat

/**
 * Foreground Service that plays the Adhan (call to prayer) audio reliably
 * even when the app is killed or the device is in Doze mode.
 *
 * Lifecycle:
 * 1. AdhanAlarmReceiver triggers at exact prayer time via AlarmManager.setAlarmClock()
 * 2. Receiver starts this service via startForegroundService()
 * 3. Service acquires WakeLock, plays audio, then self-stops
 */
class AdhanForegroundService : Service() {

    companion object {
        private const val TAG = "AdhanForegroundService"
        const val CHANNEL_ID = "adhan_playback_channel"
        const val NOTIFICATION_ID = 9001
        const val EXTRA_PRAYER_NAME = "prayer_name"
        const val EXTRA_PRAYER_NAME_LOCALIZED = "prayer_name_localized"
        const val EXTRA_ADHAN_SOUND = "adhan_sound"
        const val ACTION_STOP = "com.huzurapp.android.STOP_ADHAN"

        private val PRAYER_NAME_MAP = mapOf(
            "Fajr" to "İmsak",
            "Sunrise" to "Güneş",
            "Dhuhr" to "Öğle",
            "Asr" to "İkindi",
            "Maghrib" to "Akşam",
            "Isha" to "Yatsı"
        )
    }

    private var mediaPlayer: MediaPlayer? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var audioFocusRequest: AudioFocusRequest? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopPlaybackAndService()
            return START_NOT_STICKY
        }

        val prayerKey = intent?.getStringExtra(EXTRA_PRAYER_NAME) ?: "Dhuhr"
        val localizedName = intent?.getStringExtra(EXTRA_PRAYER_NAME_LOCALIZED)
            ?: PRAYER_NAME_MAP[prayerKey]
            ?: prayerKey
        val adhanSound = intent?.getStringExtra(EXTRA_ADHAN_SOUND)

        // Acquire partial wake lock to keep CPU running during playback
        acquireWakeLock()

        // Show foreground notification immediately (required within 5 seconds on Android 12+)
        val notification = buildNotification(localizedName)
        startForeground(NOTIFICATION_ID, notification)

        // Play Adhan audio
        playAdhan(adhanSound, prayerKey)

        return START_NOT_STICKY
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "huzur:adhan_playback"
        ).apply {
            acquire(5 * 60 * 1000L) // Max 5 minutes timeout as safety net
        }
    }

    private fun playAdhan(soundName: String?, prayerKey: String) {
        try {
            // Request audio focus
            val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val attrs = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()

                audioFocusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                    .setAudioAttributes(attrs)
                    .build()

                audioManager.requestAudioFocus(audioFocusRequest!!)
            }

            mediaPlayer = MediaPlayer().apply {
                val audioAttrs = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()
                setAudioAttributes(audioAttrs)

                // Resolve the sound file: check user preference, fallback to default
                val soundUri = resolveAdhanUri(soundName)
                if (soundUri != null) {
                    setDataSource(this@AdhanForegroundService, soundUri)
                } else {
                    // Use the default notification sound as ultimate fallback
                    val defaultUri = android.provider.Settings.System.DEFAULT_ALARM_ALERT_URI
                    setDataSource(this@AdhanForegroundService, defaultUri)
                }

                setOnCompletionListener {
                    Log.d(TAG, "Adhan playback completed for $prayerKey")
                    stopPlaybackAndService()
                }
                setOnErrorListener { _, what, extra ->
                    Log.e(TAG, "MediaPlayer error: what=$what extra=$extra")
                    stopPlaybackAndService()
                    true
                }
                prepareAsync()
                setOnPreparedListener { mp -> mp.start() }
            }

            Log.d(TAG, "Adhan playback started for $prayerKey")
        } catch (e: Exception) {
            Log.e(TAG, "Error playing adhan", e)
            stopPlaybackAndService()
        }
    }

    /**
     * Try to resolve a raw resource URI from the asset name provided.
     * Expected: "adhan_makkah", "adhan_madinah" etc. placed in res/raw/
     */
    private fun resolveAdhanUri(soundName: String?): Uri? {
        if (soundName.isNullOrBlank()) return null
        val resId = resources.getIdentifier(soundName, "raw", packageName)
        return if (resId != 0) {
            Uri.parse("android.resource://$packageName/$resId")
        } else {
            null
        }
    }

    private fun buildNotification(prayerName: String): Notification {
        // Intent to open the app when notification is tapped
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Intent to stop the Adhan
        val stopIntent = Intent(this, AdhanForegroundService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("🕌 $prayerName Vakti")
            .setContentText("Ezan okunuyor...")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(openAppPendingIntent)
            .addAction(0, "Durdur", stopPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Ezan Sesi",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Namaz vakitlerinde ezan sesi çalar"
                setBypassDnd(true)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun stopPlaybackAndService() {
        try {
            mediaPlayer?.apply {
                if (isPlaying) stop()
                release()
            }
            mediaPlayer = null

            // Release audio focus
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                audioFocusRequest?.let {
                    val am = getSystemService(Context.AUDIO_SERVICE) as AudioManager
                    am.abandonAudioFocusRequest(it)
                }
            }

            // Release wake lock
            wakeLock?.let {
                if (it.isHeld) it.release()
            }
            wakeLock = null

            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping service", e)
        }
    }

    override fun onDestroy() {
        stopPlaybackAndService()
        super.onDestroy()
    }
}

