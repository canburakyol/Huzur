import { ArrowLeft, Radio, Play, ExternalLink } from 'lucide-react';

// Live stream channels - Direct YouTube links
const LIVE_CHANNELS = [
    {
        id: 'makkah',
        title: 'Mekke - Kabe Canlı',
        description: 'Mescid-i Haram 24 saat canlı yayın',
        icon: '🕋',
        youtubeUrl: 'https://www.youtube.com/results?search_query=makkah+live+now&sp=EgJAAQ%253D%253D',
        category: 'harem'
    },
    {
        id: 'madinah',
        title: 'Medine - Mescid-i Nebevi',
        description: 'Peygamber Mescidi canlı yayın',
        icon: '🕌',
        youtubeUrl: 'https://www.youtube.com/results?search_query=madinah+live+now&sp=EgJAAQ%253D%253D',
        category: 'harem'
    },
    {
        id: 'quran-tv',
        title: 'Kuran Kanalı',
        description: 'Kuran-ı Kerim tilaweti - Canlı',
        icon: '📖',
        youtubeUrl: 'https://www.youtube.com/results?search_query=quran+live+recitation&sp=EgJAAQ%253D%253D',
        category: 'quran'
    },
    {
        id: 'makkah-hd',
        title: 'Saudi Quran TV',
        description: 'Resmi Suudi Arabistan Kuran kanalı',
        icon: '🇸🇦',
        youtubeUrl: 'https://www.youtube.com/@SaudiQuranTv/live',
        category: 'quran'
    }
];

function LiveBroadcast({ onClose }) {
    // Open YouTube directly
    const openChannel = (channel) => {
        window.open(channel.youtubeUrl, '_blank');
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
                    📺 Canlı Yayın
                </h1>
            </div>

            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '20px' }}>
                Kutsal mekanlardan canlı yayınlar. Tıklayın, YouTube'da açılır.
            </p>

            {/* Harem Channels */}
            <h3 style={{
                fontSize: '14px',
                color: 'var(--primary-color)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                🕋 Harem-i Şerif
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {LIVE_CHANNELS.filter(c => c.category === 'harem').map(channel => (
                    <div
                        key={channel.id}
                        className="glass-card"
                        style={{
                            padding: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                        onClick={() => openChannel(channel)}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px'
                        }}>
                            {channel.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontWeight: '700',
                                fontSize: '16px',
                                color: 'var(--primary-color)',
                                marginBottom: '4px'
                            }}>
                                {channel.title}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-color-muted)'
                            }}>
                                {channel.description}
                            </div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '8px',
                                padding: '4px 8px',
                                background: 'rgba(231, 76, 60, 0.2)',
                                borderRadius: '12px',
                                fontSize: '10px',
                                color: '#e74c3c'
                            }}>
                                <Radio size={10} /> CANLI
                            </div>
                        </div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#FF0000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Play size={20} color="#fff" fill="#fff" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quran Channels */}
            <h3 style={{
                fontSize: '14px',
                color: 'var(--primary-color)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                📖 Kuran Kanalları
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {LIVE_CHANNELS.filter(c => c.category === 'quran').map(channel => (
                    <div
                        key={channel.id}
                        className="glass-card"
                        style={{
                            padding: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                        onClick={() => openChannel(channel)}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px'
                        }}>
                            {channel.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontWeight: '700',
                                fontSize: '16px',
                                color: 'var(--primary-color)'
                            }}>
                                {channel.title}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-color-muted)'
                            }}>
                                {channel.description}
                            </div>
                        </div>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--primary-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Play size={20} color="#fff" fill="#fff" />
                        </div>
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
                    💡 Kanala tıkladığınızda YouTube uygulaması veya tarayıcıda açılır.
                </div>
            </div>
        </div>
    );
}

export default LiveBroadcast;
