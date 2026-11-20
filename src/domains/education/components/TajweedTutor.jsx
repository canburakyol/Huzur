import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { BookOpen, Play, CheckCircle, ChevronRight, GraduationCap, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/shared/PageHeader';
import { getRulesByLevel, TAJWEED_LEVELS } from '../../../data/tajweedData';
import TajweedQuiz from './TajweedQuiz';
import { useToast } from '../../../hooks/useToast';
import '../../../styles/PracticePages.css';

const TajweedTutor = ({ onClose }) => {
  const { t } = useTranslation('tajweed');
  const { showToast } = useToast();
  const tt = useCallback((key, defaultValue, options) => t(key, { defaultValue, ...options }), [t]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [activeLevel, setActiveLevel] = useState(TAJWEED_LEVELS.BEGINNER);
  const [showQuiz, setShowQuiz] = useState(false);
  const audioRef = useRef(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

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
      showToast(tt('tajweed.audioNotReady', 'Ses dosyası hazır değil.'), 'info');
      return;
    }

    stopAudio();

    const surahPad = example.surah.toString().padStart(3, '0');
    const ayahPad = example.ayah.toString().padStart(3, '0');
    const audio = new Audio(`https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`);
    audioRef.current = audio;

    audio.play().catch((e) => {
      if (e.name !== 'AbortError') {
        showToast(tt('tajweed.audioError', 'Ses çalınırken hata oluştu.'), 'error');
      }
    });
  };

  const filteredRules = useMemo(() => getRulesByLevel(activeLevel), [activeLevel]);

  const levelInfo = {
    [TAJWEED_LEVELS.BEGINNER]: { title: tt('tajweed.levels.beginner', 'Başlangıç'), desc: tt('tajweed.levels.beginnerDesc', 'Temel tecvid kurallarını adım adım öğrenin.') },
    [TAJWEED_LEVELS.INTERMEDIATE]: { title: tt('tajweed.levels.intermediate', 'Orta Seviye'), desc: tt('tajweed.levels.intermediateDesc', 'Okuyuşunuzu güçlendiren orta seviye kurallara geçin.') },
    [TAJWEED_LEVELS.ADVANCED]: { title: tt('tajweed.levels.advanced', 'İleri Seviye'), desc: tt('tajweed.levels.advancedDesc', 'İleri tecvid detaylarıyla tilavetinizi inceltin.') }
  };

  if (showQuiz) {
    return (
      <div className="practice-page">
        <PageHeader title={tt('tajweed.quizTitle', 'Tecvid Quiz')} subtitle={tt('tajweed.quizDesc', 'Kısa bir tekrar ile tecvid bilginizi ölçün.')} onBack={() => setShowQuiz(false)} />
        <TajweedQuiz onBack={() => setShowQuiz(false)} />
      </div>
    );
  }

  if (selectedRule) {
    return (
      <div className="practice-page">
        <PageHeader title={t(selectedRule.title)} subtitle={levelInfo[activeLevel].title} onBack={handleBack} />

        <p className="practice-lead">{t(selectedRule.description)}</p>

        <div className="practice-info">
          <BookOpen size={18} aria-hidden="true" />
          <div>
            <strong>{tt('tajweed.rule', 'Kural')}</strong>
            {t(selectedRule.rule)}
          </div>
        </div>

        {selectedRule.makhrajImage && (
          <section className="practice-section">
            <h2 className="practice-section-title">{tt('tajweed.makhraj', 'Mahreç')}</h2>
            <img src={selectedRule.makhrajImage} alt={tt('tajweed.makhraj', 'Mahreç')} className="practice-panel practice-image" />
          </section>
        )}

        {selectedRule.letters?.length > 0 && (
          <section className="practice-section">
            <h2 className="practice-section-title">{tt('tajweed.letters', 'Harfler')}</h2>
            <div className="practice-chip-list" dir="rtl">
              {selectedRule.letters.map((letter) => (
                <span key={letter} className="practice-chip practice-chip--arabic" lang="ar">{letter}</span>
              ))}
            </div>
          </section>
        )}

        <section className="practice-section">
          <h2 className="practice-section-title">{tt('tajweed.examples', 'Örnekler')}</h2>
          <div className="practice-list">
            {selectedRule.examples.map((example, i) => (
              <div key={i} className="practice-row">
                <div className="practice-row__body">
                  <span className="practice-arabic" lang="ar" dir="rtl">{example.arabic || example.text}</span>
                  {example.transliteration && <span className="practice-row__title">{example.transliteration}</span>}
                  <span className="practice-row__text">{t(example.explanation)}</span>
                </div>
                <button type="button" className="practice-row-action" onClick={() => playAudio(example)} aria-label={tt('tajweed.listen', 'Dinle')}>
                  <Play size={18} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="practice-actions">
          <button type="button" className="practice-primary-button practice-wide" onClick={handleBack}>
            <CheckCircle size={18} aria-hidden="true" />
            {tt('tajweed.understood', 'Anladım, Devam Et')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-page">
      <PageHeader title={tt('tajweed.title', 'Tecvid Akademisi')} subtitle={tt('tajweed.mainSubtitle', 'Tecvid kurallarını sade ve anlaşılır adımlarla öğrenin.')} onBack={handleBack} />

      <div className="practice-segments" role="tablist" aria-label={tt('tajweed.levelLabel', 'Seviye')}>
        {Object.values(TAJWEED_LEVELS).map((level) => (
          <button
            key={level}
            type="button"
            role="tab"
            aria-selected={activeLevel === level}
            className={`practice-segment ${activeLevel === level ? 'practice-segment--active' : ''}`}
            onClick={() => setActiveLevel(level)}
          >
            {levelInfo[level].title}
          </button>
        ))}
      </div>

      <div className="practice-info">
        <GraduationCap size={18} aria-hidden="true" />
        <div>
          <strong>{tt('tajweed.moduleTitle', '{{level}} Modülü', { level: levelInfo[activeLevel].title })}</strong>
          {levelInfo[activeLevel].desc}
        </div>
      </div>

      <section className="practice-section">
        <h2 className="practice-section-title">{tt('tajweed.availableLessons', 'Mevcut Dersler')}</h2>
        <div className="practice-list">
          {filteredRules.map((rule) => (
            <button key={rule.id} type="button" className="practice-row" onClick={() => setSelectedRule(rule)}>
              <span className="practice-row__body">
                <span className="practice-row__title">{t(rule.title)}</span>
                <span className="practice-row__text">{t(rule.description)}</span>
              </span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <section className="practice-section">
        <button type="button" className="practice-row" onClick={() => setShowQuiz(true)}>
          <span className="practice-row__icon"><Trophy size={18} aria-hidden="true" /></span>
          <span className="practice-row__body">
            <span className="practice-row__title">{tt('tajweed.quizTitle', 'Tecvid Quiz')}</span>
            <span className="practice-row__text">{tt('tajweed.quizSubtitle', 'Öğrendiklerinizi hızlı bir testle pekiştirin.')}</span>
          </span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </section>
    </div>
  );
};

export default TajweedTutor;
