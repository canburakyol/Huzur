import { useState } from 'react';
import { Info, Minus, Plus, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { storageService } from '../../../services/storageService';
import { DEFAULT_PRAYER_COUNTS, normalizePrayerTrackerCounts, PRAYER_TRACKER_KEY } from './prayerTrackerState';
import '../../../styles/PracticePages.css';

const PrayerTracker = ({ onClose }) => {
  const { t } = useTranslation();
  const [counts, setCounts] = useState(() => normalizePrayerTrackerCounts(
    storageService.getItem(PRAYER_TRACKER_KEY, DEFAULT_PRAYER_COUNTS),
  ));
  const updateCount = (key, delta) => {
    const current = Number(counts[key]);
    const next = {
      ...counts,
      [key]: Math.max(0, (Number.isFinite(current) ? current : 0) + delta),
    };
    setCounts(next);
    storageService.setItem(PRAYER_TRACKER_KEY, next);
  };

  const items = [
    { key: 'sabah', label: t('prayers.fajr', 'Sabah Namazı'), icon: '🌅' },
    { key: 'ogle', label: t('prayers.dhuhr', 'Öğle Namazı'), icon: '☀️' },
    { key: 'ikindi', label: t('prayers.asr', 'İkindi Namazı'), icon: '🌤️' },
    { key: 'aksam', label: t('prayers.maghrib', 'Akşam Namazı'), icon: '🌆' },
    { key: 'yatsi', label: t('prayers.isha', 'Yatsı Namazı'), icon: '🌙' },
    { key: 'vitir', label: t('prayers.witr', 'Vitir Namazı'), icon: '⭐' },
  ];

  const totalPrayers = ['sabah', 'ogle', 'ikindi', 'aksam', 'yatsi', 'vitir']
    .reduce((sum, key) => sum + counts[key], 0);
  return (
    <main className="practice-page" data-i18n-autolocalize="false">
      <header className="practice-header">
        <IslamicBackButton onClick={onClose} size="medium" />
        <div className="practice-header__copy">
          <h1 className="practice-title">{t('missedPrayers.personalTitle', 'Kişisel kaza kaydı')}</h1>
          <p className="practice-subtitle">{t('missedPrayers.personalSubtitle', 'Yalnızca sizin eklediğiniz namaz kayıtlarını düzenleyin.')}</p>
        </div>
      </header>

      <div className="practice-info" style={{ marginTop: 0 }}>
        <Info size={18} />
        <div><strong>{t('missedPrayers.personalNoteTitle', 'Kişisel kayıt')}</strong>{t('missedPrayers.personalNote', 'Bu ekran kişisel kayıt içindir; dinî yükümlülük ve takip yöntemi mezhep ve kişisel duruma göre değişebilir. Dinî bir görevliye danışın.')}</div>
      </div>

      <section className="practice-summary" aria-label={t('missedPrayers.summaryLabel', 'Kişisel kaza kaydı özeti')}>
        <div className="practice-summary__top">
          <div>
            <div className="practice-summary__value">{totalPrayers}</div>
            <div className="practice-summary__label">{t('missedPrayers.totalLogged', 'Toplam kayıtlı vakit')}</div>
          </div>
          <TrendingDown size={23} color="var(--primary)" />
        </div>
        <div className="practice-metrics">
          <div className="practice-metric"><strong>{totalPrayers}</strong><span>{t('missedPrayers.entries', 'Vakit kaydı')}</span></div>
        </div>
      </section>

      <section className="practice-section">
        <h2 className="practice-section-title">{t('missedPrayers.byPrayer', 'Vakit bazında kayıt')}</h2>
        <div className="practice-list">
          {items.map((item) => {
            const count = counts[item.key];
            return (
              <div className="practice-row" key={item.key}>
                <div className="practice-row__icon" aria-hidden="true">{item.icon}</div>
                <div className="practice-row__body">
                  <h3 className="practice-row__title">{item.label}</h3>
                  <p className="practice-row__text">{t('missedPrayers.loggedCount', { count, defaultValue: '{{count}} kayıtlı' })}</p>
                </div>
                <div className="practice-counter" aria-label={t('missedPrayers.counterLabel', { name: item.label, defaultValue: '{{name}} sayacı' })}>
                  <button
                    type="button"
                    className="practice-counter__button"
                    disabled={count === 0}
                    aria-label={t('missedPrayers.decrease', { name: item.label, defaultValue: '{{name}} kaydını azalt' })}
                    onClick={() => updateCount(item.key, -1)}
                  ><Minus size={18} /></button>
                  <span className="practice-counter__value" aria-live="polite">{count}</span>
                  <button
                    type="button"
                    className="practice-counter__button practice-counter__button--primary"
                    aria-label={t('missedPrayers.increase', { name: item.label, defaultValue: '{{name}} kayda ekle, sayıyı artır' })}
                    onClick={() => updateCount(item.key, 1)}
                  ><Plus size={18} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </main>
  );
};

export default PrayerTracker;
