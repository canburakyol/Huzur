import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { prayerCategories, prayers } from '../data/prayers';
import { X, ChevronLeft, BookOpen } from 'lucide-react';

function Prayers({ onClose }) {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPrayer, setSelectedPrayer] = useState(null);

    // İslami renk paleti
    const primaryGreen = '#047857';
    const lightGreen = '#10b981';
    const goldAccent = '#d97706';

    // Category view
    if (!selectedCategory) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(180deg, ${primaryGreen} 0%, #065f46 100%)`,
                zIndex: 1000,
                overflowY: 'auto',
                padding: '20px',
                paddingBottom: '100px'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'white' }}>
                            ☪️ {t('prayers.title')}
                        </h2>
                        <p style={{ margin: '6px 0 0 0', opacity: 0.8, fontSize: '14px', color: 'white' }}>
                            {prayerCategories.length} {t('prayers.categories')}, {prayers.length} {t('prayers.prayer')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* İslami Motif Banner */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '24px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Geometrik desen */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        opacity: 0.05,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='white' fill-opacity='1'/%3E%3C/svg%3E")`,
                        backgroundSize: '30px 30px'
                    }} />
                    <p style={{ 
                        margin: 0, 
                        color: 'white', 
                        fontSize: '16px', 
                        fontStyle: 'italic',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        "{t('prayers.quote')}"
                    </p>
                    <p style={{ 
                        margin: '8px 0 0', 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: '12px',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        — {t('prayers.quoteAuthor')}
                    </p>
                </div>

                {/* Categories Grid - 2 columns */}
                <div style={{
                    display: 'grid',
                    gap: '12px',
                    gridTemplateColumns: 'repeat(2, 1fr)'
                }}>
                    {prayerCategories.map((category) => {
                        const categoryPrayers = prayers.filter(p => p.category === category.id);
                        return (
                            <div
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                                    transition: 'transform 0.2s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Köşe süslemesi */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    width: '40px',
                                    height: '40px',
                                    background: `linear-gradient(135deg, ${lightGreen}20, ${goldAccent}20)`,
                                    borderRadius: '50%'
                                }} />
                                
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{category.icon}</div>
                                <h3 style={{ 
                                    margin: '0 0 4px 0', 
                                    fontSize: '14px', 
                                    fontWeight: '700', 
                                    color: primaryGreen,
                                    lineHeight: '1.3'
                                }}>
                                    {t(category.name)}
                                </h3>
                                <p style={{ 
                                    margin: 0, 
                                    fontSize: '11px', 
                                    color: '#6b7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <BookOpen size={12} /> {categoryPrayers.length} {t('prayers.prayer')}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Prayer list view
    if (selectedCategory && !selectedPrayer) {
        const category = prayerCategories.find(c => c.id === selectedCategory);
        const categoryPrayers = prayers.filter(p => p.category === selectedCategory);

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(180deg, ${primaryGreen} 0%, #065f46 100%)`,
                zIndex: 1000,
                overflowY: 'auto',
                padding: '20px',
                paddingBottom: '100px'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px',
                    gap: '12px'
                }}>
                    <button
                        onClick={() => setSelectedCategory(null)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div style={{ fontSize: '32px' }}>{category.icon}</div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '20px', color: 'white', fontWeight: '700' }}>
                            {t(category.name)}
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                            {categoryPrayers.length} {t('prayers.prayer')}
                        </p>
                    </div>
                </div>

                {/* Prayer List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {categoryPrayers.map((prayer) => (
                        <div
                            key={prayer.id}
                            onClick={() => setSelectedPrayer(prayer)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '14px',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: `linear-gradient(135deg, ${lightGreen}, ${primaryGreen})`,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '14px',
                                flexShrink: 0
                            }}>
                                {prayer.id}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '15px',
                                    color: '#1f2937',
                                    fontWeight: '600'
                                }}>
                                    {t(prayer.title)}
                                </h3>
                                <p style={{
                                    margin: '4px 0 0',
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {t(prayer.meaning)}
                                </p>
                            </div>
                            <ChevronLeft
                                size={18}
                                color="#9ca3af"
                                style={{ transform: 'rotate(180deg)', flexShrink: 0 }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Prayer detail view
    if (selectedPrayer) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(180deg, ${primaryGreen} 0%, #065f46 100%)`,
                zIndex: 1000,
                overflowY: 'auto',
                padding: '20px',
                paddingBottom: '100px'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px',
                    gap: '12px'
                }}>
                    <button
                        onClick={() => setSelectedPrayer(null)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h2 style={{ margin: 0, fontSize: '18px', color: 'white', flex: 1, fontWeight: '600' }}>
                        {t('prayers.prayerDetail')}
                    </h2>
                </div>

                {/* Prayer Content Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* İslami geometrik köşe süsü */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '80px',
                        height: '80px',
                        background: `linear-gradient(135deg, ${lightGreen}15, ${goldAccent}15)`,
                        borderBottomLeftRadius: '100%'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '60px',
                        height: '60px',
                        background: `linear-gradient(315deg, ${lightGreen}10, ${goldAccent}10)`,
                        borderTopRightRadius: '100%'
                    }} />

                    {/* Title */}
                    <h1 style={{
                        margin: '0 0 20px 0',
                        fontSize: '22px',
                        color: primaryGreen,
                        fontWeight: '700',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {t(selectedPrayer.title)}
                    </h1>

                    {/* Arabic Text */}
                    <div style={{
                        background: `linear-gradient(135deg, ${lightGreen}10, ${primaryGreen}10)`,
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '16px',
                        textAlign: 'center',
                        border: `1px solid ${lightGreen}30`
                    }}>
                        <p style={{
                            margin: 0,
                            fontSize: '24px',
                            fontFamily: "'Amiri', serif",
                            color: '#1f2937',
                            lineHeight: '2',
                            fontWeight: '500',
                            direction: 'rtl'
                        }}>
                            {selectedPrayer.arabic}
                        </p>
                    </div>

                    {/* Transliteration */}
                    <div style={{
                        background: `${goldAccent}10`,
                        borderRadius: '14px',
                        padding: '16px 20px',
                        marginBottom: '16px',
                        borderLeft: `4px solid ${goldAccent}`
                    }}>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: '11px',
                            color: goldAccent,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            ☪ {t('prayers.pronunciation')}
                        </h3>
                        <p style={{
                            margin: 0,
                            fontSize: '15px',
                            color: '#374151',
                            lineHeight: '1.6',
                            fontStyle: 'italic'
                        }}>
                            {selectedPrayer.transliteration}
                        </p>
                    </div>

                    {/* Meaning */}
                    <div style={{
                        background: `${primaryGreen}08`,
                        borderRadius: '14px',
                        padding: '16px 20px',
                        borderLeft: `4px solid ${primaryGreen}`
                    }}>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: '11px',
                            color: primaryGreen,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            ☪ {t('prayers.meaning')}
                        </h3>
                        <p style={{
                            margin: 0,
                            fontSize: '15px',
                            color: '#374151',
                            lineHeight: '1.7'
                        }}>
                            {t(selectedPrayer.meaning)}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default Prayers;
