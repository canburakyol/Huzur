import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, Trophy, CheckCircle, XCircle } from 'lucide-react';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { useGamification } from '../../../hooks/useGamification';
import { getDailyQuestions } from '../../../data/dailyQuizData';
import { storageService } from '../../../services/storageService';
import { getDailyQuizHistory, getDailyQuizResult, saveDailyQuizResult } from '../../../services/engagementSummaryService';

const QUIZ_STATE_KEY = 'huzur_daily_quiz_state';

const DailyIslamicQuiz = ({ onClose }) => {
  const { t } = useTranslation();
  const { addPoints, awardBadge } = useGamification();

  const getInitialState = () => {
    const today = new Date().toDateString();
    const quizResult = getDailyQuizResult();
    const saveState = storageService.getItem(QUIZ_STATE_KEY, {});

    if (quizResult) {
      return { played: true, score: quizResult.score || 0, finished: true, qs: [] };
    }

    if (saveState.date === today && saveState.finished) {
      return { played: true, score: saveState.score || 0, finished: true, qs: [] };
    }
    return { played: false, score: 0, finished: false, qs: getDailyQuestions() };
  };

  const [initialData] = useState(() => getInitialState());
  const [questions] = useState(initialData.qs);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(initialData.score);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(initialData.finished);
  const [hasPlayedToday] = useState(initialData.played);

  const handleOptionSelect = (index) => {
    if (selectedOption !== null) return; // Zaten seçilmiş
    setSelectedOption(index);
    setShowExplanation(true);
  };

  const handleNext = () => {
    const isCorrect = selectedOption === questions[currentIndex].answer;
    if (isCorrect) setScore(prev => prev + 1);

    setShowExplanation(false);
    setSelectedOption(null);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz(score + (isCorrect ? 1 : 0));
    }
  };

  const finishQuiz = (finalScore) => {
    setIsFinished(true);
    const today = new Date().toDateString();
    storageService.setItem(QUIZ_STATE_KEY, { date: today, finished: true, score: finalScore });
    saveDailyQuizResult({
      score: finalScore,
      totalQuestions: questions.length
    });
    
    // Her doğru cevap için 15 XP ödülü
    if (finalScore > 0) {
      addPoints(finalScore * 15, { source: 'daily_quiz' });
    }

    const totalQuizRuns = Object.keys(getDailyQuizHistory()).length;
    awardBadge('quiz_first');
    if (totalQuizRuns >= 50) {
      awardBadge('quiz_master');
    }
  };

  if (questions.length === 0 && !hasPlayedToday) return null;

  if (isFinished) {
    return (
      <div className="feature-overlay">
        <div className="feature-header blur-header">
          <IslamicBackButton onClick={onClose} label={t('quiz.title', 'Günün Testi')} />
        </div>
        <div className="feature-content" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="settings-card reveal-stagger" style={{ flexDirection: 'column', padding: '40px 20px', textAlign: 'center', width: '100%', maxWidth: '380px' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--accent-gold-light), var(--accent-gold))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)'
            }}>
              <Trophy size={40} color='var(--on-primary)' />
            </div>
            
            <h2 style={{ fontSize: '1.8rem', fontWeight: '950', color: 'var(--nav-text)', margin: '0 0 10px' }}>
              {score === 5 ? t('quiz.perfect') : score >= 3 ? t('quiz.congrats') : t('quiz.goodTry')}
            </h2>
            
            <p style={{ fontSize: '1rem', color: 'var(--nav-text-muted)', marginBottom: '24px' }}>
              {hasPlayedToday 
                ? t('quiz.alreadyPlayed')
                : t('quiz.completed')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--accent-gold)' }}>{score}/5</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('quiz.correct')}</div>
              </div>
              <div style={{ width: '1px', background: 'var(--nav-border)' }} />
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981' }}>+{score * 15}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>{t('quiz.xpEarned')}</div>
              </div>
            </div>

            <button onClick={onClose} style={{ 
              width: '100%', padding: '16px', borderRadius: '16px', border: 'none', background: 'var(--nav-hover)', 
              color: 'var(--nav-text)', fontSize: '1.05rem', fontWeight: '800' 
            }}>
              {t('common.home', 'Ana Ekrana Dön')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const translatedOptions = t(`quiz.questions.${currentQ.id}.options`, { returnObjects: true, defaultValue: currentQ.options });
  const options = Array.isArray(translatedOptions) ? translatedOptions : currentQ.options;

  return (
    <div className="feature-overlay">
      <div className="feature-header blur-header">
        <IslamicBackButton onClick={onClose} label={t('quiz.title', 'Günün Testi')} />
      </div>

      <div className="feature-content" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800' }}>
            {t(`quiz.categories.${currentQ.category}`, currentQ.category)}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--nav-text-muted)' }}>
            {t('quiz.questionProgress', 'Soru {{current}}/{{total}}', { current: currentIndex + 1, total: 5 })}
          </div>
        </div>

        {/* Question Card */}
        <div className="settings-card reveal-stagger" style={{ flexDirection: 'column', padding: '30px 24px', marginBottom: '24px', border: '1px solid var(--nav-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Brain size={24} color="var(--accent-gold)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--nav-text)', lineHeight: '1.4', margin: '0' }}>
            {t(`quiz.questions.${currentQ.id}.question`, currentQ.question)}
          </h3>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = currentQ.answer === idx;
            
            let bgStyle = 'var(--nav-hover)';
            let colorStyle = 'var(--nav-text)';
            let borderStyle = '1px solid var(--nav-border)';
            let icon = null;

            if (selectedOption !== null) {
              if (isCorrect) {
                bgStyle = 'rgba(16, 185, 129, 0.15)';
                colorStyle = '#10b981';
                borderStyle = '1px solid #10b981';
                icon = <CheckCircle size={20} color="#10b981" />;
              } else if (isSelected) {
                bgStyle = 'rgba(239, 68, 68, 0.15)';
                colorStyle = '#ef4444';
                borderStyle = '1px solid #ef4444';
                icon = <XCircle size={20} color="#ef4444" />;
              }
            }

            return (
              <button
                key={idx}
                disabled={selectedOption !== null}
                onClick={() => handleOptionSelect(idx)}
                className="hover-lift"
                style={{
                  width: '100%', padding: '16px 20px', borderRadius: '16px',
                  background: bgStyle, color: colorStyle, border: borderStyle,
                  fontSize: '1.05rem', fontWeight: '700', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.3s ease', cursor: selectedOption !== null ? 'default' : 'pointer'
                }}
              >
                {option}
                {icon}
              </button>
            )
          })}
        </div>

        {/* Explanation Box */}
        {showExplanation && currentQ.explanation && (
          <div className="reveal-stagger" style={{ 
            marginTop: '24px', padding: '20px', borderRadius: '16px',
            background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Brain size={18} color="#3b82f6" />
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase' }}>{t('quiz.info', 'Bilgi')}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--nav-text)', lineHeight: '1.6', fontWeight: '600' }}>
              {t(`quiz.questions.${currentQ.id}.explanation`, currentQ.explanation)}
            </p>
            <button
              onClick={handleNext}
              style={{
                marginTop: '16px', width: '100%', padding: '14px', borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--tertiary), var(--tertiary-fixed-dim))',
                color: 'var(--on-primary)', border: 'none', fontSize: '1rem', fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {currentIndex < questions.length - 1 ? t('quiz.nextQuestion', 'Sonraki Soru →') : t('quiz.viewResults', 'Sonuçları Gör')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyIslamicQuiz;
