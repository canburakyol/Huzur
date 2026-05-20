import { beforeEach, describe, expect, it, vi } from "vitest";

const capacitorMock = vi.hoisted(() => ({
  getPlatform: vi.fn(() => "android"),
}));

const adMobMock = vi.hoisted(() => ({
  initialize: vi.fn(async () => undefined),
  setRequestConfiguration: vi.fn(async () => undefined),
  requestConsentInfo: vi.fn(async () => ({ isConsentFormAvailable: false, status: "NOT_REQUIRED" })),
  showConsentForm: vi.fn(async () => undefined),
  addListener: vi.fn(async () => ({ remove: vi.fn(async () => undefined) })),
  hideBanner: vi.fn(async () => undefined),
  removeBanner: vi.fn(async () => undefined),
  showBanner: vi.fn(async () => undefined),
  prepareRewardVideoAd: vi.fn(async () => undefined),
  showRewardVideoAd: vi.fn(async () => ({ amount: 1, type: "streak_recovery" })),
}));

const privacyMock = vi.hoisted(() => ({
  canInitializeAdMob: vi.fn(() => true),
}));

const nativeAdServiceMock = vi.hoisted(() => ({
  nativeAdService: {
    destroy: vi.fn(async () => undefined),
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
    Loaded: "bannerLoaded",
    FailedToLoad: "bannerFailedToLoad",
    AdImpression: "bannerImpression",
  },
  RewardAdPluginEvents: {
    Loaded: "rewardLoaded",
    FailedToLoad: "rewardFailedToLoad",
    Rewarded: "rewarded",
  },
}));

vi.mock("./privacyConsentStore", () => privacyMock);

vi.mock("./adEnvironmentService", () => ({
  getAdRuntime: vi.fn(async () => ({ isDebugBuild: false, useTestAds: true })),
  getBannerAdUnitId: vi.fn(async () => "banner-test-id"),
  getRewardedAdUnitId: vi.fn(async () => "rewarded-test-id"),
  isRewardedConfigured: vi.fn(async () => true),
}));

vi.mock("./nativeAdService", () => nativeAdServiceMock);

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
    privacyMock.canInitializeAdMob.mockReturnValue(true);
    adMobMock.requestConsentInfo.mockResolvedValue({ isConsentFormAvailable: false, status: "NOT_REQUIRED" });
  });

  it("does not simulate rewarded ad on web without ad consent", async () => {
    capacitorMock.getPlatform.mockReturnValue("web");
    privacyMock.canInitializeAdMob.mockReturnValue(false);
    const { showRewardedAd } = await importAdMobService();

    await expect(showRewardedAd()).resolves.toEqual({
      success: false,
      error: "Ad consent required",
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

    expect(adMobMock.addListener).toHaveBeenCalledTimes(5);
    expect(adMobMock.hideBanner).toHaveBeenCalledTimes(1);
    expect(adMobMock.removeBanner).toHaveBeenCalledTimes(1);
    expect(nativeAdServiceMock.nativeAdService.destroy).toHaveBeenCalledTimes(1);
    expect(pendingHandles).toHaveLength(0);
    expect(allHandles.every((handle) => handle.remove.mock.calls.length === 1)).toBe(true);
  });

  it("does not initialize native AdMob before app-level ad consent", async () => {
    privacyMock.canInitializeAdMob.mockReturnValue(false);
    const { adMobService } = await importAdMobService();

    await expect(adMobService.initialize()).resolves.toBe(false);

    expect(adMobMock.initialize).not.toHaveBeenCalled();
    expect(adMobMock.addListener).not.toHaveBeenCalled();
  });
});
