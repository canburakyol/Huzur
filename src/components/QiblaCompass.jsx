import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const QiblaCompass = ({ onClose }) => {
    const { t } = useTranslation();
    const [heading, setHeading] = useState(0);
    const [error, setError] = useState(null);
    const [qiblaDirection, setQiblaDirection] = useState(null);
    const [magneticDeclination, setMagneticDeclination] = useState(0);

    // Smoothing reference
    const smoothHeading = useRef(0);

    // Kabe koordinatları
    const KAABA_LAT = 21.4225;
    const KAABA_LNG = 39.8262;

    /**
     * Manyetik Sapma Hesaplama (Simplified World Magnetic Model)
     */
    const calculateMagneticDeclination = (lat, lng) => {
        if (lat >= 35 && lat <= 42 && lng >= 26 && lng <= 45) {
            const baseDeclination = 4.5;
            const latFactor = (lat - 38) * 0.1;
            const lngFactor = (lng - 35) * 0.05;
            return baseDeclination + latFactor + lngFactor;
        }
        
        if (lat >= 45 && lat <= 60 && lng >= 0 && lng <= 30) {
            return 2.0 + (lng * 0.1);
        }
        
        if (lat >= 20 && lat <= 40 && lng >= 35 && lng <= 60) {
            return 3.0 + ((lng - 40) * 0.08);
        }
        
        if (lat >= 25 && lat <= 50 && lng >= -130 && lng <= -60) {
            return -10.0 + ((lng + 90) * 0.15);
        }
        
        return 0;
    };

    // Kıble yönünü hesapla (Great Circle formülü)
    const calculateQiblaDirection = (userLat, userLng) => {
        const lat1 = userLat * Math.PI / 180;
        const lat2 = KAABA_LAT * Math.PI / 180;
        const lngDiff = (KAABA_LNG - userLng) * Math.PI / 180;

        const y = Math.sin(lngDiff);
        const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lngDiff);

        let qibla = Math.atan2(y, x) * 180 / Math.PI;
        qibla = (qibla + 360) % 360;

        return qibla;
    };

    // Kullanıcı konumunu al ve Kıble yönünü hesapla
    useEffect(() => {
        let isMounted = true;

        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        if (!isMounted) return;
                        const { latitude, longitude } = position.coords;
                        
                        const direction = calculateQiblaDirection(latitude, longitude);
                        setQiblaDirection(direction);
                        
                        const declination = calculateMagneticDeclination(latitude, longitude);
                        setMagneticDeclination(declination);
                        
                        console.log(`[Qibla] Konum: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                        console.log(`[Qibla] Gerçek Kıble: ${direction.toFixed(1)}°, Manyetik Sapma: ${declination.toFixed(1)}°`);
                    },
                    () => {
                        if (!isMounted) return;
                        const fallbackDirection = calculateQiblaDirection(39.9334, 32.8597);
                        setQiblaDirection(fallbackDirection);
                        setMagneticDeclination(5.0);
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            } else {
                const fallbackDirection = calculateQiblaDirection(39.9334, 32.8597);
                setQiblaDirection(fallbackDirection);
                setMagneticDeclination(5.0);
            }
        };

        getLocation();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const handleOrientation = (event) => {
            let compass = 0;

            if (event.webkitCompassHeading) {
                compass = event.webkitCompassHeading;
            } else if (event.alpha !== null) {
                compass = Math.abs(event.alpha - 360);
            }

            // Low-pass filter for smoothing
            let diff = compass - smoothHeading.current;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            smoothHeading.current += diff * 0.1;

            if (smoothHeading.current >= 360) smoothHeading.current -= 360;
            if (smoothHeading.current < 0) smoothHeading.current += 360;

            setHeading(smoothHeading.current);
        };

        const startCompass = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    } else {
                        setError(t('qibla.permissionDenied'));
                    }
                } catch {
                    setError(t('qibla.notSupported'));
                }
            } else {
                if ('ondeviceorientationabsolute' in window) {
                    window.addEventListener('deviceorientationabsolute', handleOrientation);
                } else {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            }
        };

        startCompass();

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            if ('ondeviceorientationabsolute' in window) {
                window.removeEventListener('deviceorientationabsolute', handleOrientation);
            }
        };
    }, [t]);

    const baseQibla = qiblaDirection !== null ? qiblaDirection : 147;
    const QIBLA_OFFSET = (baseQibla - magneticDeclination + 360) % 360;
    const isAligned = Math.abs(heading - QIBLA_OFFSET) < 5 || Math.abs(heading - QIBLA_OFFSET) > 355;

    return (
        <div className="glass-card" style={{
            textAlign: 'center',
            position: 'relative',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            <button onClick={onClose} style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'rgba(255,255,255,0.8)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                zIndex: 100
            }}>×</button>

            <h2 style={{ color: '#2c3e50', marginBottom: '10px', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>{t('qibla.title')}</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '30px', fontSize: '14px' }}>
                {t('qibla.instructions')}
            </p>

            {error ? (
                <div style={{ color: '#e74c3c', padding: '20px', background: 'rgba(255,255,255,0.9)', borderRadius: '10px' }}>
                    {error}
                </div>
            ) : (
                <div style={{ position: 'relative', width: '300px', height: '300px' }}>

                    {/* Fixed Indicator (Phone Direction) */}
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            width: '0',
                            height: '0',
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderBottom: '20px solid #e74c3c'
                        }}></div>
                    </div>

                    {/* Rotating Compass Dial */}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        transform: `rotate(${-heading}deg)`,
                        transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        borderRadius: '50%',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2), inset 0 0 20px rgba(0,0,0,0.1)',
                        background: 'url(/compass_dial.png) center/cover no-repeat',
                        border: '5px solid #d4af37'
                    }}>
                        {/* Qibla Marker (Fixed on Dial) */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: '100%',
                            height: '100%',
                            transform: `translate(-50%, -50%) rotate(${QIBLA_OFFSET}deg)`,
                            pointerEvents: 'none'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '15%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🕋</span>
                                <div style={{
                                    width: '2px',
                                    height: '40px',
                                    background: 'linear-gradient(to bottom, #27ae60, transparent)',
                                    marginTop: '5px'
                                }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Center Pin */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '16px',
                        height: '16px',
                        background: 'radial-gradient(circle at 30% 30%, #ffd700, #b8860b)',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 15,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.4)'
                    }}></div>
                </div>
            )}

            <div style={{
                marginTop: '40px',
                padding: '15px 30px',
                background: isAligned ? '#27ae60' : 'rgba(255,255,255,0.8)',
                color: isAligned ? 'white' : '#2c3e50',
                borderRadius: '30px',
                fontWeight: 'bold',
                fontSize: '18px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
            }}>
                {isAligned ? t('qibla.found') : `${Math.round(heading)}°`}
            </div>
        </div>
    );
};

export default QiblaCompass;
