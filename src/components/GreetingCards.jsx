import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Heart, ChevronRight, X, Edit3, Check, Download, Image } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { GREETING_CATEGORIES, getCardsByCategory } from '../data/greetingCardsData';
// html2canvas is dynamically imported when needed to reduce initial bundle size

function GreetingCards({ onClose }) {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [favorites, setFavorites] = useState(() => {
        return JSON.parse(localStorage.getItem('greeting_favorites') || '[]');
    });
    const cardRef = useRef(null);

    // Toggle favorite
    const toggleFavorite = (cardId) => {
        const newFavorites = favorites.includes(cardId)
            ? favorites.filter(id => id !== cardId)
            : [...favorites, cardId];
        setFavorites(newFavorites);
        localStorage.setItem('greeting_favorites', JSON.stringify(newFavorites));
    };

    // Share card as image
    const shareCard = async () => {
        if (!cardRef.current) return;
        
        setIsSharing(true);
        
        try {
            // Dynamic import - only loads when user actually shares (saves ~194KB on initial load)
            const html2canvas = (await import('html2canvas')).default;
            
            // Create canvas from the card element
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2, // Higher quality
                useCORS: true,
                logging: false
            });
            
            // Convert canvas to blob
            const blob = await new Promise(resolve => 
                canvas.toBlob(resolve, 'image/png', 1.0)
            );
            
            if (!blob) {
                throw new Error(t('greetingCards.ui.imageError'));
            }
            
            // Create file from blob
            const file = new File([blob], 'tebrik-karti.png', { type: 'image/png' });
            
            // Check if Web Share API supports files
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: t(selectedCard.titleKey),
                    text: t('greetingCards.ui.sentWith')
                });
            } else if (navigator.share) {
                // Fallback: Share without files (text only)
                const message = customMessage || t(selectedCard.messageKey);
                await navigator.share({
                    title: t(selectedCard.titleKey),
                    text: `${t(selectedCard.titleKey)}\n\n${message}\n\n- ${t('greetingCards.ui.sentWith')}`
                });
            } else {
                // Download as fallback
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'tebrik-karti.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert(t('greetingCards.ui.downloaded'));
            }
        } catch (err) {
            console.error('Share error:', err);
            if (err.name !== 'AbortError') {
                alert(t('greetingCards.ui.shareError'));
            }
        } finally {
            setIsSharing(false);
        }
    };

    // Go back
    const goBack = () => {
        if (selectedCard) {
            setSelectedCard(null);
            setEditMode(false);
            setCustomMessage('');
            setRecipientName('');
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
                {t('greetingCards.ui.subtitle')}
            </p>

            {/* Category Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
            }}>
                {GREETING_CATEGORIES.map(category => (
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
                        <span style={{ fontSize: '36px', display: 'block', marginBottom: '10px' }}>
                            {category.icon}
                        </span>
                        <div style={{
                            fontWeight: '700',
                            color: 'var(--primary-color)',
                            fontSize: '14px',
                            marginBottom: '4px'
                        }}>
                            {t(category.titleKey)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-color-muted)' }}>
                            {t(category.descKey)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Render category cards
    const renderCategoryCards = () => {
        if (!activeCategory) return null;

        const category = GREETING_CATEGORIES.find(c => c.id === activeCategory);
        const cards = getCardsByCategory(activeCategory);

        return (
            <div>
                <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                    {t(category?.descKey)}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cards.map(card => (
                        <div
                            key={card.id}
                            style={{
                                background: card.bgGradient,
                                borderRadius: '16px',
                                padding: '20px',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            onClick={() => {
                                setSelectedCard(card);
                                setCustomMessage(t(card.messageKey));
                            }}
                        >
                            <div style={{
                                fontSize: '24px',
                                marginBottom: '8px',
                                textAlign: 'center'
                            }}>
                                {card.decoration}
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '700',
                                color: card.textColor,
                                textAlign: 'center',
                                marginBottom: '8px'
                            }}>
                                {t(card.titleKey)}
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: card.textColor,
                                textAlign: 'center',
                                opacity: 0.9,
                                lineHeight: '1.5'
                            }}>
                                {t(card.messageKey)}
                            </div>

                            {/* Favorite button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(card.id); }}
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'rgba(0,0,0,0.3)',
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
                                    color="#fff"
                                    fill={favorites.includes(card.id) ? '#ff6b6b' : 'transparent'}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render card detail/editor
    const renderCardDetail = () => {
        if (!selectedCard) return null;

        return (
            <div>
                {/* Card Preview */}
                <div 
                    ref={cardRef}
                    style={{
                        background: selectedCard.bgGradient,
                        borderRadius: '20px',
                        padding: '30px 24px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                        {selectedCard.decoration}
                    </div>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: selectedCard.textColor,
                        marginBottom: '16px'
                    }}>
                        {t(selectedCard.titleKey)}
                    </div>

                    {recipientName && (
                        <div style={{
                            fontSize: '14px',
                            color: selectedCard.textColor,
                            marginBottom: '12px',
                            fontStyle: 'italic'
                        }}>
                            {t('greetingCards.ui.dear', { name: recipientName })}
                        </div>
                    )}

                    <div style={{
                        fontSize: '15px',
                        color: selectedCard.textColor,
                        lineHeight: '1.7',
                        opacity: 0.95
                    }}>
                        {editMode ? customMessage : t(selectedCard.messageKey)}
                    </div>

                    <div style={{
                        marginTop: '16px',
                        fontSize: '11px',
                        color: selectedCard.textColor,
                        opacity: 0.6
                    }}>
                        🕌 {t('greetingCards.ui.appName')}
                    </div>
                </div>

                {/* Recipient Name */}
                <div className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
                    <label style={{
                        fontSize: '12px',
                        color: 'var(--text-color-muted)',
                        display: 'block',
                        marginBottom: '8px'
                    }}>
                        {t('greetingCards.ui.recipientName')}
                    </label>
                    <input
                        type="text"
                        placeholder={t('greetingCards.ui.recipientPlaceholder')}
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            color: 'var(--text-color)',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Edit Message Toggle */}
                <div className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: editMode ? '12px' : '0'
                    }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-color)' }}>
                            {t('greetingCards.ui.editMessage')}
                        </span>
                        <button
                            onClick={() => setEditMode(!editMode)}
                            style={{
                                background: editMode ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '6px 12px',
                                color: '#fff',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            {editMode ? <Check size={14} /> : <Edit3 size={14} />}
                            {editMode ? t('greetingCards.ui.done') : t('greetingCards.ui.edit')}
                        </button>
                    </div>

                    {editMode && (
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-color)',
                                fontSize: '14px',
                                outline: 'none',
                                resize: 'none',
                                lineHeight: '1.5'
                            }}
                        />
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => toggleFavorite(selectedCard.id)}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: favorites.includes(selectedCard.id)
                                ? 'rgba(255,107,107,0.2)'
                                : 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'var(--text-color)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <Heart
                            size={18}
                            fill={favorites.includes(selectedCard.id) ? '#ff6b6b' : 'transparent'}
                            color={favorites.includes(selectedCard.id) ? '#ff6b6b' : 'var(--text-color)'}
                        />
                        {t('greetingCards.ui.favorite')}
                    </button>
                    <button
                        onClick={shareCard}
                        disabled={isSharing}
                        style={{
                            flex: 2,
                            padding: '14px',
                            background: isSharing ? '#666' : 'var(--primary-color)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: isSharing ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: isSharing ? 0.7 : 1
                        }}
                    >
                        {isSharing ? (
                            <>⏳ {t('greetingCards.ui.preparing')}</>
                        ) : (
                            <>
                                <Image size={18} />
                                {t('greetingCards.ui.shareAsImage')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    // Get title for header
    const getTitle = () => {
        if (selectedCard) return t(selectedCard.titleKey);
        if (activeCategory) {
            const category = GREETING_CATEGORIES.find(c => c.id === activeCategory);
            return category ? t(category.titleKey) : t('greetingCards.title');
        }
        return t('greetingCards.title');
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
                    fontSize: '20px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    💌 {getTitle()}
                </h1>
            </div>

            {/* Content */}
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {!activeCategory && !selectedCard && renderCategories()}
                {activeCategory && !selectedCard && renderCategoryCards()}
                {selectedCard && renderCardDetail()}
            </div>
        </div>
    );
}

export default GreetingCards;
