import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { requestNotificationPermission } from '../services/smartNotificationService';
import { changeLanguage, getSupportedLanguages } from '../services/languageService';
import { ChevronRight } from 'lucide-react';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import LicensesCredits from './LicensesCredits';
import IslamicBackButton from './shared/IslamicBackButton';
import { Bell, Info, FileText, Shield, Clock, History, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS, APP_VERSION } from '../constants';
import NotificationSettings from './NotificationSettings';
import NotificationHistory from './NotificationHistory';
import { isPro, setProStatus } from '../services/proService';
import CancelFlowModal from './CancelFlowModal';

const Settings = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showLicenses, setShowLicenses] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showCancelFlow, setShowCancelFlow] = useState(false);
    const userIsPro = isPro();
    
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = storageService.getString(STORAGE_KEYS.THEME);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedTheme === 'dark' || (!savedTheme && prefersDark);
    });
    
    const [stickyNotification, setStickyNotification] = useState(() => {
        return storageService.getBoolean(STORAGE_KEYS.STICKY_NOTIFICATION);
    });
    
    // Derive current language directly from i18n
    const currentLang = i18n.language?.split('-')[0] || 'tr';
    
    const supportedLanguages = getSupportedLanguages();

    useEffect(() => {
        // Apply theme on mount
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
        storageService.setString(STORAGE_KEYS.THEME, newMode ? 'dark' : 'light');
    };

    const toggleStickyNotification = async () => {
        const newState = !stickyNotification;
        setStickyNotification(newState);
        storageService.setBoolean(STORAGE_KEYS.STICKY_NOTIFICATION, newState);

        // App.jsx'in haberdar olması için event tetikle
        window.dispatchEvent(new Event('stickyNotificationChanged'));

        if (newState) {
            // Eğer açıldıysa ve izin yoksa izin iste
            await requestNotificationPermission();
        }
    };

    // Handler for language change
    const handleLanguageChange = async (langCode) => {
        await changeLanguage(langCode);
    };

    const handleConfirmCancel = async () => {
        // Here we would typically unsubscribe via RevenueCat or Store
        await setProStatus(false);
        setShowCancelFlow(false);
        // Force reload or re-render to reflect pro status change
        // In a real app we might toast a success message here
    };

    if (showCancelFlow) {
        return <CancelFlowModal onClose={() => setShowCancelFlow(false)} onConfirmCancel={handleConfirmCancel} />;
    }

    if (showPrivacy) {
        return <PrivacyPolicy onClose={() => setShowPrivacy(false)} />;
    }

    if (showTerms) {
        return <TermsOfService onClose={() => setShowTerms(false)} />;
    }

    if (showLicenses) {
        return <LicensesCredits onClose={() => setShowLicenses(false)} />;
    }

    if (showHistory) {
      return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-50 overflow-y-auto">
             <div className="p-4 bg-white dark:bg-gray-800 shadow-md mb-4 sticky top-0 z-10 flex items-center">
                <button 
                  onClick={() => setShowHistory(false)}
                  className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <h2 className="text-xl font-bold">{t('settings.historyTitle', 'Bildirim Geçmişi')}</h2>
            </div>
            <NotificationHistory />
        </div>
      );
    }

    return (
        <div className="settings-container reveal-stagger">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                    {t('settings.title')}
                </h2>
            </div>

            <div className="settings-group">
                <div className="settings-group-title premium-text">{t('settings.language')}</div>
                <div className="settings-card premium-glass hover-lift" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {supportedLanguages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                style={{
                                    flex: '1',
                                    minWidth: '80px',
                                    padding: '12px',
                                    borderRadius: '16px',
                                    border: currentLang === lang.code 
                                        ? '2px solid var(--nav-accent)' 
                                        : '1px solid var(--nav-border)',
                                    background: currentLang === lang.code 
                                        ? 'rgba(245, 158, 11, 0.1)' 
                                        : 'var(--nav-hover)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: currentLang === lang.code ? '800' : '600',
                                    color: 'var(--nav-text)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>
                                    {lang.code === 'tr' ? '🇹🇷' : lang.code === 'en' ? '🇺🇸' : lang.code === 'ar' ? '🇸🇦' : '🌐'}
                                </span>
                                <span>{lang.nativeName}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="settings-group">
                <div className="settings-group-title premium-text">{t('settings.appearance', 'Görünüm')}</div>
                <div className="settings-card premium-glass hover-lift" onClick={toggleDarkMode}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box">
                            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <div>
                            <div className="settings-label">{t('settings.theme')}</div>
                            <div className="settings-desc">{darkMode ? t('settings.darkMode') : t('settings.lightMode')}</div>
                        </div>
                    </div>
                    <div className={`velocity-switch ${darkMode ? 'active' : ''}`}>
                        <div className="velocity-knob" />
                    </div>
                </div>
            </div>

                {/* YENİ: Bildirim Ayarları (Enhanced) */}
                <NotificationSettings />

            <div className="settings-group">
                <div className="settings-group-title premium-text">{t('settings.notifications')}</div>
                
                <div className="settings-card premium-glass hover-lift" onClick={() => setShowHistory(true)}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box">
                            <History size={20} />
                        </div>
                        <div>
                            <div className="settings-label">{t('settings.historyTitle', 'Bildirim Geçmişi')}</div>
                            <div className="settings-desc">{t('settings.historyDesc')}</div>
                        </div>
                    </div>
                    <ChevronRight size={18} color="var(--nav-border)" />
                </div>

                <div className="settings-card premium-glass hover-lift" onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent('openFeature', { detail: 'muezzinSelector' }));
                }}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box">
                            <Bell size={20} />
                        </div>
                        <div>
                            <div className="settings-label">{t('settings.muezzinTitle')}</div>
                            <div className="settings-desc">{t('settings.muezzinDesc')}</div>
                        </div>
                    </div>
                    <ChevronRight size={18} color="var(--nav-border)" />
                </div>

                <div className="settings-card premium-glass hover-lift" onClick={toggleStickyNotification}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box">
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className="settings-label">{t('settings.stickyCounter')}</div>
                            <div className="settings-desc">{t('settings.stickyCounterDesc')}</div>
                        </div>
                    </div>
                    <div className={`velocity-switch ${stickyNotification ? 'active' : ''}`}>
                        <div className="velocity-knob" />
                    </div>
                </div>
            </div>

                {/* Hakkında */}
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'var(--card-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <Info size={22} color="var(--primary-color)" />
                        <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-color)' }}>{t('settings.about')}</div>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-color-muted)' }}>
                        <div>{t('app.name')} {t('settings.appName')} v{APP_VERSION}</div>
                        <div style={{ marginTop: '4px' }}>{t('settings.appDescription')}</div>
                    </div>
                </div>

            <div className="settings-group">
                <div className="settings-group-title premium-text">{t('settings.proFeatures', 'Premium Özellikler')}</div>
                <div className="settings-card premium-glass hover-lift" onClick={() => {
                    onClose();
                    window.dispatchEvent(new CustomEvent('openFeature', { detail: 'pro' }));
                }}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-color)' }}>
                            <Shield size={20} />
                        </div>
                        <div>
                            <div className="settings-label">{t('settings.removeAdsTitle')}</div>
                            <div className="settings-desc">{t('settings.removeAdsDesc')}</div>
                        </div>
                    </div>
                    <ChevronRight size={18} color="var(--nav-border)" />
                </div>
            </div>

            {userIsPro && (
                <div className="settings-group">
                    <div className="settings-group-title premium-text">{t('settings.subscriptionManagement', 'Abonelik Yönetimi')}</div>
                    <div className="settings-card premium-glass hover-lift" onClick={() => setShowCancelFlow(true)} style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
                        <div className="settings-card-left">
                            <div className="settings-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)' }}>
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <div className="settings-label" style={{ color: 'var(--error-color)' }}>{t('settings.cancelSubscription', 'Aboneliği İptal Et')}</div>
                                <div className="settings-desc">{t('settings.cancelSubscriptionDesc', 'Huzur Pro aboneliğinizi sonlandırın.')}</div>
                            </div>
                        </div>
                        <ChevronRight size={18} color="rgba(239, 68, 68, 0.4)" />
                    </div>
                </div>
            )}

            <div className="settings-group">
                <div className="settings-group-title premium-text">{t('settings.legal')}</div>
                
                <div className="settings-card premium-glass hover-lift" onClick={() => setShowPrivacy(true)}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box">
                            <Shield size={20} />
                        </div>
                        <div className="settings-label">{t('settings.privacyPolicy')}</div>
                    </div>
                    <ChevronRight size={18} color="var(--nav-border)" />
                </div>

                <div className="settings-card premium-glass hover-lift" onClick={() => setShowTerms(true)}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box">
                            <FileText size={20} />
                        </div>
                        <div className="settings-label">{t('settings.termsOfService')}</div>
                    </div>
                    <ChevronRight size={18} color="var(--nav-border)" />
                </div>

                <div className="settings-card premium-glass hover-lift" onClick={() => setShowLicenses(true)}>
                    <div className="settings-card-left">
                        <div className="settings-icon-box">
                            <Info size={20} />
                        </div>
                        <div className="settings-label">{t('settings.licensesAndCredits')}</div>
                    </div>
                    <ChevronRight size={18} color="var(--nav-border)" />
                </div>
            </div>

            <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', padding: '20px' }}>
                {t('app.name')} v{APP_VERSION}
            </div>
        </div>
    );
};

export default Settings;
