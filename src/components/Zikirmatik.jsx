import { useState } from 'react';
import { RotateCcw, Volume2, VolumeX, ChevronLeft, BarChart3, Maximize, Minimize } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from './shared/IslamicBackButton';
import Lottie from 'lottie-react';
import { useFocus } from '../context/FocusContext';
import { useGamification } from '../context/GamificationContext';

// Önceden tanımlı zikir listesi
const DHIKR_LIST = [
    { id: 'free', name: 'Serbest Zikir', arabic: '∞', meaning: 'İstediğiniz zikri çekin', defaultTarget: 9999 },
    { id: 'subhanallah', name: 'Sübhanallah', arabic: 'سُبْحَانَ اللهِ', meaning: 'Allah\'ı tüm eksikliklerden tenzih ederim', defaultTarget: 33 },
    { id: 'elhamdulillah', name: 'Elhamdülillah', arabic: 'الحَمْدُ لِلَّهِ', meaning: 'Hamd Allah\'a mahsustur', defaultTarget: 33 },
    { id: 'allahuekber', name: 'Allahu Ekber', arabic: 'اللهُ أَكْبَرُ', meaning: 'Allah en büyüktür', defaultTarget: 33 },
    { id: 'lailaheillallah', name: 'La ilahe illallah', arabic: 'لَا إِلَٰهَ إِلَّا اللهُ', meaning: 'Allah\'tan başka ilah yoktur', defaultTarget: 100 },
    { id: 'estagfirullah', name: 'Estağfirullah', arabic: 'أَسْتَغْفِرُ اللهَ', meaning: 'Allah\'tan bağışlanma dilerim', defaultTarget: 100 },
    { id: 'lahavle', name: 'La havle', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ', meaning: 'Güç ve kuvvet ancak Allah\'tandır', defaultTarget: 33 },
    { id: 'salavat', name: 'Salavat', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', meaning: 'Allah\'ım Muhammed\'e salat eyle', defaultTarget: 100 },
    { id: 'hasbunallah', name: 'Hasbünallah', arabic: 'حَسْبُنَا اللهُ وَنِعْمَ الوَكِيلُ', meaning: 'Allah bize yeter, O ne güzel vekildir', defaultTarget: 33 },
];

