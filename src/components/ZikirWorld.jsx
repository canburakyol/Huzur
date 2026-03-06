import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Award, Heart, Calendar, Clock } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { storageService } from '../services/storageService';

const ZIKIR_WORLD_KEYS = {
    ZIKIRMATIK_COUNT: 'zikirmatik_count',
    TESPIHAT_COUNTS: 'tespihat_counts',
    START_DATE: 'zikir_start_date'
};

// Zikir types with their meanings
const DHIKR_TYPES = [
    {
        id: 'subhanallah',
        arabic: 'سُبْحَانَ اللهِ',
        latin: 'Sübhanallah',
        icon: '🌳',
        color: 'var(--bg-emerald-light)'
    },
    {
        id: 'elhamdulillah',
        arabic: 'الْحَمْدُ لِلهِ',
        latin: 'Elhamdülillah',
        icon: '⚖️',
        color: 'var(--primary-color)'
    },
    {
        id: 'allahuekber',
        arabic: 'اللهُ أَكْبَرُ',
        latin: 'Allahu Ekber',
        icon: '🌟',
        color: 'var(--accent-color)'
    },
    {
        id: 'lailaheillallah',
        arabic: 'لَا إِلٰهَ إِلَّا اللهُ',
        latin: 'Lâ ilâhe illallah',
        icon: '💎',
        color: 'var(--accent-color)'
    },
    {
        id: 'estagfirullah',
        arabic: 'أَسْتَغْفِرُ اللهَ',
        latin: 'Estağfirullah',
        icon: '💧',
        color: 'var(--bg-emerald-med)'
    },
    {
        id: 'salavat',
        arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
        latin: 'Allahümme salli ala Muhammed',
        icon: '🌹',
        color: 'var(--error-color)'
    }
];

