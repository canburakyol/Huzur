import { useState, useEffect } from 'react';
import { Search, Heart, Star, Share2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { contentService } from '../services/contentService';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';
import { buildEsmaShareCard, shareCard, openShareCard } from '../services/shareCardService';
import './EsmaUlHusna.css';
import './Navigation.css';

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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await contentService.getEsmaUlHusna(i18n.language);
            setEsmaList(data);
            const today = new Date();
            const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            const daily = data[dayOfYear % data.length];
            setDailyEsma(daily);
            setLoading(false);
        };
        fetchData();
    }, [i18n.language]);

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

    const toggleFavorite = (id) => {
        const newFavorites = favorites.includes(id)
            ? favorites.filter(f => f !== id)
            : [...favorites, id];
        setFavorites(newFavorites);
        storageService.setItem(ESMA_FAVORITES_KEY, newFavorites);
    };

    const shareEsma = async (esma) => {
        const card = buildEsmaShareCard(esma);
        openShareCard('esma', 'esma_ul_husna_page');
        await shareCard(card, 'esma_ul_husna_page');
    };

    if (loading || !dailyEsma) {
        return (
            <div className="settings-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner premium"></div>
            </div>
        );
    }

    return (
        <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                        {t('esma.title', 'Esmaül Hüsna')}
                    </h2>
                    <p className="settings-desc">{t('esma.subtitle', "Allah'ın 99 Güzel İsmi")}</p>
                </div>
            </div>

            {/* Daily Name Card */}
            <div className="settings-card" style={{ 
                flexDirection: 'column', 
                background: 'linear-gradient(135deg, var(--nav-accent), #f97316)', 
                border: 'none', 
                padding: '32px', 
                textAlign: 'center', 
                color: 'white', 
                marginBottom: '40px',
                boxShadow: '0 12px 24px rgba(249, 115, 22, 0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '15px', left: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
                    <Star size={12} fill="white" /> {t('esma.daily', 'Günün Esması')}
                </div>
                
                <div style={{ fontFamily: 'var(--arabic-font)', fontSize: '4rem', marginBottom: '16px', textShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    {dailyEsma.arabic}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '8px' }}>
                    {dailyEsma.latin}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '500', opacity: 0.9, lineHeight: '1.5' }}>
                    {dailyEsma.meaning}
                </div>
                
                {dailyEsma.detail && (
                    <div style={{ fontSize: '0.75rem', marginTop: '16px', opacity: 0.7, fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' }}>
                        {dailyEsma.detail}
                    </div>
                )}
            </div>

            {/* Search & filters */}
            <div className="esma-search-row-modern">
                <div className="esma-search-input-wrapper">
                    <Search size={20} className="esma-input-icon" />
                    <input
                        type="text"
                        className="esma-modern-input"
                        placeholder={t('esma.search_placeholder', 'İsim ara...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    className={`esma-fav-btn ${showFavoritesOnly ? 'active' : ''}`}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                >
                    <Heart size={24} fill={showFavoritesOnly ? '#ef4444' : 'transparent'} />
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>
                    {filteredNames.length} / 99 {t('esma.count_suffix', 'İSİM')}
                </span>
            </div>

            {/* Names List */}
            <div className="settings-group">
                {filteredNames.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 24px', opacity: 0.4 }}>
                        <Search size={48} style={{ marginBottom: '16px' }} />
                        <p style={{ fontWeight: '700' }}>Sonuç bulunamadı</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredNames.map((esma) => (
                            <div
                                key={esma.id}
                                className={`settings-card ${expandedId === esma.id ? 'expanded-esma' : ''}`}
                                style={{ flexDirection: 'column', padding: '16px', transition: 'all 0.3s' }}
                                onClick={() => setExpandedId(expandedId === esma.id ? null : esma.id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                                    <div className="esma-id-badge-modern">
                                        {esma.id}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ fontFamily: 'var(--arabic-font)', fontSize: '1.5rem', color: 'var(--nav-accent)' }}>
                                                {esma.arabic}
                                            </div>
                                            {expandedId === esma.id ? <ChevronUp size={20} color="var(--nav-text-muted)" /> : <ChevronDown size={20} color="var(--nav-text-muted)" />}
                                        </div>
                                        <div style={{ fontWeight: '800', color: 'var(--nav-text)', fontSize: '1rem', marginTop: '4px' }}>
                                            {esma.latin}
                                        </div>
                                    </div>
                                </div>

                                {expandedId === esma.id && (
                                    <div className="esma-detail-expand reveal-stagger">
                                        <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--nav-text)', marginBottom: '8px', borderTop: '1px solid var(--nav-border)', paddingTop: '16px' }}>
                                            {esma.meaning}
                                        </div>
                                        {esma.detail && (
                                            <p style={{ margin: '0 0 20px', fontSize: '0.85rem', color: 'var(--nav-text-muted)', lineHeight: '1.6' }}>
                                                {esma.detail}
                                            </p>
                                        )}

                                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                            <button
                                                className={`velocity-target-btn ${favorites.includes(esma.id) ? 'active-fav' : ''}`}
                                                style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'center' }}
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(esma.id); }}
                                            >
                                                <Heart
                                                    size={16}
                                                    fill={favorites.includes(esma.id) ? '#ef4444' : 'transparent'}
                                                />
                                                {t('common.favorite', 'Favori')}
                                            </button>
                                            <button
                                                className="velocity-action-btn"
                                                style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'center' }}
                                                onClick={(e) => { e.stopPropagation(); shareEsma(esma); }}
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
                )}
            </div>

            {/* Info Box */}
            <div className="settings-card" style={{ background: 'var(--nav-hover)', border: 'none', marginTop: '32px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Info size={18} color="var(--nav-accent)" />
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                        {t('esma.info_note', "Esmâü'l-Hüsnâ, Allah Teâlâ'nın en güzel isimleri demektir. Bu isimleri zikretmek, anlamlarını tefekkür etmek ve bu isimlerle Allah'a dua etmek müstehaptır.")}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default EsmaUlHusna;
