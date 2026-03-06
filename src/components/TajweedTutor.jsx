import { useState, useRef, useEffect, useMemo } from 'react';
import { BookOpen, Play, Info, CheckCircle, ChevronRight, GraduationCap, Star, Trophy, Sparkles } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { useTranslation } from 'react-i18next';
import { getRulesByLevel, TAJWEED_LEVELS } from '../data/tajweedData';
import TajweedQuiz from './TajweedQuiz';
import './Education.css';

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
    [TAJWEED_LEVELS.BEGINNER]: { title: t('tajweed.levels.beginner'), icon: '🌱', color: '#10B981', desc: t('tajweed.levels.beginnerDesc') },
    [TAJWEED_LEVELS.INTERMEDIATE]: { title: t('tajweed.levels.intermediate'), icon: '🌿', color: '#3B82F6', desc: t('tajweed.levels.intermediateDesc') },
    [TAJWEED_LEVELS.ADVANCED]: { title: t('tajweed.levels.advanced'), icon: '🌳', color: '#8B5CF6', desc: t('tajweed.levels.advancedDesc') }
  };

  if (showQuiz) {
    return (
      <div className="education-container manuscript-theme">
        <div className="manuscript-header">
          <div className="header-top-nav">
             <IslamicBackButton onClick={() => setShowQuiz(false)} size="medium" />
             <div className="glass-pill">{t('tajweed.quiz')}</div>
          </div>
          <div className="manuscript-header-content reveal-stagger">
            <h1 className="manuscript-title">🏆 {t('tajweed.quizTitle')}</h1>
            <p className="manuscript-subtitle">{t('tajweed.quizDesc')}</p>
          </div>
        </div>
        <TajweedQuiz onBack={() => setShowQuiz(false)} />
      </div>
    );
  }

  const renderRuleDetail = () => (
    <div className="manuscript-detail reveal-stagger">
      <div className="manuscript-card detail-card">
        <div className="manuscript-icon-ring">
          <BookOpen size={24} color="var(--edu-gold)" />
        </div>
        <h2 className="detail-title">{t(selectedRule.title)}</h2>
        <p className="detail-description">{t(selectedRule.description)}</p>
        
        <div className="manuscript-info-box">
          <h3 className="info-box-label">{t('tajweed.rule')}</h3>
          <p className="info-box-text">{t(selectedRule.rule)}</p>
        </div>

        {selectedRule.makhrajImage && (
          <div className="makhraj-box-premium">
            <h3 className="info-box-label">{t('tajweed.makhraj')}</h3>
            <div className="makhraj-image-frame">
              <img src={selectedRule.makhrajImage} alt="Makhraj" className="makhraj-image" />
            </div>
          </div>
        )}

        {selectedRule.letters && (
          <div className="letters-box-premium">
            <h3 className="info-box-label">{t('tajweed.letters')}</h3>
            <div className="letters-scroll">
              {selectedRule.letters.map((letter, i) => (
                <span key={i} className="manuscript-letter-chip">{letter}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <h3 className="manuscript-section-title">{t('tajweed.examples')}</h3>
      <div className="examples-list-premium">
        {selectedRule.examples.map((example, i) => (
          <div key={i} className="manuscript-card example-card-premium reveal-stagger" style={{ '--delay': `${0.2 + i * 0.1}s` }}>
            <div className="arabic-preview">{example.arabic || example.text}</div>
            <div className="example-text-content">
              <div className="example-latin">{example.transliteration}</div>
              <div className="example-desc">{t(example.explanation)}</div>
            </div>
            <button className="premium-play-btn" onClick={() => playAudio(example)}>
              <Play size={18} fill="currentColor" />
            </button>
          </div>
        ))}
      </div>

      <div className="manuscript-footer">
        <button className="manuscript-action-btn" onClick={() => setSelectedRule(null)}>
          <CheckCircle size={24} />
          {t('tajweed.understood')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="education-container manuscript-theme">
      <div className="manuscript-header">
        <div className="header-top-nav">
           <IslamicBackButton onClick={handleBack} size="medium" />
           {selectedRule && <div className="glass-pill">{levelInfo[activeLevel].title}</div>}
        </div>
        
        <div className="manuscript-header-content reveal-stagger">
          <div className="title-row">
            <h1 className="manuscript-title">📖 {t('tajweed.title')}</h1>
            <span className="manuscript-badge">{t('tajweed.academy')}</span>
          </div>
          <p className="manuscript-subtitle">
            {selectedRule ? t(selectedRule.title) : t('tajweed.mainSubtitle')}
          </p>
        </div>
      </div>

      {selectedRule ? (
        renderRuleDetail()
      ) : (
        <div className="manuscript-main reveal-stagger" style={{ '--delay': '0.2s' }}>
          {/* Level Tabs */}
          <div className="manuscript-tabs-container">
            <div className="manuscript-tabs">
              {Object.values(TAJWEED_LEVELS).map(level => (
                <button 
                  key={level}
                  className={`royal-tab-btn ${activeLevel === level ? 'active' : ''}`}
                  onClick={() => setActiveLevel(level)}
                >
                  {levelInfo[level].title}
                </button>
              ))}
            </div>
          </div>

          {/* Level Progress/Banner */}
          <div className="manuscript-banner reveal-stagger" style={{ '--delay': '0.3s' }}>
             <div className="banner-content">
                <div className="banner-text">
                    <h2 className="banner-title">{levelInfo[activeLevel].title} {t('tajweed.module')}</h2>
                    <p className="banner-desc">{levelInfo[activeLevel].desc}</p>
                </div>
                <div className="banner-visual">
                    <div className="progress-decoration">
                        <GraduationCap size={40} color="var(--edu-gold)" />
                    </div>
                </div>
             </div>
          </div>

          {/* Rules List */}
          <div className="rules-grid">
            <h3 className="grid-label">{t('tajweed.availableLessons')}</h3>
            {filteredRules.map((rule, idx) => (
              <div 
                key={rule.id} 
                className="manuscript-card reveal-stagger"
                onClick={() => setSelectedRule(rule)}
                style={{ '--delay': `${0.4 + idx * 0.05}s` }}
              >
                <div className="rule-card-content">
                  <div className="rule-meta">
                    <span className="rule-badge">{levelInfo[activeLevel].title}</span>
                    <Sparkles size={14} color="var(--edu-gold)" />
                  </div>
                  <h3 className="lesson-title">{t(rule.title)}</h3>
                  <p className="lesson-desc">{t(rule.description)}</p>
                </div>
                <div className="rule-action">
                   <div className="premium-play-ring">
                     <Play size={12} fill="currentColor" />
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI & Quiz Footer */}
          <div className="action-cards-manuscript">
            <div className="manuscript-card quiz-card reveal-stagger" onClick={() => setShowQuiz(true)} style={{ '--delay': '0.6s' }}>
                <Trophy size={32} color="var(--edu-gold)" />
                <div className="card-text">
                    <h4>{t('tajweed.quizTitle')}</h4>
                    <p>{t('tajweed.quizSubtitle')}</p>
                </div>
                <ChevronRight size={20} color="var(--edu-gold)" />
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default TajweedTutor;
