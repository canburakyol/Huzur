import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { storageService } from './storageService';
import { logger } from '../utils/logger';
import { analyticsService, ANALYTICS_EVENTS } from './analyticsService';
import { getExperimentVariant } from './experimentService';
import { getActiveCampaign, resolveCampaignCopy } from './campaignService';
import { getOptimalReminderHour } from './userActivityTracker';
import { getPersonalizedPushHintsV1 } from './aiService';
import { buildAiContext } from './aiContextService';
import { getRecoveryLoopPlan } from './recoveryLoopService';
import PrayerSchedule from '../plugins/PrayerSchedulePlugin';
import {
  NOTIFICATION_CHANNELS,
  checkNotificationPermission,
  requestNotificationPermission,
  createNotificationChannels,
  STICKY_NOTIFICATION_ID
} from './notificationPlatformService';

export { requestNotificationPermission };
export { NOTIFICATION_CHANNELS };

type NotificationPreferences = {
  prayer: boolean;
  streak: boolean;
  reminder: boolean;
  winback: boolean;
  updates: boolean;
  preAlertMinutes: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
};

type PrayerNotificationConfig = {
  title: string;
  body: string;
  minutesBefore: number;
};

type StreakNotificationConfig = {
  title: string;
  body: string;
  hour: number;
  minute: number;
};

type DailyReminderConfig = {
  id: string;
  title: string;
  body: string;
  slot: string;
  fallbackHour: number;
  minute: number;
};

type WinbackNotificationConfig = {
  id: number;
  delayDays: number;
  lifecycleStage: string;
  title: string;
  body: string;
};

type ScheduledNotification = {
  id: number;
  title: string;
  body: string;
  schedule: {
    at?: Date;
    allowWhileIdle?: boolean;
    repeats?: boolean;
    every?: string;
  };
  sound?: string;
  channelId?: string;
  smallIcon?: string;
  largeIcon?: string;
  actionTypeId?: string;
  ongoing?: boolean;
  autoCancel?: boolean;
  silent?: boolean;
  extra?: Record<string, unknown>;
};

type NotificationHistoryEntry = {
  id?: number;
  title: string;
  body: string;
  date?: string;
  type: string;
  read?: boolean;
  timestamp: string;
};

type NotificationStorage = {
  prayer: ScheduledNotification[];
  streak: ScheduledNotification[];
  reminder: ScheduledNotification[];
  winback: ScheduledNotification[];
};

type PushCopyVariant = {
  title: string;
  body: string;
};

const NOTIFICATION_STORAGE_KEY = 'huzur_scheduled_notifications';
const NOTIFICATION_HISTORY_KEY = 'huzur_notification_history';
const NOTIFICATION_PREFS_KEY = 'huzur_notification_prefs';
const ENABLE_AI_PUSH_HINTS_IN_SCHEDULER = true;

const PRAYER_NOTIFICATIONS: Record<string, PrayerNotificationConfig> = {
  Fajr: {
    title: '🌅 Fajr Prayer Time',
    body: 'Start your day with blessing. Fajr time is approaching!',
    minutesBefore: 15
  },
  Sunrise: {
    title: '☀️ Sunrise',
    body: 'The sun has risen. Prepare for Ishraq prayer.',
    minutesBefore: 5
  },
  Dhuhr: {
    title: '🕌 Dhuhr Prayer Time',
    body: 'Dhuhr prayer time is approaching. Take a short break for prayer.',
    minutesBefore: 15
  },
  Asr: {
    title: '🌤️ Asr Prayer Time',
    body: 'Asr prayer time is coming. Pause your daily work for prayer.',
    minutesBefore: 15
  },
  Maghrib: {
    title: '🌇 Maghrib Prayer Time',
    body: 'Sunset is near, Maghrib prayer time is approaching.',
    minutesBefore: 10
  },
  Isha: {
    title: '🌙 Isha Prayer Time',
    body: 'Isha prayer time is coming. End your day with prayer.',
    minutesBefore: 15
  }
};

const STREAK_NOTIFICATIONS: StreakNotificationConfig[] = [
  {
    title: 'Bugun tek bir adim yeterli',
    body: '{days} gunluk ritmini korumak icin Huzur\'a kisa bir donus yapabilirsin.',
    hour: 20,
    minute: 0
  },
  {
    title: 'Gunu sakin bir adimla tamamla',
    body: 'Bugun tek bir kucuk temas bile ritmi yeniden canlandirabilir.',
    hour: 23,
    minute: 0
  }
];

