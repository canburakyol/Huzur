import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import PageHeader from '../../../components/shared/PageHeader';
import { calculateQiblaDirection, distanceToKaabaKm, normalizeHeading, turnToQibla } from '../qiblaMath';
import './QiblaCompass.css';

const ALIGNMENT_THRESHOLD_DEG = 5;
const DIAL = 300;
const C = DIAL / 2;
const TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

const polar = (deg, r) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};

const QiblaCompass = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const [heading, setHeading] = useState(null);
  const [position, setPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [compassError, setCompassError] = useState(null);
  const [locationAttempt, setLocationAttempt] = useState(0);
  const smoothHeading = useRef(null);
  const wasAligned = useRef(false);

  const qiblaDirection = position ? calculateQiblaDirection(position.latitude, position.longitude) : null;
  const usable = Number.isFinite(heading) && Number.isFinite(qiblaDirection);
  const turn = usable ? turnToQibla(heading, qiblaDirection) : null;
  const isAligned = usable && Math.abs(turn) <= ALIGNMENT_THRESHOLD_DEG;

  useEffect(() => {
    let mounted = true;
    const unavailable = () => mounted && setLocationError(t('qibla.locationRequired', 'Kıble yönü için güncel konum gerekli.'));
    if (!navigator.geolocation) { unavailable(); return () => { mounted = false; }; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { if (mounted) setPosition({ latitude: coords.latitude, longitude: coords.longitude }); },
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

  // One firm tap when the phone comes into line with the qibla, not on every sensor tick.
  useEffect(() => {
    if (isAligned && !wasAligned.current) void Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    wasAligned.current = isAligned;
  }, [isAligned]);

  const cardinals = [
    [0, t('qibla.north', 'K')], [90, t('qibla.east', 'D')], [180, t('qibla.south', 'G')], [270, t('qibla.west', 'B')],
  ];
  const numberFormat = new Intl.NumberFormat(i18n?.language || 'tr', { maximumFractionDigits: 0 });
  const guidance = !usable
    ? null
    : isAligned
      ? t('qibla.facing', 'Kıbleye dönüksün')
      : turn > 0
        ? t('qibla.turnRight', { deg: Math.round(turn), defaultValue: 'Sağa {{deg}}° dön' })
        : t('qibla.turnLeft', { deg: Math.round(-turn), defaultValue: 'Sola {{deg}}° dön' });

  const [kx, ky] = Number.isFinite(qiblaDirection) ? polar(qiblaDirection, 112) : [C, C];

  return <div className="hz-root qibla-screen">
    <PageHeader title={t('qibla.title', 'Kıble Pusulası')} onBack={onClose} />

    {locationError || compassError ? (
      <div className="hz-card qibla-message" role="alert">
        <p className="hz-body">{locationError || compassError}</p>
        {locationError && <button type="button" className="hz-btn hz-btn--secondary" onClick={() => { setLocationError(null); setLocationAttempt((n) => n + 1); }}>{t('qibla.retryLocation', 'Konumu tekrar dene')}</button>}
      </div>
    ) : (
      <>
        <div className={`qibla-guidance ${isAligned ? 'is-aligned' : ''}`} aria-live="polite">
          {guidance ?? t('qibla.calibrating', 'Pusula kalibre ediliyor; yön bilgisi bekleniyor.')}
        </div>

        <div className="qibla-stage">
          <svg className={`qibla-pointer ${isAligned ? 'is-aligned' : ''}`} width="28" height="20" viewBox="0 0 28 20" aria-hidden="true"><path d="M14 0 L28 20 H0 Z" /></svg>
          <svg className="qibla-dial" width={DIAL} height={DIAL} viewBox={`0 0 ${DIAL} ${DIAL}`} role="img"
            aria-label={usable ? guidance : t('qibla.title', 'Kıble Pusulası')}
            style={{ transform: `rotate(${-(heading ?? 0)}deg)` }}>
            <circle className="qibla-face" cx={C} cy={C} r={146} />
            <circle className="qibla-ring" cx={C} cy={C} r={138} />
            <circle className="qibla-ring" cx={C} cy={C} r={132} />
            {TICKS.map((deg) => {
              const major = deg % 90 === 0;
              const [x1, y1] = polar(deg, 132);
              const [x2, y2] = polar(deg, major ? 118 : 124);
              return <line key={deg} className={major ? 'qibla-tick is-major' : 'qibla-tick'} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
            {cardinals.map(([deg, label]) => {
              const [x, y] = polar(deg, 102);
              return <text key={deg} className={deg === 0 ? 'qibla-cardinal is-north' : 'qibla-cardinal'} x={x} y={y}
                transform={`rotate(${heading ?? 0} ${x} ${y})`}>{label}</text>;
            })}
            {Number.isFinite(qiblaDirection) && <>
              <line className="qibla-beam" x1={C} y1={C} x2={kx} y2={ky} />
              <g transform={`translate(${kx} ${ky}) rotate(${heading ?? 0})`}>
                <rect className="qibla-kaaba" x={-13} y={-13} width={26} height={26} rx={3} />
                <rect className="qibla-kaaba-band" x={-13} y={-7} width={26} height={4} />
              </g>
            </>}
            <circle className="qibla-hub" cx={C} cy={C} r={5} />
          </svg>
        </div>

        {Number.isFinite(qiblaDirection) && (
          <dl className="qibla-facts">
            <div><dt className="hz-overline">{t('qibla.angle', 'Kıble açısı')}</dt><dd>{Math.round(qiblaDirection)}°</dd></div>
            <div><dt className="hz-overline">{t('qibla.distance', "Kâbe'ye uzaklık")}</dt><dd>{numberFormat.format(distanceToKaabaKm(position.latitude, position.longitude))} km</dd></div>
          </dl>
        )}

        <p className="hz-label qibla-note">{t('qibla.instructions', 'Telefonunuzu yere paralel tutun; gerekirse havada 8 çizerek pusulayı kalibre edin.')} {t('qibla.approximateNote', 'Yön yaklaşık olabilir.')}</p>
      </>
    )}
  </div>;
};
export default QiblaCompass;
