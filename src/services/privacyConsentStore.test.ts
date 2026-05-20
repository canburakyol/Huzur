import { beforeEach, describe, expect, it, vi } from "vitest";

const privacyModeMock = vi.hoisted(() => ({
  settings: {
    telemetryEnabled: false,
    analytics: false,
    crashReporting: false,
    adsEnabled: false,
    personalizedAdsEnabled: false,
  } as Record<string, unknown>,
  getPrivacySettingsSync: vi.fn(() => privacyModeMock.settings),
  updatePrivacySettings: vi.fn((partial: Record<string, unknown>) => {
    privacyModeMock.settings = { ...privacyModeMock.settings, ...partial };
    window.dispatchEvent(new CustomEvent("huzur:privacy-settings-updated", { detail: privacyModeMock.settings }));
    return privacyModeMock.settings;
  }),
}));

vi.mock("./privacyModeService", () => privacyModeMock);

vi.mock("../utils/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  },
}));

const importStore = async () => import("./privacyConsentStore");

describe("privacyConsentStore", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    privacyModeMock.settings = {
      telemetryEnabled: false,
      analytics: false,
      crashReporting: false,
      adsEnabled: false,
      personalizedAdsEnabled: false,
    };
  });

  it("blocks analytics and ads initialization by default", async () => {
    const { canInitializeFirebaseAnalytics, canInitializeAdMob, getPrivacyConsentSnapshot } = await importStore();

    expect(canInitializeFirebaseAnalytics()).toBe(false);
    expect(canInitializeAdMob()).toBe(false);
    expect(getPrivacyConsentSnapshot()).toMatchObject({
      analyticsEnabled: false,
      adsEnabled: false,
      personalizedAdsEnabled: false,
      zeroTelemetryByDefault: true,
    });
  });

  it("runs an ad-gated task only after telemetry and ad consent are granted", async () => {
    const { runPrivacyGatedInitialization, updateAnalyticsConsent, updateAdsConsent } = await importStore();
    const task = vi.fn();

    const dispose = runPrivacyGatedInitialization({
      kind: "ads",
      label: "AdMob",
      task,
    });

    expect(task).not.toHaveBeenCalled();

    updateAdsConsent({ adsEnabled: true });
    expect(task).not.toHaveBeenCalled();

    updateAnalyticsConsent(true);

    expect(task).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("disposes deferred task cleanup", async () => {
    privacyModeMock.settings.telemetryEnabled = true;
    privacyModeMock.settings.analytics = true;
    privacyModeMock.settings.adsEnabled = true;
    const { runPrivacyGatedInitialization } = await importStore();
    const cleanup = vi.fn();

    const dispose = runPrivacyGatedInitialization({
      kind: "ads",
      label: "AdMob",
      task: () => cleanup,
    });
    await Promise.resolve();

    dispose();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("runs async cleanup immediately when disposed before initialization resolves", async () => {
    privacyModeMock.settings.telemetryEnabled = true;
    privacyModeMock.settings.analytics = true;
    privacyModeMock.settings.adsEnabled = true;
    const { runPrivacyGatedInitialization } = await importStore();
    const cleanup = vi.fn();
    let resolveTask: ((cleanup: () => void) => void) | null = null;
    const task = vi.fn(
      () =>
        new Promise<() => void>((resolve) => {
          resolveTask = resolve;
        })
    );

    const dispose = runPrivacyGatedInitialization({
      kind: "ads",
      label: "AdMob",
      task,
    });

    dispose();
    resolveTask?.(cleanup);
    await Promise.resolve();

    expect(task).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("persists analytics and ad consent through privacy mode", async () => {
    const { updateAnalyticsConsent, updateAdsConsent, getPrivacyConsentSnapshot } = await importStore();

    updateAnalyticsConsent(true);
    updateAdsConsent({ adsEnabled: true, personalizedAdsEnabled: true });

    expect(privacyModeMock.updatePrivacySettings).toHaveBeenCalledWith(expect.objectContaining({
      telemetryEnabled: true,
      analytics: true,
    }));
    expect(privacyModeMock.updatePrivacySettings).toHaveBeenCalledWith(expect.objectContaining({
      adsEnabled: true,
      personalizedAdsEnabled: true,
    }));
    expect(getPrivacyConsentSnapshot()).toMatchObject({
      analyticsEnabled: true,
      adsEnabled: true,
      personalizedAdsEnabled: true,
    });
  });
});