const DAILY_REMINDERS: DailyReminderConfig[] = [
  {
    id: 'zikir_morning',
    title: '📿 Daily Dhikr Reminder',
    body: 'Have you completed your dhikr today?',
    slot: 'morning',
    fallbackHour: 10,
    minute: 0,
  },
  {
    id: 'quran_afternoon',
    title: '📖 Quran Reading Time',
    body: 'A great time to complete your daily Quran reading goal!',
    slot: 'afternoon',
    fallbackHour: 14,
    minute: 0,
  },
  {
    id: 'tasks_evening',
    title: '✅ Daily Tasks',
    body: 'Have you completed today\'s worship tasks?',
    slot: 'evening',
    fallbackHour: 18,
    minute: 0,
  },
];

const WINBACK_CAMPAIGN_ID = 'winback_reactivation_v1';

export const WINBACK_NOTIFICATIONS: WinbackNotificationConfig[] = [
  {
    id: 3100,
    delayDays: 3,
    lifecycleStage: 'cooling_2_4d',
    title: 'Bugun ritmi tazele',
    body: 'Buyuk bir hedef gerekmez. Huzurda tek kucuk adim gunun akisina yetebilir.'
  },
  {
    id: 3101,
    delayDays: 7,
    lifecycleStage: 'comeback_5_13d',
    title: 'Yavasca geri don',
    body: 'Ara vermis olman normal. Bugun sadece sakin bir baslangic yapabilirsin.'
  },
  {
    id: 3102,
    delayDays: 14,
    lifecycleStage: 'dormant_14d_plus',
    title: 'Sifirdan baslamak serbest',
    body: 'Eski ritmi yakalamaya calismadan, bugun yeni ve hafif bir adim secebilirsin.'
  }
];

export const getNotificationPreferences = (): NotificationPreferences => {
  const defaults: NotificationPreferences = {
    prayer: true,
    streak: true,
    reminder: true,
    winback: true,
    updates: true,
    preAlertMinutes: 15,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00'
  };
  return storageService.getItem(NOTIFICATION_PREFS_KEY) || defaults;
};

