package com.huzurapp.android;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.webkit.WebView;
import android.widget.AbsoluteLayout;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

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
import com.google.android.gms.ads.nativead.NativeAdView;
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
    private FrameLayout nativeAdHost;
    private NativeAdView visibleNativeAdView;
    private String visibleAdId;
    private WebView trackedWebView;
    private ViewTreeObserver.OnScrollChangedListener visibilityScrollListener;
    private int nativeAdContentTopPx;
    private int nativeAdHeightPx;
    private int nativeAdSafeTopPx;
    private int nativeAdSafeBottomPx;

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

    /**
     * On Android 15+ Capacitor pads the WebView's parent by the system bar inset, and the AdMob
     * banner (a child of that parent) adds the same inset again as a bottom margin. The banner then
     * sits one navigation-bar height too high and covers the web bottom navigation. Returns that
     * extra lift in dp so the web layout can reserve it; 0 on older Android.
     */
    @PluginMethod
    public void getBannerInsetOffset(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null || android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            JSObject ret = new JSObject();
            ret.put("offset", 0);
            call.resolve(ret);
            return;
        }
        activity.runOnUiThread(() -> {
            int offsetDp = 0;
            try {
                View parent = (View) getBridge().getWebView().getParent();
                float density = activity.getResources().getDisplayMetrics().density;
                offsetDp = Math.round(parent.getPaddingBottom() / density);
            } catch (Exception e) {
                Log.w(TAG, "Banner inset offset unavailable", e);
            }
            JSObject ret = new JSObject();
            ret.put("offset", offsetDp);
            call.resolve(ret);
        });
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

    @PluginMethod
    public void showAd(PluginCall call) {
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

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is not available");
            return;
        }

        double dpr = call.getDouble("dpr", 1.0);
        int left = cssPxToAndroidPx(call.getDouble("x", 0.0), dpr);
        int top = cssPxToAndroidPx(call.getDouble("y", 0.0), dpr);
        int width = Math.max(cssPxToAndroidPx(call.getDouble("width", 0.0), dpr), dp(activity, 180));
        int height = Math.max(cssPxToAndroidPx(call.getDouble("height", 0.0), dpr), dp(activity, 120));
        int safeTop = cssPxToAndroidPx(call.getDouble("safeTop", 0.0), dpr);
        int safeBottom = cssPxToAndroidPx(call.getDouble("safeBottom", 0.0), dpr);

        activity.runOnUiThread(() -> {
            try {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView == null) {
                    call.reject("WebView is not available");
                    return;
                }

                ensureNativeAdHost(activity, webView);
                if (visibleNativeAdView == null || !adId.equals(visibleAdId)) {
                    removeVisibleNativeAdView();
                    visibleNativeAdView = buildNativeAdView(activity, nativeAd);
                    visibleAdId = adId;
                    nativeAdHost.addView(visibleNativeAdView, new FrameLayout.LayoutParams(
                        FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT
                    ));
                }

                int contentLeft = left + webView.getScrollX();
                int contentTop = top + webView.getScrollY();
                nativeAdHost.setLayoutParams(new AbsoluteLayout.LayoutParams(
                    width,
                    height,
                    contentLeft,
                    contentTop
                ));
                nativeAdHost.bringToFront();

                int resolvedSafeBottom = safeBottom > safeTop ? safeBottom : webView.getHeight();
                startNativeVisibilityTracking(webView, contentTop, height, safeTop, resolvedSafeBottom);

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("adId", adId);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Native ad view show failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void hideAd(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
            return;
        }

        activity.runOnUiThread(() -> {
            stopNativeVisibilityTracking();
            if (visibleNativeAdView != null) {
                visibleNativeAdView.setVisibility(View.GONE);
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void destroy(PluginCall call) {
        destroyCachedAds();
        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
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

    private int cssPxToAndroidPx(double cssPx, double dpr) {
        return (int) Math.round(cssPx * Math.max(dpr, 1.0));
    }

    private int dp(Activity activity, int value) {
        return (int) TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            value,
            activity.getResources().getDisplayMetrics()
        );
    }

    @SuppressWarnings("deprecation")
    private void ensureNativeAdHost(Activity activity, WebView webView) {
        if (nativeAdHost == null) {
            nativeAdHost = new FrameLayout(activity);
            nativeAdHost.setClipChildren(false);
            nativeAdHost.setClipToPadding(false);
            nativeAdHost.setClickable(false);
            nativeAdHost.setFocusable(false);
        }

        if (nativeAdHost.getParent() != webView) {
            if (nativeAdHost.getParent() instanceof ViewGroup) {
                ((ViewGroup) nativeAdHost.getParent()).removeView(nativeAdHost);
            }
            webView.addView(nativeAdHost, new AbsoluteLayout.LayoutParams(1, 1, 0, 0));
        }
        nativeAdHost.bringToFront();
    }

    private void startNativeVisibilityTracking(
        WebView webView,
        int contentTop,
        int height,
        int safeTop,
        int safeBottom
    ) {
        stopNativeVisibilityTracking();
        trackedWebView = webView;
        nativeAdContentTopPx = contentTop;
        nativeAdHeightPx = height;
        nativeAdSafeTopPx = safeTop;
        nativeAdSafeBottomPx = safeBottom;
        visibilityScrollListener = this::updateNativeAdVisibility;
        webView.getViewTreeObserver().addOnScrollChangedListener(visibilityScrollListener);
        updateNativeAdVisibility();
    }

    private void updateNativeAdVisibility() {
        if (trackedWebView == null || visibleNativeAdView == null) {
            return;
        }

        int viewportTop = nativeAdContentTopPx - trackedWebView.getScrollY();
        int viewportBottom = viewportTop + nativeAdHeightPx;
        boolean fullyInsideSafeViewport = viewportTop >= nativeAdSafeTopPx
            && viewportBottom <= nativeAdSafeBottomPx;
        visibleNativeAdView.setVisibility(fullyInsideSafeViewport ? View.VISIBLE : View.GONE);
    }

    private void stopNativeVisibilityTracking() {
        if (trackedWebView != null && visibilityScrollListener != null) {
            ViewTreeObserver observer = trackedWebView.getViewTreeObserver();
            if (observer.isAlive()) {
                observer.removeOnScrollChangedListener(visibilityScrollListener);
            }
        }
        trackedWebView = null;
        visibilityScrollListener = null;
    }

    private NativeAdView buildNativeAdView(Activity activity, NativeAd nativeAd) {
        NativeAdView adView = new NativeAdView(activity);
        adView.setClipChildren(false);
        adView.setClipToPadding(false);

        GradientDrawable background = new GradientDrawable();
        background.setColor(Color.rgb(250, 246, 234));
        background.setStroke(dp(activity, 1), Color.rgb(227, 222, 201));
        background.setCornerRadius(dp(activity, 18));
        adView.setBackground(background);
        adView.setPadding(dp(activity, 12), dp(activity, 12), dp(activity, 12), dp(activity, 12));

        LinearLayout root = new LinearLayout(activity);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_VERTICAL);
        root.setClipChildren(false);
        root.setClipToPadding(false);
        adView.addView(root, new NativeAdView.LayoutParams(
            NativeAdView.LayoutParams.MATCH_PARENT,
            NativeAdView.LayoutParams.MATCH_PARENT
        ));

        TextView adBadge = new TextView(activity);
        adBadge.setText("Reklam");
        adBadge.setTextColor(Color.rgb(83, 97, 88));
        adBadge.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        adBadge.setTextSize(TypedValue.COMPLEX_UNIT_SP, 10);
        root.addView(adBadge);

        LinearLayout row = new LinearLayout(activity);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.setPadding(0, dp(activity, 8), 0, dp(activity, 8));
        root.addView(row, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            0,
            1
        ));

        ImageView iconView = new ImageView(activity);
        iconView.setScaleType(ImageView.ScaleType.CENTER_CROP);
        Drawable iconDrawable = nativeAd.getIcon() != null ? nativeAd.getIcon().getDrawable() : null;
        if (iconDrawable != null) {
            iconView.setImageDrawable(iconDrawable);
            row.addView(iconView, new LinearLayout.LayoutParams(dp(activity, 54), dp(activity, 54)));
            adView.setIconView(iconView);
        }

        LinearLayout textColumn = new LinearLayout(activity);
        textColumn.setOrientation(LinearLayout.VERTICAL);
        textColumn.setPadding(dp(activity, iconDrawable != null ? 10 : 0), 0, 0, 0);
        row.addView(textColumn, new LinearLayout.LayoutParams(
            0,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            1
        ));

        TextView headlineView = new TextView(activity);
        headlineView.setText(safeString(nativeAd.getHeadline()));
        headlineView.setTextColor(Color.rgb(22, 59, 43));
        headlineView.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        headlineView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15);
        headlineView.setMaxLines(1);
        headlineView.setEllipsize(TextUtils.TruncateAt.END);
        textColumn.addView(headlineView);
        adView.setHeadlineView(headlineView);

        TextView bodyView = new TextView(activity);
        bodyView.setText(safeString(nativeAd.getBody()));
        bodyView.setTextColor(Color.rgb(83, 97, 88));
        bodyView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
        bodyView.setMaxLines(2);
        bodyView.setEllipsize(TextUtils.TruncateAt.END);
        textColumn.addView(bodyView);
        adView.setBodyView(bodyView);

        Button ctaView = new Button(activity);
        ctaView.setAllCaps(false);
        ctaView.setText(safeString(nativeAd.getCallToAction()).isEmpty() ? "Aç" : safeString(nativeAd.getCallToAction()));
        ctaView.setTextColor(Color.WHITE);
        ctaView.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        ctaView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14);
        GradientDrawable ctaBackground = new GradientDrawable();
        ctaBackground.setColor(Color.rgb(22, 59, 43));
        ctaBackground.setCornerRadius(dp(activity, 12));
        ctaView.setBackground(ctaBackground);
        root.addView(ctaView, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            dp(activity, 42)
        ));
        adView.setCallToActionView(ctaView);

        adView.setNativeAd(nativeAd);
        return adView;
    }

    private void removeVisibleNativeAdView() {
        stopNativeVisibilityTracking();
        if (visibleNativeAdView != null && visibleNativeAdView.getParent() instanceof ViewGroup) {
            ((ViewGroup) visibleNativeAdView.getParent()).removeView(visibleNativeAdView);
        }
        visibleNativeAdView = null;
        visibleAdId = null;
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        destroyCachedAds();
    }

    private void destroyCachedAds() {
        try {
            stopNativeVisibilityTracking();
            removeVisibleNativeAdView();
            if (nativeAdHost != null && nativeAdHost.getParent() instanceof ViewGroup) {
                ((ViewGroup) nativeAdHost.getParent()).removeView(nativeAdHost);
            }
            nativeAdHost = null;
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
