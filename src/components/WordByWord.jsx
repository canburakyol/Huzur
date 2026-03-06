import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Lock, Crown, Book, Loader, Sparkles } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { getWordByWordData, getFreeSurahs, hasWordByWordData } from '../data/wordByWordData';
import { canAccessWordByWord, isPro, FREE_WORD_BY_WORD_SURAHS } from '../services/proService';
import { surahList } from '../data/surahList';

const WordByWord = ({ onClose, onUpgrade, initialSurah = null }) => {
  const { t } = useTranslation();
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const [expandedAyah, setExpandedAyah] = useState(null);
  const [showSurahList, setShowSurahList] = useState(!initialSurah);
  const userIsPro = isPro();

  // Word Analysis States
  const [selectedWord, setSelectedWord] = useState(null);
  // Surah Data derives from selectedSurah
  const surahData = useMemo(() => {
    if (!selectedSurah) return null;
    return getWordByWordData(selectedSurah);
  }, [selectedSurah]);

  const defaultExpandedAyah = useMemo(() => (selectedSurah ? 1 : null), [selectedSurah]);

  const [wordAnalysis, setWordAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Ücretsiz sureler
  const freeSurahs = getFreeSurahs();

  const handleSelectSurah = (surahNumber) => {
    if (!canAccessWordByWord(surahNumber) && !hasWordByWordData(surahNumber)) {
      // Pro gerekli
      return;
    }
    setSelectedSurah(surahNumber);
    setExpandedAyah(1);
    setShowSurahList(false);
  };

  const toggleAyah = (ayahNumber) => {
    const current = expandedAyah ?? defaultExpandedAyah;
    setExpandedAyah(current === ayahNumber ? null : ayahNumber);
  };

  // Handle Word Click — show word details (offline, no AI)
  const handleWordClick = (word) => {
    setSelectedWord(word);
    setWordAnalysis(null);
    setIsAnalyzing(true);

    // Simulate structured "analysis" for premium feel
    setTimeout(() => {
      setWordAnalysis({
        arabic: word.arabic,
        meaning: word.meaning,
        transliteration: word.transliteration || '-',
        details: "Bu kelimenin kök analizi ve morfolojik yapısı yakında eklenecek olan çevrimdışı veritabanımızda yer alacaktır.",
        status: "İşlem Tamamlandı"
      });
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div className="settings-container reveal-stagger" style={{ padding: 0 }}>
      {/* Header - Velocity Style */}
      <div style={{
        padding: '24px 20px',
        background: 'linear-gradient(135deg, var(--nav-bg), var(--nav-hover))',
        borderBottom: '1px solid var(--nav-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <IslamicBackButton onClick={showSurahList ? onClose : () => setShowSurahList(true)} size="medium" />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--nav-text)', fontWeight: '950' }}>
            📝 {t('wordByWord.title')}
          </h1>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '800' }}>
            {showSurahList ? t('wordByWord.selectSurah') : surahData?.name}
          </p>
        </div>
        {!userIsPro && (
          <div className="hamburger-level-badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid #22c55e' }}>
            {t('wordByWord.freeSurahsBadge', { count: freeSurahs.length })}
          </div>
        )}
      </div>

      {showSurahList ? (
        /* Sure Listesi - Velocity Style */
        <div style={{ padding: '0 20px 40px 20px' }} className="reveal-stagger">
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--nav-text)', fontWeight: '900' }}>{t('wordByWord.chooseSurah')}</h3>
            {!userIsPro && (
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                {t('wordByWord.freeSurahsInfo')}
              </p>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
          }}>
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
                    border: isFree && !userIsPro ? '1px solid #22c55e' : '1px solid var(--nav-border)'
                  }}
                  onClick={() => isAvailable && handleSelectSurah(surah.number)}
                >
                  <div className="settings-icon-box" style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: isFree && !userIsPro ? 'rgba(34, 197, 94, 0.1)' : 'var(--nav-hover)',
                    color: isFree && !userIsPro ? '#22c55e' : 'var(--nav-accent)',
                    fontSize: '0.8rem',
                    borderRadius: '10px'
                  }}>
                    {surah.number}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '800', 
                      color: 'var(--nav-text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {surah.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: 'var(--nav-text-muted)',
                      fontFamily: 'var(--arabic-font-family)'
                    }}>
                      {surah.arabicName}
                    </div>
                  </div>
                  {isLocked && <Lock size={14} color="var(--nav-text-muted)" />}
                  {isFree && !userIsPro && <div style={{ color: '#22c55e', fontWeight: '900', fontSize: '0.7rem' }}>FREE</div>}
                </div>
              );
            })}
          </div>

          {!userIsPro && (
            <div className="settings-card reveal-stagger" style={{
              marginTop: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, var(--nav-accent), #f59e0b)',
              border: 'none',
              cursor: 'pointer',
              '--delay': '0.5s'
            }} onClick={onUpgrade}>
              <div className="settings-icon-box" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <Crown size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, color: 'white', fontWeight: '900', fontSize: '1.1rem' }}>{t('wordByWord.unlockAll')}</h4>
                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: '600' }}>{t('wordByWord.unlockAllDesc')}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Sure Detayı - Velocity Style */
        surahData && (
          <div style={{ padding: '0 20px 40px 20px' }} className="reveal-stagger">
            {/* Sure Başlığı */}
            <div className="settings-card" style={{
              flexDirection: 'column',
              padding: '32px 24px',
              textAlign: 'center',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, var(--nav-bg), var(--nav-hover))'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontFamily: 'var(--arabic-font-family)',
                color: 'var(--nav-accent)',
                marginBottom: '12px'
              }}>{surahData.arabicName}</div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: 'var(--nav-text-muted)',
                fontWeight: '800',
                flexWrap: 'wrap'
              }}>
                <span style={{ color: 'var(--nav-text)' }}>{surahData.name}</span>
                <span style={{ opacity: 0.3 }}>•</span>
                <span>{surahData.meaning}</span>
                <span style={{ opacity: 0.3 }}>•</span>
                <span className="hamburger-level-badge">{t('wordByWord.ayahCount', { count: surahData.ayahCount })}</span>
              </div>
            </div>

            {/* Ayetler */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {surahData.verses.map((verse, vIdx) => (
                <div 
                  key={verse.number}
                  className={`settings-card reveal-stagger ${expandedAyah === verse.number ? 'expanded' : ''}`}
                  style={{
                    padding: '0',
                    flexDirection: 'column',
                    '--delay': `${vIdx * 0.1}s`,
                    border: expandedAyah === verse.number ? '1px solid var(--nav-accent)' : '1px solid var(--nav-border)'
                  }}
                >
                  {/* Ayet Header */}
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleAyah(verse.number)}
                  >
                    <div className="settings-icon-box" style={{ 
                      width: '32px', 
                      height: '32px', 
                      background: 'var(--nav-accent)', 
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: '900',
                      borderRadius: '50%'
                    }}>
                      {verse.number}
                    </div>
                    <div style={{
                      flex: 1,
                      fontSize: '1.25rem',
                      fontFamily: 'var(--arabic-font-family)',
                      lineHeight: '1.8',
                      textAlign: 'right',
                      direction: 'rtl',
                      color: 'var(--nav-text)'
                    }}>{verse.arabic}</div>
                    <div style={{ color: 'var(--nav-text-muted)' }}>
                      {expandedAyah === verse.number ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Kelime Kelime (Expanded) */}
                  {expandedAyah === verse.number && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                      gap: '12px',
                      padding: '20px',
                      background: 'var(--nav-hover)',
                      borderTop: '1px solid var(--nav-border)',
                      animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                      {verse.words.map((word, i) => (
                        <div 
                          key={i} 
                          className="settings-card"
                          style={{
                            padding: '12px',
                            flexDirection: 'column',
                            textAlign: 'center',
                            gap: '4px',
                            borderRadius: '16px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleWordClick(word)}
                        >
                          <div style={{ fontWeight: '900', fontSize: '0.85rem', color: 'var(--nav-text)' }}>{word.meaning}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--nav-text-muted)', fontStyle: 'italic' }}>{word.transliteration}</div>
                          <div style={{ fontSize: '1.5rem', fontFamily: 'var(--arabic-font-family)', color: 'var(--nav-accent)', marginTop: '4px' }}>{word.arabic}</div>
                          <div style={{ 
                            fontSize: '0.65rem', 
                            color: 'var(--nav-accent)', 
                            marginTop: '8px',
                            fontWeight: '900',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            opacity: 0.8
                          }}>
                            <Sparkles size={10} />{t('wordByWord.analyze')}
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
              className="velocity-target-btn"
              style={{
                marginTop: '32px',
                width: '100%',
                justifyContent: 'center',
                background: 'var(--nav-hover)',
                color: 'var(--nav-text)',
                borderColor: 'var(--nav-border)'
              }}
              onClick={() => setShowSurahList(true)}
            >
              <Book size={18} />
              {t('wordByWord.changeSurah')}
            </button>
          </div>
        )
      )}

      {/* Word Analysis Modal - Velocity Style */}
      {selectedWord && (
        <div className="word-modal-overlay">
          <div className="reveal-stagger" style={{
            background: 'var(--nav-bg)',
            borderRadius: '32px',
            padding: '32px 24px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
            border: '1px solid var(--nav-border)',
            animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--nav-border)'
            }}>
              <span style={{ 
                display: 'block', 
                fontSize: '2.5rem', 
                fontFamily: 'var(--arabic-font-family)', 
                color: 'var(--nav-accent)', 
                marginBottom: '8px' 
              }}>{selectedWord.arabic}</span>
              <span style={{ 
                fontSize: '1.1rem', 
                color: 'var(--nav-text)', 
                fontWeight: '900' 
              }}>{selectedWord.meaning}</span>
            </div>
            
            <div className="word-modal-content">
              {isAnalyzing ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Loader className="spin" size={32} color="var(--nav-accent)" />
                  <p style={{ marginTop: '16px', color: 'var(--nav-text-muted)', fontWeight: '800' }}>{t('wordByWord.analyzing')}</p>
                </div>
              ) : (
                wordAnalysis && (
                  <div className="reveal-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>🔤 Okunuş</span>
                      <div className="settings-card" style={{ padding: '12px 16px', background: 'var(--nav-hover)' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--nav-text)', fontWeight: '700' }}>{wordAnalysis.transliteration}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>📝 Anlam</span>
                      <div className="settings-card" style={{ padding: '12px 16px', background: 'var(--nav-hover)' }}>
                        <span style={{ fontSize: '1rem', color: 'var(--nav-text)', fontWeight: '700' }}>{wordAnalysis.meaning}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '900', textTransform: 'uppercase' }}>ℹ️ Detaylı Analiz</span>
                      <div className="settings-card" style={{ padding: '16px', background: 'var(--nav-hover)', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--nav-text)', fontWeight: '600' }}>
                        {wordAnalysis.details}
                      </div>
                    </div>
                    <div className="hamburger-level-badge" style={{ 
                      alignSelf: 'flex-start', 
                      background: 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1)', 
                      color: 'var(--nav-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Sparkles size={14} /> {wordAnalysis.status}
                    </div>
                  </div>
                )
              )}
            </div>
            <button 
              className="velocity-target-btn" 
              style={{ width: '100%', marginTop: '32px', justifyContent: 'center' }} 
              onClick={() => setSelectedWord(null)}
            >
              {t('wordByWord.close')}
            </button>
          </div>
        </div>
      )}

      {/* Limit Modal - Velocity Style */}
      {showLimitModal && (
        <div className="word-modal-overlay">
          <div className="reveal-stagger" style={{
            background: 'var(--nav-bg)',
            borderRadius: '32px',
            padding: '40px 24px',
            maxWidth: '360px',
            width: '85%',
            textAlign: 'center',
            boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
            border: '1px solid var(--nav-border)'
          }}>
            <div className="settings-icon-box" style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto 24px', 
              background: 'linear-gradient(135deg, var(--nav-accent), #f59e0b)',
              color: 'white',
              boxShadow: '0 12px 24px rgba(var(--nav-accent-rgb, 249, 115, 22), 0.4)'
            }}>
              <Crown size={40} />
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: '1.5rem', fontWeight: '950', color: 'var(--nav-text)' }}>{t('wordByWord.limitTitle')}</h3>
            <p style={{ color: 'var(--nav-text-muted)', fontWeight: '600', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
              {t('wordByWord.limitDesc')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="velocity-target-btn" 
                style={{ width: '100%', justifyContent: 'center', background: 'var(--nav-accent)', color: 'white' }} 
                onClick={() => { setShowLimitModal(false); onUpgrade(); }}
              >
                {t('wordByWord.goToPro')}
              </button>
              <button 
                className="velocity-target-btn" 
                style={{ width: '100%', justifyContent: 'center', background: 'var(--nav-hover)', color: 'var(--nav-text)' }} 
                onClick={() => setShowLimitModal(false)}
              >
                {t('common.cancel', 'Vazgeç')}
              </button>
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
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
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

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .settings-card.locked {
          background: var(--nav-hover);
          border-style: dashed;
        }

        .settings-card.unavailable {
          filter: grayscale(1);
        }

        /* Analysis Report Styles */
        .analysis-report {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 8px 0;
        }

        .report-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .report-item .label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .report-item .value {
          font-size: 1rem;
          color: var(--text-primary);
          font-weight: 500;
          background: rgba(255,255,255,0.05);
          padding: 8px 12px;
          border-radius: 8px;
        }

        .report-item .value-p {
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-primary);
          margin: 0;
          background: rgba(255,255,255,0.05);
          padding: 12px;
          border-radius: 8px;
        }

        .report-status {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--primary-color);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: rgba(59, 130, 246, 0.1);
          padding: 6px 12px;
          border-radius: 20px;
          align-self: flex-start;
        }
      `}</style>
    </div>
  );
};

export default WordByWord;
