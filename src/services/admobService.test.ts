import { beforeEach, describe, expect, it, vi } from "vitest";

const capacitorMock = vi.hoisted(() => ({
  getPlatform: vi.fn(() => "android"),
}));

const adMobMock = vi.hoisted(() => ({
  initialize: vi.fn(async () => undefined),
  setRequestConfiguration: vi.fn(async () => undefined),
  requestConsentInfo: vi.fn(async () => ({
    isConsentFormAvailable: false,
    status: "NOT_REQUIRED",
    canRequestAds: true,
    privacyOptionsRequirementStatus: "NOT_REQUIRED",
  })),
  showConsentForm: vi.fn(async () => ({
    isConsentFormAvailable: true,
    status: "OBTAINED",
    canRequestAds: true,
    privacyOptionsRequirementStatus: "REQUIRED",
  })),
  showPrivacyOptionsForm: vi.fn(async () => undefined),
  addListener: vi.fn(async (_eventName: string, _callback: (info: { height?: number }) => void): Promise<{ remove: () => Promise<undefined> } | undefined> => ({ remove: vi.fn(async () => undefined) })),
  hideBanner: vi.fn(async () => undefined),
  removeBanner: vi.fn(async () => undefined),
  showBanner: vi.fn(async () => undefined),
  prepareRewardVideoAd: vi.fn(async () => undefined),
  showRewardVideoAd: vi.fn(async () => ({ amount: 1, type: "streak_recovery" })),
}));

const nativeAdServiceMock = vi.hoisted(() => ({
  nativeAdService: {
    destroy: vi.fn(async () => undefined),
  },
}));

const analyticsMock = vi.hoisted(() => ({
  logEvent: vi.fn(),
  ANALYTICS_EVENTS: {
    AD_REWARDED_REQUESTED: "ad_rewarded_requested",
    AD_REWARDED_GRANTED: "ad_rewarded_granted",
  },
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: capacitorMock,
}));

vi.mock("@capacitor-community/admob", () => ({
  AdMob: adMobMock,
  BannerAdSize: {
    BANNER: "BANNER",
    MEDIUM_RECTANGLE: "MEDIUM_RECTANGLE",
  },
  BannerAdPosition: {
    BOTTOM_CENTER: "BOTTOM_CENTER",
    CENTER: "CENTER",
  },
  BannerAdPluginEvents: {
    SizeChanged: "bannerSizeChanged",
    Loaded: "bannerLoaded",
    FailedToLoad: "bannerFailedToLoad",
    AdImpression: "bannerImpression",
  },
  RewardAdPluginEvents: {
    Loaded: "rewardLoaded",
    FailedToLoad: "rewardFailedToLoad",
    Rewarded: "rewarded",
  },  MaxAdContentRating: { General: "General" },
}));

vi.mock("./adEnvironmentService", () => ({
  getAdRuntime: vi.fn(async () => ({ isDebugBuild: false, useTestAds: true })),
  getBannerAdUnitId: vi.fn(async () => "banner-test-id"),
  getRewardedAdUnitId: vi.fn(async () => "rewarded-test-id"),
  isRewardedConfigured: vi.fn(async () => true),
}));

vi.mock("./nativeAdService", () => nativeAdServiceMock);
vi.mock("./analyticsService", () => analyticsMock);

vi.mock("../utils/logger", () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../utils/crashlyticsReporter", () => ({
  default: {
    logCrash: vi.fn(),
    logExceptionWithContext: vi.fn(),
  },
}));

const importAdMobService = async () => import("./admobService");

