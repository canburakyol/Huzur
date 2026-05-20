import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, BookOpen, Heart, Info } from 'lucide-react';

const StreakDetail = ({ streaks = {} }) => {
  const { t } = useTranslation();

  const streakItems = [
    { key: 'fajr', icon: <Flame size={20} />, label: t('streak.fajr', 'Sabah Namazı'), color: '#f59e0b' },
    { key: 'quran', icon: <BookOpen size={20} />, label: t('streak.quran', 'Kuran Okuma'), color: '#10b981' },
    { key: 'dhikr', icon: <Heart size={20} />, label: t('streak.dhikr', 'Zikir'), color: '#3b82f6' }
  ];

  return (
    <div className="reveal-stagger" style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '0 8px' }}>
          <div style={{ width: '4px', height: '16px', background: 'var(--nav-accent)', borderRadius: '2px' }}></div>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900', color: 'var(--nav-text)', textTransform: 'uppercase' }}>
              {t('gamification.streakTitle', 'Zincir Durumu')}
          </h3>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {streakItems.map((item, index) => {
          const count = streaks[`${item.key}_count`] || 0;
          const progress = Math.min(100, (count / 40) * 100); 

          return (
            <div key={item.key} className="settings-card" style={{ 
               padding: '20px',
               '--delay': `${index * 0.1}s`
            }}>
              <div className="settings-icon-box" style={{ 
                  background: `${item.color}15`, 
                  color: item.color,
                  marginRight: '16px'
              }}>
                  {item.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--nav-text)' }}>{item.label}</span>
                  <span style={{ fontWeight: '950', color: item.color, fontSize: '1.1rem' }}>
                    {count} <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{t('common.days', 'Gün')}</span>
                  </span>
                </div>
                
                <div style={{ width: '100%', background: 'var(--nav-hover)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                   <div style={{ 
                      width: `${progress}%`, 
                      background: item.color, 
                      height: '100%', 
                      borderRadius: '3px',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: `0 0 10px ${item.color}40`
                   }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="settings-card" style={{ 
          marginTop: '20px', padding: '16px', 
          background: 'rgba(245, 158, 11, 0.05)', 
          border: '1px dashed rgba(245, 158, 11, 0.3)',
          gap: '12px'
      }}>
        <div className="settings-icon-box" style={{ width: '32px', height: '32px', background: 'transparent', color: '#f59e0b' }}>
            <Info size={16} />
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600', lineHeight: '1.4' }}>
            {t('gamification.streakTip', 'Zincirini korumak için her gün ibadetlerini aksatma!')}
        </div>
      </div>
    </div>
  );
};

export default StreakDetail;
