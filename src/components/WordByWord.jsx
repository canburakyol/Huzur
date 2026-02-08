import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Lock, Crown, Book, Loader, Sparkles } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { getWordByWordData, getFreeSurahs, hasWordByWordData } from '../data/wordByWordData';
import { canAccessWordByWord, isPro, FREE_WORD_BY_WORD_SURAHS, checkLimit, useLimit as consumeLimit } from '../services/proService';
import { surahList } from '../data/surahList';
import { analyzeWordRoot } from '../services/geminiService';

const WordByWord = ({ onClose, onUpgrade, initialSurah = null }) => {
  const { t } = useTranslation();
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const [surahData, setSurahData] = useState(null);
  const [expandedAyah, setExpandedAyah] = useState(null);
  const [showSurahList, setShowSurahList] = useState(!initialSurah);
  const userIsPro = isPro();

  // Word Analysis States
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordAnalysis, setWordAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Ücretsiz sureler
  const freeSurahs = getFreeSurahs();

  useEffect(() => {
    if (selectedSurah) {
      const data = getWordByWordData(selectedSurah);
      setSurahData(data);
      setExpandedAyah(1); // İlk ayeti aç
    }
  }, [selectedSurah]);

  const handleSelectSurah = (surahNumber) => {
    if (!canAccessWordByWord(surahNumber) && !hasWordByWordData(surahNumber)) {
      // Pro gerekli
      return;
    }
    setSelectedSurah(surahNumber);
    setShowSurahList(false);
  };

  const toggleAyah = (ayahNumber) => {
    setExpandedAyah(expandedAyah === ayahNumber ? null : ayahNumber);
  };

  // Handle Word Click for Analysis
  const handleWordClick = async (word, ayahArabic) => {
    // Check limit for non-Pro users
    const limitCheck = checkLimit('word_analysis');
    if (!limitCheck.allowed && !userIsPro) {
      setShowLimitModal(true);
      return;
    }

    setSelectedWord(word);
    setWordAnalysis(null);
    setIsAnalyzing(true);

    try {
      consumeLimit('word_analysis');
      const result = await analyzeWordRoot(word.arabic, ayahArabic);
      if (result.success) {
        setWordAnalysis(result.content);
      } else {
        setWordAnalysis(t('wordByWord.analysisError') + ': ' + (result.error || t('wordByWord.unknownError')));
      }
    } catch {
      setWordAnalysis(t('wordByWord.analysisErrorGeneric'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="wbw-container">
      {/* Header */}
      <div className="wbw-header">
        <IslamicBackButton onClick={showSurahList ? onClose : () => setShowSurahList(true)} size="medium" />
        <div className="header-content">
          <h1>📝 {t('wordByWord.title')}</h1>
          <p className="subtitle">
            {showSurahList ? t('wordByWord.selectSurah') : surahData?.name}
          </p>
        </div>
        {!userIsPro && (
          <div className="free-badge">
            {t('wordByWord.freeSurahsBadge', { count: freeSurahs.length })}
          </div>
        )}
      </div>

      {showSurahList ? (
        /* Sure Listesi */
        <div className="wbw-surah-list">
          <div className="list-header">
            <h3>{t('wordByWord.chooseSurah')}</h3>
            {!userIsPro && (
              <p className="list-info">
                {t('wordByWord.freeSurahsInfo')}
              </p>
            )}
          </div>

          <div className="surah-grid">
            {surahList.map(surah => {
              const isFree = freeSurahs.includes(surah.number);
              const hasData = hasWordByWordData(surah.number);
              const isLocked = !userIsPro && !isFree;
              const isAvailable = hasData || userIsPro;

              return (
                <div 
                  key={surah.number}
                  className={`surah-card ${isLocked ? 'locked' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                  onClick={() => isAvailable && handleSelectSurah(surah.number)}
                >
                  <div className="surah-number">{surah.number}</div>
                  <div className="surah-info">
                    <span className="surah-name">{surah.name}</span>
                    <span className="surah-arabic">{surah.arabicName}</span>
                  </div>
                  {isLocked && (
                    <div className="lock-icon">
                      <Lock size={14} />
                    </div>
                  )}
                  {isFree && !userIsPro && (
                    <div className="free-icon">✓</div>
                  )}
                </div>
              );
            })}
          </div>

          {!userIsPro && (
            <div className="upgrade-banner glass-card" onClick={onUpgrade}>
              <Crown size={24} />
              <div>
                <h4>{t('wordByWord.unlockAll')}</h4>
                <p>{t('wordByWord.unlockAllDesc')}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Sure Detayı */
        surahData && (
          <div className="wbw-content">
            {/* Sure Başlığı */}
            <div className="surah-title-card glass-card">
              <div className="surah-title-arabic">{surahData.arabicName}</div>
              <div className="surah-title-info">
                <span>{surahData.name}</span>
                <span className="dot">•</span>
                <span>{surahData.meaning}</span>
                <span className="dot">•</span>
                <span>{t('wordByWord.ayahCount', { count: surahData.ayahCount })}</span>
              </div>
            </div>

            {/* Ayetler */}
            <div className="verses-list">
              {surahData.verses.map(verse => (
                <div 
                  key={verse.number}
                  className={`verse-card glass-card ${expandedAyah === verse.number ? 'expanded' : ''}`}
                >
                  {/* Ayet Header */}
                  <div 
                    className="verse-header"
                    onClick={() => toggleAyah(verse.number)}
                  >
                    <div className="verse-number">{verse.number}</div>
                    <div className="verse-arabic">{verse.arabic}</div>
                    <div className="verse-toggle">
                      {expandedAyah === verse.number ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>

                  {/* Kelime Kelime (Expanded) */}
                  {expandedAyah === verse.number && (
                    <div className="words-grid animate-fadeIn">
                      {verse.words.map((word, i) => (
                        <div key={i} className="word-card" onClick={() => handleWordClick(word, verse.arabic)} style={{ cursor: 'pointer' }}>
                          <div className="word-meaning" style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-color)', marginBottom: '6px' }}>{word.meaning}</div>
                          <div className="word-transliteration" style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '6px' }}>{word.transliteration}</div>
                          <div className="word-arabic" style={{ fontSize: '20px' }}>{word.arabic}</div>
                          <div style={{ fontSize: '9px', color: 'var(--primary-color)', marginTop: '4px' }}>
                            <Sparkles size={10} style={{ display: 'inline', marginRight: '2px' }} />{t('wordByWord.analyze')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Diğer Surelere Git */}
            <button 
              className="change-surah-btn"
              onClick={() => setShowSurahList(true)}
            >
              <Book size={18} />
              {t('wordByWord.changeSurah')}
            </button>
          </div>
        )
      )}

      {/* Word Analysis Modal */}
      {selectedWord && (
        <div className="word-modal-overlay" onClick={() => setSelectedWord(null)}>
          <div className="word-modal" onClick={e => e.stopPropagation()}>
            <div className="word-modal-header">
              <span className="word-modal-arabic">{selectedWord.arabic}</span>
              <span className="word-modal-meaning">{selectedWord.meaning}</span>
            </div>
            <div className="word-modal-content">
              {isAnalyzing ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Loader className="spin" size={30} color="var(--primary-color)" />
                  <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>{t('wordByWord.analyzing')}</p>
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{wordAnalysis}</div>
              )}
            </div>
            <button className="word-modal-close" onClick={() => setSelectedWord(null)}>{t('wordByWord.close')}</button>
          </div>
        </div>
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="word-modal-overlay" onClick={() => setShowLimitModal(false)}>
          <div className="word-modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <Crown size={40} color="var(--primary-color)" />
              <h3 style={{ margin: '10px 0' }}>{t('wordByWord.limitTitle')}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t('wordByWord.limitDesc')}
              </p>
              <button className="btn btn-primary" onClick={() => { setShowLimitModal(false); onUpgrade(); }} style={{ marginTop: '15px' }}>{t('wordByWord.goToPro')}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .wbw-container {
          min-height: 100vh;
          padding-bottom: 100px;
          background: var(--bg-primary);
        }

        .wbw-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content h1 {
          font-size: 1.4rem;
          margin: 0;
          color: var(--text-primary);
        }

        .subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 2px 0 0 0;
        }

        .free-badge {
          margin-left: auto;
          padding: 6px 12px;
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        /* Sure Listesi */
        .wbw-surah-list {
          padding: 0 16px;
        }

        .list-header {
          margin-bottom: 16px;
        }

        .list-header h3 {
          margin: 0;
          font-size: 18px;
          color: var(--text-primary);
        }

        .list-info {
          margin: 4px 0 0;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .surah-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .surah-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .surah-card:active {
          transform: scale(0.98);
        }

        .surah-card.locked {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .surah-card.unavailable {
          opacity: 0.3;
        }

        .surah-number {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--primary-color);
        }

        .surah-info {
          flex: 1;
          min-width: 0;
        }

        .surah-name {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .surah-arabic {
          display: block;
          font-size: 11px;
          color: var(--text-secondary);
          font-family: var(--arabic-font-family);
        }

        .lock-icon {
          color: var(--text-secondary);
        }

        .free-icon {
          color: #22c55e;
          font-weight: bold;
        }

        .upgrade-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 20px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
          border-color: var(--primary-color);
          cursor: pointer;
        }

        .upgrade-banner svg {
          color: var(--primary-color);
        }

        .upgrade-banner h4 {
          margin: 0;
          font-size: 14px;
          color: var(--primary-color);
        }

        .upgrade-banner p {
          margin: 4px 0 0;
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* Sure Detayı */
        .wbw-content {
          padding: 0 16px;
        }

        .surah-title-card {
          text-align: center;
          padding: 20px;
          margin-bottom: 16px;
        }

        .surah-title-arabic {
          font-size: 32px;
          font-family: var(--arabic-font-family);
          color: var(--primary-color);
          margin-bottom: 8px;
        }

        .surah-title-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .dot {
          opacity: 0.5;
        }

        .verses-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .verse-card {
          padding: 0;
          overflow: hidden;
        }

        .verse-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          cursor: pointer;
        }

        .verse-number {
          width: 28px;
          height: 28px;
          background: var(--primary-color);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .verse-arabic {
          flex: 1;
          font-size: 18px;
          font-family: var(--arabic-font-family);
          line-height: 1.8;
          text-align: right;
          direction: rtl;
          color: var(--text-primary);
        }

        .verse-toggle {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .words-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 10px;
          padding: 0 16px 16px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 16px;
        }

        .word-card {
          text-align: center;
          padding: 12px 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }

        .word-arabic {
          font-size: 20px;
          font-family: var(--arabic-font-family);
          color: var(--primary-color);
          margin-bottom: 6px;
        }

        .word-transliteration {
          font-size: 11px;
          color: var(--text-secondary);
          font-style: italic;
          margin-bottom: 4px;
        }

        .word-meaning {
          font-size: 12px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .change-surah-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          margin-top: 20px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .change-surah-btn:active {
          transform: scale(0.98);
          background: rgba(255,255,255,0.15);
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Word Modal */
        .word-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .word-modal {
          background: var(--card-bg);
          border-radius: 20px;
          padding: 24px;
          max-width: 400px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .word-modal-header {
          text-align: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .word-modal-arabic {
          display: block;
          font-size: 32px;
          font-family: var(--arabic-font-family);
          color: var(--primary-color);
          margin-bottom: 8px;
        }

        .word-modal-meaning {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .word-modal-content {
          font-size: 14px;
          color: var(--text-primary);
          line-height: 1.6;
        }

        .word-modal-close {
          width: 100%;
          padding: 12px;
          margin-top: 16px;
          background: rgba(255,255,255,0.1);
          border: none;
          border-radius: 10px;
          color: var(--text-primary);
          cursor: pointer;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WordByWord;
