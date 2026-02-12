import { useState } from 'react';
import { X, TrendingDown, Calendar, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

const PRAYER_TRACKER_KEY = 'prayerTracker';
const PRAYER_TRACKER_HISTORY_KEY = 'prayerTrackerHistory';

const PrayerTracker = ({ onClose }) => {
    const [counts, setCounts] = useState(() => {
        return storageService.getItem(PRAYER_TRACKER_KEY, {
            sabah: 0,
            ogle: 0,
            ikindi: 0,
            aksam: 0,
            yatsi: 0,
            vitir: 0,
            oruc: 0
        });
    });

    const [history, setHistory] = useState(() => {
        return storageService.getItem(PRAYER_TRACKER_HISTORY_KEY, []);
    });

    const [showInfo, setShowInfo] = useState(false);

    const updateCount = (key, delta) => {
        const newCounts = { ...counts, [key]: Math.max(0, counts[key] + delta) };
        setCounts(newCounts);
        storageService.setItem(PRAYER_TRACKER_KEY, newCounts);

        // Geçmişe kaydet
        if (delta < 0) {
            const log = {
                type: key,
                date: new Date().toISOString(),
                count: Math.abs(delta)
            };
            const newHistory = [...history, log].slice(-50); // Son 50 kayıt
            setHistory(newHistory);
            storageService.setItem(PRAYER_TRACKER_HISTORY_KEY, newHistory);
        }
    };

    const items = [
        { key: 'sabah', label: 'Sabah Namazı', icon: '🌅', rekat: 2 },
        { key: 'ogle', label: 'Öğle Namazı', icon: '☀️', rekat: 4 },
        { key: 'ikindi', label: 'İkindi Namazı', icon: '🌤️', rekat: 4 },
        { key: 'aksam', label: 'Akşam Namazı', icon: '🌅', rekat: 3 },
        { key: 'yatsi', label: 'Yatsı Namazı', icon: '🌙', rekat: 4 },
        { key: 'vitir', label: 'Vitir Namazı', icon: '⭐', rekat: 3 },
        { key: 'oruc', label: 'Oruç (Gün)', icon: '🍽️', rekat: null },
    ];

    const totalPrayers = counts.sabah + counts.ogle + counts.ikindi + counts.aksam + counts.yatsi + counts.vitir;
    const totalRekat = (counts.sabah * 2) + (counts.ogle * 4) + (counts.ikindi * 4) + (counts.aksam * 3) + (counts.yatsi * 4) + (counts.vitir * 3);

    // Tahmini süre hesaplama (günde 5 vakit kaza kılınırsa)
    const estimatedDays = Math.ceil(totalPrayers / 5);

    return (
        <div className="glass-card" style={{
            textAlign: 'center',
            position: 'relative',
            height: '85vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={() => setShowInfo(!showInfo)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667eea' }}>
                    <AlertCircle size={24} />
                </button>
                <h2 style={{ margin: 0, color: '#d35400', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TrendingDown size={24} /> Kaza Takibi
                </h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                    <X size={28} />
                </button>
            </div>

            {/* Bilgi Kutusu */}
            {showInfo && (
                <div style={{
                    background: 'rgba(52, 152, 219, 0.1)',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#2c3e50',
                    border: '1px solid rgba(52, 152, 219, 0.2)'
                }}>
                    <strong>📌 Kaza Namazı Nedir?</strong>
                    <p style={{ margin: '8px 0 0 0' }}>
                        Vaktinde kılınamayan farz namazlar için kaza namazı kılınır.
                        Kaza namazları, farz namazların yerine geçer ve borç ödenir gibi eda edilir.
                    </p>
                </div>
            )}

            {/* Özet Kartları */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalPrayers}</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>Toplam Vakit</div>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalRekat}</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>Toplam Rekat</div>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                    borderRadius: '12px',
                    padding: '12px',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{estimatedDays}</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>Tahmini Gün</div>
                </div>
            </div>

            {/* Namaz Listesi */}
            <div style={{ flex: 1 }}>
                {items.map((item) => (
                    <div
                        key={item.key}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px',
                            background: counts[item.key] === 0 ? 'rgba(39, 174, 96, 0.1)' : 'rgba(255,255,255,0.7)',
                            borderRadius: '12px',
                            marginBottom: '10px',
                            border: counts[item.key] === 0 ? '1px solid rgba(39, 174, 96, 0.3)' : '1px solid rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>{item.icon}</span>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: '600', color: '#2c3e50' }}>{item.label}</div>
                                {item.rekat && (
                                    <div style={{ fontSize: '11px', color: '#666' }}>{item.rekat} rekat</div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                onClick={() => updateCount(item.key, -1)}
                                disabled={counts[item.key] === 0}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: counts[item.key] === 0 ? '#ddd' : '#27ae60',
                                    color: 'white',
                                    fontSize: '20px',
                                    cursor: counts[item.key] === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {counts[item.key] === 0 ? <CheckCircle size={18} /> : '−'}
                            </button>
                            <span style={{
                                fontSize: '22px',
                                fontWeight: 'bold',
                                width: '50px',
                                textAlign: 'center',
                                color: counts[item.key] === 0 ? '#27ae60' : '#e74c3c'
                            }}>
                                {counts[item.key]}
                            </span>
                            <button
                                onClick={() => updateCount(item.key, 1)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: '#e74c3c',
                                    color: 'white',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Motivasyon mesajı */}
            {totalPrayers === 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginTop: '16px',
                    textAlign: 'center'
                }}>
                    <CheckCircle size={32} color="#27ae60" style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: '600', color: '#27ae60' }}>Maşallah!</div>
                    <div style={{ fontSize: '13px', color: '#155724' }}>Kaza borcunuz bulunmuyor</div>
                </div>
            )}
        </div>
    );
};

export default PrayerTracker;
