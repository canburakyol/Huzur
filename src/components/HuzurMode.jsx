import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, Moon, CloudRain, Wind, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HuzurMode = ({ onClose }) => {
    const { t } = useTranslation();
    
    const SOUNDS = [
        { id: 'rain', nameKey: 'huzurMode.rain', icon: <CloudRain size={24} />, url: '/sounds/rain.mp3' },
        { id: 'forest', nameKey: 'huzurMode.forest', icon: <Wind size={24} />, url: '/sounds/forest.mp3' },
        { id: 'ocean', nameKey: 'huzurMode.ocean', icon: <Wind size={24} />, url: '/sounds/ocean.mp3' },
    ];

    const [activeNature, setActiveNature] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [natureVol, setNatureVol] = useState(0.5);
    const [timer, setTimer] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    const natureRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        natureRef.current = new Audio();
        natureRef.current.loop = true;

        return () => {
            if (natureRef.current) {
                natureRef.current.pause();
                natureRef.current.src = '';
            }
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (!natureRef.current) return;

        if (activeNature && isPlaying) {
            natureRef.current.src = activeNature.url;
            natureRef.current.load();
            natureRef.current.volume = natureVol;
            natureRef.current.play().catch(e => console.error('Audio play error:', e));
        } else {
            natureRef.current.pause();
        }
    }, [activeNature, isPlaying, natureVol]);

    useEffect(() => {
        if (natureRef.current) {
            natureRef.current.volume = natureVol;
        }
    }, [natureVol]);

    useEffect(() => {
        if (timer) {
            setTimeLeft(timer * 60);
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
        } else {
            setTimeLeft(null);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [timer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const togglePlay = () => {
        if (!activeNature) {
            setActiveNature(SOUNDS[0]);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2000,
            background: 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
        }}>
            {/* Header */}
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Moon size={24} color="#f1c40f" />
                    {t('menu.huzurMode')}
                </h2>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '8px', color: 'white', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
            </div>

            {/* Main Visual / Timer */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
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
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
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
                            onClick={() => setTimer(timer === m ? null : m)}
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

            {/* Controls */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '30px 30px 0 0' }}>
                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '15px', opacity: 0.8 }}>{t('huzurMode.natureSounds')}</h3>
                    <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {SOUNDS.map(sound => (
                            <div key={sound.id}
                                onClick={() => {
                                    setActiveNature(activeNature?.id === sound.id ? null : sound);
                                    if (!isPlaying && activeNature?.id !== sound.id) setIsPlaying(true);
                                }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    opacity: activeNature?.id === sound.id ? 1 : 0.5,
                                    transition: 'opacity 0.3s'
                                }}
                            >
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '20px',
                                    background: activeNature?.id === sound.id ? '#f1c40f' : 'rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: activeNature?.id === sound.id ? '#2c3e50' : 'white'
                                }}>
                                    {sound.icon}
                                </div>
                                <span style={{ fontSize: '12px' }}>{t(sound.nameKey)}</span>
                            </div>
                        ))}
                    </div>
                    {activeNature && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <Volume2 size={16} />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={natureVol}
                                onChange={(e) => setNatureVol(parseFloat(e.target.value))}
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
