import { useState } from 'react';
import { CloudSun, Info, Minus, Moon, Plus, Star, Sun, Sunrise, Sunset } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/shared/PageHeader';
import { storageService } from '../../../services/storageService';
import { DEFAULT_PRAYER_COUNTS, normalizePrayerTrackerCounts, PRAYER_TRACKER_KEY } from './prayerTrackerState';

const ICON = { size: 20, strokeWidth: 1.75, 'aria-hidden': true };

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
    { key: 'sabah', label: t('prayers.fajr', 'Sabah Namazı'), icon: <Sunrise {...ICON} /> },
    { key: 'ogle', label: t('prayers.dhuhr', 'Öğle Namazı'), icon: <Sun {...ICON} /> },
    { key: 'ikindi', label: t('prayers.asr', 'İkindi Namazı'), icon: <CloudSun {...ICON} /> },
    { key: 'aksam', label: t('prayers.maghrib', 'Akşam Namazı'), icon: <Sunset {...ICON} /> },
    { key: 'yatsi', label: t('prayers.isha', 'Yatsı Namazı'), icon: <Moon {...ICON} /> },
    { key: 'vitir', label: t('prayers.witr', 'Vitir Namazı'), icon: <Star {...ICON} /> },
  ];

  const totalPrayers = items.reduce((sum, item) => sum + counts[item.key], 0);

  return (
    <main className="app-container hz-root" style={{ minHeight: '100vh' }} data-i18n-autolocalize="false">
      <PageHeader title={t('missedPrayers.personalTitle', 'Kişisel kaza kaydı')} onBack={onClose} />
      <div className="hz-stack" style={{ padding: '0 var(--space-4) calc(var(--bottom-stack-height, 80px) + var(--space-5))' }}>
        <p className="hz-label" style={{ margin: 0 }}>
          {t('missedPrayers.personalSubtitle', 'Yalnızca sizin eklediğiniz namaz kayıtlarını düzenleyin.')}
        </p>

        <section className="hz-card hz-card--brand" aria-label={t('missedPrayers.summaryLabel', 'Kişisel kaza kaydı özeti')}>
          <div className="hz-overline">{t('missedPrayers.totalLogged', 'Toplam kayıtlı vakit')}</div>
          <div className="hz-countdown" style={{ marginTop: 'var(--space-2)' }}>{totalPrayers}</div>
        </section>

        <div className="hz-card" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
          <Info size={20} strokeWidth={1.75} aria-hidden="true" style={{ flex: 'none', color: 'var(--gold-ink)', marginTop: 2 }} />
          <p className="hz-body" style={{ fontSize: 14, lineHeight: '20px' }}>
            <strong>{t('missedPrayers.personalNoteTitle', 'Kişisel kayıt')}</strong>{' '}
            {t('missedPrayers.personalNote', 'Bu ekran kişisel kayıt içindir; dinî yükümlülük ve takip yöntemi mezhep ve kişisel duruma göre değişebilir. Dinî bir görevliye danışın.')}
          </p>
        </div>

        <section className="hz-stack" style={{ gap: 'var(--space-2)' }}>
          <h2 className="hz-overline" style={{ margin: 'var(--space-2) 0 0' }}>{t('missedPrayers.byPrayer', 'Vakit bazında kayıt')}</h2>
          {items.map((item) => {
            const count = counts[item.key];
            return (
              <div className="hz-row" key={item.key} style={{ cursor: 'default' }}>
                <span className="hz-row__icon">{item.icon}</span>
                <span className="hz-row__text">
                  <h3 className="hz-row__title" style={{ margin: 0 }}>{item.label}</h3>
                  <span className="hz-label">{t('missedPrayers.loggedCount', { count, defaultValue: '{{count}} kayıtlı' })}</span>
                </span>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                  aria-label={t('missedPrayers.counterLabel', { name: item.label, defaultValue: '{{name}} sayacı' })}
                >
                  <button
                    type="button"
                    className="hz-iconbtn"
                    disabled={count === 0}
                    style={{ opacity: count === 0 ? 0.4 : 1 }}
                    aria-label={t('missedPrayers.decrease', { name: item.label, defaultValue: '{{name}} kaydını azalt' })}
                    onClick={() => updateCount(item.key, -1)}
                  ><Minus size={18} strokeWidth={1.75} aria-hidden="true" /></button>
                  <span
                    aria-live="polite"
                    style={{ minWidth: 28, textAlign: 'center', font: '700 18px/24px var(--font-sans)', fontVariantNumeric: 'tabular-nums' }}
                  >{count}</span>
                  <button
                    type="button"
                    className="hz-iconbtn"
                    style={{ background: 'var(--brand)', borderColor: 'var(--brand)', color: 'var(--on-brand)' }}
                    aria-label={t('missedPrayers.increase', { name: item.label, defaultValue: '{{name}} kayda ekle, sayıyı artır' })}
                    onClick={() => updateCount(item.key, 1)}
                  ><Plus size={18} strokeWidth={1.75} aria-hidden="true" /></button>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default PrayerTracker;
