// Keep a small touch-safe separation only. The native banner is already
// physically anchored above the system navigation area; an oversized CSS
// reserve leaves a conspicuous empty band on Pixel-class devices.
export const BOTTOM_BANNER_SAFETY_GUTTER_PX = 14;

/**
 * Native AdMob reports the rendered banner height after it loads. Reserve that
 * exact height plus a small gap so the web bottom navigation remains above it.
 */
export const getBottomBannerReservationPx = (nativeBannerHeightPx: number, insetOffsetPx = 0): number => {
  if (!Number.isFinite(nativeBannerHeightPx) || nativeBannerHeightPx <= 0) {
    return 0;
  }

  // insetOffsetPx: how far Android 15+ lifts the banner above the WebView bottom (see NativeAdBridge.getBannerInsetOffset).
  const offset = Number.isFinite(insetOffsetPx) && insetOffsetPx > 0 ? Math.ceil(insetOffsetPx) : 0;
  return Math.ceil(nativeBannerHeightPx) + offset + BOTTOM_BANNER_SAFETY_GUTTER_PX;
};

export const syncBottomBannerReservation = (nativeBannerHeightPx: number, insetOffsetPx = 0): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.style.setProperty(
    "--ad-height",
    `${getBottomBannerReservationPx(nativeBannerHeightPx, insetOffsetPx)}px`,
  );
};
