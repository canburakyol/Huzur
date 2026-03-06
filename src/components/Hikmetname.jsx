import { useState } from 'react';
import { Share2, RefreshCw, Heart, ChevronRight, Sparkles, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { HIKMET_CATEGORIES, HIKMETLER, getDailyHikmet, getHikmetByCategory, getRandomHikmet } from '../data/hikmetData';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';
import './Hikmetname.css';
import './Navigation.css';

const HIKMET_FAVORITES_KEY = 'hikmet_favorites';

function Hikmetname({ onClose }) {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState(null);
    const [dailyHikmet, setDailyHikmet] = useState(getDailyHikmet());
    const [favorites, setFavorites] = useState(() => {
        return storageService.getItem(HIKMET_FAVORITES_KEY, []);
    });

    const toggleFavorite = (hikmetId) => {
        const newFavorites = favorites.includes(hikmetId)
            ? favorites.filter(id => id !== hikmetId)
            : [...favorites, hikmetId];
        setFavorites(newFavorites);
        storageService.setItem(HIKMET_FAVORITES_KEY, newFavorites);
        if (navigator.vibrate) navigator.vibrate(20);
    };

    const getNewRandom = () => {
        setDailyHikmet(getRandomHikmet());
    };

    const shareHikmet = async (hikmet) => {
        const text = t('hikmet.shareText', {
            text: t(hikmet.text),
            source: t(hikmet.source),
            ref: hikmet.reference ? ` (${t(hikmet.reference)})` : '',
            appName: t('app.name')
        });

        try {
            if (Capacitor.isNativePlatform()) {
                await Share.share({ text, dialogTitle: t('hikmet.share', 'Paylaş') });
                return;
            }
            if (navigator.share) {
                await navigator.share({ text });
            } else {
                navigator.clipboard.writeText(text);
                alert(t('common.copied', 'Panoya kopyalandı!'));
            }
        } catch (err) { console.error('Share error:', err); }
    };

    const goBack = () => {
        if (activeCategory) {
            setActiveCategory(null);
        } else {
            onClose();
        }
    };

    const renderMainView = () => (
        <div className="reveal-stagger">
            {/* Daily Hikmet Card */}
            <div className="settings-card" style={{ 
                flexDirection: 'column', 
                background: 'linear-gradient(135deg, #8e44ad, #9b59b6)', 
                border: 'none', 
                padding: '32px', 
                textAlign: 'center', 
                color: 'white', 
                marginBottom: '32px',
                boxShadow: '0 12px 24px rgba(142, 68, 173, 0.2)',
                gap: '24px'
            }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <Sparkles size={14} fill="white" /> {t('hikmet.daily', 'Günün Hikmeti')}
                </div>

                <div style={{ fontSize: '1.25rem', color: 'white', fontStyle: 'italic', lineHeight: '1.7', fontWeight: '500' }}>
                    "{t(dailyHikmet.text)}"
                </div>

                <div>
                    <div style={{ fontSize: '1rem', fontWeight: '800' }}>— {t(dailyHikmet.source)}</div>
                    {dailyHikmet.reference && (
                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>{t(dailyHikmet.reference)}</div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button className={`velocity-target-btn ${favorites.includes(dailyHikmet.id) ? 'active' : ''}`} style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: 'white' }} onClick={() => toggleFavorite(dailyHikmet.id)}>
                        <Heart size={18} fill={favorites.includes(dailyHikmet.id) ? 'white' : 'transparent'} />
                    </button>
                    <button className="velocity-target-btn" style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: 'white' }} onClick={() => shareHikmet(dailyHikmet)}>
                        <Share2 size={18} />
                    </button>
                    <button className="velocity-target-btn" style={{ background: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: 'white' }} onClick={getNewRandom}>
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="settings-group">
                <div className="settings-group-title">{t('hikmet.categoriesTitle')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {HIKMET_CATEGORIES.map(category => (
                        <div key={category.id} className="settings-card" onClick={() => setActiveCategory(category.id)} style={{ padding: '20px', cursor: 'pointer' }}>
                            <div className="settings-icon-box" style={{ background: 'var(--nav-hover)', fontSize: '1.5rem' }}>
                                {category.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '800', color: 'var(--nav-text)', fontSize: '1rem' }}>{t(category.title)}</div>
                                <div className="settings-desc">{t(category.description)}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--nav-text-muted)', background: 'var(--nav-hover)', padding: '4px 10px', borderRadius: '10px' }}>
                                    {getHikmetByCategory(category.id).length}
                                </span>
                                <ChevronRight size={18} color="var(--nav-text-muted)" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Favorites Summary */}
            {favorites.length > 0 && (
                <div className="settings-group" style={{ marginTop: '32px' }}>
                    <div className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Heart size={16} fill="#ef4444" color="#ef4444" /> {t('hikmet.favorites')} ({favorites.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {HIKMETLER.filter(h => favorites.includes(h.id)).slice(0, 2).map(hikmet => (
                            <div key={hikmet.id} className="settings-card" style={{ padding: '16px', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--nav-text)', fontStyle: 'italic', lineHeight: '1.5' }}>"{t(hikmet.text)}"</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--nav-accent)' }}>— {t(hikmet.source)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderCategoryView = () => {
        const category = HIKMET_CATEGORIES.find(c => c.id === activeCategory);
        const hikmetler = getHikmetByCategory(activeCategory);

        return (
            <div className="reveal-stagger">
                <p className="settings-desc" style={{ marginBottom: '24px' }}>{t(category?.description)}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {hikmetler.map(hikmet => (
                        <div key={hikmet.id} className="settings-card" style={{ flexDirection: 'column', gap: '16px', padding: '24px' }}>
                            <div style={{ fontSize: '1.05rem', color: 'var(--nav-text)', lineHeight: '1.7', fontStyle: 'italic' }}>
                                "{t(hikmet.text)}"
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <div>
                                    <div style={{ fontWeight: '800', color: 'var(--nav-accent)', fontSize: '0.9rem' }}>— {t(hikmet.source)}</div>
                                    {hikmet.reference && <div style={{ fontSize: '0.7rem', color: 'var(--nav-text-muted)', marginTop: '2px' }}>{t(hikmet.reference)}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="icon-btn-small" onClick={() => toggleFavorite(hikmet.id)}>
                                        <Heart size={16} fill={favorites.includes(hikmet.id) ? '#ef4444' : 'transparent'} color={favorites.includes(hikmet.id) ? '#ef4444' : 'var(--nav-text-muted)'} />
                                    </button>
                                    <button className="icon-btn-small" onClick={() => shareHikmet(hikmet)}>
                                        <Share2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={goBack} size="medium" />
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                    {activeCategory ? t(HIKMET_CATEGORIES.find(c => c.id === activeCategory)?.title) : t('hikmet.title')}
                </h1>
            </div>

            {activeCategory ? renderCategoryView() : renderMainView()}

            <div className="settings-card" style={{ background: 'var(--nav-hover)', border: 'none', marginTop: '32px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Info size={18} color="var(--nav-accent)" />
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--nav-text-muted)', lineHeight: '1.5' }}>
                        {t('hikmet.info_note', "Hikmetname, İslam düşünce dünyasından seçilmiş veciz sözler, hikmetli ifadeler ve ders verici nükteler içermektedir. Ruhunuzu dinlendirecek ve yolunuzu aydınlatacak bilgileri burada bulabilirsiniz.")}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Hikmetname;
