import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { requestNotificationPermission } from '../services/notificationService';
import { schedulePrayerAlarms } from '../services/fcmService';
import { getPrayerTimes } from '../services/prayerService';
import { changeLanguage, getSupportedLanguages } from '../services/languageService';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import { Sun, Moon, Bell, BellOff, Info, FileText, Shield, X, Clock, AlertCircle, Globe } from 'lucide-react';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS, APP_VERSION } from '../constants';

const Settings = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const [permissionStatus, setPermissionStatus] = useState(() => {
        return (typeof Notification !== 'undefined') ? Notification.permission : 'default';
    });
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
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
    
    // Pre-alert settings
    const [enablePreAlert, setEnablePreAlert] = useState(() => {
        return storageService.getBoolean(STORAGE_KEYS.ENABLE_PRE_ALERT, true);
    });
    const [preAlertMinutes, setPreAlertMinutes] = useState(() => {
        return storageService.getNumber(STORAGE_KEYS.PRE_ALERT_MINUTES, 15);
    });

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

    const handleEnableNotifications = async () => {
        const granted = await requestNotificationPermission();
        setPermissionStatus(granted ? 'granted' : 'denied');
    };

    const toggleStickyNotification = async () => {
        const newState = !stickyNotification;
        setStickyNotification(newState);
        storageService.setBoolean(STORAGE_KEYS.STICKY_NOTIFICATION, newState);

        // App.jsx'in haberdar olması için event tetikle
        window.dispatchEvent(new Event('stickyNotificationChanged'));

        if (newState) {
            // Eğer açıldıysa ve izin yoksa izin iste
            const granted = await requestNotificationPermission();
            if (granted) setPermissionStatus('granted');
        }
    };

    // Handler for language change
    const handleLanguageChange = async (langCode) => {
        await changeLanguage(langCode);
    };

    // Handler for pre-alert toggle
    const togglePreAlert = async () => {
        const newState = !enablePreAlert;
        setEnablePreAlert(newState);
        storageService.setBoolean(STORAGE_KEYS.ENABLE_PRE_ALERT, newState);
        
        // Reschedule notifications with new settings
        await rescheduleNotifications();
    };

    // Handler for pre-alert minutes change
    const handlePreAlertMinutesChange = async (minutes) => {
        setPreAlertMinutes(minutes);
        storageService.setNumber(STORAGE_KEYS.PRE_ALERT_MINUTES, minutes);
        
        // Reschedule notifications with new settings
        await rescheduleNotifications();
    };

    // Reschedule all prayer notifications
    const rescheduleNotifications = async () => {
        try {
            const data = await getPrayerTimes();
            if (data && data.timings) {
                await schedulePrayerAlarms(data.timings, {
                    preAlertMinutes: storageService.getNumber(STORAGE_KEYS.PRE_ALERT_MINUTES, 15),
                    enablePreAlert: storageService.getBoolean(STORAGE_KEYS.ENABLE_PRE_ALERT, true),
                    enableMainAlert: true
                });
                console.log('[Settings] Prayer alarms rescheduled');
            }
        } catch (error) {
            console.error('[Settings] Failed to reschedule:', error);
        }
    };

    if (showPrivacy) {
        return <PrivacyPolicy onClose={() => setShowPrivacy(false)} />;
    }

    if (showTerms) {
        return <TermsOfService onClose={() => setShowTerms(false)} />;
    }

    return (
        <div className="glass-card" style={{
            textAlign: 'center',
            position: 'relative',
            background: 'var(--glass-bg)',
            color: 'var(--text-color)'
        }}>
            <button onClick={onClose} style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-color)'
            }}>
                <X size={28} />
            </button>

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
                        <Globe size={22} color="#3498db" />
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '15px' }}>{t('settings.language')}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-color-light)' }}>
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
                                        ? 'rgba(52, 152, 219, 0.15)' 
                                        : 'transparent',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: currentLang === lang.code ? '700' : '500',
                                    color: currentLang === lang.code 
                                        ? 'var(--primary-color)' 
                                        : 'var(--text-color)',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>
                                    {lang.code === 'tr' ? '🇹🇷' : lang.code === 'en' ? '🇬🇧' : '🇸🇦'}
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
                            {darkMode ? <Moon size={22} color="#667eea" /> : <Sun size={22} color="#f39c12" />}
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px' }}>{t('settings.theme')}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-color-light)' }}>
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

                {/* Bildirimler */}
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'var(--card-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {permissionStatus === 'granted' ? <Bell size={22} color="#27ae60" /> : <BellOff size={22} color="#999" />}
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px' }}>{t('settings.notifications')}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-color-light)' }}>
                                    {t('settings.notificationsDesc')}
                                </div>
                            </div>
                        </div>
                        {permissionStatus === 'granted' ? (
                            <span style={{
                                padding: '6px 12px',
                                background: 'rgba(39, 174, 96, 0.1)',
                                color: '#27ae60',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: '600'
                            }}>✓ {t('settings.enabled')}</span>
                        ) : (
                            <button
                                onClick={handleEnableNotifications}
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
                                {t('settings.enable')}
                            </button>
                        )}
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
                            <Clock size={22} color="#e67e22" />
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px' }}>{t('settings.stickyCounter')}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-color-light)' }}>
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

                {/* Vakit Öncesi Hatırlatma */}
                <div style={{
                    marginBottom: '16px',
                    padding: '16px',
                    background: 'var(--card-bg)',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <AlertCircle size={22} color="#9b59b6" />
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '15px' }}>{t('settings.earlyWarning')}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-color-light)' }}>
                                    {t('settings.earlyWarningDesc')}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={togglePreAlert}
                            style={{
                                width: '56px',
                                height: '30px',
                                borderRadius: '15px',
                                border: 'none',
                                background: enablePreAlert ? 'linear-gradient(135deg, #9b59b6, #8e44ad)' : '#ddd',
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
                                left: enablePreAlert ? '29px' : '3px',
                                transition: 'left 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}></div>
                        </button>
                    </div>
                    
                    {/* Time Selection */}
                    {enablePreAlert && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            {[10, 15, 30, 60].map((minutes) => (
                                <button
                                    key={minutes}
                                    onClick={() => handlePreAlertMinutesChange(minutes)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 8px',
                                        borderRadius: '10px',
                                        border: preAlertMinutes === minutes 
                                            ? '2px solid var(--primary-color)' 
                                            : '1px solid var(--glass-border)',
                                        background: preAlertMinutes === minutes 
                                            ? 'rgba(155, 89, 182, 0.1)' 
                                            : 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: preAlertMinutes === minutes ? '600' : '400',
                                        color: preAlertMinutes === minutes 
                                            ? 'var(--primary-color)' 
                                            : 'var(--text-color)'
                                    }}
                                >
                                    {minutes} {t('settings.minutes')}
                                </button>
                            ))}
                        </div>
                    )}
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
                        <Info size={22} color="#3498db" />
                        <div style={{ fontWeight: '600', fontSize: '15px' }}>{t('settings.about')}</div>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-color-light)' }}>
                        <div>{t('app.name')} {t('settings.appName')} v{APP_VERSION}</div>
                        <div style={{ marginTop: '4px' }}>{t('settings.appDescription')}</div>
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
                        <Shield size={22} color="#9b59b6" />
                        <div style={{ fontWeight: '600', fontSize: '15px' }}>{t('settings.legal')}</div>
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
                </div>
            </div>
        </div>
    );
};

export default Settings;
