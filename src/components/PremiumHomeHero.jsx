import { memo, useEffect, useState } from 'react';
import { Check, Flame, MapPin, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { gregorianToHijri, HIJRI_MONTHS } from '../services/hijriService';

const HIJRI_MONTH_KEYS = ['muharram', 'safar', 'rabi1', 'rabi2', 'jumada1', 'jumada2', 'rajab', 'shaban', 'ramadan', 'shawwal', 'dhul_qada', 'dhul_hijja'];

const PRAYERS = [
  { key: 'Fajr', nameKey: 'prayer.fajr' },
  { key: 'Sunrise', nameKey: 'prayer.sunrise' },
  { key: 'Dhuhr', nameKey: 'prayer.dhuhr' },
  { key: 'Asr', nameKey: 'prayer.asr' },
  { key: 'Maghrib', nameKey: 'prayer.maghrib' },
  { key: 'Isha', nameKey: 'prayer.isha' },
];

const PRAYER_NAME_FALLBACKS = {
  Fajr: 'İmsak',
  Sunrise: 'Güneş',
  Dhuhr: 'Öğle',
  Asr: 'İkindi',
  Maghrib: 'Akşam',
  Isha: 'Yatsı',
};

const parsePrayerTime = (timeStr) => {
  const match = typeof timeStr === 'string' ? timeStr.match(/^(\d{1,2}):(\d{2})/) : null;
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  return { hours, minutes };
};

const getPrayerTargetMs = (timings, nextPrayer, nowMs) => {
  const prayerTime = nextPrayer?.time || timings?.[nextPrayer?.key];
  const parsed = parsePrayerTime(prayerTime);
  if (!parsed) return null;

  const target = new Date(nowMs);
  target.setHours(parsed.hours, parsed.minutes, 0, 0);

  // If target time has already passed today, it must be for tomorrow.
  // This avoids freezing at 00:00:00 if isTomorrow is missing or delayed.
  if (target.getTime() < nowMs) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime();
};

const getStoredLocationName = () => {
  try {
    const raw = localStorage.getItem('location_last_coords');
    if (!raw) return '';

    const parsed = JSON.parse(raw);
    const storedName = typeof parsed?.locationName === 'string' ? parsed.locationName.trim() : '';
    if (!storedName || storedName === 'Konum' || storedName === 'Konum...') return '';

    return storedName;
  } catch {
    return '';
  }
};

const isTrustworthyLocationName = (value) => {
  const candidate = typeof value === 'string' ? value.trim() : '';
  return Boolean(candidate && candidate !== 'Konum' && candidate !== 'Konum...');
};

const getDisplayLocationName = (locationName) => {
  const candidate = typeof locationName === 'string' ? locationName.trim() : '';
  if (isTrustworthyLocationName(candidate)) return candidate;

  const storedName = getStoredLocationName();
  return isTrustworthyLocationName(storedName) ? storedName : '';
};

const PremiumHomeHero = memo(({ 
  timings, 
  nextPrayer, 
  locationName, 
  weather, 
  streakData, 
  onSelectFeature
}) => {
  const { t, i18n } = useTranslation();
  const [nowMs, setNowMs] = useState(() => Date.now());

  const [completedPrayers, setCompletedPrayers] = useState(() => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem('huzur_completed_prayers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          return parsed.completed || {};
        }
      }
      return {};
    } catch {
      return {};
    }
  });

  const togglePrayer = (prayerKey) => {
    try {
      const today = new Date().toDateString();
      const nextCompleted = { ...completedPrayers, [prayerKey]: !completedPrayers[prayerKey] };
      localStorage.setItem('huzur_completed_prayers', JSON.stringify({
        date: today,
        completed: nextCompleted
      }));
      setCompletedPrayers(nextCompleted);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const syncNow = () => setNowMs(Date.now());
    syncNow();

    const interval = window.setInterval(() => {
      syncNow();
    }, 1000);

    document.addEventListener('visibilitychange', syncNow);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', syncNow);
    };
  }, []);

  const getPrayerName = (key) => t(`prayer.${String(key || '').toLowerCase()}`, PRAYER_NAME_FALLBACKS[key] || key);
  const targetTime = nextPrayer?.time || timings?.[nextPrayer?.key];
  const targetMs = getPrayerTargetMs(timings, nextPrayer, nowMs);
  const remainingMs = targetMs ? Math.max(0, targetMs - nowMs) : 0;
  const hasTime = Boolean(targetTime && targetMs);
  const hours = hasTime ? Math.floor(remainingMs / 3600000) : 0;
  const minutes = hasTime ? Math.floor((remainingMs % 3600000) / 60000) : 0;
  const seconds = hasTime ? Math.floor((remainingMs % 60000) / 1000) : 0;
  const formatNum = (value) => String(value).padStart(2, '0');
  const displayLocationName = getDisplayLocationName(locationName);
  const hasTrustedLocation = Boolean(displayLocationName);
  // Sunrise marks the end of Fajr time; it is shown in the strip but is not a prayer to mark as performed.
  const DAILY_PRAYERS = PRAYERS.filter((p) => p.key !== 'Sunrise');
  const completedCount = DAILY_PRAYERS.filter((p) => completedPrayers[p.key]).length;

  const hijriLabel = (() => {
    try {
      const locale = String(i18n?.language || 'tr').split('-')[0];
      // Some Android WebViews compute the islamic calendar but lack its month names and print
      // Gregorian ones ("MÖ 05 Haziran 1448"). Read the numbers only and name the month ourselves.
      const formatter = new Intl.DateTimeFormat('en-u-ca-islamic', { day: 'numeric', month: 'numeric', year: 'numeric' });
      const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((p) => [p.type, p.value]));
      const fromIntl = formatter.resolvedOptions().calendar.startsWith('islamic')
        ? { day: Number(parts.day), month: Number(parts.month), year: parseInt(parts.year, 10) }
        : null;
      const hijri = fromIntl && fromIntl.month >= 1 && fromIntl.month <= 12 ? fromIntl : gregorianToHijri(new Date());
      const monthName = locale === 'tr'
        ? HIJRI_MONTHS[hijri.month - 1]
        : t(`calendar.hijriMonths.${HIJRI_MONTH_KEYS[hijri.month - 1]}`, HIJRI_MONTHS[hijri.month - 1]);
      return `${hijri.day} ${monthName} ${hijri.year}`;
    } catch {
      return '';
    }
  })();

  const countdownText = hasTime ? `${formatNum(hours)}:${formatNum(minutes)}:${formatNum(seconds)}` : '--:--:--';

  return (
    <section className="hz-card hz-card--brand hz-hero" aria-label={t('home.heroLabel', 'Namaz vakitleri')}>
      <div className="hz-hero__top">
        <span className="hz-hero__place">
          <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
          <span data-i18n-autolocalize="false">
            {hasTrustedLocation ? displayLocationName : t('prayer.locationRequired', 'Konum doğrulanıyor')}
          </span>
          {weather ? <span>· {Math.round(weather.temp || weather.temperature || 0)}°C</span> : null}
        </span>
        <span className="hz-hero__streak">
          <Flame size={14} strokeWidth={1.75} aria-hidden="true" />
          {streakData?.current > 0
            ? `${streakData.current} ${t('streak.days', 'Gün')}`
            : t('home.heroStartStreak', 'Seriye bugün başla')}
        </span>
      </div>

      {hijriLabel ? <div className="hz-overline hz-hero__hijri">{hijriLabel}</div> : null}
      <h2 className="hz-hero__title">
        {hasTrustedLocation && nextPrayer
          ? t('prayer.nextLabel', { prayer: getPrayerName(nextPrayer.key), defaultValue: `${getPrayerName(nextPrayer.key)} vaktine kalan` })
          : t('prayer.locationRequiredDetail', 'Vakitleri göstermek için konumunuzu doğrulayın')}
      </h2>

      {hasTrustedLocation && nextPrayer ? (
        <div className="hz-hero__count" data-testid="prayer-countdown">
          <span className="hz-countdown" role="timer" aria-label={t('home.timeLeft', { time: countdownText, defaultValue: `Kalan süre ${countdownText}` })}>
            {countdownText}
          </span>
          <button type="button" className="hz-hero__mode" onClick={() => onSelectFeature && onSelectFeature('huzurMode', 'home_hero')}>
            <Moon size={14} strokeWidth={1.75} aria-hidden="true" />
            {t('menu.huzurMode', 'Huzur Modu')}
          </button>
        </div>
      ) : null}

      {hasTrustedLocation ? (
        <>
          <div className="hz-strip" role="list" aria-label={t('home.todayTimes', 'Bugünün namaz vakitleri')}>
            {PRAYERS.map((prayer) => {
              const isNext = nextPrayer?.key === prayer.key;
              const isDone = Boolean(completedPrayers[prayer.key]);
              const name = t(prayer.nameKey, PRAYER_NAME_FALLBACKS[prayer.key]);
              if (prayer.key === 'Sunrise') {
                return (
                  <div key={prayer.key} role="listitem" className={`hz-strip__cell${isNext ? ' hz-strip__cell--next' : ''}`} aria-current={isNext ? 'true' : undefined}>
                    <span className="hz-strip__name">{name}</span>
                    <span className="hz-strip__time">{timings?.[prayer.key]?.substring(0, 5) || '--:--'}</span>
                    <span className="hz-strip__mark" aria-hidden="true" />
                  </div>
                );
              }
              return (
                <button
                  key={prayer.key}
                  type="button"
                  role="listitem"
                  className={`hz-strip__cell${isNext ? ' hz-strip__cell--next' : ''}${isDone ? ' is-done' : ''}`}
                  aria-current={isNext ? 'true' : undefined}
                  aria-pressed={isDone}
                  aria-label={`${name} ${timings?.[prayer.key]?.substring(0, 5) || ''}${isDone ? `, ${t('home.prayed', 'kılındı')}` : ''}`}
                  onClick={() => togglePrayer(prayer.key)}
                >
                  <span className="hz-strip__name">{name}</span>
                  <span className="hz-strip__time">{timings?.[prayer.key]?.substring(0, 5) || '--:--'}</span>
                  <span className="hz-strip__mark" aria-hidden="true">{isDone ? <Check size={12} strokeWidth={2.5} /> : null}</span>
                </button>
              );
            })}
          </div>
          <div className="hz-hero__progress">
            {t('home.prayedCount', { done: completedCount, total: DAILY_PRAYERS.length, defaultValue: `Bugün ${completedCount}/${DAILY_PRAYERS.length} vakit kılındı · işaretlemek için dokun` })}
          </div>
        </>
      ) : null}
    </section>
  );
});

PremiumHomeHero.displayName = 'PremiumHomeHero';

export default PremiumHomeHero;