function ZikirWorld({ onClose }) {
    const { t } = useTranslation('zikirWorld');
    const [personalStats, setPersonalStats] = useState({
        total: 0,
        startDate: null,
        daysActive: 0
    });
    const [selectedDhikr, setSelectedDhikr] = useState(null);

    // Load personal stats from localStorage
    useEffect(() => {
        let total = 0;

        // Check for zikirmatik data
        const zikirData = storageService.getString(ZIKIR_WORLD_KEYS.ZIKIRMATIK_COUNT, '0');
        if (zikirData) {
            total += parseInt(zikirData) || 0;
        }

        // Check for tespihat data
        const tespihatData = storageService.getItem(ZIKIR_WORLD_KEYS.TESPIHAT_COUNTS, null);
        if (tespihatData) {
            const counts = tespihatData;
            Object.values(counts).forEach(v => total += v || 0);
        }

        // Get or set start date
        let startDate = storageService.getString(ZIKIR_WORLD_KEYS.START_DATE, '');
        if (!startDate) {
            startDate = new Date().toISOString();
            storageService.setString(ZIKIR_WORLD_KEYS.START_DATE, startDate);
        }

        // Calculate days active
        const start = new Date(startDate);
        const now = new Date();
        const daysActive = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;

        // eslint-disable-next-line
        setPersonalStats({
            total,
            startDate: new Date(startDate).toLocaleDateString('tr-TR'),
            daysActive
        });
    }, []);

    // Format large numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="settings-container">
            {/* Header */}
            <div className="reveal-stagger" style={{ 
                '--delay': '0s',
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
                    {t('title')}
                </h1>
            </div>

            <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '24px', fontWeight: '600', padding: '0 4px' }}>
                {t('subtitle')}
            </p>

            {/* Personal Stats Card */}
            <div className="settings-card reveal-stagger" style={{
                '--delay': '0.1s',
                padding: '32px 24px',
                marginBottom: '32px',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1) 0%, rgba(39, 174, 96, 0.05) 100%)',
                border: '1px solid var(--nav-accent)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Background Element */}
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '120px',
                    height: '120px',
                    background: 'var(--nav-accent)',
                    opacity: 0.05,
                    borderRadius: '50%',
                    filter: 'blur(40px)'
                }}></div>

                <div className="hamburger-level-badge" style={{ 
                    alignSelf: 'center',
                    marginBottom: '24px',
                    background: 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1)',
                    color: 'var(--nav-accent)',
                    border: '1px solid var(--nav-accent)'
                }}>
                    <Heart size={14} fill="var(--nav-accent)" style={{ marginRight: '6px' }} /> {t('statsTitle')}
                </div>

                {/* Main Stat Display */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        fontSize: '4.5rem',
                        fontWeight: '950',
                        color: 'var(--nav-text)',
                        lineHeight: '1',
                        letterSpacing: '-2px',
                        marginBottom: '8px'
                    }}>
                        {formatNumber(personalStats.total)}
                    </div>
                    <div style={{ fontSize: '1rem', color: 'var(--nav-text-muted)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {t('totalDhikr')}
                    </div>
                </div>

                {/* Sub Stats Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '12px',
                    width: '100%',
                    marginTop: '8px'
                }}>
                    <div className="settings-card" style={{ padding: '16px 8px', flexDirection: 'column', background: 'var(--nav-bg)', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: '900',
                            color: 'var(--nav-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '4px'
                        }}>
                            <Calendar size={16} /> {personalStats.daysActive}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                            {t('days')}
                        </div>
                    </div>

                    <div className="settings-card" style={{ padding: '16px 8px', flexDirection: 'column', background: 'var(--nav-bg)', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: '900',
                            color: 'var(--error-color)',
                            marginBottom: '4px'
                        }}>
                            ⭐ {Math.floor(personalStats.total / 33)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                            {t('times', 'Tur')}
                        </div>
                    </div>

                    <div className="settings-card" style={{ padding: '16px 8px', flexDirection: 'column', background: 'var(--nav-bg)', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: '900',
                            color: 'var(--accent-color)',
                            marginBottom: '4px'
                        }}>
                            {personalStats.daysActive > 0 ? Math.round(personalStats.total / personalStats.daysActive) : 0}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--nav-text-muted)', fontWeight: '700' }}>
                            {t('dailyAvg', 'Ort.')}
                        </div>
                    </div>
                </div>

                {/* Start Date Footer */}
                <div style={{
                    marginTop: '32px',
                    paddingTop: '20px',
                    borderTop: '1px solid var(--nav-border)',
                    fontSize: '0.8rem',
                    color: 'var(--nav-text-muted)',
                    textAlign: 'center',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    <Clock size={14} />
                    {t('startDate')} {personalStats.startDate}
                </div>
            </div>

            {/* Dhikr Types List */}
            <div className="settings-group reveal-stagger" style={{ '--delay': '0.2s' }}>
                <div className="settings-group-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📿 {t('typesTitle')}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="reveal-stagger">
                {DHIKR_TYPES.map((dhikr, index) => {
                    const isExpanded = selectedDhikr === dhikr.id;
                    return (
                        <div
                            key={dhikr.id}
                            className="settings-card reveal-stagger"
                            style={{
                                '--delay': `${0.3 + index * 0.05}s`,
                                padding: '16px',
                                cursor: 'pointer',
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                borderLeft: isExpanded ? `4px solid ${dhikr.color}` : '1px solid var(--nav-border)',
                                background: isExpanded ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.03)' : 'var(--nav-bg)'
                            }}
                            onClick={() => setSelectedDhikr(isExpanded ? null : dhikr.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className="settings-icon-box" style={{ 
                                    width: '56px', 
                                    height: '56px', 
                                    background: isExpanded ? 'var(--nav-hover)' : 'rgba(0,0,0,0.02)',
                                    fontSize: '1.5rem',
                                    borderRadius: '16px',
                                    flexShrink: 0
                                }}>
                                    {dhikr.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: '900',
                                        fontSize: '1.75rem',
                                        color: dhikr.color,
                                        fontFamily: 'var(--arabic-font-family)',
                                        direction: 'rtl',
                                        lineHeight: '1.2',
                                        textAlign: 'right'
                                    }}>
                                        {dhikr.arabic}
                                    </div>
                                    <div style={{
                                        fontSize: '1rem',
                                        color: isExpanded ? 'var(--nav-text)' : 'var(--nav-text-muted)',
                                        fontWeight: '800',
                                        marginTop: '4px'
                                    }}>
                                        {dhikr.latin}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Content with Velocity style */}
                            {isExpanded && (
                                <div style={{
                                    marginTop: '20px',
                                    paddingTop: '20px',
                                    borderTop: '1px solid var(--nav-border)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        padding: '16px',
                                        background: 'var(--nav-hover)',
                                        borderRadius: '16px',
                                        fontSize: '0.9rem',
                                        color: 'var(--nav-text)',
                                        lineHeight: '1.6'
                                    }}>
                                        <div style={{ fontWeight: '950', marginBottom: '8px', color: 'var(--nav-accent)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                            {t('meaning')}
                                        </div>
                                        <div style={{ fontWeight: '600' }}>
                                            {t(`types.${dhikr.id}.meaning`)}
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        padding: '16px',
                                        background: 'rgba(15, 118, 110, 0.08)',
                                        borderRadius: '16px',
                                        fontSize: '0.9rem',
                                        color: 'var(--bg-emerald-med)',
                                        lineHeight: '1.6',
                                        border: '1px solid rgba(15, 118, 110, 0.1)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '950', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
                                            <Award size={14} /> {t('reward')}
                                        </div>
                                        <div style={{ fontWeight: '700' }}>
                                            {t(`types.${dhikr.id}.reward`)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Motivation Quote */}
            <div 
                className="settings-card reveal-stagger"
                style={{
                    '--delay': '0.8s',
                    marginTop: '32px',
                    padding: '24px',
                    background: 'var(--nav-hover)',
                    borderRadius: '24px',
                    border: '1px dashed var(--nav-border)',
                    flexDirection: 'column',
                    textAlign: 'center',
                    gap: '12px'
                }}
            >
                <div style={{ fontSize: '2rem' }}>🤲</div>
                <div style={{
                    fontSize: '0.95rem',
                    color: 'var(--nav-text)',
                    fontStyle: 'italic',
                    lineHeight: '1.8',
                    fontWeight: '600',
                    padding: '0 12px'
                }}>
                    "{t('quote')}"
                </div>
                <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--nav-text-muted)',
                    fontWeight: '800',
                    opacity: 0.8
                }}>
                    — {t('quoteRef')}
                </div>
            </div>
        </div>
    );
}

export default ZikirWorld;
