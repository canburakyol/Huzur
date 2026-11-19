import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const localNotificationsMock = vi.hoisted(() => ({
  schedule: vi.fn().mockResolvedValue(undefined),
  cancel: vi.fn().mockResolvedValue(undefined),
  requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
  checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
  createChannel: vi.fn().mockResolvedValue(undefined),
}));

const storageMock = vi.hoisted(() => ({
  getItem: vi.fn((key, fallback = null) => fallback),
  setItem: vi.fn(() => true),
  removeItem: vi.fn(() => true),
  getString: vi.fn((key, fallback = '') => fallback),
  setString: vi.fn(() => true),
}));

const aiHintMock = vi.hoisted(() => ({
  getPersonalizedPushHintsV1: vi.fn().mockResolvedValue(null),
}));

const aiContextMock = vi.hoisted(() => ({
  buildAiContext: vi.fn((input = {}) => input),
}));

const prayerSchedulePluginMock = vi.hoisted(() => ({
  setPrayerNotificationsEnabled: vi.fn().mockResolvedValue({ success: true, platform: 'android' }),
}));

const analyticsMock = vi.hoisted(() => ({
  analyticsService: {
    logCampaignResolved: vi.fn(),
    logExperimentAssigned: vi.fn(),
    logPushVariantDelivered: vi.fn(),
    logQuietHoursSkipped: vi.fn(),
    logPushHintV1Applied: vi.fn(),
    logEvent: vi.fn(),
    logNotificationTapped: vi.fn(),
  },
  ANALYTICS_EVENTS: {
    NOTIFICATION_RECEIVED: 'notification_received',
  },
}));

const adhanMock = vi.hoisted(() => ({ known: false }));

vi.mock('../config/adhanSounds', () => ({
  ADHAN_SOUNDS: [],
  isKnownAdhanSound: (id) => adhanMock.known && Boolean(id),
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: localNotificationsMock,
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    getPlatform: vi.fn(() => 'android'),
  },
}));

vi.mock('./storageService', () => ({
  storageService: storageMock,
}));

vi.mock('../plugins/PrayerSchedulePlugin', () => ({
  default: prayerSchedulePluginMock,
}));

