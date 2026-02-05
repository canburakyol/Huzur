import { useGamification } from '../context/GamificationContext';
import { Check, Gift, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const DailyQuests = () => {
    const { dailyQuests, claimQuestReward } = useGamification();
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (!dailyQuests || !dailyQuests.quests) return null;

    // Tamamlanan ve ödülü alınmamış görev sayısı
    const claimableCount = dailyQuests.quests.filter(q => q.completed && !q.isClaimed).length;

    return (
        <div className="glass-card" style={{
            margin: '15px 20px',
            padding: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937', display: 'flex', items: 'center', gap: '8px' }}>
                    📅 {t('quests.dailyTitle', 'Günün Görevleri')}
                    {claimableCount > 0 && (
                        <span style={{ 
                            background: '#ef4444', color: 'white', fontSize: '10px', 
                            padding: '2px 8px', borderRadius: '10px', animation: 'bounce 1s infinite' 
                        }}>{claimableCount}</span>
                    )}
                </h3>
                {/* Debug için yenileme butonu - Production'da kaldırılabilir */}
                {/* <button onClick={refreshQuests} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><RefreshCw size={14} /></button> */}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dailyQuests.quests.map(quest => {
                    const isCompleted = quest.completed;
                    const isClaimed = quest.isClaimed;
                    const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

                    return (
                        <div key={quest.id} style={{
                            background: isClaimed ? 'rgba(16, 185, 129, 0.1)' : 'white',
                            borderRadius: '12px',
                            padding: '10px',
                            border: isClaimed ? '1px solid #10b981' : '1px solid #f3f4f6',
                            position: 'relative',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', textDecoration: isClaimed ? 'line-through' : 'none' }}>
                                    {quest.text}
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#d97706' }}>
                                    {isClaimed ? <Check size={16} color="#10b981" /> : `+${quest.xp} XP`}
                                </div>
                            </div>

                            {!isClaimed ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ flex: 1, height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            width: `${progressPercent}%`, 
                                            background: isCompleted ? '#10b981' : '#3b82f6',
                                            transition: 'width 0.5s ease'
                                        }}></div>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6b7280', minWidth: '40px', textAlign: 'right' }}>
                                        {quest.progress}/{quest.target}
                                    </div>
                                    
                                    {isCompleted && (
                                        <button 
                                            onClick={() => claimQuestReward(quest.id)}
                                            style={{
                                                background: '#10b981', color: 'white', border: 'none',
                                                borderRadius: '20px', padding: '4px 12px', fontSize: '11px',
                                                fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                                animation: 'pulse 2s infinite'
                                            }}
                                        >
                                            <Gift size={12} /> {t('quests.claim', 'Al')}
                                        </button>
                                    )}
                                    
                                    {!isCompleted && quest.action && (
                                        <button 
                                            onClick={() => navigate(quest.action)} 
                                            style={{
                                                background: '#f3f4f6', color: '#4b5563', border: 'none',
                                                borderRadius: '20px', padding: '4px 10px', fontSize: '11px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t('quests.go', 'Git')}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Check size={12} /> Ödül alındı
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
             <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
            `}</style>
        </div>
    );
};

export default DailyQuests;
