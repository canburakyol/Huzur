import { useState, useRef, useEffect, useMemo } from 'react';
import { BookOpen, Play, Info, CheckCircle, ChevronRight, GraduationCap, Star, Trophy, Sparkles } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { useTranslation } from 'react-i18next';
import { TAJWEED_LEVELS, getRulesByLevel } from '../data/tajweedData';
import TajweedQuiz from './TajweedQuiz';

const TajweedTutor = ({ onClose }) => {
  const { t } = useTranslation('tajweed');
  const [selectedRule, setSelectedRule] = useState(null);
  const [activeLevel, setActiveLevel] = useState(TAJWEED_LEVELS.BEGINNER);
  const [showQuiz, setShowQuiz] = useState(false);
  const audioRef = useRef(null);

  const TAJWEED_QA = {};
  /*
  const TAJWEED_QA_REMOVED = {
    'Tenvin nedir?': 'Tenvin, kelimenin sonunda bulunan nun harfinin ses etkisidir. Üç çeşidi vardır:\n• Fethatân (ً): Üstün tenvin\n• Kesretân (ٍ): Esre tenvin\n• Dammetân (ٌ): Ötre tenvin\nTenvin, kelimenin sonundaki nunun yazılmadan okunmasıdır.',
    'Gunneli okuyuş nasıl olur?': 'Gunne, nun ve mim harflerinin genizden okunmasıdır. İki hareke miktarı tutulur.\n• İdğam (mealgünne): Nun sakineden sonra ي، ن، م، w gelirse\n• İhfa: Nun sakineden sonra 15 harf gelirse (ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك)\n• İklab: Nun sakineden sonra ب gelirse, mim\'e dönüşür ve gunneli okunur.',
    'Kalkale harfleri hangileri?': 'Kalkale harfleri 5 tanedir ve "قطب جد" kelimesiyle ezberlenir:\n• ق (Kaf), ط (Tı), ب (Ba), ج (Cim), د (Dal)\nBu harfler sakin (cezimli) olduğunda, çıkış noktasında bir sıçrama/titreşim yapılır.',
    'Med harfleri nelerdir?': 'Uzatma (Med) harfleri üçtür: Elif (ا), Vav (و) ve Ya (ي). Bu harfler kendinden önceki harfi bir elif miktarı (yaklaşık 1-1.5 saniye) uzatır.',
    'Mahreç nedir?': 'Mahreç, harflerin ağızdan çıkış yeridir. Kuran okurken harflerin doğru mahreçlerinden çıkarılması anlamın bozulmaması için çok önemlidir.',
    'İhfa nasıl yapılır?': 'İhfa, sözlükte gizlemek demektir. Sakin nun veya tenvinden sonra ihfa harfleri geldiğinde, nun sesini genizden (burundan) getirerek hafifçe gizleyerek okumaktır.',
    'Sekte nedir?': 'Sekte, sesi bir an için kesip nefes almadan beklemektir. Kuran-ı Kerim\'de 4 yerde sekte bulunur (Kehf, Yasin, Kıyame ve Mutaffifin surelerinde).',
    'İzhar nedir?': 'İzhar, açıkça okumaktır. Sakin nun veya tenvinden sonra boğaz harfleri (ء ه ح خ ع غ) gelirse, nun sesi hiç tutulmadan ve gizlenmeden olduğu gibi okunur.'
  };
  */

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

  const handleBack = () => {
    stopAudio();
    if (selectedRule) {
      setSelectedRule(null);
    } else if (showQuiz) {
      setShowQuiz(false);
    } else {
      onClose();
    }
  };

  const playAudio = (example) => {
    if (!example.surah || !example.ayah) {
        alert(t('tajweed.audioNotReady'));
        return;
    }

    stopAudio();

    const surahPad = example.surah.toString().padStart(3, '0');
    const ayahPad = example.ayah.toString().padStart(3, '0');
    const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.play().catch(e => {
        if (e.name !== 'AbortError') {
            alert(t('tajweed.audioError', { error: e.message }));
        }
    });
  };

  const filteredRules = useMemo(() => {
    return getRulesByLevel(activeLevel);
  }, [activeLevel]);

  const levelInfo = {
    [TAJWEED_LEVELS.BEGINNER]: { title: 'Başlangıç', icon: '🌱', color: '#10B981', desc: 'Sakin Nun ve Tenvin Kuralları' },
    [TAJWEED_LEVELS.INTERMEDIATE]: { title: 'Orta Seviye', icon: '🌿', color: '#3B82F6', desc: 'Kalkale ve İklab Çalışması' },
    [TAJWEED_LEVELS.ADVANCED]: { title: 'İleri Seviye', icon: '🌳', color: '#8B5CF6', desc: 'Med Kuralları ve Vakıf' }
  };

  if (showQuiz) {
    return (
      <div className="tajweed-container">
        <div className="tajweed-header">
          <IslamicBackButton onClick={() => setShowQuiz(false)} size="medium" />
          <div className="header-content">
            <h1>🏆 Tecvid Bilgini</h1>
            <p className="subtitle">Öğrendiklerini test et</p>
          </div>
        </div>
        <TajweedQuiz onBack={() => setShowQuiz(false)} />
      </div>
    );
  }

  const renderRuleDetail = () => (
    <div className="rule-detail animate-slideUp">
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

        {selectedRule.makhrajImage && (
          <div className="makhraj-box">
            <h3>{t('tajweed.makhraj') || 'Çıkış Noktası (Mahreç)'}:</h3>
            <div className="makhraj-image-container">
              <img src={selectedRule.makhrajImage} alt="Makhraj" className="makhraj-image" />
            </div>
          </div>
        )}

        {selectedRule.letters && (
          <div className="letters-box">
            <h3>{t('tajweed.letters')}:</h3>
            <div className="letters-grid">
              {selectedRule.letters.map((letter, i) => (
                <span key={i} className="letter-chip">{letter}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <h3 className="section-title">{t('tajweed.examples')}</h3>
      <div className="examples-list">
        {selectedRule.examples.map((example, i) => (
          <div key={i} className="example-card glass-card">
            <div className="example-arabic">{example.arabic || example.text}</div>
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

      <div className="practice-section">
        <button className="practice-btn" onClick={() => setSelectedRule(null)}>
          <CheckCircle size={20} />
          {t('tajweed.understood')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="tajweed-container">
      <div className="tajweed-header" style={{
          paddingTop: 'calc(20px + env(safe-area-inset-top))',
          background: `linear-gradient(180deg, ${levelInfo[activeLevel].color}33 0%, transparent 100%)`
      }}>
        <IslamicBackButton onClick={handleBack} size="medium" />
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>📖 {t('tajweed.title')}</h1>
            <span className="academy-badge">Akademi</span>
          </div>
          <p className="subtitle">
            {selectedRule ? levelInfo[activeLevel].title : 'Kuran-ı Kerim\'i usulüne uygun okumayı öğrenin'}
          </p>
        </div>
      </div>

      {selectedRule ? (
        renderRuleDetail()
      ) : (
        <div className="academy-main animate-fadeIn">
          {/* Level Tabs */}
          <div className="level-tabs">
            {Object.values(TAJWEED_LEVELS).map(level => (
              <button 
                key={level}
                className={`level-tab ${activeLevel === level ? 'active' : ''}`}
                onClick={() => setActiveLevel(level)}
                style={{ 
                    '--theme-color': levelInfo[level].color,
                    borderColor: activeLevel === level ? levelInfo[level].color : 'transparent'
                }}
              >
                <span className="tab-icon">{levelInfo[level].icon}</span>
                <span className="tab-label">{levelInfo[level].title}</span>
              </button>
            ))}
          </div>

          {/* Level Progress/Banner */}
          <div className="level-banner glass-card" style={{ borderColor: `${levelInfo[activeLevel].color}44` }}>
             <div className="banner-content">
                <div className="banner-text">
                    <h2 style={{ color: levelInfo[activeLevel].color }}>{levelInfo[activeLevel].title} Modülü</h2>
                    <p>{levelInfo[activeLevel].desc}</p>
                </div>
                <div className="banner-visual">
                    <div className="progress-circle" style={{ color: levelInfo[activeLevel].color }}>
                        <GraduationCap size={40} />
                    </div>
                </div>
             </div>
          </div>

          {/* Rules List */}
          <div className="rules-grid">
            <h3 className="grid-label">Mevcut Dersler</h3>
            {filteredRules.map(rule => (
              <div 
                key={rule.id} 
                className="rule-card glass-card item-stagger"
                onClick={() => setSelectedRule(rule)}
                style={{ borderLeft: `6px solid ${rule.color}` }}
              >
                <div className="rule-card-content">
                  <div className="rule-meta">
                    <span className="rule-tag" style={{ background: `${rule.color}22`, color: rule.color }}>{levelInfo[activeLevel].title}</span>
                    <Sparkles size={14} color={rule.color} />
                  </div>
                  <h3>{t(rule.title)}</h3>
                  <p>{t(rule.description)}</p>
                </div>
                <div className="rule-action">
                   <div className="rule-play-icon">
                     <Play size={12} fill="currentColor" />
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI & Quiz Footer */}
          <div className="action-cards" style={{ gridTemplateColumns: '1fr' }}>
            <div className="action-card quiz glass-card" onClick={() => setShowQuiz(true)}>
                <Trophy className="card-icon" color="#FBBF24" />
                <div className="card-text">
                    <h4>Tecvid Bilgini</h4>
                    <p>Öğrendiklerini test et</p>
                </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tajweed-container {
          min-height: 100vh;
          background: var(--bg-gradient-start);
          padding-bottom: 40px;
        }

        .tajweed-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .header-content h1 {
          font-size: 1.4rem;
          margin: 0;
          color: var(--text-color);
        }

        .academy-badge {
          background: var(--primary-color);
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .subtitle {
          font-size: 0.85rem;
          color: var(--text-color-muted);
          margin: 4px 0 0 0;
        }

        /* Academy Main */
        .academy-main {
          padding: 16px;
        }

        .level-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .level-tab {
          flex: 1;
          min-width: 100px;
          background: var(--glass-bg);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--text-color-muted);
        }

        .level-tab.active {
          background: rgba(255,255,255,0.1);
          color: var(--text-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .tab-icon { font-size: 20px; }
        .tab-label { font-size: 12px; font-weight: 600; }

        .level-banner {
          background: var(--glass-bg);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid var(--glass-border);
        }

        .banner-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .banner-text h2 { margin: 0 0 4px 0; font-size: 20px; }
        .banner-text p { margin: 0; font-size: 13px; color: var(--text-color-muted); }

        .rules-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .grid-label {
          font-size: 14px;
          color: var(--text-color-muted);
          margin-bottom: 8px;
          padding-left: 4px;
        }

        .rule-card {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .rule-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
        }

        .rule-tag {
            font-size: 10px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 4px;
        }

        .rule-card h3 {
          margin: 0 0 4px 0;
          font-size: 17px;
          color: var(--text-color);
        }

        .rule-card p {
          margin: 0;
          font-size: 13px;
          color: var(--text-color-muted);
          line-height: 1.4;
        }

        .rule-action {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0.8;
        }

        /* Action Cards */
        .action-cards {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 24px;
        }

        .action-card {
            padding: 16px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            position: relative;
        }

        .card-icon { width: 32px; height: 32px; }
        .card-text h4 { margin: 0; font-size: 14px; }
        .card-text p { margin: 0; font-size: 11px; color: var(--text-color-muted); }

        .locked-badge, .premium-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 10px;
            background: rgba(0,0,0,0.5);
            color: #fff;
        }

        .premium-badge { background: #d4af37; color: #000; font-weight: bold; }

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
          color: var(--text-color);
          margin: 0 0 8px 0;
        }

        .rule-description {
          color: var(--text-color-muted);
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
          color: var(--text-color);
        }

        .letters-box { text-align: left; }
        .letters-box h3 { font-size: 14px; color: var(--text-color-muted); margin: 0 0 12px 0; }
        
        .makhraj-box {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          text-align: left;
        }

        .makhraj-box h3 {
          font-size: 14px;
          color: var(--primary-color);
          margin: 0 0 12px 0;
          text-transform: uppercase;
        }

        .makhraj-image-container {
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          display: flex;
          justify-content: center;
          padding: 10px;
        }

        .makhraj-image {
          max-width: 100%;
          height: auto;
          max-height: 200px;
          object-fit: contain;
        }

        .letters-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .letter-chip {
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.1); border-radius: 8px;
          display: flex; alignItems: center; justifyContent: center;
          font-family: var(--arabic-font-family); font-size: 18px; color: var(--text-color);
        }
        
        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary-color);
          margin: 24px 0 12px 0;
          padding-left: 4px;
        }

        .examples-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .example-card { padding: 16px; display: flex; align-items: center; gap: 16px; }
        .example-arabic { font-family: var(--arabic-font-family); font-size: 24px; color: var(--primary-color); }
        .example-info { flex: 1; }
        .example-transliteration { font-weight: bold; font-size: 14px; }
        .example-explanation { font-size: 12px; color: var(--text-color-muted); }

        .play-btn {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.1); border: none;
          color: var(--primary-color); display: flex; align-items: center; justifyContent: center; cursor: pointer;
        }

        .practice-btn {
          width: 100%; padding: 16px; background: var(--primary-color); color: white;
          border: none; border-radius: 16px; font-size: 16px; font-weight: 600;
          display: flex; align-items: center; justifyContent: center; gap: 10px; cursor: pointer;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        
        .item-stagger { animation: slideUp 0.3s ease-out backwards; }
        .item-stagger:nth-child(1) { animation-delay: 0.1s; }
        .item-stagger:nth-child(2) { animation-delay: 0.15s; }
        .item-stagger:nth-child(3) { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};

export default TajweedTutor;
