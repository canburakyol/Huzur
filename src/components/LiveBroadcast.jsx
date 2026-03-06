import { Radio, Play, ExternalLink, Tv, Info, Sparkles } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';

// Live stream channels - Direct YouTube links
const LIVE_CHANNELS = [
    {
        id: 'makkah',
        title: 'Mekke - Kabe Canlı',
        description: 'Mescid-i Haram 24 saat canlı yayın',
        icon: '🕋',
        youtubeUrl: 'https://www.youtube.com/results?search_query=makkah+live+now&sp=EgJAAQ%253D%253D',
        category: 'harem',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
    },
    {
        id: 'madinah',
        title: 'Medine - Mescid-i Nebevi',
        description: 'Peygamber Mescidi canlı yayın',
        icon: '🕌',
        youtubeUrl: 'https://www.youtube.com/results?search_query=madinah+live+now&sp=EgJAAQ%253D%253D',
        category: 'harem',
        gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)'
    },
    {
        id: 'quran-tv',
        title: 'Kuran Kanalı',
        description: 'Kuran-ı Kerim tilaweti - Canlı',
        icon: '📖',
        youtubeUrl: 'https://www.youtube.com/results?search_query=quran+live+recitation&sp=EgJAAQ%253D%253D',
        category: 'quran',
        gradient: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)'
    },
    {
        id: 'makkah-hd',
        title: 'Saudi Quran TV',
        description: 'Resmi Suudi Arabistan Kuran kanalı',
        icon: '🇸🇦',
        youtubeUrl: 'https://www.youtube.com/@SaudiQuranTv/live',
        category: 'quran',
        gradient: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)'
    }
];

function LiveBroadcast({ onClose }) {
    const openChannel = (channel) => {
        const win = window.open(channel.youtubeUrl, '_blank', 'noopener,noreferrer');
        if (win) {
            win.opener = null;
        }
    };

    return (
        <div className="settings-container reveal-stagger" style={{ paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
                        Canlı Yayın
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                        Kutsal mekanlardan 7/24 kesintisiz bağlantı
                    </p>
                </div>
                <div className="settings-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <Tv size={20} />
                </div>
            </div>

            <div className="settings-card info-banner" style={{ marginBottom: '32px', padding: '16px', gap: '12px' }}>
                <Info size={18} color="var(--nav-accent)" />
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600', lineHeight: '1.4' }}>
                    Kanalları seçerek YouTube üzerinden canlı yayına bağlanabilirsiniz.
                </p>
            </div>

            {/* Harem Channels */}
            <div className="category-section">
                <label className="section-label">Harem-i Şerif</label>
                <div className="channel-grid">
                    {LIVE_CHANNELS.filter(c => c.category === 'harem').map((channel, index) => (
                        <div
                            key={channel.id}
                            className="settings-card channel-card"
                            style={{ '--delay': `${index * 0.1}s` }}
                            onClick={() => openChannel(channel)}
                        >
                            <div className="channel-icon-preview" style={{ background: channel.gradient }}>
                                {channel.icon}
                            </div>
                            <div className="channel-info">
                                <h4 className="channel-title">{channel.title}</h4>
                                <p className="channel-desc">{channel.description}</p>
                                <div className="live-status">
                                    <div className="live-dot" />
                                    <span>CANLI</span>
                                </div>
                            </div>
                            <div className="play-btn-circle">
                                <Play size={20} fill="white" color="white" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quran Channels */}
            <div className="category-section" style={{ marginTop: '32px' }}>
                <label className="section-label">Kuran Kanalları</label>
                <div className="channel-grid">
                    {LIVE_CHANNELS.filter(c => c.category === 'quran').map((channel, index) => (
                        <div
                            key={channel.id}
                            className="settings-card channel-card"
                            style={{ '--delay': `${(index + 2) * 0.1}s` }}
                            onClick={() => openChannel(channel)}
                        >
                            <div className="channel-icon-preview" style={{ background: channel.gradient }}>
                                {channel.icon}
                            </div>
                            <div className="channel-info">
                                <h4 className="channel-title">{channel.title}</h4>
                                <p className="channel-desc">{channel.description}</p>
                                <div className="live-status" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                    <div className="live-dot" style={{ background: '#10b981' }} />
                                    <span>AKTİF</span>
                                </div>
                            </div>
                            <div className="play-btn-circle" style={{ background: 'var(--nav-accent)' }}>
                                <Play size={20} fill="white" color="white" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .info-banner {
                    background: rgba(79, 70, 229, 0.05);
                    border: 1px dashed var(--nav-accent);
                }

                .section-label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 900;
                    color: var(--nav-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 16px;
                }

                .channel-grid { display: flex; flexDirection: column; gap: 12px; }

                .channel-card {
                    padding: 16px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: reveal 0.5s ease backwards;
                    animation-delay: var(--delay);
                }

                .channel-card:hover {
                    border-color: var(--nav-accent);
                    transform: translateX(8px);
                }

                @keyframes reveal {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .channel-icon-preview {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                }

                .channel-info { flex: 1; }

                .channel-title {
                    margin: 0 0 4px 0;
                    font-size: 1rem;
                    font-weight: 900;
                    color: var(--nav-text);
                }

                .channel-desc {
                    margin: 0 0 10px 0;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--nav-text-muted);
                    line-height: 1.4;
                }

                .live-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    background: rgba(239, 68, 68, 0.1);
                    border-radius: 20px;
                    font-size: 0.65rem;
                    font-weight: 900;
                    color: #ef4444;
                    letter-spacing: 0.5px;
                }

                .live-dot {
                    width: 6px;
                    height: 6px;
                    background: #ef4444;
                    border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }

                .play-btn-circle {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: #ef4444;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                    transition: transform 0.2s;
                }

                .channel-card:active .play-btn-circle { transform: scale(0.9); }
            `}</style>
        </div>
    );
}

export default LiveBroadcast;