const parseHourMinute = (timeValue: string | undefined, fallbackHour: number, fallbackMinute: number): { hour: number; minute: number } => {
  const [h, m] = String(timeValue || '').split(':').map((v) => Number(v));
  if (Number.isInteger(h) && Number.isInteger(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
    return { hour: h, minute: m };
  }
  return { hour: fallbackHour, minute: fallbackMinute };
};

const isInQuietHours = (date: Date, prefs: NotificationPreferences | null): boolean => {
  if (!prefs?.quietHoursEnabled) return false;

  const { hour: startHour, minute: startMinute } = parseHourMinute(prefs.quietHoursStart, 22, 0);
  const { hour: endHour, minute: endMinute } = parseHourMinute(prefs.quietHoursEnd, 7, 0);

  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (startMinutes === endMinutes) return true;
  if (startMinutes < endMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }

  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
};

const shouldScheduleAt = (date: Date | null | undefined, prefs: NotificationPreferences | null, type: string): boolean => {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  if (!isInQuietHours(date, prefs)) return true;

  analyticsService.logQuietHoursSkipped(type, date.getHours(), date.getMinutes());
  return false;
};

const getPushCopyVariantText = ({ variant, campaign, baseTitle, baseBody }: {
  variant: string;
  campaign: { id?: string };
  baseTitle: string;
  baseBody: string;
}): PushCopyVariant => {
  const id = campaign?.id || 'evergreen';
  const group: Record<string, PushCopyVariant> = {
    A: {
      title: `${baseTitle}`,
      body: `${baseBody}`
    },
    B: {
      title: id === 'ramadan' ? '🌙 Ramazan Vakti Yaklaşıyor' : `⏰ ${baseTitle}`,
      body: id === 'friday'
        ? 'Cuma gününün bereketi için kısa bir hazırlık yap.'
        : `${baseBody} Şimdi niyetlenmek için güzel bir an.`
    },
    C: {
      title: id === 'kandil' ? '🕯️ Manevi Hatırlatma' : `✨ ${baseTitle}`,
      body: `${baseBody} Huzur için küçük bir mola ver.`
    }
  };

  return group[variant] || group.A;
};

const getAiPushHintIfEnabled = async ({ type = 'reminder', context = {}, fallbackTitle = '', fallbackBody = '' }: {
  type?: string;
  context?: Record<string, unknown>;
  fallbackTitle?: string;
  fallbackBody?: string;
} = {}): Promise<{ title: string; body: string } | null> => {
  try {
    const result = await getPersonalizedPushHintsV1({ type, context, fallbackTitle, fallbackBody });
    if (!result?.title || !result?.body) {
      return null;
    }

    (analyticsService.logPushHintV1Applied as ((reason: string, provider: string) => void))?.(result.reason || 'generic', result.provider || 'fallback');
    return {
      title: result.title || fallbackTitle,
      body: result.body || fallbackBody,
    };
  } catch (error) {
    logger.warn('[Notifications] AI hint unavailable', error);
    return null;
  }
};

const resolveScheduledPushCopy = async ({
  enabled,
  type,
  fallback,
  contextFactory,
}: {
  enabled: boolean;
  type: string;
  fallback: PushCopyVariant;
  contextFactory: () => Record<string, unknown>;
}): Promise<PushCopyVariant> => {
  if (!enabled) {
    return fallback;
  }

  try {
    const context = buildAiContext(contextFactory());
    return await getAiPushHintIfEnabled({
      type,
      context,
      fallbackTitle: fallback.title,
      fallbackBody: fallback.body,
    }) || fallback;
  } catch (error) {
    logger.warn('[Notifications] AI context unavailable', error);
    return fallback;
  }
};

export const updateNotificationPreferences = async (newPrefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
  const current = getNotificationPreferences();
  const updated = { ...current, ...newPrefs };
  storageService.setItem(NOTIFICATION_PREFS_KEY, updated);

  if (typeof newPrefs.prayer === 'boolean' && Capacitor.getPlatform() !== 'web') {
    try {
      await PrayerSchedule.setPrayerNotificationsEnabled({ enabled: updated.prayer });
    } catch (error) {
      logger.warn('[Notifications] Native prayer preference sync failed', error);
    }
  }

  if (!updated.prayer) await cancelNotificationsByType('prayer');
  if (!updated.streak) await cancelNotificationsByType('streak');
  if (!updated.reminder) await cancelNotificationsByType('reminder');
  if (!updated.winback) await cancelNotificationsByType('winback');

  return updated;
};

export const schedulePrayerNotifications = async (prayerTimes: Record<string, string>, date: Date = new Date()): Promise<void> => {
  const prefs = getNotificationPreferences();
  if (!prefs.prayer || !prayerTimes) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const notifications: ScheduledNotification[] = [];
  const baseId = date.getDate() * 100;
  const campaign = getActiveCampaign(date);
  analyticsService.logCampaignResolved(campaign.id, campaign.region, campaign.variant);
  const pushVariant = getExperimentVariant('push_copy_v1');
  analyticsService.logExperimentAssigned('push_copy_v1', pushVariant, 'schedule_prayer_notifications');
  const prayerNames: Record<string, string> = {
    Fajr: 'Sabah',
    Sunrise: 'Güneş',
    Dhuhr: 'Öğle',
    Asr: 'İkindi',
    Maghrib: 'Akşam',
    Isha: 'Yatsı'
  };

  for (const [index, [prayer, config]] of Object.entries(PRAYER_NOTIFICATIONS).entries()) {
    const timeStr = prayerTimes[prayer];
    if (!timeStr) continue;

    const [hours, minutes] = timeStr.split(':').map(Number);

    const prayerTime = new Date(date);
    prayerTime.setHours(hours, minutes, 0, 0);

    if (prayerTime > new Date()) {
      if (!shouldScheduleAt(prayerTime, prefs, 'prayer_main')) continue;

      const campaignCopy = resolveCampaignCopy({
        campaign,
        type: 'reminder',
        fallbackTitle: `Ezan Vakti: ${prayerNames[prayer] || prayer}`,
        fallbackBody: 'Vakit girdi. Haydi namaza!'
      });
      const variantFallback = getPushCopyVariantText({
        variant: pushVariant,
        campaign,
        baseTitle: campaignCopy.title,
        baseBody: campaignCopy.body
      });
      const variantCopy = await resolveScheduledPushCopy({
        enabled: ENABLE_AI_PUSH_HINTS_IN_SCHEDULER,
        type: 'prayer_main',
        fallback: variantFallback,
        contextFactory: () => ({
            activeTab: 'home',
            timings: prayerTimes,
            dailyContent: { campaignId: campaign.id },
            locationName: '',
            nextPrayer: { key: prayer, name: prayerNames[prayer] || prayer },
          }),
      });

      notifications.push({
        id: baseId + index,
        title: variantCopy.title,
        body: variantCopy.body,
        schedule: {
          at: prayerTime,
          allowWhileIdle: true
        },
        sound: NOTIFICATION_CHANNELS.PRAYER.sound,
        channelId: NOTIFICATION_CHANNELS.PRAYER.id,
        smallIcon: 'ic_notification',
        actionTypeId: 'PRAYER_ACTION',
        extra: {
          type: 'prayer',
          prayer,
          action: 'now',
          campaign: campaign.id,
          campaign_variant: campaign.variant,
          push_variant: pushVariant
        }
      });

      analyticsService.logPushVariantDelivered(pushVariant, campaign.id, 'prayer_main');
    }

    if (config.minutesBefore > 0) {
      const preTime = new Date(prayerTime.getTime() - (config.minutesBefore * 60000));

      if (preTime > new Date()) {
        if (!shouldScheduleAt(preTime, prefs, 'prayer_pre')) continue;

        const campaignCopy = resolveCampaignCopy({
          campaign,
          type: 'reminder',
          fallbackTitle: config.title,
          fallbackBody: config.body
        });
        const variantFallback = getPushCopyVariantText({
          variant: pushVariant,
          campaign,
          baseTitle: campaignCopy.title,
          baseBody: campaignCopy.body
        });
        const variantCopy = await resolveScheduledPushCopy({
          enabled: ENABLE_AI_PUSH_HINTS_IN_SCHEDULER,
          type: 'prayer_pre',
          fallback: variantFallback,
          contextFactory: () => ({
              activeTab: 'home',
              timings: prayerTimes,
              dailyContent: { campaignId: campaign.id },
              locationName: '',
              nextPrayer: { key: prayer, name: prayerNames[prayer] || prayer },
            }),
        });

        notifications.push({
          id: baseId + 50 + index,
          title: variantCopy.title,
          body: variantCopy.body,
          schedule: {
            at: preTime,
            allowWhileIdle: true
          },
          sound: 'default',
          channelId: NOTIFICATION_CHANNELS.PRAYER.id,
          smallIcon: 'ic_notification',
          extra: {
            type: 'prayer_pre',
            prayer,
            campaign: campaign.id,
            campaign_variant: campaign.variant,
            push_variant: pushVariant
          }
        });

        analyticsService.logPushVariantDelivered(pushVariant, campaign.id, 'prayer_pre');
      }
    }
  }

  try {
    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({ notifications });
    }

    saveScheduledNotifications('prayer', notifications);

    analyticsService.logEvent(ANALYTICS_EVENTS.NOTIFICATION_RECEIVED, {
      type: 'prayer_schedule_batch',
      count: notifications.length
    });

    logger.log('Notifications: Prayer notifications scheduled', notifications.length);
  } catch (error) {
    logger.error('Notifications: Schedule error', error);
  }
};

