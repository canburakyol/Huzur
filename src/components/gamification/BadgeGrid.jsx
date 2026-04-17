import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BADGES, BADGE_CATEGORIES } from '../../data/gamificationData';
import { Lock, ChevronDown, ChevronUp, Trophy } from 'lucide-react';

const BadgeGrid = ({ earnedBadges = [] }) => {
  const { t } = useTranslation();
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Helper to check if badge is earned
  const isEarned = (badgeId) => {
    return earnedBadges.some(b => b.badgeId === badgeId || b === badgeId);
  };

  // Group badges by category
  const groupedBadges = Object.values(BADGES).reduce((acc, badge) => {
    const cat = badge.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(badge);
    return acc;
  }, {});

  // Count earned badges
  const totalBadges = Object.values(BADGES).length;
  const earnedCount = Object.values(BADGES).filter(b => isEarned(b.id)).length;

  const toggleCategory = (cat) => {
    setExpandedCategory(prev => prev === cat ? null : cat);
  };

  return (
    <div className="reveal-stagger">
      {/* Header with total progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '4px', height: '16px', background: 'var(--nav-accent)', borderRadius: '2px' }}></div>
          <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '900', color: 'var(--nav-text)', textTransform: 'uppercase' }}>
            {t('gamification.badgesTitle', 'Rozetlerim')}
          </h3>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--nav-hover)', padding: '4px 10px',
          borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900',
          color: 'var(--nav-accent)'
        }}>
          <Trophy size={12} />
          {earnedCount}/{totalBadges}
        </div>
      </div>

      {/* Category sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Object.entries(BADGE_CATEGORIES).map(([catKey, catInfo]) => {
          const badges = groupedBadges[catKey] || [];
          if (badges.length === 0) return null;
          
          const catEarnedCount = badges.filter(b => isEarned(b.id)).length;
          const isExpanded = expandedCategory === catKey;

          return (
            <div key={catKey} className="reveal-stagger" style={{
              background: 'var(--nav-bg)',
              border: '1px solid var(--nav-border)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              {/* Category header — always visible */}
              <button
                onClick={() => toggleCategory(catKey)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '14px 16px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--nav-text)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{catInfo.icon}</span>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {catInfo.label}
                  </span>
                  <span style={{
                    background: catEarnedCount === badges.length ? catInfo.color : 'var(--nav-hover)',
                    color: catEarnedCount === badges.length ? '#fff' : 'var(--nav-text-muted)',
                    padding: '2px 8px', borderRadius: '8px',
                    fontSize: '0.7rem', fontWeight: '900'
                  }}>
                    {catEarnedCount}/{badges.length}
                  </span>
                </div>
                {isExpanded ? <ChevronUp size={16} color="var(--nav-text-muted)" /> : <ChevronDown size={16} color="var(--nav-text-muted)" />}
              </button>

              {/* Expanded badges grid */}
              {isExpanded && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px', padding: '0 12px 12px'
                }}>
                  {badges.map((badge) => {
                    const earned = isEarned(badge.id);

                    return (
                      <div
                        key={badge.id}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          padding: '12px 6px', textAlign: 'center',
                          background: earned ? 'var(--nav-hover)' : 'rgba(255,255,255,0.02)',
                          border: earned ? `1.5px solid ${catInfo.color}` : '1px solid var(--nav-border)',
                          borderRadius: '12px',
                          opacity: earned ? 1 : 0.5,
                          position: 'relative',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {!earned && (
                          <div style={{ position: 'absolute', top: '6px', right: '6px', color: 'var(--nav-text-muted)', opacity: 0.4 }}>
                            <Lock size={10} />
                          </div>
                        )}

                        <div style={{
                          fontSize: '1.8rem', marginBottom: '6px',
                          filter: earned ? `drop-shadow(0 0 8px ${catInfo.color}40)` : 'grayscale(100%) brightness(0.6)'
                        }}>
                          {badge.icon}
                        </div>

                        <div style={{
                          fontWeight: '800', fontSize: '0.65rem',
                          color: 'var(--nav-text)', lineHeight: '1.3',
                          textTransform: 'uppercase', letterSpacing: '0.3px'
                        }}>
                          {t(`badges.${badge.id}`, badge.name)}
                        </div>

                        <div style={{
                          fontSize: '0.6rem', color: 'var(--nav-text-muted)',
                          lineHeight: '1.3', marginTop: '4px', fontWeight: '600'
                        }}>
                          {t(`badge_desc.${badge.id}`, badge.description)}
                        </div>
                      </div>
                    );
                  })}
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
