import { useState, useEffect } from 'react';
import { X, Check, Plus, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getHijriToday, checkFastingDay } from '../services/hijriService';

const FastingTracker = ({ onClose }) => {
    const { t } = useTranslation();
    const [hijriDate, setHijriDate] = useState(null);
    const [todayFasting, setTodayFasting] = useState(null);
    const [fastingLog, setFastingLog] = useState({});
    const [stats, setStats] = useState({ thisMonth: 0, total: 0 });

    useEffect(() => {
        // Hicri tarihi al
        const hijri = getHijriToday();
        setHijriDate(hijri);

        // Bugünkü oruç tavsiyeleri
        const fasting = checkFastingDay(new Date(), hijri);
        setTodayFasting(fasting);

        // Kayıtlı oruçları yükle
        const saved = JSON.parse(localStorage.getItem('fastingLog') || '{}');
        setFastingLog(saved);

        // İstatistikleri hesapla
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
        localStorage.setItem('fastingLog', JSON.stringify(newLog));
        calculateStats(newLog);
    };

    const today = new Date().toISOString().split('T')[0];
    const isFastedToday = fastingLog[today]?.fasted;

    return (
        <div className="glass-card" style={{
            position: 'relative',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,245,235,0.95))'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div></div>
                <h2 style={{ margin: 0, color: '#d35400', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Moon size={24} /> {t('fasting.title')}
                </h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                    <X size={28} />
                </button>
            </div>

            {/* Hicri Tarih */}
            {hijriDate && (
                <div style={{
                    background: 'linear-gradient(135deg, #d35400, #e67e22)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '20px',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                        {t(`calendar.days.${new Date().getDay() === 0 ? 6 : new Date().getDay() - 1}`)}
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '4px' }}>
                        {hijriDate.day} {t(`calendar.hijriMonths.${hijriDate.month - 1}`)} {hijriDate.year}
                    </div>
                </div>
            )}

            {/* İstatistikler */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
            }}>
                <div style={{
                    background: 'rgba(39, 174, 96, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(39, 174, 96, 0.2)'
                }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>{stats.thisMonth}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{t('fasting.thisMonth')}</div>
                </div>
                <div style={{
                    background: 'rgba(211, 84, 0, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(211, 84, 0, 0.2)'
                }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d35400' }}>{stats.total}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{t('fasting.total')}</div>
                </div>
            </div>

            {/* Bugünün Durumu */}
            <div style={{
                background: isFastedToday ? 'linear-gradient(135deg, #d4edda, #c3e6cb)' : 'rgba(255,255,255,0.8)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                border: isFastedToday ? '2px solid #28a745' : '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '16px' }}>{t('fasting.today')}</div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                            {isFastedToday ? `✅ ${t('fasting.fasted')}` : t('fasting.notFasted')}
                        </div>
                    </div>
                    <button
                        onClick={() => toggleFasting()}
                        style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            border: 'none',
                            background: isFastedToday ? '#28a745' : 'linear-gradient(135deg, #d35400, #e67e22)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                        }}
                    >
                        {isFastedToday ? <Check size={28} /> : <Plus size={28} />}
                    </button>
                </div>
            </div>

            {/* Oruç Tavsiyeleri */}
            {todayFasting && todayFasting.length > 0 && (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '12px' }}>
                        📅 {t('fasting.recommendations')}
                    </div>
                    {todayFasting.map((fasting, idx) => (
                        <div
                            key={idx}
                            style={{
                                background: fasting.type === 'farz' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(52, 152, 219, 0.1)',
                                borderRadius: '12px',
                                padding: '14px',
                                marginBottom: '10px',
                                border: `1px solid ${fasting.type === 'farz' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(52, 152, 219, 0.2)'}`
                            }}
                        >
                            <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                                {t(fasting.nameKey, fasting.nameParams)}
                            </div>
                            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                {t(fasting.descKey)}
                            </div>
                            <div style={{
                                display: 'inline-block',
                                marginTop: '8px',
                                padding: '4px 10px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: fasting.type === 'farz' ? '#e74c3c' : fasting.type === 'sunnah' ? '#3498db' : '#95a5a6',
                                color: 'white'
                            }}>
                                {t(`fasting.types.${fasting.type}`)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Boş durum */}
            {(!todayFasting || todayFasting.length === 0) && (
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999'
                }}>
                    <Sun size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <div>{t('fasting.noRecommendations')}</div>
                    <div style={{ fontSize: '13px', marginTop: '8px' }}>{t('fasting.alwaysNafile')}</div>
                </div>
            )}
        </div>
    );
};

export default FastingTracker;
