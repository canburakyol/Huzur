import { useState } from 'react';
import { TrendingDown, AlertCircle, CheckCircle2, Plus, Minus, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';
import './PrayerTracker.css';
import './Navigation.css';

const PRAYER_TRACKER_KEY = 'prayerTracker';
const PRAYER_TRACKER_HISTORY_KEY = 'prayerTrackerHistory';

const PrayerTracker = ({ onClose }) => {
    const { t } = useTranslation();
    const [counts, setCounts] = useState(() => {
        return storageService.getItem(PRAYER_TRACKER_KEY, {
            sabah: 0,
            ogle: 0,
            ikindi: 0,
            aksam: 0,
            yatsi: 0,
            vitir: 0,
            oruc: 0
        });
    });

    const [history, setHistory] = useState(() => {
        return storageService.getItem(PRAYER_TRACKER_HISTORY_KEY, []);
    });

    const [showInfo, setShowInfo] = useState(false);

    const updateCount = (key, delta) => {
        const newCounts = { ...counts, [key]: Math.max(0, counts[key] + delta) };
        setCounts(newCounts);
        storageService.setItem(PRAYER_TRACKER_KEY, newCounts);

        if (delta < 0) {
            const log = {
                type: key,
                date: new Date().toISOString(),
                count: Math.abs(delta)
            };
            const newHistory = [...history, log].slice(-50);
            setHistory(newHistory);
            storageService.setItem(PRAYER_TRACKER_HISTORY_KEY, newHistory);
        }
    };

    const items = [
        { key: 'sabah', label: t('prayers.fajr', 'Sabah Namazı'), icon: '🌅', rekat: 2, color: '#f59e0b' },
        { key: 'ogle', label: t('prayers.dhuhr', 'Öğle Namazı'), icon: '☀️', rekat: 4, color: '#10b981' },
        { key: 'ikindi', label: t('prayers.asr', 'İkindi Namazı'), icon: '🌤️', rekat: 4, color: '#3b82f6' },
        { key: 'aksam', label: t('prayers.maghrib', 'Akşam Namazı'), icon: '🌆', rekat: 3, color: '#ec4899' },
        { key: 'yatsi', label: t('prayers.isha', 'Yatsı Namazı'), icon: '🌙', rekat: 4, color: '#8b5cf6' },
        { key: 'vitir', label: t('prayers.witr', 'Vitir Namazı'), icon: '⭐', rekat: 3, color: '#f97316' },
        { key: 'oruc', label: t('fasting.simple', 'Oruç'), icon: '🍽️', rekat: null, color: '#14b8a6' },
    ];

    const totalPrayers = counts.sabah + counts.ogle + counts.ikindi + counts.aksam + counts.yatsi + counts.vitir;
    const totalRekat = (counts.sabah * 2) + (counts.ogle * 4) + (counts.ikindi * 4) + (counts.aksam * 3) + (counts.yatsi * 4) + (counts.vitir * 3);
    const estimatedDays = Math.ceil(totalPrayers / 5);

    return (
        <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TrendingDown size={24} color="var(--nav-accent)" />
                        {t('menu.kazaTakibi', 'Kaza Takibi')}
                    </h2>
                </div>
                <button 
                  onClick={() => setShowInfo(!showInfo)} 
                  className="icon-btn-small"
                  style={{ marginLeft: 'auto' }}
                >
                    <AlertCircle size={20} />
                </button>
            </div>

            {/* Bilgi Kutusu */}
            {showInfo && (
                <div className="settings-card reveal-stagger" style={{ background: 'var(--nav-hover)', border: 'none', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Info size={18} color="var(--nav-accent)" />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: '800', color: 'var(--nav-text)' }}>Kaza Namazı Nedir?</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                                Vaktinde kılınamayan farz namazlar için kaza namazı kılınır. Kaza namazları, farz namazların yerine geçer ve borç ödenir gibi eda edilir.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Özet Kartları */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '32px' }}>
                <div className="settings-card" style={{ flexDirection: 'column', padding: '16px', textAlign: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--nav-accent)' }}>{totalPrayers}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>VAKİT</div>
                </div>
                <div className="settings-card" style={{ flexDirection: 'column', padding: '16px', textAlign: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--nav-text)' }}>{totalRekat}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>REKAT</div>
                </div>
                <div className="settings-card" style={{ flexDirection: 'column', padding: '16px', textAlign: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--nav-text)' }}>{estimatedDays}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>GÜN</div>
                </div>
            </div>

            {/* Namaz Listesi */}
            <div className="settings-group">
                {items.map((item, index) => {
                    const isZero = counts[item.key] === 0;
                    return (
                        <div
                            key={item.key}
                            className={`settings-card reveal-stagger ${isZero ? 'prayer-done' : ''}`}
                            style={{ padding: '20px', justifyContent: 'space-between', marginBottom: '12px', '--delay': `${index * 0.05}s` }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className="kaza-icon-box" style={{ background: `${item.color}15`, color: item.color }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '800', color: 'var(--nav-text)', fontSize: '1rem' }}>{item.label}</div>
                                    {item.rekat && <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--nav-text-muted)' }}>{item.rekat} Rekat</div>}
                                </div>
                            </div>

                            <div className="kaza-controls">
                                <button
                                    onClick={() => updateCount(item.key, -1)}
                                    disabled={isZero}
                                    className={`kaza-btn minus ${isZero ? 'disabled' : ''}`}
                                >
                                    <Minus size={18} />
                                </button>
                                <span className={`kaza-count ${isZero ? 'zero' : ''}`}>
                                    {counts[item.key]}
                                </span>
                                <button
                                    onClick={() => updateCount(item.key, 1)}
                                    className="kaza-btn plus"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Motivasyon Mesajı */}
            {totalPrayers === 0 && (
                <div className="settings-card" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '32px', textAlign: 'center', flexDirection: 'column', gap: '12px' }}>
                    <CheckCircle2 size={48} color="#10b981" />
                    <div>
                        <div style={{ fontWeight: '900', color: '#10b981', fontSize: '1.25rem' }}>Maşallah!</div>
                        <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: 'var(--nav-text-muted)' }}>
                            Kaza borcunuz bulunmuyor. Rabbim kabul eylesin.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrayerTracker;
