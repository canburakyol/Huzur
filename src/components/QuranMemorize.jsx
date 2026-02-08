import { useState, useEffect, useCallback } from 'react';
import { Check, BookOpen, Award, Trash2, ChevronDown, ChevronUp, Star, Crown, Clock, RefreshCw, Lock, CheckCircle } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { getMemorizationData, startMemorizing, markAyahMemorized, reviewSurah, getDueReviews, getMemorizationStats } from '../services/memorizationService';
import { canAccessMemorize, isPro } from '../services/proService';
import { surahList } from '../data/surahList';
import LimitReachedModal from './LimitReachedModal';

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
        <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div className="memorize-header">
                <IslamicBackButton onClick={onClose} size="medium" />
                <div className="header-content">
                    <h1>🧠 Hafızlık Yardımcısı</h1>
                    <p>Ezberle, Tekrar Et, Pekiştir</p>
                </div>
                {!userIsPro && (
                    <div className="pro-badge-mini" onClick={() => setShowLimitModal(true)}>
                        <Crown size={14} />
                        <span>PRO</span>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-value">{stats.memorizedSurahs}</div>
                    <div className="stat-label">Ezberlenen</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value">{stats.learningCount}</div>
                    <div className="stat-label">Çalışılan</div>
                </div>
                <div className="stat-card glass-card warning">
                    <div className="stat-value">{stats.reviewCount}</div>
                    <div className="stat-label">Tekrar</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="memorize-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    <BookOpen size={18} />
                    Sureler
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    <RefreshCw size={18} />
                    Tekrarlar
                    {dueReviews.length > 0 && <span className="badge">{dueReviews.length}</span>}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'list' ? (
                <div className="surah-list">
                    {surahList.map(surah => {
                        const status = getSurahStatus(surah.number);
                        const isLocked = !canAccessMemorize(surah.number) && !status;
                        const difficulty = getDifficulty(surah.ayahCount);
                        const isExpanded = expandedSurah === surah.number;

                        return (
                            <div key={surah.number} className={`surah-card glass-card ${status ? 'active' : ''} ${isLocked ? 'locked' : ''}`}>
                                <div 
                                    className="surah-header"
                                    onClick={() => !isLocked && (status ? setExpandedSurah(isExpanded ? null : surah.number) : handleStartMemorizing(surah.number))}
                                >
                                    <div className="surah-number">
                                        {status?.status === 'memorized' ? <Check size={16} /> : surah.number}
                                    </div>
                                    <div className="surah-info">
                                        <div className="surah-name-row">
                                            <span className="surah-name">{surah.name}</span>
                                            <span className="surah-arabic">{surah.arabicName}</span>
                                        </div>
                                        <div className="surah-meta">
                                            <span>{surah.ayahCount} Ayet</span>
                                            <span className="dot">•</span>
                                            <span style={{ color: getDifficultyColor(difficulty) }}>{difficulty}</span>
                                        </div>
                                    </div>
                                    
                                    {isLocked ? (
                                        <Lock size={16} className="lock-icon" />
                                    ) : status ? (
                                        <div className="progress-ring">
                                            <svg width="36" height="36">
                                                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                                                <circle 
                                                    cx="18" cy="18" r="16" 
                                                    fill="none" 
                                                    stroke={status.status === 'memorized' ? '#27ae60' : '#3b82f6'} 
                                                    strokeWidth="3"
                                                    strokeDasharray={`${(status.progress / 100) * 100} 100`}
                                                    pathLength="100"
                                                    transform="rotate(-90 18 18)"
                                                />
                                            </svg>
                                            <span className="progress-text">{status.progress}%</span>
                                        </div>
                                    ) : (
                                        <button className="start-btn">Başla</button>
                                    )}
                                </div>

                                {isExpanded && status && (
                                    <div className="surah-details animate-slideDown">
                                        <div className="ayah-grid">
                                            {Array.from({ length: surah.ayahCount }, (_, i) => i + 1).map(ayah => {
                                                const isMemorized = status.memorizedAyahs.includes(ayah);
                                                return (
                                                    <button
                                                        key={ayah}
                                                        className={`ayah-btn ${isMemorized ? 'memorized' : ''}`}
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
                <div className="reviews-list">
                    {dueReviews.length === 0 ? (
                        <div className="empty-state">
                            <CheckCircle size={48} color="#27ae60" />
                            <h3>Tebrikler!</h3>
                            <p>Bugün tekrar edilecek sure kalmadı.</p>
                        </div>
                    ) : (
                        dueReviews.map(review => {
                            const surah = surahList.find(s => s.number === review.number);
                            return (
                                <div key={review.number} className="review-card glass-card">
                                    <div className="review-header">
                                        <h3>{surah.name}</h3>
                                        <span className="level-badge">Seviye {review.level}</span>
                                    </div>
                                    <p>Bu sureyi ne kadar iyi hatırlıyorsun?</p>
                                    <div className="review-actions">
                                        <button className="review-btn hard" onClick={() => handleReview(review.number, 1)}>
                                            Zorlandım
                                        </button>
                                        <button className="review-btn medium" onClick={() => handleReview(review.number, 2)}>
                                            İdare Eder
                                        </button>
                                        <button className="review-btn easy" onClick={() => handleReview(review.number, 3)}>
                                            Kolaydı
                                        </button>
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

            <style>{`
                .memorize-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%);
                }

                .header-content h1 {
                    font-size: 1.4rem;
                    margin: 0;
                    color: var(--primary-color);
                }

                .header-content p {
                    margin: 0;
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    padding: 0 16px 20px;
                }

                .stat-card {
                    padding: 12px;
                    text-align: center;
                    background: rgba(255,255,255,0.05);
                }

                .stat-card.warning {
                    background: rgba(231, 76, 60, 0.1);
                    border-color: rgba(231, 76, 60, 0.3);
                }

                .stat-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .stat-label {
                    font-size: 11px;
                    color: var(--text-secondary);
                }

                .memorize-tabs {
                    display: flex;
                    padding: 0 16px 16px;
                    gap: 10px;
                }

                .tab-btn {
                    flex: 1;
                    padding: 12px;
                    background: rgba(255,255,255,0.05);
                    border: none;
                    border-radius: 12px;
                    color: var(--text-secondary);
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    position: relative;
                }

                .tab-btn.active {
                    background: var(--primary-color);
                    color: white;
                }

                .badge {
                    background: #e74c3c;
                    color: white;
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 10px;
                    position: absolute;
                    top: -5px;
                    right: -5px;
                }

                .surah-list {
                    padding: 0 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .surah-card {
                    padding: 0;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }

                .surah-card.locked {
                    opacity: 0.6;
                }

                .surah-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    cursor: pointer;
                }

                .surah-number {
                    width: 32px;
                    height: 32px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--primary-color);
                }

                .surah-info {
                    flex: 1;
                }

                .surah-name-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .surah-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .surah-arabic {
                    font-family: var(--arabic-font-family);
                    color: var(--text-secondary);
                    font-size: 14px;
                }

                .surah-meta {
                    font-size: 11px;
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .dot {
                    opacity: 0.5;
                }

                .start-btn {
                    padding: 6px 12px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 20px;
                    color: var(--text-primary);
                    font-size: 12px;
                    cursor: pointer;
                }

                .progress-ring {
                    position: relative;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .progress-text {
                    font-size: 9px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .surah-details {
                    padding: 0 16px 16px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }

                .ayah-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
                    gap: 8px;
                    margin-top: 16px;
                }

                .ayah-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: var(--text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .ayah-btn.memorized {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .reviews-list {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .review-card {
                    padding: 20px;
                    text-align: center;
                }

                .review-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .level-badge {
                    font-size: 11px;
                    background: rgba(255,255,255,0.1);
                    padding: 4px 8px;
                    border-radius: 12px;
                }

                .review-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                .review-btn {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    color: white;
                }

                .review-btn.hard { background: #e74c3c; }
                .review-btn.medium { background: #f39c12; }
                .review-btn.easy { background: #27ae60; }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-secondary);
                }

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

export default QuranMemorize;
