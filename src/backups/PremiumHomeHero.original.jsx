import { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Flame, Moon } from 'lucide-react';
import { useTime } from '../context/TimeContext';

/**
 * Timer logic helper
 */
const calculateTimeLeft = (timings, nextPrayer) => {
    if (!timings || !nextPrayer || !timings[nextPrayer.key]) return null;
    const now = new Date();
    const [targetH, targetM] = timings[nextPrayer.key].split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(targetH, targetM, 0, 0);
    if (targetTime < now) targetTime.setDate(targetTime.getDate() + 1);
    const diff = targetTime - now;
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
};

const PremiumHomeHero = memo(({
    locationName,
    streakData,
    timings,
    nextPrayer,
    recoveryPlan = null,
    onSelectFeature
}) => {
    const { t } = useTranslation();
    const { greetingKey, timeOfDay } = useTime();
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(timings, nextPrayer));

    useEffect(() => {
        if (!timings || !nextPrayer) return;
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(timings, nextPrayer));
        }, 1000);
        return () => clearInterval(timer);
    }, [timings, nextPrayer]);

    const formatNum = (n) => String(n).padStart(2, '0');

    const prayerList = [
        { key: 'Fajr', nameKey: 'prayer.fajr' },
        { key: 'Sunrise', nameKey: 'prayer.sunrise' },
        { key: 'Dhuhr', nameKey: 'prayer.dhuhr' },
        { key: 'Asr', nameKey: 'prayer.asr' },
        { key: 'Maghrib', nameKey: 'prayer.maghrib' },
        { key: 'Isha', nameKey: 'prayer.isha' }
    ];

    const getPrayerName = (key) => {
        const prayerMap = {
            'Fajr': 'prayer.fajr',
            'Sunrise': 'prayer.sunrise',
            'Dhuhr': 'prayer.dhuhr',
            'Asr': 'prayer.asr',
            'Maghrib': 'prayer.maghrib',
            'Isha': 'prayer.isha'
        };
        return t(prayerMap[key] || key);
    };

    // Simplified gradients based on time of day
    const getHeroGradient = () => {
        switch (timeOfDay) {
            case 'morning': return 'linear-gradient(135deg, #0F3D2E 0%, #D4AF37 100%)';
            case 'noon': return 'linear-gradient(135deg, #124D3A 0%, #1A5C45 100%)';
            case 'afternoon': return 'linear-gradient(135deg, #0B2E23 0%, #8B6914 100%)';
            case 'evening': return 'linear-gradient(135deg, #07241B 0%, #6B4F24 100%)';
            case 'night': return 'linear-gradient(135deg, #041410 0%, #0B2E23 100%)';
            default: return 'linear-gradient(135deg, #0F3D2E 0%, #1A5C45 100%)';
        }
    };

    return (
        <div className="premium-hero-container" style={{
            background: getHeroGradient(),
            borderRadius: '28px',
            padding: '18px 16px 14px',
            marginBottom: '8px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 28px rgba(0,0,0,0.2)'
        }}>
            {/* Background Calligraphy Glow */}
            <div style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                fontSize: '80px',
                color: 'rgba(255,255,255,0.04)',
                fontFamily: 'serif',
                pointerEvents: 'none',
                transform: 'rotate(-15deg)'
            }}>الله</div>

            {/* Header: Location + Streak */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.85)' }}>
                    <MapPin size={14} />
                    <span style={{ fontWeight: '600', fontSize: '13px' }}>{locationName}</span>
                </div>
                {streakData.current > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        color: 'var(--on-primary)',
                        fontSize: '11px',
                        fontWeight: '700'
                    }}>
                        <Flame size={12} color="#FF9966" />
                        {streakData.current}
                    </div>
                )}
            </div>

            {/* Main Content: Greeting + Countdown */}
            <div style={{ textAlign: 'center', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '14px', color: 'rgba(255,255,255,0.65)', fontWeight: '500' }}>
                    {recoveryPlan?.headline || t(greetingKey)}
                </h2>
                
                {nextPrayer && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
                            {getPrayerName(nextPrayer.key)} {t('prayer.time')}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className="countdown-unit">
                                <span className="unit-value">{timeLeft ? formatNum(timeLeft.hours) : '--'}</span>
                                <span className="unit-label">{t('countdown.hours')}</span>
                            </div>
                            <span style={{ color: 'var(--on-primary)', fontSize: '18px', fontWeight: '700', opacity: 0.4 }}>:</span>
                            <div className="countdown-unit">
                                <span className="unit-value">{timeLeft ? formatNum(timeLeft.minutes) : '--'}</span>
                                <span className="unit-label">{t('countdown.min')}</span>
                            </div>
                            <span style={{ color: 'var(--on-primary)', fontSize: '18px', fontWeight: '700', opacity: 0.4 }}>:</span>
                            <div className="countdown-unit">
                                <span className="unit-value">{timeLeft ? formatNum(timeLeft.seconds) : '--'}</span>
                                <span className="unit-label">{t('countdown.sec')}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => onSelectFeature && onSelectFeature('huzurMode', 'home_hero')}
                            className="huzur-mode-hero-btn"
                            style={{
                                marginTop: '12px',
                                background: 'rgba(255,255,255,0.12)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: '10px',
                                padding: '6px 14px',
                                color: 'var(--on-primary)',
                                fontSize: '12px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                marginInline: 'auto'
                            }}
                        >
                            <Moon size={14} fill='var(--on-primary)' />
                            {t('menu.huzurMode')}
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom: Prayer Strip */}
            <div style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                padding: '8px 6px',
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 1,
                border: '1px solid rgba(255,255,255,0.08)'
            }}>
                {prayerList.map((prayer) => (
                    <div key={prayer.key} style={{
                        textAlign: 'center',
                        flex: 1,
                        opacity: nextPrayer?.key === prayer.key ? 1 : 0.55,
                        position: 'relative'
                    }}>
                        <div style={{ fontSize: '7px', color: 'var(--on-primary)', fontWeight: '500', marginBottom: '1px' }}>
                            {t(prayer.nameKey)}
                        </div>
                        <div style={{ fontSize: '10px', color: nextPrayer?.key === prayer.key ? '#D4AF37' : 'var(--on-primary)', fontWeight: '700' }}>
                            {timings?.[prayer.key]?.substring(0, 5) || '--:--'}
                        </div>
                        {nextPrayer?.key === prayer.key && (
                            <div style={{ position: 'absolute', bottom: '-3px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '3px', borderRadius: '50%', background: '#D4AF37' }}></div>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
                .countdown-unit {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .unit-value {
                    color: white;
                    font-size: 24px;
                    font-weight: 800;
                    font-family: 'Inter', system-ui, sans-serif;
                    line-height: 1;
                }
                .unit-label {
                    color: rgba(255,255,255,0.55);
                    font-size: 7px;
                    text-transform: uppercase;
                    font-weight: 700;
                    margin-top: 2px;
                }
                .premium-hero-container::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at top right, rgba(255,255,255,0.08) 0%, transparent 60%);
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
});

export default PremiumHomeHero;