const Zikirmatik = ({ onClose }) => {
    const { t } = useTranslation();
    const { isFocusMode, toggleFocusMode } = useFocus();
    const { checkQuestProgress } = useGamification();
    
    // Görünüm modu: 'list' veya 'counter'
    const [view, setView] = useState('list');
    const [selectedDhikr, setSelectedDhikr] = useState(null);
    const [freeDhikrName, setFreeDhikrName] = useState(() => {
        return localStorage.getItem('freeDhikrName') || 'Serbest Zikir';
    });

    // Sayaç durumları
    const [counts, setCounts] = useState(() => {
        return JSON.parse(localStorage.getItem('zikirCounts') || '{}');
    });
    const [targets, setTargets] = useState(() => {
        const savedTargets = JSON.parse(localStorage.getItem('zikirTargets') || '{}');
        const defaultTargets = {};
        DHIKR_LIST.forEach(d => {
            defaultTargets[d.id] = savedTargets[d.id] || d.defaultTarget;
        });
        return defaultTargets;
    });
    const [vibrateEnabled, setVibrateEnabled] = useState(true);
    const [isPressed, setIsPressed] = useState(false);

    // İstatistikler
    const [stats, setStats] = useState(() => {
        const savedStats = JSON.parse(localStorage.getItem('zikirStats') || '{"today":0,"total":0,"history":[]}');
        const today = new Date().toDateString();
        if (savedStats.lastDate !== today) {
            savedStats.today = 0;
            savedStats.lastDate = today;
        }
        return savedStats;
    });
    const [showStats, setShowStats] = useState(false);
    const [showSuccessAnim, setShowSuccessAnim] = useState(false);

    // Serbest zikir adını kaydet
    const handleFreeNameChange = (e) => {
        const name = e.target.value;
        setFreeDhikrName(name);
        localStorage.setItem('freeDhikrName', name);
    };

    // Sayacı kaydet
    const saveCount = (dhikrId, newCount) => {
        const newCounts = { ...counts, [dhikrId]: newCount };
        setCounts(newCounts);
        localStorage.setItem('zikirCounts', JSON.stringify(newCounts));
    };

    // İstatistikleri güncelle
    const updateStats = (increment = 1) => {
        const today = new Date().toDateString();
        const newStats = {
            ...stats,
            today: (stats.lastDate === today ? stats.today : 0) + increment,
            total: stats.total + increment,
            lastDate: today
        };
        setStats(newStats);
        localStorage.setItem('zikirStats', JSON.stringify(newStats));
    };

    const handleIncrement = () => {
        if (!selectedDhikr) return;

        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 100);

        const currentCount = counts[selectedDhikr.id] || 0;
        const newCount = currentCount + 1;
        saveCount(selectedDhikr.id, newCount);
        updateStats(1);
        
        // Quest Progress Check - Gamification entegrasyonu
        checkQuestProgress('zikir', selectedDhikr.id, 1);

        // Titreşim
        if (vibrateEnabled && navigator.vibrate) {
            navigator.vibrate(30);
        }

        // Hedefe ulaşıldıysa
        const target = targets[selectedDhikr.id];
        if (target && newCount === target) {
            setShowSuccessAnim(true);
            setTimeout(() => setShowSuccessAnim(false), 3000);
            if (vibrateEnabled && navigator.vibrate) {
                navigator.vibrate([100, 50, 100, 50, 100]);
            }
        }
    };

    const handleReset = () => {
        if (!selectedDhikr) return;
        saveCount(selectedDhikr.id, 0);
        if (vibrateEnabled && navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    };

    const selectDhikr = (dhikr) => {
        setSelectedDhikr(dhikr);
        setView('counter');
    };

    const getProgress = (dhikrId) => {
        const count = counts[dhikrId] || 0;
        const target = targets[dhikrId] || 33;
        return Math.min((count / target) * 100, 100);
    };

    // Liste Görünümü
    if (view === 'list') {
        return (
            <div className="app-container" style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <IslamicBackButton onClick={onClose} size="medium" />
                    <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '22px', flex: 1 }}>📿 {t('menu.zikirmatik')}</h2>
                    <button onClick={() => setShowStats(!showStats)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}>
                        <BarChart3 size={24} />
                    </button>
                    <button onClick={toggleFocusMode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', marginLeft: '8px' }}>
                        {isFocusMode ? <Minimize size={24} /> : <Maximize size={24} />}
                    </button>
                </div>

                {/* İstatistikler */}
                {showStats && (
                    <div className="glass-card" style={{
                        background: 'var(--primary-color)',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '20px',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.today}</div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>Bugün</div>
                            </div>
                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.total}</div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>Toplam</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Zikir Listesi */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {DHIKR_LIST.map(dhikr => {
                        const count = counts[dhikr.id] || 0;
                        const target = targets[dhikr.id] || dhikr.defaultTarget;
                        const progress = getProgress(dhikr.id);
                        const isComplete = count >= target;
                        const displayName = dhikr.id === 'free' ? freeDhikrName : dhikr.name;

                        return (
                            <div
                                key={dhikr.id}
                                onClick={() => selectDhikr(dhikr)}
                                className="glass-card"
                                style={{
                                    background: isComplete ? 'rgba(39, 174, 96, 0.15)' : 'var(--card-bg)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    marginBottom: '12px',
                                    cursor: 'pointer',
                                    border: isComplete ? '2px solid #27ae60' : '1px solid var(--glass-border)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '16px' }}>{displayName}</div>
                                        <div style={{ fontFamily: 'serif', fontSize: '20px', color: 'var(--primary-color)', marginTop: '4px' }}>{dhikr.arabic}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: isComplete ? '#27ae60' : 'var(--text-color)' }}>
                                            {count}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>/ {target}</div>
                                    </div>
                                </div>

                                {/* İlerleme çubuğu */}
                                <div style={{
                                    height: '4px',
                                    background: 'var(--glass-border)',
                                    borderRadius: '2px',
                                    marginTop: '12px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${progress}%`,
                                        background: isComplete ? '#27ae60' : 'var(--primary-color)',
                                        borderRadius: '2px',
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Sayaç Görünümü
    return (
        <div className="app-container" style={{
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '30px 20px',
            paddingBottom: '40px'
        }}>
            {/* Header */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ChevronLeft size={24} />
                    <span style={{ fontSize: '14px' }}>{t('common.back')}</span>
                </button>
                <button onClick={() => setVibrateEnabled(!vibrateEnabled)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color-muted)' }}>
                    {vibrateEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
                <button onClick={toggleFocusMode} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color-muted)', marginLeft: '10px' }}>
                    {isFocusMode ? <Minimize size={24} /> : <Maximize size={24} />}
                </button>
            </div>

            {/* Zikir Bilgisi - Yukarıda sabit */}
            <div style={{ marginTop: '20px', marginBottom: '10px', width: '100%' }}>
                {selectedDhikr?.id === 'free' ? (
                    <input
                        type="text"
                        value={freeDhikrName}
                        onChange={handleFreeNameChange}
                        placeholder="Zikir Adı Giriniz"
                        style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: 'var(--text-color)',
                            border: 'none',
                            borderBottom: '2px solid var(--primary-color)',
                            background: 'transparent',
                            textAlign: 'center',
                            width: '80%',
                            outline: 'none',
                            padding: '5px'
                        }}
                    />
                ) : (
                    <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-color)' }}>{selectedDhikr?.name}</div>
                )}
                <div style={{ fontFamily: 'serif', fontSize: '28px', color: 'var(--primary-color)', marginTop: '8px' }}>{selectedDhikr?.arabic}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-color-muted)', marginTop: '8px', fontStyle: 'italic' }}>{selectedDhikr?.meaning}</div>
            </div>

            {/* Spacer - Butonu aşağıya itmek için */}
            <div style={{ flex: 1, minHeight: '20px' }}></div>

            {/* Ana Sayaç Butonu - Aşağıda, ergonomik konumda */}
            <div
                onClick={handleIncrement}
                style={{
                    width: '220px',
                    height: '220px',
                    borderRadius: '50%',
                    background: 'var(--primary-color)',
                    boxShadow: isPressed
                        ? 'inset 10px 10px 20px rgba(0,0,0,0.3)'
                        : '15px 15px 40px rgba(var(--primary-rgb), 0.4), -10px -10px 30px var(--card-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    transform: isPressed ? 'scale(0.97)' : 'scale(1)',
                    border: '6px solid rgba(255,255,255,0.3)'
                }}
            >
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>TOPLAM</div>
                <div style={{
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: '#fff',
                    fontFamily: 'monospace',
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    {counts[selectedDhikr?.id] || 0}
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '5px' }}>
                    Hedef: {targets[selectedDhikr?.id] || 33}
                </div>
            </div>

            {/* İlerleme göstergesi */}
            <div style={{ width: '80%', marginTop: '20px' }}>
                <div style={{
                    height: '8px',
                    background: 'var(--glass-border)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${getProgress(selectedDhikr?.id)}%`,
                        background: 'var(--primary-color)',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                    }}></div>
                </div>
            </div>

            {/* Hedef Seçenekleri */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                {[33, 99, 100, 500].map(val => (
                    <button
                        key={val}
                        onClick={() => {
                            const newTargets = { ...targets, [selectedDhikr.id]: val };
                            setTargets(newTargets);
                            localStorage.setItem('zikirTargets', JSON.stringify(newTargets));
                        }}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            background: targets[selectedDhikr?.id] === val ? 'var(--primary-color)' : 'var(--glass-bg)',
                            color: targets[selectedDhikr?.id] === val ? 'white' : 'var(--text-color)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        {val}
                    </button>
                ))}
            </div>

            {/* Sıfırla Butonu */}
            <button
                onClick={handleReset}
                style={{
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '14px 40px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '80%',
                    boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
                    cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                <RotateCcw size={18} />
                Sıfırla
            </button>

            {/* Success Animation Overlay */}
            {showSuccessAnim && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Lottie 
                        animationData={null}
                        path="https://assets9.lottiefiles.com/packages/lf20_u4yrau.json"
                        loop={false}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            )}
        </div>
    );
};

export default Zikirmatik;
