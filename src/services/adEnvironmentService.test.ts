import { beforeEach, describe, expect, it, vi } from 'vitest';

const capacitorMock = vi.hoisted(() => ({
  getPlatform: vi.fn(() => 'android'),
}));

const appCheckMock = vi.hoisted(() => ({
  getFirebaseStatus: vi.fn(async () => ({ debuggable: true })),
}));

vi.mock('@capacitor/core', () => ({ Capacitor: capacitorMock }));
vi.mock('../plugins/AppCheckPlugin', () => ({ AppCheck: appCheckMock }));
vi.mock('../utils/logger', () => ({
  logger: { error: vi.fn() },
}));

describe('adEnvironmentService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    capacitorMock.getPlatform.mockReturnValue('android');
    appCheckMock.getFirebaseStatus.mockResolvedValue({ debuggable: true });
  });

  it('always uses Google test ad units in a debuggable Android build', async () => {
    const service = await import('./adEnvironmentService');

    const runtime = await service.getAdRuntime();

    expect(runtime.isDebugBuild).toBe(true);
    expect(runtime.useTestAds).toBe(true);
    await expect(service.getBannerAdUnitId()).resolves.toBe('ca-app-pub-3940256099942544/6300978111');
    await expect(service.getRewardedAdUnitId()).resolves.toBe('ca-app-pub-3940256099942544/5224354917');
    await expect(service.getNativeAdUnitId()).resolves.toBe('ca-app-pub-3940256099942544/2247696110');
  });
});
