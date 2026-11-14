import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/shared/PageHeader';
import { fetchMonthlyPrayerTimes } from '../../../services/prayerService';
import { logger } from '../../../utils/logger';

const hasCoordinates = (location) => Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude);

const Imsakiye = ({ onClose, locationName, location }) => {
  const { t } = useTranslation();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const available = hasCoordinates(location);
  const city = locationName && !['Konum', 'Konum...'].includes(locationName) ? locationName : 'Konum bilinmiyor';
  const country = t('countries.turkey', 'Turkey');
  const monthNames = t('calendar.months', { returnObjects: true, defaultValue: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'] });

  useEffect(() => {
    let cancelled = false;
    if (!available) {
      setDays([]); setSource(null); setError(t('imsakiye.locationRequired', 'İmsakiye için doğrulanmış konum gerekli.'));
      return () => { cancelled = true; };
    }
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const monthly = await fetchMonthlyPrayerTimes(location.latitude, location.longitude, city, country, new Date(currentYear, currentMonth, 1));
        if (!monthly?.timings?.length) throw new Error('Monthly prayer times unavailable');
        if (cancelled) return;
        setDays(monthly.timings.map((entry, index) => ({ gregorian: String(index + 1), times: entry.timings })));
        setSource(monthly.timings[0]?.meta?.method?.name || 'Hesaplandı');
      } catch (err) {
        logger.error('Imsakiye calculation error:', err);
        if (!cancelled) setError(t('imsakiye.errorCalculate', 'Namaz saatleri hesaplanamadı. Lütfen tekrar deneyin.'));
      } finally { if (!cancelled) setLoading(false); }
    };
    void load();
    return () => { cancelled = true; };
  }, [available, city, country, currentMonth, currentYear, location?.latitude, location?.longitude, t]);

  const changeMonth = (delta) => { const next = new Date(currentYear, currentMonth + delta, 1); setCurrentMonth(next.getMonth()); setCurrentYear(next.getFullYear()); };
  const cleanTime = (value) => value?.split(' ')[0] || '--:--';

  const today = new Date();
  const todayIndex = today.getMonth() === currentMonth && today.getFullYear() === currentYear ? String(today.getDate()) : null;
  const sourceLabel = source === 'Diyanet' ? 'Kaynak: Diyanet' : `${t('imsakiye.calculatedFor', 'Aynı konum için hesaplandı')} (${source})`;
  const cell = { padding: '8px 4px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' };

  return <div className="app-container hz-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <PageHeader
      title={t('menu.imsakiye')}
      subtitle={<>{city}{available ? `, ${country}` : ''}{source ? <> · <span>{sourceLabel}</span></> : null}</>}
      onBack={onClose}
    />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-4) var(--space-3)' }}>
      <button type="button" className="hz-iconbtn" aria-label={t('imsakiye.prevMonth', 'Önceki ay')} onClick={() => changeMonth(-1)}><ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" /></button>
      <span style={{ font: '600 19px/26px var(--font-display)' }}>{monthNames[currentMonth]} {currentYear}</span>
      <button type="button" className="hz-iconbtn" aria-label={t('imsakiye.nextMonth', 'Sonraki ay')} onClick={() => changeMonth(1)}><ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" /></button>
    </div>
    <div style={{ flex: 1, overflow: 'auto', padding: '0 var(--space-4) var(--space-5)' }}>
      {loading ? <div className="hz-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Loader className="spin" size={20} /> {t('common.loading')}</div>
        : error ? <div className="hz-card" style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</div>
        : <div className="hz-card" style={{ padding: 'var(--space-2)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', font: '500 14px/20px var(--font-sans)', color: 'var(--ink)' }}>
            <thead><tr style={{ font: '600 11px/14px var(--font-sans)', letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--ink-muted)' }}>
              <th style={cell}>{t('imsakiye.day', 'Gün')}</th><th style={cell}>{t('prayer.fajr')}</th><th style={cell}>{t('prayer.sunrise')}</th><th style={cell}>{t('prayer.dhuhr')}</th><th style={cell}>{t('prayer.asr')}</th><th style={cell}>{t('prayer.maghrib')}</th><th style={cell}>{t('prayer.isha')}</th>
            </tr></thead>
            <tbody>{days.map((day) => {
              const isToday = day.gregorian === todayIndex;
              return <tr key={day.gregorian} aria-current={isToday ? 'date' : undefined} style={{ background: isToday ? 'var(--brand-soft)' : undefined, color: isToday ? 'var(--brand-ink)' : undefined, fontWeight: isToday ? 700 : undefined, borderTop: '1px solid var(--line)' }}>
                <td style={cell}>{day.gregorian}</td><td style={cell}>{cleanTime(day.times.Fajr)}</td><td style={cell}>{cleanTime(day.times.Sunrise)}</td><td style={cell}>{cleanTime(day.times.Dhuhr)}</td><td style={cell}>{cleanTime(day.times.Asr)}</td><td style={cell}>{cleanTime(day.times.Maghrib)}</td><td style={cell}>{cleanTime(day.times.Isha)}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>}
    </div>
  </div>;
};
export default Imsakiye;
