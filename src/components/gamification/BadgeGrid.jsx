import React from 'react';
import { useTranslation } from 'react-i18next';
import { BADGES } from '../../services/gamificationService';
import { Lock } from 'lucide-react';

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
    <div className="reveal-stagger">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '0 8px' }}>
          <div style={{ width: '4px', height: '16px', background: 'var(--nav-accent)', borderRadius: '2px' }}></div>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900', color: 'var(--nav-text)', textTransform: 'uppercase' }}>
              {t('gamification.badgesTitle', 'Rozetlerim')}
          </h3>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px' 
      }}>
        {Object.values(BADGES).map((badge, index) => {
          const earned = isEarned(badge.id);
          const progress = getProgress(badge);

          return (
            <div 
              key={badge.id} 
              className="settings-card"
              style={{
                flexDirection: 'column',
                padding: '24px 16px',
                textAlign: 'center',
                background: earned ? 'var(--nav-hover)' : 'rgba(255,255,255,0.02)',
                border: earned ? '2px solid var(--nav-accent)' : '1px solid var(--nav-border)',
                opacity: earned ? 1 : 0.6,
                position: 'relative',
                '--delay': `${index * 0.05}s`
              }}
            >
              {!earned && (
                <div style={{ 
                    position: 'absolute', top: '12px', right: '12px', 
                    color: 'var(--nav-text-muted)', opacity: 0.5 
                }}>
                    <Lock size={14} />
                </div>
              )}

              <div style={{ 
                fontSize: '2.5rem', marginBottom: '16px', 
                filter: earned ? 'drop-shadow(0 0 10px rgba(79, 70, 229, 0.4))' : 'grayscale(100%) brightness(0.7)' 
              }}>
                {badge.icon}
              </div>
              
              <div style={{ 
                fontWeight: '900', fontSize: '0.85rem', marginBottom: '6px', 
                color: 'var(--nav-text)', textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                {t(`badges.${badge.id}`, badge.title)}
              </div>
              
              <div style={{ 
                fontSize: '0.75rem', color: 'var(--nav-text-muted)', lineHeight: '1.4',
                fontWeight: '600', marginBottom: earned ? '0' : '16px'
              }}>
                {t(`badge_desc.${badge.id}`, badge.description)}
              </div>

              {!earned && (
                <div style={{ width: '100%', marginTop: 'auto' }}>
                    <div style={{ 
                        display: 'flex', justifyContent: 'space-between', 
                        fontSize: '0.65rem', fontWeight: '900', marginBottom: '6px',
                        color: 'var(--nav-text-muted)'
                    }}>
                        <span>PROGRESS</span>
                        <span>{progress}%</span>
                    </div>
                    <div style={{ width: '100%', background: 'var(--nav-border)', height: '4px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                            width: `${progress}%`, 
                            background: 'var(--nav-accent)', 
                            height: '100%', 
                            borderRadius: '4px',
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}></div>
                    </div>
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
