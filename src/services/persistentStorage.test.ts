import { beforeEach, describe, expect, it, vi } from "vitest";

const capacitorMock = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => true),
}));

const preferencesMock = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  keys: vi.fn(),
}));

const secureStorageMock = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  keys: vi.fn(),
}));

const loggerMock = vi.hoisted(() => ({
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
}));

vi.mock("@capacitor/core", () => ({
  Capacitor: capacitorMock,
}));

vi.mock("@capacitor/preferences", () => ({
  Preferences: preferencesMock,
}));

vi.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: secureStorageMock,
}));

vi.mock("../utils/logger", () => ({
  logger: loggerMock,
}));

const importStorage = async () => import("./persistentStorage");

describe("persistentStorage secure backend", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    capacitorMock.isNativePlatform.mockReturnValue(true);
    preferencesMock.get.mockResolvedValue({ value: null });
    preferencesMock.set.mockResolvedValue(undefined);
    preferencesMock.remove.mockResolvedValue(undefined);
    preferencesMock.keys.mockResolvedValue({ keys: [] });
    secureStorageMock.getItem.mockResolvedValue(null);
    secureStorageMock.setItem.mockResolvedValue(undefined);
    secureStorageMock.removeItem.mockResolvedValue(undefined);
    secureStorageMock.keys.mockResolvedValue([]);
  });

  it("writes native values to SecureStorage instead of Preferences", async () => {
    const { secureStorage } = await importStorage();

    const ok = await secureStorage.setString("huzur_auth_token", "token-1");

    expect(ok).toBe(true);
    expect(secureStorageMock.setItem).toHaveBeenCalledWith("huzur_auth_token", "token-1");
    expect(preferencesMock.set).not.toHaveBeenCalled();
  });

  it("migrates a legacy Preferences value into SecureStorage and removes legacy after verification", async () => {
    secureStorageMock.getItem
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("legacy-token")
      .mockResolvedValueOnce("legacy-token");
    preferencesMock.get.mockResolvedValue({ value: "legacy-token" });
    const { secureStorage } = await importStorage();

    const value = await secureStorage.getString("huzur_auth_token");

    expect(value).toBe("legacy-token");
    expect(secureStorageMock.setItem).toHaveBeenCalledWith("huzur_auth_token", "legacy-token");
    expect(preferencesMock.remove).toHaveBeenCalledWith({ key: "huzur_auth_token" });
  });

  it("does not overwrite an existing SecureStorage value with a stale legacy Preferences value", async () => {
    secureStorageMock.getItem.mockResolvedValue("secure-token");
    preferencesMock.get.mockResolvedValue({ value: "legacy-token" });
    const { secureStorage } = await importStorage();

    const value = await secureStorage.getString("huzur_auth_token");

    expect(value).toBe("secure-token");
    expect(secureStorageMock.setItem).not.toHaveBeenCalled();
    expect(preferencesMock.remove).not.toHaveBeenCalled();
  });

  it("keeps legacy Preferences value when secure migration verification fails", async () => {
    secureStorageMock.getItem
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("different-value");
    preferencesMock.get.mockResolvedValue({ value: "legacy-token" });
    const { secureStorage } = await importStorage();

    const value = await secureStorage.getString("huzur_auth_token", "fallback");

    expect(value).toBe("fallback");
    expect(preferencesMock.remove).not.toHaveBeenCalled();
    expect(loggerMock.error).toHaveBeenCalledWith("[SecureStorage] getString error", expect.any(Error));
  });

  it("uses Preferences only as a web fallback", async () => {
    capacitorMock.isNativePlatform.mockReturnValue(false);
    preferencesMock.get.mockResolvedValue({ value: "web-token" });
    const { secureStorage } = await importStorage();

    await expect(secureStorage.getString("huzur_auth_token")).resolves.toBe("web-token");
    await expect(secureStorage.setString("huzur_auth_token", "next-token")).resolves.toBe(true);

    expect(secureStorageMock.getItem).not.toHaveBeenCalled();
    expect(secureStorageMock.setItem).not.toHaveBeenCalled();
    expect(preferencesMock.set).toHaveBeenCalledWith({
      key: "huzur_auth_token",
      value: "next-token",
    });
  });

  it("returns default value for corrupt JSON without crashing", async () => {
    secureStorageMock.getItem.mockResolvedValue("{not-json");
    const { secureStorage } = await importStorage();

    const value = await secureStorage.getItem("huzur_daily_limits", { date: "fallback" });

    expect(value).toEqual({ date: "fallback" });
    expect(loggerMock.error).toHaveBeenCalledWith("[SecureStorage] getItem error", expect.any(Error));
  });

  it("preserves Pro checksum validity after storing secure status", async () => {
    const { secureStorage } = await importStorage();
    await secureStorage.setProStatus(true, "2099-01-01T00:00:00.000Z", "revenuecat");
    const stored = JSON.parse(secureStorageMock.setItem.mock.calls.at(-1)?.[1] as string);
    secureStorageMock.getItem.mockResolvedValue(JSON.stringify(stored));

    const status = await secureStorage.getProStatus();

    expect(status).toMatchObject({
      active: true,
      source: "revenuecat",
      verificationState: "verified",
      isValid: true,
    });
  });

  it("clears only known Huzur secure keys instead of all Preferences", async () => {
    secureStorageMock.keys.mockResolvedValue(["huzur_auth_token", "third_party_key"]);
    const { secureStorage } = await importStorage();

    await expect(secureStorage.clearAll()).resolves.toBe(true);

    expect(secureStorageMock.removeItem).toHaveBeenCalledWith("huzur_auth_token");
    expect(secureStorageMock.removeItem).toHaveBeenCalledWith("huzur_pro_status_secure");
    expect(secureStorageMock.removeItem).not.toHaveBeenCalledWith("third_party_key");
  });
});
