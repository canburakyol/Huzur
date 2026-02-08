import { useState, useRef, useEffect } from 'react';
import { BookOpen, Play, Info, CheckCircle, ChevronRight } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { useTranslation } from 'react-i18next';
import { tajweedData } from '../data/tajweedData';

const TajweedTutor = ({ onClose }) => {
  const { t } = useTranslation('tajweed');
  const [selectedRule, setSelectedRule] = useState(null);
  const audioRef = useRef(null);

  // Stop audio helper
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  // Handle back button - stop audio and go back
  const handleBack = () => {
    stopAudio();
    if (selectedRule) {
      setSelectedRule(null);
    } else {
      onClose();
    }
  };

  const playAudio = (example) => {
    if (!example.surah || !example.ayah) {
        console.warn("Eksik veri:", example);
        alert(t('tajweed.audioNotReady'));
        return;
    }

    // Stop previous audio if playing
    stopAudio();

    // 3 haneli format (padding)
    const surahPad = example.surah.toString().padStart(3, '0');
    const ayahPad = example.ayah.toString().padStart(3, '0');
    const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
        }).catch(e => {
            console.error("Ses çalma hatası:", e);
            // If it was aborted by stopAudio, don't show alert
            if (e.name !== 'AbortError') {
                alert(t('tajweed.audioError', { error: e.message }));
            }
        });
    }
  };

  return (
    <div className="tajweed-container">
      {/* Header */}
      <div className="tajweed-header">
        <IslamicBackButton onClick={handleBack} size="medium" />
        <div className="header-content">
          <h1>📖 {t('tajweed.title')}</h1>
          <p className="subtitle">
            {selectedRule ? t(selectedRule.title) : t('tajweed.subtitle')}
          </p>
        </div>
      </div>

      {selectedRule ? (
        /* Kural Detayı */
        <div className="rule-detail animate-slideUp">
          {/* Tanım Kartı */}
          <div className="detail-card glass-card">
            <div className="rule-icon" style={{ backgroundColor: selectedRule.color }}>
              <BookOpen size={24} color="white" />
            </div>
            <h2>{t(selectedRule.title)}</h2>
            <p className="rule-description">{t(selectedRule.description)}</p>
            
            <div className="rule-box">
              <h3>{t('tajweed.rule')}:</h3>
              <p>{t(selectedRule.rule)}</p>
            </div>

            <div className="letters-box">
              <h3>{t('tajweed.letters')}:</h3>
              <div className="letters-grid">
                {selectedRule.letters.map((letter, i) => (
                  <span key={i} className="letter-chip">{letter}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Örnekler */}
          <h3 className="section-title">{t('tajweed.examples')}</h3>
          <div className="examples-list">
            {selectedRule.examples.map((example, i) => (
              <div key={i} className="example-card glass-card">
                <div className="example-arabic">{example.arabic}</div>
                <div className="example-info">
                  <div className="example-transliteration">{example.transliteration}</div>
                  <div className="example-explanation">{t(example.explanation)}</div>
                </div>
                <button className="play-btn" onClick={() => playAudio(example)}>
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>

          {/* Pratik Yap Butonu */}
          <div className="practice-section">
            <button className="practice-btn">
              <CheckCircle size={20} />
              {t('tajweed.understood')}
            </button>
          </div>
        </div>
      ) : (
        /* Kural Listesi */
        <div className="rules-grid">
          {tajweedData.map(rule => (
            <div 
              key={rule.id} 
              className="rule-card glass-card"
              onClick={() => setSelectedRule(rule)}
              style={{ borderLeft: `4px solid ${rule.color}` }}
            >
              <div className="rule-card-content">
                <h3>{t(rule.title)}</h3>
                <p>{t(rule.description)}</p>
              </div>
              <div className="rule-arrow">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}

          {/* AI Kontrol Banner */}
          <div className="ai-check-banner glass-card">
            <div className="ai-icon">🎤</div>
            <div className="ai-content">
              <h3>{t('tajweed.aiCheck.title')}</h3>
              <p>{t('tajweed.aiCheck.desc')}</p>
              <span className="coming-soon-badge">{t('tajweed.aiCheck.comingSoon')}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tajweed-container {
          min-height: 100vh;
          background: var(--bg-primary);
          padding-bottom: 40px;
        }

        .tajweed-header {
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
        }

        .rule-card h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: var(--text-primary);
        }

        .rule-card p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rule-arrow {
          color: var(--text-secondary);
          opacity: 0.5;
        }

        /* Detay Görünümü */
        .rule-detail {
          padding: 16px;
        }

        .detail-card {
          padding: 24px;
          text-align: center;
          margin-bottom: 24px;
        }

        .rule-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .detail-card h2 {
          font-size: 24px;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .rule-description {
          color: var(--text-secondary);
          font-size: 15px;
          margin-bottom: 24px;
        }

        .rule-box {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          text-align: left;
        }

        .rule-box h3 {
          font-size: 14px;
          color: var(--primary-color);
          margin: 0 0 8px 0;
          text-transform: uppercase;
        }

        .rule-box p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          color: var(--text-primary);
        }

        .letters-box {
          text-align: left;
        }

        .letters-box h3 {
          font-size: 14px;
          color: var(--text-secondary);
          margin: 0 0 12px 0;
        }

        .letters-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .letter-chip {
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--arabic-font-family);
          font-size: 18px;
          color: var(--text-primary);
        }

        .section-title {
          font-size: 18px;
          font-size: 15px;
        }

        .example-explanation {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .play-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          color: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .practice-btn {
          width: 100%;
          padding: 16px;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
        }

        .ai-check-banner {
          margin-top: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .ai-icon {
          font-size: 32px;
        }

        .ai-content h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          color: #3b82f6;
        }

        .ai-content p {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .coming-soon-badge {
          font-size: 10px;
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TajweedTutor;
