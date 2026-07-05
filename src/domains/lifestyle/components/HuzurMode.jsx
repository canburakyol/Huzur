import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Moon, Clock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { SLEEP_SOUNDS, CATEGORIES } from '../../../data/sleepModeData';
import { logger } from '../../../utils/logger';
import { useAppStore } from '../../../stores/useAppStore';
import { cancelFocusSession, completeFocusSession, getActiveFocusSession, remainingMs, startFocusSession } from '../../../services/focusSessionService';
import './HuzurMode.css';
import '../../../components/app-shell/Navigation.css';

const HuzurMode = ({ onClose }) => {
    const { t } = useTranslation();
    
    const [activeCategory, setActiveCategory] = useState('nature');
    const [activeSound, setActiveSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const activeSession = useAppStore((state) => state.activeFocusSession?.kind === 'huzur_mode' ? state.activeFocusSession : null);
    const setActiveSession = useAppStore((state) => state.setActiveFocusSession);
    const [timer, setTimer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSleepMode, setIsSleepMode] = useState(false);

    const audioRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.loop = true;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        getActiveFocusSession('huzur_mode').then((session) => {
            if (cancelled || !session) return;
            setActiveSession(session);
            setTimer(Math.round(session.targetDuration / 60000));
            setTimeLeft(Math.ceil(remainingMs(session) / 1000));
        }).catch((error) => logger.error('Focus restore error:', error));
        return () => { cancelled = true; };
    }, [setActiveSession]);

    useEffect(() => {
        if (!activeSession) return;
        const refresh = async () => {
            const next = Math.ceil(remainingMs(activeSession) / 1000);
            setTimeLeft(next);
            if (next <= 0) {
                await completeFocusSession(activeSession);
                setActiveSession(null);
                setTimer(null);
                setIsPlaying(false);
                return;
            }
            timerRef.current = setTimeout(refresh, Math.min(1000, Math.max(100, activeSession.deadlineAt - Date.now())));
        };
        void refresh();
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [activeSession, setActiveSession]);

    useEffect(() => {
        if (!audioRef.current) return;

        if (activeSound && isPlaying) {
            if (!audioRef.current.src.includes(activeSound.url)) {
                audioRef.current.src = activeSound.url;
                audioRef.current.load();
            }
            audioRef.current.volume = volume;
            audioRef.current.play().catch(e => logger.error('Audio play error:', e));
        } else {
            audioRef.current.pause();
        }
    }, [activeSound, isPlaying, volume]);

    const handleTimerSet = async (minutes) => {
        if (timer === minutes) {
            await cancelFocusSession('huzur_mode');
            setActiveSession(null);
            setTimer(null);
            setTimeLeft(null);
        } else {
            const session = await startFocusSession('huzur_mode', String(minutes), minutes * 60 * 1000);
            setActiveSession(session);
            setTimer(minutes);
            setTimeLeft(minutes * 60);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (!activeSound) {
            const defaultSound = SLEEP_SOUNDS.find(s => s.category === activeCategory) || SLEEP_SOUNDS[0];
            setActiveSound(defaultSound);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    const toggleSleepMode = () => {
        setIsSleepMode(!isSleepMode);
    };

    return (
        <div className={`huzur-mode-overlay ${isSleepMode ? 'sleep-active' : ''}`}>
            {/* Sleep Mode Overlay (Click to wake) */}
            {isSleepMode && (
                <div onClick={toggleSleepMode} className="sleep-screen">
                    <div className="sleep-indicator">
                        <Moon size={64} className="floating sota-glow" color="#fde68a" />
                        <p style={{ marginTop: '20px', opacity: 0.8, letterSpacing: '1px' }}>{t('huzurMode.wake_hint', 'Uyandırmak için dokun')}</p>
                    </div>
                </div>
            )}

            <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px', opacity: isSleepMode ? 0 : 1 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <IslamicBackButton onClick={onClose} size="medium" />
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Moon size={24} color="var(--nav-accent)" />
                            {t('menu.huzurMode')}
                        </h2>
                    </div>
                    <button 
                        onClick={toggleSleepMode}
                        className="gece-modu-btn"
                    >
                        <Moon size={16} />
                        {t('huzurMode.night_mode', 'Gece Modu')}
                    </button>
                </div>

                {/* Main Visual / Timer */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '40px 0' }}>
                    <div className="huzur-visual-container" style={{ position: 'relative' }}>
                        {isPlaying && <div className="huzur-pulse"></div>}
                        <button
                            onClick={togglePlay}
                            className={`huzur-play-btn ${isPlaying ? 'playing' : ''} ${isPlaying ? 'sota-liquid-pulse' : ''}`}
                            style={{ 
                                transition: 'all 0.4s cubic-bezier(0.25, 1.5, 0.5, 1)',
                                boxShadow: isPlaying ? 'none' : '0 12px 30px rgba(245, 158, 11, 0.3)'
                            }}
                        >
                            {isPlaying ? <Pause size={40} /> : <Play size={40} style={{ marginLeft: '6px' }} />}
                        </button>
                    </div>

                    {timeLeft !== null && (
                        <div className="huzur-timer-display">
                            {formatTime(timeLeft)}
                        </div>
                    )}

                    {/* Timer Selection */}
                    <div className="velocity-target-grid" style={{ maxWidth: '300px', margin: '0 auto 24px' }}>
                        {[15, 30, 60].map(m => (
                            <button
                                key={m}
                                onClick={() => handleTimerSet(m)}
                                className={`velocity-target-btn ${timer === m ? 'active' : ''}`}
                                style={{ padding: '10px' }}
                            >
                                {m}m
                            </button>
                        ))}
                    </div>
                </div>

                {/* Controls & Categories */}
                <div className="settings-group">
                    <div className="settings-group-title">{t('huzurMode.categories', 'Kategoriler')}</div>
                    <div className="velocity-target-grid" style={{ marginBottom: '24px' }}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`velocity-target-btn ${activeCategory === cat.id ? 'active' : ''}`}
                            >
                                {t(cat.nameKey)}
                            </button>
                        ))}
                    </div>

                    <div className="settings-group-title">{t('huzurMode.sounds', 'Sesler')}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        {SLEEP_SOUNDS.filter(s => s.category === activeCategory).map(sound => {
                            const Icon = sound.icon;
                            const isActive = activeSound?.id === sound.id;
                            return (
                                <div key={sound.id}
                                    onClick={() => {
                                        setActiveSound(isActive ? null : sound);
                                        if (!isPlaying && !isActive) setIsPlaying(true);
                                    }}
                                    className={`huzur-sound-card ${isActive ? 'active' : ''}`}
                                >
                                    <div className="huzur-sound-icon">
                                        <Icon size={24} />
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', textAlign: 'center', color: isActive ? 'var(--nav-text)' : 'var(--nav-text-muted)' }}>
                                        {t(sound.nameKey)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Volume Control */}
                {activeSound && (
                    <div className="settings-card" style={{ marginTop: '32px', padding: '24px', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--nav-text)' }}>
                                <Volume2 size={20} />
                                <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>{t('huzurMode.volume', 'Ses Seviyesi')}</span>
                            </div>
                            <span style={{ fontWeight: '900', color: 'var(--nav-accent)' }}>{Math.round(volume * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="velocity-slider"
                        />
                    </div>
                )}

                <div className="settings-card" style={{ background: 'var(--nav-hover)', border: 'none', marginTop: '32px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Sparkles size={18} color="var(--nav-accent)" />
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                            {t('huzurMode.info_note', 'Huzur Modu, rahatlamanıza ve daha kaliteli bir uyku çekmenize yardımcı olacak asude sesler sunar. Zamanlayıcıyı kurarak cihazınızın pilinden tasarruf edebilirsiniz.')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HuzurMode;
