import { useTranslation } from 'react-i18next';
import { Book } from 'lucide-react';
import PageHeader from '../../../../components/shared/PageHeader';
import useWordByWord from '../hooks/useWordByWord';
import SurahSelector from './SurahSelector';
import AyahList from './AyahList';
import WordDetailPanel from './WordDetailPanel';
import LimitModal from './LimitModal';
import '../../../../styles/PracticePages.css';
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
    showLimitModal,
    handleSelectSurah,
    toggleAyah,
    handleWordClick,
    dismissWordModal,
    dismissLimitModal,
    goToSurahList,
  } = useWordByWord(initialSurah);

  return (
    <div className="practice-page">
      <PageHeader
        title={t('wordByWord.title')}
        subtitle={showSurahList ? t('wordByWord.selectSurah') : surahData?.name}
        onBack={showSurahList ? onClose : goToSurahList}
      />

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
            <div className="practice-actions">
              <button type="button" className="practice-secondary-button practice-wide" onClick={goToSurahList}>
                <Book size={18} aria-hidden="true" />
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
        onDismiss={dismissWordModal}
      />

      {showLimitModal && (
        <LimitModal t={t} onUpgrade={onUpgrade} onDismiss={dismissLimitModal} />
      )}
    </div>
  );
};

export default WordByWordShell;
