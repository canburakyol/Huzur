import { memo } from 'react';
import { Users, Lock, CheckCircle, Hash } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Memoized Hatim Card Component
 * Prevents unnecessary re-renders when parent list updates
 */
const HatimCard = memo(({ hatim, onClick, isMember }) => {
  const { t } = useTranslation();

  // Calculate progress
  const getProgress = () => {
    if (!hatim.parts) return 0;
    const total = hatim.totalParts || 30;
    const completed = Object.values(hatim.parts).filter(p => p.status === 'completed').length;
    return Math.round((completed / total) * 100);
  };

  const progress = getProgress();

  return (
    <div
      className="settings-card clickable reveal-stagger sanctuary-card sanctuary-hatim-card"
      onClick={onClick}
    >
      <div className="hatim-head">
        <div className="hatim-title-block">
          <h4 className="hatim-name">
            {hatim.name}
          </h4>
          <p className="hatim-description">
            {hatim.description || t('community.groupHatim')}
          </p>
        </div>
        <div className="hatim-progress-badge">
          {progress}%
        </div>
      </div>

      <div className="hatim-meta-row">
        <div className={`hatim-pill ${isMember ? 'member' : 'locked'}`}>
          {isMember ? <CheckCircle size={16} /> : <Lock size={16} />}
          {isMember ? t('hatim.joined') : t('hatim.locked')}
        </div>
        <div className="hatim-pill count">
          <Users size={16} />
          {hatim.readers?.length || 1} {t('common.people', 'kişi')}
        </div>
      </div>

      <div className="hatim-progress-wrap">
        <div className="hatim-progress-bar">
          <div
            className="hatim-progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="hatim-progress-labels">
          <span>{progress === 100 ? t('hatim.completed') : t('hatim.reading')}</span>
          {isMember && (
            <span className="hatim-code">
              <Hash size={14} /> {hatim.joinCode}
            </span>
          )}
        </div>
      </div>

      {!isMember && (
        <div className="hatim-join-hint">
          {t('hatim.tapToJoin')}
        </div>
      )}
    </div>
  );
});

HatimCard.displayName = 'HatimCard';

export default HatimCard;
