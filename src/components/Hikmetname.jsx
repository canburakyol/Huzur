import { useState, useEffect } from 'react';
import { ArrowLeft, Share2, RefreshCw, Heart, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HIKMET_CATEGORIES, HIKMETLER, getDailyHikmet, getHikmetByCategory, getRandomHikmet } from '../data/hikmetData';

function Hikmetname({ onClose }) {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState(null);
    const [dailyHikmet, setDailyHikmet] = useState(getDailyHikmet());
    const [favorites, setFavorites] = useState(() => {
        return JSON.parse(localStorage.getItem('hikmet_favorites') || '[]');
    });

    // Toggle favorite
    const toggleFavorite = (hikmetId) => {
        const newFavorites = favorites.includes(hikmetId)
            ? favorites.filter(id => id !== hikmetId)
            : [...favorites, hikmetId];
        setFavorites(newFavorites);
        localStorage.setItem('hikmet_favorites', JSON.stringify(newFavorites));
    };

    // Get new random hikmet
    const getNewRandom = () => {
        setDailyHikmet(getRandomHikmet());
    };

    // Share hikmet
    const shareHikmet = async (hikmet) => {
        const text = t('hikmet.shareText', {
            text: t(hikmet.text),
            source: t(hikmet.source),
            ref: hikmet.reference ? ` (${t(hikmet.reference)})` : '',
            appName: t('app.name')
        });

        if (navigator.share) {
            try {
                await navigator.share({ text });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(text);
            alert(t('hikmet.copied'));
        }
    };

    // Go back
    const goBack = () => {
        if (activeCategory) {
            setActiveCategory(null);
        } else {
            onClose();
        }
    };

    // Render main view
    const renderMainView = () => (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Daily Hikmet */}
            <div className="glass-card" style={{
                padding: '24px',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.2) 0%, rgba(142, 68, 173, 0.1) 100%)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '12px',
                    color: 'var(--text-color-muted)',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    ✨ {t('hikmet.daily')}
                </div>

                <div style={{
                    fontSize: '18px',
                    color: 'var(--text-color)',
                    fontStyle: 'italic',
                    lineHeight: '1.7',
                    marginBottom: '16px'
                }}>
                    "{t(dailyHikmet.text)}"
                </div>

                <div style={{
                    fontSize: '13px',
                    color: 'var(--primary-color)',
                    fontWeight: '600'
                }}>
                    — {t(dailyHikmet.source)}
                </div>
                {dailyHikmet.reference && (
                    <div style={{
                        fontSize: '11px',
                        color: 'var(--text-color-muted)',
                        marginTop: '4px'
                    }}>
                        {t(dailyHikmet.reference)}
                    </div>
                )}

                {/* Action buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    marginTop: '20px'
                }}>
                    <button
                        onClick={() => toggleFavorite(dailyHikmet.id)}
                        style={{
                            padding: '10px 20px',
                            background: favorites.includes(dailyHikmet.id) ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.1)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '20px',
                            color: favorites.includes(dailyHikmet.id) ? '#e74c3c' : 'var(--text-color)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Heart size={14} fill={favorites.includes(dailyHikmet.id) ? '#e74c3c' : 'transparent'} />
                        {t('hikmet.favorite')}
                    </button>
                    <button
                        onClick={() => shareHikmet(dailyHikmet)}
                        style={{
                            padding: '10px 20px',
                            background: 'var(--primary-color)',
                            border: 'none',
                            borderRadius: '20px',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Share2 size={14} /> {t('hikmet.share')}
                    </button>
                    <button
                        onClick={getNewRandom}
                        style={{
                            padding: '10px 20px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '20px',
                            color: 'var(--text-color)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <RefreshCw size={14} /> {t('hikmet.new')}
                    </button>
                </div>
            </div>

            {/* Categories */}
            <h3 style={{
                fontSize: '14px',
                color: 'var(--primary-color)',
                marginBottom: '12px'
            }}>
                {t('hikmet.categoriesTitle')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {HIKMET_CATEGORIES.map(category => (
                    <div
                        key={category.id}
                        className="glass-card"
                        style={{
                            padding: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                        onClick={() => setActiveCategory(category.id)}
                    >
                        <span style={{ fontSize: '28px' }}>{category.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontWeight: '600',
                                fontSize: '15px',
                                color: 'var(--primary-color)'
                            }}>
                                {t(category.title)}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-color-muted)'
                            }}>
                                {t(category.description)}
                            </div>
                        </div>
                        <div style={{
                            padding: '4px 10px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '11px',
                            color: 'var(--text-color-muted)'
                        }}>
                            {getHikmetByCategory(category.id).length}
                        </div>
                        <ChevronRight size={20} color="var(--text-color-muted)" />
                    </div>
                ))}
            </div>

            {/* Favorites Section */}
            {favorites.length > 0 && (
                <>
                    <h3 style={{
                        fontSize: '14px',
                        color: 'var(--primary-color)',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Heart size={16} fill="#e74c3c" color="#e74c3c" /> {t('hikmet.favorites')} ({favorites.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {HIKMETLER.filter(h => favorites.includes(h.id)).slice(0, 3).map(hikmet => (
                            <div
                                key={hikmet.id}
                                className="glass-card"
                                style={{ padding: '14px' }}
                            >
                                <div style={{
                                    fontSize: '13px',
                                    color: 'var(--text-color)',
                                    fontStyle: 'italic',
                                    marginBottom: '8px'
                                }}>
                                    "{t(hikmet.text)}"
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    color: 'var(--text-color-muted)'
                                }}>
                                    — {t(hikmet.source)}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    // Render category view
    const renderCategoryView = () => {
        const category = HIKMET_CATEGORIES.find(c => c.id === activeCategory);
        const hikmetler = getHikmetByCategory(activeCategory);

        return (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                    {t(category?.description)}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {hikmetler.map(hikmet => (
                        <div
                            key={hikmet.id}
                            className="glass-card"
                            style={{ padding: '16px' }}
                        >
                            <div style={{
                                fontSize: '15px',
                                color: 'var(--text-color)',
                                lineHeight: '1.7',
                                marginBottom: '12px'
                            }}>
                                "{t(hikmet.text)}"
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: 'var(--primary-color)',
                                        fontWeight: '600'
                                    }}>
                                        — {t(hikmet.source)}
                                    </div>
                                    {hikmet.reference && (
                                        <div style={{
                                            fontSize: '10px',
                                            color: 'var(--text-color-muted)'
                                        }}>
                                            {t(hikmet.reference)}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(hikmet.id); }}
                                        style={{
                                            padding: '8px',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Heart
                                            size={16}
                                            color={favorites.includes(hikmet.id) ? '#e74c3c' : 'var(--text-color-muted)'}
                                            fill={favorites.includes(hikmet.id) ? '#e74c3c' : 'transparent'}
                                        />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); shareHikmet(hikmet); }}
                                        style={{
                                            padding: '8px',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Share2 size={16} color="var(--text-color-muted)" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Get title
    const getTitle = () => {
        if (activeCategory) {
            const category = HIKMET_CATEGORIES.find(c => c.id === activeCategory);
            return category ? t(category.title) : t('hikmet.title');
        }
        return t('hikmet.title');
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingTop: '20px'
            }}>
                <button
                    onClick={goBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: 'var(--primary-color)'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    📜 {getTitle()}
                </h1>
            </div>

            {/* Content */}
            {!activeCategory && renderMainView()}
            {activeCategory && renderCategoryView()}
        </div>
    );
}

export default Hikmetname;