vi.mock('./notificationPlatformService', () => ({
  NOTIFICATION_CHANNELS: {
    PRAYER: { id: 'prayer', sound: 'default', name: 'Prayer', description: 'Prayer' },
    REMINDER: { id: 'reminder', sound: 'default', name: 'Reminder', description: 'Reminder' },
    STREAK: { id: 'streak', sound: 'default', name: 'Streak', description: 'Streak' },
    UPDATES: { id: 'updates', sound: 'default', name: 'Updates', description: 'Updates' },
  },
  STICKY_NOTIFICATION_ID: 999,
  requestNotificationPermission: vi.fn().mockResolvedValue(true),
  checkNotificationPermission: vi.fn().mockResolvedValue(true),
  createNotificationChannels: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./analyticsService', () => analyticsMock);

vi.mock('./experimentService', () => ({
  getExperimentVariant: vi.fn(() => 'A'),
}));

vi.mock('./campaignService', () => ({
  getActiveCampaign: vi.fn(() => ({ id: 'evergreen', region: 'local', variant: 'A' })),
  resolveCampaignCopy: vi.fn(({ fallbackTitle, fallbackBody }) => ({ title: fallbackTitle, body: fallbackBody })),
}));

vi.mock('./userActivityTracker', () => ({
  getOptimalReminderHour: vi.fn(() => null),
}));

vi.mock('./aiService', () => aiHintMock);
vi.mock('./aiContextService', () => aiContextMock);
vi.mock('./recoveryLoopService', () => ({
  getRecoveryLoopPlan: vi.fn(() => null),
}));

vi.mock('../utils/logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const importService = async () => import('./smartNotificationService');

describe('smartNotificationService (Unified)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    storageMock.getItem.mockImplementation((key, fallback = null) => fallback);
    aiHintMock.getPersonalizedPushHintsV1.mockResolvedValue(null);
    aiContextMock.buildAiContext.mockImplementation((input = {}) => input);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should provide default preferences', async () => {
    const { getNotificationPreferences } = await importService();

    const prefs = getNotificationPreferences();

    expect(prefs).toBeDefined();
    expect(typeof prefs.prayer).toBe('boolean');
    expect(prefs.winback).toBe(true);
  });

  it('propagates a disabled prayer preference to the native alarm scheduler', async () => {
    const { updateNotificationPreferences } = await importService();

    await updateNotificationPreferences({ prayer: false });

    expect(prayerSchedulePluginMock.setPrayerNotificationsEnabled).toHaveBeenCalledWith({ enabled: false });
    expect(storageMock.setItem).toHaveBeenCalledWith(
      'huzur_notification_prefs',
      expect.objectContaining({ prayer: false })
    );
  });

  it('builds a three-step winback sequence from the current open', async () => {
    const { buildWinbackNotifications } = await importService();

    const notifications = buildWinbackNotifications(new Date('2026-05-03T12:00:00+03:00'), {
      reminder: true,
      winback: true,
      quietHoursEnabled: false
    });

    expect(notifications).toHaveLength(3);
    expect(notifications.map((item) => item.extra.lifecycle_stage)).toEqual([
      'cooling_2_4d',
      'comeback_5_13d',
      'dormant_14d_plus'
    ]);
    expect(notifications[0].extra.campaign).toBe('winback_reactivation_v1');
  });

  it('respects quiet hours for winback scheduling', async () => {
    const { buildWinbackNotifications } = await importService();

    const notifications = buildWinbackNotifications(new Date('2026-05-03T12:00:00+03:00'), {
      reminder: true,
      winback: true,
      quietHoursEnabled: true,
      quietHoursStart: '19:00',
      quietHoursEnd: '21:00'
    });

    expect(notifications).toHaveLength(0);
  });

  it('keeps prayer notification IDs clear of streak, sticky, reminder and winback IDs on every day', async () => {
    const { prayerNotificationId } = await importService();
    const reserved = new Set([1000, 1001, 2000, 2001, 2002, 3100, 3101, 3102, 999]);
    for (let day = 1; day <= 31; day += 1) {
      const date = new Date(2026, 0, day);
      for (let index = 0; index < 6; index += 1) {
        expect(reserved.has(prayerNotificationId(date, index, false))).toBe(false);
        expect(reserved.has(prayerNotificationId(date, index, true))).toBe(false);
      }
    }
  });

  it('schedules the next days too, skips a sunrise "prayer time" and reads times with a zone suffix', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T23:00:00+03:00'));
    const { schedulePrayerNotifications } = await importService();
    const tomorrow = new Date('2026-05-11T00:00:00+03:00');

    await schedulePrayerNotifications(
      { Fajr: '04:00', Sunrise: '05:30', Dhuhr: '13:00' },
      new Date('2026-05-10T23:00:00+03:00'),
      [{ date: tomorrow, timings: { Fajr: '04:01 (+03)', Sunrise: '05:31 (+03)', Dhuhr: '13:00 (+03)' } }]
    );

    const scheduled = localNotificationsMock.schedule.mock.calls[0][0].notifications;
    const main = scheduled.filter((item) => item.extra.type === 'prayer');
    expect(main.map((item) => item.extra.prayer)).toEqual(['Fajr', 'Dhuhr']);
    expect(main[0].schedule.at.getDate()).toBe(11);
    expect(main[0].schedule.at.getHours()).toBe(4);
    expect(main[0].schedule.at.getMinutes()).toBe(1);
    expect(scheduled.some((item) => item.extra.type === 'prayer_pre' && item.extra.prayer === 'Sunrise')).toBe(true);
    expect(new Set(scheduled.map((item) => item.id)).size).toBe(scheduled.length);
  });

  it('leaves the main prayer notification to Android when the adhan is on, keeping the heads-up', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-10T09:00:00+03:00'));
    adhanMock.known = true;
    storageMock.getItem.mockImplementation((key, fallback = null) => (
      key === 'notification_preferences' || key === 'huzur_notification_prefs'
        ? { prayer: true, adhanSound: 'adhan_test' }
        : fallback
    ));
    try {
      const { schedulePrayerNotifications } = await importService();
      await schedulePrayerNotifications({ Dhuhr: '13:00', Asr: '16:30' }, new Date('2026-05-10T09:00:00+03:00'));
      const scheduled = localNotificationsMock.schedule.mock.calls[0][0].notifications;
      expect(scheduled.some((item) => item.extra.type === 'prayer')).toBe(false);
      expect(scheduled.filter((item) => item.extra.type === 'prayer_pre')).toHaveLength(2);
    } finally {
      adhanMock.known = false;
      storageMock.getItem.mockImplementation((key, fallback = null) => fallback);
    }
  });

  it('applies AI push hints per scheduled prayer notification with prayer context', async () => {
    const now = new Date('2026-05-19T12:00:00+03:00');
    vi.useFakeTimers();
    vi.setSystemTime(now);
    aiHintMock.getPersonalizedPushHintsV1.mockImplementation(async ({ type, context, fallbackTitle, fallbackBody }) => ({
      title: `${type}:${context.nextPrayer.name}`,
      body: fallbackBody || 'fallback body',
      reason: 'test',
      provider: 'local',
      fallbackTitle,
    }));
    const { schedulePrayerNotifications } = await importService();

    await schedulePrayerNotifications({
      Fajr: '23:45',
      Dhuhr: '23:50',
    }, now);

    const scheduled = localNotificationsMock.schedule.mock.calls[0][0].notifications;
    expect(scheduled.some((item) => item.title === 'prayer_main:Sabah')).toBe(true);
    expect(scheduled.some((item) => item.title === 'prayer_pre:Sabah')).toBe(true);
    expect(aiHintMock.getPersonalizedPushHintsV1).toHaveBeenCalledWith(expect.objectContaining({
      type: 'prayer_main',
      fallbackTitle: expect.any(String),
      fallbackBody: expect.any(String),
    }));
    expect(aiHintMock.getPersonalizedPushHintsV1).toHaveBeenCalledWith(expect.objectContaining({
      type: 'prayer_pre',
      fallbackTitle: expect.any(String),
      fallbackBody: expect.any(String),
    }));
  });

  it('keeps fallback copy when AI push hints fail', async () => {
    aiHintMock.getPersonalizedPushHintsV1.mockRejectedValue(new Error('offline'));
    const { scheduleDailyReminders } = await importService();

    await scheduleDailyReminders();

    const scheduled = localNotificationsMock.schedule.mock.calls[0][0].notifications;
    expect(scheduled).toHaveLength(3);
    expect(new Set(scheduled.map((item) => item.title)).size).toBe(3);
  });

  it('keeps fallback copy when AI context generation fails', async () => {
    aiContextMock.buildAiContext.mockImplementation(() => {
      throw new Error('context unavailable');
    });
    const { scheduleDailyReminders } = await importService();

    await scheduleDailyReminders();

    const scheduled = localNotificationsMock.schedule.mock.calls[0][0].notifications;
    expect(scheduled).toHaveLength(3);
    expect(new Set(scheduled.map((item) => item.title)).size).toBe(3);
  });

  it('uses default streak copy when recovery loop plan is unavailable', async () => {
    const { scheduleStreakNotifications } = await importService();

    await scheduleStreakNotifications(7);

    const scheduled = localNotificationsMock.schedule.mock.calls[0][0].notifications;
    expect(scheduled).toHaveLength(2);
    expect(scheduled[0]).toMatchObject({
      title: 'Bugün tek bir adım yeterli',
      extra: expect.objectContaining({
        risk_band: 'unknown',
        recovery_feature: 'streak',
      }),
    });
  });
});
