import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Play, Pause, Volume2 } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';
import { MUEZZINS } from '../data/muezzinData';

const STORAGE_KEY_MUEZZIN = 'selected_muezzin_id';

function MuezzinSelector({ onClose }) {
    const { t } = useTranslation();
    const [selectedMuezzinId, setSelectedMuezzinId] = useState(() => {
        return storageService.getString(STORAGE_KEY_MUEZZIN) || 'default';
    });
    const [playingId, setPlayingId] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const handlePlayPreview = (muezzin) => {
        if (playingId === muezzin.id) {
            // Pause
            if (audioRef.current) {
                audioRef.current.pause();
                setPlayingId(null);
            }
        } else {
            // Play new
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(muezzin.audioUrl);
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(err => console.error("Audio play error:", err));
            audioRef.current.onended = () => setPlayingId(null);
            setPlayingId(muezzin.id);
        }
    };

    const handleSelect = (id) => {
        setSelectedMuezzinId(id);
        storageService.setString(STORAGE_KEY_MUEZZIN, id);
        // Bildirim servisine haber verilebilir veya servis her seferinde storage'dan okuyabilir
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
                    📢 {t('muezzinSelector.title', 'Muezzin Selection')}
                </h1>
            </div>

            {/* Description */}
            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '20px' }}>
                {t('muezzinSelector.description', 'Choose your preferred maqam for adhan notifications')}
            </p>

            {/* Muezzin List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {MUEZZINS.map(muezzin => (
                    <div
                        key={muezzin.id}
                        style={{
                            padding: '20px',
                            borderRadius: '16px',
                            border: selectedMuezzinId === muezzin.id
                                ? '2px solid var(--primary-color)'
                                : '1px solid var(--glass-border)',
                            background: 'var(--glass-bg)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                    >
                        {/* Play Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPreview(muezzin);
                            }}
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: playingId === muezzin.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: playingId === muezzin.id ? 'white' : 'var(--primary-color)',
                                flexShrink: 0
                            }}
                        >
                            {playingId === muezzin.id ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '4px' }} />}
                        </button>

                        {/* Info */}
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleSelect(muezzin.id)}>
                            <div style={{
                                fontWeight: '700',
                                fontSize: '16px',
                                color: 'var(--primary-color)',
                                marginBottom: '4px'
                            }}>
                                {muezzin.name}
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: 'var(--text-color-muted)'
                            }}>
                                {muezzin.description}
                            </div>
                        </div>

                        {/* Selection Indicator */}
                        <div 
                            onClick={() => handleSelect(muezzin.id)}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                border: `2px solid ${selectedMuezzinId === muezzin.id ? 'var(--primary-color)' : 'var(--text-color-muted)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            {selectedMuezzinId === muezzin.id && (
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-color)'
                                }} />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Note */}
            <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'rgba(255, 193, 7, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 193, 7, 0.3)'
            }}>
                <div style={{
                    fontSize: '13px',
                    color: 'var(--text-color-muted)',
                    lineHeight: '1.6',
                    display: 'flex',
                    gap: '10px'
                }}>
                    <Volume2 size={20} style={{ flexShrink: 0, color: 'var(--primary-color)' }} />
                    <span>
                        <strong>{t('muezzinSelector.noteLabel', 'Note')}:</strong> {t('muezzinSelector.noteText', 'Your selected maqam will be used as the notification sound at the next adhan time. Audio files may need to be available on your device.')}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default MuezzinSelector;
