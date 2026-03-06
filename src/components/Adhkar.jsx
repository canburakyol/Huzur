import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    X, Sun, Moon, ChevronRight, Check, RefreshCw, 
    Sunrise, Sunset, Zap, RotateCcw, ChevronDown, 
    CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import { storageService } from '../services/storageService';
import IslamicBackButton from './shared/IslamicBackButton';
import './Navigation.css';

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

    const getInitialProgress = (tab) => {
        const key = `adhkar_${tab}_${new Date().toDateString()}`;
        return storageService.getItem(key, {});
    };

    const [morningProgress, setMorningProgress] = useState(() => getInitialProgress('morning'));
    const [eveningProgress, setEveningProgress] = useState(() => getInitialProgress('evening'));
    const [expanded, setExpanded] = useState(null);

    const progress = activeTab === 'morning' ? morningProgress : eveningProgress;
    const setProgress = activeTab === 'morning' ? setMorningProgress : setEveningProgress;

    const incrementProgress = (id) => {
        const current = progress[id] || 0;
        const adhkar = adhkarList.find(a => a.id === id);
        if (current < adhkar.count) {
            const newProgress = { ...progress, [id]: current + 1 };
            setProgress(newProgress);
            storageService.setItem(storageKey, newProgress);

            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        }
    };

    const resetProgress = () => {
        if (window.confirm(t('adhkar.confirmReset', 'İlerlemeyi sıfırlamak istiyor musunuz?'))) {
            setProgress({});
            storageService.setItem(storageKey, {});
        }
    };

    const totalItems = adhkarList.length;
    const completedItems = adhkarList.filter(a => (progress[a.id] || 0) >= a.count).length;
    const overallProgress = (completedItems / totalItems) * 100;

    return (
        <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <IslamicBackButton onClick={onClose} size="medium" />
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                        {t('adhkar.title', 'Zikir ve Evrad')}
                    </h2>
                </div>
                <button onClick={resetProgress} style={{ background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '12px', padding: '10px', color: 'var(--nav-text-muted)', cursor: 'pointer' }}>
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* Tab Switch */}
            <div className="settings-card" style={{ padding: '6px', background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', marginBottom: '24px' }}>
                <button
                    onClick={() => setActiveTab('morning')}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                        background: activeTab === 'morning' ? 'var(--nav-bg)' : 'transparent',
                        color: activeTab === 'morning' ? 'var(--nav-text)' : 'var(--nav-text-muted)',
                        fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: activeTab === 'morning' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <Sunrise size={18} color={activeTab === 'morning' ? 'var(--primary-color)' : 'currentColor'} /> 
                    {t('adhkar.morning', 'Sabah')}
                </button>
                <button
                    onClick={() => setActiveTab('evening')}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                        background: activeTab === 'evening' ? 'var(--nav-bg)' : 'transparent',
                        color: activeTab === 'evening' ? 'var(--nav-text)' : 'var(--nav-text-muted)',
                        fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: activeTab === 'evening' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    <Moon size={18} color={activeTab === 'evening' ? 'var(--bg-emerald-light)' : 'currentColor'} /> 
                    {t('adhkar.evening', 'Akşam')}
                </button>
            </div>

            {/* Overall Progress Card */}
            <div className="settings-card" style={{ background: activeTab === 'morning' ? 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))' : 'linear-gradient(135deg, var(--bg-emerald-light), var(--bg-emerald-deep))', color: 'white', border: 'none', padding: '24px', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', opacity: 0.9 }}>{t('adhkar.dailyProgress', 'Günlük İlerleme')}</div>
                        <div style={{ fontSize: '2rem', fontWeight: '900', margin: '4px 0' }}>{completedItems} / {totalItems}</div>
                    </div>
                    <Zap size={32} />
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${overallProgress}%`, background: 'white', transition: 'width 0.4s ease' }} />
                </div>
            </div>

            {/* Adhkar List */}
            <div className="settings-group">
                <div className="settings-group-title">{activeTab === 'morning' ? t('adhkar.morningTitle') : t('adhkar.eveningTitle')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {adhkarList.map(adhkar => {
                        const current = progress[adhkar.id] || 0;
                        const isComplete = current >= adhkar.count;
                        const isExpanded = expanded === adhkar.id;

                        return (
                            <div key={adhkar.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div 
                                    className="settings-card" 
                                    onClick={() => setExpanded(isExpanded ? null : adhkar.id)}
                                    style={{ 
                                        padding: '16px', 
                                        background: isComplete ? 'rgba(16, 185, 129, 0.05)' : 'var(--nav-bg)',
                                        border: isComplete ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--nav-border)'
                                    }}
                                >
                                    <div className="settings-card-left">
                                        <div className="settings-icon-box" style={{ 
                                            background: isComplete ? 'var(--bg-emerald-light)' : 'var(--nav-hover)', 
                                            color: isComplete ? 'white' : 'var(--nav-text)' 
                                        }}>
                                            {isComplete ? <Check size={18} /> : <span>{current}</span>}
                                        </div>
                                        <div>
                                            <div className="settings-label" style={{ color: isComplete ? 'var(--bg-emerald-med)' : 'var(--nav-text)' }}>
                                                {t(`adhkar.items.${adhkar.key}.title`)}
                                            </div>
                                            <div className="settings-desc">{current} / {adhkar.count} {t('adhkar.times', 'kere')}</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} style={{ 
                                        color: 'var(--nav-border)', 
                                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                                        transition: 'transform 0.2s'
                                    }} />
                                </div>

                                {isExpanded && (
                                    <div className="settings-card reveal-stagger" style={{ 
                                        flexDirection: 'column', gap: '20px', padding: '24px', 
                                        marginTop: '-12px', borderTopLeftRadius: 0, borderTopRightRadius: 0,
                                        borderTop: 'none', background: 'var(--nav-hover)'
                                    }}>
                                        <div style={{ 
                                            fontFamily: "'Amiri', serif", fontSize: '1.6rem', color: 'var(--nav-text)', 
                                            direction: 'rtl', textAlign: 'center', lineHeight: '1.8' 
                                        }}>
                                            {t(`adhkar.items.${adhkar.key}.arabic`)}
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--nav-text-muted)', fontStyle: 'italic', background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '12px' }}>
                                                {t(`adhkar.items.${adhkar.key}.transliteration`)}
                                            </div>
                                            <div style={{ fontSize: '0.95rem', color: 'var(--nav-text)', lineHeight: '1.5' }}>
                                                {t(`adhkar.items.${adhkar.key}.meaning`)}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', background: 'rgba(15, 118, 110, 0.08)', padding: '12px', borderRadius: '12px' }}>
                                            <CheckCircle2 size={16} color="var(--bg-emerald-light)" style={{ marginTop: '2px' }} />
                                            <div style={{ fontSize: '0.85rem', color: 'var(--bg-emerald-med)', fontWeight: '600' }}>{t(adhkar.benefitKey)}</div>
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); incrementProgress(adhkar.id); }}
                                            disabled={isComplete}
                                            style={{
                                                width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
                                                background: isComplete ? 'var(--bg-emerald-light)' : (activeTab === 'morning' ? 'var(--primary-color)' : 'var(--bg-emerald-light)'),
                                                color: 'white', fontWeight: '800', fontSize: '1.1rem', cursor: isComplete ? 'default' : 'pointer',
                                                boxShadow: isComplete ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                            }}
                                        >
                                            {isComplete ? <CheckCircle2 size={20} /> : <Zap size={20} />}
                                            {isComplete ? t('adhkar.completed', 'Tamamlandı') : `${t('adhkar.read', 'Zikir Yap')} (${current}/${adhkar.count})`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="settings-card" style={{ background: 'var(--nav-hover)', border: 'none', marginTop: '32px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Info size={18} color="var(--nav-text-muted)" />
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                        {t('adhkar.infoNote', 'Peygamber Efendimiz (sav)\'in sünneti olan bu zikirleri sabah ve akşam vakitlerinde yaparak gününüzü bereketlendirebilirsiniz.')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Adhkar;
