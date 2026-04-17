package com.huzurapp.android;

import android.content.SharedPreferences;

import androidx.annotation.NonNull;

import com.android.installreferrer.api.InstallReferrerClient;
import com.android.installreferrer.api.InstallReferrerStateListener;
import com.android.installreferrer.api.ReferrerDetails;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "InstallReferrer")
public class InstallReferrerPlugin extends Plugin {
    private static final String PREFS_NAME = "huzur_install_referrer";
    private static final String KEY_CONSUMED_REFERRER = "consumed_referrer";

    @PluginMethod
    public void getInstallReferrerDetails(PluginCall call) {
        InstallReferrerClient client = InstallReferrerClient.newBuilder(getContext()).build();

        client.startConnection(new InstallReferrerStateListener() {
            @Override
            public void onInstallReferrerSetupFinished(int responseCode) {
                JSObject result = new JSObject();
                result.put("success", responseCode == InstallReferrerClient.InstallReferrerResponse.OK);
                result.put("responseCode", responseCode);

                if (responseCode != InstallReferrerClient.InstallReferrerResponse.OK) {
                    result.put("referrer", "");
                    result.put("consumed", false);
                    client.endConnection();
                    call.resolve(result);
                    return;
                }

                try {
                    ReferrerDetails details = client.getInstallReferrer();
                    String referrer = details != null ? details.getInstallReferrer() : "";
                    String consumedReferrer = getPreferences().getString(KEY_CONSUMED_REFERRER, "");

                    result.put("referrer", referrer != null ? referrer : "");
                    result.put("installBeginTimestampSeconds", details != null ? details.getInstallBeginTimestampSeconds() : 0);
                    result.put("referrerClickTimestampSeconds", details != null ? details.getReferrerClickTimestampSeconds() : 0);
                    result.put("googlePlayInstant", details != null && details.getGooglePlayInstantParam());
                    result.put("consumed", referrer != null && !referrer.isEmpty() && referrer.equals(consumedReferrer));
                    call.resolve(result);
                } catch (Exception error) {
                    call.reject("Failed to read install referrer: " + error.getMessage(), error);
                } finally {
                    client.endConnection();
                }
            }

            @Override
            public void onInstallReferrerServiceDisconnected() {
                // No-op; the next request will reconnect if needed.
            }
        });
    }

    @PluginMethod
    public void markInstallReferrerConsumed(PluginCall call) {
        String referrer = call.getString("referrer", "");
        getPreferences().edit().putString(KEY_CONSUMED_REFERRER, referrer).apply();

        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
    }

    @NonNull
    private SharedPreferences getPreferences() {
        return getContext().getSharedPreferences(PREFS_NAME, android.content.Context.MODE_PRIVATE);
    }
}
