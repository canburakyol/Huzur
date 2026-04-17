import { useTranslation } from 'react-i18next';
import { Book } from 'lucide-react';
import IslamicBackButton from '../../../../components/shared/IslamicBackButton';
import useWordByWord from '../hooks/useWordByWord';
import SurahSelector from './SurahSelector';
import AyahList from './AyahList';
import WordDetailPanel from './WordDetailPanel';
import LimitModal from './LimitModal';
import './WordByWord.css';

/**
 * WordByWordShell — the orchestrator component.
 *
 * Original WordByWord.jsx was 934 lines. This shell is ~90 lines.
 * All state/logic lives in useWordByWord hook.
 * All UI panels are dumb presentational components.
 */
const WordByWordShell = ({ onClose, onUpgrade, initialSurah = null }) => {
  const { t } = useTranslation();
  const {
    userIsPro,
    freeSurahs,
    surahData,
    expandedAyah,
    showSurahList,
    selectedWord,
    wordAnalysis,
    isAnalyzing,
    showLimitModal,
    handleSelectSurah,
    toggleAyah,
    handleWordClick,
    dismissWordModal,
    dismissLimitModal,
    goToSurahList,
  } = useWordByWord(initialSurah);

  return (
    <div className="settings-container reveal-stagger" style={{ padding: 0 }}>
      {/* Header */}
      <div
        style={{
          padding: '24px 20px',
          background: 'linear-gradient(135deg, var(--nav-bg), var(--nav-hover))',
          borderBottom: '1px solid var(--nav-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <IslamicBackButton
          onClick={showSurahList ? onClose : goToSurahList}
          size="medium"
        />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--nav-text)', fontWeight: '950' }}>
            📝 {t('wordByWord.title')}
          </h1>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '800' }}>
            {showSurahList ? t('wordByWord.selectSurah') : surahData?.name}
          </p>
        </div>
        {!userIsPro && (
          <div
            className="hamburger-level-badge"
            style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid #22c55e' }}
          >
            {t('wordByWord.freeSurahsBadge', { count: freeSurahs.length })}
          </div>
        )}
      </div>

      {/* Content */}
      {showSurahList ? (
        <SurahSelector
          t={t}
          userIsPro={userIsPro}
          freeSurahs={freeSurahs}
          onSelectSurah={handleSelectSurah}
          onUpgrade={onUpgrade}
        />
      ) : (
        surahData && (
          <>
            <AyahList
              t={t}
              surahData={surahData}
              expandedAyah={expandedAyah}
              onToggleAyah={toggleAyah}
              onWordClick={handleWordClick}
            />
            <div style={{ padding: '0 20px' }}>
              <button
                className="velocity-target-btn"
                style={{
                  marginTop: '32px',
                  width: '100%',
                  justifyContent: 'center',
                  background: 'var(--nav-hover)',
                  color: 'var(--nav-text)',
                  borderColor: 'var(--nav-border)',
                }}
                onClick={goToSurahList}
              >
                <Book size={18} />
                {t('wordByWord.changeSurah')}
              </button>
            </div>
          </>
        )
      )}

      {/* Modals */}
      <WordDetailPanel
        t={t}
        selectedWord={selectedWord}
        wordAnalysis={wordAnalysis}
        isAnalyzing={isAnalyzing}
        onDismiss={dismissWordModal}
      />

      {showLimitModal && (
        <LimitModal t={t} onUpgrade={onUpgrade} onDismiss={dismissLimitModal} />
      )}
    </div>
  );
};

export default WordByWordShell;
