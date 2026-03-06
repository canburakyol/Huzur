import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, MapPin, Info, ArrowUp, CheckCircle2, Camera, CameraOff } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import './QiblaCompass.css';
import './Navigation.css';

// ── Sabitler ────────────────────────────────────────────────────
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const ALIGNMENT_THRESHOLD_DEG = 5;

// ── Yardımcı Fonksiyonlar ────────────────────────────────────────
const calculateMagneticDeclination = (lat, lng) => {
    if (lat >= 35 && lat <= 42 && lng >= 26 && lng <= 45) {
        return 4.5 + (lat - 38) * 0.1 + (lng - 35) * 0.05;
    }
    return 0;
};

const calculateQiblaDirection = (userLat, userLng) => {
    const lat1 = userLat * Math.PI / 180;
    const lat2 = KAABA_LAT * Math.PI / 180;
    const lngDiff = (KAABA_LNG - userLng) * Math.PI / 180;
    const y = Math.sin(lngDiff);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lngDiff);
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
};

// ── AR Canvas Çizimi ────────────────────────────────────────────
const drawAROverlay = (canvas, qiblaOffset, heading, isAligned) => {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    // Kıble yönü açısı (kameraya göre)
    const angleDeg = (qiblaOffset - heading + 360) % 360;
    const angleRad = (angleDeg - 90) * Math.PI / 180;

    // Yön çizgisi
    const lineLength = Math.min(width, height) * 0.38;
    const endX = cx + Math.cos(angleRad) * lineLength;
    const endY = cy + Math.sin(angleRad) * lineLength;

    // Glow efekti
    ctx.shadowColor = isAligned ? '#f59e0b' : 'rgba(15, 118, 110, 0.8)';
    ctx.shadowBlur = isAligned ? 24 : 12;

    // Çizgi
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = isAligned ? '#fbbf24' : '#0f766e';
    ctx.lineWidth = isAligned ? 4 : 2.5;
    ctx.setLineDash(isAligned ? [] : [12, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ok başı
    const arrowSize = 18;
    const arrowAngle = Math.atan2(endY - cy, endX - cx);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
        endY - arrowSize * Math.sin(arrowAngle - Math.PI / 6)
    );
    ctx.lineTo(
        endX - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
        endY - arrowSize * Math.sin(arrowAngle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = isAligned ? '#fbbf24' : '#0f766e';
    ctx.fill();

    // Kabe ikonu (ok ucunda)
    ctx.shadowBlur = 0;
    const iconSize = 28;
    const iconX = endX - iconSize / 2;
    const iconY = endY - iconSize - 10;
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.roundRect(iconX, iconY, iconSize, iconSize, 4);
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Altın şerit
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(iconX, iconY + iconSize * 0.3, iconSize, 3);

    // Merkez nokta
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = isAligned ? '#fbbf24' : 'rgba(15, 118, 110, 0.9)';
    ctx.fill();

    // Hizalama metni
    if (isAligned) {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓ Kıble Bulundu', cx, height - 40);
        ctx.shadowBlur = 0;
    }
};

// ── Bileşen ─────────────────────────────────────────────────────
const QiblaCompass = ({ onClose }) => {
    const { t } = useTranslation();
    const [heading, setHeading] = useState(0);
    const [error, setError] = useState(null);
    const [qiblaDirection, setQiblaDirection] = useState(null);
    const [magneticDeclination, setMagneticDeclination] = useState(0);
    const [isARMode, setIsARMode] = useState(false);
    const [arError, setArError] = useState(null);

    const smoothHeading = useRef(0);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animFrameRef = useRef(null);

    const baseQibla = qiblaDirection ?? 147;
    const QIBLA_OFFSET = (baseQibla - magneticDeclination + 360) % 360;
    const isAligned = Math.abs(heading - QIBLA_OFFSET) < ALIGNMENT_THRESHOLD_DEG
        || Math.abs(heading - QIBLA_OFFSET) > 360 - ALIGNMENT_THRESHOLD_DEG;

    // ── Konum ──────────────────────────────────────────────────
    useEffect(() => {
        let isMounted = true;
        const fallback = () => {
            if (!isMounted) return;
            setQiblaDirection(calculateQiblaDirection(39.9334, 32.8597));
            setMagneticDeclination(5.0);
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords: { latitude, longitude } }) => {
                    if (!isMounted) return;
                    setQiblaDirection(calculateQiblaDirection(latitude, longitude));
                    setMagneticDeclination(calculateMagneticDeclination(latitude, longitude));
                },
                fallback,
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            fallback();
        }
        return () => { isMounted = false; };
    }, []);

    // ── Pusula ─────────────────────────────────────────────────
    useEffect(() => {
        const handleOrientation = (event) => {
            let compass = event.webkitCompassHeading ?? Math.abs((event.alpha ?? 0) - 360);
            let diff = compass - smoothHeading.current;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            smoothHeading.current = ((smoothHeading.current + diff * 0.2) + 360) % 360;
            setHeading(smoothHeading.current);
        };

        const startCompass = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined'
                && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const perm = await DeviceOrientationEvent.requestPermission();
                    if (perm === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    } else {
                        setError(t('qibla.permissionDenied', 'Pusula izni reddedildi.'));
                    }
                } catch {
                    setError(t('qibla.notSupported', 'Pusula bu cihazda desteklenmiyor.'));
                }
            } else {
                const evName = 'ondeviceorientationabsolute' in window
                    ? 'deviceorientationabsolute'
                    : 'deviceorientation';
                window.addEventListener(evName, handleOrientation);
            }
        };

        startCompass();
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('deviceorientationabsolute', handleOrientation);
        };
    }, [t]);

    // ── AR Kamera ──────────────────────────────────────────────
    const startAR = useCallback(async () => {
        setArError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch {
            setArError(t('qibla.cameraError', 'Kamera açılamadı. İzin verdiğinizden emin olun.'));
            setIsARMode(false);
        }
    }, [t]);

    const stopAR = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
    }, []);

    // AR toggle — doğrudan handler'dan çağrılır (useEffect'e gerek yok)
    const handleARToggle = useCallback(() => {
        setIsARMode((prev) => {
            const next = !prev;
            if (next) {
                // Kısa gecikme ile başlat (state güncellendikten sonra)
                setTimeout(startAR, 0);
            } else {
                stopAR();
            }
            return next;
        });
    }, [startAR, stopAR]);

    // Unmount'ta kamerayı kapat
    useEffect(() => stopAR, [stopAR]);


    // ── AR Canvas Animasyon Döngüsü ────────────────────────────
    useEffect(() => {
        if (!isARMode || !canvasRef.current) return;

        const loop = () => {
            if (canvasRef.current) {
                drawAROverlay(canvasRef.current, QIBLA_OFFSET, heading, isAligned);
            }
            animFrameRef.current = requestAnimationFrame(loop);
        };
        animFrameRef.current = requestAnimationFrame(loop);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isARMode, QIBLA_OFFSET, heading, isAligned]);

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px', alignItems: 'center' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', width: '100%' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)', flex: 1 }}>
                    {t('qibla.title', 'Kıble Pusulası')}
                </h2>
                {/* AR Toggle */}
                <button
                    onClick={handleARToggle}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        borderRadius: '14px',
                        border: '1px solid var(--nav-border)',
                        background: isARMode ? 'var(--nav-accent)' : 'var(--nav-hover)',
                        color: isARMode ? 'white' : 'var(--nav-text)',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                >
                    {isARMode ? <CameraOff size={16} /> : <Camera size={16} />}
                    AR
                </button>
            </div>

            {/* AR Kamera Hatası */}
            {arError && (
                <div className="settings-card" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', marginBottom: '16px', width: '100%' }}>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>{arError}</p>
                </div>
            )}

            {/* AR Modu */}
            {isARMode && !arError && (
                <div className="ar-viewport">
                    <video ref={videoRef} className="ar-video" playsInline muted />
                    <canvas
                        ref={canvasRef}
                        className="ar-canvas"
                        width={640}
                        height={480}
                    />
                    <div className="ar-badge">
                        <Camera size={12} />
                        AR Modu
                    </div>
                </div>
            )}

            {/* 2D Pusula Modu */}
            {!isARMode && (
                <>
                    <div className="settings-card" style={{ background: 'var(--nav-hover)', border: 'none', marginBottom: '32px', textAlign: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <Info size={18} color="var(--nav-text-muted)" />
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                                {t('qibla.instructions', 'Telefonunuzu düz tutun ve Kabe sembolünü en üstteki okla hizalayın.')}
                            </p>
                        </div>
                    </div>

                    {error ? (
                        <div className="settings-card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '24px', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontWeight: '700' }}>{error}</p>
                        </div>
                    ) : (
                        <div className="compass-viewport">
                            <div className={`heading-indicator ${isAligned ? 'aligned' : ''}`}>
                                <ArrowUp size={32} />
                            </div>
                            <div className="compass-outer-ring"></div>
                            <div
                                className="compass-dial"
                                style={{ transform: `rotate(${-heading}deg)`, willChange: 'transform' }}
                            >
                                <div className="direction-marker marker-n">N</div>
                                <div className="direction-marker marker-e">E</div>
                                <div className="direction-marker marker-s">S</div>
                                <div className="direction-marker marker-w">W</div>
                                <div
                                    className="qibla-marker-wrapper"
                                    style={{ transform: `translate(-50%, -50%) rotate(${QIBLA_OFFSET}deg)` }}
                                >
                                    <div className="kaaba-icon-container">
                                        <div className="kaaba-symbol">
                                            <div className="kaaba-cube"></div>
                                            <div className="kaaba-gold-line"></div>
                                        </div>
                                        <div className={`qibla-beam ${isAligned ? 'active' : ''}`}></div>
                                    </div>
                                </div>
                                <div className="compass-pin"></div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Durum Paneli */}
            <div className={`qibla-status-card ${isAligned ? 'aligned' : ''}`} style={{ marginTop: isARMode ? '16px' : 'auto' }}>
                {isAligned ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle2 size={24} />
                        <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>{t('qibla.found', 'Kıble Bulundu')}</span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="settings-icon-box" style={{ background: 'rgba(180, 83, 9, 0.1)', color: 'var(--nav-accent)' }}>
                            <Compass size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--nav-text)' }}>{Math.round(heading)}°</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--nav-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {t('qibla.heading', 'Mevcut Yön')}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px', opacity: 0.5 }}>
                <MapPin size={14} />
                <span style={{ fontSize: '12px', fontWeight: '600' }}>
                    {qiblaDirection ? `${Math.round(qiblaDirection)}°` : '--°'} {t('qibla.target', 'Hedef')}
                </span>
            </div>
        </div>
    );
};

export default QiblaCompass;
