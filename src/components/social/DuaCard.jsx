import { memo } from 'react';
import { Heart, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Memoized Dua Card Component
 * Prevents unnecessary re-renders when parent list updates
 */
const DuaCard = memo(({ dua, isPrayed, onPray }) => {
  const { t } = useTranslation();

  return (
    <div className="settings-card reveal-stagger sanctuary-card dua-card">
      <div className="dua-left-border"></div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p className="dua-text">
            "{dua.text}"
          </p>
          
          <div className="dua-footer">
            <div className="dua-author-pill">
              <Users size={14} />
              {dua.isAnonymous ? t('community.anonymous') : dua.authorName}
            </div>
            
            <button 
              onClick={() => onPray(dua.id)}
              disabled={isPrayed}
              className={`dua-pray-btn ${isPrayed ? 'is-prayed' : ''}`}
            >
              <Heart size={16} fill={isPrayed ? 'currentColor' : 'none'} />
              {isPrayed ? t('community.buttons.aminDone', 'Amin denildi') : t('community.buttons.amin', 'Amin')} 
              <span className="dua-count">
                {dua.aminCount || 0}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

DuaCard.displayName = 'DuaCard';

export default DuaCard;
