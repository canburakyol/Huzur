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
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Motivation */}
            <div className="glass-card" style={{
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'center',
                fontStyle: 'italic',
                color: 'var(--text-color)'
            }}>
                ✨ "{t(motivation)}"
            </div>

            {/* Today's Score */}
            <div className="glass-card" style={{
                padding: '20px',
                marginBottom: '16px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', marginBottom: '8px' }}>
                    {t('deedJournal.today.score')}
                </div>
                <div style={{
                    fontSize: '42px',
                    fontWeight: '800',
                    color: calculateTodayPoints() >= 0 ? 'var(--primary-color)' : '#e74c3c'
                }}>
                    {calculateTodayPoints()}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', marginTop: '8px' }}>
                    🔥 {allTimeStats.currentStreak} {t('deedJournal.today.streak')}
                </div>
            </div>

            {/* Daily Prayers */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                    fontSize: '14px',
                    color: 'var(--primary-color)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    🕌 {t('deedJournal.today.prayers')} ({countCompletedPrayers()}/5)
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {DAILY_WORSHIP.map(deed => (
                        <button
                            key={deed.id}
                            onClick={() => toggleDeed(deed.id, deed.points)}
                            style={{
                                flex: '1 1 60px',
                                padding: '12px 8px',
                                background: todayDeeds[deed.id] ? 'var(--primary-color)' : 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{deed.icon}</div>
                            <div style={{
                                fontSize: '10px',
                                color: todayDeeds[deed.id] ? '#fff' : 'var(--text-color)'
                            }}>
                                {t(deed.title).replace(' Namazı', '').replace(' Prayer', '').replace(' صلاة', '')}
                            </div>
                            {todayDeeds[deed.id] && (
                                <Check size={14} color="#fff" style={{ marginTop: '4px' }} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sunnah Deeds */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                    fontSize: '14px',
                    color: 'var(--primary-color)',
                    marginBottom: '12px'
                }}>
                    ✨ {t('deedJournal.today.sunnah')}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {SUNNAH_DEEDS.map(deed => (
                        <div
                            key={deed.id}
                            onClick={() => toggleDeed(deed.id, deed.points)}
                            className="glass-card"
                            style={{
                                padding: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                background: todayDeeds[deed.id] ? 'rgba(46, 204, 113, 0.2)' : 'var(--glass-bg)'
                            }}
                        >
                            <span style={{ fontSize: '24px' }}>{deed.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-color)' }}>
                                    {t(deed.title)}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-color-muted)' }}>
                                    {t(deed.description)}
                                </div>
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--primary-color)',
                                fontWeight: '600'
                            }}>
                                +{deed.points}
                            </div>
                            {todayDeeds[deed.id] ? (
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: '#2ecc71',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Check size={14} color="#fff" />
                                </div>
                            ) : (
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    border: '2px solid var(--glass-border)'
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Good Deeds */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                    fontSize: '14px',
                    color: 'var(--primary-color)',
                    marginBottom: '12px'
                }}>
                    💚 {t('deedJournal.today.goodDeeds')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {GOOD_DEEDS.map(deed => (
                        <div
                            key={deed.id}
                            onClick={() => toggleDeed(deed.id, deed.points)}
                            className="glass-card"
                            style={{
                                padding: '12px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: todayDeeds[deed.id] ? 'rgba(46, 204, 113, 0.2)' : 'var(--glass-bg)'
                            }}
                        >
                            <span style={{ fontSize: '24px' }}>{deed.icon}</span>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: 'var(--text-color)',
                                marginTop: '4px'
                            }}>
                                {t(deed.title)}
                            </div>
                            <div style={{
                                fontSize: '10px',
                                color: 'var(--primary-color)',
                                marginTop: '4px'
                            }}>
                                +{deed.points}
                            </div>
                            {todayDeeds[deed.id] && (
                                <Check size={14} color="#2ecc71" style={{ marginTop: '4px' }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Things to Avoid */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{
                    fontSize: '14px',
                    color: '#e74c3c',
                    marginBottom: '12px'
                }}>
                    🚫 {t('deedJournal.today.avoid')}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-color-muted)', marginBottom: '12px' }}>
                    {t('deedJournal.today.avoidDesc')}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {THINGS_TO_AVOID.map(deed => (
                        <button
                            key={deed.id}
                            onClick={() => toggleDeed(deed.id, deed.points)}
                            style={{
                                padding: '10px 14px',
                                background: todayDeeds[deed.id] ? 'rgba(231, 76, 60, 0.3)' : 'var(--glass-bg)',
                                border: todayDeeds[deed.id] ? '1px solid #e74c3c' : '1px solid var(--glass-border)',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: todayDeeds[deed.id] ? '#e74c3c' : 'var(--text-color)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
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
                style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    color: 'var(--text-color-muted)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}
            >
                <RefreshCw size={16} /> {t('deedJournal.today.reset')}
            </button>
        </div>
    );

    // Render Stats tab
    const renderStats = () => (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Overall Stats */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--primary-color)', marginBottom: '16px' }}>
                    📊 {t('deedJournal.stats.title')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-color)' }}>
                            {allTimeStats.totalPoints}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-color-muted)' }}>{t('deedJournal.stats.totalPoints')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary-color)' }}>
                            {allTimeStats.totalDays}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-color-muted)' }}>{t('deedJournal.stats.totalDays')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#e74c3c' }}>
                            🔥 {allTimeStats.currentStreak}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-color-muted)' }}>{t('deedJournal.stats.currentStreak')}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: '#f39c12' }}>
                            🏆 {allTimeStats.longestStreak}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-color-muted)' }}>{t('deedJournal.stats.longestStreak')}</div>
                    </div>
                </div>
            </div>

            {/* Daily Progress */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', color: 'var(--primary-color)', marginBottom: '16px' }}>
                    📅 {t('deedJournal.stats.todayProgress')}
                </h3>

                {/* Prayer Progress */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-color)' }}>{t('deedJournal.stats.prayers')}</span>
                        <span style={{ fontSize: '13px', color: 'var(--primary-color)' }}>{countCompletedPrayers()}/5</span>
                    </div>
                    <div style={{
                        height: '8px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.1)'
                    }}>
                        <div style={{
                            height: '100%',
                            borderRadius: '4px',
                            background: 'var(--primary-color)',
                            width: `${(countCompletedPrayers() / 5) * 100}%`,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>

                {/* Sunnah Progress */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-color)' }}>{t('deedJournal.stats.sunnahs')}</span>
                        <span style={{ fontSize: '13px', color: 'var(--primary-color)' }}>
                            {SUNNAH_DEEDS.filter(d => todayDeeds[d.id]).length}/{SUNNAH_DEEDS.length}
                        </span>
                    </div>
                    <div style={{
                        height: '8px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.1)'
                    }}>
                        <div style={{
                            height: '100%',
                            borderRadius: '4px',
                            background: '#2ecc71',
                            width: `${(SUNNAH_DEEDS.filter(d => todayDeeds[d.id]).length / SUNNAH_DEEDS.length) * 100}%`,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>

                {/* Good Deeds Progress */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-color)' }}>{t('deedJournal.stats.goodDeeds')}</span>
                        <span style={{ fontSize: '13px', color: 'var(--primary-color)' }}>
                            {GOOD_DEEDS.filter(d => todayDeeds[d.id]).length}/{GOOD_DEEDS.length}
                        </span>
                    </div>
                    <div style={{
                        height: '8px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.1)'
                    }}>
                        <div style={{
                            height: '100%',
                            borderRadius: '4px',
                            background: '#3498db',
                            width: `${(GOOD_DEEDS.filter(d => todayDeeds[d.id]).length / GOOD_DEEDS.length) * 100}%`,
                            transition: 'width 0.3s ease'
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );

    // Render Achievements tab
    const renderAchievements = () => (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                {t('deedJournal.achievements.title')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ACHIEVEMENTS.map(achievement => {
                    const unlocked = checkAchievement(achievement);
                    return (
                        <div
                            key={achievement.id}
                            className="glass-card"
                            style={{
                                padding: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                opacity: unlocked ? 1 : 0.5
                            }}
                        >
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: unlocked ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px'
                            }}>
                                {unlocked ? achievement.icon : '🔒'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    color: unlocked ? 'var(--primary-color)' : 'var(--text-color-muted)'
                                }}>
                                    {t(achievement.title)}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                    {t(achievement.description)}
                                </div>
                            </div>
                            {unlocked && (
                                <Check size={24} color="var(--primary-color)" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingTop: '20px'
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    📝 {t('deedJournal.title')}
                </h1>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px'
            }}>
                {[
                    { id: 'today', label: t('deedJournal.tabs.today'), icon: <Calendar size={16} /> },
                    { id: 'stats', label: t('deedJournal.tabs.stats'), icon: <TrendingUp size={16} /> },
                    { id: 'achievements', label: t('deedJournal.tabs.achievements'), icon: <Award size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: activeTab === tab.id ? 'var(--primary-color)' : 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-color)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'today' && renderToday()}
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'achievements' && renderAchievements()}
        </div>
    );
}

export default DeedJournal;
