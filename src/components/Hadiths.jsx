import { useState, useEffect } from 'react';
import { ChevronLeft, Heart, Share2, BookOpen, Star, Sparkles, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import IslamicBackButton from './shared/IslamicBackButton';
import { contentService } from '../services/contentService';
import { storageService } from '../services/storageService';
import './Hadiths.css';
import './Navigation.css';

const HADITH_FAVORITES_KEY = 'hadithFavorites';

const Hadiths = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const [view, setView] = useState('home'); 
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedHadith, setSelectedHadith] = useState(null);
    const [categories, setCategories] = useState([]);
    const [allHadiths, setAllHadiths] = useState([]);
    const [dailyHadith, setDailyHadith] = useState(null);
    const [loading, setLoading] = useState(true);

    const [favorites, setFavorites] = useState(() => {
        return storageService.getItem(HADITH_FAVORITES_KEY, []);
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await contentService.getHadiths(i18n.language);
                setCategories(data.categories || []);
                setAllHadiths(data.hadiths || []);
                if (data.hadiths && data.hadiths.length > 0) {
                    const today = new Date();
                    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
                    setDailyHadith(data.hadiths[dayOfYear % data.hadiths.length]);
                }
            } catch (err) {
                console.error('Fetch hadiths error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [i18n.language]);

    const toggleFavorite = (hadithId) => {
        let newFavorites = favorites.includes(hadithId)
            ? favorites.filter(id => id !== hadithId)
            : [...favorites, hadithId];
        setFavorites(newFavorites);
        storageService.setItem(HADITH_FAVORITES_KEY, newFavorites);
        if (navigator.vibrate) navigator.vibrate(20);
    };

    const handleShare = async (hadith) => {
        const title = t('hadith.title', 'Hadis-i Şerif');
        const text = `📖 ${title}\n\n"${hadith.text}"\n\n— ${hadith.narrator}\n(${hadith.source})\n\n- Huzur Uygulaması`;
        try {
            if (Capacitor.isNativePlatform()) {
                await Share.share({ title, text, dialogTitle: 'Hadisi Paylaş' });
                return;
            }
            if (navigator.share) {
                await navigator.share({ title, text });
            } else {
                await navigator.clipboard.writeText(text);
                alert(t('common.copied', 'Panoya kopyalandı!'));
            }
        } catch (err) { console.error('Share error:', err); }
    };

    const goBack = () => {
        if (view === 'detail') {
            setView(selectedCategory ? 'category' : 'home');
            setSelectedHadith(null);
        } else if (view === 'category') {
            setView('home');
            setSelectedCategory(null);
        } else {
            onClose();
        }
    };

    const getHadithsByCategory = (categoryId) => {
        if (categoryId === 'favorites') return allHadiths.filter(h => favorites.includes(h.id));
        return allHadiths.filter(h => h.category === categoryId);
    };

    if (loading) {
        return (
            <div className="settings-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner premium"></div>
            </div>
        );
    }

    // --- DETAIL VIEW ---
    if (view === 'detail' && selectedHadith) {
        const isFav = favorites.includes(selectedHadith.id);
        const category = categories.find(c => c.id === selectedHadith.category);

        return (
            <div className="settings-container reveal-stagger">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <IslamicBackButton onClick={goBack} size="medium" />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className={`velocity-target-btn ${isFav ? 'active' : ''}`} onClick={() => toggleFavorite(selectedHadith.id)}>
                            <Heart size={20} fill={isFav ? '#ef4444' : 'transparent'} color={isFav ? '#ef4444' : 'currentColor'} />
                        </button>
                        <button className="velocity-target-btn" onClick={() => handleShare(selectedHadith)}>
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                <div className="settings-card" style={{ flexDirection: 'column', gap: '24px', padding: '32px', textAlign: 'center', minHeight: '60vh', justifyContent: 'center' }}>
                    {category && (
                        <div className="hadith-category-badge" style={{ background: category.color || 'var(--nav-accent)' }}>
                            {category.icon} {category.name}
                        </div>
                    )}

                    <div style={{ fontFamily: 'var(--arabic-font)', fontSize: '2rem', color: 'var(--nav-text)', lineHeight: '1.8', direction: 'rtl' }}>
                        {selectedHadith.arabic}
                    </div>

                    <div style={{ fontSize: '1.25rem', color: 'var(--nav-text)', lineHeight: '1.7', fontStyle: 'italic', padding: '0 10px' }}>
                        "{selectedHadith.text}"
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <div style={{ fontWeight: '800', color: 'var(--nav-accent)', fontSize: '1.1rem' }}>{selectedHadith.narrator}</div>
                        <div style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>({selectedHadith.source})</div>
                    </div>
                </div>
            </div>
        );
    }

    // --- CATEGORY VIEW ---
    if (view === 'category' && selectedCategory) {
        const categoryHadiths = getHadithsByCategory(selectedCategory.id);

        return (
            <div className="settings-container reveal-stagger">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <IslamicBackButton onClick={goBack} size="medium" />
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                        {selectedCategory.icon} {selectedCategory.name}
                    </h2>
                </div>

                <div className="settings-group">
                    {categoryHadiths.map((hadith, index) => (
                        <div 
                            key={hadith.id} 
                            className="settings-card reveal-stagger" 
                            style={{ padding: '20px', cursor: 'pointer', '--delay': `${index * 0.05}s` }}
                            onClick={() => { setSelectedHadith(hadith); setView('detail'); }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1rem', color: 'var(--nav-text)', lineHeight: '1.6', fontStyle: 'italic' }}>
                                    "{hadith.text.substring(0, 100)}{hadith.text.length > 100 ? '...' : ''}"
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', marginTop: '8px', fontWeight: '800' }}>
                                    {hadith.source}
                                </div>
                            </div>
                            <ChevronRight size={20} color="var(--nav-border)" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- HOME VIEW ---
    return (
        <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BookOpen size={24} color="var(--nav-accent)" /> {t('hadith.title', 'Hadisler')}
                </h2>
            </div>

            {dailyHadith && (
                <div 
                    className="settings-card reveal-stagger" 
                    style={{ 
                        flexDirection: 'column', 
                        background: 'linear-gradient(135deg, var(--nav-accent), #f97316)', 
                        border: 'none', 
                        padding: '32px', 
                        color: 'white', 
                        marginBottom: '32px',
                        cursor: 'pointer',
                        boxShadow: '0 12px 24px rgba(249, 115, 22, 0.2)'
                    }}
                    onClick={() => { setSelectedHadith(dailyHadith); setView('detail'); }}
                >
                    <div style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                        <Sparkles size={14} fill="white" /> {t('hadith.daily', 'Günün Hadisi')}
                    </div>
                    <div style={{ fontSize: '1.1rem', lineHeight: '1.6', fontStyle: 'italic', fontWeight: '500' }}>
                        "{dailyHadith.text.substring(0, 150)}{dailyHadith.text.length > 150 ? '...' : ''}"
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '16px', fontWeight: '800', textAlign: 'right' }}>
                        — {dailyHadith.source}
                    </div>
                </div>
            )}

            <div className="settings-group">
                <div className="settings-group-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{t('hadith.categories', 'Kategoriler')}</span>
                    {favorites.length > 0 && (
                        <button 
                            className="hadith-fav-badge" 
                            onClick={() => {
                                setSelectedCategory({ id: 'favorites', name: t('common.favorites', 'Favoriler'), icon: '❤️' });
                                setView('category');
                            }}
                        >
                            <Heart size={12} fill="#ef4444" color="#ef4444" /> {favorites.length}
                        </button>
                    )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {categories.map((category, index) => {
                        const count = getHadithsByCategory(category.id).length;
                        return (
                            <div 
                                key={category.id} 
                                className="settings-card reveal-stagger" 
                                style={{ 
                                    flexDirection: 'column', 
                                    padding: '24px', 
                                    textAlign: 'center', 
                                    gap: '12px',
                                    '--delay': `${index * 0.03}s`,
                                    cursor: 'pointer'
                                }}
                                onClick={() => { setSelectedCategory(category); setView('category'); }}
                            >
                                <div style={{ fontSize: '2.5rem' }}>{category.icon}</div>
                                <div>
                                    <div style={{ fontWeight: '800', color: 'var(--nav-text)', fontSize: '0.9rem' }}>{category.name}</div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--nav-text-muted)', marginTop: '4px' }}>{count} {t('hadith.count_suffix', 'HADİS')}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="settings-card" style={{ background: 'var(--nav-hover)', border: 'none', marginTop: '32px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Info size={18} color="var(--nav-accent)" />
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                        {t('hadith.info_note', "Hadis-i Şerifler, Peygamber Efendimiz'in (s.a.v.) sözleri, fiilleri ve takrirleridir. İslam dininin Kur'an-ı Kerim'den sonraki ikinci temel kaynağıdır.")}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Hadiths;
