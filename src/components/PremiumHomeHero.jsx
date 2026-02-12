import { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Sun, Cloud, CloudRain, CloudSnow, UserPlus, Flame } from 'lucide-react';
import { useTime } from '../context/TimeContext';

/**
 * Weather Icon Helper
 */
const getWeatherIcon = (code) => {
    if (code === undefined || code <= 3) return <Sun size={18} className="crisp-icon" />;
    if (code <= 48) return <Cloud size={18} className="crisp-icon" />;
    if (code <= 67) return <CloudRain size={18} className="crisp-icon" />;
    if (code <= 77) return <CloudSnow size={18} className="crisp-icon" />;
    return <CloudRain size={18} className="crisp-icon" />;
};

/**
 * Timer logic helper
 */
const calculateTimeLeft = (timings, nextPrayer) => {
    if (!timings || !nextPrayer) return null;
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
    weather,
    streakData,
    onOpenInvite,
    timings,
    nextPrayer
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

    // Hero background gradients based on time of day - Tuned to Islamic Green & Gold theme
    const getHeroGradient = () => {
        switch (timeOfDay) {
            case 'morning': return 'linear-gradient(135deg, #0F3D2E 0%, #D4AF37 100%)'; // Dawn: Green to Gold
            case 'noon': return 'linear-gradient(135deg, #124D3A 0%, #1A5C45 100%)'; // Noon: Vibrant Green
            case 'afternoon': return 'linear-gradient(135deg, #0B2E23 0%, #8B6914 100%)'; // Afternoon: Deep Green to Bronze
            case 'evening': return 'linear-gradient(135deg, #07241B 0%, #6B4F24 100%)'; // Evening: Dark Emerald to Sunset Gold
            case 'night': return 'linear-gradient(135deg, #041410 0%, #0B2E23 100%)'; // Night: Darkest Green
            default: return 'linear-gradient(135deg, #0F3D2E 0%, #1A5C45 100%)';
        }
    };

    return (
        <div className="premium-hero-container" style={{
            background: getHeroGradient(),
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
            {/* Background Calligraphy Glow */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                fontSize: '120px',
                color: 'rgba(255,255,255,0.05)',
                fontFamily: 'serif',
                pointerEvents: 'none',
                transform: 'rotate(-15deg)'
            }}>الله</div>

            {/* Header: Location & Weather */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.9)' }}>
                    <MapPin size={16} />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{locationName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.9)' }}>
                    {weather && (
                        <>
                            {getWeatherIcon(weather.weathercode)}
                            <span style={{ fontWeight: '600', fontSize: '14px' }}>{Math.round(weather.temperature)}°C</span>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content: Greeting & Countdown */}
            <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '16px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                    {t(greetingKey)}
                </h2>
                
                {nextPrayer && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '14px', color: '#D4AF37', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                            {getPrayerName(nextPrayer.key)} {t('prayer.time')}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="countdown-unit">
                                <span className="unit-value">{timeLeft ? formatNum(timeLeft.hours) : '--'}</span>
                                <span className="unit-label">{t('countdown.hours')}</span>
                            </div>
                            <span style={{ color: 'white', fontSize: '24px', fontWeight: '700', opacity: 0.5 }}>:</span>
                            <div className="countdown-unit">
                                <span className="unit-value">{timeLeft ? formatNum(timeLeft.minutes) : '--'}</span>
                                <span className="unit-label">{t('countdown.min')}</span>
                            </div>
                            <span style={{ color: 'white', fontSize: '24px', fontWeight: '700', opacity: 0.5 }}>:</span>
                            <div className="countdown-unit">
                                <span className="unit-value">{timeLeft ? formatNum(timeLeft.seconds) : '--'}</span>
                                <span className="unit-label">{t('countdown.sec')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom: Prayer Strip */}
            <div style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '12px 10px',
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 1,
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                {prayerList.map((prayer) => (
                    <div key={prayer.key} style={{
                        textAlign: 'center',
                        flex: 1,
                        opacity: nextPrayer?.key === prayer.key ? 1 : 0.6,
                        position: 'relative'
                    }}>
                        <div style={{ fontSize: '9px', color: '#fff', fontWeight: '500', marginBottom: '2px' }}>
                            {t(prayer.nameKey)}
                        </div>
                        <div style={{ fontSize: '12px', color: nextPrayer?.key === prayer.key ? '#D4AF37' : '#fff', fontWeight: '700' }}>
                            {timings[prayer.key]?.substring(0, 5) || '--:--'}
                        </div>
                        {nextPrayer?.key === prayer.key && (
                            <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#D4AF37' }}></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Floating Quick Stats (Invite & Streak) */}
            <div style={{
                position: 'absolute',
                top: '50px',
                right: '0px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 2
            }}>
                {streakData.current > 0 && (
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '6px 12px 6px 8px',
                        borderTopLeftRadius: '20px',
                        borderBottomLeftRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '700'
                    }}>
                        <Flame size={12} color="#FF9966" />
                        {streakData.current}
                    </div>
                )}
                 <button onClick={onOpenInvite} style={{
                    background: 'rgba(212, 175, 55, 0.9)',
                    border: 'none',
                    padding: '6px 12px 6px 8px',
                    borderTopLeftRadius: '20px',
                    borderBottomLeftRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#0F3D2E',
                    cursor: 'pointer'
                }}>
                    <UserPlus size={12} />
                </button>
            </div>

            <style>{`
                .countdown-unit {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .unit-value {
                    color: white;
                    font-size: 32px;
                    font-weight: 800;
                    font-family: 'Inter', system-ui, sans-serif;
                    line-height: 1;
                }
                .unit-label {
                    color: rgba(255,255,255,0.6);
                    font-size: 9px;
                    text-transform: uppercase;
                    font-weight: 700;
                    margin-top: 4px;
                }
                .premium-hero-container::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%);
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
});

export default PremiumHomeHero;
