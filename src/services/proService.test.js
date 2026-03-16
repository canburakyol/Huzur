import { beforeEach, describe, expect, it, vi } from 'vitest';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

const secureStorageMock = {
  getProStatus: vi.fn(),
  setProStatus: vi.fn().mockResolvedValue(true),
  clearProStatus: vi.fn().mockResolvedValue(true),
  getItem: vi.fn(),
  setItem: vi.fn()
};

vi.mock('./secureStorage', () => ({
  secureStorage: secureStorageMock,
  default: secureStorageMock
}));

vi.mock('../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../utils/crashlyticsReporter', () => ({
  default: {
    logCrash: vi.fn().mockResolvedValue(undefined),
    logExceptionWithContext: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('proService', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    secureStorageMock.getProStatus.mockReset();
    secureStorageMock.setProStatus.mockClear();
    secureStorageMock.clearProStatus.mockClear();
  });

  it('keeps last verified active user as pro without ttl free fallback', async () => {
    const { getProStateSnapshot, isPro, setProStatus, verifyProStatus } = await import('./proService');

    await setProStatus(true, '2099-01-01T00:00:00.000Z', 'server', {
      verifiedAt: '2025-01-01T00:00:00.000Z',
      lastCheckAt: '2025-01-01T00:00:00.000Z',
      verificationState: 'verified'
    });

    secureStorageMock.getProStatus.mockResolvedValue(null);

    expect(isPro()).toBe(true);
    await expect(verifyProStatus()).resolves.toBe(true);
    expect(getProStateSnapshot()).toMatchObject({
      active: true,
      source: 'server',
      verificationState: 'verified'
    });
  });

  it('drops pro access on explicit negative verification', async () => {
    const { isPro, setProStatus } = await import('./proService');

    await setProStatus(true, '2099-01-01T00:00:00.000Z', 'revenuecat_sdk', {
      verificationState: 'verified'
    });
    await setProStatus(false, null, 'checkProStatus', {
      verificationState: 'negative',
      reason: 'negative'
    });

    expect(isPro()).toBe(false);
  });

  it('marks expired subscriptions as inactive', async () => {
    const { getProStateSnapshot, isPro, setProStatus } = await import('./proService');

    await setProStatus(true, '2020-01-01T00:00:00.000Z', 'server', {
      verificationState: 'verified'
    });

    expect(isPro()).toBe(false);
    expect(getProStateSnapshot().verificationState).toBe('expired');
  });

  it('drops pro access on integrity failure', async () => {
    const { isPro, setProStatus, verifyProStatus } = await import('./proService');

    await setProStatus(true, '2099-01-01T00:00:00.000Z', 'server', {
      verificationState: 'verified'
    });
    secureStorageMock.getProStatus.mockResolvedValue({
      active: true,
      expiresAt: '2099-01-01T00:00:00.000Z',
      source: 'server',
      verificationState: 'verified',
      isValid: false
    });

    await expect(verifyProStatus()).resolves.toBe(false);
    expect(isPro()).toBe(false);
    expect(secureStorageMock.clearProStatus).toHaveBeenCalled();
  });
});
