import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    ChevronLeft, Calendar, BookOpen, Target, Award, 
    RefreshCw, CheckCircle, Clock, TrendingUp, Edit3 
} from 'lucide-react';
import { calculateHatimTarget, TOTAL_PAGES, getSuggestedDates } from '../utils/hatimCalculator';
import IslamicBackButton from './shared/IslamicBackButton';

const STORAGE_KEY = 'hatim_coach_data';

const HatimCoach = ({ onClose }) => {
    const { t } = useTranslation();
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    });

    // Setup State
    const [step, setStep] = useState(1); // 1: Intro, 2: Date Selection, 3: Confirm
    const [targetDate, setTargetDate] = useState(() => data?.targetDate || '');
    const [currentPage, setCurrentPage] = useState(() => data?.currentPage || 0);

    const stats = useMemo(() => {
        if (targetDate) {
            return calculateHatimTarget(currentPage, targetDate);
        }
        return null;
    }, [currentPage, targetDate]);

    const handleSaveSetup = () => {
        if (!targetDate) return;
        const newData = {
            targetDate,
            currentPage: 0,
            startDate: new Date().toISOString(),
            totalRead: 0
        };
        setData(newData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    };

    const handleUpdateProgress = (newPage) => {
        const updatedPage = Math.min(TOTAL_PAGES, Math.max(0, newPage));
        setCurrentPage(updatedPage);
        
        const newData = { ...data, currentPage: updatedPage };
        setData(newData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    };

    const handleReset = () => {
        if (confirm(t('common.areYouSure'))) {
            localStorage.removeItem(STORAGE_KEY);
            setData(null);
            setTargetDate('');
            setCurrentPage(0);
            // stats is derived from useMemo, so no need to set it
            setStep(1);
        }
    };

    // --- WIZARD STEPS ---

    const renderWizard = () => {
        return (
            <div className="glass-card" style={{ padding: '30px 20px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div style={{ 
                            width: '100px', height: '100px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 25px', color: 'white', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                        }}>
                            <BookOpen size={48} />
                        </div>
                        <h2 style={{ color: 'var(--text-color)', marginBottom: '15px', fontSize: '24px' }}>{t('hatimCoach.welcomeTitle')}</h2>
                        <p style={{ color: 'var(--text-color-muted)', marginBottom: '30px', lineHeight: 1.6 }}>
                            {t('hatimCoach.welcomeDesc')}
                        </p>
                        <button onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>
                            {t('hatimCoach.startSetup')}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '25px' }}>{t('hatimCoach.selectTarget')}</h3>
                        
                        <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: 'var(--text-color)' }}>
                                {t('hatimCoach.targetDateLabel')}
                            </label>
                            <input 
                                type="date" 
                                value={targetDate} 
                                onChange={(e) => setTargetDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '12px',
                                    border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.8)',
                                    fontSize: '18px', color: '#2c3e50'
                                }}
                            />
                        </div>

                        {/* Quick Suggestions */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
                            {getSuggestedDates().map((s, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setTargetDate(s.date)}
                                    className="glass-card"
                                    style={{ 
                                        padding: '8px 12px', fontSize: '12px', margin: 0,
                                        background: targetDate === s.date ? 'var(--primary-color)' : 'rgba(255,255,255,0.5)',
                                        color: targetDate === s.date ? 'white' : 'var(--text-color)',
                                        border: 'none'
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setStep(1)} className="btn" style={{ flex: 1 }}>{t('common.back')}</button>
                            <button 
                                onClick={() => targetDate && setStep(3)} 
                                disabled={!targetDate}
                                className="btn btn-primary" 
                                style={{ flex: 1, opacity: targetDate ? 1 : 0.5 }}
                            >
                                {t('common.next')}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && stats && (
                    <div className="animate-fade-in">
                        <h3 style={{ marginBottom: '20px' }}>{t('hatimCoach.summary')}</h3>
                        
                        <div className="glass-card" style={{ 
                            background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981',
                            padding: '20px', marginBottom: '30px'
                        }}>
                            <div style={{ fontSize: '14px', color: '#059669', marginBottom: '5px' }}>{t('hatimCoach.dailyGoal')}</div>
                            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#059669' }}>
                                {stats.dailyTarget} <span style={{ fontSize: '16px' }}>{t('hatimCoach.pages')}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#059669', marginTop: '5px' }}>
                                {stats.daysLeft} {t('hatimCoach.days')} • {TOTAL_PAGES} {t('hatimCoach.pagesTotal')}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setStep(2)} className="btn" style={{ flex: 1 }}>{t('common.back')}</button>
                            <button onClick={handleSaveSetup} className="btn btn-primary" style={{ flex: 1 }}>
                                {t('hatimCoach.confirmStart')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- DASHBOARD ---

    const renderDashboard = () => {
        if (!stats) return null;

        const progressPercent = (currentPage / TOTAL_PAGES) * 100;
        const currentJuz = Math.ceil((currentPage + 1) / 20);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
                {/* Main Progress Card */}
                <div className="glass-card" style={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    color: 'white', padding: '25px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)'
                }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>{t('hatimCoach.dailyGoal')}</div>
                                <div style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1, letterSpacing: '-1px' }}>
                                    {stats.dailyTarget}
                                    <span style={{ fontSize: '16px', fontWeight: 'normal', marginLeft: '4px', opacity: 0.9 }}>{t('hatimCoach.pages')}</span>
                                </div>
                            </div>
                            <div style={{ 
                                background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px',
                                fontSize: '12px', fontWeight: '600', backdropFilter: 'blur(4px)'
                            }}>
                                {currentJuz}. {t('hatimCoach.juz')}
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={16} style={{ opacity: 0.8 }} />
                                <span style={{ fontWeight: '600' }}>{stats.daysLeft}</span>
                                <span style={{ fontSize: '12px', opacity: 0.8 }}>{t('hatimCoach.daysLeft')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <BookOpen size={16} style={{ opacity: 0.8 }} />
                                <span style={{ fontWeight: '600' }}>{stats.pagesLeft}</span>
                                <span style={{ fontSize: '12px', opacity: 0.8 }}>{t('hatimCoach.pagesLeft')}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Decorative Background Pattern */}
                    <div style={{ 
                        position: 'absolute', right: -20, bottom: -20, opacity: 0.1,
                        transform: 'rotate(-15deg)'
                    }}>
                        <Target size={140} />
                    </div>
                </div>

                {/* Progress Control */}
                <div className="glass-card" style={{ padding: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>{t('hatimCoach.progress')}</h3>
                        <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '18px' }}>%{Math.round(progressPercent)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', marginBottom: '25px' }}>
                        <div style={{ 
                            width: `${progressPercent}%`, height: '100%', 
                            background: 'linear-gradient(90deg, #10b981, #34d399)', 
                            borderRadius: '6px', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' 
                        }} />
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
                        <button 
                            onClick={() => handleUpdateProgress(currentPage - 1)}
                            className="btn"
                            style={{ 
                                width: '56px', height: '56px', borderRadius: '16px', padding: 0, 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#f8fafc', border: '1px solid #e2e8f0'
                            }}
                        >
                            <span style={{ fontSize: '24px', color: '#64748b' }}>−</span>
                        </button>

                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {t('hatimCoach.currentPage')}
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-color)' }}>
                                {currentPage}
                            </div>
                        </div>

                        <button 
                            onClick={() => handleUpdateProgress(currentPage + 1)}
                            className="btn btn-primary"
                            style={{ 
                                width: '56px', height: '56px', borderRadius: '16px', padding: 0, 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            <span style={{ fontSize: '24px' }}>+</span>
                        </button>
                    </div>
                </div>

                {/* Stats & Motivation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="glass-card" style={{ padding: '15px', textAlign: 'center', margin: 0 }}>
                        <TrendingUp size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>{t('hatimCoach.avgSpeed')}</div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>
                            {Math.round(currentPage / Math.max(1, (new Date() - new Date(data.startDate)) / (1000 * 60 * 60 * 24)))} {t('hatimCoach.pagesDay')}
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '15px', textAlign: 'center', margin: 0 }}>
                        <Award size={24} color="#8b5cf6" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>{t('hatimCoach.streak')}</div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>3 {t('hatimCoach.days')}</div>
                    </div>
                </div>

                {/* Settings / Reset */}
                <div className="glass-card" style={{ padding: '15px' }}>
                    <button 
                        onClick={handleReset}
                        style={{ 
                            width: '100%', background: 'none', border: 'none', color: '#ef4444', 
                            fontSize: '14px', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', gap: '8px', cursor: 'pointer', padding: '10px'
                        }}
                    >
                        <RefreshCw size={16} /> {t('hatimCoach.resetPlan')}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="app-container" style={{ paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-color)' }}>{t('hatimCoach.title')}</h2>
            </div>

            <div style={{ padding: '0 20px' }}>
                {!data ? renderWizard() : renderDashboard()}
            </div>
        </div>
    );
};

export default HatimCoach;
