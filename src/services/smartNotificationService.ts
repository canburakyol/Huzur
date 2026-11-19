import { LocalNotifications, type ScheduleEvery } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { storageService } from './storageService';
import i18n from '../i18n';
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
  slot: 'morning' | 'afternoon' | 'evening';
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
    every?: ScheduleEvery;
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

// Copy is read through getters so notifications use the language active at scheduling time.
const nt = (key: string, fallback: string): string => i18n.t(`notify.${key}`, { defaultValue: fallback });

const prayerPre = (prayer: string, title: string, body: string, minutesBefore: number): PrayerNotificationConfig => ({
  get title() { return nt(`pre.${prayer}.title`, title); },
  get body() { return nt(`pre.${prayer}.body`, body); },
  minutesBefore
});

const PRAYER_NOTIFICATIONS: Record<string, PrayerNotificationConfig> = {
  Fajr: prayerPre('Fajr', '🌅 Sabah namazı yaklaşıyor', 'Güne bereketle başla. Sabah namazı vakti yaklaşıyor.', 15),
  Sunrise: prayerPre('Sunrise', '☀️ Güneş doğuyor', 'Güneş doğmak üzere; sabah namazının vakti çıkıyor.', 5),
  Dhuhr: prayerPre('Dhuhr', '🕌 Öğle namazı yaklaşıyor', 'Öğle namazı vakti yaklaşıyor. Namaz için kısa bir mola ver.', 15),
  Asr: prayerPre('Asr', '🌤️ İkindi namazı yaklaşıyor', 'İkindi vakti geliyor. Günün işine namaz için ara ver.', 15),
  Maghrib: prayerPre('Maghrib', '🌇 Akşam namazı yaklaşıyor', 'Güneş batmak üzere, akşam namazı vakti yaklaşıyor.', 10),
  Isha: prayerPre('Isha', '🌙 Yatsı namazı yaklaşıyor', 'Yatsı vakti geliyor. Günü namazla tamamla.', 15)
};

const STREAK_NOTIFICATIONS: StreakNotificationConfig[] = [
  {
    get title() { return nt('streak.evening.title', 'Bugün tek bir adım yeterli'); },
    get body() { return nt('streak.evening.body', '{days} günlük ritmini korumak için Huzur\'a kısa bir dönüş yapabilirsin.'); },
    hour: 20,
    minute: 0
  },
  {
    get title() { return nt('streak.late.title', 'Günü sakin bir adımla tamamla'); },
    get body() { return nt('streak.late.body', 'Bugün tek bir küçük adım bile ritmi yeniden canlandırabilir.'); },
    hour: 23,
    minute: 0
  }
];

const reminder = (id: string, title: string, body: string, slot: DailyReminderConfig['slot'], fallbackHour: number): DailyReminderConfig => ({
  id,
  get title() { return nt(`daily.${id}.title`, title); },
  get body() { return nt(`daily.${id}.body`, body); },
  slot,
  fallbackHour,
  minute: 0,
});

const DAILY_REMINDERS: DailyReminderConfig[] = [
  reminder('zikir_morning', '📿 Günlük zikir', 'Bugünkü zikrini yaptın mı?', 'morning', 10),
  reminder('quran_afternoon', "📖 Kur'an okuma vakti", "Günlük Kur'an okuma hedefini tamamlamak için güzel bir an.", 'afternoon', 14),
  reminder('tasks_evening', '✅ Günlük görevler', 'Bugünkü ibadet görevlerini tamamladın mı?', 'evening', 18),
];

const WINBACK_CAMPAIGN_ID = 'winback_reactivation_v1';

const winback = (id: number, delayDays: number, lifecycleStage: string, key: string, title: string, body: string): WinbackNotificationConfig => ({
  id,
  delayDays,
  lifecycleStage,
  get title() { return nt(`winback.${key}.title`, title); },
  get body() { return nt(`winback.${key}.body`, body); }
});

