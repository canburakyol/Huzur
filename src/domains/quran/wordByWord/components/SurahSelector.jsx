import { Lock, Crown } from 'lucide-react';
import { hasWordByWordData } from '../../../../data/wordByWordData';
import { surahList } from '../../../../data/surahList';

/**
 * Surah grid selector — allows the user to pick a surah
 * for word-by-word study.
 */
const SurahSelector = ({ t, userIsPro, freeSurahs, onSelectSurah, onUpgrade }) => (
  <div style={{ padding: '0 20px 40px 20px' }} className="reveal-stagger">
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--nav-text)', fontWeight: '900' }}>
        {t('wordByWord.chooseSurah')}
      </h3>
      {!userIsPro && (
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
          {t('wordByWord.freeSurahsInfo')}
        </p>
      )}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
      {surahList.map((surah, index) => {
        const isFree = freeSurahs.includes(surah.number);
        const hasData = hasWordByWordData(surah.number);
        const isLocked = !userIsPro && !isFree;
        const isAvailable = hasData || userIsPro;

        return (
          <div
            key={surah.number}
            className={`settings-card reveal-stagger ${isLocked ? 'locked' : ''} ${!isAvailable ? 'unavailable' : ''}`}
            style={{
              '--delay': `${index * 0.05}s`,
              padding: '16px',
              gap: '12px',
              opacity: isAvailable ? 1 : 0.4,
              cursor: isAvailable ? 'pointer' : 'default',
              border: isFree && !userIsPro ? '1px solid var(--success-color)' : '1px solid var(--nav-border)',
            }}
            onClick={() => isAvailable && onSelectSurah(surah.number)}
          >
            <div
              className="settings-icon-box"
              style={{
                width: '32px',
                height: '32px',
                background: isFree && !userIsPro ? 'var(--surface-action-soft)' : 'var(--nav-hover)',
                color: isFree && !userIsPro ? 'var(--success-color)' : 'var(--nav-accent)',
                fontSize: '0.8rem',
                borderRadius: '10px',
              }}
            >
              {surah.number}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  color: 'var(--nav-text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {surah.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--nav-text-muted)', fontFamily: 'var(--arabic-font-family)' }}>
                {surah.arabicName}
              </div>
            </div>
            {isLocked && <Lock size={14} color="var(--nav-text-muted)" />}
            {isFree && !userIsPro && (
              <div style={{ color: 'var(--success-color)', fontWeight: '900', fontSize: '0.7rem' }}>FREE</div>
            )}
          </div>
        );
      })}
    </div>

    {!userIsPro && (
      <div
        className="settings-card reveal-stagger"
        style={{
          marginTop: '32px',
          padding: '24px',
          background: 'var(--primary)',
          border: 'none',
          cursor: 'pointer',
          '--delay': '0.5s',
        }}
        onClick={onUpgrade}
      >
        <div className="settings-icon-box" style={{ background: 'rgba(255,255,255,0.2)', color: 'var(--on-primary)' }}>
          <Crown size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, color: 'var(--on-primary)', fontWeight: '900', fontSize: '1.1rem' }}>
            {t('wordByWord.unlockAll')}
          </h4>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: '600' }}>
            {t('wordByWord.unlockAllDesc')}
          </p>
        </div>
      </div>
    )}
  </div>
);

export default SurahSelector;
