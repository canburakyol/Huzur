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
        window.open(source.url, '_blank');
    };

    return (
        <div className="app-container" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingTop: '20px'
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <h1 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    🎤 {t('weeklySermon.title', 'Weekly Sermon')}
                </h1>
            </div>

            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                {t('weeklySermon.description', 'Official sermon publications from the Presidency of Religious Affairs')}
            </p>

            {/* Current Date Info */}
            <div className="glass-card" style={{
                padding: '20px',
                marginBottom: '20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.2) 0%, rgba(46, 204, 113, 0.1) 100%)'
            }}>
                <Calendar size={24} color="var(--primary-color)" style={{ marginBottom: '8px' }} />
                <div style={{
                    fontSize: '14px',
                    color: 'var(--text-color-muted)',
                    marginBottom: '8px'
                }}>
                    {t('weeklySermon.lastFriday', 'Last Friday Sermon')}
                </div>
                <div style={{
                    fontSize: '18px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    {getCurrentFriday()}
                </div>
            </div>

            {/* Sources */}
            <h3 style={{
                fontSize: '14px',
                color: 'var(--primary-color)',
                marginBottom: '12px'
            }}>
                {t('weeklySermon.sourcesTitle', 'Sermon Sources')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {HUTBE_SOURCES.map(source => (
                    <div
                        key={source.id}
                        className="glass-card"
                        style={{
                            padding: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                        onClick={() => openSource(source)}
                    >
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: source.type === 'video' ? 'rgba(231, 76, 60, 0.2)' :
                                source.type === 'audio' ? 'rgba(155, 89, 182, 0.2)' :
                                    'rgba(52, 152, 219, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                        }}>
                            {source.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontWeight: '600',
                                fontSize: '15px',
                                color: 'var(--primary-color)'
                            }}>
                                {t(source.titleKey, source.titleFallback)}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-color-muted)'
                            }}>
                                {t(source.descriptionKey, source.descriptionFallback)}
                            </div>
                        </div>
                        <ExternalLink size={20} color="var(--text-color-muted)" />
                    </div>
                ))}
            </div>

            {/* Note */}
            <div style={{
                padding: '16px',
                background: 'var(--glass-bg)',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{
                    fontSize: '12px',
                    color: 'var(--text-color-muted)',
                    lineHeight: '1.6'
                }}>
                    💡 {t('weeklySermon.note', 'Sermons are published every Friday by the Presidency of Religious Affairs. You can access the latest sermon from the sources above.')}
                </div>
            </div>
        </div>
    );
}

export default WeeklySermon;
