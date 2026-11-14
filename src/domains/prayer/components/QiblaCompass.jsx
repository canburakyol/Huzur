import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, Info, MapPin } from 'lucide-react';
import PageHeader from '../../../components/shared/PageHeader';
import './QiblaCompass.css';
import '../../../components/app-shell/Navigation.css';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const ALIGNMENT_THRESHOLD_DEG = 5;
const normalizeHeading = (degrees) => ((degrees % 360) + 360) % 360;
const calculateQiblaDirection = (latitude, longitude) => {
  const lat1 = latitude * Math.PI / 180;
  const lat2 = KAABA_LAT * Math.PI / 180;
  const longitudeDelta = (KAABA_LNG - longitude) * Math.PI / 180;
  return normalizeHeading(Math.atan2(Math.sin(longitudeDelta), Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(longitudeDelta)) * 180 / Math.PI);
};

const QiblaCompass = ({ onClose }) => {
  const { t } = useTranslation();
  const [heading, setHeading] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [compassError, setCompassError] = useState(null);
  const [locationAttempt, setLocationAttempt] = useState(0);
  const smoothHeading = useRef(null);
  const usable = Number.isFinite(heading) && Number.isFinite(qiblaDirection);
  const difference = usable ? Math.abs(((heading - qiblaDirection + 540) % 360) - 180) : null;
  const isAligned = usable && difference <= ALIGNMENT_THRESHOLD_DEG;

  useEffect(() => {
    let mounted = true;
    const unavailable = () => mounted && setLocationError(t('qibla.locationRequired', 'Kıble yönü için güncel konum gerekli.'));
    if (!navigator.geolocation) { unavailable(); return () => { mounted = false; }; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { if (mounted) setQiblaDirection(calculateQiblaDirection(coords.latitude, coords.longitude)); },
      unavailable,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
    return () => { mounted = false; };
  }, [t, locationAttempt]);

  useEffect(() => {
    const handleOrientation = (event) => {
      const raw = event.webkitCompassHeading ?? (Number.isFinite(event.alpha) ? normalizeHeading(360 - event.alpha) : null);
      if (!Number.isFinite(raw)) return;
      const previous = smoothHeading.current;
      const delta = previous === null ? 0 : ((raw - previous + 540) % 360) - 180;
      smoothHeading.current = normalizeHeading((previous ?? raw) + delta * 0.2);
      setHeading(smoothHeading.current);
    };
    const start = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') { setCompassError(t('qibla.permissionDenied', 'Pusula izni reddedildi.')); return; }
      }
      window.addEventListener('deviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation', handleOrientation);
    };
    void start().catch(() => setCompassError(t('qibla.notSupported', 'Pusula bu cihazda desteklenmiyor.')));
    return () => { window.removeEventListener('deviceorientation', handleOrientation); window.removeEventListener('deviceorientationabsolute', handleOrientation); };
  }, [t]);

  const blocking = locationError || compassError || !usable;
  return <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px', alignItems: 'center' }}>
    <div style={{ width: 'calc(100% + 32px)', margin: '0 -16px 16px' }}><PageHeader title={t('qibla.title', 'Kıble Pusulası')} onBack={onClose} /></div>
    <div className="settings-card" style={{ width: '100%', marginBottom: '16px' }}><Info size={18} /><p>{t('qibla.instructions', 'Telefonunuzu düz tutun ve Kabe sembolünü en üstteki okla hizalayın.')} {t('qibla.approximateNote', 'Yön yaklaşık olabilir.')}</p></div>
    {blocking ? <div className="settings-card" style={{ width: '100%', color: '#ef4444', textAlign: 'center' }}><p>{locationError || compassError || t('qibla.calibrating', 'Pusula kalibre ediliyor; yön bilgisi bekleniyor.')}</p>{locationError && <button type="button" className="velocity-target-btn" style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }} onClick={() => { setLocationError(null); setLocationAttempt((n) => n + 1); }}>{t('qibla.retryLocation', 'Konumu tekrar dene')}</button>}</div> : <>
      <div className="compass-viewport"><div className={`heading-indicator ${isAligned ? 'aligned' : ''}`}>▲</div><div className="compass-outer-ring" /><div className="compass-dial" style={{ transform: `rotate(${-heading}deg)` }}><div className="direction-marker marker-n">N</div><div className="direction-marker marker-e">E</div><div className="direction-marker marker-s">S</div><div className="direction-marker marker-w">W</div><div className="qibla-marker-wrapper" style={{ transform: `translate(-50%, -50%) rotate(${qiblaDirection}deg)` }}>🕋</div><div className="compass-pin" /></div></div>
      <div className={`qibla-status-card ${isAligned ? 'aligned' : ''}`}>{isAligned ? <strong>{t('qibla.found', 'Kıble Bulundu')}</strong> : <><Compass size={20} /><strong>{Math.round(heading)}°</strong></>}</div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px', opacity: 0.7 }}><MapPin size={14} /><span>{Math.round(qiblaDirection)}° {t('qibla.target', 'Hedef')} · {t('qibla.approximate', 'Yaklaşık yön')}</span></div>
    </>}
  </div>;
};
export default QiblaCompass;
