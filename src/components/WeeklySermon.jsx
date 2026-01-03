import { useState } from 'react';
import { ArrowLeft, ExternalLink, Calendar, Mic, FileText, Globe } from 'lucide-react';

// Diyanet hutbe kaynakları
const HUTBE_SOURCES = [
    {
        id: 'diyanet-tv',
        title: 'Diyanet TV - Cuma Hutbesi',
        description: 'Diyanet\'in resmi hutbe yayınları',
        icon: '📺',
        url: 'https://diyanet.tv/cuma-hutbesi',
        type: 'video'
    },
    {
        id: 'diyanet-gov',
        title: 'Diyanet.gov.tr - Hutbeler',
        description: 'Haftalık hutbe metinleri (PDF/Word)',
        icon: '📄',
        url: 'https://diyanet.gov.tr/tr-TR/Kurumsal/Detay/11633/cuma-hutbeleri-702',
        type: 'text'
    },
    {
        id: 'edevlet',
        title: 'e-Devlet Hutbe Sayfası',
        description: 'Cuma hutbesi PDF indirme',
        icon: '🏛️',
        url: 'https://www.turkiye.gov.tr/diyanet-isleri-baskanligi-cuma-hutbesi',
        type: 'text'
    },
    {
        id: 'diyanet-sesli',
        title: 'Sesli Hutbe',
        description: 'Dinleyerek takip edin',
        icon: '🎧',
        url: 'https://diyanet.tv/cuma-hutbesi',
        type: 'audio'
    }
];

function WeeklySermon({ onClose }) {
    // Get current Friday date
    const getCurrentFriday = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
        const friday = new Date(today);
        friday.setDate(today.getDate() - ((dayOfWeek + 2) % 7)); // Last Friday
        return friday.toLocaleDateString('tr-TR', {
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
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: 'var(--primary-color)'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{
                    margin: 0,
                    fontSize: '22px',
                    color: 'var(--primary-color)',
                    fontWeight: '700'
                }}>
                    🎤 Haftanın Hutbesi
                </h1>
            </div>

            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '16px' }}>
                Diyanet İşleri Başkanlığı'nın resmi hutbe yayınları
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
                    Son Cuma Hutbesi
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
                Hutbe Kaynakları
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
                                {source.title}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-color-muted)'
                            }}>
                                {source.description}
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
                    💡 Hutbeler her Cuma günü Diyanet İşleri Başkanlığı tarafından yayınlanmaktadır.
                    Yukarıdaki kaynaklardan güncel hutbeye ulaşabilirsiniz.
                </div>
            </div>
        </div>
    );
}

export default WeeklySermon;