describe("admobService consent and cleanup", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    capacitorMock.getPlatform.mockReturnValue("android");
    adMobMock.requestConsentInfo.mockResolvedValue({
      isConsentFormAvailable: false,
      status: "NOT_REQUIRED",
      canRequestAds: true,
      privacyOptionsRequirementStatus: "NOT_REQUIRED",
    });
    adMobMock.showConsentForm.mockResolvedValue({
      isConsentFormAvailable: true,
      status: "OBTAINED",
      canRequestAds: true,
      privacyOptionsRequirementStatus: "REQUIRED",
    });
    adMobMock.addListener.mockImplementation(async () => ({ remove: vi.fn(async () => undefined) }));
  });

  it("does not simulate rewarded revenue on web", async () => {
    capacitorMock.getPlatform.mockReturnValue("web");
    const { showRewardedAd } = await importAdMobService();

    await expect(showRewardedAd()).resolves.toEqual({
      success: false,
      error: "Rewarded ads require native platform",
    });

    expect(adMobMock.showRewardVideoAd).not.toHaveBeenCalled();
  });

  it("removes registered ad listeners and destroys native ads when ads stop", async () => {
    const allHandles = Array.from({ length: 5 }, () => ({ remove: vi.fn(async () => undefined) }));
    const pendingHandles = [...allHandles];
    adMobMock.addListener.mockImplementation(async () => pendingHandles.shift());
    const { adMobService } = await importAdMobService();

    await adMobService.initialize();
    await adMobService.stopAds();

    expect(adMobMock.addListener).toHaveBeenCalledTimes(6);
    expect(adMobMock.hideBanner).toHaveBeenCalledTimes(1);
    expect(adMobMock.removeBanner).toHaveBeenCalledTimes(1);
    expect(nativeAdServiceMock.nativeAdService.destroy).toHaveBeenCalledTimes(1);
    expect(pendingHandles).toHaveLength(0);
    expect(allHandles.every((handle) => handle.remove.mock.calls.length === 1)).toBe(true);
  });

  it("does not request ads when UMP disallows ad requests", async () => {
    adMobMock.requestConsentInfo.mockResolvedValue({
      isConsentFormAvailable: true,
      status: "REQUIRED",
      canRequestAds: false,
      privacyOptionsRequirementStatus: "REQUIRED",
    });
    adMobMock.showConsentForm.mockResolvedValue({
      isConsentFormAvailable: true,
      status: "OBTAINED",
      canRequestAds: false,
      privacyOptionsRequirementStatus: "REQUIRED",
    });
    const { adMobService } = await importAdMobService();

    await expect(adMobService.initialize()).resolves.toBe(false);

    expect(adMobMock.initialize).toHaveBeenCalledTimes(1);
    expect(adMobMock.showConsentForm).toHaveBeenCalledTimes(1);
    expect(adMobMock.addListener).not.toHaveBeenCalled();
  });

  it("sends the family-safe content rating with initialize, where the plugin applies it", async () => {
    const { adMobService } = await importAdMobService();
    await adMobService.initialize();

    expect(adMobMock.initialize).toHaveBeenCalledWith(expect.objectContaining({
      maxAdContentRating: "General",
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    }));
  });

  it("uses the Google UMP result instead of a custom ad opt-out gate", async () => {
    adMobMock.requestConsentInfo.mockResolvedValue({
      isConsentFormAvailable: true,
      status: "REQUIRED",
      canRequestAds: false,
      privacyOptionsRequirementStatus: "REQUIRED",
    });
    const { adMobService } = await importAdMobService();

    await expect(adMobService.initialize()).resolves.toBe(true);

    expect(adMobMock.showConsentForm).toHaveBeenCalledTimes(1);
    expect(adMobMock.addListener).toHaveBeenCalledTimes(6);
  });

  it("uses fixed bottom banner size so it does not overlap bottom navigation", async () => {
    const { adMobService } = await importAdMobService();

    await adMobService.showRectangleBanner();

    expect(adMobMock.showBanner).toHaveBeenCalledWith(expect.objectContaining({
      adId: "banner-test-id",
      adSize: "BANNER",
      position: "BOTTOM_CENTER",
      margin: 0,
      isTesting: true,
    }));
  });

  it("syncs bottom navigation reservation to the rendered native banner height", async () => {
    let onBannerSizeChanged: ((info: { height?: number }) => void) | undefined;
    adMobMock.addListener.mockImplementation(async (eventName, callback) => {
      if (eventName === "bannerSizeChanged") {
        onBannerSizeChanged = callback;
      }
      return { remove: vi.fn(async () => undefined) };
    });
    const { adMobService } = await importAdMobService();

    await adMobService.initialize();
    expect(onBannerSizeChanged).toBeTypeOf("function");

    onBannerSizeChanged?.({ height: 50 });

    expect(document.documentElement.style.getPropertyValue("--ad-height")).toBe("64px");
  });

  it("tracks rewarded requests and granted rewards", async () => {
    const { showRewardedAd } = await importAdMobService();

    await expect(showRewardedAd()).resolves.toEqual({
      success: true,
      reward: { amount: 1, type: "streak_recovery" },
    });

    expect(analyticsMock.logEvent).toHaveBeenCalledWith("ad_rewarded_requested", expect.objectContaining({
      surface: "streak_recovery",
      use_test_ads: true,
    }));
    expect(analyticsMock.logEvent).toHaveBeenCalledWith("ad_rewarded_granted", expect.objectContaining({
      surface: "streak_recovery",
      reward_type: "streak_recovery",
      reward_amount: 1,
      use_test_ads: true,
    }));
  });
});
