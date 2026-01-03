import { useState, useEffect } from 'react';
import { X, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../constants';

function HamburgerMenu({ onSelectFeature, currentFeature, externalOpen, onClose, isPro }) {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    // Menu items configuration with icons - using translation keys
    const MENU_ITEMS = [
        { id: 'huzurMode', icon: '🌙', labelKey: 'menu.huzurMode', component: 'huzurMode' },
        { id: 'dailyTasks', icon: '🎯', labelKey: 'menu.dailyTasks', component: 'dailyTasks' },
        { id: 'nuzulExplorer', icon: '📜', labelKey: 'menu.nuzulExplorer', component: 'nuzulExplorer' },
        { id: 'wordByWord', icon: '📝', labelKey: 'menu.wordByWord', component: 'wordByWord' },
        { id: 'tajweedTutor', icon: '🎤', labelKey: 'menu.tajweedTutor', component: 'tajweedTutor' },
        { id: 'prayers', icon: '🤲', labelKey: 'menu.prayers', component: 'prayers' },
        { id: 'prayerTeacher', icon: '📿', labelKey: 'menu.prayerTeacher', component: 'prayerTeacher' },
        { id: 'settings', icon: '⚙️', labelKey: 'menu.settings', component: 'settings' },
        { id: 'fontSettings', icon: '🔤', labelKey: 'menu.fontSettings', component: 'fontSettings' },
        { id: 'library', icon: '📚', labelKey: 'menu.library', component: 'library' },
        { id: 'tespihat', icon: '🙏', labelKey: 'menu.tespihat', component: 'tespihat' },
        { id: 'agenda', icon: '📅', labelKey: 'menu.agenda', component: 'agenda' },
        { id: 'hatim', icon: '📖', labelKey: 'menu.hatim', component: 'hatim' },
        { id: 'multimedia', icon: '🎬', labelKey: 'menu.multimedia', component: 'multimedia' },
        { id: 'greetingCards', icon: '💌', labelKey: 'menu.greetingCards', component: 'greetingCards' },
        { id: 'theme', icon: '🎨', labelKey: 'menu.theme', component: 'theme' },
        { id: 'imsakiye', icon: '🌙', labelKey: 'menu.imsakiye', component: 'imsakiye' },
        { id: 'zikirmatik', icon: '📿', labelKey: 'menu.zikirmatik', component: 'zikirmatik' },
        { id: 'deedJournal', icon: '📝', labelKey: 'menu.deedJournal', component: 'deedJournal' },
        { id: 'liveBroadcast', icon: '📺', labelKey: 'menu.liveBroadcast', component: 'liveBroadcast' },
        { id: 'zikirWorld', icon: '🌍', labelKey: 'menu.zikirWorld', component: 'zikirWorld' },
        { id: 'hikmetname', icon: '📜', labelKey: 'menu.hikmetname', component: 'hikmetname' },
        { id: 'esmaUlHusna', icon: '✨', labelKey: 'menu.esmaUlHusna', component: 'esmaUlHusna' },
        { id: 'hadiths', icon: '📖', labelKey: 'menu.hadiths', component: 'hadiths' },
        { id: 'zakat', icon: '💰', labelKey: 'menu.zakat', component: 'zakat' },
        { id: 'weeklySermon', icon: '🎤', labelKey: 'menu.weeklySermon', component: 'weeklySermon' },
        { id: 'support', icon: '💬', labelKey: 'menu.support', component: 'support' },
        { id: 'quranMemorize', icon: '🧠', labelKey: 'menu.quranMemorize', component: 'quranMemorize' },
        { id: 'mosque', icon: '🕌', labelKey: 'menu.mosque', component: 'mosque' },
        { id: 'pro', icon: '👑', labelKey: 'menu.goPro', component: 'pro' },
    ];

    // Sync with external open state (from tab bar button)
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

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div className="hamburger-overlay" onClick={handleClose}>
                    {/* Menu Container */}
                    <div
                        className="hamburger-menu"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="hamburger-header">
                            <div className="hamburger-logo">🕌</div>
                            <h2 className="hamburger-title">{t('app.name')}</h2>
                            <p className="hamburger-subtitle">{t('app.tagline')}</p>
                            {isPro && (
                                <div style={{
                                    marginTop: '8px',
                                    background: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    display: 'inline-block'
                                }}>
                                    {t('menu.proMember')}
                                </div>
                            )}
                        </div>

                        {/* Grid */}
                        <div className="hamburger-grid">
                            {MENU_ITEMS.map((item) => {
                                // Dynamic label for Pro item
                                let label = t(item.labelKey);
                                let icon = item.icon;

                                if (item.id === 'pro' && isPro) {
                                    label = t('menu.proMembership');
                                    icon = '✅';
                                }

                                return (
                                    <div
                                        key={item.id}
                                        className={`hamburger-item ${currentFeature === item.component ? 'active' : ''}`}
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <span className="hamburger-item-icon">{icon}</span>
                                        <span className="hamburger-item-label">{label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="hamburger-footer">
                            <span>{t('menu.version')} {APP_VERSION}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default HamburgerMenu;
