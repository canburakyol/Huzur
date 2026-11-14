import { memo, useEffect, useState } from 'react';
import { CloudSun, Flame, Moon, Sun, SunDim, Sunrise, Sunset, Check, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

const GET_TURKISH_SUFFIX = (timeStr) => {
  const parsed = parsePrayerTime(timeStr);
  if (!parsed) return '';

  const { hours, minutes } = parsed;
  if (minutes === 0) {
    if ([3, 4, 5, 13, 14, 15, 23].includes(hours)) return "'te";
    if ([1, 2, 7, 8, 11, 12, 17, 18, 21, 22].includes(hours)) return "'de";
    return "'da";
  }

  const lastDigit = minutes % 10;
  if (lastDigit === 0) {
    if (minutes === 20 || minutes === 50) return "'de";
    if (minutes === 40) return "'ta";
    return "'da";
  }

  if ([3, 4, 5].includes(lastDigit)) return "'te";
  if ([1, 2, 7, 8].includes(lastDigit)) return "'de";
  return "'da";
};

const GET_PRAYER_ICON = (key, size = 14) => {
  switch (key) {
    case 'Fajr':
      return <Sunrise size={size} />;
    case 'Sunrise':
      return <SunDim size={size} />;
    case 'Dhuhr':
      return <Sun size={size} />;
    case 'Asr':
      return <CloudSun size={size} />;
    case 'Maghrib':
      return <Sunset size={size} />;
    case 'Isha':
      return <Moon size={size} />;
    default:
      return <Sun size={size} />;
  }
};

const GET_AMBIENT_VARIABLES = (nextPrayerKey) => {
  const semanticTheme = {
    '--hero-card-bg': 'linear-gradient(135deg, var(--primary-container), var(--surface-container-low))',
    '--hero-card-border': '1px solid var(--card-border)',
    '--hero-mosque-sun': 'var(--tertiary)',
    '--hero-mosque-back-hill': 'var(--secondary-container)',
    '--hero-mosque-mid-hill': 'var(--secondary)',
    '--hero-mosque-fore-hill': 'var(--primary)',
    '--hero-mosque-structure': 'var(--primary)',
    '--hero-mosque-accent': 'var(--on-primary-container)',
    '--hero-mosque-glow': 'var(--tertiary-container)',
    '--hero-countdown-color': 'var(--tertiary)',
    '--hero-seconds-color': 'var(--on-surface-variant)',
    '--text-primary': 'var(--on-surface)',
    '--text-secondary': 'var(--on-surface-variant)',
    '--text-muted': 'color-mix(in srgb, var(--on-surface) 55%, transparent)',
    '--text-heading': 'var(--primary)',
    '--text-body': 'var(--on-surface-variant)',
  };

  switch (nextPrayerKey) {
    case 'Fajr': // Sıradaki İmsak (Şu an Yatsı/Gece vaktindeyiz)
      return { ...semanticTheme,
        '--hero-card-bg': 'linear-gradient(135deg, var(--surface-dim) 0%, var(--inverse-surface) 100%)',
        '--hero-card-border': '1px solid color-mix(in srgb, var(--inverse-on-surface) 8%, transparent)',
        '--hero-mosque-sun': 'var(--inverse-on-surface)',
        '--hero-mosque-back-hill': 'var(--surface-container-highest)',
        '--hero-mosque-mid-hill': 'var(--surface-container-high)',
        '--hero-mosque-fore-hill': 'var(--surface-dim)',
        '--hero-mosque-structure': 'var(--surface-container-high)',
        '--hero-mosque-accent': 'var(--outline)',
        '--hero-mosque-glow': 'var(--tertiary-container)',
        '--hero-countdown-color': 'var(--tertiary)',
        '--hero-seconds-color': 'var(--tertiary-fixed-dim)',
        '--text-primary': 'var(--on-primary)',
        '--text-secondary': 'var(--inverse-on-surface)',
        '--text-muted': 'color-mix(in srgb, var(--inverse-on-surface) 45%, transparent)',
        '--text-heading': 'var(--on-primary)',
        '--text-body': 'var(--inverse-on-surface)',
      };
    case 'Sunrise': // Sıradaki Güneş (Şu an Sabah/İmsak vaktindeyiz - Şafak)
      return { ...semanticTheme,
        '--hero-card-bg': 'linear-gradient(135deg, var(--primary-container) 0%, var(--secondary-container) 50%, var(--inverse-surface) 100%)',
        '--hero-card-border': '1px solid color-mix(in srgb, var(--secondary) 15%, transparent)',
        '--hero-mosque-sun': 'var(--tertiary-fixed-dim)',
        '--hero-mosque-back-hill': 'var(--primary-container)',
        '--hero-mosque-mid-hill': 'var(--on-primary-fixed-variant)',
        '--hero-mosque-fore-hill': 'var(--on-primary-fixed)',
        '--hero-mosque-structure': 'var(--on-primary-fixed-variant)',
        '--hero-mosque-accent': 'var(--secondary)',
        '--hero-mosque-glow': 'var(--tertiary-container)',
        '--hero-countdown-color': 'var(--tertiary)',
        '--hero-seconds-color': 'var(--inverse-on-surface)',
        '--text-primary': 'var(--on-primary)',
        '--text-secondary': 'var(--inverse-on-surface)',
        '--text-muted': 'color-mix(in srgb, var(--inverse-on-surface) 40%, transparent)',
        '--text-heading': 'var(--on-primary)',
        '--text-body': 'var(--inverse-on-surface)',
      };
    case 'Dhuhr': // Sıradaki Öğle (Şu an Sabah/Güneş vaktindeyiz - Kuşluk)
      return { ...semanticTheme,
        '--hero-card-bg': 'linear-gradient(135deg, var(--surface-bright) 0%, var(--surface-container-low) 100%)',
        '--hero-card-border': '1px solid color-mix(in srgb, var(--secondary) 18%, transparent)',
        '--hero-mosque-sun': 'var(--tertiary)',
        '--hero-mosque-back-hill': 'var(--secondary-fixed)',
        '--hero-mosque-mid-hill': 'var(--secondary-fixed-dim)',
        '--hero-mosque-fore-hill': 'var(--secondary)',
        '--hero-mosque-structure': 'var(--secondary)',
        '--hero-mosque-accent': 'var(--on-secondary-fixed-variant)',
        '--hero-mosque-glow': 'var(--tertiary-container)',
        '--hero-countdown-color': 'var(--tertiary)',
        '--hero-seconds-color': 'var(--tertiary-fixed-dim)',
        '--text-primary': 'var(--on-surface)',
        '--text-secondary': 'var(--on-surface-variant)',
        '--text-muted': 'color-mix(in srgb, var(--on-surface) 60%, transparent)',
        '--text-heading': 'var(--primary)',
        '--text-body': 'var(--on-surface-variant)',
      };
    case 'Asr': // Sıradaki İkindi (Şu an Öğle vaktindeyiz)
      return { ...semanticTheme,
        '--hero-card-bg': 'linear-gradient(135deg, var(--primary-fixed) 0%, var(--secondary-fixed) 100%)',
        '--hero-card-border': '1px solid color-mix(in srgb, var(--secondary) 18%, transparent)',
        '--hero-mosque-sun': 'var(--tertiary)',
        '--hero-mosque-back-hill': 'var(--secondary-fixed)',
        '--hero-mosque-mid-hill': 'var(--secondary-fixed-dim)',
        '--hero-mosque-fore-hill': 'var(--secondary)',
        '--hero-mosque-structure': 'var(--secondary)',
        '--hero-mosque-accent': 'var(--on-secondary-fixed-variant)',
        '--hero-mosque-glow': 'var(--tertiary-container)',
        '--hero-countdown-color': 'var(--tertiary)',
        '--hero-seconds-color': 'var(--tertiary-fixed-dim)',
        '--text-primary': 'var(--on-surface)',
        '--text-secondary': 'var(--on-surface-variant)',
        '--text-muted': 'color-mix(in srgb, var(--on-surface) 60%, transparent)',
        '--text-heading': 'var(--primary)',
        '--text-body': 'var(--on-surface-variant)',
      };
    case 'Maghrib': // Sıradaki Akşam (Şu an İkindi vaktindeyiz - Gün Batımı)
      return { ...semanticTheme,
        '--hero-card-bg': 'linear-gradient(135deg, var(--tertiary-container) 0%, var(--tertiary-fixed) 100%)',
        '--hero-card-border': '1px solid color-mix(in srgb, var(--tertiary) 25%, transparent)',
        '--hero-mosque-sun': 'var(--tertiary)',
        '--hero-mosque-back-hill': 'var(--tertiary-fixed)',
        '--hero-mosque-mid-hill': 'var(--tertiary-fixed-dim)',
        '--hero-mosque-fore-hill': 'var(--tertiary)',
        '--hero-mosque-structure': 'var(--tertiary)',
        '--hero-mosque-accent': 'var(--on-tertiary-fixed-variant)',
        '--hero-mosque-glow': 'var(--tertiary-container)',
        '--hero-countdown-color': 'var(--tertiary)',
        '--hero-seconds-color': 'var(--inverse-on-surface)',
        '--text-primary': 'var(--on-surface)',
        '--text-secondary': 'var(--on-tertiary-container)',
        '--text-muted': 'color-mix(in srgb, var(--on-surface) 60%, transparent)',
        '--text-heading': 'var(--primary)',
        '--text-body': 'var(--on-tertiary-container)',
      };
    case 'Isha': // Sıradaki Yatsı (Şu an Akşam vaktindeyiz - Alacakaranlık)
      return { ...semanticTheme,
        '--hero-card-bg': 'linear-gradient(135deg, var(--tertiary) 0%, var(--inverse-surface) 50%, var(--surface-dim) 100%)',
        '--hero-card-border': '1px solid color-mix(in srgb, var(--outline) 20%, transparent)',
        '--hero-mosque-sun': 'var(--tertiary)',
        '--hero-mosque-back-hill': 'var(--outline)',
        '--hero-mosque-mid-hill': 'var(--surface-container-highest)',
        '--hero-mosque-fore-hill': 'var(--surface-dim)',
        '--hero-mosque-structure': 'var(--surface-container-highest)',
        '--hero-mosque-accent': 'var(--outline)',
        '--hero-mosque-glow': 'var(--tertiary-container)',
        '--hero-countdown-color': 'var(--tertiary)',
        '--hero-seconds-color': 'var(--tertiary-fixed-dim)',
        '--text-primary': 'var(--on-primary)',
        '--text-secondary': 'var(--inverse-on-surface)',
        '--text-muted': 'color-mix(in srgb, var(--inverse-on-surface) 45%, transparent)',
        '--text-heading': 'var(--on-primary)',
        '--text-body': 'var(--inverse-on-surface)',
      };
    default:
      return {};
  }
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
  const completedCount = PRAYERS.filter((p) => completedPrayers[p.key]).length;
  const ringRadius = 14;
  const ringCircumference = 2 * Math.PI * ringRadius;

  const hijriLabel = (() => {
    try {
      const locale = String(i18n?.language || 'tr').split('-')[0];
      return new Intl.DateTimeFormat(`${locale}-u-ca-islamic`, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
    } catch {
      return '';
    }
  })();

  const ambientStyle = GET_AMBIENT_VARIABLES(nextPrayer?.key);

  return (
    <section 
      className="skeuo-card hero-card relative overflow-hidden"
      style={ambientStyle}
    >
      {/* Background Arabesque Texture */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }}
      ></div>

      {/* Background Calligraphy Glow */}
      <div style={{
          position: 'absolute',
          top: '-16px',
          right: '-16px',
          fontSize: '90px',
          color: 'rgba(255,255,255,0.035)',
          fontFamily: 'Amiri, serif',
          pointerEvents: 'none',
          transform: 'rotate(-15deg)',
          zIndex: 0
      }}>الله</div>

      <div className="relative z-10 flex flex-col w-full text-start">
        {/* Header: Location + Streak */}
        <div className="hero-header-row">
          <div className="hero-location">
            <MapPin size={13} style={{ opacity: 0.85 }} />
            <span className="hero-location-text" data-i18n-autolocalize="false">
              {hasTrustedLocation
                ? displayLocationName
                : t('prayer.locationRequired', 'Konum doğrulanıyor')}
            </span>
            {weather && (
              <span className="hero-weather-text">
                • {Math.round(weather.temp || weather.temperature || 0)}°C
              </span>
            )}
          </div>
          <div className="hero-header-right">
          {streakData?.current > 0 ? (
            <div className="hero-streak-badge">
              <Flame size={12} color="#FF9966" fill="#FF9966" />
              <span>{streakData.current} {t('streak.days', 'Gün')}</span>
            </div>
          ) : (
            <div className="hero-streak-empty">
              <Flame size={12} />
              <span>{t('home.heroStartStreak', 'Seriye bugün başla')}</span>
            </div>
          )}
          {hasTrustedLocation && (
            <div
              className="hero-progress-ring"
              title={t('home.heroProgressDone', { done: completedCount, total: PRAYERS.length, defaultValue: `${completedCount}/${PRAYERS.length} vakit` })}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
                <circle cx="18" cy="18" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3.5" />
                <circle
                  cx="18" cy="18" r={ringRadius} fill="none" stroke="#e8c37a" strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringCircumference * (1 - completedCount / PRAYERS.length)}
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <span className="hero-progress-count">{completedCount}/{PRAYERS.length}</span>
            </div>
          )}
          </div>
        </div>

        {/* Main Content: Greeting + Countdown */}
        <div className="hero-main-display">
          <h2 className="hero-greeting-text">
            {hasTrustedLocation && nextPrayer
              ? t(`prayer.nextLabel`, { prayer: getPrayerName(nextPrayer.key), defaultValue: `${getPrayerName(nextPrayer.key)} Vakti` })
              : t('prayer.locationRequiredDetail', 'Vakitleri göstermek için konumunuzu doğrulayın')}
          </h2>
          {hijriLabel && (
            <div className="hero-hijri-text">{hijriLabel}</div>
          )}

          {hasTrustedLocation && nextPrayer && (
            <div
              className="hero-countdown-container"
              data-testid="prayer-countdown"
            >
              <div className="countdown-display">
                <div className="countdown-unit">
                  <span key={`hours-${hours}`} className="unit-value">{hasTime ? formatNum(hours) : '--'}</span>
                  <span className="unit-label">{t('countdown.hours', 'SAAT')}</span>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-unit">
                  <span key={`minutes-${minutes}`} className="unit-value">{hasTime ? formatNum(minutes) : '--'}</span>
                  <span className="unit-label">{t('countdown.min', 'DK')}</span>
                </div>
                <span className="countdown-separator">:</span>
                <div className="countdown-unit">
                  <span key={`seconds-${seconds}`} className="unit-value">{hasTime ? formatNum(seconds) : '--'}</span>
                  <span className="unit-label">{t('countdown.sec', 'SN')}</span>
                </div>
              </div>

              <button 
                onClick={() => onSelectFeature && onSelectFeature('huzurMode', 'home_hero')}
                className="huzur-mode-hero-btn"
              >
                <Moon size={13} fill="currentColor" />
                <span>{t('menu.huzurMode', 'Huzur Modu')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Strip: Prayer Times */}
        <div className="prayer-strip-container">
          {hasTrustedLocation ? PRAYERS.map((prayer) => {
            const isActive = nextPrayer?.key === prayer.key;
            const isCompleted = completedPrayers[prayer.key];
            const timeStr = timings?.[prayer.key]?.substring(0, 5) || '--:--';

            return (
              <div
                key={prayer.key}
                onClick={() => togglePrayer(prayer.key)}
                className={`prayer-strip-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <span className="prayer-strip-name">
                  {t(prayer.nameKey, PRAYER_NAME_FALLBACKS[prayer.key])}
                </span>
                <span className="prayer-strip-time">
                  {timeStr}
                </span>
                {isActive && <div className="active-dot"></div>}
                {isCompleted && !isActive && <Check size={10} className="completed-check" />}
              </div>
            );
          }) : (
            <span className="prayer-strip-name" style={{ padding: '8px 0' }}>
              {t('prayer.locationRequiredDetail', 'Vakitleri göstermek için konumunuzu doğrulayın')}
            </span>
          )}
        </div>
      </div>
    </section>
  );
});

PremiumHomeHero.displayName = 'PremiumHomeHero';

export default PremiumHomeHero;
