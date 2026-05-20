import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Flame, BookOpen, Trophy } from 'lucide-react';

const MemberCard = ({ member, isChild = false, onClick, style }) => {
  const { t } = useTranslation();

  // Streak verileri (varsayılan 0)
  const fajrStreak = member.streaks?.fajr_count || 0;
  const quranStreak = member.streaks?.quran_count || 0;
  
  // Rozet sayısı
  const badgeCount = member.earnedBadges?.length || 0;

  return (
    <div 
      className="settings-card reveal-stagger" 
      onClick={onClick}
      style={{ 
        marginBottom: '12px', 
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderLeft: `4px solid ${isChild ? '#10b981' : 'var(--nav-accent)'}`,
        ...style
      }}
    >
      <div className="settings-icon-box" style={{ 
        marginRight: '16px', 
        width: '56px', 
        height: '56px', 
        fontSize: '1.75rem',
        background: 'var(--nav-hover)',
        borderRadius: '16px'
      }}>
        {isChild ? '🧒' : '👤'}
      </div>
      
      <div style={{ flex: 1 }}>
        <h4 style={{ 
            margin: '0 0 6px 0', 
            color: 'var(--nav-text)', 
            fontWeight: '900',
            fontSize: '1.05rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }}>
          {member.displayName || t('common.user')}
          {isChild && (
            <span style={{ 
                fontSize: '0.7rem', 
                color: '#10b981', 
                background: 'rgba(16, 185, 129, 0.1)', 
                padding: '2px 8px', 
                borderRadius: '6px',
                fontWeight: '800',
                textTransform: 'uppercase'
            }}>
                {t('family.child')}
            </span>
          )}
        </h4>
        
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={14} color="#f59e0b" fill="#f59e0b" />
            <span>{fajrStreak}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={14} color="var(--nav-accent)" />
            <span>{quranStreak}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trophy size={14} color="#f59e0b" />
            <span>{badgeCount}</span>
          </div>
        </div>
      </div>

      {onClick && (
        <div style={{ color: 'var(--nav-accent)', opacity: 0.5 }}>
            <ChevronRight size={20} />
        </div>
      )}
    </div>
  );
};

export default MemberCard;