export const WINBACK_NOTIFICATIONS: WinbackNotificationConfig[] = [
  winback(3100, 3, 'cooling_2_4d', 'd3', 'Bugün ritmi tazele', 'Büyük bir hedef gerekmez. Huzur\'da tek küçük adım günün akışına yetebilir.'),
  winback(3101, 7, 'comeback_5_13d', 'd7', 'Yavaşça geri dön', 'Ara vermiş olman normal. Bugün sadece sakin bir başlangıç yapabilirsin.'),
  winback(3102, 14, 'dormant_14d_plus', 'd14', 'Sıfırdan başlamak serbest', 'Eski ritmi yakalamaya çalışmadan, bugün yeni ve hafif bir adım seçebilirsin.')
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
      title: id === 'ramadan' ? nt('variant.ramadanTitle', '🌙 Ramazan vakti yaklaşıyor') : `⏰ ${baseTitle}`,
      body: id === 'friday'
        ? nt('variant.fridayBody', 'Cuma gününün bereketi için kısa bir hazırlık yap.')
        : `${baseBody} ${nt('variant.intentionSuffix', 'Şimdi niyetlenmek için güzel bir an.')}`
    },
    C: {
      title: id === 'kandil' ? nt('variant.kandilTitle', '🕯️ Manevi hatırlatma') : `✨ ${baseTitle}`,
      body: `${baseBody} ${nt('variant.breakSuffix', 'Huzur için küçük bir mola ver.')}`
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

// Prayer IDs live in their own range: day-of-month * 100 used to collide with streak (1000+),
// the sticky counter (1001), daily reminders (2000+) and winback (3100+) on the 10th, 20th and 31st.
const PRAYER_NOTIFICATION_ID_BASE = 50000;
export const prayerNotificationId = (day: Date, index: number, isPre: boolean): number =>
  PRAYER_NOTIFICATION_ID_BASE + day.getDate() * 100 + (isPre ? 50 : 0) + index;

// "05:12 (+03)" and "05:12" both become [5, 12].
const parsePrayerClock = (value: string): [number, number] | null => {
  const [hours, minutes] = String(value || '').trim().split(' ')[0].split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? [hours, minutes] : null;
};

export type UpcomingPrayerDay = { date: Date; timings: Record<string, string> };

export const schedulePrayerNotifications = async (
  prayerTimes: Record<string, string>,
  date: Date = new Date(),
  upcomingDays: UpcomingPrayerDay[] = []
): Promise<void> => {
  const prefs = getNotificationPreferences();
  if (!prefs.prayer || !prayerTimes) return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  // Clear what an earlier run (maybe with the old colliding IDs) left behind before rescheduling.
  await cancelNotificationsByType('prayer');

  const notifications: ScheduledNotification[] = [];
  const campaign = getActiveCampaign(date);
  analyticsService.logCampaignResolved(campaign.id, campaign.region, campaign.variant);
  const pushVariant = getExperimentVariant('push_copy_v1');
  analyticsService.logExperimentAssigned('push_copy_v1', pushVariant, 'schedule_prayer_notifications');
  const prayerNames: Record<string, string> = {
    Fajr: nt('names.Fajr', 'Sabah'),
    Sunrise: nt('names.Sunrise', 'Güneş'),
    Dhuhr: nt('names.Dhuhr', 'Öğle'),
    Asr: nt('names.Asr', 'İkindi'),
    Maghrib: nt('names.Maghrib', 'Akşam'),
    Isha: nt('names.Isha', 'Yatsı')
  };

  // Today plus the next days from the monthly cache, so a day without opening the app is still covered.
  const days: UpcomingPrayerDay[] = [{ date, timings: prayerTimes }, ...upcomingDays];

  for (const day of days) {
  for (const [index, [prayer, config]] of Object.entries(PRAYER_NOTIFICATIONS).entries()) {
    const clock = parsePrayerClock(day.timings?.[prayer]);
    if (!clock) continue;

    const prayerTime = new Date(day.date);
    prayerTime.setHours(clock[0], clock[1], 0, 0);

    // Sunrise ends the Fajr time and is not a prayer time; only its heads-up below is sent.
    if (prayer !== 'Sunrise' && prayerTime > new Date()) {
      if (!shouldScheduleAt(prayerTime, prefs, 'prayer_main')) continue;

      const campaignCopy = resolveCampaignCopy({
        campaign,
        type: 'reminder',
        fallbackTitle: `${nt('main.titlePrefix', 'Ezan vakti')}: ${prayerNames[prayer] || prayer}`,
        fallbackBody: nt('main.body', 'Vakit girdi. Haydi namaza!')
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
            timings: day.timings,
            dailyContent: { campaignId: campaign.id },
            locationName: '',
            nextPrayer: { key: prayer, name: prayerNames[prayer] || prayer },
          }),
      });

      notifications.push({
        id: prayerNotificationId(day.date, index, false),
        title: variantCopy.title,
        body: variantCopy.body,
        schedule: {
          at: prayerTime,
          allowWhileIdle: true
        },
        sound: NOTIFICATION_CHANNELS.PRAYER.sound ?? undefined,
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
              timings: day.timings,
              dailyContent: { campaignId: campaign.id },
              locationName: '',
              nextPrayer: { key: prayer, name: prayerNames[prayer] || prayer },
            }),
        });

        notifications.push({
          id: prayerNotificationId(day.date, index, true),
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
        : i18n.t('notify.recovery.eveningTitle', { title: recoveryPlan.notificationTitle, defaultValue: '{{title}} - akşam' })
      : config.title;
    const personalizedBody = recoveryPlan
      ? index === 0
        ? i18n.t('notify.recovery.streakBody', { body: recoveryPlan.notificationBody, days: currentStreak, defaultValue: '{{body}} {{days}} günlük zincirini yavaşça sürdürebilirsin.' })
        : i18n.t('notify.recovery.eveningBody', { description: recoveryPlan.description, defaultValue: '{{description}} Bugün kısa bir dönüş bile yeterli.' })
      : config.body.replace('{days}', String(currentStreak));

    notifications.push({
      id: 1000 + index,
      title: personalizedTitle || config.title,
      body: personalizedBody || config.body.replace('{days}', String(currentStreak)),
      schedule: {
        at: scheduleTime,
        allowWhileIdle: true
      },
      sound: NOTIFICATION_CHANNELS.STREAK.sound ?? undefined,
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
        sound: NOTIFICATION_CHANNELS.REMINDER.sound ?? undefined,
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

export const buildWinbackNotifications = (now: Date = new Date(), prefs: NotificationPreferences = getNotificationPreferences()): ScheduledNotification[] => {
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

const saveToHistory = (notification: Omit<NotificationHistoryEntry, 'timestamp'>): void => {
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
  upcomingPrayerDays?: UpcomingPrayerDay[];
  currentStreak?: number;
} = {}): Promise<void> => {
  const { prayerTimes, upcomingPrayerDays = [], currentStreak } = options;

  logger.log('Notifications: Initializing smart notifications');

  await createNotificationChannels();

  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    logger.log('Notifications: Permission not granted yet, skipping startup scheduling');
    return;
  }

  const prefs = getNotificationPreferences();

  if (prayerTimes && prefs.prayer) {
    await schedulePrayerNotifications(prayerTimes, new Date(), upcomingPrayerDays);
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
