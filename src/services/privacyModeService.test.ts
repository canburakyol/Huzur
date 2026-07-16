import { beforeEach, describe, expect, it, vi } from "vitest";

const storageMock = vi.hoisted(() => ({
  value: null as Record<string, unknown> | null,
  getItem: vi.fn((_key: string, fallback: unknown) => storageMock.value ?? fallback),
  getItemAsync: vi.fn(async (_key: string, fallback: unknown) => storageMock.value ?? fallback),
  setItem: vi.fn((_key: string, value: Record<string, unknown>) => {
    storageMock.value = value;
    return true;
  }),
  setItemAsync: vi.fn(async () => true),
}));

vi.mock("./storageService", () => ({
  storageService: storageMock,
}));

vi.mock("../utils/logger", () => ({
  logger: {
    warn: vi.fn(),
  },
}));

describe("privacyModeService analytics defaults", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    storageMock.value = null;
  });

  it("enables analytics for a fresh install", async () => {
    const { getPrivacySettingsSync } = await import("./privacyModeService");

    expect(getPrivacySettingsSync()).toMatchObject({
      analytics: true,
      telemetryEnabled: true,
      zeroTelemetryByDefault: false,
    });
  });

  it("migrates the previous zero-telemetry default to enabled", async () => {
    storageMock.value = {
      analytics: false,
      telemetryEnabled: false,
      crashReporting: false,
      adsEnabled: true,
    };
    const { getPrivacySettingsSync } = await import("./privacyModeService");

    expect(getPrivacySettingsSync()).toMatchObject({
      analytics: true,
      telemetryEnabled: true,
      adsEnabled: true,
    });
  });

  it("still honors an explicit current-schema disable", async () => {
    storageMock.value = {
      privacySchemaVersion: 2,
      analytics: false,
      telemetryEnabled: false,
    };
    const { getPrivacySettingsSync } = await import("./privacyModeService");

    expect(getPrivacySettingsSync()).toMatchObject({
      analytics: false,
      telemetryEnabled: false,
    });
  });
});
