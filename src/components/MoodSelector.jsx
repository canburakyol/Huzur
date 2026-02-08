import { useState, useEffect } from 'react';
import { Sparkles, Heart, Info, X, Loader, Play, Pause, ChevronRight } from 'lucide-react';
import { MOODS } from '../data/moodData';
import { getAudioUrlSync } from '../services/quranService';

// Pollinations.ai için sistem prompt'u
const MOOD_PROMPT = (moodLabel) => `
Sen bir İslam alimi ve manevi danışmansın. Kullanıcı "${moodLabel}" hissediyor.

GÖREV: Bu ruh haline en uygun Kuran ayetini öner ve kısa bir manevi reçete yaz.

FORMAT (TAM OLARAK BU FORMATI KULLAN):
📖 [Sure Adı], Ayet [Numara]

[Ayetin Arapça metni]

"[Ayetin Türkçe meali]"

💚 Manevi Reçete:
[2-3 cümlelik şefkatli nasihat]

ÖNEMLİ: Sadece gerçek Kuran ayetlerini kullan. Uydurma ayet yazma.
`;

const MoodSelector = ({ onClose }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [playingUrl, setPlayingUrl] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);

  useEffect(() => {
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
      }
    };
  }, [audioPlayer]);

  const toggleAudio = (url) => {
    if (playingUrl === url) {
      audioPlayer.pause();
      setPlayingUrl(null);
    } else {
      if (audioPlayer) {
        audioPlayer.pause();
      }
      const newAudio = new Audio(url);
      newAudio.play();
      newAudio.onended = () => setPlayingUrl(null);
      setAudioPlayer(newAudio);
      setPlayingUrl(url);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  return (
    <div className="mood-overlay animate-fadeIn">
      <div className="mood-modal glass-card animate-slideUp">
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {!selectedMood ? (
          <>
            <div className="mood-header">
              <div className="icon-circle">
                <Heart size={32} color="var(--primary-color)" fill="var(--primary-color)" />
              </div>
              <h2>Bugün Nasıl Hissediyorsun?</h2>
              <p>Ruh haline en uygun ayeti senin için seçelim.</p>
            </div>

            <div className="mood-grid">
              {Object.values(MOODS).map((mood) => (
                <button
                  key={mood.id}
                  className="mood-btn"
                  onClick={() => handleMoodSelect(mood)}
                  style={{ '--mood-color': mood.color }}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-label">{mood.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="mood-result">
            <div className="selected-mood-badge" style={{ backgroundColor: selectedMood.color }}>
              {selectedMood.emoji} {selectedMood.label}
            </div>

            <div className="result-content animate-fadeIn">
              <p style={{ color: 'var(--text-color-muted)', marginBottom: '20px' }}>
                Bu ruh haline özel seçilmiş şifa ayetleri:
              </p>

              <div className="ayah-list">
                {selectedMood.ayahs.map((item, index) => {
                  const audioUrl = getAudioUrlSync(item.surahNumber, item.ayah);
                  const isPlaying = playingUrl === audioUrl;

                  return (
                    <div key={index} className="ayah-card glass-card">
                      <div className="ayah-header">
                        <span className="surah-badge">{item.surah}, {item.ayah}</span>
                        <button 
                          className={`play-btn ${isPlaying ? 'playing' : ''}`}
                          onClick={() => toggleAudio(audioUrl)}
                          style={{ backgroundColor: isPlaying ? selectedMood.color : 'var(--card-bg)' }}
                        >
                          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                      </div>
                      
                      <div className="ayah-arabic">{item.text}</div>
                      <div className="ayah-translation">"{item.translation}"</div>
                    </div>
                  );
                })}
              </div>

              <button className="btn btn-primary" onClick={() => {
                if(audioPlayer) audioPlayer.pause();
                setPlayingUrl(null);
                setSelectedMood(null);
              }} style={{ marginTop: '20px' }}>
                Başka Bir Ruh Hali Seç
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .mood-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(var(--surface-blur));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .mood-modal {
          width: 100%;
          max-width: 450px;
          background: var(--card-bg);
          padding: 30px;
          border-radius: 24px;
          position: relative;
          text-align: center;
        }

        .close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: var(--text-color-muted);
          cursor: pointer;
        }

        .mood-header {
          margin-bottom: 30px;
        }

        .icon-circle {
          width: 70px;
          height: 70px;
          background: rgba(212, 175, 55, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
        }

        .mood-header h2 {
          font-size: 22px;
          color: var(--text-color);
          margin-bottom: 8px;
        }

        .mood-header p {
          color: var(--text-color-muted);
          font-size: 14px;
        }

        .mood-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .mood-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mood-btn:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
          border-color: var(--mood-color);
        }

        .mood-emoji {
          font-size: 32px;
        }

        .mood-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-color);
        }

        .selected-mood-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .loading-state {
          padding: 40px 0;
        }

        .loading-state p {
          margin-top: 15px;
          color: var(--text-color-muted);
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          margin-top: 10px;
        }

        .ayah-arabic {
          font-family: var(--arabic-font-family);
          font-size: 24px;
          color: var(--primary-color);
          margin-bottom: 15px;
          line-height: 1.8;
        }

        .ayah-translation {
          font-size: 16px;
          font-style: italic;
          color: var(--text-color);
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .ayah-reference {
          font-size: 13px;
          color: var(--text-color-muted);
          margin-bottom: 20px;
        }

        .ai-result {
          text-align: left;
          background: rgba(255,255,255,0.05);
          padding: 20px;
          border-radius: 16px;
          max-height: 300px;
          overflow-y: auto;
        }

        .ai-result p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-color);
          margin-bottom: 12px;
        }

        .ai-badge-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-color-muted);
          margin-top: 10px;
          justify-content: flex-end;
        }

        .pro-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(212, 175, 55, 0.1);
          padding: 12px;
          border-radius: 12px;
          font-size: 12px;
          color: var(--primary-color);
          text-align: left;
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

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .ayah-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 5px;
        }

        .ayah-card {
          padding: 16px;
          border-radius: 16px;
          background: rgba(255,255,255,0.03);
          text-align: left;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .ayah-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .surah-badge {
          font-size: 12px;
          background: rgba(255,255,255,0.1);
          padding: 4px 10px;
          border-radius: 20px;
          color: var(--text-color-muted);
        }

        .play-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--primary-color);
          transition: all 0.2s;
        }

        .play-btn.playing {
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default MoodSelector;
