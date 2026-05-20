import { useCallback, useMemo, useState } from 'react';
import { getWordByWordData, getFreeSurahs, hasWordByWordData } from '../../../../data/wordByWordData';
import { canAccessWordByWord, isPro } from '../../../../services/proService';

interface WordAnalysis {
  arabic: string;
  meaning: string;
  transliteration: string;
  details: string;
  status: string;
}

interface UseWordByWordReturn {
  userIsPro: boolean;
  freeSurahs: number[];
  surahData: Record<string, unknown> | null;
  selectedSurah: number | null;
  expandedAyah: number | null;
  showSurahList: boolean;
  selectedWord: Record<string, unknown> | null;
  wordAnalysis: WordAnalysis | null;
  isAnalyzing: boolean;
  showLimitModal: boolean;
  handleSelectSurah: (surahNumber: number) => void;
  toggleAyah: (ayahNumber: number) => void;
  handleWordClick: (word: Record<string, string>) => void;
  dismissWordModal: () => void;
  dismissLimitModal: () => void;
  openLimitModal: () => void;
  goToSurahList: () => void;
}

const useWordByWord = (initialSurah: number | null = null): UseWordByWordReturn => {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(initialSurah);
  const [expandedAyah, setExpandedAyah] = useState<number | null>(initialSurah ? 1 : null);
  const [showSurahList, setShowSurahList] = useState(!initialSurah);
  const [selectedWord, setSelectedWord] = useState<Record<string, unknown> | null>(null);
  const [wordAnalysis, setWordAnalysis] = useState<WordAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const userIsPro = isPro();
  const freeSurahs = useMemo(() => getFreeSurahs(), []);

  const surahData = useMemo(() => {
    if (!selectedSurah) return null;
    return getWordByWordData(selectedSurah);
  }, [selectedSurah]);

  const handleSelectSurah = useCallback((surahNumber: number) => {
    if (!canAccessWordByWord(surahNumber) && !hasWordByWordData(surahNumber)) {
      return;
    }
    setSelectedSurah(surahNumber);
    setExpandedAyah(1);
    setShowSurahList(false);
  }, []);

  const toggleAyah = useCallback((ayahNumber: number) => {
    setExpandedAyah((prev) => (prev === ayahNumber ? null : ayahNumber));
  }, []);

  const handleWordClick = useCallback((word: Record<string, string>) => {
    setSelectedWord(word);
    setWordAnalysis(null);
    setIsAnalyzing(true);

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
