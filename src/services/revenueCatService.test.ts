import { beforeEach, describe, expect, it, vi } from 'vitest';

const purchasesMock = vi.hoisted(() => ({
  setLogLevel: vi.fn(),
  configure: vi.fn(),
  addCustomerInfoUpdateListener: vi.fn(),
  getCustomerInfo: vi.fn(),
  purchasePackage: vi.fn(),
  restorePurchases: vi.fn(),
  getOfferings: vi.fn(),
  getAppUserID: vi.fn(),
  logIn: vi.fn(),
}));

const authMock = vi.hoisted(() => ({
  getCurrentUserIdEnsured: vi.fn(),
}));

const proMock = vi.hoisted(() => ({
  setProStatus: vi.fn(),
}));

const subscriptionSyncMock = vi.hoisted(() => ({
  syncProStatusWithRevenueCat: vi.fn(),
}));

vi.mock('@revenuecat/purchases-capacitor', () => ({
  Purchases: purchasesMock,
  LOG_LEVEL: {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
  },
}));

vi.mock('./authService', () => authMock);
vi.mock('./proService', () => proMock);
vi.mock('./subscriptionSyncService', () => subscriptionSyncMock);
vi.mock('../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('../utils/crashlyticsReporter', () => ({
  default: {
    logCrash: vi.fn(),
    logExceptionWithContext: vi.fn(),
  },
  buildCrashContext: vi.fn((context) => ({ context })),
}));
const customerInfoWithPro = {
  entitlements: {
    active: {
      pro_access: {
        expirationDate: '2099-01-01T00:00:00.000Z',
      },
    },
  },
};

const customerInfoWithoutPro = {
  entitlements: {
    active: {},
  },
};

const importService = async () => {
  return import('./revenueCatService');
};

describe('revenueCatService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_REVENUECAT_ANDROID_KEY', 'test-android-key');
    authMock.getCurrentUserIdEnsured.mockResolvedValue('firebase-user-1');
    purchasesMock.configure.mockResolvedValue(undefined);
    purchasesMock.setLogLevel.mockResolvedValue(undefined);
    purchasesMock.addCustomerInfoUpdateListener.mockResolvedValue('listener-1');
    purchasesMock.getCustomerInfo.mockResolvedValue({ customerInfo: customerInfoWithoutPro });
    purchasesMock.purchasePackage.mockResolvedValue({ customerInfo: customerInfoWithPro });
    purchasesMock.restorePurchases.mockResolvedValue({ customerInfo: customerInfoWithPro });
    purchasesMock.getOfferings.mockResolvedValue({
      current: undefined,
      all: {
        default: {
          identifier: 'default',
          availablePackages: [{ identifier: 'monthly', product: { title: 'Aylik' } }],
        },
      },
    });
    purchasesMock.getAppUserID.mockResolvedValue({ appUserID: 'firebase-user-1' });
    purchasesMock.logIn.mockResolvedValue({ customerInfo: customerInfoWithoutPro, created: false });
    subscriptionSyncMock.syncProStatusWithRevenueCat.mockResolvedValue({
      isPro: true,
      source: 'revenuecat',
    });

    Object.defineProperty(window, 'Capacitor', {
      configurable: true,
      value: {
        isNativePlatform: () => true,
        getPlatform: () => 'android',
      },
    });
  });

  it('configures RevenueCat with the Firebase user id', async () => {
    const { initializeRevenueCat } = await importService();

    await initializeRevenueCat();

    expect(purchasesMock.configure).toHaveBeenCalledWith({
      apiKey: 'test-android-key',
      appUserID: 'firebase-user-1',
    });
  });

  it('does not activate Pro after purchase unless server sync verifies it', async () => {
    subscriptionSyncMock.syncProStatusWithRevenueCat.mockResolvedValue({
      isPro: false,
      source: 'none',
    });
    const { purchasePackage } = await importService();

    const result = await purchasePackage({ identifier: 'monthly' });

    expect(result).toBe(false);
    expect(proMock.setProStatus).not.toHaveBeenCalledWith(
      true,
      expect.anything(),
      expect.anything(),
      expect.anything()
    );
  });

  it('returns true after purchase only when the server confirms Pro', async () => {
    const { initializeRevenueCat, purchasePackage } = await importService();

    await initializeRevenueCat();
    subscriptionSyncMock.syncProStatusWithRevenueCat.mockClear();
    const result = await purchasePackage({ identifier: 'monthly' });

    expect(purchasesMock.purchasePackage).toHaveBeenCalled();
    expect(subscriptionSyncMock.syncProStatusWithRevenueCat).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('refreshes server status when RevenueCat listener receives inactive entitlement data', async () => {
    const { initializeRevenueCat } = await importService();

    await initializeRevenueCat();
    subscriptionSyncMock.syncProStatusWithRevenueCat.mockClear();

    const listener = purchasesMock.addCustomerInfoUpdateListener.mock.calls[0]?.[0];
    listener?.(customerInfoWithoutPro);

    await vi.waitFor(() => {
      expect(subscriptionSyncMock.syncProStatusWithRevenueCat).toHaveBeenCalled();
    });
  });

  it('falls back to all offerings when the current offering is missing', async () => {
    const { getOfferings } = await importService();

    const packages = await getOfferings();

    expect(packages).toHaveLength(1);
    expect(packages[0].identifier).toBe('monthly');
  });

  it('fails restore when RevenueCat does not return the Pro entitlement', async () => {
    purchasesMock.restorePurchases.mockResolvedValue({ customerInfo: customerInfoWithoutPro });
    const { restorePurchases } = await importService();

    const result = await restorePurchases();

    expect(result).toBe(false);
    expect(subscriptionSyncMock.syncProStatusWithRevenueCat).not.toHaveBeenCalled();
    expect(proMock.setProStatus).toHaveBeenCalledWith(
      false,
      null,
      'revenuecat_restore_no_entitlement',
      expect.objectContaining({ reason: 'missing_entitlement_after_restore' })
    );
  });
});
