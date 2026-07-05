import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import { prayerCategories, prayers } from '../../../data/prayers';
import { ChevronLeft, BookOpen } from 'lucide-react';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';

const IconMapper = ({ iconName, size = 24, strokeWidth = 2, color }) => {
    const IconComponent = LucideIcons[iconName] || LucideIcons.Book;
    return <IconComponent size={size} strokeWidth={strokeWidth} color={color} />;
};

function Prayers({ onClose }) {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPrayer, setSelectedPrayer] = useState(null);

    // İslami renk paleti
    const primaryGreen = 'var(--primary)';
    const lightGreen = 'var(--surface-container)';
    const goldAccent = 'var(--tertiary)';
    const textOnLight = 'var(--text-primary)';
    const textOnLightMuted = 'var(--text-secondary)';

    // Category view
    if (!selectedCategory) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'var(--bg-gradient-start, var(--surface-page))',
                backgroundImage: 'radial-gradient(at 0% 0%, var(--ambient-teal, rgba(15, 118, 110, 0.15)) 0px, transparent 50%), radial-gradient(at 100% 0%, var(--ambient-gold, rgba(180, 83, 9, 0.1)) 0px, transparent 50%), linear-gradient(135deg, var(--bg-gradient-start, var(--surface-page)) 0%, var(--bg-gradient-end, var(--surface-page)) 100%)',
                zIndex: 1000,
                overflowY: 'auto',
                padding: '20px',
                paddingBottom: '100px'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px'
                }}>
                    <IslamicBackButton onClick={onClose} size="medium" />
                    <div>
                        <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            ☪️ {t('prayers.title')}
                        </h2>
                        <p style={{ margin: '6px 0 0 0', opacity: 0.8, fontSize: '14px', color: 'var(--text-primary)' }}>
                            {prayerCategories.length} {t('prayers.categories')}, {prayers.length} {t('prayers.prayer')}
                        </p>
                    </div>
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
                        color: 'var(--text-primary)', 
                        fontSize: '16px', 
                        fontStyle: 'italic',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        "{t('prayers.quote')}"
                    </p>
                    <p style={{ 
                        margin: '8px 0 0', 
                        color: 'var(--text-secondary)', 
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
                                    background: 'var(--glass-bg)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    cursor: 'pointer',
                                    border: '1px solid var(--glass-border)',
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
                                
                                <div style={{ marginBottom: '8px', color: primaryGreen }}>
                                    <IconMapper iconName={category.icon} size={32} strokeWidth={1.5} />
                                </div>
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
                                    color: textOnLightMuted,
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
                background: 'var(--bg-gradient-start, var(--surface-page))',
                backgroundImage: 'radial-gradient(at 0% 0%, var(--ambient-teal, rgba(15, 118, 110, 0.15)) 0px, transparent 50%), radial-gradient(at 100% 0%, var(--ambient-gold, rgba(180, 83, 9, 0.1)) 0px, transparent 50%), linear-gradient(135deg, var(--bg-gradient-start, var(--surface-page)) 0%, var(--bg-gradient-end, var(--surface-page)) 100%)',
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
                            background: 'var(--surface-container-high)',
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div style={{ color: 'var(--text-primary)' }}>
                        <IconMapper iconName={category.icon} size={32} strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-primary)', fontWeight: '700' }}>
                            {t(category.name)}
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
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
                                background: 'var(--glass-bg)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '14px',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                border: '1px solid var(--glass-border)',
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
                                color: 'var(--text-primary)',
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
                                    color: textOnLight,
                                    fontWeight: '600'
                                }}>
                                    {t(prayer.title)}
                                </h3>
                                <p style={{
                                    margin: '4px 0 0',
                                    fontSize: '12px',
                                    color: textOnLightMuted,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {t(prayer.meaning)}
                                </p>
                            </div>
                            <ChevronLeft
                                size={18}
                                color="var(--text-on-light-muted)"
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
                background: 'var(--bg-gradient-start, var(--surface-page))',
                backgroundImage: 'radial-gradient(at 0% 0%, var(--ambient-teal, rgba(15, 118, 110, 0.15)) 0px, transparent 50%), radial-gradient(at 100% 0%, var(--ambient-gold, rgba(180, 83, 9, 0.1)) 0px, transparent 50%), linear-gradient(135deg, var(--bg-gradient-start, var(--surface-page)) 0%, var(--bg-gradient-end, var(--surface-page)) 100%)',
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
                            background: 'var(--surface-container-high)',
                            backdropFilter: 'blur(10px)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', flex: 1, fontWeight: '600' }}>
                        {t('prayers.prayerDetail')}
                    </h2>
                </div>

                {/* Prayer Content Card */}
                <div style={{
                    background: 'var(--surface-container-lowest)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid var(--outline-variant)',
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
                            fontFamily: "var(--arabic-font-family)",
                            color: textOnLight,
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
                            color: textOnLightMuted,
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
                            color: textOnLightMuted,
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

