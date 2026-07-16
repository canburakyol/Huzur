import { beforeEach, describe, expect, it, vi } from 'vitest';

const capacitorMock = vi.hoisted(() => ({
  getPlatform: vi.fn(() => 'android'),
}));

const nativeBridgeMock = vi.hoisted(() => ({
  initialize: vi.fn(async () => ({ success: true })),
  loadAd: vi.fn(),
  showAd: vi.fn(async () => ({ success: true })),
  hideAd: vi.fn(async () => ({ success: true })),
  reportImpression: vi.fn(async () => ({ success: true })),
  reportClick: vi.fn(async () => ({ success: true })),
  destroy: vi.fn(async () => ({ success: true })),
}));

vi.mock('@capacitor/core', () => ({ Capacitor: capacitorMock }));
vi.mock('../plugins/NativeAdBridgePlugin', () => ({ default: nativeBridgeMock }));
vi.mock('./adEnvironmentService', () => ({
  getNativeAdUnitId: vi.fn(async () => 'native-production-id'),
}));
vi.mock('./proService', () => ({ isPro: vi.fn(() => false) }));
vi.mock('./admobService', () => ({ ensureAdMobReady: vi.fn(async () => true) }));
vi.mock('../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('nativeAdService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    capacitorMock.getPlatform.mockReturnValue('android');
  });

  it('retries temporary native load failures and caches the successful ad', async () => {
    nativeBridgeMock.loadAd
      .mockRejectedValueOnce(new Error('no fill'))
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ adId: 'native-ad-1', headline: 'Test' });

    const { nativeAdService } = await import('./nativeAdService');
    const loadResult = nativeAdService.load();

    await vi.advanceTimersByTimeAsync(5000);

    await expect(loadResult).resolves.toEqual(expect.objectContaining({ adId: 'native-ad-1' }));
    await expect(nativeAdService.load()).resolves.toEqual(expect.objectContaining({ adId: 'native-ad-1' }));
    expect(nativeBridgeMock.loadAd).toHaveBeenCalledTimes(3);
  });
});
