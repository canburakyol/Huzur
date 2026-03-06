import { useState, useEffect, useCallback } from 'react';
import { Check, BookOpen, Award, Trash2, ChevronDown, ChevronUp, Star, Crown, Clock, RefreshCw, Lock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from './shared/IslamicBackButton';
import { getMemorizationData, startMemorizing, markAyahMemorized, reviewSurah, getDueReviews, getMemorizationStats } from '../services/memorizationService';
import { canAccessMemorize, isPro } from '../services/proService';
import { surahList } from '../data/surahList';
import LimitReachedModal from './LimitReachedModal';
import './Education.css';

// Zorluk seviyeleri
const getDifficulty = (ayahCount) => {
    if (ayahCount <= 10) return 'Kolay';
    if (ayahCount <= 30) return 'Orta';
    if (ayahCount <= 80) return 'Zor';
    return 'Çok Zor';
};

const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case 'Kolay': return '#27ae60';
        case 'Orta': return '#f39c12';
        case 'Zor': return '#e67e22';
        case 'Çok Zor': return '#e74c3c';
        default: return 'var(--text-color-muted)';
    }
};

function QuranMemorize({ onClose, onUpgrade }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('list'); // list, reviews
    const [expandedSurah, setExpandedSurah] = useState(null);
    const [memorizationData, setMemorizationData] = useState(getMemorizationData());
    const [stats, setStats] = useState({ totalSurahs: 0, totalAyahs: 0 });
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [dueReviews, setDueReviews] = useState([]);
    const userIsPro = isPro();

    const loadData = useCallback(() => {
        const data = getMemorizationData();
        setMemorizationData(data);
        setStats(getMemorizationStats());
        setDueReviews(getDueReviews());
    }, []);

    // Verileri yükle
    useEffect(() => {
        // eslint-disable-next-line
        loadData();
    }, [loadData]);

    // Ezberlemeye başla
    const handleStartMemorizing = (surahNumber) => {
        if (!canAccessMemorize(surahNumber)) {
            setShowLimitModal(true);
            return;
        }

        startMemorizing(surahNumber);
        loadData();
        setExpandedSurah(surahNumber);
    };

    // Ayet işaretle
    const handleToggleAyah = (surahNumber, ayahNumber, totalAyahs) => {
        markAyahMemorized(surahNumber, ayahNumber, totalAyahs);
        loadData();
    };

    // Tekrar yap
    const handleReview = (surahNumber, quality) => {
        reviewSurah(surahNumber, quality);
        loadData();
    };

    // Sure durumunu getir
    const getSurahStatus = (surahNumber) => {
        return memorizationData.surahs.find(s => s.number === surahNumber);
    };

    return (
        <div className="education-container geometric-memorize">
            {/* Header */}
            <div className="manuscript-header">
                <div className="header-top-nav">
                    <IslamicBackButton onClick={onClose} size="medium" />
                    <div className="glass-pill">{t('quranMemorize.title')}</div>
                </div>
                <div className="manuscript-header-content reveal-stagger">
                    <h1 className="manuscript-title">🧠 {t('quranMemorize.title')}</h1>
                    <p className="manuscript-subtitle">{t('quranMemorize.subtitle')}</p>
                </div>
                {!userIsPro && (
                    <div className="pro-badge-premium" onClick={() => setShowLimitModal(true)}>
                        <Crown size={14} />
                        <span>PRO</span>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="geometric-stats-row reveal-stagger" style={{ '--delay': '0.2s' }}>
                <div className="geometric-stat-card">
                    <span className="val">{stats.memorizedSurahs}</span>
                    <span className="lbl">{t('quranMemorize.stats.memorized')}</span>
                </div>
                <div className="geometric-stat-card">
                    <span className="val">{stats.learningCount}</span>
                    <span className="lbl">{t('quranMemorize.stats.learning')}</span>
                </div>
                <div className="geometric-stat-card">
                    <span className="val" style={{ color: '#e67e22' }}>{stats.reviewCount}</span>
                    <span className="lbl">{t('quranMemorize.stats.review')}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="geometric-tabs reveal-stagger" style={{ '--delay': '0.3s' }}>
                <button 
                    className={`geometric-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    <BookOpen size={18} />
                    {t('quranMemorize.tabs.surahs')}
                </button>
                <button 
                    className={`geometric-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    <RefreshCw size={18} />
                    {t('quranMemorize.tabs.reviews')}
                    {dueReviews.length > 0 && <span className="badge-count">{dueReviews.length}</span>}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'list' ? (
                <div className="geometric-surah-list reveal-stagger" style={{ '--delay': '0.4s' }}>
                    {surahList.map(surah => {
                        const status = getSurahStatus(surah.number);
                        const isLocked = !canAccessMemorize(surah.number) && !status;
                        const difficulty = getDifficulty(surah.ayahCount);
                        const isExpanded = expandedSurah === surah.number;

                        return (
                            <div key={surah.number} className={`geometric-surah-card ${status ? 'active' : ''} ${isLocked ? 'locked' : ''}`}>
                                <div 
                                    className="geometric-card-header"
                                    onClick={() => !isLocked && (status ? setExpandedSurah(isExpanded ? null : surah.number) : handleStartMemorizing(surah.number))}
                                >
                                    <div className="geometric-number-box">
                                        {status?.status === 'memorized' ? <CheckCircle size={20} /> : surah.number}
                                    </div>
                                    <div className="item-info">
                                        <div className="item-name">{surah.nameTranslation}</div>
                                        <div className="item-sub">
                                            {t('quranMemorize.ayahCount', { count: surah.ayahCount })} • 
                                            <span style={{ color: getDifficultyColor(difficulty) }}> {difficulty}</span>
                                        </div>
                                    </div>
                                    
                                    {isLocked ? (
                                        <Lock size={18} color="var(--edu-text-muted)" />
                                    ) : status ? (
                                        <div className="premium-progress-circle">
                                            <svg width="48" height="48">
                                                <circle className="progress-bg" cx="24" cy="24" r="20" />
                                                <circle 
                                                    className="progress-fill"
                                                    cx="24" cy="24" r="20" 
                                                    strokeDasharray={`${(status.progress / 100) * 125} 125`}
                                                    pathLength="125"
                                                />
                                            </svg>
                                            <span className="progress-pct">{status.progress}%</span>
                                        </div>
                                    ) : (
                                        <button className="geometric-start-btn">{t('quranMemorize.start')}</button>
                                    )}
                                </div>

                                {isExpanded && status && (
                                    <div className="geometric-ayah-area reveal-stagger">
                                        <div className="geometric-ayah-grid">
                                            {Array.from({ length: surah.ayahCount }, (_, i) => i + 1).map(ayah => {
                                                const isMemorized = status.memorizedAyahs.includes(ayah);
                                                return (
                                                    <button
                                                        key={ayah}
                                                        className={`geometric-ayah-btn ${isMemorized ? 'memorized' : ''}`}
                                                        onClick={() => handleToggleAyah(surah.number, ayah, surah.ayahCount)}
                                                    >
                                                        {ayah}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="reviews-list reveal-stagger" style={{ '--delay': '0.4s' }}>
                    {dueReviews.length === 0 ? (
                        <div className="manuscript-card empty-state-card">
                            <CheckCircle size={64} color="var(--edu-gold)" />
                            <h3 className="lesson-title">{t('quranMemorize.empty.title')}</h3>
                            <p className="lesson-desc">{t('quranMemorize.empty.description')}</p>
                        </div>
                    ) : (
                        dueReviews.map(review => {
                            const surah = surahList.find(s => s.number === review.number);
                            return (
                                <div key={review.number} className="geometric-surah-card review-card">
                                    <div className="review-header" style={{ padding: '20px' }}>
                                        <h3 className="lesson-title" style={{ margin: 0 }}>{surah.nameTranslation}</h3>
                                        <span className="rule-badge">
                                            {t('quranMemorize.level', { level: review.level })}
                                        </span>
                                    </div>
                                    <div style={{ padding: '0 20px 20px' }}>
                                        <p className="lesson-desc">{t('quranMemorize.reviewQuestion')}</p>
                                        <div className="review-actions-premium">
                                            <button className="rev-btn hard" onClick={() => handleReview(review.number, 1)}>
                                                {t('quranMemorize.reviewActions.hard')}
                                            </button>
                                            <button className="rev-btn medium" onClick={() => handleReview(review.number, 2)}>
                                                {t('quranMemorize.reviewActions.medium')}
                                            </button>
                                            <button className="rev-btn easy" onClick={() => handleReview(review.number, 3)}>
                                                {t('quranMemorize.reviewActions.easy')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <LimitReachedModal
                isOpen={showLimitModal}
                onClose={() => setShowLimitModal(false)}
                feature="memorize"
                usedCount={5}
                maxCount={5}
                onUpgrade={() => {
                    setShowLimitModal(false);
                    onUpgrade?.();
                }}
            />


        </div>
    );
}

export default QuranMemorize;
