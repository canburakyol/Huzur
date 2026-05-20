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

const capgoStorageMock = vi.hoisted(() => ({
  openStore: vi.fn(),
  iskey: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
  keys: vi.fn(),
}));

const legacySecureStorageMock = vi.hoisted(() => ({
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

vi.mock("@capgo/capacitor-data-storage-sqlite", () => ({
  CapgoCapacitorDataStorageSqlite: capgoStorageMock,
}));

vi.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: legacySecureStorageMock,
}));

vi.mock("../utils/logger", () => ({
  logger: loggerMock,
}));

const importStorage = async () => import("./persistentStorage");
const encodeStoredValue = (value: string) => `huzur_secure_v1:${JSON.stringify(value)}`;
const decodeStoredValue = (value: string) => JSON.parse(value.slice("huzur_secure_v1:".length));

describe("persistentStorage secure backend", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    capacitorMock.isNativePlatform.mockReturnValue(true);
    preferencesMock.get.mockResolvedValue({ value: null });
    preferencesMock.set.mockResolvedValue(undefined);
    preferencesMock.remove.mockResolvedValue(undefined);
    preferencesMock.keys.mockResolvedValue({ keys: [] });
    capgoStorageMock.openStore.mockResolvedValue(undefined);
    capgoStorageMock.iskey.mockResolvedValue({ result: false });
    capgoStorageMock.get.mockResolvedValue({ value: "" });
    capgoStorageMock.set.mockResolvedValue(undefined);
    capgoStorageMock.remove.mockResolvedValue(undefined);
    capgoStorageMock.keys.mockResolvedValue({ keys: [] });
    legacySecureStorageMock.getItem.mockResolvedValue(null);
    legacySecureStorageMock.setItem.mockResolvedValue(undefined);
    legacySecureStorageMock.removeItem.mockResolvedValue(undefined);
    legacySecureStorageMock.keys.mockResolvedValue([]);
  });

  it("writes native values to encrypted Capgo storage instead of Preferences", async () => {
    const { secureStorage } = await importStorage();

    const ok = await secureStorage.setString("huzur_auth_token", "token-1");

    expect(ok).toBe(true);
    expect(capgoStorageMock.openStore).toHaveBeenCalledWith({
      database: "huzur_secure_storage",
      table: "secure_items",
      encrypted: true,
      mode: "secret",
    });
    expect(capgoStorageMock.set).toHaveBeenCalledWith({
      key: "huzur_auth_token",
      value: encodeStoredValue("token-1"),
    });
    expect(preferencesMock.set).not.toHaveBeenCalled();
  });

  it("migrates a legacy Preferences value into secure storage and removes legacy after verification", async () => {
    capgoStorageMock.iskey
      .mockResolvedValueOnce({ result: false })
      .mockResolvedValueOnce({ result: true })
      .mockResolvedValueOnce({ result: true });
    capgoStorageMock.get
      .mockResolvedValueOnce({ value: encodeStoredValue("legacy-token") })
      .mockResolvedValueOnce({ value: encodeStoredValue("legacy-token") });
    preferencesMock.get.mockResolvedValue({ value: "legacy-token" });
    const { secureStorage } = await importStorage();

    const value = await secureStorage.getString("huzur_auth_token");

    expect(value).toBe("legacy-token");
    expect(capgoStorageMock.set).toHaveBeenCalledWith({
      key: "huzur_auth_token",
      value: encodeStoredValue("legacy-token"),
    });
    expect(preferencesMock.remove).toHaveBeenCalledWith({ key: "huzur_auth_token" });
  });

  it("migrates a previous secure-storage value into Capgo storage and removes legacy after verification", async () => {
    capgoStorageMock.iskey
      .mockResolvedValueOnce({ result: false })
      .mockResolvedValueOnce({ result: true })
      .mockResolvedValueOnce({ result: true });
    capgoStorageMock.get
      .mockResolvedValueOnce({ value: encodeStoredValue("legacy-secure-token") })
      .mockResolvedValueOnce({ value: encodeStoredValue("legacy-secure-token") });
    legacySecureStorageMock.getItem.mockResolvedValue("legacy-secure-token");
    const { secureStorage } = await importStorage();

    const value = await secureStorage.getString("huzur_auth_token");

    expect(value).toBe("legacy-secure-token");
    expect(capgoStorageMock.set).toHaveBeenCalledWith({
      key: "huzur_auth_token",
      value: encodeStoredValue("legacy-secure-token"),
    });
    expect(legacySecureStorageMock.removeItem).toHaveBeenCalledWith("huzur_auth_token");
    expect(preferencesMock.remove).not.toHaveBeenCalled();
  });

  it("does not overwrite an existing Capgo value with a stale legacy Preferences value", async () => {
    capgoStorageMock.iskey.mockResolvedValue({ result: true });
    capgoStorageMock.get.mockResolvedValue({ value: encodeStoredValue("secure-token") });
    preferencesMock.get.mockResolvedValue({ value: "legacy-token" });
    const { secureStorage } = await importStorage();

    const value = await secureStorage.getString("huzur_auth_token");

    expect(value).toBe("secure-token");
    expect(capgoStorageMock.set).not.toHaveBeenCalled();
    expect(preferencesMock.remove).not.toHaveBeenCalled();
  });

  it("keeps legacy Preferences value when secure migration verification fails", async () => {
    capgoStorageMock.iskey
      .mockResolvedValueOnce({ result: false })
      .mockResolvedValueOnce({ result: true });
    capgoStorageMock.get.mockResolvedValueOnce({ value: encodeStoredValue("different-value") });
    preferencesMock.get.mockResolvedValue({ value: "legacy-token" });
    const { secureStorage } = await importStorage();

    const value = await secureStorage.getString("huzur_auth_token", "fallback");

    expect(value).toBe("fallback");
    expect(preferencesMock.remove).not.toHaveBeenCalled();
    expect(loggerMock.error).toHaveBeenCalledWith("[SecureStorage] getString error", expect.any(Error));
  });

  it("uses the Capgo web store without native encryption flags on web", async () => {
    capacitorMock.isNativePlatform.mockReturnValue(false);
    capgoStorageMock.iskey
      .mockResolvedValueOnce({ result: true })
      .mockResolvedValueOnce({ result: true })
      .mockResolvedValueOnce({ result: false });
    capgoStorageMock.get
      .mockResolvedValueOnce({ value: encodeStoredValue("web-token") })
      .mockResolvedValueOnce({ value: encodeStoredValue("web-token") });
    const { secureStorage } = await importStorage();

    await expect(secureStorage.getString("huzur_auth_token")).resolves.toBe("web-token");
    await expect(secureStorage.setString("huzur_auth_token", "next-token")).resolves.toBe(true);

    expect(capgoStorageMock.openStore).toHaveBeenCalledWith({
      database: "huzur_secure_storage",
      table: "secure_items",
      encrypted: false,
      mode: "no-encryption",
    });
    expect(legacySecureStorageMock.getItem).not.toHaveBeenCalled();
    expect(capgoStorageMock.set).toHaveBeenCalledWith({
      key: "huzur_auth_token",
      value: encodeStoredValue("next-token"),
    });
    expect(preferencesMock.set).not.toHaveBeenCalled();
  });

  it("returns default value for corrupt JSON without crashing", async () => {
    capgoStorageMock.iskey.mockResolvedValue({ result: true });
    capgoStorageMock.get.mockResolvedValue({ value: "{not-json" });
    const { secureStorage } = await importStorage();

    const value = await secureStorage.getItem("huzur_daily_limits", { date: "fallback" });

    expect(value).toEqual({ date: "fallback" });
    expect(loggerMock.error).toHaveBeenCalledWith("[SecureStorage] getItem error", expect.any(Error));
  });

  it("preserves Pro checksum validity after migrating legacy status", async () => {
    const { secureStorage } = await importStorage();
    await secureStorage.setProStatus(true, "2099-01-01T00:00:00.000Z", "revenuecat");
    const stored = JSON.parse(decodeStoredValue(capgoStorageMock.set.mock.calls.at(-1)?.[0].value as string));
    capgoStorageMock.iskey.mockResolvedValue({ result: true });
    capgoStorageMock.get.mockResolvedValue({ value: encodeStoredValue(JSON.stringify(stored)) });

    const status = await secureStorage.getProStatus();

    expect(status).toMatchObject({
      active: true,
      source: "revenuecat",
      verificationState: "verified",
      isValid: true,
    });
  });

  it("clears only known Huzur secure keys instead of all Preferences", async () => {
    capgoStorageMock.keys.mockResolvedValue({ keys: ["huzur_auth_token", "third_party_key"] });
    const { secureStorage } = await importStorage();

    await expect(secureStorage.clearAll()).resolves.toBe(true);

    expect(capgoStorageMock.remove).toHaveBeenCalledWith({ key: "huzur_auth_token" });
    expect(capgoStorageMock.remove).toHaveBeenCalledWith({ key: "huzur_pro_status_secure" });
    expect(capgoStorageMock.remove).not.toHaveBeenCalledWith({ key: "third_party_key" });
  });
});
