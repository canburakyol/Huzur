import { describe, expect, it } from "vitest";
import { getBottomBannerReservationPx } from "./bannerLayout";

describe("getBottomBannerReservationPx", () => {
  it("adds a safety gutter above the native banner so bottom navigation stays above it", () => {
    expect(getBottomBannerReservationPx(50)).toBe(64);
  });

  it("also reserves the extra lift Android 15+ gives the native banner", () => {
    expect(getBottomBannerReservationPx(50, 48)).toBe(112);
    expect(getBottomBannerReservationPx(50, Number.NaN)).toBe(64);
    expect(getBottomBannerReservationPx(0, 48)).toBe(0);
  });

  it("does not reserve space after the banner is hidden or fails to load", () => {
    expect(getBottomBannerReservationPx(0)).toBe(0);
    expect(getBottomBannerReservationPx(-1)).toBe(0);
  });
});
