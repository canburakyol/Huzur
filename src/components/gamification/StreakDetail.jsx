import React from 'react';
import { useTranslation } from 'react-i18next';

const StreakDetail = ({ streaks = {} }) => {
  const { t } = useTranslation();

  const streakItems = [
    { key: 'fajr', icon: '🌅', label: t('streak.fajr') || 'Sabah Namazı', color: '#FF9800' },
    { key: 'quran', icon: '📖', label: t('streak.quran') || 'Kuran Okuma', color: '#4CAF50' },
    { key: 'dhikr', icon: '📿', label: t('streak.dhikr') || 'Zikir', color: '#2196F3' }
  ];

  return (
    <div className="streak-detail-container" style={{ marginTop: '20px' }}>
      <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>{t('gamification.streakTitle') || 'Zincir Durumu'}</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {streakItems.map(item => {
          const count = streaks[`${item.key}_count`] || 0;
          // Calculate a "level" or visual progress just for fun, capped at 40
          const progress = Math.min(100, (count / 40) * 100); 

          return (
            <div key={item.key} className="glass-card" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '15px',
              borderLeft: `4px solid ${item.color}`
            }}>
              <div style={{ fontSize: '24px', marginRight: '15px' }}>{item.icon}</div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-color)' }}>{item.label}</span>
                  <span style={{ fontWeight: 'bold', color: item.color, fontSize: '16px' }}>{count} Gün</span>
                </div>
                
                <div style={{ width: '100%', background: 'rgba(0,0,0,0.05)', height: '6px', borderRadius: '3px' }}>
                   <div style={{ 
                      width: `${progress}%`, 
                      background: item.color, 
                      height: '100%', 
                      borderRadius: '3px',
                      transition: 'width 0.5s ease'
                   }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,193,7,0.1)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-color-muted)', textAlign: 'center' }}>
        ℹ️ {t('gamification.streakTip') || 'Zincirini korumak için her gün ibadetlerini aksatma!'}
      </div>
    </div>
  );
};

export default StreakDetail;
