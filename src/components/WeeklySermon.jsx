// import { useState } from 'react';
import { ExternalLink, Calendar, Mic, FileText, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from './shared/IslamicBackButton';

// Diyanet hutbe kaynakları
const HUTBE_SOURCES = [
    {
        id: 'diyanet-tv',
        titleKey: 'weeklySermon.sources.diyanetTv.title',
        titleFallback: 'Diyanet TV - Friday Sermon',
        descriptionKey: 'weeklySermon.sources.diyanetTv.description',
        descriptionFallback: 'Official sermon broadcasts from Diyanet',
        icon: '📺',
        url: 'https://diyanet.tv/cuma-hutbesi',
        type: 'video'
    },
    {
        id: 'diyanet-gov',
        titleKey: 'weeklySermon.sources.diyanetGov.title',
        titleFallback: 'Diyanet.gov.tr - Sermons',
        descriptionKey: 'weeklySermon.sources.diyanetGov.description',
        descriptionFallback: 'Weekly sermon texts (PDF/Word)',
        icon: '📄',
        url: 'https://diyanet.gov.tr/tr-TR/Kurumsal/Detay/11633/cuma-hutbeleri-702',
        type: 'text'
    },
    {
        id: 'edevlet',
        titleKey: 'weeklySermon.sources.edevlet.title',
        titleFallback: 'e-Government Sermon Page',
        descriptionKey: 'weeklySermon.sources.edevlet.description',
        descriptionFallback: 'Download Friday sermon PDF',
        icon: '🏛️',
        url: 'https://www.turkiye.gov.tr/diyanet-isleri-baskanligi-cuma-hutbesi',
        type: 'text'
    },
    {
        id: 'diyanet-sesli',
        titleKey: 'weeklySermon.sources.audio.title',
        titleFallback: 'Audio Sermon',
        descriptionKey: 'weeklySermon.sources.audio.description',
        descriptionFallback: 'Follow by listening',
        icon: '🎧',
        url: 'https://diyanet.tv/cuma-hutbesi',
        type: 'audio'
    }
];

function WeeklySermon({ onClose }) {
    const { t, i18n } = useTranslation();

    // Get current Friday date
    const getCurrentFriday = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        // const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
        const friday = new Date(today);
        friday.setDate(today.getDate() - ((dayOfWeek + 2) % 7)); // Last Friday
        const localeMap = {
            tr: 'tr-TR',
            en: 'en-US',
            ar: 'ar-SA',
            id: 'id-ID',
            es: 'es-ES',
            fr: 'fr-FR',
            de: 'de-DE'
        };
        const locale = localeMap[i18n.language?.split('-')?.[0]] || 'en-US';
        return friday.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const openSource = (source) => {
        const win = window.open(source.url, '_blank', 'noopener,noreferrer');
        if (win) {
            win.opener = null;
        }
    };

    return (
        <div className="settings-container reveal-stagger">
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px',
                padding: '0 4px'
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    color: 'var(--nav-text)',
                    fontWeight: '900'
                }}>
                    {t('weeklySermon.title', 'Haftalık Hutbe')}
                </h1>
            </div>

            <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '24px', fontWeight: '600', padding: '0 4px' }}>
                {t('weeklySermon.description', 'Diyanet İşleri Başkanlığı tarafından yayınlanan güncel hutbe kaynakları.')}
            </p>

            {/* Current Date Info Card */}
            <div className="settings-card reveal-stagger" style={{
                '--delay': '0.1s',
                padding: '32px 24px',
                marginBottom: '32px',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1) 0%, rgba(39, 174, 96, 0.05) 100%)',
                border: '1px solid var(--nav-accent)',
                borderRadius: '32px'
            }}>
                <div className="settings-icon-box" style={{ 
                    width: '64px', 
                    height: '64px', 
                    background: 'var(--nav-hover)', 
                    color: 'var(--nav-accent)',
                    marginBottom: '20px'
                }}>
                    <Calendar size={28} />
                </div>
                <div style={{
                    fontSize: '1rem',
                    color: 'var(--nav-text-muted)',
                    marginBottom: '8px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    {t('weeklySermon.lastFriday', 'Son Cuma Hutbesi Tarihi')}
                </div>
                <div style={{
                    fontSize: '1.75rem',
                    color: 'var(--nav-text)',
                    fontWeight: '950',
                    letterSpacing: '-0.5px'
                }}>
                    {getCurrentFriday()}
                </div>
            </div>

            {/* Sources Group */}
            <div className="settings-group reveal-stagger" style={{ '--delay': '0.2s', marginBottom: '32px' }}>
                <div className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎙️ {t('weeklySermon.sourcesTitle', 'Yayın Kaynakları')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {HUTBE_SOURCES.map((source, index) => (
                        <div
                            key={source.id}
                            className="settings-card reveal-stagger"
                            style={{
                                '--delay': `${0.3 + index * 0.05}s`,
                                padding: '16px',
                                cursor: 'pointer',
                            }}
                            onClick={() => openSource(source)}
                        >
                            <div className="settings-card-left">
                                <div className="settings-icon-box" style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '16px',
                                    background: source.id === 'diyanet-tv' ? 'rgba(231, 76, 60, 0.1)' :
                                              source.id === 'diyanet-sesli' ? 'rgba(155, 89, 182, 0.1)' :
                                              'rgba(52, 152, 219, 0.1)',
                                    color: source.id === 'diyanet-tv' ? '#e74c3c' :
                                           source.id === 'diyanet-sesli' ? '#9b59b6' :
                                           '#3498db',
                                    fontSize: '1.5rem'
                                }}>
                                    {source.icon}
                                </div>
                                <div className="settings-user-info">
                                    <div className="settings-label" style={{ fontSize: '1rem' }}>
                                        {t(source.titleKey, source.titleFallback)}
                                    </div>
                                    <div className="settings-desc">
                                        {t(source.descriptionKey, source.descriptionFallback)}
                                    </div>
                                </div>
                            </div>
                            <ExternalLink size={18} color="var(--nav-text-muted)" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Helpful Note */}
            <div 
                className="settings-card reveal-stagger"
                style={{
                    '--delay': '0.7s',
                    padding: '20px',
                    background: 'var(--nav-hover)',
                    borderRadius: '20px',
                    border: '1px dashed var(--nav-border)',
                    gap: '12px',
                    alignItems: 'flex-start'
                }}
            >
                <div style={{ fontSize: '1.5rem' }}>💡</div>
                <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--nav-text-muted)',
                    lineHeight: '1.6',
                    fontWeight: '600'
                }}>
                    {t('weeklySermon.note', 'Hutbeler her Cuma günü Diyanet tarafından yayınlanmaktadır. En güncel hutbeye yukarıdaki kaynaklardan ulaşabilirsiniz.')}
                </div>
            </div>
        </div>
    );
}

export default WeeklySermon;
