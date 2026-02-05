import React from 'react';
import { useTranslation } from 'react-i18next';

const MemberCard = ({ member, isChild = false, onClick }) => {
  const { t } = useTranslation();

  // Streak verileri (varsayılan 0)
  const fajrStreak = member.streaks?.fajr_count || 0;
  const quranStreak = member.streaks?.quran_count || 0;
  
  // Rozet sayısı
  const badgeCount = member.earnedBadges?.length || 0;

  return (
    <div 
      className="glass-card" 
      onClick={onClick}
      style={{ 
        marginBottom: '10px', 
        padding: '15px',
        display: 'flex',
        alignItems: 'center',
        borderLeft: `4px solid ${isChild ? 'var(--success-color)' : 'var(--primary-color)'}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if(onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if(onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ marginRight: '15px', fontSize: '24px' }}>
        {isChild ? '🧒' : '👤'}
      </div>
      
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-color)' }}>
          {member.displayName || t('common.user')}
          {isChild && <span style={{ fontSize: '12px', color: 'var(--text-color-muted)', marginLeft: '8px' }}>({t('family.child')})</span>}
        </h4>
        
        <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: 'var(--text-color-light)' }}>
          <span>🔥 {fajrStreak} {t('streak.fajr')}</span>
          <span>📖 {quranStreak} {t('streak.quran')}</span>
          <span>🏆 {badgeCount}</span>
        </div>
      </div>

      {onClick && <div style={{ color: 'var(--text-color-muted)' }}>👉</div>}
    </div>
  );
};

export default MemberCard;
