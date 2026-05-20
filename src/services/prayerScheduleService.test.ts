import { beforeEach, describe, expect, it, vi } from 'vitest';

const capacitorMock = vi.hoisted(() => ({
  getPlatform: vi.fn(() => 'android')
}));

const alarmPermissionMock = vi.hoisted(() => ({
  ensureExactAlarmPermission: vi.fn()
}));

const storageServiceMock = vi.hoisted(() => ({
  syncPrayerScheduleCacheToNative: vi.fn()
}));

const prayerServiceMock = vi.hoisted(() => ({
  fetchMonthlyPrayerTimes: vi.fn(),
  getNextPrayer: vi.fn()
}));

const widgetServiceMock = vi.hoisted(() => ({
  updateWidget: vi.fn()
}));

const loggerMock = vi.hoisted(() => ({
  warn: vi.fn()
}));

const crashlyticsMock = vi.hoisted(() => ({
  logCrash: vi.fn(),
  logExceptionWithContext: vi.fn()
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: capacitorMock
}));

vi.mock('./AlarmPermissionService', () => alarmPermissionMock);

vi.mock('./storageService', () => storageServiceMock);

vi.mock('./prayerService', () => prayerServiceMock);

vi.mock('./widgetService', () => widgetServiceMock);

vi.mock('../utils/logger', () => ({
  logger: loggerMock
}));

vi.mock('../utils/crashlyticsReporter', () => ({
  default: crashlyticsMock,
  buildCrashContext: vi.fn((context, metadata) => ({ context, metadata }))
}));

const importService = async () => import('./prayerScheduleService');

describe('prayerScheduleService exact alarm integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capacitorMock.getPlatform.mockReturnValue('android');
    alarmPermissionMock.ensureExactAlarmPermission.mockResolvedValue({
      granted: true,
      canScheduleExactAlarms: true,
      requiresUserApproval: true,
      platform: 'android',
      sdkInt: 35
    });
    storageServiceMock.syncPrayerScheduleCacheToNative.mockResolvedValue({
      success: true,
      platform: 'android'
    });
    prayerServiceMock.getNextPrayer.mockReturnValue({
      key: 'Dhuhr',
      name: 'Öğle'
    });
    prayerServiceMock.fetchMonthlyPrayerTimes.mockResolvedValue({
      year: 2026,
      month: 5,
      timings: [{ date: '2026-05-19' }]
    });
    widgetServiceMock.updateWidget.mockResolvedValue(undefined);
  });

  it('checks exact alarm permission before native sync on Android', async () => {
    const { syncPrayerSchedule } = await importService();

    const result = await syncPrayerSchedule({
      timings: { Dhuhr: '13:10' },
      latitude: 41.0082,
      longitude: 28.9784,
      locationName: 'Istanbul',
      adhanSound: 'makkah'
    });

    expect(result).toEqual({ success: true, platform: 'android' });
    expect(alarmPermissionMock.ensureExactAlarmPermission).toHaveBeenCalledTimes(1);
    expect(storageServiceMock.syncPrayerScheduleCacheToNative).toHaveBeenCalledWith(
      expect.objectContaining({
        timings: { Dhuhr: '13:10' },
        latitude: 41.0082,
        longitude: 28.9784,
        locationName: 'Istanbul',
        adhanSound: 'makkah'
      })
    );
  });

  it('continues native sync with inexact fallback when exact alarm permission is missing', async () => {
    alarmPermissionMock.ensureExactAlarmPermission.mockResolvedValue({
      granted: false,
      canScheduleExactAlarms: false,
      requiresUserApproval: true,
      platform: 'android',
      sdkInt: 35
    });
    const { syncPrayerSchedule } = await importService();

    await syncPrayerSchedule({
      timings: { Dhuhr: '13:10' },
      locationName: 'Istanbul'
    });

    expect(loggerMock.warn).toHaveBeenCalledWith(
      '[PrayerSchedule] Exact alarm permission is not granted; native inexact fallback will be used',
      expect.objectContaining({
        platform: 'android',
        sdkInt: 35,
        requiresUserApproval: true
      })
    );
    expect(crashlyticsMock.logCrash).toHaveBeenCalledWith('[PrayerSchedule] exact_alarm_permission_missing sdk=35');
    expect(storageServiceMock.syncPrayerScheduleCacheToNative).toHaveBeenCalledTimes(1);
  });

  it('does not check permission or call native sync on web', async () => {
    capacitorMock.getPlatform.mockReturnValue('web');
    const { syncPrayerSchedule } = await importService();

    const result = await syncPrayerSchedule({
      timings: { Dhuhr: '13:10' }
    });

    expect(result).toEqual({ success: false, platform: 'web' });
    expect(alarmPermissionMock.ensureExactAlarmPermission).not.toHaveBeenCalled();
    expect(storageServiceMock.syncPrayerScheduleCacheToNative).not.toHaveBeenCalled();
  });

  it('rejects invalid timings before widget, permission, or native work starts', async () => {
    const { syncPrayerSchedule } = await importService();

    const result = await syncPrayerSchedule({
      timings: null as unknown as Record<string, string>
    });

    expect(result).toEqual({ success: false, error: 'Prayer timings are required' });
    expect(widgetServiceMock.updateWidget).not.toHaveBeenCalled();
    expect(alarmPermissionMock.ensureExactAlarmPermission).not.toHaveBeenCalled();
    expect(storageServiceMock.syncPrayerScheduleCacheToNative).not.toHaveBeenCalled();
  });
});
