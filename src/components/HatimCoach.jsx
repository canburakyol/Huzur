import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    ChevronLeft, Calendar, BookOpen, Target, Award, 
    RefreshCw, CheckCircle, Clock, TrendingUp, Edit3 
} from 'lucide-react';
import { calculateHatimTarget, TOTAL_PAGES, getSuggestedDates } from '../utils/hatimCalculator';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';

const STORAGE_KEY = 'hatim_coach_data';

const HatimCoach = ({ onClose }) => {
    const { t } = useTranslation();
    const [data, setData] = useState(() => {
        return storageService.getItem(STORAGE_KEY, null);
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
        storageService.setItem(STORAGE_KEY, newData);
    };

    const handleUpdateProgress = (newPage) => {
        const updatedPage = Math.min(TOTAL_PAGES, Math.max(0, newPage));
        setCurrentPage(updatedPage);
        
        const newData = { ...data, currentPage: updatedPage };
        setData(newData);
        storageService.setItem(STORAGE_KEY, newData);
    };

    const handleReset = () => {
        if (confirm(t('common.areYouSure'))) {
            storageService.removeItem(STORAGE_KEY);
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
            <div className="reveal-stagger" style={{ 
                padding: '10px 0', 
                textAlign: 'center', 
                minHeight: '400px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center' 
            }}>
                {step === 1 && (
                    <div className="reveal-stagger">
                        <div className="settings-icon-box" style={{ 
                            width: '100px', height: '100px', 
                            background: 'linear-gradient(135deg, var(--nav-accent), #f59e0b)',
                            borderRadius: '50%', margin: '0 auto 32px', color: 'white', 
                            boxShadow: '0 12px 24px rgba(var(--nav-accent-rgb, 249, 115, 22), 0.3)'
                        }}>
                            <BookOpen size={48} />
                        </div>
                        <h2 style={{ color: 'var(--nav-text)', marginBottom: '16px', fontSize: '1.75rem', fontWeight: '950' }}>{t('hatimCoach.welcomeTitle')}</h2>
                        <p style={{ color: 'var(--nav-text-muted)', marginBottom: '40px', lineHeight: 1.6, fontSize: '1rem', fontWeight: '600' }}>
                            {t('hatimCoach.welcomeDesc')}
                        </p>
                        <button onClick={() => setStep(2)} className="velocity-target-btn" style={{ width: '100%', padding: '20px', justifyContent: 'center', fontSize: '1.1rem' }}>
                            {t('hatimCoach.startSetup')}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="reveal-stagger">
                        <h3 style={{ marginBottom: '32px', fontSize: '1.5rem', fontWeight: '950', color: 'var(--nav-text)' }}>{t('hatimCoach.selectTarget')}</h3>
                        
                        <div style={{ textAlign: 'left', marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '800', color: 'var(--nav-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {t('hatimCoach.targetDateLabel')}
                            </label>
                            <input 
                                type="date" 
                                value={targetDate} 
                                onChange={(e) => setTargetDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{
                                    width: '100%', padding: '18px', borderRadius: '20px',
                                    border: '1px solid var(--nav-border)', background: 'var(--nav-hover)',
                                    fontSize: '1.1rem', color: 'var(--nav-text)', fontWeight: '700'
                                }}
                            />
                        </div>

                        {/* Quick Suggestions */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px' }}>
                            {getSuggestedDates().map((s, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setTargetDate(s.date)}
                                    className="settings-card"
                                    style={{ 
                                        padding: '10px 16px', fontSize: '0.8rem', margin: 0,
                                        background: targetDate === s.date ? 'var(--nav-accent)' : 'var(--nav-hover)',
                                        color: targetDate === s.date ? 'white' : 'var(--nav-text)',
                                        border: 'none',
                                        fontWeight: '800',
                                        borderRadius: '12px'
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="velocity-target-btn" style={{ flex: 1, justifyContent: 'center', background: 'var(--nav-hover)', color: 'var(--nav-text-muted)' }} onClick={() => setStep(1)}>{t('common.back')}</button>
                            <button 
                                onClick={() => targetDate && setStep(3)} 
                                disabled={!targetDate}
                                className="velocity-target-btn" 
                                style={{ flex: 1, justifyContent: 'center', opacity: targetDate ? 1 : 0.5, background: 'var(--nav-accent)', color: 'white' }}
                            >
                                {t('common.next')}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && stats && (
                    <div className="reveal-stagger">
                        <h3 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: '950', color: 'var(--nav-text)' }}>{t('hatimCoach.summary')}</h3>
                        
                        <div className="settings-card" style={{ 
                            background: 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.05)', 
                            border: '1px solid var(--nav-accent)',
                            flexDirection: 'column',
                            padding: '32px 24px', 
                            marginBottom: '40px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--nav-accent)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>{t('hatimCoach.dailyGoal')}</div>
                            <div style={{ fontSize: '3.5rem', fontWeight: '950', color: 'var(--nav-accent)', lineHeight: 1 }}>
                                {stats.dailyTarget} <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>{t('hatimCoach.pages')}</span>
                            </div>
                            <div className="hamburger-level-badge" style={{ marginTop: '16px', background: 'var(--nav-accent)', color: 'white', alignSelf: 'center' }}>
                                {stats.daysLeft} {t('hatimCoach.days')} • {TOTAL_PAGES} {t('hatimCoach.pagesTotal')}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="velocity-target-btn" style={{ flex: 1, justifyContent: 'center', background: 'var(--nav-hover)', color: 'var(--nav-text-muted)' }} onClick={() => setStep(2)}>{t('common.back')}</button>
                            <button onClick={handleSaveSetup} className="velocity-target-btn" style={{ flex: 1, justifyContent: 'center', background: 'var(--nav-accent)', color: 'white' }}>
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
            <div className="reveal-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
                {/* Main Progress Card - Velocity Style */}
                <div className="settings-card" style={{ 
                    background: 'linear-gradient(135deg, var(--nav-accent), #f59e0b)',
                    color: 'white', padding: '32px 24px', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 12px 32px rgba(var(--nav-accent-rgb, 249, 115, 22), 0.3)',
                    border: 'none',
                    minHeight: '200px'
                }}>
                    <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('hatimCoach.dailyGoal')}</div>
                                <div style={{ fontSize: '4rem', fontWeight: '950', lineHeight: 1, letterSpacing: '-2px' }}>
                                    {stats.dailyTarget}
                                    <span style={{ fontSize: '1.2rem', fontWeight: '800', marginLeft: '8px', opacity: 0.9 }}>{t('hatimCoach.pages')}</span>
                                </div>
                            </div>
                            <div className="hamburger-level-badge" style={{ 
                                background: 'rgba(255,255,255,0.2)', color: 'white',
                                fontSize: '0.8rem', fontWeight: '900'
                            }}>
                                {currentJuz}. {t('hatimCoach.juz')}
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '32px', display: 'flex', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={18} style={{ opacity: 0.8 }} />
                                <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>{stats.daysLeft}</span>
                                <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: '700' }}>{t('hatimCoach.daysLeft')}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOpen size={18} style={{ opacity: 0.8 }} />
                                <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>{stats.pagesLeft}</span>
                                <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: '700' }}>{t('hatimCoach.pagesLeft')}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Decorative Background Pattern */}
                    <div style={{ 
                        position: 'absolute', right: -30, bottom: -30, opacity: 0.15,
                        transform: 'rotate(-15deg)', color: 'white'
                    }}>
                        <Target size={180} />
                    </div>
                </div>

                {/* Progress Control - Velocity Style */}
                <div className="settings-card" style={{ padding: '24px', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '950', color: 'var(--nav-text)' }}>{t('hatimCoach.progress')}</h3>
                        <div className="hamburger-level-badge" style={{ background: 'var(--nav-accent)', color: 'white' }}>%{Math.round(progressPercent)}</div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '14px', background: 'var(--nav-hover)', borderRadius: '7px', overflow: 'hidden', marginBottom: '32px' }}>
                        <div style={{ 
                            width: `${progressPercent}%`, height: '100%', 
                            background: 'linear-gradient(90deg, var(--nav-accent), #f59e0b)', 
                            borderRadius: '7px', transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' 
                        }} />
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', width: '100%' }}>
                        <button 
                            onClick={() => handleUpdateProgress(currentPage - 1)}
                            className="settings-icon-box"
                            style={{ 
                                width: '64px', height: '64px', borderRadius: '20px', padding: 0, 
                                background: 'var(--nav-hover)', border: '1px solid var(--nav-border)',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '28px', color: 'var(--nav-text)', fontWeight: '300' }}>−</span>
                        </button>

                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '900', marginBottom: '4px' }}>
                                {t('hatimCoach.currentPage')}
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '950', color: 'var(--nav-text)', lineHeight: 1 }}>
                                {currentPage}
                            </div>
                        </div>

                        <button 
                            onClick={() => handleUpdateProgress(currentPage + 1)}
                            className="settings-icon-box"
                            style={{ 
                                width: '64px', height: '64px', borderRadius: '20px', padding: 0, 
                                background: 'var(--nav-accent)', color: 'white',
                                boxShadow: '0 8px 16px rgba(var(--nav-accent-rgb, 249, 115, 22), 0.3)',
                                cursor: 'pointer',
                                border: 'none'
                            }}
                        >
                            <span style={{ fontSize: '28px', fontWeight: '300' }}>+</span>
                        </button>
                    </div>
                </div>

                {/* Stats & Motivation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="settings-card" style={{ padding: '20px', textAlign: 'center', flexDirection: 'column', gap: '8px' }}>
                        <div className="settings-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: '40px', height: '40px', marginBottom: '8px' }}>
                            <TrendingUp size={20} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '800' }}>{t('hatimCoach.avgSpeed')}</div>
                        <div style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '0.95rem' }}>
                            {Math.round(currentPage / Math.max(1, (new Date() - new Date(data.startDate)) / (1000 * 60 * 60 * 24)))} {t('hatimCoach.pagesDay')}
                        </div>
                    </div>
                    <div className="settings-card" style={{ padding: '20px', textAlign: 'center', flexDirection: 'column', gap: '8px' }}>
                        <div className="settings-icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', width: '40px', height: '40px', marginBottom: '8px' }}>
                            <Award size={20} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '800' }}>{t('hatimCoach.streak')}</div>
                        <div style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '0.95rem' }}>3 {t('hatimCoach.days')}</div>
                    </div>
                </div>

                {/* Settings / Reset */}
                <button 
                    onClick={handleReset}
                    className="velocity-target-btn"
                    style={{ 
                        marginTop: '12px',
                        width: '100%', 
                        background: 'var(--nav-hover)', 
                        color: '#ef4444', 
                        borderColor: 'transparent',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <RefreshCw size={16} /> {t('hatimCoach.resetPlan')}
                </button>
            </div>
        );
    };

    return (
        <div className="settings-container reveal-stagger">
            {/* Header - Velocity Style */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                marginBottom: '32px'
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{ 
                    margin: 0, 
                    fontSize: '1.75rem', 
                    color: 'var(--nav-text)',
                    fontWeight: '950'
                }}>{t('hatimCoach.title')}</h2>
            </div>

            <div style={{ padding: 0 }}>
                {!data ? renderWizard() : renderDashboard()}
            </div>
        </div>
    );
};

export default HatimCoach;
