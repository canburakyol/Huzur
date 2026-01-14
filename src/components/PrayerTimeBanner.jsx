import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * PrayerTimeBanner Component
 * Displays a premium banner with current prayer time
 * Matches mockup: Dark green-gold gradient, gold calligraphy, thin elegant design
 */
const PrayerTimeBanner = ({ timings, nextPrayer }) => {
    const { t } = useTranslation();

    // Calculate current prayer based on next prayer
    const currentPrayer = useMemo(() => {
        if (!timings || !nextPrayer) return null;
        const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const nextIndex = prayers.indexOf(nextPrayer.key);
        let currentIndex = nextIndex - 1;
        if (currentIndex < 0) currentIndex = 5;
        return prayers[currentIndex];
    }, [timings, nextPrayer]);

    // Prayer name translations
    const getPrayerName = () => {
        if (!currentPrayer) return '...';
        return t(`prayer.${currentPrayer.toLowerCase()}`);
    };

    return (
        <div style={{
            position: 'relative',
            height: '50px',
            background: 'linear-gradient(90deg, #0d3320 0%, #1a4a2e 30%, #2d5a3c 50%, #6b4f24 80%, #8b6914 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 15px',
            marginBottom: '15px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            borderBottom: '2px solid #d4af37'
        }}>
            {/* Left Arabic Calligraphy - Gold Color */}
            <div style={{ 
                fontFamily: "'Amiri', 'Scheherazade', serif", 
                fontSize: '16px', 
                color: '#d4af37',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                opacity: 0.9
            }}>
                ﴿بِسْمِ اللهِ﴾
            </div>

            {/* Center: Prayer Time - Elegant Gold Text */}
            <div style={{ 
                textAlign: 'center',
                color: '#f5e6c8'
            }}>
                <div style={{ 
                    fontFamily: "'Amiri', serif", 
                    fontSize: '20px', 
                    fontWeight: '600',
                    textShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    letterSpacing: '2px'
                }}>
                    {getPrayerName()} {t('prayer.time')}
                </div>
            </div>

            {/* Right Arabic Calligraphy - Gold Color */}
            <div style={{ 
                fontFamily: "'Amiri', 'Scheherazade', serif", 
                fontSize: '16px', 
                color: '#d4af37',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                opacity: 0.9
            }}>
                ﴿الرَّحْمٰنِ الرَّحِيمِ﴾
            </div>
        </div>
    );
};

export default PrayerTimeBanner;
