import { useState } from 'react';
import { HelpCircle, Check, X, ArrowRight, RotateCcw, Trophy, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tajweedQuizData } from '../data/tajweedQuizData';

const TajweedQuiz = ({ onBack }) => {
  const { t } = useTranslation();
  const [shuffledQuestions] = useState(() => [...tajweedQuizData].sort(() => 0.5 - Math.random()).slice(0, 5));
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
    window.location.reload(); // Simplest way to reshuffle for now or we could manage it with state
  };

  if (shuffledQuestions.length === 0) return null;

  if (quizFinished) {
    return (
      <div className="quiz-result animate-slideUp">
        <div className="result-card glass-card">
          <Trophy size={64} color="#FBBF24" style={{ marginBottom: '16px' }} />
          <h2>{t('tajweedQuiz.resultTitle', 'Tebrikler!')}</h2>
          <p>{t('tajweedQuiz.resultSubtitle', "Tecvid Quiz'ini tamamladınız.")}</p>
          <div className="score-badge">
            <span className="score-num">{score}</span>
            <span className="total-num">/ {shuffledQuestions.length}</span>
          </div>
          <p className="score-text">
            {score === shuffledQuestions.length
              ? t('tajweedQuiz.feedback.excellent', 'Harika! Tecvid kurallarına hakimsin.')
              : score >= 3
                ? t('tajweedQuiz.feedback.good', 'Güzel bir başlangıç, biraz daha pratikle mükemmelleşebilirsin.')
                : t('tajweedQuiz.feedback.retry', 'Dersleri tekrar gözden geçirmeye ne dersin?')}
          </p>
          
          <div className="result-actions">
            <button className="reset-btn" onClick={() => resetQuiz()}>
              <RotateCcw size={20} /> {t('tajweedQuiz.actions.restart', 'Yeniden Başla')}
            </button>
            <button className="finish-btn" onClick={onBack}>
              {t('tajweedQuiz.actions.backToMenu', 'Ana Menüye Dön')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = shuffledQuestions[currentQuestion];

  return (
    <div className="quiz-container animate-slideUp">
      <div className="quiz-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
          />
        </div>
        <span className="progress-text">{currentQuestion + 1} / {shuffledQuestions.length}</span>
      </div>

      <div className="question-card glass-card">
        <div className="question-header">
          <HelpCircle size={24} color="var(--primary-color)" />
          <h3>
            {t('tajweedQuiz.questionLabel', {
              number: currentQuestion + 1,
              defaultValue: 'Soru {{number}}'
            })}
          </h3>
        </div>
        
        <p className="question-text">{question.question}</p>
        
        {question.ayah && (
          <div className="question-ayah">{question.ayah}</div>
        )}

        <div className="options-grid">
          {question.options.map((option, index) => {
            let status = '';
            if (selectedOption !== null) {
              if (index === question.correctAnswer) status = 'correct';
              else if (index === selectedOption) status = 'wrong';
            }

            return (
              <button 
                key={index}
                className={`option-btn ${selectedOption === index ? 'selected' : ''} ${status}`}
                onClick={() => handleOptionClick(index)}
                disabled={selectedOption !== null}
              >
                <span className="option-label">{String.fromCharCode(65 + index)}</span>
                <span className="option-content">{option}</span>
                {status === 'correct' && <Check size={18} className="status-icon" />}
                {status === 'wrong' && <X size={18} className="status-icon" />}
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <div className="explanation-box animate-fadeIn">
            <div className="explanation-header">
              <Info size={16} />
              <span>{t('tajweedQuiz.explanation', 'Açıklama')}</span>
            </div>
            <p>{question.explanation}</p>
            <button className="next-btn" onClick={nextQuestion}>
              {currentQuestion < shuffledQuestions.length - 1
                ? t('tajweedQuiz.actions.nextQuestion', 'Sıradaki Soru')
                : t('tajweedQuiz.actions.showResults', 'Sonuçları Gör')}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .quiz-container { padding: 16px; }
        
        .quiz-progress { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .progress-bar { flex: 1; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary-color); transition: width 0.3s ease; }
        .progress-text { font-size: 12px; color: var(--text-color-muted); font-weight: 600; }

        .question-card { padding: 24px; }
        .question-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .question-header h3 { margin: 0; font-size: 14px; color: var(--primary-color); text-transform: uppercase; }
        
        .question-text { font-size: 18px; line-height: 1.5; margin-bottom: 20px; color: var(--text-color); }
        .question-ayah { 
            font-family: var(--arabic-font-family); font-size: 32px; text-align: center;
            padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px;
            margin-bottom: 24px; color: var(--primary-color);
        }

        .options-grid { display: flex; flex-direction: column; gap: 12px; }
        .option-btn {
          padding: 16px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02); color: var(--text-color);
          display: flex; align-items: center; gap: 12px; cursor: pointer;
          transition: all 0.2s ease; text-align: left;
        }

        .option-btn:hover:not(:disabled) { background: rgba(255,255,255,0.05); border-color: var(--primary-color); }
        .option-btn.selected { border-color: var(--primary-color); background: rgba(var(--primary-rgb), 0.1); }
        
        .option-label { 
            width: 28px; height: 28px; border-radius: 6px; background: rgba(255,255,255,0.1);
            display: flex; align-items: center; justifyContent: center; font-weight: bold; font-size: 14px;
        }

        .option-content { flex: 1; font-size: 15px; }
        
        .option-btn.correct { background: rgba(16, 185, 129, 0.1); border-color: #10B981; }
        .option-btn.wrong { background: rgba(239, 68, 68, 0.1); border-color: #EF4444; }
        .status-icon { margin-left: auto; }
        
        .explanation-box { margin-top: 24px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 12px; }
        .explanation-header { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: bold; color: var(--primary-color); margin-bottom: 8px; }
        .explanation-box p { font-size: 13px; color: var(--text-color-muted); margin: 0 0 16px 0; line-height: 1.5; }

        .next-btn {
          width: 100%; padding: 12px; background: var(--primary-color); color: white;
          border: none; border-radius: 10px; font-weight: 600; display: flex; align-items: center; justifyContent: center; gap: 8px; cursor: pointer;
        }

        /* Result Card */
        .quiz-result { padding: 16px; display: flex; align-items: center; justifyContent: center; min-height: 60vh; }
        .result-card { padding: 40px; text-align: center; }
        .score-badge { display: flex; align-items: baseline; justifyContent: center; gap: 4px; margin: 20px 0; }
        .score-num { font-size: 48px; font-weight: 800; color: var(--primary-color); }
        .total-num { font-size: 24px; color: var(--text-color-muted); }
        .score-text { font-size: 15px; color: var(--text-color-muted); margin-bottom: 32px; line-height: 1.6; }
        
        .result-actions { display: flex; flex-direction: column; gap: 12px; }
        .reset-btn { padding: 14px; border-radius: 12px; border: 2px solid var(--primary-color); color: var(--primary-color); background: transparent; font-weight: bold; cursor: pointer; display: flex; align-items: center; justifyContent: center; gap: 8px; }
        .finish-btn { padding: 14px; border-radius: 12px; background: var(--primary-color); color: white; border: none; font-weight: bold; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default TajweedQuiz;
