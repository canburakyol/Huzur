import { useState, useEffect } from 'react';
import { Check, Plus, Moon, Sun, Calendar, Info, TrendingUp, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getHijriToday, checkFastingDay } from '../services/hijriService';
import { storageService } from '../services/storageService';
import IslamicBackButton from './shared/IslamicBackButton';
import './FastingTracker.css';
import './Navigation.css';

const FASTING_LOG_KEY = 'fastingLog';

const FastingTracker = ({ onClose }) => {
    const { t } = useTranslation();
    const [hijriDate, setHijriDate] = useState(null);
    const [todayFasting, setTodayFasting] = useState(null);
    const [fastingLog, setFastingLog] = useState({});
    const [stats, setStats] = useState({ thisMonth: 0, total: 0 });

    useEffect(() => {
        const hijri = getHijriToday();
        setHijriDate(hijri);

        const fasting = checkFastingDay(new Date(), hijri);
        setTodayFasting(fasting);

        const saved = storageService.getItem(FASTING_LOG_KEY, {});
        setFastingLog(saved);

        calculateStats(saved);
    }, []);

    const calculateStats = (log) => {
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;

        let monthCount = 0;
        let totalCount = 0;

        Object.entries(log).forEach(([date, data]) => {
            if (data.fasted) {
                totalCount++;
                if (date.startsWith(thisMonth)) {
                    monthCount++;
                }
            }
        });

        setStats({ thisMonth: monthCount, total: totalCount });
    };

    const toggleFasting = (date = new Date().toISOString().split('T')[0]) => {
        const newLog = { ...fastingLog };

        if (newLog[date]?.fasted) {
            newLog[date] = { ...newLog[date], fasted: false };
        } else {
            newLog[date] = {
                fasted: true,
                type: todayFasting?.[0]?.type || 'nafile',
                hijriDate: hijriDate?.formatted || ''
            };
        }

        setFastingLog(newLog);
        storageService.setItem(FASTING_LOG_KEY, newLog);
        calculateStats(newLog);
    };

    const today = new Date().toISOString().split('T')[0];
    const isFastedToday = fastingLog[today]?.fasted;

    return (
        <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                    {t('fasting.title', 'Oruç Takipçisi')}
                </h2>
            </div>

            {/* Hicri Tarih Card */}
            {hijriDate && (
                <div className="settings-card premium-glass hover-lift" style={{ 
                    flexDirection: 'column', 
                    background: 'linear-gradient(135deg, var(--nav-accent), #f97316)', 
                    border: 'none', 
                    padding: '32px', 
                    textAlign: 'center', 
                    color: 'white', 
                    marginBottom: '32px',
                    boxShadow: '0 12px 24px rgba(249, 115, 22, 0.2)'
                }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
                        {t(`calendar.days.${new Date().getDay() === 0 ? 6 : new Date().getDay() - 1}`)}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '900' }}>
                        {hijriDate.day} {t(`calendar.hijriMonths.${hijriDate.month - 1}`)} {hijriDate.year}
                    </div>
                    <div className="fasting-decoration">
                        <Moon size={48} style={{ opacity: 0.1, position: 'absolute', right: '20px', bottom: '10px' }} />
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '32px' }}>
                <div className="settings-card premium-glass hover-lift" style={{ flexDirection: 'column', padding: '24px', textAlign: 'center', gap: '12px' }}>
                    <div style={{ color: 'var(--nav-accent)' }}><TrendingUp size={24} /></div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--nav-text)' }}>{stats.thisMonth}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('fasting.thisMonth', 'BU AY')}</div>
                </div>
                <div className="settings-card premium-glass hover-lift" style={{ flexDirection: 'column', padding: '24px', textAlign: 'center', gap: '12px' }}>
                    <div style={{ color: '#10b981' }}><Sparkles size={24} /></div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--nav-text)' }}>{stats.total}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('fasting.total', 'TOPLAM')}</div>
                </div>
            </div>

            {/* Bugünün Durumu */}
            <div className="settings-group">
                <div className="settings-group-title premium-text">{t('fasting.today', 'Bugünün Durumu')}</div>
                <div 
                    className={`settings-card premium-glass hover-lift ${isFastedToday ? 'active-fasting-card' : ''}`} 
                    style={{ 
                        padding: '24px', 
                        justifyContent: 'space-between',
                        border: isFastedToday ? '1px solid #10b981' : '1px solid var(--nav-border)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="settings-icon-box" style={{ background: isFastedToday ? 'rgba(16, 185, 129, 0.1)' : 'var(--nav-hover)', color: isFastedToday ? '#10b981' : 'var(--nav-text-muted)' }}>
                            <Moon size={24} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', color: 'var(--nav-text)', fontSize: '1.1rem' }}>
                                {isFastedToday ? t('fasting.fasted', 'Oruçlu') : t('fasting.notFasted', 'Oruç Tutulmadı')}
                            </div>
                            <p className="settings-desc" style={{ margin: '4px 0 0 0' }}>{t('fasting.status_hint', 'Bugünkü durumunuzu güncelleyin')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => toggleFasting()}
                        className={`velocity-dial-btn ${isFastedToday ? 'active' : ''}`}
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            border: 'none',
                            background: isFastedToday ? '#10b981' : 'var(--nav-accent)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isFastedToday ? <Check size={28} /> : <Plus size={28} />}
                    </button>
                </div>
            </div>

            {/* Oruç Tavsiyeleri */}
            <div className="settings-group" style={{ marginTop: '32px' }}>
                <div className="settings-group-title premium-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} /> {t('fasting.recommendations', 'Oruç Tavsiyeleri')}
                </div>
                
                {todayFasting && todayFasting.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {todayFasting.map((f, idx) => (
                            <div key={idx} className="settings-card premium-glass hover-lift" style={{ flexDirection: 'column', gap: '12px', padding: '20px', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <div style={{ fontWeight: '800', color: 'var(--nav-text)', fontSize: '1.05rem' }}>{t(f.nameKey, f.nameParams)}</div>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        borderRadius: '8px', 
                                        fontSize: '0.65rem', 
                                        fontWeight: '900', 
                                        textTransform: 'uppercase',
                                        background: f.type === 'farz' ? '#fee2e2' : f.type === 'sunnah' ? 'rgba(245, 158, 11, 0.1)' : 'var(--nav-hover)',
                                        color: f.type === 'farz' ? '#ef4444' : f.type === 'sunnah' ? 'var(--nav-accent)' : 'var(--nav-text-muted)'
                                    }}>
                                        {t(`fasting.types.${f.type}`, f.type)}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>{t(f.descKey)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="settings-card premium-glass hover-lift" style={{ flexDirection: 'column', padding: '48px 24px', textAlign: 'center', gap: '16px', background: 'transparent', border: '2px dashed var(--nav-border)' }}>
                        <Sun size={48} style={{ opacity: 0.1 }} />
                        <div style={{ fontWeight: '700', color: 'var(--nav-text-muted)' }}>{t('fasting.noRecommendations', 'Bugün için özel bir oruç tavsiyesi bulunmuyor.')}</div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', opacity: 0.8 }}>{t('fasting.alwaysNafile', 'Ancak her zaman nafile oruç tutabilirsiniz.')}</p>
                    </div>
                )}
            </div>

            {/* Bilgi Kutusu */}
            <div className="settings-card premium-glass hover-lift" style={{ background: 'var(--nav-hover)', border: 'none', marginTop: '32px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Info size={18} color="var(--nav-accent)" />
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                        {t('fasting.info_note', 'Oruç ibadeti, hem bedensel hem de ruhsal bir arınma vesilesidir. Hicri takvime göre tavsiye edilen günleri takip ederek borçlarınızı eda edebilir veya nafile oruçlarla sevap kazanabilirsiniz.')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FastingTracker;