export const scheduleStreakNotifications = async (currentStreak: number): Promise<void> => {
  const prefs = getNotificationPreferences();
  if (!prefs.streak || currentStreak < 2) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const notifications: ScheduledNotification[] = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const recoveryPlan = (() => {
    try {
      return getRecoveryLoopPlan(tomorrow);
    } catch (error) {
      logger.warn('Notifications: Recovery plan unavailable', error);
      return null;
    }
  })();

  STREAK_NOTIFICATIONS.forEach((config, index) => {
    const scheduleTime = new Date(tomorrow);
    scheduleTime.setHours(config.hour, config.minute, 0, 0);

    if (!shouldScheduleAt(scheduleTime, prefs, 'streak')) return;

    const personalizedTitle = recoveryPlan
      ? index === 0
        ? recoveryPlan.notificationTitle
        : `${recoveryPlan.notificationTitle} - aksam`
      : config.title;
    const personalizedBody = recoveryPlan
      ? index === 0
        ? `${recoveryPlan.notificationBody} ${currentStreak} gunluk zincirini yavasca surdurebilirsin.`
        : `${recoveryPlan.description} Bugun kisa bir donus bile yeterli.`
      : config.body.replace('{days}', String(currentStreak));

    notifications.push({
      id: 1000 + index,
      title: personalizedTitle || config.title,
      body: personalizedBody || config.body.replace('{days}', String(currentStreak)),
      schedule: {
        at: scheduleTime,
        allowWhileIdle: true
      },
      sound: NOTIFICATION_CHANNELS.STREAK.sound,
      channelId: NOTIFICATION_CHANNELS.STREAK.id,
      smallIcon: 'ic_notification',
      largeIcon: 'ic_fire',
      extra: {
        type: 'streak',
        streak: currentStreak,
        risk_band: recoveryPlan?.riskBand ?? 'unknown',
        recovery_feature: recoveryPlan?.feature ?? 'streak',
        reward_tone: recoveryPlan?.rewardTone ?? 'gentle'
      }
    });
  });

  try {
    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({ notifications });
    }

    saveScheduledNotifications('streak', notifications);
    logger.log('Notifications: Streak notifications scheduled');
  } catch (error) {
    logger.error('Notifications: Streak schedule error', error);
  }
};

