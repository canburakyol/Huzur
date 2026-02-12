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
        color: '#27ae60'
    },
    {
        id: 'elhamdulillah',
        arabic: 'الْحَمْدُ لِلهِ',
        latin: 'Elhamdülillah',
        icon: '⚖️',
        color: '#f39c12'
    },
    {
        id: 'allahuekber',
        arabic: 'اللهُ أَكْبَرُ',
        latin: 'Allahu Ekber',
        icon: '🌟',
        color: '#9b59b6'
    },
    {
        id: 'lailaheillallah',
        arabic: 'لَا إِلٰهَ إِلَّا اللهُ',
        latin: 'Lâ ilâhe illallah',
        icon: '💎',
        color: '#3498db'
    },
    {
        id: 'estagfirullah',
        arabic: 'أَسْتَغْفِرُ اللهَ',
        latin: 'Estağfirullah',
        icon: '💧',
        color: '#1abc9c'
    },
    {
        id: 'salavat',
        arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
        latin: 'Allahümme salli ala Muhammed',
        icon: '🌹',
        color: '#e74c3c'
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
                    🌍 {t('title')}
                </h1>
            </div>

            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '20px' }}>
                {t('subtitle')}
            </p>

            {/* Personal Stats */}
            <div className="glass-card" style={{
                padding: '24px',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.2) 0%, rgba(46, 204, 113, 0.1) 100%)'
            }}>
                <h3 style={{
                    fontSize: '14px',
                    color: 'var(--primary-color)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Heart size={18} /> {t('statsTitle')}
                </h3>

                {/* Main Stat */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        fontSize: '48px',
                        fontWeight: '800',
                        color: 'var(--primary-color)'
                    }}>
                        {formatNumber(personalStats.total)}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-color)' }}>
                        {t('totalDhikr')}
                    </div>
                </div>

                {/* Sub Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#f39c12',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                        }}>
                            <Calendar size={16} />
                            {personalStats.daysActive}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-color-muted)' }}>
                            {t('days')}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#e74c3c'
                        }}>
                            ⭐ {Math.floor(personalStats.total / 33)}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-color-muted)' }}>
                            {t('times')}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#3498db'
                        }}>
                            {personalStats.daysActive > 0 ? Math.round(personalStats.total / personalStats.daysActive) : 0}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-color-muted)' }}>
                            {t('dailyAvg')}
                        </div>
                    </div>
                </div>

                {/* Start Date */}
                <div style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--glass-border)',
                    fontSize: '12px',
                    color: 'var(--text-color-muted)',
                    textAlign: 'center'
                }}>
                    <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    {t('startDate')} {personalStats.startDate}
                </div>
            </div>

            {/* Dhikr Types */}
            <h3 style={{
                fontSize: '14px',
                color: 'var(--primary-color)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                📿 {t('typesTitle')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {DHIKR_TYPES.map(dhikr => (
                    <div
                        key={dhikr.id}
                        className="glass-card"
                        style={{
                            padding: '16px',
                            cursor: 'pointer',
                            borderLeft: `4px solid ${dhikr.color}`
                        }}
                        onClick={() => setSelectedDhikr(selectedDhikr === dhikr.id ? null : dhikr.id)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '28px' }}>{dhikr.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontWeight: '700',
                                    fontSize: '18px',
                                    color: dhikr.color,
                                    fontFamily: 'Arial'
                                }}>
                                    {dhikr.arabic}
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    color: 'var(--text-color)',
                                    marginTop: '2px'
                                }}>
                                    {dhikr.latin}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {selectedDhikr === dhikr.id && (
                            <div style={{
                                marginTop: '12px',
                                paddingTop: '12px',
                                borderTop: '1px solid var(--glass-border)',
                                animation: 'fadeIn 0.3s ease'
                            }}>
                                <div style={{
                                    fontSize: '13px',
                                    color: 'var(--text-color-muted)',
                                    marginBottom: '8px'
                                }}>
                                    <strong>{t('meaning')}</strong> {t(`types.${dhikr.id}.meaning`)}
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    color: '#27ae60',
                                    background: 'rgba(39, 174, 96, 0.1)',
                                    padding: '10px',
                                    borderRadius: '8px'
                                }}>
                                    <Award size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    <strong>{t('reward')}</strong> {t(`types.${dhikr.id}.reward`)}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Motivation */}
            <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'var(--glass-bg)',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤲</div>
                <div style={{
                    fontSize: '13px',
                    color: 'var(--text-color)',
                    fontStyle: 'italic',
                    lineHeight: '1.6'
                }}>
                    "{t('quote')}"
                </div>
                <div style={{
                    fontSize: '11px',
                    color: 'var(--text-color-muted)',
                    marginTop: '8px'
                }}>
                    {t('quoteRef')}
                </div>
            </div>
        </div>
    );
}

export default ZikirWorld;
