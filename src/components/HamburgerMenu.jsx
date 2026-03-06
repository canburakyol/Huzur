import { useState, useEffect } from 'react';
import { 
    X, Moon, Home, Target, ScrollText, Type, Mic2, Heart, 
    GraduationCap, Settings, Library, Compass, Calendar, 
    BookOpen, PlayCircle, Palette, Hash, ClipboardList, 
    Tv, Quote, Sparkles, Book, Coins, Mic, MessageCircle, 
    Brain, MapPin, Clock, Wind, Map, Crown, CheckCircle2, ChevronRight,
    User, Award, Star
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGamification } from '../hooks/useGamification';
import { APP_VERSION } from '../constants';
import './Navigation.css';

function HamburgerMenu({ onSelectFeature, currentFeature, externalOpen, onClose, isPro }) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const { level, points, earnedBadges } = useGamification();
    const currentLevel = typeof level === 'object' ? (level?.level ?? 1) : (Number(level) || 1);

    // Menu items configuration with icons
    const MENU_ITEMS = [
        { id: 'huzurMode', icon: <Moon size={20} />, labelKey: 'menu.huzurMode', component: 'huzurMode' },
        { id: 'family', icon: <Home size={20} />, labelKey: 'family.title', component: 'family' },
        { id: 'dailyTasks', icon: <Target size={20} />, labelKey: 'menu.dailyTasks', component: 'dailyTasks' },
        { id: 'nuzulExplorer', icon: <ScrollText size={20} />, labelKey: 'menu.nuzulExplorer', component: 'nuzulExplorer' },
        { id: 'wordByWord', icon: <Type size={20} />, labelKey: 'menu.wordByWord', component: 'wordByWord' },
        { id: 'tajweedTutor', icon: <Mic2 size={20} />, labelKey: 'menu.tajweedTutor', component: 'tajweedTutor' },
        { id: 'prayers', icon: <Heart size={20} />, labelKey: 'menu.prayers', component: 'prayers' },
        { id: 'prayerTeacher', icon: <GraduationCap size={20} />, labelKey: 'menu.prayerTeacher', component: 'prayerTeacher' },
        { id: 'settings', icon: <Settings size={20} />, labelKey: 'menu.settings', component: 'settings' },
        { id: 'fontSettings', icon: <Type size={20} />, labelKey: 'menu.fontSettings', component: 'fontSettings' },
        { id: 'library', icon: <Library size={20} />, labelKey: 'menu.library', component: 'library' },
        { id: 'tespihat', icon: <Compass size={20} />, labelKey: 'menu.tespihat', component: 'tespihat' },
        { id: 'agenda', icon: <Calendar size={20} />, labelKey: 'menu.agenda', component: 'agenda' },
        { id: 'hatim', icon: <BookOpen size={20} />, labelKey: 'menu.hatim', component: 'hatimCoach' },
        { id: 'multimedia', icon: <PlayCircle size={20} />, labelKey: 'menu.multimedia', component: 'multimedia' },
        { id: 'theme', icon: <Palette size={20} />, labelKey: 'menu.theme', component: 'theme' },
        { id: 'imsakiye', icon: <Moon size={20} />, labelKey: 'menu.imsakiye', component: 'imsakiye' },
        { id: 'zikirmatik', icon: <Hash size={20} />, labelKey: 'menu.zikirmatik', component: 'zikirmatik' },
        { id: 'deedJournal', icon: <ClipboardList size={20} />, labelKey: 'menu.deedJournal', component: 'deedJournal' },
        { id: 'liveBroadcast', icon: <Tv size={20} />, labelKey: 'menu.liveBroadcast', component: 'liveBroadcast' },
        { id: 'hikmetname', icon: <Quote size={20} />, labelKey: 'menu.hikmetname', component: 'hikmetname' },
        { id: 'esmaUlHusna', icon: <Sparkles size={20} />, labelKey: 'menu.esmaUlHusna', component: 'esmaUlHusna' },
        { id: 'hadiths', icon: <Book size={20} />, labelKey: 'menu.hadiths', component: 'hadiths' },
        { id: 'zakat', icon: <Coins size={20} />, labelKey: 'menu.zakat', component: 'zakat' },
        { id: 'weeklySermon', icon: <Mic size={20} />, labelKey: 'menu.weeklySermon', component: 'weeklySermon' },
        { id: 'support', icon: <MessageCircle size={20} />, labelKey: 'menu.support', component: 'support' },
        { id: 'quranMemorize', icon: <Brain size={20} />, labelKey: 'menu.quranMemorize', component: 'quranMemorize' },
        { id: 'mosque', icon: <MapPin size={20} />, labelKey: 'menu.mosque', component: 'mosque' },
        { id: 'missedPrayers', icon: <Clock size={20} />, labelKey: 'menu.missedPrayers', component: 'missedPrayers' },
        { id: 'islamicMeditation', icon: <Wind size={20} />, labelKey: 'menu.islamicMeditation', component: 'islamicMeditation' },
        { id: 'seerahMap', icon: <Map size={20} />, labelKey: 'menu.seerahMap', component: 'seerahMap' },
        { id: 'pro', icon: <Crown size={20} />, labelKey: 'menu.goPro', component: 'pro' },
    ];

    useEffect(() => {
        if (externalOpen) {
            const timer = setTimeout(() => setIsOpen(true), 0);
            return () => clearTimeout(timer);
        }
    }, [externalOpen]);

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    const handleItemClick = (item) => {
        handleClose();
        onSelectFeature(item.component);
    };

    const topBadges = earnedBadges?.slice(0, 3) || [];

    return (
        <>
            {isOpen && (
                <div className="hamburger-overlay" onClick={handleClose}>
                    <div className="hamburger-menu" onClick={(e) => e.stopPropagation()}>
                        {/* Premium Header */}
                        <div className="hamburger-header">
                            {/* Close Button Inside Header */}
                            <button 
                                onClick={handleClose} 
                                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
                            >
                                <X size={18} />
                            </button>

                            <div className="hamburger-logo-area">
                                <span style={{ fontSize: '28px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}></span>
                                <div>
                                    <h2 className="hamburger-title" style={{ color: 'white' }}>{t('app.name')}</h2>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: '800', letterSpacing: '0.5px' }}>{t('app.tagline').toUpperCase()}</div>
                                </div>
                            </div>

                            <div className="hamburger-profile-section">
                                <div className="hamburger-avatar-box">
                                    <User size={28} color="white" />
                                </div>
                                    <div className="hamburger-user-info">
                                        <div className="hamburger-username">Huzur Yolcusu</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span className="hamburger-level-badge" style={{ background: 'var(--accent-gold)', color: 'white' }}>
                                                {t('gamification.level', 'Seviye')} {currentLevel}
                                            </span>
                                            <div style={{ fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold-shimmer)' }}>
                                                <Star size={12} fill="currentColor" /> {points ?? 0} XP
                                            </div>
                                        </div>
                                    </div>
                                {isPro && (
                                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.3)' }}>
                                        <Crown size={20} color="#fcd34d" fill="#fcd34d" />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                {topBadges.map((badge, i) => {
                                    const badgeId = typeof badge === 'string' ? badge : badge?.id;
                                    const badgeLabel = badgeId
                                        ? t(`badges.${badgeId}.name`, badgeId)
                                        : t('common.badge', 'Rozet');

                                    return (
                                    <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '800', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        🏆 {badgeLabel}
                                    </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="hamburger-scroll-area">
                            <div className="nav-grid">
                                {MENU_ITEMS.map((item, index) => {
                                    const isActive = currentFeature === item.component;
                                    let label = t(item.labelKey);
                                    let icon = item.icon;

                                    if (item.id === 'pro' && isPro) {
                                        label = t('menu.proMembership');
                                        icon = <CheckCircle2 size={20} color="var(--accent-gold)" />;
                                    }

                                    return (
                                        <div
                                            key={item.id}
                                            className={`nav-item reveal-stagger ${isActive ? 'active' : ''}`}
                                            onClick={() => handleItemClick(item)}
                                            style={{ '--delay': `${index * 0.03}s` }}
                                        >
                                            <div className="nav-icon-box">
                                                {icon}
                                            </div>
                                            <span className="nav-label">{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="hamburger-footer">
                            <span>v{APP_VERSION}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {t('menu.settings')} <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HamburgerMenu;
