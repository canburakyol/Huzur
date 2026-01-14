import { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Share2, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from './shared/IslamicBackButton';
import { contentService } from '../services/contentService';

const Hadiths = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const [view, setView] = useState('home'); // home, category, detail
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedHadith, setSelectedHadith] = useState(null);
    
    // Data states
    const [categories, setCategories] = useState([]);
    const [allHadiths, setAllHadiths] = useState([]);
    const [dailyHadith, setDailyHadith] = useState(null);
    const [loading, setLoading] = useState(true);

    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('hadithFavorites');
        return saved ? JSON.parse(saved) : [];
    });

    // Fetch data when language changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const data = await contentService.getHadiths(i18n.language);
            setCategories(data.categories);
            setAllHadiths(data.hadiths);

            // Calculate daily Hadith
            if (data.hadiths && data.hadiths.length > 0) {
                const today = new Date();
                const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
                setDailyHadith(data.hadiths[dayOfYear % data.hadiths.length]);
            }
            
            setLoading(false);
        };

        fetchData();
    }, [i18n.language]);

    const toggleFavorite = (hadithId) => {
        let newFavorites;
        if (favorites.includes(hadithId)) {
            newFavorites = favorites.filter(id => id !== hadithId);
        } else {
            newFavorites = [...favorites, hadithId];
        }
        setFavorites(newFavorites);
        localStorage.setItem('hadithFavorites', JSON.stringify(newFavorites));
    };

    const handleShare = async (hadith) => {
        const text = `📖 ${t('hadith.title', 'Hadis-i Şerif')}\n\n"${hadith.text}"\n\n— ${hadith.narrator}\n(${hadith.source})\n\n- Huzur Uygulaması`;

        if (navigator.share) {
            try {
                await navigator.share({ title: t('hadith.title', 'Hadis-i Şerif'), text });
            } catch {
                // User cancelled share
            }
        } else {
            try {
                await navigator.clipboard.writeText(text);
                alert(t('common.copied', 'Hadis panoya kopyalandı!'));
            } catch {
                alert(t('common.copy_failed', 'Kopyalama başarısız.'));
            }
        }
    };

    const openCategory = (category) => {
        setSelectedCategory(category);
        setView('category');
    };

    const openHadith = (hadith) => {
        setSelectedHadith(hadith);
        setView('detail');
    };

    const goBack = () => {
        if (view === 'detail') {
            setView(selectedCategory ? 'category' : 'home');
            setSelectedHadith(null);
        } else if (view === 'category') {
            setView('home');
            setSelectedCategory(null);
        }
    };

    const getHadithsByCategory = (categoryId) => {
        if (categoryId === 'favorites') {
            return allHadiths.filter(h => favorites.includes(h.id));
        }
        return allHadiths.filter(h => h.category === categoryId);
    };

    if (loading) {
        return (
            <div className="app-container" style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    // Detay Görünümü
    if (view === 'detail' && selectedHadith) {
        const isFav = favorites.includes(selectedHadith.id);
        const category = categories.find(c => c.id === selectedHadith.category);

        return (
            <div className="app-container" style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <ChevronLeft size={24} />
                        <span>{t('common.back', 'Geri')}</span>
                    </button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => toggleFavorite(selectedHadith.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Heart size={24} color={isFav ? '#e74c3c' : 'var(--text-color-muted)'} fill={isFav ? '#e74c3c' : 'none'} />
                        </button>
                        <button onClick={() => handleShare(selectedHadith)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-color-muted)' }}>
                            <Share2 size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', overflowY: 'auto' }}>
                    {/* Kategori badge */}
                    {category && (
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            background: category.color || 'var(--primary-color)',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            alignSelf: 'center',
                            marginBottom: '20px'
                        }}>
                            {category.icon} {category.name}
                        </div>
                    )}

                    {/* Arapça */}
                    {selectedHadith.arabic && (
                        <div style={{
                            fontFamily: 'serif',
                            fontSize: '26px',
                            color: 'var(--text-color)',
                            lineHeight: 1.8,
                            marginBottom: '24px',
                            direction: 'rtl'
                        }}>
                            {selectedHadith.arabic}
                        </div>
                    )}

                    {/* Türkçe/English */}
                    <div style={{
                        fontSize: '18px',
                        color: 'var(--text-color)',
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        marginBottom: '24px',
                        padding: '0 10px'
                    }}>
                        "{selectedHadith.text}"
                    </div>

                    {/* Kaynak */}
                    <div style={{ color: 'var(--text-color-muted)', fontSize: '14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{selectedHadith.narrator}</div>
                        <div style={{ marginTop: '4px' }}>({selectedHadith.source})</div>
                    </div>
                </div>
            </div>
        );
    }

    // Kategori Görünümü
    if (view === 'category' && selectedCategory) {
        const categoryHadiths = getHadithsByCategory(selectedCategory.id);

        return (
            <div className="app-container" style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <ChevronLeft size={24} />
                        <span>{t('common.back', 'Geri')}</span>
                    </button>
                    <h2 style={{ margin: 0, color: 'var(--text-color)', fontSize: '20px' }}>
                        {selectedCategory.icon} {selectedCategory.name}
                    </h2>
                    <div style={{ width: '60px' }}></div>
                </div>

                {/* Hadis Listesi */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {categoryHadiths.map(hadith => (
                        <div
                            key={hadith.id}
                            onClick={() => openHadith(hadith)}
                            className="glass-card"
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '14px',
                                padding: '16px',
                                marginBottom: '12px',
                                cursor: 'pointer',
                                border: '1px solid var(--glass-border)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ fontSize: '15px', color: 'var(--text-color)', lineHeight: 1.6 }}>
                                "{hadith.text.substring(0, 100)}{hadith.text.length > 100 ? '...' : ''}"
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', marginTop: '8px' }}>
                                {hadith.source}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Ana Sayfa
    return (
        <div className="app-container" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <BookOpen size={24} color="var(--primary-color)" /> {t('hadith.title', 'Hadisler')}
                </h2>
            </div>

            {/* Günün Hadisi */}
            {dailyHadith && (
                <div
                    onClick={() => openHadith(dailyHadith)}
                    className="glass-card"
                    style={{
                        background: 'var(--primary-color)',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '20px',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ✨ {t('hadith.daily', 'Günün Hadisi')}
                    </div>
                    <div style={{ fontSize: '15px', lineHeight: 1.6, fontStyle: 'italic' }}>
                        "{dailyHadith.text.substring(0, 120)}{dailyHadith.text.length > 120 ? '...' : ''}"
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>
                        — {dailyHadith.source}
                    </div>
                </div>
            )}

            {/* Kategoriler */}
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-color-muted)', marginBottom: '12px' }}>
                {t('hadith.categories', 'Kategoriler')}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {categories.map(category => (
                        <div
                            key={category.id}
                            onClick={() => openCategory(category)}
                            className="glass-card"
                            style={{
                                background: 'var(--card-bg)',
                                borderRadius: '14px',
                                padding: '18px',
                                cursor: 'pointer',
                                border: '1px solid var(--glass-border)',
                                textAlign: 'center',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{category.icon}</div>
                            <div style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '14px' }}>{category.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-color-muted)', marginTop: '4px' }}>
                                {getHadithsByCategory(category.id).length} {t('hadith.count_suffix', 'hadis')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Favori buton */}
                {favorites.length > 0 && (
                    <div
                        onClick={() => {
                            setSelectedCategory({ id: 'favorites', name: t('common.favorites', 'Favoriler'), icon: '❤️' });
                            setView('category');
                        }}
                        style={{
                            background: '#e74c3c',
                            borderRadius: '14px',
                            padding: '16px',
                            marginTop: '16px',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <Heart size={20} fill="white" />
                        <span style={{ fontWeight: '600' }}>{t('common.my_favorites', 'Favorilerim')} ({favorites.length})</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Hadiths;