export const scheduleDailyReminders = async (): Promise<void> => {
  const prefs = getNotificationPreferences();
  if (!prefs.reminder) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const notifications: ScheduledNotification[] = [];

  try {
    for (const [index, config] of DAILY_REMINDERS.entries()) {
      const optimalHour = getOptimalReminderHour(config.slot) ?? config.fallbackHour;

      const scheduleTime = new Date();
      scheduleTime.setHours(optimalHour, config.minute, 0, 0);

      if (scheduleTime <= new Date()) {
        scheduleTime.setDate(scheduleTime.getDate() + 1);
      }

      if (!shouldScheduleAt(scheduleTime, prefs, 'reminder')) continue;

      const campaign = getActiveCampaign(scheduleTime);
      const pushVariant = getExperimentVariant('push_copy_v1');
      const campaignCopy = resolveCampaignCopy({
        campaign,
        type: 'reminder',
        fallbackTitle: config.title,
        fallbackBody: config.body
      });
      const variantFallback = getPushCopyVariantText({
        variant: pushVariant,
        campaign,
        baseTitle: campaignCopy.title,
        baseBody: campaignCopy.body
      });
      const variantCopy = await resolveScheduledPushCopy({
        enabled: ENABLE_AI_PUSH_HINTS_IN_SCHEDULER,
        type: 'reminder',
        fallback: variantFallback,
        contextFactory: () => ({
          activeTab: 'home',
          activeFeature: config.id,
          locationName: '',
          dailyContent: { campaign: { id: campaign.id } },
        }),
      });

      analyticsService.logCampaignResolved(campaign.id, campaign.region, campaign.variant);
      analyticsService.logExperimentAssigned('push_copy_v1', pushVariant, 'schedule_daily_reminders');
      analyticsService.logPushVariantDelivered(pushVariant, campaign.id, 'daily_reminder');

      notifications.push({
        id: 2000 + index,
        title: variantCopy.title,
        body: variantCopy.body,
        schedule: {
          at: scheduleTime,
          repeats: true,
          every: 'day'
        },
        sound: NOTIFICATION_CHANNELS.REMINDER.sound,
        channelId: NOTIFICATION_CHANNELS.REMINDER.id,
        smallIcon: 'ic_notification',
        extra: {
          type: 'reminder',
          reminderId: config.id,
          campaign: campaign.id,
          campaign_variant: campaign.variant,
          push_variant: pushVariant
        }
      });
    }
  } catch (error) {
    logger.error('Notifications: Reminder generation error', error);
    return;
  }

  try {
    if (notifications.length === 0) return;

    await cancelNotificationsByType('reminder');

    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({ notifications });
    }

    saveScheduledNotifications('reminder', notifications);
    logger.log('Notifications: Daily reminders scheduled');
  } catch (error) {
    logger.error('Notifications: Reminder schedule error', error);
  }
};

