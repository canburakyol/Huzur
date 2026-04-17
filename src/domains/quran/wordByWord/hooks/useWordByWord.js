import { useCallback, useMemo, useState } from 'react';
import { getWordByWordData, getFreeSurahs, hasWordByWordData } from '../../../../data/wordByWordData';
import { canAccessWordByWord, isPro } from '../../../../services/proService';

/**
 * Core state + logic hook for the Word-by-Word feature.
 * Extracted from the monolithic WordByWord.jsx (852 lines).
 *
 * Responsibilities:
 *  - surah selection, data derivation
 *  - ayah expansion
 *  - word analysis (offline, no network)
 *  - limit/paywall modal state
 */
const useWordByWord = (initialSurah = null) => {
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const [expandedAyah, setExpandedAyah] = useState(initialSurah ? 1 : null);
  const [showSurahList, setShowSurahList] = useState(!initialSurah);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordAnalysis, setWordAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const userIsPro = isPro();
  const freeSurahs = useMemo(() => getFreeSurahs(), []);

  const surahData = useMemo(() => {
    if (!selectedSurah) return null;
    return getWordByWordData(selectedSurah);
  }, [selectedSurah]);

  const handleSelectSurah = useCallback((surahNumber) => {
    if (!canAccessWordByWord(surahNumber) && !hasWordByWordData(surahNumber)) {
      return;
    }
    setSelectedSurah(surahNumber);
    setExpandedAyah(1);
    setShowSurahList(false);
  }, []);

  const toggleAyah = useCallback((ayahNumber) => {
    setExpandedAyah((prev) => (prev === ayahNumber ? null : ayahNumber));
  }, []);

  const handleWordClick = useCallback((word) => {
    setSelectedWord(word);
    setWordAnalysis(null);
    setIsAnalyzing(true);

    // Offline structured "analysis" — no network
    setTimeout(() => {
      setWordAnalysis({
        arabic: word.arabic,
        meaning: word.meaning,
        transliteration: word.transliteration || '-',
        details:
          'Bu kelimenin kök analizi ve morfolojik yapısı yakında eklenecek olan çevrimdışı veritabanımızda yer alacaktır.',
        status: 'İşlem Tamamlandı',
      });
      setIsAnalyzing(false);
    }, 800);
  }, []);

  const dismissWordModal = useCallback(() => setSelectedWord(null), []);
  const dismissLimitModal = useCallback(() => setShowLimitModal(false), []);
  const openLimitModal = useCallback(() => setShowLimitModal(true), []);
  const goToSurahList = useCallback(() => setShowSurahList(true), []);

  return {
    // State
    userIsPro,
    freeSurahs,
    surahData,
    selectedSurah,
    expandedAyah,
    showSurahList,
    selectedWord,
    wordAnalysis,
    isAnalyzing,
    showLimitModal,

    // Actions
    handleSelectSurah,
    toggleAyah,
    handleWordClick,
    dismissWordModal,
    dismissLimitModal,
    openLimitModal,
    goToSurahList,
  };
};

export default useWordByWord;
