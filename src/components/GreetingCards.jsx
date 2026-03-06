import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Heart, ChevronRight, X, Edit3, Check, Download, Image } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { GREETING_CATEGORIES, getCardsByCategory } from '../data/greetingCardsData';
import { storageService } from '../services/storageService';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
// html2canvas is dynamically imported when needed to reduce initial bundle size

const GREETING_FAVORITES_KEY = 'greeting_favorites';

function GreetingCards({ onClose }) {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [favorites, setFavorites] = useState(() => {
        return storageService.getItem(GREETING_FAVORITES_KEY, []);
    });
    const cardRef = useRef(null);

    // Toggle favorite
    const toggleFavorite = (cardId) => {
        const newFavorites = favorites.includes(cardId)
            ? favorites.filter(id => id !== cardId)
            : [...favorites, cardId];
        setFavorites(newFavorites);
        storageService.setItem(GREETING_FAVORITES_KEY, newFavorites);
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
            
            const message = `${t(selectedCard.titleKey)}\n\n${customMessage || t(selectedCard.messageKey)}\n\n- ${t('greetingCards.ui.sentWith')}`;

            // Handle Native Share
            if (Capacitor.isNativePlatform()) {
                // For native, we can share the text at least. 
                // Sharing file from blob requires Filesystem plugin to save first.
                // For now, let's ensure the native share dialog opens with text.
                await Share.share({
                    title: t(selectedCard.titleKey),
                    text: message,
                    dialogTitle: t('greetingCards.ui.shareTitle', 'Tebrik Kartını Paylaş')
                });
                return;
            }

            // Create file from blob for Web Share API
            const file = new File([blob], 'tebrik-karti.png', { type: 'image/png' });
            
            // Check if Web Share API supports files
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: t(selectedCard.titleKey),
                    text: t('greetingCards.ui.sentWith')
                });
            } else if (navigator.share) {
                // Fallback: Share without files (text only)
                await navigator.share({
                    title: t(selectedCard.titleKey),
                    text: message
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
        <div className="reveal-stagger">
            <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '24px', fontWeight: '600', padding: '0 4px' }}>
                {t('greetingCards.ui.subtitle')}
            </p>

            {/* Category Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
            }}>
                {GREETING_CATEGORIES.map((category, index) => (
                    <div
                        key={category.id}
                        className="settings-card reveal-stagger"
                        style={{
                            padding: '24px 16px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            '--delay': `${index * 0.05}s`
                        }}
                        onClick={() => setActiveCategory(category.id)}
                    >
                        <div className="settings-icon-box" style={{ 
                            width: '64px', height: '64px', 
                            background: 'var(--nav-hover)',
                            fontSize: '2.5rem',
                            borderRadius: '20px'
                        }}>
                            {category.icon}
                        </div>
                        <div>
                            <div style={{
                                fontWeight: '950',
                                color: 'var(--nav-text)',
                                fontSize: '1rem',
                                marginBottom: '4px'
                            }}>
                                {t(category.titleKey)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '600', lineHeight: '1.4' }}>
                                {t(category.descKey)}
                            </div>
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
                <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600', padding: '0 4px' }}>
                    {t(category?.descKey)}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cards.map((card, index) => (
                        <div
                            key={card.id}
                            className="reveal-stagger"
                            style={{
                                background: card.bgGradient,
                                borderRadius: '24px',
                                padding: '24px',
                                cursor: 'pointer',
                                position: 'relative',
                                '--delay': `${index * 0.05}s`,
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                overflow: 'hidden'
                            }}
                            onClick={() => {
                                setSelectedCard(card);
                                setCustomMessage(t(card.messageKey));
                            }}
                        >
                            {/* Decorative background element */}
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                fontSize: '80px',
                                opacity: 0.1,
                                transform: 'rotate(15deg)',
                                pointerEvents: 'none'
                            }}>
                                {card.decoration}
                            </div>

                            <div style={{
                                fontSize: '2rem',
                                marginBottom: '12px',
                                textAlign: 'center',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {card.decoration}
                            </div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: '950',
                                color: card.textColor,
                                textAlign: 'center',
                                marginBottom: '8px',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {t(card.titleKey)}
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                color: card.textColor,
                                textAlign: 'center',
                                opacity: 0.9,
                                lineHeight: '1.6',
                                position: 'relative',
                                zIndex: 1,
                                padding: '0 10px'
                            }}>
                                {t(card.messageKey)}
                            </div>

                            {/* Favorite button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(card.id); }}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    background: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    zIndex: 2,
                                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                            >
                                <Heart
                                    size={18}
                                    color={favorites.includes(card.id) ? '#ff4757' : '#fff'}
                                    fill={favorites.includes(card.id) ? '#ff4757' : 'transparent'}
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
                        borderRadius: '24px',
                        padding: '40px 24px',
                        marginBottom: '24px',
                        textAlign: 'center',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '-30px',
                        right: '-30px',
                        fontSize: '120px',
                        opacity: 0.08,
                        transform: 'rotate(15deg)',
                        pointerEvents: 'none'
                    }}>
                        {selectedCard.decoration}
                    </div>

                    <div style={{ fontSize: '3.5rem', marginBottom: '16px', position: 'relative' }}>
                        {selectedCard.decoration}
                    </div>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '950',
                        color: selectedCard.textColor,
                        marginBottom: '20px',
                        position: 'relative'
                    }}>
                        {t(selectedCard.titleKey)}
                    </div>

                    {recipientName && (
                        <div style={{
                            fontSize: '1.1rem',
                            color: selectedCard.textColor,
                            marginBottom: '16px',
                            fontStyle: 'italic',
                            fontWeight: '600',
                            position: 'relative'
                        }}>
                            {t('greetingCards.ui.dear', { name: recipientName })}
                        </div>
                    )}

                    <div style={{
                        fontSize: '1.05rem',
                        color: selectedCard.textColor,
                        lineHeight: '1.8',
                        opacity: 0.95,
                        whiteSpace: 'pre-wrap',
                        fontWeight: '500',
                        position: 'relative'
                    }}>
                        {editMode ? customMessage : t(selectedCard.messageKey)}
                    </div>

                    <div style={{
                        marginTop: '24px',
                        fontSize: '0.75rem',
                        color: selectedCard.textColor,
                        opacity: 0.6,
                        fontWeight: '700',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        position: 'relative'
                    }}>
                        🕌 {t('greetingCards.ui.appName')}
                    </div>
                </div>

                {/* Recipient Name */}
                <div className="settings-card" style={{ padding: '20px', marginBottom: '12px', flexDirection: 'column', alignItems: 'stretch' }}>
                    <label style={{
                        fontSize: '0.75rem',
                        color: 'var(--nav-text-muted)',
                        display: 'block',
                        marginBottom: '10px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
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
                            padding: '14px 18px',
                            background: 'var(--nav-hover)',
                            border: '1px solid var(--nav-border)',
                            borderRadius: '14px',
                            color: 'var(--nav-text)',
                            fontSize: '1rem',
                            outline: 'none',
                            fontWeight: '600',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--nav-accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--nav-border)'}
                    />
                </div>

                {/* Edit Message Toggle */}
                <div className="settings-card" style={{ padding: '20px', marginBottom: '16px', flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: editMode ? '16px' : '0'
                    }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--nav-text)', fontWeight: '800' }}>
                            {t('greetingCards.ui.editMessage')}
                        </span>
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className="velocity-target-btn"
                            style={{
                                padding: '8px 16px',
                                background: editMode ? 'var(--nav-accent)' : 'var(--nav-hover)',
                                color: editMode ? 'white' : 'var(--nav-text)',
                                borderRadius: '12px',
                                fontSize: '0.8rem'
                            }}
                        >
                            {editMode ? <Check size={16} /> : <Edit3 size={16} />}
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
                                padding: '16px',
                                background: 'var(--nav-hover)',
                                border: '1px solid var(--nav-border)',
                                borderRadius: '14px',
                                color: 'var(--nav-text)',
                                fontSize: '0.95rem',
                                outline: 'none',
                                resize: 'none',
                                lineHeight: '1.6',
                                fontWeight: '500',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--nav-accent)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--nav-border)'}
                        />
                    )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => toggleFavorite(selectedCard.id)}
                        className="settings-card"
                        style={{
                            flex: 1,
                            padding: '16px',
                            background: favorites.includes(selectedCard.id)
                                ? 'rgba(255,107,107,0.1)'
                                : 'var(--nav-hover)',
                            border: favorites.includes(selectedCard.id)
                                ? '1px solid #ff6b6b'
                                : '1px solid var(--nav-border)',
                            borderRadius: '16px',
                            color: favorites.includes(selectedCard.id) ? '#ff6b6b' : 'var(--nav-text)',
                            justifyContent: 'center'
                        }}
                    >
                        <Heart
                            size={20}
                            fill={favorites.includes(selectedCard.id) ? '#ff6b6b' : 'transparent'}
                            color={favorites.includes(selectedCard.id) ? '#ff6b6b' : 'var(--nav-text)'}
                        />
                    </button>
                    <button
                        onClick={shareCard}
                        disabled={isSharing}
                        className="velocity-target-btn pulse"
                        style={{
                            flex: 3,
                            padding: '16px',
                            background: isSharing ? 'var(--nav-text-muted)' : 'var(--nav-accent)',
                            color: 'white',
                            justifyContent: 'center',
                            fontSize: '1rem'
                        }}
                    >
                        {isSharing ? (
                            <>⏳ {t('greetingCards.ui.preparing')}</>
                        ) : (
                            <>
                                <Image size={20} />
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
        <div className="settings-container reveal-stagger" style={{ paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <IslamicBackButton onClick={goBack} size="medium" />
                <h2 style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    color: 'var(--nav-text)',
                    fontWeight: '950'
                }}>
                    {getTitle()}
                </h2>
            </div>

            {/* Content orientation fix */}
            <div className="reveal-stagger">
                {!activeCategory && !selectedCard && renderCategories()}
                {activeCategory && !selectedCard && renderCategoryCards()}
                {selectedCard && renderCardDetail()}
            </div>
        </div>
    );
}

export default GreetingCards;
