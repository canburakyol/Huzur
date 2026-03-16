package com.huzurapp.android;

import android.app.Activity;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdLoader;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.nativead.NativeAd;
import com.google.android.gms.ads.nativead.NativeAdOptions;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@CapacitorPlugin(name = "NativeAdBridge")
public class NativeAdBridgePlugin extends Plugin {
    private static final String TAG = "NativeAdBridge";

    private final Map<String, NativeAd> adCache = new ConcurrentHashMap<>();
    private final Set<String> impressionSent = ConcurrentHashMap.newKeySet();
    private final Set<String> clickSent = ConcurrentHashMap.newKeySet();

    @PluginMethod
    public void initialize(PluginCall call) {
        try {
            MobileAds.initialize(getContext(), initializationStatus -> {
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            });
        } catch (Exception e) {
            call.reject("Native Ad initialize failed: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void loadAd(PluginCall call) {
        final String adUnitId = call.getString("adUnitId");
        if (TextUtils.isEmpty(adUnitId)) {
            call.reject("adUnitId is required");
            return;
        }

        final Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is not available");
            return;
        }

        activity.runOnUiThread(() -> {
            try {
                AdLoader adLoader = new AdLoader.Builder(activity, adUnitId)
                    .forNativeAd(nativeAd -> {
                        String adId = UUID.randomUUID().toString();
                        adCache.put(adId, nativeAd);

                        JSObject data = extractAdData(nativeAd, adId);
                        call.resolve(data);
                    })
                    .withNativeAdOptions(new NativeAdOptions.Builder().build())
                    .withAdListener(new AdListener() {
                        @Override
                        public void onAdFailedToLoad(LoadAdError loadAdError) {
                            call.reject("Native ad load failed: " + loadAdError.getMessage());
                        }
                    })
                    .build();

                adLoader.loadAd(new AdRequest.Builder().build());
            } catch (Exception e) {
                call.reject("Native ad load failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void reportImpression(PluginCall call) {
        String adId = call.getString("adId");
        if (TextUtils.isEmpty(adId)) {
            call.reject("adId is required");
            return;
        }

        NativeAd nativeAd = adCache.get(adId);
        if (nativeAd == null) {
            call.reject("Ad not found");
            return;
        }

        try {
            if (!impressionSent.contains(adId)) {
                nativeAd.recordImpression(new Bundle());
                impressionSent.add(adId);
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("adId", adId);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Impression report failed: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void reportClick(PluginCall call) {
        String adId = call.getString("adId");
        if (TextUtils.isEmpty(adId)) {
            call.reject("adId is required");
            return;
        }

        NativeAd nativeAd = adCache.get(adId);
        if (nativeAd == null) {
            call.reject("Ad not found");
            return;
        }

        try {
            if (!clickSent.contains(adId)) {
                nativeAd.performClick(new Bundle());
                clickSent.add(adId);
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("adId", adId);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Click report failed: " + e.getMessage(), e);
        }
    }

    private JSObject extractAdData(NativeAd nativeAd, String adId) {
        JSObject adData = new JSObject();
        adData.put("adId", adId);
        adData.put("headline", safeString(nativeAd.getHeadline()));
        adData.put("body", safeString(nativeAd.getBody()));
        adData.put("callToAction", safeString(nativeAd.getCallToAction()));
        adData.put("advertiser", safeString(nativeAd.getAdvertiser()));
        adData.put("price", safeString(nativeAd.getPrice()));
        adData.put("store", safeString(nativeAd.getStore()));

        Double starRating = nativeAd.getStarRating();
        adData.put("starRating", starRating != null ? starRating : 0);

        if (nativeAd.getIcon() != null && nativeAd.getIcon().getUri() != null) {
            JSObject icon = new JSObject();
            icon.put("url", nativeAd.getIcon().getUri().toString());
            adData.put("icon", icon);
        }

        JSArray images = new JSArray();
        if (nativeAd.getImages() != null) {
            for (NativeAd.Image image : nativeAd.getImages()) {
                if (image != null && image.getUri() != null) {
                    JSObject img = new JSObject();
                    img.put("url", image.getUri().toString());
                    images.put(img);
                }
            }
        }
        adData.put("images", images);

        return adData;
    }

    private String safeString(String value) {
        return value != null ? value : "";
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        try {
            for (NativeAd ad : adCache.values()) {
                try {
                    ad.destroy();
                } catch (Exception ignored) {
                    // no-op
                }
            }
            adCache.clear();
            impressionSent.clear();
            clickSent.clear();
        } catch (Exception e) {
            Log.w(TAG, "Error during plugin destroy", e);
        }
    }
}
