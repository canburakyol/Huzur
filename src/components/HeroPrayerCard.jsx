import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Navigation, MapPin, ChevronRight } from 'lucide-react';
import './ModernHomeFeed.css';

const HeroPrayerCard = memo(({ timings, nextPrayer, onShowPrayers, locationName }) => {
    const { t } = useTranslation();


    if (!timings || !nextPrayer) return (
        <div className="hero-prayer-card" style={{ justifyContent: 'center' }}>
            <div>{t('common.loading')}...</div>
        </div>
    );

    return (
        <div className="hero-prayer-card hover-lift" onClick={onShowPrayers}>
            <div className="hero-overlay"></div>
            
            {/* Left: Current Status */}
            <div style={{ zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#2ecc71', borderRadius: '50%', boxShadow: '0 0 8px #2ecc71' }}></div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-color)', opacity: 0.8 }}>
                        {t('prayer.now')}
                    </span>
                </div>
                
                <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '4px 0', color: 'var(--text-color)', letterSpacing: '-1px' }}>
                     {/* We need current prayer logic, assuming passed or simplified for now */}
                     {timings[nextPrayer?.key]} 
                </h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                    <MapPin size={14} color="var(--primary-color)" />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-color)' }}>{locationName || 'Konum'}</span>
                </div>
            </div>

            {/* Right: Next Prayer Info */}
            <div style={{ zIndex: 2, textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', marginBottom: '4px' }}>
                    {t('prayer.next')}
                </div>
                <div className="premium-text" style={{ fontSize: '18px', fontWeight: '700' }}>
                    {nextPrayer.name}
                </div>
                
                <div style={{ 
                    marginTop: '12px', 
                    background: 'var(--glass-bg)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}>
                    {t('common.viewAll')} <ChevronRight size={14} />
                </div>
            </div>
        </div>
    );
});

export default HeroPrayerCard;
