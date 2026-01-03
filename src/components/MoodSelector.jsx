import { useState } from 'react';
import { Sparkles, Heart, Info, X, Loader } from 'lucide-react';
import { MOODS } from '../data/moodData';

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
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Önce hızlı bir statik sonuç hazırla (fallback için)
    const ayahs = mood.ayahs || [];
    const fallbackAyah = ayahs.length > 0 
      ? ayahs[Math.floor(Math.random() * ayahs.length)] 
      : null;

    try {
      // Pollinations.ai API çağrısı (ücretsiz, API key gerektirmez)
      const prompt = MOOD_PROMPT(mood.label);
      const encodedPrompt = encodeURIComponent(prompt);
      
      // AbortController ile timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 saniye
      
      const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}?model=mistral`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('API hatası');
      }

      const text = await response.text();
      
      if (text && text.length > 10) {
        setResult({ type: 'ai', content: text });
      } else {
        throw new Error('Boş yanıt');
      }

    } catch (err) {
      console.error('Pollinations API Error:', err);
      // Fallback: Statik veri kullan
      if (fallbackAyah) {
        setResult({ type: 'static', content: fallbackAyah });
      } else {
        setError('Şu anda servis yoğun. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
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

            {isLoading ? (
              <div className="loading-state">
                <Loader className="spin" size={40} color="var(--primary-color)" />
                <p>Senin için en uygun ayet araştırılıyor...</p>
                <span className="ai-badge"><Sparkles size={12} /> AI Destekli</span>
              </div>
            ) : error ? (
              <div className="error-state">
                <Info size={40} color="#e74c3c" />
                <p>{error}</p>
                <button className="btn btn-primary" onClick={() => setSelectedMood(null)}>Tekrar Dene</button>
              </div>
            ) : (
              <div className="result-content animate-fadeIn">
                {result.type === 'static' ? (
                  <div className="static-result">
                    <div className="ayah-arabic">{result.content.text}</div>
                    <div className="ayah-translation">"{result.content.translation}"</div>
                    <div className="ayah-reference">({result.content.surah}, {result.content.ayah})</div>
                  </div>
                ) : (
                  <div className="ai-result">
                    {result.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                    <div className="ai-badge-footer">
                      <Sparkles size={14} /> Gemini AI tarafından hazırlandı
                    </div>
                  </div>
                )}
                <button className="btn btn-primary" onClick={() => setSelectedMood(null)} style={{ marginTop: '20px' }}>
                  Başka Bir Ruh Hali
                </button>
              </div>
            )}
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
          backdrop-filter: blur(8px);
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
          font-family: 'Amiri', serif;
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
      `}</style>
    </div>
  );
};

export default MoodSelector;
