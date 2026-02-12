import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { requestNotificationPermission } from '../services/smartNotificationService';
import { changeLanguage, getSupportedLanguages } from '../services/languageService';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import LicensesCredits from './LicensesCredits';
import IslamicBackButton from './shared/IslamicBackButton';
import { Sun, Moon, Bell, Info, FileText, Shield, Clock, Globe, History } from 'lucide-react';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS, APP_VERSION } from '../constants';
import NotificationSettings from './NotificationSettings';
import NotificationHistory from './NotificationHistory';

const Settings = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [showLicenses, setShowLicenses] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    
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
        <div className="glass-card" style={{
            textAlign: 'center',
            position: 'relative',
            background: 'var(--glass-bg)',
            color: 'var(--text-color)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
            </div>

            <h2 style={{ color: 'var(--primary-color)', marginBottom: '24px' }}>⚙️ {t('settings.title')}</h2>

            <div style={{ textAlign: 'left' }}>
                {/* Dil Seçimi */}
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'var(--card-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Globe size={22} color="var(--primary-color)" />
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-color)' }}>{t('settings.language')}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-color-muted)' }}>
                                {t('settings.languageDesc')}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {supportedLanguages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                style={{
                                    flex: '1',
                                    minWidth: '80px',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: currentLang === lang.code 
                                        ? '2px solid var(--primary-color)' 
                                        : '1px solid var(--glass-border)',
                                    background: currentLang === lang.code 
                                        ? 'rgba(212, 175, 55, 0.15)' 
                                        : 'rgba(255, 255, 255, 0.05)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: currentLang === lang.code ? '700' : '500',
                                    color: 'var(--text-color)',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>
                                    {lang.code === 'tr'
                                        ? '🇹🇷'
                                        : lang.code === 'en'
                                            ? '🇺🇸'
                                            : lang.code === 'ar'
                                                ? '🇸🇦'
                                                : lang.code === 'id'
                                                    ? '🇮🇩'
                                                    : lang.code === 'es'
                                                        ? '🇪🇸'
                                                        : lang.code === 'fr'
                                                            ? '🇫🇷'
                                                            : lang.code === 'de'
                                                                ? '🇩🇪'
                                                                : '🌐'}
                                </span>
                                <span>{lang.nativeName}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tema Ayarı */}
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'var(--card-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {darkMode ? <Moon size={22} color="var(--primary-color)" /> : <Sun size={22} color="var(--primary-color)" />}
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-color)' }}>{t('settings.theme')}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-color-muted)' }}>
                                    {darkMode ? t('settings.darkMode') : t('settings.lightMode')}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            style={{
                                width: '56px',
                                height: '30px',
                                borderRadius: '15px',
                                border: 'none',
                                background: darkMode ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#ddd',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background 0.3s ease'
                            }}
                        >
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'white',
                                position: 'absolute',
                                top: '3px',
                                left: darkMode ? '29px' : '3px',
                                transition: 'left 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}></div>
                        </button>
                    </div>
                </div>

                {/* YENİ: Bildirim Ayarları (Enhanced) */}
                <NotificationSettings />

                {/* Bildirim Geçmişi Butonu */}
                <div style={{
                    marginTop: '16px',
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'var(--card-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)',
                    cursor: 'pointer'
                }} onClick={() => setShowHistory(true)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <History size={22} color="var(--primary-color)" />
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-color)' }}>{t('settings.historyTitle', 'Bildirim Geçmişi')}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-color-muted)' }}>
                                    {t('settings.historyDesc', 'Gelen son bildirimleri görüntüleyin')}
                                </div>
                            </div>
                        </div>
                        <div className="text-gray-400">›</div>
                    </div>
                </div>

                {/* Müezzin Seçimi */}
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'var(--card-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Bell size={22} color="var(--primary-color)" />
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-color)' }}>{t('settings.muezzinTitle', 'Müezzin Seçimi')}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-color-muted)' }}>
                                    {t('settings.muezzinDesc', 'Ezan bildirim sesini özelleştirin')}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                onClose(); // Settings'i kapat
                                window.dispatchEvent(new CustomEvent('openFeature', { detail: 'muezzinSelector' }));
                            }}
                            style={{
                                padding: '8px 16px',
                                background: 'var(--primary-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {t('settings.select', 'Seç')}
                        </button>
                    </div>
                </div>

                {/* Kalıcı Vakit Sayacı */}
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'var(--card-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Clock size={22} color="var(--primary-color)" />
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-color)' }}>{t('settings.stickyCounter')}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-color-muted)' }}>
                                    {t('settings.stickyCounterDesc')}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleStickyNotification}
                            style={{
                                width: '56px',
                                height: '30px',
                                borderRadius: '15px',
                                border: 'none',
                                background: stickyNotification ? 'linear-gradient(135deg, #e67e22, #d35400)' : '#ddd',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background 0.3s ease'
                            }}
                        >
                            <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'white',
                                position: 'absolute',
                                top: '3px',
                                left: stickyNotification ? '29px' : '3px',
                                transition: 'left 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}></div>
                        </button>
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

                {/* Reklamları Kaldır */}
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'var(--card-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Shield size={22} color="var(--primary-color)" />
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-color)' }}>{t('settings.removeAdsTitle', 'Reklamları Kaldır')}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-color-muted)' }}>
                                    {t('settings.removeAdsDesc', "Reklamsız deneyim için Pro'ya geçin")}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                onClose();
                                window.dispatchEvent(new CustomEvent('openFeature', { detail: 'pro' }));
                            }}
                            style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {t('settings.review', 'İncele')}
                        </button>
                    </div>
                </div>

                {/* Yasal */}
                <div style={{
                    padding: '16px',
                    background: 'var(--card-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <Shield size={22} color="var(--primary-color)" />
                        <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-color)' }}>{t('settings.legal')}</div>
                    </div>
                    <button
                        onClick={() => setShowPrivacy(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginBottom: '8px',
                            background: 'transparent',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: 'var(--text-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <FileText size={18} /> {t('settings.privacyPolicy')}
                    </button>
                    <button
                        onClick={() => setShowTerms(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'transparent',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: 'var(--text-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <FileText size={18} /> {t('settings.termsOfService')}
                    </button>
                    <button
                        onClick={() => setShowLicenses(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            marginTop: '8px',
                            background: 'transparent',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: 'var(--text-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        <FileText size={18} /> {t('settings.licensesAndCredits', 'Lisanslar ve Kaynaklar')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
