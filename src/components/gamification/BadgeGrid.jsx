import React from 'react';
import { useTranslation } from 'react-i18next';
import { BADGES } from '../../services/gamificationService';

const BadgeGrid = ({ earnedBadges = [], userStats = {} }) => {
  const { t } = useTranslation();

  // Helper to check if badge is earned
  const isEarned = (badgeId) => {
    return earnedBadges.some(b => b.badgeId === badgeId);
  };

  // Helper to calculate progress for locked badges
  const getProgress = (badge) => {
    if (isEarned(badge.id)) return 100;

    let current = 0;
    if (badge.type.startsWith('streak_')) {
      const type = badge.type.split('_')[1]; // fajr, quran
      current = userStats.streaks?.[`${type}_count`] || 0;
    } else if (badge.type === 'total_dhikr') {
      current = userStats.stats?.totalDhikr || 0;
    } else if (badge.type === 'family_joined') {
      current = userStats.familyId ? 1 : 0;
    }

    return Math.min(100, Math.round((current / badge.target) * 100));
  };

  return (
    <div className="badge-grid-container">
      <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>{t('gamification.badgesTitle') || 'Rozetlerim'}</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
        gap: '15px' 
      }}>
        {Object.values(BADGES).map(badge => {
          const earned = isEarned(badge.id);
          const progress = getProgress(badge);

          return (
            <div 
              key={badge.id} 
              className={`glass-card badge-card ${earned ? 'earned' : 'locked'}`}
              style={{
                padding: '15px',
                textAlign: 'center',
                opacity: earned ? 1 : 0.7,
                border: earned ? '1.5px solid var(--primary-color)' : '1px solid var(--glass-border)',
                background: earned ? 'var(--glass-bg)' : 'rgba(200, 200, 200, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '10px', filter: earned ? 'none' : 'grayscale(100%)' }}>
                {badge.icon}
              </div>
              
              <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: 'var(--text-color)' }}>
                {t(`badges.${badge.id}`) || badge.title}
              </div>
              
              <div style={{ fontSize: '11px', color: 'var(--text-color-muted)', lineHeight: '1.3' }}>
                {badge.description}
              </div>

              {!earned && (
                <div style={{ marginTop: '10px', width: '100%', background: 'rgba(0,0,0,0.1)', height: '4px', borderRadius: '2px' }}>
                  <div style={{ 
                    width: `${progress}%`, 
                    background: 'var(--primary-color)', 
                    height: '100%', 
                    borderRadius: '2px',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeGrid;
