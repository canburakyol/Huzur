import { useGamification } from '../../../hooks/useGamification';
import { Check, Gift, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { navigateFromAction } from '../../../utils/actionNavigation';
import './DailyQuests.css';

const DailyQuests = memo(() => {
    const { dailyQuests, claimQuestReward } = useGamification();
    const { t } = useTranslation();

    const openQuestAction = (action) => {
        if (!action) return;
        navigateFromAction(action);
    };

    if (!dailyQuests || !dailyQuests.quests) return null;

    // Tamamlanan ve ödülü alınmamış görev sayısı
    const claimableCount = dailyQuests.quests.filter(q => q.completed && !q.isClaimed).length;

    return (
        <div className="settings-card reveal-stagger bg-white rounded-3xl border-huzur-sage-100 shadow-huzur-soft" style={{
            margin: '0 5px 16px',
            padding: '22px 20px',
            flexDirection: 'column',
            alignItems: 'stretch'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'rgba(141, 170, 157, 0.12)',
                        color: 'var(--accent-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <RefreshCw size={16} />
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        {t('quests.dailyTitle', 'Günün Görevleri')}
                    </span>
                    {claimableCount > 0 && (
                        <span className="badge-pulse" style={{ 
                            background: 'var(--error-color)', color: 'var(--on-primary)', fontSize: '0.65rem',
                            padding: '2px 8px', borderRadius: '10px', fontWeight: '950', marginLeft: '6px'
                        }}>{claimableCount}</span>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="reveal-stagger">
                {dailyQuests.quests.map((quest, index) => {
                    const isCompleted = quest.completed;
                    const isClaimed = quest.isClaimed;
                    const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

                    return (
                        <div key={quest.id} className="reveal-stagger" style={{
                            background: isClaimed ? 'rgba(255, 255, 255, 0.02)' : 'rgba(141, 170, 157, 0.05)',
                            borderRadius: '16px',
                            padding: '16px',
                            border: isClaimed ? '1px dashed var(--glass-border)' : '1px solid var(--glass-border)',
                            position: 'relative',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: isClaimed ? 0.6 : 1,
                            '--delay': `${index * 0.05}s`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
                                <div style={{ 
                                    fontSize: '0.95rem', 
                                    fontWeight: '800', 
                                    color: 'var(--text-primary)',
                                    fontFamily: 'var(--font-main)',
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
                                    color: isClaimed ? 'var(--text-muted)' : 'var(--text-secondary)',
                                    fontFamily: 'var(--font-main)',
                                    background: isClaimed ? 'transparent' : 'rgba(141, 170, 157, 0.1)',
                                    padding: '4px 8px',
                                    borderRadius: '8px'
                                }}>
                                    {isClaimed ? <Check size={16} /> : `+${quest.xp} XP`}
                                </div>
                            </div>

                            {!isClaimed ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ flex: 1, height: '8px', background: 'rgba(141, 170, 157, 0.12)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            width: `${progressPercent}%`, 
                                            background: isCompleted 
                                                ? 'linear-gradient(90deg, var(--accent-gold), var(--primary))'
                                                : 'linear-gradient(90deg, var(--accent-gold-light), var(--accent-gold))',
                                            transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            boxShadow: isCompleted ? '0 0 10px rgba(141, 170, 157, 0.3)' : 'none',
                                            borderRadius: '10px'
                                        }}></div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', minWidth: '45px', textAlign: 'right', fontWeight: '900' }}>
                                        {quest.progress}/{quest.target}
                                    </div>
                                    
                                    {isCompleted ? (
                                        <button 
                                            onClick={() => claimQuestReward(quest.id)}
                                            className="velocity-target-btn pulse hover-lift"
                                            style={{
                                                padding: '8px 16px', fontSize: '0.75rem', height: 'auto',
                                                borderRadius: '12px', border: 'none', fontWeight: '700',
                                                background: 'var(--accent-gold-shimmer)', color: 'var(--on-primary)',
                                                boxShadow: '0 4px 12px rgba(224, 169, 150, 0.2)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Gift size={14} /> {t('quests.claim', 'Al')}
                                        </button>
                                    ) : (
                                        quest.action && (
                                            <button 
                                                onClick={() => openQuestAction(quest.action)} 
                                                className="hover-lift"
                                                style={{
                                                    padding: '8px 16px', fontSize: '0.75rem', fontWeight: '700',
                                                    borderRadius: '12px', border: '1px solid rgba(141, 170, 157, 0.2)',
                                                    color: 'var(--primary)', background: 'rgba(141, 170, 157, 0.12)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {t('quests.go', 'Git')}
                                            </button>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '900' }}>
                                    <Check size={14} /> {t('quests.claimed', 'Ödül alındı')}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default DailyQuests;
