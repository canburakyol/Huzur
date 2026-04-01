import { memo } from 'react';
import { Users, Lock, CheckCircle, Hash, Copy, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../hooks/useToast';
import { logger } from '../../utils/logger';

const HatimCard = memo(({ hatim, onClick, isMember }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const getProgress = () => {
    if (Number.isFinite(hatim.progressPercent)) return hatim.progressPercent;
    if (!hatim.parts) return 0;

    const total = hatim.totalParts || 30;
    const completed = Object.values(hatim.parts).filter((part) => part.status === 'completed').length;
    return Math.round((completed / total) * 100);
  };

  const progress = getProgress();
  const memberCount = hatim.memberCount || hatim.readers?.length || 1;

  const handleCopyCode = async (event) => {
    event.stopPropagation();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(hatim.joinCode);
        showToast(t('hatim.messages.codeCopied', 'Kod kopyalandi.'), 'success');
        return;
      }
    } catch (error) {
      logger.error('[HatimCard] Failed to copy join code', error);
    }

    showToast(t('hatim.messages.codeCopied', 'Kod kopyalandi.'), 'success');
  };

  return (
    <div className="settings-card clickable reveal-stagger sanctuary-card sanctuary-hatim-card" onClick={onClick}>
      <div className="hatim-head">
        <div className="hatim-title-block">
          <h4 className="hatim-name">{hatim.name}</h4>
          <p className="hatim-description">{hatim.description || t('community.groupHatim')}</p>
        </div>
        <div className="hatim-progress-badge">{progress}%</div>
      </div>

      <div className="hatim-meta-row">
        {hatim.isSeed === true && (
          <div className="hatim-pill featured">
            <Sparkles size={16} />
            {t('community.featuredBadge', 'Huzur onerisi')}
          </div>
        )}
        <div className={`hatim-pill ${isMember ? 'member' : 'locked'}`}>
          {isMember ? <CheckCircle size={16} /> : <Lock size={16} />}
          {isMember ? t('hatim.joined') : t('hatim.locked')}
        </div>
        <div className="hatim-pill count">
          <Users size={16} />
          {memberCount} {t('common.people', 'kisi')}
        </div>
      </div>

      <div className="hatim-progress-wrap">
        <div className="hatim-progress-bar">
          <div className="hatim-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="hatim-progress-labels">
          <span>{progress === 100 ? t('hatim.completed') : t('hatim.reading')}</span>
          {isMember && hatim.joinCode && (
            <button className="hatim-code hatim-code-button" onClick={handleCopyCode}>
              <Hash size={14} /> {hatim.joinCode}
              <Copy size={14} />
            </button>
          )}
        </div>
      </div>

      {!isMember && <div className="hatim-join-hint">{t('hatim.tapToJoin')}</div>}
    </div>
  );
});

HatimCard.displayName = 'HatimCard';

export default HatimCard;
