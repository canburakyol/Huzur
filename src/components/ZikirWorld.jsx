import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Award, Heart, Calendar, Clock } from 'lucide-react';

// Zikir types with their meanings
const DHIKR_TYPES = [
    {
        id: 'subhanallah',
        arabic: 'سُبْحَانَ اللهِ',
        latin: 'Sübhanallah',
        meaning: 'Allah eksikliklerden münezzehtir',
        reward: 'Her biri için cennette bir ağaç dikilir',
        icon: '🌳',
        color: '#27ae60'
    },
    {
        id: 'elhamdulillah',
        arabic: 'الْحَمْدُ لِلهِ',
        latin: 'Elhamdülillah',
        meaning: 'Hamd Allah\'a mahsustur',
        reward: 'Terazinin sevap kefesini doldurur',
        icon: '⚖️',
        color: '#f39c12'
    },
    {
        id: 'allahuekber',
        arabic: 'اللهُ أَكْبَرُ',
        latin: 'Allahu Ekber',
        meaning: 'Allah en büyüktür',
        reward: 'Gök ile yer arasını sevapla doldurur',
        icon: '🌟',
        color: '#9b59b6'
    },
    {
        id: 'lailaheillallah',
        arabic: 'لَا إِلٰهَ إِلَّا اللهُ',
        latin: 'Lâ ilâhe illallah',
        meaning: 'Allah\'tan başka ilah yoktur',
        reward: 'Sözlerin en faziletlisi',
        icon: '💎',
        color: '#3498db'
    },
    {
        id: 'estagfirullah',
        arabic: 'أَسْتَغْفِرُ اللهَ',
        latin: 'Estağfirullah',
        meaning: 'Allah\'tan bağışlanma dilerim',
        reward: 'Günahları siler, rızkı artırır',
        icon: '💧',
        color: '#1abc9c'
    },
    {
        id: 'salavat',
        arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
        latin: 'Allahümme salli ala Muhammed',
        meaning: 'Allah\'ım Muhammed\'e salat et',
        reward: 'On salat ile karşılık görür',
        icon: '🌹',
        color: '#e74c3c'
    }
];

function ZikirWorld({ onClose }) {
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
        const zikirData = localStorage.getItem('zikirmatik_count');
        if (zikirData) {
            total += parseInt(zikirData) || 0;
        }

        // Check for tespihat data
        const tespihatData = localStorage.getItem('tespihat_counts');
        if (tespihatData) {
            const counts = JSON.parse(tespihatData);
            Object.values(counts).forEach(v => total += v || 0);
        }

        // Get or set start date
        let startDate = localStorage.getItem('zikir_start_date');
        if (!startDate) {
            startDate = new Date().toISOString();
            localStorage.setItem('zikir_start_date', startDate);
        }

        // Calculate days active
        const start = new Date(startDate);
        const now = new Date();
        const daysActive = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;

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
                    🌍 Zikir Dünyam
                </h1>
            </div>

            <p style={{ color: 'var(--text-color-muted)', fontSize: '14px', marginBottom: '20px' }}>
                Uygulamayı kullanmaya başladığından beri zikir istatistiklerin
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
                    <Heart size={18} /> Zikir İstatistiklerim
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
                        Toplam Zikir
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
                            Gün
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
                            Sefer
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
                            Günlük Ort.
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
                    Başlangıç: {personalStats.startDate}
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
                📿 Zikir Çeşitleri ve Faziletleri
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
                                    <strong>Anlamı:</strong> {dhikr.meaning}
                                </div>
                                <div style={{
                                    fontSize: '13px',
                                    color: '#27ae60',
                                    background: 'rgba(39, 174, 96, 0.1)',
                                    padding: '10px',
                                    borderRadius: '8px'
                                }}>
                                    <Award size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    <strong>Fazileti:</strong> {dhikr.reward}
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
                    "Dikkat edin! Kalpler ancak Allah'ı anmakla huzur bulur."
                </div>
                <div style={{
                    fontSize: '11px',
                    color: 'var(--text-color-muted)',
                    marginTop: '8px'
                }}>
                    — Ra'd Suresi, 28. Ayet
                </div>
            </div>
        </div>
    );
}

export default ZikirWorld;
