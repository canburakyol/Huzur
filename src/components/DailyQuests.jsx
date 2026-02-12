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
        <div className="glass-card" style={{
            margin: '15px 20px',
            padding: '20px',
            borderRadius: '20px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📅 {t('quests.dailyTitle', 'Günün Görevleri')}
                    {claimableCount > 0 && (
                        <span style={{ 
                            background: 'var(--notification-dot)', color: 'white', fontSize: '10px', 
                            padding: '2px 8px', borderRadius: '10px', animation: 'bounce 1s infinite',
                            boxShadow: '0 0 10px rgba(231, 76, 60, 0.4)'
                        }}>{claimableCount}</span>
                    )}
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dailyQuests.quests.map(quest => {
                    const isCompleted = quest.completed;
                    const isClaimed = quest.isClaimed;
                    const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

                    return (
                        <div key={quest.id} style={{
                            background: isClaimed ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '12px',
                            border: isClaimed ? '1px solid var(--glass-border)' : '1px solid var(--glass-border)',
                            position: 'relative',
                            transition: 'var(--transition-smooth)',
                            opacity: isClaimed ? 0.7 : 1
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-color)', textDecoration: isClaimed ? 'line-through' : 'none' }}>
                                    {quest.text}
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--secondary-color)' }}>
                                    {isClaimed ? <Check size={18} color="var(--success-color)" /> : `+${quest.xp} XP`}
                                </div>
                            </div>

                            {!isClaimed ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            width: `${progressPercent}%`, 
                                            background: isCompleted 
                                                ? 'linear-gradient(90deg, #2ecc71, #27ae60)' 
                                                : 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))',
                                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: isCompleted ? '0 0 8px rgba(46, 204, 113, 0.4)' : 'none'
                                        }}></div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', minWidth: '40px', textAlign: 'right', fontWeight: 'bold' }}>
                                        {quest.progress}/{quest.target}
                                    </div>
                                    
                                    {isCompleted && (
                                        <button 
                                            onClick={() => claimQuestReward(quest.id)}
                                            style={{
                                                background: 'var(--primary-color)', color: 'white', border: 'none',
                                                borderRadius: '20px', padding: '6px 14px', fontSize: '12px',
                                                fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                                animation: 'pulse 2s infinite',
                                                boxShadow: '0 4px 10px rgba(212, 175, 55, 0.3)'
                                            }}
                                        >
                                            <Gift size={14} /> {t('quests.claim', 'Al')}
                                        </button>
                                    )}
                                    
                                    {!isCompleted && quest.action && (
                                        <button 
                                            onClick={() => openQuestAction(quest.action)} 
                                            style={{
                                                background: 'rgba(255,255,255,0.15)', color: 'var(--text-color)', border: '1px solid var(--glass-border)',
                                                borderRadius: '20px', padding: '6px 12px', fontSize: '12px',
                                                fontWeight: '600', cursor: 'pointer',
                                                transition: 'var(--transition-smooth)'
                                            }}
                                        >
                                            {t('quests.go', 'Git')}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div style={{ fontSize: '12px', color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                                    <Check size={14} /> {t('quests.claimed', 'Ödül alındı')}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
             <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.6); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
            `}</style>
        </div>
    );
});

export default DailyQuests;
