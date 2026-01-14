import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Moon, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from './shared/IslamicBackButton';
import { SLEEP_SOUNDS, CATEGORIES } from '../data/sleepModeData';

const HuzurMode = ({ onClose }) => {
    const { t } = useTranslation();
    
    const [activeCategory, setActiveCategory] = useState('nature');
    const [activeSound, setActiveSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [timer, setTimer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSleepMode, setIsSleepMode] = useState(false); // Ekran karartma modu

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
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (!audioRef.current) return;

        if (activeSound && isPlaying) {
            // Eğer aynı ses değilse kaynağı değiştir
            if (!audioRef.current.src.includes(activeSound.url)) {
                audioRef.current.src = activeSound.url;
                audioRef.current.load();
            }
            audioRef.current.volume = volume;
            audioRef.current.play().catch(e => console.error('Audio play error:', e));
        } else {
            audioRef.current.pause();
        }
    }, [activeSound, isPlaying, volume]);

    const handleTimerSet = (minutes) => {
        if (timer === minutes) {
            setTimer(null);
            setTimeLeft(null);
            if (timerRef.current) clearInterval(timerRef.current);
        } else {
            setTimer(minutes);
            setTimeLeft(minutes * 60);
            if (timerRef.current) clearInterval(timerRef.current);
            
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setIsPlaying(false);
                        setTimer(null);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (!activeSound) {
            // Varsayılan olarak ilk sesi seç
            const defaultSound = SLEEP_SOUNDS.find(s => s.category === activeCategory) || SLEEP_SOUNDS[0];
            setActiveSound(defaultSound);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    // Sleep Mode Toggle
    const toggleSleepMode = () => {
        setIsSleepMode(!isSleepMode);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
            background: isSleepMode ? '#000' : 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            transition: 'background 0.5s ease'
        }}>
            {/* Sleep Mode Overlay (Click to wake) */}
            {isSleepMode && (
                <div 
                    onClick={toggleSleepMode}
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 2001,
                        background: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ textAlign: 'center', opacity: 0.3 }}>
                        <Moon size={48} />
                        <p>Uyandırmak için dokun</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', opacity: isSleepMode ? 0 : 1 }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Moon size={24} color="#f1c40f" />
                    {t('menu.huzurMode')}
                </h2>
                <button 
                    onClick={toggleSleepMode}
                    style={{ 
                        marginLeft: 'auto', 
                        background: 'rgba(255,255,255,0.1)', 
                        border: 'none', 
                        borderRadius: '20px', 
                        padding: '8px 16px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Moon size={16} />
                    Gece Modu
                </button>
            </div>

            {/* Main Visual / Timer */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', opacity: isSleepMode ? 0 : 1 }}>
                <div style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    border: '4px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    marginBottom: '30px'
                }}>
                    {isPlaying && (
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                            animation: 'pulse 3s infinite'
                        }}></div>
                    )}

                    <button
                        onClick={togglePlay}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: isPlaying ? 'rgba(255,255,255,0.2)' : 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            zIndex: 2
                        }}
                    >
                        {isPlaying ? <Pause size={32} color="white" /> : <Play size={32} color="#2c3e50" style={{ marginLeft: '4px' }} />}
                    </button>
                </div>

                {timeLeft !== null && (
                    <div style={{ fontSize: '32px', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '10px' }}>
                        {formatTime(timeLeft)}
                    </div>
                )}

                {/* Timer Selection */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {[15, 30, 60].map(m => (
                        <button
                            key={m}
                            onClick={() => handleTimerSet(m)}
                            style={{
                                background: timer === m ? '#f1c40f' : 'rgba(255,255,255,0.1)',
                                color: timer === m ? '#2c3e50' : 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Clock size={14} />
                            {m} {t('huzurMode.minutes')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Controls & Categories */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '30px 30px 0 0', opacity: isSleepMode ? 0 : 1 }}>
                
                {/* Categories */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            style={{
                                background: activeCategory === cat.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                color: 'white',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                fontSize: '13px'
                            }}
                        >
                            {t(cat.nameKey)}
                        </button>
                    ))}
                </div>

                {/* Sounds List */}
                <div style={{ marginBottom: '25px' }}>
                    <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {SLEEP_SOUNDS.filter(s => s.category === activeCategory).map(sound => {
                            const Icon = sound.icon;
                            return (
                                <div key={sound.id}
                                    onClick={() => {
                                        setActiveSound(activeSound?.id === sound.id ? null : sound);
                                        if (!isPlaying && activeSound?.id !== sound.id) setIsPlaying(true);
                                    }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        opacity: activeSound?.id === sound.id ? 1 : 0.5,
                                        transition: 'opacity 0.3s',
                                        minWidth: '70px'
                                    }}
                                >
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '20px',
                                        background: activeSound?.id === sound.id ? '#f1c40f' : 'rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: activeSound?.id === sound.id ? '#2c3e50' : 'white'
                                    }}>
                                        <Icon size={24} />
                                    </div>
                                    <span style={{ fontSize: '11px', textAlign: 'center' }}>{t(sound.nameKey)}</span>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Volume Control */}
                    {activeSound && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                            <Volume2 size={16} />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                style={{ flex: 1, accentColor: '#f1c40f' }}
                            />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 0; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default HuzurMode;
