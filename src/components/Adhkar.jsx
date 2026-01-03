import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sun, Moon, ChevronRight, Check, RefreshCw } from 'lucide-react';

// Sabah Tesbihatı
// Sabah Tesbihatı
const MORNING_ADHKAR = [
    {
        id: 1,
        key: 'ayetel_kursi',
        count: 1,
        benefitKey: 'adhkar.benefit1'
    },
    {
        id: 2,
        key: 'ihlas',
        count: 3,
        benefitKey: 'adhkar.benefit2'
    },
    {
        id: 3,
        key: 'felak',
        count: 3,
        benefitKey: 'adhkar.benefit3'
    },
    {
        id: 4,
        key: 'nas',
        count: 3,
        benefitKey: 'adhkar.benefit4'
    },
    {
        id: 5,
        key: 'sabah_duasi',
        count: 1,
        benefitKey: 'adhkar.benefit5'
    },
    {
        id: 6,
        key: 'tevekkul_duasi',
        count: 7,
        benefitKey: 'adhkar.benefit6'
    },
    {
        id: 7,
        key: 'subhanallah',
        count: 100,
        benefitKey: 'adhkar.benefit7'
    }
];

// Akşam Tesbihatı
const EVENING_ADHKAR = [
    {
        id: 1,
        key: 'ayetel_kursi',
        count: 1,
        benefitKey: 'adhkar.benefitEvening1'
    },
    {
        id: 2,
        key: 'ihlas',
        count: 3,
        benefitKey: 'adhkar.benefit2'
    },
    {
        id: 3,
        key: 'felak',
        count: 3,
        benefitKey: 'adhkar.benefitEvening3'
    },
    {
        id: 4,
        key: 'nas',
        count: 3,
        benefitKey: 'adhkar.benefitEvening4'
    },
    {
        id: 5,
        key: 'aksam_duasi',
        count: 1,
        benefitKey: 'adhkar.benefitEvening5'
    },
    {
        id: 6,
        key: 'uyku_oncesi',
        count: 1,
        benefitKey: 'adhkar.benefitEvening6'
    },
    {
        id: 7,
        key: 'estagfirullah',
        count: 3,
        benefitKey: 'adhkar.benefitEvening7'
    }
];

