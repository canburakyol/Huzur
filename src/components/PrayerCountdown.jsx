import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// calculateTimeLeft fonksiyonunu component seviyesinde tanımlıyoruz
const calculateTimeLeft = (timings, nextPrayer) => {
    if (!timings || !nextPrayer) return '';
    
    const now = new Date();
    const [targetH, targetM] = timings[nextPrayer.key].split(':').map(Number);

    const targetTime = new Date();
    targetTime.setHours(targetH, targetM, 0, 0);

    // If target time is earlier than now, it means it's tomorrow (e.g. Isha to Fajr)
    if (targetTime < now) {
        targetTime.setDate(targetTime.getDate() + 1);
    }

    const diff = targetTime - now;

    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
};

const PrayerCountdown = ({ timings, nextPrayer }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(timings, nextPrayer));

    useEffect(() => {
        if (!timings || !nextPrayer) return;

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(timings, nextPrayer));
        }, 1000);

        return () => clearInterval(timer);
    }, [timings, nextPrayer]);

    if (!timings || !nextPrayer) return null;

    const formatNum = (n) => String(n).padStart(2, '0');

    // Prayer times data for the strip
    const prayerList = [
        { key: 'Fajr', nameKey: 'prayer.fajr' },
        { key: 'Sunrise', nameKey: 'prayer.sunrise' },
        { key: 'Dhuhr', nameKey: 'prayer.dhuhr' },
        { key: 'Asr', nameKey: 'prayer.asr' },
        { key: 'Maghrib', nameKey: 'prayer.maghrib' },
        { key: 'Isha', nameKey: 'prayer.isha' }
    ];

    // Get translated prayer name for countdown
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

    return (
        <>
            {/* Prayer Times Strip */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 8px',
                marginBottom: '8px',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                {prayerList.map((prayer) => (
                    <div key={prayer.key} style={{
                        textAlign: 'center',
                        flex: 1,
                        borderRight: prayer.key !== 'Isha' ? '1px solid rgba(0,0,0,0.08)' : 'none',
                        opacity: nextPrayer.key === prayer.key ? 1 : 0.6
                    }}>
                        <div style={{
                            fontSize: '10px',
                            color: nextPrayer.key === prayer.key ? '#0F3D2E' : '#666',
                            fontWeight: nextPrayer.key === prayer.key ? '700' : '500',
                            marginBottom: '2px'
                        }}>
                            {t(prayer.nameKey)}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: nextPrayer.key === prayer.key ? '#0F3D2E' : '#333',
                            fontWeight: nextPrayer.key === prayer.key ? '700' : '600'
                        }}>
                            {timings[prayer.key]?.substring(0, 5) || '--:--'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Countdown Card - White Background */}
            <div style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
                borderRadius: '16px',
                padding: '14px 16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(15, 61, 46, 0.15)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative accent */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #0F3D2E, #1A5C45, #0F3D2E)'
                }} />
                
                {/* Left side - Prayer name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{
                        color: '#0F3D2E',
                        fontSize: '13px',
                        fontWeight: '600'
                    }}>
                        {t('countdown.timeUntil', { prayer: getPrayerName(nextPrayer.key) })}
                    </span>
                    <span style={{
                        color: '#1A5C45',
                        fontSize: '15px',
                        fontWeight: '700'
                    }}>
                        {t('countdown.remaining')}
                    </span>
                    <span style={{
                        color: '#666',
                        fontSize: '13px',
                        fontWeight: '500'
                    }}>
                        {t('countdown.time')}: {timings[nextPrayer.key]}
                    </span>
                </div>

                {/* Right side - Countdown (larger for elderly users) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Hours */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0F3D2E 0%, #1A5C45 100%)',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        minWidth: '48px',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: '#D4AF37', fontSize: '26px', fontWeight: '700', fontFamily: 'monospace', lineHeight: 1 }}>
                            {timeLeft.hours !== undefined ? formatNum(timeLeft.hours) : '--'}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', textTransform: 'uppercase', marginTop: '2px' }}>{t('countdown.hours')}</div>
                    </div>
                    
                    <span style={{ color: '#0F3D2E', fontSize: '26px', fontWeight: '700' }}>:</span>
                    
                    {/* Minutes */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0F3D2E 0%, #1A5C45 100%)',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        minWidth: '48px',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: '#D4AF37', fontSize: '26px', fontWeight: '700', fontFamily: 'monospace', lineHeight: 1 }}>
                            {timeLeft.minutes !== undefined ? formatNum(timeLeft.minutes) : '--'}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', textTransform: 'uppercase', marginTop: '2px' }}>{t('countdown.min')}</div>
                    </div>
                    
                    <span style={{ color: '#0F3D2E', fontSize: '26px', fontWeight: '700' }}>:</span>
                    
                    {/* Seconds */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0F3D2E 0%, #1A5C45 100%)',
                        borderRadius: '10px',
                        padding: '8px 10px',
                        minWidth: '48px',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: '#D4AF37', fontSize: '26px', fontWeight: '700', fontFamily: 'monospace', lineHeight: 1 }}>
                            {timeLeft.seconds !== undefined ? formatNum(timeLeft.seconds) : '--'}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', textTransform: 'uppercase', marginTop: '2px' }}>{t('countdown.sec')}</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrayerCountdown;
