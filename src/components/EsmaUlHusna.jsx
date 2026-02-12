import { useState, useEffect } from 'react';
import { Search, Heart, Star, Share2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { contentService } from '../services/contentService';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';

const ESMA_FAVORITES_KEY = 'esma_favorites';

function EsmaUlHusna({ onClose }) {
    const { t, i18n } = useTranslation();
    const [esmaList, setEsmaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dailyEsma, setDailyEsma] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [favorites, setFavorites] = useState(() => {
        return storageService.getItem(ESMA_FAVORITES_KEY, []);
    });
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Fetch data when language changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await contentService.getEsmaUlHusna(i18n.language);
            setEsmaList(data);
            
            // Calculate daily Esma based on the new list
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            const daily = data[dayOfYear % data.length];
            setDailyEsma(daily);
            
            setLoading(false);
        };

        fetchData();
    }, [i18n.language]);

    // Filter names based on search and favorites
    const filteredNames = esmaList.filter(esma => {
        const matchesSearch =
            (esma.latin && esma.latin.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (esma.meaning && esma.meaning.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (esma.arabic && esma.arabic.includes(searchQuery));

        if (showFavoritesOnly) {
            return matchesSearch && favorites.includes(esma.id);
        }
        return matchesSearch;
    });

    // Toggle favorite
    const toggleFavorite = (id) => {
        const newFavorites = favorites.includes(id)
            ? favorites.filter(f => f !== id)
            : [...favorites, id];
        setFavorites(newFavorites);
        storageService.setItem(ESMA_FAVORITES_KEY, newFavorites);
    };

    // Share name
    const shareEsma = async (esma) => {
        const text = `${esma.arabic}\n${esma.latin}\n\n${esma.meaning}\n${esma.detail || ''}\n\n📿 ${t('esma.title')} - ${t('app.name')}`;

        if (navigator.share) {
            try {
                await navigator.share({ text });
            } catch {
                // Share cancelled
            }
        } else {
            navigator.clipboard.writeText(text);
            alert(t('common.copied', 'Kopyalandı!'));
        }
    };

    if (loading || !dailyEsma) {
        return (
            <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

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
                <IslamicBackButton onClick={onClose} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    ✨ {t('esma.title', 'Esmaül Hüsna')}
                </h1>
            </div>

            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                {t('esma.subtitle', "Allah'ın 99 Güzel İsmi")}
            </p>

            {/* Daily Name */}
            <div className="glass-card" style={{
                padding: '24px',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(184, 134, 11, 0.1) 100%)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '11px',
                    color: 'var(--text-color-muted)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                }}>
                    <Star size={14} fill="#d4af37" color="#d4af37" /> {t('esma.daily', 'Günün Esması')}
                </div>
                <div style={{
                    fontSize: '42px',
                    color: '#d4af37',
                    fontFamily: 'Arial',
                    marginBottom: '8px'
                }}>
                    {dailyEsma.arabic}
                </div>
                <div style={{
                    fontSize: '20px',
                    color: 'var(--primary-color)',
                    fontWeight: '700',
                    marginBottom: '8px'
                }}>
                    {dailyEsma.latin}
                </div>
                <div style={{
                    fontSize: '14px',
                    color: 'var(--text-color)'
                }}>
                    {dailyEsma.meaning}
                </div>
                {dailyEsma.detail && (
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-color-muted)',
                        marginTop: '8px',
                        fontStyle: 'italic'
                    }}>
                        {dailyEsma.detail}
                    </div>
                )}
            </div>

            {/* Search */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px'
            }}>
                <div style={{
                    flex: 1,
                    position: 'relative'
                }}>
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-color-muted)'
                        }}
                    />
                    <input
                        type="text"
                        placeholder={t('esma.search_placeholder', 'İsim ara...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'var(--text-color)',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                </div>
                <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    style={{
                        padding: '12px 16px',
                        background: showFavoritesOnly ? 'rgba(231, 76, 60, 0.2)' : 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: showFavoritesOnly ? '#e74c3c' : 'var(--text-color)'
                    }}
                >
                    <Heart size={18} fill={showFavoritesOnly ? '#e74c3c' : 'transparent'} />
                    {favorites.length}
                </button>
            </div>

            {/* Count */}
            <div style={{
                fontSize: '12px',
                color: 'var(--text-color-muted)',
                marginBottom: '12px'
            }}>
                {filteredNames.length} / 99 {t('esma.count_suffix', 'isim')}
            </div>

            {/* Names List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredNames.map(esma => (
                    <div
                        key={esma.id}
                        className="glass-card"
                        style={{ padding: '16px', cursor: 'pointer' }}
                        onClick={() => setExpandedId(expandedId === esma.id ? null : esma.id)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Number */}
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'var(--primary-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '700'
                            }}>
                                {esma.id}
                            </div>

                            {/* Arabic & Latin */}
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '22px',
                                    color: '#d4af37',
                                    fontFamily: 'Arial'
                                }}>
                                    {esma.arabic}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: 'var(--primary-color)',
                                    fontWeight: '600'
                                }}>
                                    {esma.latin}
                                </div>
                            </div>

                            {/* Expand Icon */}
                            {expandedId === esma.id ? (
                                <ChevronUp size={20} color="var(--text-color-muted)" />
                            ) : (
                                <ChevronDown size={20} color="var(--text-color-muted)" />
                            )}
                        </div>

                        {/* Expanded Content */}
                        {expandedId === esma.id && (
                            <div style={{
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px solid var(--glass-border)',
                                animation: 'fadeIn 0.3s ease'
                            }}>
                                <div style={{
                                    fontSize: '15px',
                                    color: 'var(--text-color)',
                                    fontWeight: '600',
                                    marginBottom: '8px'
                                }}>
                                    {esma.meaning}
                                </div>
                                {esma.detail && (
                                    <div style={{
                                        fontSize: '13px',
                                        color: 'var(--text-color-muted)',
                                        lineHeight: '1.6',
                                        marginBottom: '16px'
                                    }}>
                                        {esma.detail}
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(esma.id); }}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: favorites.includes(esma.id) ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            color: favorites.includes(esma.id) ? '#e74c3c' : 'var(--text-color)'
                                        }}
                                    >
                                        <Heart
                                            size={16}
                                            fill={favorites.includes(esma.id) ? '#e74c3c' : 'transparent'}
                                        />
                                        {t('common.favorite', 'Favori')}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); shareEsma(esma); }}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: 'var(--primary-color)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            color: '#fff'
                                        }}
                                    >
                                        <Share2 size={16} />
                                        {t('common.share', 'Paylaş')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredNames.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: 'var(--text-color-muted)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <div>{t('common.no_results', 'Sonuç bulunamadı')}</div>
                </div>
            )}
        </div>
    );
}

export default EsmaUlHusna;
