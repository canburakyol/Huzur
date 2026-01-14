import { useState } from 'react';
import { BookOpen, Volume2, Clock, Award, AlertTriangle, HelpCircle, ChevronRight, ChevronDown, Check, X } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import {
    PRAYER_STEPS,
    RECITATIONS,
    PRAYER_TYPES,
    RELIGIOUS_TERMS,
    PRAYER_INVALIDATORS,
    QUIZ_QUESTIONS
} from '../data/prayerTeacherData';

// Tab configuration
const TABS = [
    { id: 'steps', icon: '📿', label: 'Adımlar' },
    { id: 'recitations', icon: '🎧', label: 'Okunuşlar' },
    { id: 'types', icon: '🕐', label: 'Vakit' },
    { id: 'terms', icon: '📋', label: 'Hükümler' },
    { id: 'invalidators', icon: '⚠️', label: 'Bozanlar' },
    { id: 'quiz', icon: '❓', label: 'Quiz' },
];

function PrayerTeacher({ onClose }) {
    const [activeTab, setActiveTab] = useState('steps');
    const [expandedStep, setExpandedStep] = useState(null);
    const [expandedRecitation, setExpandedRecitation] = useState(null);
    const [expandedPrayer, setExpandedPrayer] = useState(null);
    const [expandedTerm, setExpandedTerm] = useState(null);

    // Quiz state
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    const handleAnswer = (index) => {
        setSelectedAnswer(index);
        setShowResult(true);
        if (index === QUIZ_QUESTIONS[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            setQuizFinished(true);
        }
    };

    const resetQuiz = () => {
        setQuizStarted(false);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setQuizFinished(false);
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingTop: '20px'
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    📿 Namaz Hocası
                </h1>
            </div>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '12px',
                marginBottom: '16px',
                WebkitOverflowScrolling: 'touch'
            }}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '10px 14px',
                            background: activeTab === tab.id ? 'var(--primary-color)' : 'var(--glass-bg)',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-color)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            minWidth: '70px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                        <span style={{ fontSize: '11px', fontWeight: '600' }}>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>

                {/* STEPS TAB */}
                {activeTab === 'steps' && (
                    <div>
                        <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                            Namazın adımlarını öğrenmek için aşağıdaki kartlara tıklayın.
                        </p>
                        {PRAYER_STEPS.map(step => (
                            <div
                                key={step.id}
                                className="glass-card"
                                style={{ marginBottom: '12px', padding: '16px', cursor: 'pointer' }}
                                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '32px' }}>{step.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '16px' }}>
                                            {step.id}. {step.name}
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-color-muted)' }}>
                                            {step.description}
                                        </div>
                                    </div>
                                    {expandedStep === step.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </div>
                                {expandedStep === step.id && (
                                    <div style={{
                                        marginTop: '12px',
                                        paddingTop: '12px',
                                        borderTop: '1px solid var(--glass-border)',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        color: 'var(--text-color)'
                                    }}>
                                        {step.detail}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* RECITATIONS TAB */}
                {activeTab === 'recitations' && (
                    <div>
                        <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                            Namazda okunan dualar ve sureler.
                        </p>
                        {RECITATIONS.map(rec => (
                            <div
                                key={rec.id}
                                className="glass-card"
                                style={{ marginBottom: '12px', padding: '16px', cursor: 'pointer' }}
                                onClick={() => setExpandedRecitation(expandedRecitation === rec.id ? null : rec.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '16px' }}>
                                        {rec.name}
                                    </div>
                                    {expandedRecitation === rec.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </div>
                                {expandedRecitation === rec.id && (
                                    <div style={{ marginTop: '16px' }}>
                                        <div style={{
                                            fontFamily: "'Amiri', serif",
                                            fontSize: '22px',
                                            textAlign: 'right',
                                            direction: 'rtl',
                                            lineHeight: '2',
                                            color: 'var(--primary-color)',
                                            marginBottom: '12px',
                                            padding: '12px',
                                            background: 'rgba(212, 175, 55, 0.1)',
                                            borderRadius: '8px'
                                        }}>
                                            {rec.arabic}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            fontStyle: 'italic',
                                            color: 'var(--text-color)',
                                            marginBottom: '8px',
                                            padding: '8px',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '8px'
                                        }}>
                                            <strong>Okunuşu:</strong> {rec.latin}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: 'var(--text-color-muted)',
                                            lineHeight: '1.6'
                                        }}>
                                            <strong>Anlamı:</strong> {rec.meaning}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* PRAYER TYPES TAB */}
                {activeTab === 'types' && (
                    <div>
                        <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                            5 vakit namazın rekat sayıları ve detayları.
                        </p>
                        {PRAYER_TYPES.map(prayer => (
                            <div
                                key={prayer.id}
                                className="glass-card"
                                style={{ marginBottom: '12px', padding: '16px', cursor: 'pointer' }}
                                onClick={() => setExpandedPrayer(expandedPrayer === prayer.id ? null : prayer.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '32px' }}>{prayer.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '16px' }}>
                                            {prayer.name}
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-color-muted)' }}>
                                            Toplam: {prayer.totalRakat} rekat
                                        </div>
                                    </div>
                                    {expandedPrayer === prayer.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </div>
                                {expandedPrayer === prayer.id && (
                                    <div style={{ marginTop: '16px' }}>
                                        {prayer.details.map((detail, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '10px',
                                                    background: detail.type === 'Farz' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
                                                    borderRadius: '8px',
                                                    marginBottom: '8px'
                                                }}
                                            >
                                                <div>
                                                    <span style={{
                                                        fontWeight: '600',
                                                        color: detail.type === 'Farz' ? 'var(--primary-color)' : 'var(--text-color)'
                                                    }}>
                                                        {detail.type}
                                                    </span>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>
                                                        {detail.description}
                                                    </div>
                                                </div>
                                                <span style={{
                                                    fontSize: '18px',
                                                    fontWeight: '700',
                                                    color: 'var(--primary-color)'
                                                }}>
                                                    {detail.rakat}
                                                </span>
                                            </div>
                                        ))}
                                        <div style={{
                                            marginTop: '12px',
                                            padding: '10px',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            color: 'var(--text-color-muted)',
                                            fontStyle: 'italic'
                                        }}>
                                            💡 {prayer.note}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* RELIGIOUS TERMS TAB */}
                {activeTab === 'terms' && (
                    <div>
                        <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                            Dini hükümler ve anlamları.
                        </p>
                        {RELIGIOUS_TERMS.map(term => (
                            <div
                                key={term.id}
                                className="glass-card"
                                style={{ marginBottom: '12px', padding: '16px', cursor: 'pointer' }}
                                onClick={() => setExpandedTerm(expandedTerm === term.id ? null : term.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '28px' }}>{term.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '16px' }}>
                                            {term.name}
                                        </div>
                                    </div>
                                    {expandedTerm === term.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </div>
                                {expandedTerm === term.id && (
                                    <div style={{ marginTop: '12px' }}>
                                        <p style={{ fontSize: '14px', color: 'var(--text-color)', lineHeight: '1.6', marginBottom: '12px' }}>
                                            {term.description}
                                        </p>
                                        <div style={{ fontSize: '13px', color: 'var(--text-color-muted)' }}>
                                            <strong>Örnekler:</strong>
                                            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                                                {term.examples.map((ex, i) => (
                                                    <li key={i} style={{ marginBottom: '4px' }}>{ex}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* INVALIDATORS TAB */}
                {activeTab === 'invalidators' && (
                    <div>
                        <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                            Namazı bozan durumlar listesi.
                        </p>
                        <div className="glass-card" style={{ padding: '16px' }}>
                            {PRAYER_INVALIDATORS.map((item, i) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        borderRadius: '8px'
                                    }}
                                >
                                    <span style={{ fontSize: '24px' }}>{item.icon}</span>
                                    <span style={{ fontSize: '14px', color: 'var(--text-color)' }}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* QUIZ TAB */}
                {activeTab === 'quiz' && (
                    <div>
                        {!quizStarted ? (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎓</div>
                                <h2 style={{ color: 'var(--primary-color)', marginBottom: '12px' }}>Namaz Bilgi Yarışması</h2>
                                <p style={{ color: 'var(--text-color-muted)', marginBottom: '24px', fontSize: '14px' }}>
                                    {QUIZ_QUESTIONS.length} soru ile bilginizi test edin!
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setQuizStarted(true)}
                                    style={{ maxWidth: '200px' }}
                                >
                                    Başla
                                </button>
                            </div>
                        ) : quizFinished ? (
                            <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                                    {score >= QUIZ_QUESTIONS.length * 0.7 ? '🏆' : score >= QUIZ_QUESTIONS.length * 0.5 ? '👍' : '📚'}
                                </div>
                                <h2 style={{ color: 'var(--primary-color)', marginBottom: '12px' }}>Quiz Tamamlandı!</h2>
                                <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '8px' }}>
                                    {score} / {QUIZ_QUESTIONS.length}
                                </div>
                                <p style={{ color: 'var(--text-color-muted)', marginBottom: '24px', fontSize: '14px' }}>
                                    {score >= QUIZ_QUESTIONS.length * 0.7 ? 'Harika! Çok iyi biliyorsunuz!' :
                                        score >= QUIZ_QUESTIONS.length * 0.5 ? 'İyi! Biraz daha çalışabilirsiniz.' :
                                            'Tekrar çalışmanız önerilir.'}
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={resetQuiz}
                                    style={{ maxWidth: '200px' }}
                                >
                                    Tekrar Dene
                                </button>
                            </div>
                        ) : (
                            <div className="glass-card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ color: 'var(--text-color-muted)', fontSize: '14px' }}>
                                        Soru {currentQuestion + 1}/{QUIZ_QUESTIONS.length}
                                    </span>
                                    <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                                        Puan: {score}
                                    </span>
                                </div>
                                <h3 style={{ color: 'var(--text-color)', marginBottom: '20px', fontSize: '16px', lineHeight: '1.5' }}>
                                    {QUIZ_QUESTIONS[currentQuestion].question}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {QUIZ_QUESTIONS[currentQuestion].options.map((option, i) => (
                                        <button
                                            key={i}
                                            onClick={() => !showResult && handleAnswer(i)}
                                            disabled={showResult}
                                            style={{
                                                padding: '14px 16px',
                                                background: showResult
                                                    ? i === QUIZ_QUESTIONS[currentQuestion].correctAnswer
                                                        ? 'rgba(46, 204, 113, 0.3)'
                                                        : i === selectedAnswer
                                                            ? 'rgba(231, 76, 60, 0.3)'
                                                            : 'var(--glass-bg)'
                                                    : 'var(--glass-bg)',
                                                border: showResult
                                                    ? i === QUIZ_QUESTIONS[currentQuestion].correctAnswer
                                                        ? '2px solid #2ecc71'
                                                        : i === selectedAnswer
                                                            ? '2px solid #e74c3c'
                                                            : '1px solid var(--glass-border)'
                                                    : '1px solid var(--glass-border)',
                                                borderRadius: '10px',
                                                textAlign: 'left',
                                                cursor: showResult ? 'default' : 'pointer',
                                                color: 'var(--text-color)',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <span>{option}</span>
                                            {showResult && i === QUIZ_QUESTIONS[currentQuestion].correctAnswer && (
                                                <Check size={20} color="#2ecc71" />
                                            )}
                                            {showResult && i === selectedAnswer && i !== QUIZ_QUESTIONS[currentQuestion].correctAnswer && (
                                                <X size={20} color="#e74c3c" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {showResult && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={nextQuestion}
                                        style={{ marginTop: '20px' }}
                                    >
                                        {currentQuestion < QUIZ_QUESTIONS.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PrayerTeacher;
