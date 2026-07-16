import { useEffect, useState } from 'react';
import { Calendar, CloudSun, Info, Minus, Moon, Plus, RotateCcw, Sparkles, Sun, Sunrise, Sunset, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { storageService } from '../../../services/storageService';
import '../../../styles/PracticePages.css';

const MISSED_PRAYER_CALC_KEY = 'missedPrayerCalc';
const MISSED_PRAYER_COUNTS_KEY = 'missedPrayerCounts';
const DEFAULT_COUNTS = Object.freeze({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 });
const normalizeCounts = (value) => Object.fromEntries(Object.keys(DEFAULT_COUNTS).map((key) => {
  const parsed = Number(value?.[key]);
  return [key, Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0];
}));

const MissedPrayers = ({ onClose }) => {
  const { t } = useTranslation();
  const savedCalc = storageService.getItem(MISSED_PRAYER_CALC_KEY, null);
  const [birthDate, setBirthDate] = useState(savedCalc?.birthDate || '');
  const [pubertyAge, setPubertyAge] = useState(savedCalc?.pubertyAge || 12);
  const [isCalculated, setIsCalculated] = useState(Boolean(savedCalc));
  const [missedCounts, setMissedCounts] = useState(() => normalizeCounts(storageService.getItem(MISSED_PRAYER_COUNTS_KEY, DEFAULT_COUNTS)));

  useEffect(() => {
    storageService.setItem(MISSED_PRAYER_COUNTS_KEY, missedCounts);
  }, [missedCounts]);

  const calculateMissed = () => {
    if (!birthDate) return;
    const birth = new Date(`${birthDate}T12:00:00`);
    const pubertyDate = new Date(birth.getFullYear() + Number(pubertyAge), birth.getMonth(), birth.getDate());
    const diffDays = Math.floor((Date.now() - pubertyDate.getTime()) / 86_400_000);
    if (diffDays <= 0) return;
    if (isCalculated && !window.confirm(t('missedPrayers.confirmRecalculate', 'Hesaplama yenilensin mi?'))) return;
    setMissedCounts(Object.fromEntries(Object.keys(DEFAULT_COUNTS).map((key) => [key, diffDays])));
    setIsCalculated(true);
    storageService.setItem(MISSED_PRAYER_CALC_KEY, { birthDate, pubertyAge: Number(pubertyAge) });
  };

  const updateCount = (prayer, change) => {
    setMissedCounts((previous) => {
      const current = Number(previous[prayer]);
      return { ...previous, [prayer]: Math.max(0, (Number.isFinite(current) ? current : 0) + change) };
    });
  };

  const prayers = [
    { id: 'fajr', label: t('prayer.fajr', 'Sabah'), icon: <Sunrise size={18} /> },
    { id: 'dhuhr', label: t('prayer.dhuhr', 'Öğle'), icon: <Sun size={18} /> },
    { id: 'asr', label: t('prayer.asr', 'İkindi'), icon: <CloudSun size={18} /> },
    { id: 'maghrib', label: t('prayer.maghrib', 'Akşam'), icon: <Sunset size={18} /> },
    { id: 'isha', label: t('prayer.isha', 'Yatsı'), icon: <Moon size={18} /> },
    { id: 'witr', label: t('prayer.witr', 'Vitir'), icon: <Sparkles size={18} /> },
  ];
  const totalMissed = Object.values(missedCounts).reduce((sum, value) => sum + value, 0);

  return (
    <main className="practice-page" data-i18n-autolocalize="false">
      <header className="practice-header">
        <IslamicBackButton onClick={onClose} size="medium" />
        <div className="practice-header__copy">
          <h1 className="practice-title">{t('missedPrayers.title', 'Kaza Takipçisi')}</h1>
          <p className="practice-subtitle">{t('missedPrayers.subtitle', 'Kaza borçlarınızı planlı bir şekilde takip edin')}</p>
        </div>
      </header>

      {!isCalculated ? (
        <section className="practice-panel" style={{ marginTop: 0 }}>
          <h2 className="practice-section-title">{t('missedPrayers.calculatorTitle', 'KAZA NAMAZI HESAPLAYICI')}</h2>
          <label className="practice-row__text" htmlFor="missed-birth-date"><Calendar size={13} /> {t('missedPrayers.birthDate', 'Doğum Tarihi')}</label>
          <input id="missed-birth-date" type="date" className="practice-field" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
          <label className="practice-row__text" htmlFor="missed-puberty-age" style={{ marginTop: 12 }}><User size={13} /> {t('missedPrayers.pubertyAge', 'Buluğ Çağı')}</label>
          <select id="missed-puberty-age" className="practice-field" value={pubertyAge} onChange={(event) => setPubertyAge(event.target.value)}>
            {Array.from({ length: 6 }, (_, index) => 10 + index).map((age) => <option key={age} value={age}>{age} {t('common.age', 'Yaş')}</option>)}
          </select>
          <button type="button" className="practice-primary-button practice-wide" style={{ marginTop: 14 }} disabled={!birthDate} onClick={calculateMissed}>{t('missedPrayers.calculate', 'Hesapla')}</button>
          <div className="practice-info" style={{ marginTop: 12, marginBottom: 0 }}><Info size={17} /><div>{t('missedPrayers.calcNote', 'Kaza sayıları yaklaşık olarak hesaplanır; sonucu elle düzenleyebilirsiniz.')}</div></div>
        </section>
      ) : (
        <>
          <section className="practice-summary">
            <div className="practice-summary__top">
              <div><div className="practice-summary__value">{totalMissed}</div><div className="practice-summary__label">{t('missedPrayers.totalMissed', 'Toplam kaza borcu')}</div></div>
              <button type="button" className="practice-icon-button" aria-label={t('missedPrayers.recalculate', 'Yeniden hesapla')} onClick={() => setIsCalculated(false)}><RotateCcw size={18} /></button>
            </div>
          </section>
          <section className="practice-section">
            <h2 className="practice-section-title">{t('missedPrayers.prayerList', 'NAMAZ LİSTESİ')}</h2>
            <div className="practice-list">
              {prayers.map((prayer) => {
                const count = missedCounts[prayer.id];
                return (
                  <div className={`practice-row ${count === 0 ? 'practice-row--done' : ''}`} key={prayer.id}>
                    <span className="practice-row__icon">{prayer.icon}</span>
                    <span className="practice-row__body"><span className="practice-row__title">{prayer.label}</span><span className="practice-row__text">{count} {t('common.remaining', 'kalan')}</span></span>
                    <span className="practice-counter" aria-label={`${prayer.label} sayacı`}>
                      <button type="button" className="practice-counter__button" disabled={count === 0} aria-label={`${prayer.label} sayısını azalt`} onClick={() => updateCount(prayer.id, -1)}><Minus size={18} /></button>
                      <span className="practice-counter__value" aria-live="polite">{count}</span>
                      <button type="button" className="practice-counter__button practice-counter__button--primary" aria-label={`${prayer.label} sayısını artır`} onClick={() => updateCount(prayer.id, 1)}><Plus size={18} /></button>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
          <div className="practice-info" style={{ marginTop: 16 }}><Info size={18} /><div>{t('missedPrayers.note', 'Kıldığınız her kaza için eksi, eklemek istediğiniz borç için artı düğmesini kullanın.')}</div></div>
        </>
      )}
    </main>
  );
};

export default MissedPrayers;
