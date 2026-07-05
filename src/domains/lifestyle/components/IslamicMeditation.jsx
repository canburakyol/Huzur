import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Moon, Sun, Wind, Heart } from 'lucide-react';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { useAppStore } from '../../../stores/useAppStore';
import { cancelFocusSession, completeFocusSession, getActiveFocusSession, pauseFocusSession, remainingMs, resumeFocusSession, startFocusSession } from '../../../services/focusSessionService';
import { logger } from '../../../utils/logger';

// Meditasyon Seansları
const MEDITATION_SESSIONS = [
  {
    id: 'morning',
    icon: <Sun size={28} />,
    duration: 5,
    color: '#f39c12',
    gradient: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)'
  },
  {
    id: 'calm',
    icon: <Wind size={28} />,
    duration: 10,
    color: '#3498db',
    gradient: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)'
  },
  {
    id: 'night',
    icon: <Moon size={28} />,
    duration: 7,
    color: '#9b59b6',
    gradient: 'linear-gradient(135deg, #9b59b6 0%, #2c3e50 100%)'
  },
  {
    id: 'gratitude',
    icon: <Heart size={28} />,
    duration: 5,
    color: '#e74c3c',
    gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
  }
];

const IslamicMeditation = ({ onClose }) => {
  const { t } = useTranslation();
  const activeSession = useAppStore((state) => state.activeFocusSession?.kind === 'islamic_meditation' ? state.activeFocusSession : null);
  const setActiveSession = useAppStore((state) => state.setActiveFocusSession);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef(null);

  // Zamanlayıcı
  useEffect(() => {
    let cancelled = false;
    getActiveFocusSession('islamic_meditation').then((session) => {
      if (cancelled || !session) return;
      const preset = MEDITATION_SESSIONS.find((item) => item.id === session.presetId);
      if (!preset) return;
      setSelectedSession(preset);
      setActiveSession(session);
      setIsPlaying(session.status === 'active');
      setTimeRemaining(Math.ceil(remainingMs(session) / 1000));
    }).catch((error) => logger.error('Meditation restore error:', error));
    return () => { cancelled = true; };
  }, [setActiveSession]);

  useEffect(() => {
    if (!activeSession) return;
    const refresh = async () => {
      const next = Math.ceil(remainingMs(activeSession) / 1000);
      setTimeRemaining(next);
      if (next <= 0 && activeSession.status === 'active') {
        await completeFocusSession(activeSession);
        setActiveSession(null);
        setIsPlaying(false);
        return;
      }
      if (activeSession.status === 'active') timerRef.current = setTimeout(refresh, Math.min(1000, Math.max(100, activeSession.deadlineAt - Date.now())));
    };
    void refresh();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeSession, setActiveSession]);

  const startSession = async (session) => {
    const persisted = await startFocusSession('islamic_meditation', session.id, session.duration * 60 * 1000);
    setSelectedSession(session);
    setActiveSession(persisted);
    setTimeRemaining(session.duration * 60);
    setIsPlaying(true);
  };

  const togglePlay = async () => {
    if (!activeSession) return;
    const updated = isPlaying ? await pauseFocusSession(activeSession) : await resumeFocusSession(activeSession);
    setActiveSession(updated);
    setIsPlaying(!isPlaying);
  };

  const resetSession = async () => {
    const persisted = await startFocusSession('islamic_meditation', selectedSession.id, selectedSession.duration * 60 * 1000);
    setActiveSession(persisted);
    setIsPlaying(true);
    setTimeRemaining(selectedSession.duration * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = selectedSession ? ((selectedSession.duration * 60 - timeRemaining) / (selectedSession.duration * 60)) * 100 : 0;

  // Seans Seçim Ekranı
  if (!selectedSession) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', padding: '20px', background: 'var(--bg-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
          <IslamicBackButton onClick={onClose} />
          <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--primary)' }}>
            🧘 {t('meditation.title')}
          </h2>
        </div>

        <p style={{ color: 'var(--text-color-muted)', marginBottom: '25px', lineHeight: 1.6 }}>
          {t('meditation.description')}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {MEDITATION_SESSIONS.map(session => (
            <div
              key={session.id}
              onClick={() => startSession(session)}
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: session.gradient,
                color: 'var(--on-primary)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'transform 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ marginBottom: '10px' }}>{session.icon}</div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>{t(`meditation.sessions.${session.id}`)}</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>{session.duration} {t('meditation.minutes')}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Aktif Seans Ekranı
  return (
    <div style={{
      minHeight: '100vh',
      background: selectedSession.gradient,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: 'var(--on-primary)'
    }}>
      {/* Geri Butonu */}
      <button
        onClick={async () => {
          await cancelFocusSession('islamic_meditation');
          setActiveSession(null);
          setSelectedSession(null);
          setIsPlaying(false);
        }}
        style={{
          position: 'absolute', top: '20px', left: '20px',
          background: 'rgba(255,255,255,0.2)', border: 'none',
          borderRadius: '50%', width: '40px', height: '40px',
          color: 'var(--on-primary)', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}
      >
        ←
      </button>

      {/* Ses Kontrolü */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'rgba(255,255,255,0.2)', border: 'none',
          borderRadius: '50%', width: '40px', height: '40px',
          color: 'var(--on-primary)', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Seans Başlığı */}
      <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '40px', textAlign: 'center' }}>
        {t(`meditation.sessions.${selectedSession.id}`)}
      </div>

      {/* Progress Ring */}
      <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '40px' }}>
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r="90" fill="none" stroke='var(--on-primary)' strokeWidth="8"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', fontWeight: '700'
        }}>
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Kontroller */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          onClick={resetSession}
          style={{
            width: '50px', height: '50px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: 'none',
            color: 'var(--on-primary)', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          <RotateCcw size={24} />
        </button>
        <button
          onClick={togglePlay}
          style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'var(--surface-card)', border: 'none',
            color: selectedSession.color, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
        </button>
      </div>

      {/* Motivasyon */}
      {isPlaying && (
        <p style={{ marginTop: '40px', fontSize: '14px', opacity: 0.8, textAlign: 'center', maxWidth: '280px' }}>
          {t('meditation.breathe')}
        </p>
      )}
    </div>
  );
};

export default IslamicMeditation;
