import { useState } from 'react';
import { Download, Share2, Heart, ChevronRight, X, Grid, Image as ImageIcon } from 'lucide-react';
import { MULTIMEDIA_CATEGORIES, DUA_IMAGES, getImagesByCategory } from '../data/multimediaData';
import IslamicBackButton from './shared/IslamicBackButton';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

function Multimedia({ onClose }) {
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [favorites, setFavorites] = useState(() => {
        return JSON.parse(localStorage.getItem('multimedia_favorites') || '[]');
    });
    const [setLoading] = useState({});

    // Toggle favorite
    const toggleFavorite = (imageId) => {
        const newFavorites = favorites.includes(imageId)
            ? favorites.filter(id => id !== imageId)
            : [...favorites, imageId];
        setFavorites(newFavorites);
        localStorage.setItem('multimedia_favorites', JSON.stringify(newFavorites));
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
                // console.log('Share error:', err);
            }
        }
    };

    // Download image
    const downloadImage = async (image) => {
        try {
            setLoading(prev => ({ ...prev, [image.id]: true }));

            if (image.url) {
                // For external images, open in new tab (download not possible due to CORS)
                window.open(image.url, '_blank');
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
        <div>
            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '20px' }}>
                Dini görseller, dualar ve paylaşılabilir içerikler
            </p>

            {/* Category Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
            }}>
                {MULTIMEDIA_CATEGORIES.map(category => (
                    <div
                        key={category.id}
                        className="glass-card"
                        style={{
                            padding: '20px',
                            cursor: 'pointer',
                            textAlign: 'center'
                        }}
                        onClick={() => setActiveCategory(category.id)}
                    >
                        <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>
                            {category.icon}
                        </span>
                        <div style={{
                            fontWeight: '700',
                            color: 'var(--primary-color)',
                            fontSize: '14px',
                            marginBottom: '4px'
                        }}>
                            {category.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-color-muted)' }}>
                            {category.count} görsel
                        </div>
                    </div>
                ))}
            </div>

            {/* Favorites section */}
            {favorites.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <h3 style={{
                        color: 'var(--primary-color)',
                        fontSize: '16px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Heart size={18} fill="var(--primary-color)" />
                        Favorilerim ({favorites.length})
                    </h3>
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
                <div>
                    <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                        Paylaşabileceğiniz dua kartları
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {DUA_IMAGES.map(dua => (
                            <div
                                key={dua.id}
                                style={{
                                    background: dua.bgColor,
                                    borderRadius: '16px',
                                    padding: '20px',
                                    minHeight: '180px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                                onClick={() => setSelectedImage({ ...dua, type: 'dua' })}
                            >
                                <div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: dua.textColor,
                                        opacity: 0.8,
                                        marginBottom: '8px'
                                    }}>
                                        {dua.title}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: dua.textColor,
                                        fontWeight: '600',
                                        lineHeight: '1.5'
                                    }}>
                                        "{dua.text}"
                                    </div>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '12px'
                                }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(dua.id); }}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Heart
                                            size={16}
                                            color={dua.textColor}
                                            fill={favorites.includes(dua.id) ? dua.textColor : 'transparent'}
                                        />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); shareImage(dua); }}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Share2 size={16} color={dua.textColor} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Regular image gallery
        const images = getImagesByCategory(activeCategory);

        return (
            <div>
                <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                    {category?.description}
                </p>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px'
                }}>
                    {images.map(image => (
                        <div
                            key={image.id}
                            className="glass-card"
                            style={{
                                padding: '0',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            onClick={() => setSelectedImage({ ...image, type: 'image' })}
                        >
                            <div style={{
                                width: '100%',
                                height: '120px',
                                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
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
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                {/* Fallback icon */}
                                <ImageIcon
                                    size={40}
                                    color="rgba(255,255,255,0.3)"
                                    style={{ position: 'absolute' }}
                                />
                            </div>
                            <div style={{ padding: '12px' }}>
                                <div style={{
                                    fontWeight: '600',
                                    color: 'var(--primary-color)',
                                    fontSize: '13px',
                                    marginBottom: '2px'
                                }}>
                                    {image.title}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-color-muted)' }}>
                                    {image.location || image.description}
                                </div>
                            </div>
                            {/* Favorite button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(image.id); }}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Heart
                                    size={14}
                                    color="#fff"
                                    fill={favorites.includes(image.id) ? '#ff6b6b' : 'transparent'}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render image detail modal
    const renderImageDetail = () => {
        if (!selectedImage) return null;

        const isDua = selectedImage.type === 'dua';

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.95)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Modal Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <button
                        onClick={() => setSelectedImage(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    >
                        <X size={24} />
                    </button>
                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>
                        {selectedImage.title}
                    </div>
                    <div style={{ width: '40px' }} />
                </div>

                {/* Image Content */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    {isDua ? (
                        <div style={{
                            background: selectedImage.bgColor,
                            borderRadius: '20px',
                            padding: '40px',
                            maxWidth: '350px',
                            width: '100%',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '18px',
                                color: selectedImage.textColor,
                                opacity: 0.8,
                                marginBottom: '16px'
                            }}>
                                {selectedImage.title}
                            </div>
                            <div style={{
                                fontSize: '22px',
                                color: selectedImage.textColor,
                                fontWeight: '600',
                                lineHeight: '1.6'
                            }}>
                                "{selectedImage.text}"
                            </div>
                            <div style={{
                                marginTop: '24px',
                                fontSize: '12px',
                                color: selectedImage.textColor,
                                opacity: 0.6
                            }}>
                                🕌 Huzur Uygulaması
                            </div>
                        </div>
                    ) : (
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.title}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '60vh',
                                borderRadius: '12px',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </div>

                {/* Image Info */}
                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff'
                }}>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                        {selectedImage.location || selectedImage.description || ''}
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '16px 20px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <button
                        onClick={() => toggleFavorite(selectedImage.id)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '14px',
                            background: favorites.includes(selectedImage.id)
                                ? 'rgba(255,107,107,0.2)'
                                : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        <Heart
                            size={18}
                            fill={favorites.includes(selectedImage.id) ? '#ff6b6b' : 'transparent'}
                        />
                        Favori
                    </button>
                    <button
                        onClick={() => shareImage(selectedImage)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '14px',
                            background: 'var(--primary-color)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        <Share2 size={18} />
                        Paylaş
                    </button>
                    {!isDua && (
                        <button
                            onClick={() => downloadImage(selectedImage)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '14px',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            <Download size={18} />
                            İndir
                        </button>
                    )}
                </div>
            </div>
        );
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
                <IslamicBackButton onClick={goBack} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    🎬 {activeCategory
                        ? MULTIMEDIA_CATEGORIES.find(c => c.id === activeCategory)?.title
                        : 'Multimedya'}
                </h1>
            </div>

            {/* Content */}
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {!activeCategory && renderCategories()}
                {activeCategory && renderCategoryContent()}
            </div>

            {/* Image Detail Modal */}
            {renderImageDetail()}
        </div>
    );
}

export default Multimedia;
