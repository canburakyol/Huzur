import { useState, useEffect, useMemo } from 'react';
import { Check, X, Calendar, TrendingUp, Award, Target, Plus, Minus, RefreshCw } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { useTranslation } from 'react-i18next';
import {
    DAILY_WORSHIP,
    SUNNAH_DEEDS,
    GOOD_DEEDS,
    THINGS_TO_AVOID,
    DAILY_GOALS,
    ACHIEVEMENTS,
    MOTIVATION_MESSAGES
} from '../data/deedJournalData';
import { useGamification } from '../hooks/useGamification';
import { storageService } from '../services/storageService';

const DEED_STATS_KEY = 'deed_stats';

function DeedJournal({ onClose }) {
    const { t } = useTranslation();
    const { addPoints } = useGamification();
    const [activeTab, setActiveTab] = useState('today'); // today, stats, achievements
    const [todayDate] = useState(new Date().toDateString());
    const todayDeedKey = `deeds_${todayDate}`;
    
    // Use useMemo to calculate motivation message once (avoiding impure Math.random during render)
    const motivation = useMemo(() => {
        return MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
    }, []);

    // Load data from localStorage
    const [todayDeeds, setTodayDeeds] = useState(() => {
        return storageService.getItem(todayDeedKey, {});
    });

    const [allTimeStats, setAllTimeStats] = useState(() => {
        return storageService.getItem(DEED_STATS_KEY, {
            totalPoints: 0,
            totalDays: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastRecordDate: null
        });
    });

    // Helper function - defined before useEffect that uses it
    const getYesterdayDateString = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toDateString();
    };

    // Calculate today's points - defined before useEffect that uses it
    const calculateTodayPoints = () => {
        let total = 0;

        [...DAILY_WORSHIP, ...SUNNAH_DEEDS, ...GOOD_DEEDS].forEach(deed => {
            if (todayDeeds[deed.id]) total += deed.points;
        });

        THINGS_TO_AVOID.forEach(deed => {
            if (todayDeeds[deed.id]) total += deed.points; // negative points
        });

        return total;
    };

    // Save deeds when changed
    useEffect(() => {
        storageService.setItem(todayDeedKey, todayDeeds);

        // Update stats
        const points = calculateTodayPoints();
        if (points > 0 && allTimeStats.lastRecordDate !== todayDate) {
            const newStreak = allTimeStats.lastRecordDate === getYesterdayDateString()
                ? allTimeStats.currentStreak + 1
                : 1;

            setAllTimeStats(prev => {
                const updated = {
                    ...prev,
                    totalPoints: prev.totalPoints + points,
                    totalDays: prev.totalDays + 1,
                    currentStreak: newStreak,
                    longestStreak: Math.max(prev.longestStreak, newStreak),
                    lastRecordDate: todayDate
                };
                storageService.setItem(DEED_STATS_KEY, updated);
                return updated;
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [todayDeeds]);

    // Toggle a deed
    const toggleDeed = (deedId, points) => {
        const isCompleted = !todayDeeds[deedId];
        
        setTodayDeeds(prev => ({
            ...prev,
            [deedId]: isCompleted
        }));

        // Update global gamification points
        addPoints(isCompleted ? points : -points);
    };



    // Count completed prayers
    const countCompletedPrayers = () => {
        return DAILY_WORSHIP.filter(d => todayDeeds[d.id]).length;
    };

    // Check achievement
    const checkAchievement = (achievement) => {
        switch (achievement.type) {
            case 'streak':
                return allTimeStats.currentStreak >= achievement.requirement;
            case 'total_points':
                return allTimeStats.totalPoints >= achievement.requirement;
            case 'daily_points':
                return calculateTodayPoints() >= achievement.requirement;
            case 'daily_prayers':
                return countCompletedPrayers() >= achievement.requirement;
            default:
                return false;
        }
    };

    // Reset today
    const resetToday = () => {
        if (confirm(t('deedJournal.today.resetConfirm'))) {
            setTodayDeeds({});
            storageService.removeItem(todayDeedKey);
        }
    };

    // Render Today tab
    const renderToday = () => (
        <div className="reveal-stagger">
            {/* Motivation */}
            <div className="settings-card" style={{
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'center',
                fontStyle: 'italic',
                background: 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.05)',
                border: '1px dashed var(--nav-accent)'
            }}>
                ✨ "{t(motivation)}"
            </div>

            {/* Today's Score */}
            <div className="settings-card" style={{
                padding: '24px',
                marginBottom: '24px',
                flexDirection: 'column',
                gap: '4px'
            }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {t('deedJournal.today.score')}
                </div>
                <div style={{
                    fontSize: '3.5rem',
                    fontWeight: '900',
                    color: calculateTodayPoints() >= 0 ? 'var(--nav-accent)' : '#ef4444',
                    lineHeight: '1'
                }}>
                    {calculateTodayPoints()}
                </div>
                <div className="hamburger-level-badge" style={{ marginTop: '12px', background: 'var(--nav-accent)', color: 'white' }}>
                    🔥 {allTimeStats.currentStreak} {t('deedJournal.today.streak')}
                </div>
            </div>

            {/* Daily Prayers */}
            <div className="settings-group">
                <div className="settings-group-title">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🕌 {t('deedJournal.today.prayers')} ({countCompletedPrayers()}/5)
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {DAILY_WORSHIP.map(deed => (
                        <button
                            key={deed.id}
                            onClick={() => toggleDeed(deed.id, deed.points)}
                            className={`nav-item ${todayDeeds[deed.id] ? 'active' : ''}`}
                            style={{
                                padding: '12px 4px',
                                borderRadius: '16px',
                                position: 'relative'
                            }}
                        >
                            <div style={{ fontSize: '1.2rem' }}>{deed.icon}</div>
                            <div style={{
                                fontSize: '0.65rem',
                                fontWeight: '800'
                            }}>
                                {t(deed.title).split(' ')[0]}
                            </div>
                            {todayDeeds[deed.id] && (
                                <div className="nav-item-badge">
                                    <Check size={10} strokeWidth={4} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sunnah Deeds */}
            <div className="settings-group" style={{ marginTop: '24px' }}>
                <div className="settings-group-title">✨ {t('deedJournal.today.sunnah')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {SUNNAH_DEEDS.map(deed => (
                        <div
                            key={deed.id}
                            onClick={() => toggleDeed(deed.id, deed.points)}
                            className="settings-card"
                            style={{
                                padding: '16px',
                                cursor: 'pointer',
                                borderLeft: todayDeeds[deed.id] ? '4px solid var(--nav-accent)' : '1px solid var(--nav-border)'
                            }}
                        >
                            <div className="settings-card-left">
                                <div className="settings-icon-box" style={{ background: todayDeeds[deed.id] ? 'var(--nav-accent)' : '', color: todayDeeds[deed.id] ? 'white' : 'var(--nav-accent)' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{deed.icon}</span>
                                </div>
                                <div className="settings-user-info">
                                    <div className="settings-label">{t(deed.title)}</div>
                                    <div className="settings-desc">{t(deed.description)}</div>
                                </div>
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: 'var(--nav-accent)',
                                fontWeight: '800'
                            }}>
                                +{deed.points}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Good Deeds */}
            <div className="settings-group" style={{ marginTop: '24px' }}>
                <div className="settings-group-title">💚 {t('deedJournal.today.goodDeeds')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {GOOD_DEEDS.map(deed => (
                        <div
                            key={deed.id}
                            onClick={() => toggleDeed(deed.id, deed.points)}
                            className="settings-card"
                            style={{
                                padding: '16px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                flexDirection: 'column',
                                gap: '8px',
                                border: todayDeeds[deed.id] ? '1px solid var(--nav-accent)' : '1px solid var(--nav-border)',
                                background: todayDeeds[deed.id] ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.03)' : ''
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{deed.icon}</span>
                            <div style={{
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                color: 'var(--nav-text)'
                            }}>
                                {t(deed.title)}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--nav-accent)',
                                fontWeight: '800'
                            }}>
                                +{deed.points}
                            </div>
                            {todayDeeds[deed.id] && (
                                <div className="nav-item-badge">
                                    <Check size={10} strokeWidth={4} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Things to Avoid */}
            <div className="settings-group" style={{ marginTop: '24px' }}>
                <div className="settings-group-title" style={{ color: '#ef4444' }}>🚫 {t('deedJournal.today.avoid')}</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', marginBottom: '16px', paddingLeft: '8px' }}>
                    {t('deedJournal.today.avoidDesc')}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {THINGS_TO_AVOID.map(deed => (
                        <button
                            key={deed.id}
                            onClick={() => toggleDeed(deed.id, deed.points)}
                            className={`nav-item ${todayDeeds[deed.id] ? 'active' : ''}`}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '24px',
                                border: todayDeeds[deed.id] ? '1px solid #ef4444' : '1px solid var(--nav-border)',
                                background: todayDeeds[deed.id] ? 'rgba(239, 68, 68, 0.1)' : 'var(--nav-hover)',
                                color: todayDeeds[deed.id] ? '#ef4444' : 'var(--nav-text)',
                                fontSize: '0.8rem',
                                fontWeight: '700'
                            }}
                        >
                            {deed.icon} {t(deed.title)} ({deed.points})
                        </button>
                    ))}
                </div>
            </div>

            {/* Reset Button */}
            <button
                onClick={resetToday}
                className="velocity-target-btn"
                style={{
                    marginTop: '32px',
                    width: '100%',
                    justifyContent: 'center',
                    background: 'var(--nav-hover)',
                    color: 'var(--nav-text-muted)',
                    borderColor: 'transparent'
                }}
            >
                <RefreshCw size={18} /> {t('deedJournal.today.reset')}
            </button>
        </div>
    );

    // Render Stats tab
    const renderStats = () => (
        <div className="reveal-stagger">
            {/* Overall Stats */}
            <div className="settings-group">
                <div className="settings-group-title">📊 {t('deedJournal.stats.title')}</div>
                <div className="settings-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--nav-accent)' }}>
                                {allTimeStats.totalPoints}
                            </div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>
                                {t('deedJournal.stats.totalPoints')}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--nav-accent)' }}>
                                {allTimeStats.totalDays}
                            </div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>
                                {t('deedJournal.stats.totalDays')}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#f59e0b' }}>
                                🔥 {allTimeStats.currentStreak}
                            </div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>
                                {t('deedJournal.stats.currentStreak')}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#9d174d' }}>
                                🏆 {allTimeStats.longestStreak}
                            </div>
                            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>
                                {t('deedJournal.stats.longestStreak')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Progress */}
            <div className="settings-group" style={{ marginTop: '24px' }}>
                <div className="settings-group-title">📅 {t('deedJournal.stats.todayProgress')}</div>
                <div className="settings-card" style={{ flexDirection: 'column', gap: '20px', padding: '20px' }}>
                    {/* Prayer Progress */}
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--nav-text)' }}>{t('deedJournal.stats.prayers')}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--nav-accent)' }}>{countCompletedPrayers()}/5</span>
                        </div>
                        <div style={{ height: '10px', borderRadius: '5px', background: 'var(--nav-hover)', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                background: 'var(--nav-accent)',
                                width: `${(countCompletedPrayers() / 5) * 100}%`,
                                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                        </div>
                    </div>

                    {/* Sunnah Progress */}
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--nav-text)' }}>{t('deedJournal.stats.sunnahs')}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#10b981' }}>
                                {SUNNAH_DEEDS.filter(d => todayDeeds[d.id]).length}/{SUNNAH_DEEDS.length}
                            </span>
                        </div>
                        <div style={{ height: '10px', borderRadius: '5px', background: 'var(--nav-hover)', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                background: '#10b981',
                                width: `${(SUNNAH_DEEDS.filter(d => todayDeeds[d.id]).length / SUNNAH_DEEDS.length) * 100}%`,
                                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                        </div>
                    </div>

                    {/* Good Deeds Progress */}
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--nav-text)' }}>{t('deedJournal.stats.goodDeeds')}</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#3b82f6' }}>
                                {GOOD_DEEDS.filter(d => todayDeeds[d.id]).length}/{GOOD_DEEDS.length}
                            </span>
                        </div>
                        <div style={{ height: '10px', borderRadius: '5px', background: 'var(--nav-hover)', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                background: '#3b82f6',
                                width: `${(GOOD_DEEDS.filter(d => todayDeeds[d.id]).length / GOOD_DEEDS.length) * 100}%`,
                                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render Achievements tab
    const renderAchievements = () => (
        <div className="reveal-stagger">
            <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', paddingLeft: '8px', fontWeight: '600' }}>
                {t('deedJournal.achievements.title')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ACHIEVEMENTS.map(achievement => {
                    const unlocked = checkAchievement(achievement);
                    return (
                        <div
                            key={achievement.id}
                            className="settings-card"
                            style={{
                                padding: '16px',
                                opacity: unlocked ? 1 : 0.6,
                                border: unlocked ? '1px solid var(--nav-accent)' : '1px solid var(--nav-border)',
                                background: unlocked ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.03)' : ''
                            }}
                        >
                            <div className="settings-card-left">
                                <div className="settings-icon-box" style={{ 
                                    background: unlocked ? 'var(--nav-accent)' : 'var(--nav-hover)', 
                                    color: unlocked ? 'white' : 'var(--nav-text-muted)',
                                    width: '48px',
                                    height: '48px'
                                }}>
                                    {unlocked ? achievement.icon : '🔒'}
                                </div>
                                <div className="settings-user-info">
                                    <div className="settings-label" style={{ color: unlocked ? 'var(--nav-accent)' : 'var(--nav-text)' }}>
                                        {t(achievement.title)}
                                    </div>
                                    <div className="settings-desc">
                                        {t(achievement.description)}
                                    </div>
                                </div>
                            </div>
                            {unlocked && (
                                <div className="nav-item-badge" style={{ position: 'relative', right: '0', top: '0' }}>
                                    <Check size={14} strokeWidth={4} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="settings-container reveal-stagger">
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    color: 'var(--nav-text)',
                    fontWeight: '800'
                }}>
                    {t('deedJournal.title')}
                </h2>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '32px',
                background: 'var(--nav-hover)',
                padding: '8px',
                borderRadius: '24px'
            }}>
                {[
                    { id: 'today', label: t('deedJournal.tabs.today'), icon: <Calendar size={18} /> },
                    { id: 'stats', label: t('deedJournal.tabs.stats'), icon: <TrendingUp size={18} /> },
                    { id: 'achievements', label: t('deedJournal.tabs.achievements'), icon: <Award size={18} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '12px 8px',
                            background: activeTab === tab.id ? 'white' : 'transparent',
                            border: 'none',
                            borderRadius: '16px',
                            color: activeTab === tab.id ? 'var(--nav-accent)' : 'var(--nav-text-muted)',
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ minHeight: '60vh' }}>
                {activeTab === 'today' && renderToday()}
                {activeTab === 'stats' && renderStats()}
                {activeTab === 'achievements' && renderAchievements()}
            </div>
        </div>
    );
}

export default DeedJournal;
