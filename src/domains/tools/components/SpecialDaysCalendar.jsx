import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Moon, Sparkles, Star, Landmark, CalendarDays } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
import { parseLocalDate, religiousDays, toLocalDateKey, upcomingReligiousDays, RELIGIOUS_DAY_NAMES } from '../../../data/religiousDays';
import './SpecialDaysCalendar.css';

const KIND_GROUP = {
  regaib: 'kandil', mirac: 'kandil', berat: 'kandil', kadir: 'kandil', mevlid: 'kandil',
  ramazan: 'ramazan', ramazanArefe: 'ramazan',
  ramazanBayrami: 'bayram', kurbanBayrami: 'bayram',
  kurbanArefe: 'hac',
  hicriYilbasi: 'hicri', asure: 'hicri',
};

const GROUP_ICON = { kandil: Sparkles, ramazan: Moon, bayram: Star, hac: Landmark, hicri: CalendarDays };

const DAY_MS = 24 * 60 * 60 * 1000;

export function SpecialDaysCalendar({ onClose }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'tr';
  const today = new Date();
  const todayKey = toLocalDateKey(today);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(null);

  const nameOf = (day) => t(`religiousDayKinds.${day.kind}.name`, RELIGIOUS_DAY_NAMES[day.kind]);
  const descOf = (day) => t(`religiousDayKinds.${day.kind}.desc`, '');
  // round, not ceil: a DST day is 23 or 25 hours long
  const daysUntil = (key) => Math.round((parseLocalDate(key) - parseLocalDate(todayKey)) / DAY_MS);
  const dayLabel = (key) => {
    const n = daysUntil(key);
    return n === 0 ? t('specialDays.today', 'Bugün') : t('specialDays.daysLeft', { count: n, defaultValue: `${n} gün kaldı` });
  };

  const byDate = useMemo(() => {
    const map = new Map();
    for (const day of religiousDays) map.set(day.date, [...(map.get(day.date) || []), day]);
    return map;
  }, []);

  const upcoming = upcomingReligiousDays(today, 5);

  // Monday-first grid: getDay() is Sunday = 0, so shift by 6.
  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const lead = (first.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: count }, (_, i) => toLocalDateKey(new Date(month.getFullYear(), month.getMonth(), i + 1))),
    ];
  }, [month]);

  const weekdayNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i))); // 1 Jan 2024 is a Monday
  }, [locale]);

  const monthTitle = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(month);
  const longDate = (key) => new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseLocalDate(key));
  const shiftMonth = (delta) => { setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1)); setSelectedDate(null); };
  const selected = selectedDate ? byDate.get(selectedDate) || [] : [];

  const DayRow = ({ day, showDate }) => {
    const Icon = GROUP_ICON[KIND_GROUP[day.kind]];
    return (
      <div className="sd-row">
        <span className={`sd-row__icon sd-${KIND_GROUP[day.kind]}`}><Icon size={18} strokeWidth={1.75} aria-hidden="true" /></span>
        <span className="sd-row__text">
          <span className="sd-row__title">{nameOf(day)}</span>
          <span className="sd-row__meta">{showDate ? longDate(day.date) : descOf(day)}</span>
        </span>
        {showDate && <span className="sd-row__count">{dayLabel(day.date)}</span>}
      </div>
    );
  };

  return (
    <div className="hz-root sd-screen">
      <PageHeader title={t('specialDays.title', 'Dini Günler')} subtitle={t('specialDays.subtitle', 'Diyanet takvimine göre')} onBack={onClose} />
      <div className="sd-body">
        <section aria-labelledby="sd-upcoming">
          <h2 id="sd-upcoming" className="hz-overline sd-heading">{t('specialDays.upcoming', 'Yaklaşan günler')}</h2>
          <div className="hz-card sd-list">
            {upcoming.map((day) => <DayRow key={`${day.kind}-${day.date}`} day={day} showDate />)}
          </div>
        </section>

        <section className="hz-card sd-calendar" aria-label={monthTitle}>
          <div className="sd-cal-head">
            <button type="button" className="hz-iconbtn" onClick={() => shiftMonth(-1)} aria-label={t('specialDays.prevMonth', 'Önceki ay')}>
              <ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <h2 className="sd-cal-title">{monthTitle}</h2>
            <button type="button" className="hz-iconbtn" onClick={() => shiftMonth(1)} aria-label={t('specialDays.nextMonth', 'Sonraki ay')}>
              <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
          <div className="sd-grid" role="grid">
            {weekdayNames.map((name, i) => <span key={i} className="sd-weekday" aria-hidden="true">{name}</span>)}
            {cells.map((key, i) => {
              if (!key) return <span key={`e${i}`} />;
              const special = byDate.get(key);
              const classes = ['sd-day', key === todayKey && 'is-today', special && `is-special sd-${KIND_GROUP[special[0].kind]}`, key === selectedDate && 'is-selected'].filter(Boolean).join(' ');
              return special ? (
                <button key={key} type="button" className={classes} onClick={() => setSelectedDate(key)} aria-label={`${longDate(key)}: ${special.map(nameOf).join(', ')}`}>
                  {parseLocalDate(key).getDate()}
                </button>
              ) : (
                <span key={key} className={classes}>{parseLocalDate(key).getDate()}</span>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="sd-detail" aria-live="polite">
              <p className="hz-label">{longDate(selectedDate)}</p>
              {selected.map((day) => <DayRow key={day.kind} day={day} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default SpecialDaysCalendar;
