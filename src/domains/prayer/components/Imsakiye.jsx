import { useState, useEffect } from 'react';
import { MapPin, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
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

  return <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '20px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <IslamicBackButton onClick={onClose} variant="light" />
      <div style={{ textAlign: 'center', color: 'var(--on-primary)' }}>
        <h2 style={{ margin: 0, fontSize: '22px' }}>📅 {t('menu.imsakiye')}</h2>
        <div style={{ fontSize: '12px', marginTop: '4px' }}><MapPin size={12} /> {city}{available ? `, ${country}` : ''}</div>
        {source && <div style={{ fontSize: '11px', marginTop: '4px' }}>Kaynak: {source === 'Diyanet' ? 'Diyanet' : `Aynı konum için hesaplandı (${source})`}</div>}
      </div><div style={{ width: '40px' }} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px' }}>
      <button aria-label="Önceki ay" onClick={() => changeMonth(-1)}><ChevronLeft size={20} /></button><span>{monthNames[currentMonth]} {currentYear}</span><button aria-label="Sonraki ay" onClick={() => changeMonth(1)}><ChevronRight size={20} /></button>
    </div>
    <div style={{ flex: 1, overflow: 'auto', padding: '0 10px 20px' }}>
      {loading ? <div><Loader className="spin" size={32} /> {t('common.loading')}</div> : error ? <div style={{ textAlign: 'center', color: '#e74c3c', padding: '40px' }}>{error}</div> : <table style={{ width: '100%' }}><thead><tr><th>Gün</th><th>{t('prayer.fajr')}</th><th>{t('prayer.sunrise')}</th><th>{t('prayer.dhuhr')}</th><th>{t('prayer.asr')}</th><th>{t('prayer.maghrib')}</th><th>{t('prayer.isha')}</th></tr></thead><tbody>{days.map((day) => <tr key={day.gregorian}><td>{day.gregorian}</td><td>{cleanTime(day.times.Fajr)}</td><td>{cleanTime(day.times.Sunrise)}</td><td>{cleanTime(day.times.Dhuhr)}</td><td>{cleanTime(day.times.Asr)}</td><td>{cleanTime(day.times.Maghrib)}</td><td>{cleanTime(day.times.Isha)}</td></tr>)}</tbody></table>}
    </div>
  </div>;
};
export default Imsakiye;
