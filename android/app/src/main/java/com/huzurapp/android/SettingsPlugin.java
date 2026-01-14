package com.huzurapp.android;

import android.content.Intent;
import android.provider.Settings;
import android.net.Uri;
import android.os.PowerManager;
import android.content.Context;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SettingsPlugin")
public class SettingsPlugin extends Plugin {

    @PluginMethod
    public void openBatterySettings(PluginCall call) {
        try {
            Intent intent = new Intent();
            intent.setAction(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            // Fallback to generic settings if specific one fails
            try {
                Intent intent = new Intent(Settings.ACTION_SETTINGS);
                getContext().startActivity(intent);
                call.resolve();
            } catch (Exception ex) {
                call.reject("Could not open settings", ex);
            }
        }
    }
}
