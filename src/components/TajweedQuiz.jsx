import { useState, useCallback } from 'react';
import { HelpCircle, Check, X, ArrowRight, RotateCcw, Trophy, Info, Sparkles, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tajweedQuizData } from '../data/tajweedQuizData';

const TajweedQuiz = ({ onBack }) => {
  const { t } = useTranslation();
  
  const generateQuestions = useCallback(() => {
    return [...tajweedQuizData].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, []);

  const [shuffledQuestions, setShuffledQuestions] = useState(generateQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleOptionClick = (index) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
  };

  const nextQuestion = () => {
    if (selectedOption === shuffledQuestions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setShuffledQuestions(generateQuestions());
    setCurrentQuestion(0);
    setSelectedOption(null);
    setScore(0);
    setQuizFinished(false);
  };

  if (shuffledQuestions.length === 0) return null;

  if (quizFinished) {
    return (
      <div className="quiz-result reveal-stagger">
        <div className="settings-card" style={{ flexDirection: 'column', padding: '40px', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 24px' }}>
              <div className="trophy-pulse" />
              <div className="settings-icon-box" style={{ 
                  width: '100px', height: '100px', background: 'rgba(212, 175, 55, 0.15)', 
                  color: '#d4af37', borderRadius: '30px' 
              }}>
                <Trophy size={48} />
              </div>
          </div>

          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: '950', color: 'var(--nav-text)' }}>
            {t('tajweedQuiz.resultTitle', 'Tebrikler!')}
          </h2>
          <p style={{ margin: '0 0 32px 0', fontSize: '0.9rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
            {t('tajweedQuiz.resultSubtitle', "Tecvid Quiz'ini başarıyla tamamladınız.")}
          </p>

          <div className="score-container">
            <div className="score-main">
                <span className="score-value">{score}</span>
                <span className="score-total">/ {shuffledQuestions.length}</span>
            </div>
            <div className="score-label">DOĞRU CEVAP</div>
          </div>

          <p style={{ margin: '0 0 32px 0', fontSize: '1rem', color: 'var(--nav-text)', fontWeight: '700', lineHeight: '1.6' }}>
            {score === shuffledQuestions.length
              ? t('tajweedQuiz.feedback.excellent', 'Harika! Tecvid kurallarına hakimsin.')
              : score >= 3
                ? t('tajweedQuiz.feedback.good', 'Güzel bir başlangıç, biraz daha pratikle mükemmelleşebilirsin.')
                : t('tajweedQuiz.feedback.retry', 'Dersleri tekrar gözden geçirmeye ne dersin?')}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <button className="velocity-btn-primary" onClick={resetQuiz} style={{ padding: '16px' }}>
              <RotateCcw size={18} style={{ marginRight: '8px' }} />
              {t('tajweedQuiz.actions.restart', 'Yeniden Başla')}
            </button>
            <button 
              onClick={onBack}
              style={{ 
                  background: 'transparent', border: '1px solid var(--nav-border)', 
                  color: 'var(--nav-text-muted)', padding: '14px', borderRadius: '16px',
                  fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer'
              }}
            >
              {t('tajweedQuiz.actions.backToMenu', 'Ana Menüye Dön')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = shuffledQuestions[currentQuestion];

  return (
    <div className="quiz-container reveal-stagger">
      <div className="quiz-progress-section">
        <div className="velocity-progress-track">
          <div 
            className="velocity-progress-fill" 
            style={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
          />
        </div>
        <div className="progress-meta">
            <span className="question-count">{currentQuestion + 1} / {shuffledQuestions.length}</span>
            <span className="quiz-label">TECVİD QUİZ</span>
        </div>
      </div>

      <div className="settings-card" style={{ flexDirection: 'column', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div className="settings-icon-box" style={{ width: '40px', height: '40px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--nav-accent)' }}>
            <HelpCircle size={20} />
          </div>
          <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {t('tajweedQuiz.questionLabel', {
              number: currentQuestion + 1,
              defaultValue: 'SORU {{number}}'
            })}
          </h3>
        </div>
        
        <p style={{ margin: '0 0 24px 0', fontSize: '1.25rem', fontWeight: '800', color: 'var(--nav-text)', lineHeight: '1.5' }}>
            {question.question}
        </p>
        
        {question.ayah && (
          <div className="ayah-display">
            {question.ayah}
          </div>
        )}

        <div className="options-list">
          {question.options.map((option, index) => {
            let status = '';
            if (selectedOption !== null) {
              if (index === question.correctAnswer) status = 'correct';
              else if (index === selectedOption) status = 'wrong';
            }

            return (
              <button 
                key={index}
                className={`velocity-option-btn ${selectedOption === index ? 'selected' : ''} ${status}`}
                onClick={() => handleOptionClick(index)}
                disabled={selectedOption !== null}
              >
                <div className="option-index">{String.fromCharCode(65 + index)}</div>
                <div className="option-text">{option}</div>
                {status === 'correct' && <Check size={18} className="status-indicator" />}
                {status === 'wrong' && <X size={18} className="status-indicator" />}
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <div className="explanation-area reveal-stagger">
            <div className="explanation-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Info size={16} color="var(--nav-accent)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase' }}>
                        {t('tajweedQuiz.explanation', 'Açıklama')}
                    </span>
                </div>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600', lineHeight: '1.5' }}>
                    {question.explanation}
                </p>
                <button className="velocity-btn-primary" onClick={nextQuestion} style={{ width: '100%', padding: '14px' }}>
                {currentQuestion < shuffledQuestions.length - 1
                    ? t('tajweedQuiz.actions.nextQuestion', 'Sıradaki Soru')
                    : t('tajweedQuiz.actions.showResults', 'Sonuçları Gör')}
                <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .quiz-container { padding: 4px; }
        
        .quiz-progress-section { margin-bottom: 24px; }
        
        .velocity-progress-track {
            height: 6px;
            background: var(--nav-hover);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 8px;
        }

        .velocity-progress-fill {
            height: 100%;
            background: var(--nav-accent);
            box-shadow: 0 0 10px rgba(79, 70, 229, 0.4);
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .question-count { font-size: 0.8rem; font-weight: 950; color: var(--nav-text); }
        .quiz-label { font-size: 0.7rem; font-weight: 800; color: var(--nav-text-muted); letter-spacing: 1px; }

        .ayah-display {
            font-family: var(--arabic-font-family);
            font-size: 2.25rem;
            text-align: center;
            padding: 24px;
            background: var(--nav-hover);
            border: 1px solid var(--nav-border);
            border-radius: 16px;
            margin-bottom: 24px;
            color: var(--nav-accent);
            line-height: 1.6;
        }

        .options-list { display: flex; flex-direction: column; gap: 12px; }

        .velocity-option-btn {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: var(--nav-bg);
            border: 1px solid var(--nav-border);
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: left;
        }

        .velocity-option-btn:hover:not(:disabled) {
            border-color: var(--nav-accent);
            background: var(--nav-hover);
            transform: translateX(4px);
        }

        .velocity-option-btn.selected {
            border-width: 2px;
            border-color: var(--nav-accent);
            background: rgba(79, 70, 229, 0.05);
        }

        .option-index {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--nav-hover);
            border-radius: 8px;
            font-weight: 950;
            color: var(--nav-text);
            font-size: 0.85rem;
        }

        .option-text { flex: 1; font-size: 0.95rem; font-weight: 700; color: var(--nav-text); }

        .velocity-option-btn.correct { background: rgba(16, 185, 129, 0.1); border-color: #10b981; }
        .velocity-option-btn.wrong { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }
        
        .status-indicator { margin-left: auto; }
        .velocity-option-btn.correct .status-indicator { color: #10b981; }
        .velocity-option-btn.wrong .status-indicator { color: #ef4444; }

        .explanation-area { margin-top: 24px; }
        
        .explanation-card {
            padding: 20px;
            background: var(--nav-hover);
            border-radius: 16px;
            border: 1px solid var(--nav-border);
        }

        /* Results */
        .quiz-result { padding: 4px; display: flex; align-items: center; justify-content: center; min-height: 60vh; }
        
        .trophy-pulse {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(212, 175, 55, 0.2);
            border-radius: 30px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.5; }
            100% { transform: scale(1.4); opacity: 0; }
        }

        .score-container {
            margin-bottom: 32px;
            padding: 24px;
            background: var(--nav-hover);
            border-radius: 20px;
            border: 1px solid var(--nav-border);
        }

        .score-main { display: flex; align-items: baseline; justify-content: center; gap: 4px; }
        .score-value { font-size: 4rem; font-weight: 950; color: var(--nav-accent); }
        .score-total { font-size: 1.5rem; font-weight: 800; color: var(--nav-text-muted); }
        .score-label { font-size: 0.7rem; font-weight: 950; color: var(--nav-text-muted); letter-spacing: 1px; }

        .velocity-btn-primary {
            background: var(--nav-accent);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 0.95rem;
            font-weight: 950;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .velocity-btn-primary:active { transform: scale(0.97); }
      `}</style>
    </div>
  );
};

export default TajweedQuiz;
