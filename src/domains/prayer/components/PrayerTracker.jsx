import { useState } from 'react';
import { AlertCircle, CheckCircle2, Info, Minus, Plus, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { storageService } from '../../../services/storageService';
import { DEFAULT_PRAYER_COUNTS, normalizePrayerTrackerCounts, PRAYER_TRACKER_KEY } from './prayerTrackerState';
import '../../../styles/PracticePages.css';

const PRAYER_TRACKER_HISTORY_KEY = 'prayerTrackerHistory';

const PrayerTracker = ({ onClose }) => {
  const { t } = useTranslation();
  const [counts, setCounts] = useState(() => normalizePrayerTrackerCounts(
    storageService.getItem(PRAYER_TRACKER_KEY, DEFAULT_PRAYER_COUNTS),
  ));
  const [, setHistory] = useState(() => storageService.getItem(PRAYER_TRACKER_HISTORY_KEY, []));
  const [showInfo, setShowInfo] = useState(false);

  const updateCount = (key, delta) => {
    const current = Number(counts[key]);
    const next = {
      ...counts,
      [key]: Math.max(0, (Number.isFinite(current) ? current : 0) + delta),
    };
    setCounts(next);
    storageService.setItem(PRAYER_TRACKER_KEY, next);

    if (delta < 0) {
      setHistory((previous) => {
        const safeHistory = Array.isArray(previous) ? previous : [];
        const next = [...safeHistory, { type: key, date: new Date().toISOString(), count: 1 }].slice(-50);
        storageService.setItem(PRAYER_TRACKER_HISTORY_KEY, next);
        return next;
      });
    }
  };

  const items = [
    { key: 'sabah', label: t('prayers.fajr', 'Sabah Namazı'), icon: '🌅', rekat: 2 },
    { key: 'ogle', label: t('prayers.dhuhr', 'Öğle Namazı'), icon: '☀️', rekat: 4 },
    { key: 'ikindi', label: t('prayers.asr', 'İkindi Namazı'), icon: '🌤️', rekat: 4 },
    { key: 'aksam', label: t('prayers.maghrib', 'Akşam Namazı'), icon: '🌆', rekat: 3 },
    { key: 'yatsi', label: t('prayers.isha', 'Yatsı Namazı'), icon: '🌙', rekat: 4 },
    { key: 'vitir', label: t('prayers.witr', 'Vitir Namazı'), icon: '⭐', rekat: 3 },
    { key: 'oruc', label: t('fasting.simple', 'Oruç'), icon: '◐', rekat: null },
  ];

  const totalPrayers = ['sabah', 'ogle', 'ikindi', 'aksam', 'yatsi', 'vitir']
    .reduce((sum, key) => sum + counts[key], 0);
  const totalRekat = (counts.sabah * 2) + (counts.ogle * 4) + (counts.ikindi * 4)
    + (counts.aksam * 3) + (counts.yatsi * 4) + (counts.vitir * 3);
  const estimatedDays = Math.ceil(totalPrayers / 5);

  return (
    <main className="practice-page" data-i18n-autolocalize="false">
      <header className="practice-header">
        <IslamicBackButton onClick={onClose} size="medium" />
        <div className="practice-header__copy">
          <h1 className="practice-title">{t('menu.kazaTakibi', 'Kaza Takibi')}</h1>
          <p className="practice-subtitle">Her sayı, o vakitten kalan kaza borcunuzu gösterir.</p>
        </div>
        <button
          type="button"
          className="practice-icon-button"
          aria-label={showInfo ? 'Bilgiyi kapat' : 'Kaza namazı bilgisini aç'}
          aria-expanded={showInfo}
          onClick={() => setShowInfo((value) => !value)}
        >
          <AlertCircle size={19} />
        </button>
      </header>

      {showInfo && (
        <div className="practice-info">
          <Info size={18} />
          <div>
            <strong>{t('prayerTracker.infoTitle', 'Kaza Namazı Nedir?')}</strong>
            {t('prayerTracker.infoDesc', 'Vaktinde kılınamayan farz namazlar için kaza namazı kılınır. Kıldığınız her vakit için eksi düğmesini kullanın.')}
          </div>
        </div>
      )}

      <section className="practice-summary" aria-label="Kaza özeti">
        <div className="practice-summary__top">
          <div>
            <div className="practice-summary__value">{totalPrayers}</div>
            <div className="practice-summary__label">Toplam kalan kaza</div>
          </div>
          <TrendingDown size={23} color="var(--primary)" />
        </div>
        <div className="practice-metrics">
          <div className="practice-metric"><strong>{totalPrayers}</strong><span>Vakit</span></div>
          <div className="practice-metric"><strong>{totalRekat}</strong><span>Rekat</span></div>
          <div className="practice-metric"><strong>{estimatedDays}</strong><span>Tahmini gün</span></div>
        </div>
      </section>

      <section className="practice-section">
        <h2 className="practice-section-title">VAKİT BAZINDA KALAN BORÇ</h2>
        <div className="practice-list">
          {items.map((item) => {
            const count = counts[item.key];
            return (
              <div className={`practice-row ${count === 0 ? 'practice-row--done' : ''}`} key={item.key}>
                <div className="practice-row__icon" aria-hidden="true">{item.icon}</div>
                <div className="practice-row__body">
                  <h3 className="practice-row__title">{item.label}</h3>
                  <p className="practice-row__text">{count} kaza kalan</p>
                </div>
                <div className="practice-counter" aria-label={`${item.label} sayacı`}>
                  <button
                    type="button"
                    className="practice-counter__button"
                    disabled={count === 0}
                    aria-label={`${item.label} kıldım, borcu azalt`}
                    onClick={() => updateCount(item.key, -1)}
                  ><Minus size={18} /></button>
                  <span className="practice-counter__value" aria-live="polite">{count}</span>
                  <button
                    type="button"
                    className="practice-counter__button practice-counter__button--primary"
                    aria-label={`${item.label} borç ekle, sayıyı artır`}
                    onClick={() => updateCount(item.key, 1)}
                  ><Plus size={18} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {totalPrayers === 0 && counts.oruc === 0 && (
        <div className="practice-info" style={{ marginTop: 14, marginBottom: 0 }}>
          <CheckCircle2 size={18} />
          <div><strong>Maşallah</strong>Kayıtlı kaza borcunuz bulunmuyor.</div>
        </div>
      )}
    </main>
  );
};

export default PrayerTracker;
