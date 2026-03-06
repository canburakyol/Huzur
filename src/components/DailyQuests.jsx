import { useGamification } from '../hooks/useGamification';
import { Check, Gift, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';

const ROUTE_MAP = {
    '/zikirmatik': { feature: 'zikirmatik' },
    '/esma': { feature: 'esmaUlHusna' },
    '/hadis': { feature: 'hadiths' },
    '/ayet': { feature: 'quran' },
    '/dua-share': { tab: 'community' },
    '/kible': { feature: 'qibla' },
    '/': { tab: 'home' }
};

const DailyQuests = memo(() => {
    const { dailyQuests, claimQuestReward } = useGamification();
    const { t } = useTranslation();

    const emitQuestProgressForAction = (action) => {
        if (action === '/kible') {
            window.dispatchEvent(new CustomEvent('quest:progress', {
                detail: { type: 'utility', subType: 'qibla', amount: 1 }
            }));
        }

        if (action === '/') {
            window.dispatchEvent(new CustomEvent('quest:progress', {
                detail: { type: 'utility', subType: 'prayer_times', amount: 1 }
            }));
        }
    };

    const openQuestAction = (action) => {
        if (!action) return;

        emitQuestProgressForAction(action);
        const config = ROUTE_MAP[action] || ROUTE_MAP['/'];

        if (config.feature) {
            window.dispatchEvent(new CustomEvent('openFeature', { detail: config.feature }));
        } else if (config.tab) {
            window.dispatchEvent(new CustomEvent('setActiveTab', { detail: config.tab }));
        }
    };

    if (!dailyQuests || !dailyQuests.quests) return null;

    // Tamamlanan ve ödülü alınmamış görev sayısı
    const claimableCount = dailyQuests.quests.filter(q => q.completed && !q.isClaimed).length;

    return (
        <div className="settings-card reveal-stagger" style={{
            margin: '20px',
            padding: '24px',
            flexDirection: 'column',
            alignItems: 'stretch',
            background: 'var(--nav-bg)',
            border: '1px solid var(--nav-border)',
            borderRadius: '24px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ 
                    margin: 0, 
                    fontSize: '1rem', 
                    fontWeight: '950', 
                    color: 'var(--nav-text)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    <div className="settings-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <RefreshCw size={18} />
                    </div>
                    {t('quests.dailyTitle', 'Günün Görevleri')}
                    {claimableCount > 0 && (
                        <span className="badge-pulse" style={{ 
                            background: 'var(--error-color)', color: 'white', fontSize: '0.65rem', 
                            padding: '2px 8px', borderRadius: '10px', fontWeight: '950'
                        }}>{claimableCount}</span>
                    )}
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="reveal-stagger">
                {dailyQuests.quests.map((quest, index) => {
                    const isCompleted = quest.completed;
                    const isClaimed = quest.isClaimed;
                    const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

                    return (
                        <div key={quest.id} className="reveal-stagger" style={{
                            background: isClaimed ? 'rgba(255, 255, 255, 0.02)' : 'var(--nav-hover)',
                            borderRadius: '20px',
                            padding: '16px',
                            border: isClaimed ? '1px dashed var(--nav-border)' : '1px solid var(--nav-border)',
                            position: 'relative',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: isClaimed ? 0.6 : 1,
                            '--delay': `${index * 0.05}s`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
                                <div style={{ 
                                    fontSize: '0.95rem', 
                                    fontWeight: '800', 
                                    color: 'var(--nav-text)', 
                                    textDecoration: isClaimed ? 'line-through' : 'none',
                                    flex: 1,
                                    paddingRight: '12px',
                                    lineHeight: '1.4'
                                }}>
                                    {quest.text}
                                </div>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: '900', 
                                    color: isClaimed ? 'var(--nav-text-muted)' : 'var(--nav-accent)',
                                    background: isClaimed ? 'transparent' : 'rgba(79, 70, 229, 0.1)',
                                    padding: '4px 8px',
                                    borderRadius: '8px'
                                }}>
                                    {isClaimed ? <Check size={16} /> : `+${quest.xp} XP`}
                                </div>
                            </div>

                            {!isClaimed ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            width: `${progressPercent}%`, 
                                            background: isCompleted 
                                                ? 'linear-gradient(90deg, var(--bg-emerald-light), var(--bg-emerald-deep))' 
                                                : 'linear-gradient(90deg, var(--nav-accent), var(--primary-color))',
                                            transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            boxShadow: isCompleted ? '0 0 10px rgba(15, 118, 110, 0.3)' : 'none',
                                            borderRadius: '10px'
                                        }}></div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', minWidth: '45px', textAlign: 'right', fontWeight: '900' }}>
                                        {quest.progress}/{quest.target}
                                    </div>
                                    
                                    {isCompleted ? (
                                        <button 
                                            onClick={() => claimQuestReward(quest.id)}
                                            className="velocity-target-btn pulse"
                                            style={{
                                                padding: '8px 16px', fontSize: '0.75rem', height: 'auto',
                                                background: 'var(--bg-emerald-light)', boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
                                            }}
                                        >
                                            <Gift size={14} /> {t('quests.claim', 'Al')}
                                        </button>
                                    ) : (
                                        quest.action && (
                                            <button 
                                                onClick={() => openQuestAction(quest.action)} 
                                                className="settings-card"
                                                style={{
                                                    padding: '8px 16px', fontSize: '0.75rem', fontWeight: '900',
                                                    color: 'var(--nav-text)', background: 'var(--nav-hover)',
                                                    border: '1px solid var(--nav-border)'
                                                }}
                                            >
                                                {t('quests.go', 'Git')}
                                            </button>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--bg-emerald-light)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '900' }}>
                                    <Check size={14} /> {t('quests.claimed', 'Ödül alındı')}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
             <style>{`
                .badge-pulse {
                    animation: badgePulse 2s infinite;
                }
                @keyframes badgePulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(231, 76, 60, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
                }
            `}</style>
        </div>
    );
});

export default DailyQuests;
