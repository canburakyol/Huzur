import { useState } from 'react';
import { Download, Share2, Heart, ChevronRight, X, Grid, Image as ImageIcon } from 'lucide-react';
import { MULTIMEDIA_CATEGORIES, DUA_IMAGES, getImagesByCategory } from '../data/multimediaData';
import IslamicBackButton from './shared/IslamicBackButton';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { storageService } from '../services/storageService';

const MULTIMEDIA_FAVORITES_KEY = 'multimedia_favorites';

function Multimedia({ onClose }) {
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [favorites, setFavorites] = useState(() => {
        return storageService.getItem(MULTIMEDIA_FAVORITES_KEY, []);
    });
    const [setLoading] = useState({});

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
        const shareText = image.text
            ? `${image.title}\n\n"${image.text}"\n\n📱 Huzur Uygulaması`
            : `${image.title} - ${image.location || image.description || ''}\n\n📱 Huzur Uygulaması`;

        try {
            // On native platform, use Capacitor Share
            if (Capacitor.isNativePlatform()) {
                await Share.share({
                    title: image.title,
                    text: shareText,
                    url: image.url || '',
                    dialogTitle: 'Paylaş'
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
                alert('Paylaşım metni kopyalandı!');
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
                alert('Görsel yeni sekmede açılacak. Sağ tıklayıp "Resmi Kaydet" seçeneğini kullanabilirsiniz.');
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
                İslami görseller, özel tasarım dua kartları ve paylaşılabilir manevi içerikler.
            </p>

            {/* Category Grid - Velocity Style */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
            }}>
                {MULTIMEDIA_CATEGORIES.map((category, index) => (
                    <div
                        key={category.id}
                        className="settings-card reveal-stagger"
                        style={{
                            '--delay': `${index * 0.1}s`,
                            padding: '24px 16px',
                            cursor: 'pointer',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '12px'
                        }}
                        onClick={() => setActiveCategory(category.id)}
                    >
                        <div className="settings-icon-box" style={{ 
                            width: '64px', 
                            height: '64px', 
                            background: 'var(--nav-hover)',
                            fontSize: '2rem'
                        }}>
                            {category.icon}
                        </div>
                        <div>
                            <div style={{
                                fontWeight: '900',
                                color: 'var(--nav-text)',
                                fontSize: '1rem',
                                marginBottom: '4px'
                            }}>
                                {category.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                                {category.count} İÇERİK
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Favorites section - Velocity Style */}
            {favorites.length > 0 && (
                <div className="settings-group reveal-stagger" style={{ marginTop: '32px', '--delay': '0.5s' }}>
                    <div className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Heart size={18} fill="var(--nav-accent)" color="var(--nav-accent)" />
                        FAVORİLERİM ({favorites.length})
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
                        Sevdiklerinizle paylaşabileceğiniz özel tasarım dua kartları.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                        {DUA_IMAGES.map((dua, index) => (
                            <div
                                key={dua.id}
                                className="reveal-stagger"
                                style={{
                                    '--delay': `${index * 0.05}s`,
                                    background: dua.bgColor,
                                    borderRadius: '24px',
                                    padding: '24px',
                                    minHeight: '220px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                onClick={() => setSelectedImage({ ...dua, type: 'dua' })}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    display: 'flex',
                                    gap: '8px'
                                }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(dua.id); }}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Heart
                                            size={18}
                                            color={dua.textColor}
                                            fill={favorites.includes(dua.id) ? dua.textColor : 'transparent'}
                                        />
                                    </button>
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: dua.textColor,
                                        opacity: 0.7,
                                        marginBottom: '12px',
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        {dua.title}
                                    </div>
                                    <div style={{
                                        fontSize: '1rem',
                                        color: dua.textColor,
                                        fontWeight: '700',
                                        lineHeight: '1.6',
                                        fontStyle: 'italic'
                                    }}>
                                        "{dua.text}"
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginTop: '16px'
                                }}>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        padding: '8px 12px',
                                        borderRadius: '12px',
                                        color: dua.textColor,
                                        fontSize: '0.75rem',
                                        fontWeight: '900',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }} onClick={(e) => { e.stopPropagation(); shareImage(dua); }}>
                                        <Share2 size={14} /> PAYLAŞ
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
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px'
                }}>
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className="settings-card reveal-stagger"
                            style={{
                                '--delay': `${index * 0.05}s`,
                                padding: '0',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                position: 'relative',
                                flexDirection: 'column',
                                borderRadius: '24px'
                            }}
                            onClick={() => setSelectedImage({ ...image, type: 'image' })}
                        >
                            <div style={{
                                width: '100%',
                                height: '140px',
                                background: 'var(--nav-hover)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={image.thumbnail || image.url}
                                    alt={image.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.5s ease'
                                    }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                {/* Overlay Gradient */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '50%',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
                                    pointerEvents: 'none'
                                }} />
                                {/* Fallback icon */}
                                <ImageIcon
                                    size={32}
                                    color="var(--nav-text-muted)"
                                    style={{ position: 'absolute', opacity: 0.2 }}
                                />
                                {/* Favorite button over image */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(image.id); }}
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        background: 'rgba(var(--nav-bg-rgb, 255,255,255), 0.8)',
                                        backdropFilter: 'blur(10px)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <Heart
                                        size={16}
                                        color={favorites.includes(image.id) ? '#ff4757' : 'var(--nav-text-muted)'}
                                        fill={favorites.includes(image.id) ? '#ff4757' : 'transparent'}
                                    />
                                </button>
                            </div>
                            <div style={{ padding: '16px' }}>
                                <div style={{
                                    fontWeight: '800',
                                    color: 'var(--nav-text)',
                                    fontSize: '0.9rem',
                                    marginBottom: '4px'
                                }}>
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
            <div className="reveal-stagger" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(var(--nav-bg-rgb, 255,255,255), 0.98)',
                backdropFilter: 'blur(20px)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Modal Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 20px',
                    borderBottom: '1px solid var(--nav-border)'
                }}>
                    <IslamicBackButton onClick={() => setSelectedImage(null)} size="medium" />
                    <div style={{ color: 'var(--nav-text)', fontWeight: '950', fontSize: '1.25rem' }}>
                        {selectedImage.title}
                    </div>
                    <div style={{ width: '48px' }} />
                </div>

                {/* Image Content Area */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    {isDua ? (
                        <div className="reveal-stagger" style={{
                            background: selectedImage.bgColor,
                            borderRadius: '32px',
                            padding: '48px 32px',
                            maxWidth: '400px',
                            width: '100%',
                            textAlign: 'center',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative elements */}
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                width: '100px',
                                height: '100px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%'
                            }} />
                            
                            <div style={{
                                fontSize: '1rem',
                                color: selectedImage.textColor,
                                opacity: 0.7,
                                marginBottom: '24px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '2px'
                            }}>
                                {selectedImage.title}
                            </div>
                            <div style={{
                                fontSize: '1.75rem',
                                color: selectedImage.textColor,
                                fontWeight: '900',
                                lineHeight: '1.4',
                                fontStyle: 'italic'
                            }}>
                                "{selectedImage.text}"
                            </div>
                            <div style={{
                                marginTop: '40px',
                                fontSize: '0.85rem',
                                color: selectedImage.textColor,
                                opacity: 0.6,
                                fontWeight: '900'
                            }}>
                                🕌 Huzur Uygulaması
                            </div>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.title}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    borderRadius: '32px',
                                    objectFit: 'contain',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Footer Actions - Velocity Style */}
                <div style={{
                    padding: '32px 20px',
                    display: 'flex',
                    gap: '16px',
                    background: 'var(--nav-bg)',
                    borderTop: '1px solid var(--nav-border)',
                    borderRadius: '40px 40px 0 0',
                    boxShadow: '0 -10px 30px rgba(0,0,0,0.03)'
                }}>
                    <button
                        onClick={() => toggleFavorite(selectedImage.id)}
                        className="settings-card"
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            padding: '16px',
                            background: favorites.includes(selectedImage.id) ? 'rgba(255,71,87,0.1)' : 'var(--nav-hover)',
                            border: favorites.includes(selectedImage.id) ? '1px solid #ff4757' : '1px solid var(--nav-border)',
                            borderRadius: '20px',
                            color: favorites.includes(selectedImage.id) ? '#ff4757' : 'var(--nav-text)',
                            fontSize: '0.95rem',
                            fontWeight: '900',
                            gap: '10px'
                        }}
                    >
                        <Heart
                            size={20}
                            fill={favorites.includes(selectedImage.id) ? '#ff4757' : 'transparent'}
                        />
                        FAVORİ
                    </button>
                    {!isDua && (
                        <button
                            onClick={() => downloadImage(selectedImage)}
                            className="settings-card"
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                padding: '16px',
                                background: 'var(--nav-hover)',
                                border: '1px solid var(--nav-border)',
                                borderRadius: '20px',
                                color: 'var(--nav-text)',
                                fontSize: '0.95rem',
                                fontWeight: '900',
                                gap: '10px'
                            }}
                        >
                            <Download size={20} />
                            KAYDET
                        </button>
                    )}
                    <button
                        onClick={() => shareImage(selectedImage)}
                        className="velocity-target-btn"
                        style={{
                            flex: 1.5,
                            padding: '16px',
                            background: 'var(--nav-accent)',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '0.95rem',
                            fontWeight: '900',
                            gap: '10px',
                            width: 'auto',
                            boxShadow: '0 8px 16px rgba(var(--nav-accent-rgb, 249, 115, 22), 0.3)'
                        }}
                    >
                        <Share2 size={20} />
                        PAYLAŞ
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="settings-container reveal-stagger" style={{ padding: 0 }}>
            {/* Header - Velocity Style */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                padding: '24px 20px',
                background: 'linear-gradient(135deg, var(--nav-bg), var(--nav-hover))',
                borderBottom: '1px solid var(--nav-border)'
            }}>
                <IslamicBackButton onClick={goBack} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    color: 'var(--nav-text)',
                    fontWeight: '900'
                }}>
                    {activeCategory
                        ? MULTIMEDIA_CATEGORIES.find(c => c.id === activeCategory)?.title
                        : 'Multimedya'}
                </h1>
            </div>

            {/* Content Container - With Padding */}
            <div style={{ padding: '0 20px 40px 20px' }}>

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