export const buildWinbackNotifications = (now: Date = new Date(), prefs: NotificationPreferences = getNotificationPreferences()): (ScheduledNotification | null)[] => {
  return WINBACK_NOTIFICATIONS.map((config) => {
    const scheduleTime = new Date(now);
    scheduleTime.setDate(scheduleTime.getDate() + config.delayDays);
    scheduleTime.setHours(19, 30, 0, 0);

    if (!shouldScheduleAt(scheduleTime, prefs, 'winback')) {
      return null;
    }

    return {
      id: config.id,
      title: config.title,
      body: config.body,
      schedule: {
        at: scheduleTime,
        allowWhileIdle: true
      },
      sound: NOTIFICATION_CHANNELS.REMINDER.sound,
      channelId: NOTIFICATION_CHANNELS.REMINDER.id,
      smallIcon: 'ic_notification',
      extra: {
        type: 'winback',
        campaign: WINBACK_CAMPAIGN_ID,
        lifecycle_stage: config.lifecycleStage,
        delay_days: config.delayDays,
        action: 'home'
      }
    };
  }).filter(Boolean) as ScheduledNotification[];
};

export const scheduleWinbackNotifications = async (): Promise<void> => {
  const prefs = getNotificationPreferences();
  if (!prefs.winback || !prefs.reminder) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  await cancelNotificationsByType('winback');
  const notifications = buildWinbackNotifications(new Date(), prefs);

  try {
    if (notifications.length === 0) return;

    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({ notifications });
    }

    saveScheduledNotifications('winback', notifications);
    analyticsService.logCampaignResolved(WINBACK_CAMPAIGN_ID, 'local', 'reactivation');
    analyticsService.logPushVariantDelivered('A', WINBACK_CAMPAIGN_ID, 'winback');
    analyticsService.logEvent(ANALYTICS_EVENTS.NOTIFICATION_RECEIVED, {
      type: 'winback_schedule_batch',
      count: notifications.length,
      campaign: WINBACK_CAMPAIGN_ID
    });
    logger.log('Notifications: Winback notifications scheduled', notifications.length);
  } catch (error) {
    logger.error('Notifications: Winback schedule error', error);
  }
};

export const showInstantNotification = async (title: string, body: string, extra: Record<string, unknown> = {}): Promise<void> => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const prefs = getNotificationPreferences();
  if (isInQuietHours(new Date(), prefs)) {
    analyticsService.logQuietHoursSkipped(extra.type as string || 'instant', new Date().getHours(), new Date().getMinutes());
    return;
  }

  const id = Math.floor(Date.now() / 1000);

  const notification: ScheduledNotification = {
    id,
    title,
    body,
    sound: 'default',
    channelId: NOTIFICATION_CHANNELS.UPDATES.id,
    smallIcon: 'ic_notification',
    schedule: { at: new Date(Date.now() + 100) },
    extra
  };

  try {
    if (Capacitor.getPlatform() !== 'web') {
      await LocalNotifications.schedule({ notifications: [notification] });
    } else if ('Notification' in window) {
      new Notification(title, { body, icon: '/pwa-192x192.png' });
    }

    saveToHistory({ title, body, date: new Date().toISOString(), type: extra.type as string || 'general' });
    logger.log('Notifications: Instant notification shown', { title, body });
  } catch (error) {
    logger.error('Notifications: Instant notification error', error);
  }
};

export const cancelNotificationsByType = async (type: string): Promise<void> => {
  try {
    const scheduled = getScheduledNotifications();
    const notificationsToCancel = scheduled[type as keyof NotificationStorage] || [];

    if (notificationsToCancel.length > 0 && Capacitor.getPlatform() !== 'web') {
      const ids = notificationsToCancel.map(n => ({ id: n.id }));
      await LocalNotifications.cancel({ notifications: ids });
    }

    (scheduled as Record<string, unknown>)[type] = [];
    storageService.setItem(NOTIFICATION_STORAGE_KEY, scheduled);

    logger.log('Notifications: Cancelled type', type);
  } catch (error) {
    logger.error('Notifications: Cancel error', error);
  }
};