const Adhkar = ({ onClose }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('morning'); // morning, evening

    const adhkarList = activeTab === 'morning' ? MORNING_ADHKAR : EVENING_ADHKAR;
    const storageKey = `adhkar_${activeTab}_${new Date().toDateString()}`;

    // Initialize progress from localStorage based on active tab
    const getInitialProgress = (tab) => {
        const key = `adhkar_${tab}_${new Date().toDateString()}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : {};
    };

    // Separate state for each tab to avoid setState in useEffect
    const [morningProgress, setMorningProgress] = useState(() => getInitialProgress('morning'));
    const [eveningProgress, setEveningProgress] = useState(() => getInitialProgress('evening'));
    const [expanded, setExpanded] = useState(null);

    // Get current progress based on active tab
    const progress = activeTab === 'morning' ? morningProgress : eveningProgress;
    const setProgress = activeTab === 'morning' ? setMorningProgress : setEveningProgress;

    const incrementProgress = (id) => {
        const current = progress[id] || 0;
        const adhkar = adhkarList.find(a => a.id === id);
        if (current < adhkar.count) {
            const newProgress = { ...progress, [id]: current + 1 };
            setProgress(newProgress);
            localStorage.setItem(storageKey, JSON.stringify(newProgress));

            // Titreşim
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        }
    };

    const resetProgress = () => {
        setProgress({});
        localStorage.setItem(storageKey, '{}');
    };

    const totalItems = adhkarList.length;
    const completedItems = adhkarList.filter(a => (progress[a.id] || 0) >= a.count).length;
    const overallProgress = (completedItems / totalItems) * 100;

    return (
        <div className="glass-card" style={{
            position: 'relative',
            height: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            background: activeTab === 'morning'
                ? 'linear-gradient(135deg, rgba(255,250,240,0.95), rgba(255,245,230,0.95))'
                : 'linear-gradient(135deg, rgba(240,245,255,0.95), rgba(230,235,250,0.95))'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <button onClick={resetProgress} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                    <RefreshCw size={22} />
                </button>
                <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {activeTab === 'morning' ? <Sun size={24} color="#f39c12" /> : <Moon size={24} color="#3498db" />}
                    {activeTab === 'morning' ? t('adhkar.morningTitle') : t('adhkar.eveningTitle')}
                </h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                    <X size={28} />
                </button>
            </div>

            {/* Tab Switch */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button
                    onClick={() => setActiveTab('morning')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: activeTab === 'morning' ? 'linear-gradient(135deg, #f39c12, #e67e22)' : 'rgba(0,0,0,0.05)',
                        color: activeTab === 'morning' ? 'white' : '#666',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Sun size={18} /> {t('adhkar.morning')}
                </button>
                <button
                    onClick={() => setActiveTab('evening')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: activeTab === 'evening' ? 'linear-gradient(135deg, #3498db, #2980b9)' : 'rgba(0,0,0,0.05)',
                        color: activeTab === 'evening' ? 'white' : '#666',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Moon size={18} /> {t('adhkar.evening')}
                </button>
            </div>

            {/* Overall Progress */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>{t('adhkar.progress')}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>{completedItems}/{totalItems}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${overallProgress}%`,
                        background: activeTab === 'morning' ? 'linear-gradient(90deg, #f39c12, #e67e22)' : 'linear-gradient(90deg, #3498db, #2980b9)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                    }}></div>
                </div>
            </div>

            {/* Adhkar List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {adhkarList.map(adhkar => {
                    const current = progress[adhkar.id] || 0;
                    const isComplete = current >= adhkar.count;
                    const itemProgress = (current / adhkar.count) * 100;

                    return (
                        <div
                            key={adhkar.id}
                            style={{
                                background: isComplete ? 'rgba(39, 174, 96, 0.1)' : 'rgba(255,255,255,0.8)',
                                borderRadius: '14px',
                                marginBottom: '12px',
                                border: isComplete ? '1px solid rgba(39, 174, 96, 0.3)' : '1px solid rgba(0,0,0,0.05)',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Header */}
                            <div
                                onClick={() => setExpanded(expanded === adhkar.id ? null : adhkar.id)}
                                style={{
                                    padding: '14px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {isComplete ? (
                                        <Check size={22} color="#27ae60" />
                                    ) : (
                                        <div style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            border: '2px solid #ddd',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '10px',
                                            color: '#666'
                                        }}>
                                            {current}
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '15px' }}>{t(`adhkar.items.${adhkar.key}.title`)}</div>
                                        <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{current}/{adhkar.count} {t('adhkar.times')}</div>
                                    </div>
                                </div>
                                <ChevronRight size={20} color="#999" style={{
                                    transform: expanded === adhkar.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s'
                                }} />
                            </div>

                            {/* Progress bar */}
                            <div style={{ height: '3px', background: 'rgba(0,0,0,0.05)' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${itemProgress}%`,
                                    background: isComplete ? '#27ae60' : (activeTab === 'morning' ? '#f39c12' : '#3498db'),
                                    transition: 'width 0.2s'
                                }}></div>
                            </div>

                            {/* Expanded content */}
                            {expanded === adhkar.id && (
                                <div style={{ padding: '14px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                    <div style={{ fontFamily: 'serif', fontSize: '20px', color: '#2c3e50', marginBottom: '10px', direction: 'rtl', textAlign: 'center' }}>
                                        {t(`adhkar.items.${adhkar.key}.arabic`)}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic', marginBottom: '8px' }}>
                                        {t(`adhkar.items.${adhkar.key}.transliteration`)}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#34495e', marginBottom: '12px' }}>
                                        {t(`adhkar.items.${adhkar.key}.meaning`)}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#27ae60', marginBottom: '14px' }}>
                                        ✨ {t(adhkar.benefitKey)}
                                    </div>

                                    {/* Count button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); incrementProgress(adhkar.id); }}
                                        disabled={isComplete}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: isComplete ? '#27ae60' : (activeTab === 'morning' ? 'linear-gradient(135deg, #f39c12, #e67e22)' : 'linear-gradient(135deg, #3498db, #2980b9)'),
                                            color: 'white',
                                            fontWeight: '600',
                                            cursor: isComplete ? 'default' : 'pointer',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {isComplete ? `✓ ${t('adhkar.completed')}` : `${t('adhkar.read')} (${current}/${adhkar.count})`}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Adhkar;
