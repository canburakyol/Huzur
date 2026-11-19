import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWordByWordData, getFreeSurahs, hasWordByWordData } from '../../../../data/wordByWordData';
import { localizeWordByWord } from '../../../../data/wordByWordTranslations';
import { getWordMorphology, type WordMorphology } from '../../../../data/wordMorphology';
import { canAccessWordByWord, isPro } from '../../../../services/proService';

type WordAnalysis = {
  arabic: string;
  meaning: string;
  transliteration: string;
  morphology: WordMorphology | null;
}

type UseWordByWordReturn = {
  userIsPro: boolean;
  freeSurahs: number[];
  surahData: Record<string, unknown> | null;
  selectedSurah: number | null;
  expandedAyah: number | null;
  showSurahList: boolean;
  selectedWord: Record<string, unknown> | null;
  wordAnalysis: WordAnalysis | null;
  showLimitModal: boolean;
  handleSelectSurah: (surahNumber: number) => void;
  toggleAyah: (ayahNumber: number) => void;
  handleWordClick: (word: Record<string, string>, ayah: number, index: number) => void;
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
  const [showLimitModal, setShowLimitModal] = useState(false);

  const userIsPro = isPro();
  const freeSurahs = useMemo(() => getFreeSurahs(), []);

  const { i18n } = useTranslation();
  const surahData = useMemo(() => {
    if (!selectedSurah) return null;
    return localizeWordByWord(getWordByWordData(selectedSurah), selectedSurah, i18n.language || 'tr');
  }, [selectedSurah, i18n.language]);

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

  // ayah and index (1-based) locate the word in the bundled morphology data
  const handleWordClick = useCallback((word: Record<string, string>, ayah: number, index: number) => {
    setSelectedWord(word);
    setWordAnalysis({
      arabic: word.arabic,
      meaning: word.meaning,
      transliteration: word.transliteration || '-',
      morphology: selectedSurah ? getWordMorphology(selectedSurah, ayah, index) : null,
    });
  }, [selectedSurah]);

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
