import { useState } from 'react';
import { RotateCcw, Volume2, VolumeX, ChevronLeft, BarChart3, Maximize, Minimize, Sparkles, Plus, Minus, Info, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from './shared/IslamicBackButton';
import { useFocus } from '../context/FocusContext';
import { useGamification } from '../hooks/useGamification';
import { storageService } from '../services/storageService';
import './Zikirmatik.css';
import './Navigation.css';

const ZIKIRMATIK_KEYS = {
    FREE_NAME: 'freeDhikrName',
    COUNTS: 'zikirCounts',
    TARGETS: 'zikirTargets',
    STATS: 'zikirStats'
};

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
    
    const [view, setView] = useState('list');
    const [selectedDhikr, setSelectedDhikr] = useState(null);
    const [freeDhikrName, setFreeDhikrName] = useState(() => {
        return storageService.getString(ZIKIRMATIK_KEYS.FREE_NAME, 'Serbest Zikir');
    });

    const [counts, setCounts] = useState(() => {
        return storageService.getItem(ZIKIRMATIK_KEYS.COUNTS, {});
    });
    const [targets, setTargets] = useState(() => {
        const savedTargets = storageService.getItem(ZIKIRMATIK_KEYS.TARGETS, {});
        const defaultTargets = {};
        DHIKR_LIST.forEach(d => {
            defaultTargets[d.id] = savedTargets[d.id] || d.defaultTarget;
        });
        return defaultTargets;
    });
    const [vibrateEnabled, setVibrateEnabled] = useState(true);
    const [isPressed, setIsPressed] = useState(false);

    const [stats, setStats] = useState(() => {
        const savedStats = storageService.getItem(ZIKIRMATIK_KEYS.STATS, { today: 0, total: 0, history: [] });
        const today = new Date().toDateString();
        if (savedStats.lastDate !== today) {
            savedStats.today = 0;
            savedStats.lastDate = today;
        }
        return savedStats;
    });
    const [showStats, setShowStats] = useState(false);
    const [showSuccessAnim, setShowSuccessAnim] = useState(false);

    const handleFreeNameChange = (e) => {
        const name = e.target.value;
        setFreeDhikrName(name);
        storageService.setString(ZIKIRMATIK_KEYS.FREE_NAME, name);
    };

    const saveCount = (dhikrId, newCount) => {
        const newCounts = { ...counts, [dhikrId]: newCount };
        setCounts(newCounts);
        storageService.setItem(ZIKIRMATIK_KEYS.COUNTS, newCounts);
    };

    const updateStats = (increment = 1) => {
        const today = new Date().toDateString();
        const newStats = {
            ...stats,
            today: (stats.lastDate === today ? stats.today : 0) + increment,
            total: stats.total + increment,
            lastDate: today
        };
        setStats(newStats);
        storageService.setItem(ZIKIRMATIK_KEYS.STATS, newStats);
    };

    const handleIncrement = () => {
        if (!selectedDhikr) return;

        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 100);

        const currentCount = counts[selectedDhikr.id] || 0;
        const newCount = currentCount + 1;
        saveCount(selectedDhikr.id, newCount);
        updateStats(1);
        
        checkQuestProgress('zikir', selectedDhikr.id, 1);

        if (vibrateEnabled && navigator.vibrate) {
            navigator.vibrate(30);
        }

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

    if (view === 'list') {
        return (
            <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <IslamicBackButton onClick={onClose} size="medium" />
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                            {t('menu.zikirmatik', 'Zikirmatik')}
                        </h2>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => setShowStats(!showStats)}
                            style={{ background: showStats ? 'var(--nav-accent)' : 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '12px', padding: '10px', color: showStats ? 'white' : 'var(--nav-text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            <BarChart3 size={20} />
                        </button>
                    </div>
                </div>

                {/* Stats Dashboard */}
                {showStats && (
                    <div className="settings-card reveal-stagger" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))', border: 'none', padding: '24px', marginBottom: '24px', color: 'white' }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{stats.today}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Bugünkü Zikir</div>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', height: '40px' }}></div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900' }}>{stats.total}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px' }}>Toplam Zikir</div>
                        </div>
                    </div>
                )}

                {/* Zikir Listesi */}
                <div className="settings-group">
                    <div className="settings-group-title premium-text">{t('zikirmatik.popularChoices', 'Popüler Zikirler')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {DHIKR_LIST.map((dhikr, index) => {
                            const count = counts[dhikr.id] || 0;
                            const target = targets[dhikr.id] || dhikr.defaultTarget;
                            const progress = getProgress(dhikr.id);
                            const isComplete = count >= target;
                            const displayName = dhikr.id === 'free' ? freeDhikrName : dhikr.name;

                            return (
                                <div
                                    key={dhikr.id}
                                    onClick={() => selectDhikr(dhikr)}
                                    className="settings-card reveal-stagger premium-glass hover-lift"
                                    style={{ 
                                        '--delay': `${0.1 + index * 0.05}s`,
                                        padding: '16px',
                                        background: isComplete ? 'rgba(15, 118, 110, 0.05)' : 'var(--nav-bg)',
                                        border: isComplete ? '1px solid rgba(15, 118, 110, 0.4)' : '1px solid var(--nav-border)'
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: isComplete ? 'var(--bg-emerald-light)' : 'var(--nav-text)' }}>
                                                    {displayName}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontFamily: 'var(--arabic-font)' }}>
                                                    {dhikr.arabic}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '900', fontSize: '1.1rem' }}>
                                                    {count} <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>/ {target}</span>
                                                </div>
                                                {isComplete && <div style={{ fontSize: '0.7rem', color: 'var(--bg-emerald-light)', fontWeight: '800' }}>{t('common.completed', 'TAMAMLANDI')}</div>}
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div style={{ height: '6px', background: 'var(--nav-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                width: `${progress}%`, 
                                                height: '100%', 
                                                background: isComplete ? 'var(--bg-emerald-light)' : 'var(--nav-accent)',
                                                transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                            }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    const currentDhikrCount = counts[selectedDhikr?.id] || 0;
    const currentDhikrTarget = targets[selectedDhikr?.id] || 33;
    const scrollProgress = getProgress(selectedDhikr?.id);
    const dashCircum = 829.38; 
    const dashOffset = dashCircum - (scrollProgress * dashCircum / 100);

    return (
        <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px', background: isFocusMode ? 'var(--nav-bg)' : 'transparent' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <button 
                    onClick={() => setView('list')}
                    style={{ background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '12px', padding: '10px', color: 'var(--nav-text)', cursor: 'pointer' }}
                >
                    <ChevronLeft size={20} />
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => setVibrateEnabled(!vibrateEnabled)}
                        style={{ background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '12px', padding: '10px', color: vibrateEnabled ? 'var(--nav-accent)' : 'var(--nav-text-muted)', cursor: 'pointer' }}
                    >
                        {vibrateEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                    <button 
                        onClick={toggleFocusMode}
                        style={{ background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '12px', padding: '10px', color: isFocusMode ? 'var(--nav-accent)' : 'var(--nav-text-muted)', cursor: 'pointer' }}
                    >
                        {isFocusMode ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>

            {/* Dhikr Content */}
            <div className="settings-card" style={{ flexDirection: 'column', padding: '32px', textAlign: 'center', gap: '12px', background: 'var(--nav-hover)', border: 'none' }}>
                {selectedDhikr?.id === 'free' ? (
                    <input
                        type="text"
                        className="dhikr-input-custom"
                        style={{ background: 'transparent', border: 'none', borderBottom: '2px solid var(--nav-accent)', color: 'var(--nav-text)', fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', width: '100%', outline: 'none', padding: '8px' }}
                        value={freeDhikrName}
                        onChange={handleFreeNameChange}
                        placeholder="Zikir Adı"
                    />
                ) : (
                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'var(--nav-accent)' }}>{selectedDhikr?.name}</h3>
                )}
                <div style={{ fontSize: '2rem', fontFamily: 'var(--arabic-font)', color: 'var(--nav-text)', margin: '16px 0' }}>{selectedDhikr?.arabic}</div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--nav-text-muted)', fontStyle: 'italic', lineHeight: '1.4' }}>{selectedDhikr?.meaning}</p>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '40px 0' }}>
                <div className="velocity-dial-wrapper" onClick={handleIncrement}>
                    <svg className="velocity-dial-svg">
                        <circle className="velocity-dial-bg" cx="140" cy="140" r="132" />
                        <circle
                            className="velocity-dial-progress"
                            cx="140"
                            cy="140"
                            r="132"
                            style={{
                                strokeDasharray: dashCircum,
                                strokeDashoffset: dashOffset
                            }}
                        />
                    </svg>
                    <div className="velocity-dial-button" style={{ transform: isPressed ? 'scale(0.92)' : 'scale(1)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>OKUNAN</div>
                        <div style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--nav-text)', margin: '8px 0', lineHeight: 1 }}>{currentDhikrCount}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--nav-accent)' }}>Hedef: {currentDhikrTarget}</div>
                    </div>
                </div>
            </div>

            {/* Target Options */}
            <div className="settings-card" style={{ gap: '8px', padding: '24px', background: 'var(--nav-hover)', border: 'none', justifyContent: 'center' }}>
                {[33, 99, 100, 500].map(val => (
                    <button
                        key={val}
                        className={`velocity-target-btn ${currentDhikrTarget === val ? 'active' : ''}`}
                        onClick={() => {
                            const newTargets = { ...targets, [selectedDhikr.id]: val };
                            setTargets(newTargets);
                            storageService.setItem(ZIKIRMATIK_KEYS.TARGETS, newTargets);
                        }}
                    >
                        {val}
                    </button>
                ))}
                <button 
                    onClick={handleReset}
                    style={{ background: 'var(--nav-bg)', border: '1px solid var(--nav-border)', borderRadius: '12px', padding: '12px', color: 'var(--nav-text-muted)', cursor: 'pointer', transition: 'all 0.2s', marginLeft: 'auto' }}
                >
                    <RotateCcw size={20} />
                </button>
            </div>

            {showSuccessAnim && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ textAlign: 'center', animation: 'scaleUp 0.5s ease-out' }}>
                        <Sparkles size={120} color="var(--nav-accent)" />
                        <h2 style={{ color: 'var(--nav-accent)', fontWeight: '900', textShadow: '0 4px 12px rgba(180, 83, 9, 0.4)' }}>TEBRİKLER!</h2>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Zikirmatik;
