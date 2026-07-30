export const BOTTOM_BANNER_SAFETY_GUTTER_PX = 8;

/**
 * Native AdMob reports the rendered banner height after it loads. Reserve that
 * exact height plus a small gap so the web bottom navigation remains above it.
 */
export const getBottomBannerReservationPx = (nativeBannerHeightPx: number): number => {
  if (!Number.isFinite(nativeBannerHeightPx) || nativeBannerHeightPx <= 0) {
    return 0;
  }

  return Math.ceil(nativeBannerHeightPx) + BOTTOM_BANNER_SAFETY_GUTTER_PX;
};

export const syncBottomBannerReservation = (nativeBannerHeightPx: number): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.style.setProperty(
    "--ad-height",
    `${getBottomBannerReservationPx(nativeBannerHeightPx)}px`,
  );
};
