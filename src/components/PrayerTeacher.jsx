import { useState } from 'react';
import { BookOpen, Volume2, Clock, Award, AlertTriangle, HelpCircle, ChevronRight, ChevronDown, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
        <div className="settings-container reveal-stagger" style={{ paddingBottom: '100px' }}>
            {/* Header - Velocity Style */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    color: 'var(--nav-text)',
                    fontWeight: '950'
                }}>
                    {t('prayerTeacher.title', 'Namaz Hocası')}
                </h2>
            </div>

            {/* Tab Navigation - Modern Sticky Style */}
            <div style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                padding: '4px',
                marginBottom: '24px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none'
            }} className="no-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="settings-card premium-glass hover-lift"
                        style={{
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '12px 16px',
                            background: activeTab === tab.id ? 'var(--nav-accent)' : 'var(--nav-hover)',
                            color: activeTab === tab.id ? 'white' : 'var(--nav-text)',
                            border: '1px solid var(--nav-border)',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            minWidth: '85px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            flex: '0 0 auto'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>{tab.icon}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>

                {/* STEPS TAB */}
                {activeTab === 'steps' && (
                    <div className="reveal-stagger">
                        <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600', padding: '0 4px' }}>
                            {t('prayerTeacher.stepsDescription', 'Namazın adımlarını öğrenmek için aşağıdaki kartlara tıklayın.')}
                        </p>
                        {PRAYER_STEPS.map((step, index) => (
                            <div
                                key={step.id}
                                className="settings-card reveal-stagger premium-glass hover-lift"
                                style={{ 
                                    marginBottom: '12px', 
                                    padding: '20px', 
                                    cursor: 'pointer',
                                    '--delay': `${index * 0.05}s`,
                                    flexDirection: 'column',
                                    alignItems: 'stretch'
                                }}
                                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div className="settings-icon-box" style={{ 
                                        width: '48px', height: '48px', 
                                        background: 'var(--nav-hover)',
                                        borderRadius: '14px',
                                        fontSize: '1.5rem'
                                    }}>
                                        {step.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '1.05rem' }}>
                                            {step.id}. {step.name}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                                            {step.description}
                                        </div>
                                    </div>
                                    <div style={{ color: expandedStep === step.id ? 'var(--nav-accent)' : 'var(--nav-text-muted)' }}>
                                        {expandedStep === step.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    </div>
                                </div>
                                {expandedStep === step.id && (
                                    <div className="reveal-stagger" style={{
                                        marginTop: '16px',
                                        padding: '16px',
                                        background: 'var(--nav-hover)',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        color: 'var(--nav-text)',
                                        fontWeight: '500',
                                        borderLeft: '4px solid var(--nav-accent)'
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
                    <div className="reveal-stagger">
                        <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                            {t('prayerTeacher.recitationsDescription', 'Namazda okunan dualar ve sureler.')}
                        </p>
                        {RECITATIONS.map((rec, index) => (
                            <div
                                key={rec.id}
                                className="settings-card reveal-stagger premium-glass hover-lift"
                                style={{ 
                                    marginBottom: '12px', 
                                    padding: '20px', 
                                    cursor: 'pointer',
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    '--delay': `${index * 0.05}s`
                                }}
                                onClick={() => setExpandedRecitation(expandedRecitation === rec.id ? null : rec.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '1.05rem' }}>
                                        {rec.name}
                                    </div>
                                    <div style={{ color: expandedRecitation === rec.id ? 'var(--nav-accent)' : 'var(--nav-text-muted)' }}>
                                        {expandedRecitation === rec.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    </div>
                                </div>
                                {expandedRecitation === rec.id && (
                                    <div className="reveal-stagger" style={{ marginTop: '20px' }}>
                                        <div style={{
                                            fontFamily: "var(--arabic-font-family)",
                                            fontSize: '1.75rem',
                                            textAlign: 'right',
                                            direction: 'rtl',
                                            lineHeight: '2',
                                            color: 'var(--nav-accent)',
                                            marginBottom: '16px',
                                            padding: '20px',
                                            background: 'var(--nav-hover)',
                                            borderRadius: '16px',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            {rec.arabic}
                                        </div>
                                        <div style={{
                                            fontSize: '0.95rem',
                                            color: 'var(--nav-text)',
                                            marginBottom: '10px',
                                            padding: '12px 16px',
                                            background: 'var(--nav-hover)',
                                            borderRadius: '12px',
                                            fontWeight: '600'
                                        }}>
                                            <strong style={{ color: 'var(--nav-accent)', marginRight: '8px' }}>{t('prayerTeacher.labels.pronunciation', 'Okunuşu')}:</strong> {rec.latin}
                                        </div>
                                        <div style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--nav-text-muted)',
                                            lineHeight: '1.6',
                                            padding: '12px 16px',
                                            fontWeight: '500'
                                        }}>
                                            <strong style={{ color: 'var(--nav-text)', marginRight: '8px' }}>{t('prayerTeacher.labels.meaning', 'Anlamı')}:</strong> {rec.meaning}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* PRAYER TYPES TAB */}
                {activeTab === 'types' && (
                    <div className="reveal-stagger">
                        <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                            {t('prayerTeacher.typesDescription', '5 vakit namazın rekat sayıları ve detayları.')}
                        </p>
                        {PRAYER_TYPES.map((prayer, index) => (
                            <div
                                key={prayer.id}
                                className="settings-card reveal-stagger premium-glass hover-lift"
                                style={{ 
                                    marginBottom: '16px', 
                                    padding: '20px', 
                                    cursor: 'pointer',
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    '--delay': `${index * 0.05}s`
                                }}
                                onClick={() => setExpandedPrayer(expandedPrayer === prayer.id ? null : prayer.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div className="settings-icon-box" style={{ 
                                        width: '48px', height: '48px', 
                                        background: 'var(--nav-hover)',
                                        fontSize: '1.5rem',
                                        borderRadius: '14px'
                                    }}>
                                        {prayer.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '950', color: 'var(--nav-text)', fontSize: '1.1rem' }}>
                                            {prayer.name}
                                        </div>
                                        <div className="hamburger-level-badge" style={{ 
                                            marginTop: '4px',
                                            background: 'var(--nav-accent)', color: 'white',
                                            fontSize: '0.7rem'
                                        }}>
                                            {t('prayerTeacher.totalRakat', {
                                                count: prayer.totalRakat,
                                                defaultValue: 'Toplam: {{count}} rekat'
                                            })}
                                        </div>
                                    </div>
                                    <div style={{ color: expandedPrayer === prayer.id ? 'var(--nav-accent)' : 'var(--nav-text-muted)' }}>
                                        {expandedPrayer === prayer.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    </div>
                                </div>
                                {expandedPrayer === prayer.id && (
                                    <div className="reveal-stagger" style={{ marginTop: '20px' }}>
                                        {prayer.details.map((detail, i) => (
                                            <div
                                                key={i}
                                                className="settings-card premium-glass hover-lift"
                                                style={{
                                                    justifyContent: 'space-between',
                                                    padding: '14px 18px',
                                                    background: detail.type === 'Farz' ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.08)' : 'var(--nav-hover)',
                                                    border: detail.type === 'Farz' ? '1px solid var(--nav-accent)' : '1px solid var(--nav-border)',
                                                    marginBottom: '8px',
                                                    borderRadius: '12px'
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <span style={{
                                                        fontWeight: '900',
                                                        fontSize: '0.95rem',
                                                        color: detail.type === 'Farz' ? 'var(--nav-accent)' : 'var(--nav-text)'
                                                    }}>
                                                        {detail.type}
                                                    </span>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                                                        {detail.description}
                                                    </div>
                                                </div>
                                                <div className="settings-icon-box" style={{
                                                    width: '36px', height: '36px',
                                                    background: detail.type === 'Farz' ? 'var(--nav-accent)' : 'var(--nav-text-muted)',
                                                    color: 'white',
                                                    fontWeight: '950',
                                                    fontSize: '1.1rem',
                                                    borderRadius: '10px'
                                                }}>
                                                    {detail.rakat}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="settings-card premium-glass hover-lift" style={{
                                            marginTop: '12px',
                                            padding: '16px',
                                            background: 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.05)',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            color: 'var(--nav-text-muted)',
                                            fontWeight: '700',
                                            border: 'none',
                                            display: 'flex',
                                            gap: '12px',
                                            alignItems: 'start'
                                        }}>
                                            <Sparkles size={18} style={{ color: 'var(--nav-accent)', marginTop: '2px', flexShrink: 0 }} />
                                            <span>{prayer.note}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* RELIGIOUS TERMS TAB */}
                {activeTab === 'terms' && (
                    <div className="reveal-stagger">
                        <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                            {t('prayerTeacher.termsDescription', 'Dini hükümler ve anlamları.')}
                        </p>
                        {RELIGIOUS_TERMS.map((term, index) => (
                            <div
                                key={term.id}
                                className="settings-card reveal-stagger premium-glass hover-lift"
                                style={{ 
                                    marginBottom: '12px', 
                                    padding: '20px', 
                                    cursor: 'pointer',
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    '--delay': `${index * 0.05}s`
                                }}
                                onClick={() => setExpandedTerm(expandedTerm === term.id ? null : term.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div className="settings-icon-box" style={{ 
                                        width: '44px', height: '44px', 
                                        background: 'var(--nav-hover)',
                                        fontSize: '1.25rem',
                                        borderRadius: '12px'
                                    }}>
                                        {term.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '1.05rem' }}>
                                            {term.name}
                                        </div>
                                    </div>
                                    <div style={{ color: expandedTerm === term.id ? 'var(--nav-accent)' : 'var(--nav-text-muted)' }}>
                                        {expandedTerm === term.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    </div>
                                </div>
                                {expandedTerm === term.id && (
                                    <div className="reveal-stagger" style={{ marginTop: '16px' }}>
                                        <p style={{ 
                                            fontSize: '0.95rem', 
                                            color: 'var(--nav-text)', 
                                            lineHeight: '1.6', 
                                            marginBottom: '16px',
                                            padding: '16px',
                                            background: 'var(--nav-hover)',
                                            borderRadius: '12px',
                                            fontWeight: '500'
                                        }}>
                                            {term.description}
                                        </p>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--nav-text-muted)', padding: '0 8px' }}>
                                            <strong style={{ color: 'var(--nav-text)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>{t('prayerTeacher.labels.examples', 'Örnekler')}:</strong>
                                            <ul style={{ paddingLeft: '12px', marginTop: '12px', listStyleType: 'none' }}>
                                                {term.examples.map((ex, i) => (
                                                    <li key={i} style={{ 
                                                        marginBottom: '8px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '10px',
                                                        fontWeight: '600'
                                                    }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--nav-accent)' }} />
                                                        {ex}
                                                    </li>
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
                    <div className="reveal-stagger">
                        <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                            {t('prayerTeacher.invalidatorsDescription', 'Namazı bozan durumlar listesi.')}
                        </p>
                        <div className="settings-card reveal-stagger premium-glass hover-lift" style={{ padding: '8px', flexDirection: 'column', alignItems: 'stretch' }}>
                            {PRAYER_INVALIDATORS.map((item, i) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px',
                                        background: i % 2 === 0 ? 'var(--nav-hover)' : 'transparent',
                                        borderRadius: '12px',
                                        '--delay': `${i * 0.03}s`
                                    }}
                                    className="reveal-stagger"
                                >
                                    <div className="settings-icon-box" style={{ 
                                        width: '36px', height: '36px', 
                                        background: i % 2 === 0 ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1)' : 'var(--nav-hover)',
                                        fontSize: '1.2rem',
                                        borderRadius: '10px'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--nav-text)', fontWeight: '600' }}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* QUIZ TAB */}
                {activeTab === 'quiz' && (
                    <div className="reveal-stagger">
                        {!quizStarted ? (
                            <div className="settings-card premium-glass hover-lift" style={{ textAlign: 'center', padding: '60px 24px', flexDirection: 'column', gap: '20px' }}>
                                <div className="settings-icon-box pulse" style={{ 
                                    width: '100px', height: '100px', 
                                    background: 'var(--nav-hover)',
                                    color: 'var(--nav-accent)',
                                    margin: '0 auto',
                                    fontSize: '4rem',
                                    borderRadius: '30px'
                                }}>🎓</div>
                                <h2 style={{ color: 'var(--nav-text)', marginBottom: '8px', fontSize: '1.5rem', fontWeight: '950' }}>{t('prayerTeacher.quiz.title', 'Namaz Bilgi Yarışması')}</h2>
                                <p style={{ color: 'var(--nav-text-muted)', marginBottom: '32px', fontSize: '0.95rem', fontWeight: '600' }}>
                                    {t('prayerTeacher.quiz.intro', {
                                        count: QUIZ_QUESTIONS.length,
                                        defaultValue: '{{count}} soru ile bilginizi test edin!'
                                    })}
                                </p>
                                <button
                                    className="velocity-target-btn"
                                    onClick={() => setQuizStarted(true)}
                                    style={{ width: '100%', justifyContent: 'center', background: 'var(--nav-accent)', color: 'white' }}
                                >
                                    {t('prayerTeacher.quiz.start', 'Başla')}
                                </button>
                            </div>
                        ) : quizFinished ? (
                            <div className="settings-card premium-glass hover-lift" style={{ textAlign: 'center', padding: '60px 24px', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ fontSize: '5rem', marginBottom: '8px' }}>
                                    {score >= QUIZ_QUESTIONS.length * 0.7 ? '🏆' : score >= QUIZ_QUESTIONS.length * 0.5 ? '👍' : '📚'}
                                </div>
                                <h2 style={{ color: 'var(--nav-text)', marginBottom: '8px', fontSize: '1.5rem', fontWeight: '950' }}>{t('prayerTeacher.quiz.finished', 'Quiz Tamamlandı!')}</h2>
                                <div className="settings-icon-box" style={{
                                    width: 'fit-content', padding: '12px 32px', borderRadius: '20px',
                                    background: 'var(--nav-accent)', color: 'white',
                                    margin: '0 auto 16px', fontWeight: '950', fontSize: '2.5rem'
                                }}>
                                    {score} / {QUIZ_QUESTIONS.length}
                                </div>
                                <p style={{ color: 'var(--nav-text-muted)', marginBottom: '32px', fontSize: '1rem', fontWeight: '600' }}>
                                    {score >= QUIZ_QUESTIONS.length * 0.7
                                        ? t('prayerTeacher.quiz.feedback.excellent', 'Harika! Çok iyi biliyorsunuz!')
                                        : score >= QUIZ_QUESTIONS.length * 0.5
                                            ? t('prayerTeacher.quiz.feedback.good', 'İyi! Biraz daha çalışabilirsiniz.')
                                            : t('prayerTeacher.quiz.feedback.retry', 'Tekrar çalışmanız önerilir.')}
                                </p>
                                <button
                                    className="velocity-target-btn"
                                    onClick={resetQuiz}
                                    style={{ width: '100%', justifyContent: 'center', background: 'var(--nav-accent)', color: 'white' }}
                                >
                                    {t('prayerTeacher.quiz.retry', 'Tekrar Dene')}
                                </button>
                            </div>
                        ) : (
                            <div className="settings-card premium-glass hover-lift" style={{ padding: '32px 24px', flexDirection: 'column', alignItems: 'stretch' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                                    <div className="hamburger-level-badge" style={{ background: 'var(--nav-hover)', color: 'var(--nav-text-muted)' }}>
                                        {t('prayerTeacher.quiz.questionCounter', {
                                            current: currentQuestion + 1,
                                            total: QUIZ_QUESTIONS.length,
                                            defaultValue: 'Soru {{current}}/{{total}}'
                                        })}
                                    </div>
                                    <div className="hamburger-level-badge" style={{ background: 'var(--nav-accent)', color: 'white' }}>
                                        {t('prayerTeacher.quiz.score', {
                                            score,
                                            defaultValue: 'Puan: {{score}}'
                                        })}
                                    </div>
                                </div>
                                <h3 style={{ color: 'var(--nav-text)', marginBottom: '32px', fontSize: '1.15rem', fontWeight: '950', lineHeight: '1.5' }}>
                                    {QUIZ_QUESTIONS[currentQuestion].question}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {QUIZ_QUESTIONS[currentQuestion].options.map((option, i) => (
                                        <button
                                            key={i}
                                            onClick={() => !showResult && handleAnswer(i)}
                                            disabled={showResult}
                                            className="settings-card premium-glass hover-lift"
                                            style={{
                                                padding: '18px 20px',
                                                background: showResult
                                                    ? i === QUIZ_QUESTIONS[currentQuestion].correctAnswer
                                                        ? 'rgba(34, 197, 94, 0.1)'
                                                        : i === selectedAnswer
                                                            ? 'rgba(239, 68, 68, 0.1)'
                                                            : 'var(--nav-hover)'
                                                    : 'var(--nav-hover)',
                                                border: showResult
                                                    ? i === QUIZ_QUESTIONS[currentQuestion].correctAnswer
                                                        ? '2px solid #22c55e'
                                                        : i === selectedAnswer
                                                            ? '2px solid #ef4444'
                                                            : '1px solid var(--nav-border)'
                                                    : '1px solid var(--nav-border)',
                                                borderRadius: '16px',
                                                textAlign: 'left',
                                                cursor: showResult ? 'default' : 'pointer',
                                                color: 'var(--nav-text)',
                                                fontSize: '0.95rem',
                                                fontWeight: '800',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <span style={{ flex: 1 }}>{option}</span>
                                            {showResult && i === QUIZ_QUESTIONS[currentQuestion].correctAnswer && (
                                                <div className="settings-icon-box" style={{ width: '28px', height: '28px', background: '#22c55e', color: 'white', borderRadius: '8px' }}>
                                                    <Check size={18} />
                                                </div>
                                            )}
                                            {showResult && i === selectedAnswer && i !== QUIZ_QUESTIONS[currentQuestion].correctAnswer && (
                                                <div className="settings-icon-box" style={{ width: '28px', height: '28px', background: '#ef4444', color: 'white', borderRadius: '8px' }}>
                                                    <X size={18} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {showResult && (
                                    <button
                                        className="velocity-target-btn pulse"
                                        onClick={nextQuestion}
                                        style={{ marginTop: '32px', width: '100%', justifyContent: 'center', background: 'var(--nav-accent)', color: 'white' }}
                                    >
                                        {currentQuestion < QUIZ_QUESTIONS.length - 1
                                            ? t('prayerTeacher.quiz.nextQuestion', 'Sonraki Soru')
                                            : t('prayerTeacher.quiz.showResults', 'Sonuçları Gör')}
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
