import { describe, expect, it } from "vitest";
import { getBottomBannerReservationPx } from "./bannerLayout";

describe("getBottomBannerReservationPx", () => {
  it("adds a safety gutter above the native banner so bottom navigation stays above it", () => {
    expect(getBottomBannerReservationPx(50)).toBe(58);
  });

  it("does not reserve space after the banner is hidden or fails to load", () => {
    expect(getBottomBannerReservationPx(0)).toBe(0);
    expect(getBottomBannerReservationPx(-1)).toBe(0);
  });
});
