import { useState } from 'react';
import { Download, Share2, Heart, ChevronRight, X, Grid, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MULTIMEDIA_CATEGORIES, DUA_IMAGES, getImagesByCategory } from '../data/multimediaData';
import IslamicBackButton from './shared/IslamicBackButton';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { storageService } from '../services/storageService';
import { useToast } from '../hooks/useToast';

const MULTIMEDIA_FAVORITES_KEY = 'multimedia_favorites';

function Multimedia({ onClose }) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [favorites, setFavorites] = useState(() => {
        return storageService.getItem(MULTIMEDIA_FAVORITES_KEY, []);
    });
    const [, setLoading] = useState({});

    // Toggle favorite
    const toggleFavorite = (imageId) => {
        const newFavorites = favorites.includes(imageId)
            ? favorites.filter(id => id !== imageId)
            : [...favorites, imageId];
        setFavorites(newFavorites);
        storageService.setItem(MULTIMEDIA_FAVORITES_KEY, newFavorites);
    };

    // Share image using Capacitor Share plugin
    const shareImage = async (image) => {
        const appName = t('app.name', 'Huzur');
        const shareText = image.text
            ? `${image.title}\n\n"${image.text}"\n\n📱 ${appName}`
            : `${image.title} - ${image.location || image.description || ''}\n\n📱 ${appName}`;

        try {
            // On native platform, use Capacitor Share
            if (Capacitor.isNativePlatform()) {
                await Share.share({
                    title: image.title,
                    text: shareText,
                    url: image.url || '',
                    dialogTitle: t('common.share', 'Paylas')
                });
            } else if (navigator.share) {
                // Web fallback with native Web Share API
                await navigator.share({
                    title: image.title,
                    text: shareText,
                    url: image.url || window.location.href
                });
            } else {
                // Final fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareText);
                showToast('Paylaşım metni kopyalandı!', 'success');
            }
        } catch (err) {
            // User cancelled or error
            if (err.message !== 'Share canceled') {
                // 
            }
        }
    };

    // Download image
    const downloadImage = async (image) => {
        try {
            setLoading(prev => ({ ...prev, [image.id]: true }));

            if (image.url) {
                // For external images, open in new tab (download not possible due to CORS)
                const win = window.open(image.url, '_blank', 'noopener,noreferrer');
                if (win) {
                    win.opener = null;
                }
            } else {
                // For dua cards, we'll create a canvas and download
                showToast('Görsel yeni sekmede açılacak. Sağ tıklayıp "Resmi Kaydet" seçeneğini kullanabilirsiniz.', 'info');
            }
        } finally {
            setLoading(prev => ({ ...prev, [image.id]: false }));
        }
    };

    // Go back
    const goBack = () => {
        if (selectedImage) {
            setSelectedImage(null);
        } else if (activeCategory) {
            setActiveCategory(null);
        } else {
            onClose();
        }
    };

    // Render categories
    const renderCategories = () => (
        <div className="reveal-stagger">
            <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '24px', fontWeight: '600' }}>
                {t('multimedia.description', 'Islami gorseller, ozel tasarim dua kartlari ve paylasabilir manevi icerikler.')}
            </p>

            {/* Category Grid - Velocity Style */}
            <div className="grid-2 gap-16">
                {MULTIMEDIA_CATEGORIES.map((category, index) => (
                    <div
                        key={category.id}
                        className="settings-card reveal-stagger p-24 cursor-pointer flex-col items-center text-center gap-12"
                        style={{ '--delay': `${index * 0.1}s` }}
                        onClick={() => setActiveCategory(category.id)}
                    >
                        <div className="settings-icon-box w-48 h-48" style={{ background: 'var(--nav-hover)', fontSize: '2rem' }}>
                            {category.icon}
                        </div>
                        <div>
                            <div className="mb-4" style={{ fontWeight: '900', color: 'var(--nav-text)', fontSize: '1rem' }}>
                                {category.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                                {category.count} {t('multimedia.contentLabel', 'ICERIK')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Favorites section - Velocity Style */}
            {favorites.length > 0 && (
                <div className="settings-group reveal-stagger mt-32" style={{ '--delay': '0.5s' }}>
                    <div className="settings-group-title flex-center-gap-8">
                        <Heart size={18} fill="var(--nav-accent)" color="var(--nav-accent)" />
                        {t('multimedia.favorites', 'FAVORILERIM')} ({favorites.length})
                    </div>
                </div>
            )}
        </div>
    );

    // Render category content
    const renderCategoryContent = () => {
        if (!activeCategory) return null;
        const category = MULTIMEDIA_CATEGORIES.find(c => c.id === activeCategory);

        // Special handling for Dua images (they are generated cards)
        if (activeCategory === 'dualar') {
            return (
                <div className="reveal-stagger">
                    <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                        {t('multimedia.duaCardsDesc', 'Sevdiklerinizle paylasabileceginiz ozel tasarim dua kartlari.')}
                    </p>
                    <div className="grid-2 gap-16">
                        {DUA_IMAGES.map((dua, index) => (
                            <div
                                key={dua.id}
                                className="reveal-stagger rounded-24 p-24 flex flex-col justify-between cursor-pointer relative"
                                style={{
                                    '--delay': `${index * 0.05}s`,
                                    background: dua.bgColor,
                                    minHeight: '220px',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                onClick={() => setSelectedImage({ ...dua, type: 'dua' })}
                            >
                                <div className="absolute flex gap-8" style={{ top: '12px', right: '12px' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(dua.id); }}
                                        className="rounded-12 w-44 h-44 flex-center cursor-pointer"
                                        style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none' }}
                                    >
                                        <Heart
                                            size={18}
                                            color={dua.textColor}
                                            fill={favorites.includes(dua.id) ? dua.textColor : 'transparent'}
                                        />
                                    </button>
                                </div>
                                <div className="mt-20">
                                    <div className="uppercase mb-12" style={{ fontSize: '0.75rem', color: dua.textColor, opacity: 0.7, fontWeight: '800', letterSpacing: '1px' }}>
                                        {dua.title}
                                    </div>
                                    <div style={{ fontSize: '1rem', color: dua.textColor, fontWeight: '700', lineHeight: '1.6', fontStyle: 'italic' }}>
                                        "{dua.text}"
                                    </div>
                                </div>
                                <div className="flex justify-end mt-16">
                                    <div className="rounded-12 p-8 font-black flex-center-gap-6" style={{ background: 'rgba(255,255,255,0.2)', color: dua.textColor, fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); shareImage(dua); }}>
                                        <Share2 size={14} /> {t('common.share', 'Paylas')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Regular image gallery - Velocity Style
        const images = getImagesByCategory(activeCategory);

        return (
            <div className="reveal-stagger">
                <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                    {category?.description}
                </p>
                <div className="grid-2 gap-16">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className="settings-card reveal-stagger p-0 overflow-hidden cursor-pointer relative flex-col rounded-24"
                            style={{ '--delay': `${index * 0.05}s` }}
                            onClick={() => setSelectedImage({ ...image, type: 'image' })}
                        >
                            <div className="w-full flex-center relative overflow-hidden" style={{ height: '140px', background: 'var(--nav-hover)' }}>
                                <img
                                    src={image.thumbnail || image.url}
                                    alt={image.title}
                                    className="w-full h-full"
                                    style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                {/* Overlay Gradient */}
                                <div className="absolute pointer-events-none" style={{ bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
                                {/* Fallback icon */}
                                <ImageIcon
                                    size={32}
                                    color="var(--nav-text-muted)"
                                    className="absolute"
                                    style={{ opacity: 0.2 }}
                                />
                                {/* Favorite button over image */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(image.id); }}
                                    className="absolute rounded-12 w-44 h-44 flex-center cursor-pointer"
                                    style={{
                                        top: '12px',
                                        right: '12px',
                                        background: 'rgba(var(--nav-bg-rgb, 4, 47, 46), 0.82)',
                                        backdropFilter: 'blur(10px)',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <Heart
                                        size={16}
                                        color={favorites.includes(image.id) ? 'var(--error-color)' : 'var(--nav-text-muted)'}
                                        fill={favorites.includes(image.id) ? 'var(--error-color)' : 'transparent'}
                                    />
                                </button>
                            </div>
                            <div className="p-16">
                                <div className="mb-4" style={{ fontWeight: '800', color: 'var(--nav-text)', fontSize: '0.9rem' }}>
                                    {image.title}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                                    {image.location || image.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render image detail modal - Velocity Style
    const renderImageDetail = () => {
        if (!selectedImage) return null;
        const isDua = selectedImage.type === 'dua';

        return (
            <div className="reveal-stagger fixed inset-0 flex flex-col z-200" style={{ background: 'rgba(var(--nav-bg-rgb, 4, 47, 46), 0.98)', backdropFilter: 'blur(20px)' }}>
                {/* Modal Header */}
                <div className="flex-between-center px-20 py-24" style={{ borderBottom: '1px solid var(--nav-border)' }}>
                    <IslamicBackButton onClick={() => setSelectedImage(null)} size="medium" />
                    <div style={{ color: 'var(--nav-text)', fontWeight: '950', fontSize: '1.25rem' }}>
                        {selectedImage.title}
                    </div>
                    <div className="w-48" />
                </div>

                {/* Image Content Area */}
                <div className="flex-center p-24 grow">
                    {isDua ? (
                        <div className="reveal-stagger rounded-32 p-48 text-center relative overflow-hidden max-w-400 w-full" style={{ background: selectedImage.bgColor, boxShadow: '0 30px 60px rgba(0,0,0,0.15)' }}>
                            {/* Decorative elements */}
                            <div className="absolute rounded-full" style={{ top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)' }} />
                            
                            <div className="uppercase mb-24" style={{ fontSize: '1rem', color: selectedImage.textColor, opacity: 0.7, fontWeight: '800', letterSpacing: '2px' }}>
                                {selectedImage.title}
                            </div>
                            <div style={{ fontSize: '1.75rem', color: selectedImage.textColor, fontWeight: '900', lineHeight: '1.4', fontStyle: 'italic' }}>
                                "{selectedImage.text}"
                            </div>
                            <div className="mt-40 font-black" style={{ fontSize: '0.85rem', color: selectedImage.textColor, opacity: 0.6 }}>
                                🕌 {t('app.name', 'Huzur')}
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex-center">
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.title}
                                className="rounded-32"
                                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                            />
                        </div>
                    )}
                </div>

                {/* Footer Actions - Velocity Style */}
                <div className="flex gap-16 px-20 py-32" style={{ background: 'var(--nav-bg)', borderTop: '1px solid var(--nav-border)', borderRadius: '40px 40px 0 0', boxShadow: '0 -10px 30px rgba(0,0,0,0.03)' }}>
                    <button
                        onClick={() => toggleFavorite(selectedImage.id)}
                        className="settings-card flex-1 justify-center p-16 rounded-20 font-black"
                        style={{
                            background: favorites.includes(selectedImage.id) ? 'rgba(239, 68, 68, 0.12)' : 'var(--nav-hover)',
                            border: favorites.includes(selectedImage.id) ? '1px solid rgba(239, 68, 68, 0.28)' : '1px solid var(--nav-border)',
                            color: favorites.includes(selectedImage.id) ? 'var(--error-color)' : 'var(--nav-text)',
                            fontSize: '0.95rem',
                            gap: '10px'
                        }}
                    >
                        <Heart
                            size={20}
                            fill={favorites.includes(selectedImage.id) ? 'var(--error-color)' : 'transparent'}
                        />
                        {t('common.favorite', 'Favori')}
                    </button>
                    {!isDua && (
                        <button
                            onClick={() => downloadImage(selectedImage)}
                            className="settings-card flex-1 justify-center p-16 rounded-20 font-black"
                            style={{
                                background: 'var(--nav-hover)',
                                border: '1px solid var(--nav-border)',
                                color: 'var(--nav-text)',
                                fontSize: '0.95rem',
                                gap: '10px'
                            }}
                        >
                            <Download size={20} />
                            {t('common.save', 'Kaydet')}
                        </button>
                    )}
                    <button
                        onClick={() => shareImage(selectedImage)}
                        className="velocity-target-btn rounded-20 font-black"
                        style={{
                            flex: 1.5,
                            padding: '16px',
                            background: 'var(--nav-accent)',
                            color: 'white',
                            fontSize: '0.95rem',
                            gap: '10px',
                            width: 'auto',
                            boxShadow: '0 8px 16px rgba(var(--nav-accent-rgb, 249, 115, 22), 0.3)'
                        }}
                    >
                        <Share2 size={20} />
                        {t('common.share', 'Paylas')}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="settings-container reveal-stagger" style={{ padding: 0 }}>
            {/* Header - Velocity Style */}
            <div className="flex items-center gap-12 mb-24 px-20 py-24" style={{ background: 'linear-gradient(135deg, var(--nav-bg), var(--nav-hover))', borderBottom: '1px solid var(--nav-border)' }}>
                <IslamicBackButton onClick={goBack} size="medium" />
                <h1 className="m-0" style={{ fontSize: '1.5rem', color: 'var(--nav-text)', fontWeight: '900' }}>
                    {activeCategory
                        ? MULTIMEDIA_CATEGORIES.find(c => c.id === activeCategory)?.title
                        : t('multimedia.title', 'Multimedya')}
                </h1>
            </div>

            {/* Content Container - With Padding */}
            <div className="px-20 pb-40">

            {/* Content */}
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {!activeCategory && renderCategories()}
                {activeCategory && renderCategoryContent()}
            </div>

            {/* Image Detail Modal */}
            {renderImageDetail()}
            </div>
        </div>
    );
}

export default Multimedia;
