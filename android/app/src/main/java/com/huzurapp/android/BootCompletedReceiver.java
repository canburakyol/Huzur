package com.huzurapp.android;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * Handles system boot broadcasts and re-initializes internal schedules.
 * This receiver is intentionally isolated from app-specific custom actions.
 */
public class BootCompletedReceiver extends BroadcastReceiver {
    private static final String TAG = "BootCompletedReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent != null ? intent.getAction() : null;
        if (!Intent.ACTION_BOOT_COMPLETED.equals(action) && !Intent.ACTION_LOCKED_BOOT_COMPLETED.equals(action)) {
            return;
        }

        try {
            WidgetAlarmReceiver.schedulePrayerAlarms(context);
            PrayerAlarmPlugin.Companion.rescheduleFromStorage(context);
            Log.d(TAG, "Boot detected - alarms rescheduled");
        } catch (Exception e) {
            Log.e(TAG, "Failed to reschedule alarms on boot", e);
        }
    }
}