export const showStickyNotification = async (title: string, body: string): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') return;

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: STICKY_NOTIFICATION_ID,
          ongoing: true,
          autoCancel: false,
          silent: true,
          smallIcon: 'ic_stat_icon',
          channelId: NOTIFICATION_CHANNELS.STICKY_COUNTER.id
        }
      ]
    });
  } catch (error) {
    logger.error('Notifications: Sticky error', error);
  }
};

export const cancelStickyNotification = async (): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: STICKY_NOTIFICATION_ID }] });
  } catch (error) {
    logger.error('Notifications: Sticky cancel error', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    if (Capacitor.getPlatform() !== 'web') {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    }

    storageService.removeItem(NOTIFICATION_STORAGE_KEY);
    logger.log('Notifications: All notifications cancelled');
  } catch (error) {
    logger.error('Notifications: Cancel all error', error);
  }
};

const saveScheduledNotifications = (type: string, notifications: ScheduledNotification[]): void => {
  const scheduled = getScheduledNotifications();
  (scheduled as Record<string, unknown>)[type] = notifications;
  storageService.setItem(NOTIFICATION_STORAGE_KEY, scheduled);
};

const getScheduledNotifications = (): NotificationStorage => {
  return storageService.getItem(NOTIFICATION_STORAGE_KEY) || {
    prayer: [],
    streak: [],
    reminder: [],
    winback: []
  };
};

const saveToHistory = (notification: NotificationHistoryEntry): void => {
  try {
    const history = storageService.getItem<NotificationHistoryEntry[]>(NOTIFICATION_HISTORY_KEY) || [];
    history.unshift({
      ...notification,
      id: notification.id || Date.now(),
      read: false,
      timestamp: new Date().toISOString()
    });

    if (history.length > 50) history.pop();

    storageService.setItem(NOTIFICATION_HISTORY_KEY, history);
  } catch (e) {
    logger.error('Save history error', e);
  }
};

export const getNotificationHistory = (): NotificationHistoryEntry[] => {
  return storageService.getItem(NOTIFICATION_HISTORY_KEY) || [];
};

export const clearNotificationHistory = (): void => {
  storageService.removeItem(NOTIFICATION_HISTORY_KEY);
};

export const addNotificationClickListener = (callback?: (notification: unknown) => void): void => {
  if (Capacitor.getPlatform() === 'web') return;

  LocalNotifications.removeAllListeners();

  LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
    logger.log('Notifications: Clicked', notification);

    analyticsService.logNotificationTapped(
      (notification as { notification?: { extra?: { type?: string; prayer?: string } } })?.notification?.extra?.type || 'unknown',
      (notification as { notification?: { extra?: { type?: string; prayer?: string } } })?.notification?.extra?.prayer || null
    );

    if (callback) callback(notification);
  });

  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    logger.log('Notification received in foreground:', notification);
  });
};

export const initializeSmartNotifications = async (options: {
  prayerTimes?: Record<string, string>;
  currentStreak?: number;
} = {}): Promise<void> => {
  const { prayerTimes, currentStreak } = options;

  logger.log('Notifications: Initializing smart notifications');

  await createNotificationChannels();

  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    logger.log('Notifications: Permission not granted yet, skipping startup scheduling');
    return;
  }

  const prefs = getNotificationPreferences();

  if (prayerTimes && prefs.prayer) {
    await schedulePrayerNotifications(prayerTimes);
  }

  if (currentStreak && prefs.streak) {
    await scheduleStreakNotifications(currentStreak);
  }

  if (prefs.reminder) {
    await scheduleDailyReminders();
  }

  if (prefs.winback) {
    await scheduleWinbackNotifications();
  }

  logger.log('Notifications: Smart notifications initialized');
};

export default {
  requestNotificationPermission,
  schedulePrayerNotifications,
  scheduleStreakNotifications,
  scheduleDailyReminders,
  scheduleWinbackNotifications,
  showInstantNotification,
  showStickyNotification,
  cancelStickyNotification,
  cancelNotificationsByType,
  cancelAllNotifications,
  addNotificationClickListener,
  initializeSmartNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  buildWinbackNotifications,
  getNotificationHistory,
  clearNotificationHistory,
  NOTIFICATION_CHANNELS
};
