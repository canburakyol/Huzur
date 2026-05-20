import { beforeEach, describe, expect, it, vi } from 'vitest';

const capacitorMock = vi.hoisted(() => ({
  getPlatform: vi.fn(() => 'web')
}));

const prayerScheduleMock = vi.hoisted(() => ({
  getExactAlarmPermissionStatus: vi.fn(),
  openExactAlarmSettings: vi.fn()
}));

const loggerMock = vi.hoisted(() => ({
  warn: vi.fn()
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: capacitorMock
}));

vi.mock('../plugins/PrayerSchedulePlugin', () => ({
  default: prayerScheduleMock
}));

vi.mock('../utils/logger', () => ({
  logger: loggerMock
}));

const importService = async () => import('./AlarmPermissionService');

describe('AlarmPermissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capacitorMock.getPlatform.mockReturnValue('web');
    prayerScheduleMock.getExactAlarmPermissionStatus.mockResolvedValue({
      granted: true,
      canScheduleExactAlarms: true,
      requiresUserApproval: false,
      platform: 'android',
      sdkInt: 35
    });
    prayerScheduleMock.openExactAlarmSettings.mockResolvedValue({
      granted: false,
      canScheduleExactAlarms: false,
      requiresUserApproval: true,
      platform: 'android',
      sdkInt: 35
    });
  });

  it('returns a safe granted no-op status on web without touching the native plugin', async () => {
    const { getExactAlarmPermissionStatus } = await importService();

    const status = await getExactAlarmPermissionStatus();

    expect(status).toEqual({
      granted: true,
      canScheduleExactAlarms: true,
      requiresUserApproval: false,
      platform: 'web'
    });
    expect(prayerScheduleMock.getExactAlarmPermissionStatus).not.toHaveBeenCalled();
  });

  it('reads exact alarm permission status from the native Android plugin', async () => {
    capacitorMock.getPlatform.mockReturnValue('android');
    const { getExactAlarmPermissionStatus } = await importService();

    const status = await getExactAlarmPermissionStatus();

    expect(prayerScheduleMock.getExactAlarmPermissionStatus).toHaveBeenCalledTimes(1);
    expect(status).toMatchObject({
      granted: true,
      canScheduleExactAlarms: true,
      requiresUserApproval: false,
      platform: 'android',
      sdkInt: 35
    });
  });

  it('fails closed when Android permission status lookup throws', async () => {
    capacitorMock.getPlatform.mockReturnValue('android');
    prayerScheduleMock.getExactAlarmPermissionStatus.mockRejectedValue(new Error('bridge down'));
    const { getExactAlarmPermissionStatus } = await importService();

    const status = await getExactAlarmPermissionStatus();

    expect(status).toMatchObject({
      granted: false,
      canScheduleExactAlarms: false,
      requiresUserApproval: true,
      platform: 'android',
      error: 'bridge down'
    });
    expect(loggerMock.warn).toHaveBeenCalledWith(
      '[AlarmPermission] Failed to read exact alarm permission status',
      expect.any(Error)
    );
  });

  it('opens Android exact alarm settings only when approval is required and missing', async () => {
    capacitorMock.getPlatform.mockReturnValue('android');
    prayerScheduleMock.getExactAlarmPermissionStatus.mockResolvedValue({
      granted: false,
      canScheduleExactAlarms: false,
      requiresUserApproval: true,
      platform: 'android',
      sdkInt: 35
    });
    const { ensureExactAlarmPermission } = await importService();

    const status = await ensureExactAlarmPermission();

    expect(status.granted).toBe(false);
    expect(prayerScheduleMock.openExactAlarmSettings).toHaveBeenCalledTimes(1);
  });

  it('does not open settings when permission is already granted', async () => {
    capacitorMock.getPlatform.mockReturnValue('android');
    const { ensureExactAlarmPermission } = await importService();

    const status = await ensureExactAlarmPermission();

    expect(status.granted).toBe(true);
    expect(prayerScheduleMock.openExactAlarmSettings).not.toHaveBeenCalled();
  });
});
