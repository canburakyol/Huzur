import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Crown } from 'lucide-react';
import { hasWordByWordData } from '../../../../data/wordByWordData';
import { getLocalizedSurahList } from '../../../../data/surahList';

/**
 * Surah list — allows the user to pick a surah for word-by-word study.
 */
const SurahSelector = ({ t, userIsPro, freeSurahs, onSelectSurah, onUpgrade }) => {
  const { i18n } = useTranslation();
  const surahList = useMemo(() => getLocalizedSurahList(i18n.language), [i18n.language]);

  return (
  <>
    {!userIsPro && (
      <p className="practice-lead">{t('wordByWord.freeSurahsInfo')}</p>
    )}

    <div className="wbw-surah-grid">
      {surahList.map((surah) => {
        const isFree = freeSurahs.includes(surah.number);
        const isLocked = !userIsPro && !isFree;
        const isAvailable = hasWordByWordData(surah.number) || userIsPro;

        return (
          <button
            key={surah.number}
            type="button"
            className={`practice-row wbw-surah ${isFree && !userIsPro ? 'wbw-surah--free' : ''}`}
            disabled={!isAvailable}
            onClick={() => onSelectSurah(surah.number)}
          >
            <span className="practice-row__icon wbw-surah__number">{surah.number}</span>
            <span className="practice-row__body">
              <span className="practice-row__title wbw-ellipsis">{surah.nameTranslation}</span>
              <span className="practice-row__text wbw-surah__arabic" lang="ar">{surah.name}</span>
            </span>
            {isLocked && <Lock size={14} aria-label={t('common.locked', 'Kilitli')} />}
          </button>
        );
      })}
    </div>

    {!userIsPro && (
      <div className="practice-panel wbw-upgrade">
        <strong>{t('wordByWord.unlockAll')}</strong>
        <p>{t('wordByWord.unlockAllDesc')}</p>
        <button type="button" className="practice-primary-button practice-wide" onClick={onUpgrade}>
          <Crown size={18} aria-hidden="true" />
          {t('wordByWord.unlockAll')}
        </button>
      </div>
    )}
  </>
  );
};

export default SurahSelector;
