import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from './shared/IslamicBackButton';

const Imsakiye = ({ onClose, locationName }) => {
    const { t } = useTranslation();
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    
    // Fallback if locationName is missing
    const city = locationName && locationName !== 'Konum' ? locationName : 'Istanbul';
    const country = 'Turkey';

    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    useEffect(() => {
        const fetchMonthlyPrayerTimes = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Use AlAdhan Calendar API for monthly prayer times
                const response = await axios.get(
                    `https://api.aladhan.com/v1/calendarByCity/${currentYear}/${currentMonth + 1}`,
                    {
                        params: {
                            city: city,
                            country: country,
                            method: 13, // Diyanet İşleri Başkanlığı
                        },
                        timeout: 15000
                    }
                );

                if (response.data && response.data.data) {
                    const monthData = response.data.data.map((dayData) => ({
                        date: dayData.date.readable,
                        gregorian: dayData.date.gregorian.day,
                        hijri: `${dayData.date.hijri.day} ${dayData.date.hijri.month.tr || dayData.date.hijri.month.en}`,
                        times: dayData.timings,
                        isToday: new Date().getDate() === parseInt(dayData.date.gregorian.day) &&
                                 new Date().getMonth() === currentMonth &&
                                 new Date().getFullYear() === currentYear
                    }));
                    setDays(monthData);
                }
            } catch (err) {
                console.error('Imsakiye fetch error:', err);
                setError('Namaz saatleri yüklenemedi. Lütfen tekrar deneyin.');
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyPrayerTimes();
    }, [currentMonth, currentYear, city, country]);

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // Clean time string (remove timezone)
    const cleanTime = (timeStr) => {
        if (!timeStr) return '--:--';
        return timeStr.split(' ')[0];
    };

    return (
        <div className="app-container" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px',
                background: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <IslamicBackButton onClick={onClose} variant="light" />
                
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '22px' }}>📅 {t('menu.imsakiye')}</h2>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '12px',
                        marginTop: '4px',
                        justifyContent: 'center'
                    }}>
                        <MapPin size={12} />
                        <span>{city}, {country}</span>
                    </div>
                </div>

                <div style={{ width: '40px' }}></div>
            </div>

            {/* Month Selector */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '15px 20px',
                background: 'var(--card-bg)',
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <button 
                    onClick={goToPreviousMonth}
                    style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-color)'
                    }}
                >
                    <ChevronLeft size={20} />
                </button>
                
                <span style={{ color: 'var(--text-color)', fontWeight: '600', fontSize: '16px' }}>
                    {monthNames[currentMonth]} {currentYear}
                </span>
                
                <button 
                    onClick={goToNextMonth}
                    style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-color)'
                    }}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '0 10px 20px' }}>
                {loading ? (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '200px',
                        color: 'var(--text-color)',
                        gap: '10px'
                    }}>
                        <Loader className="spin" size={32} />
                        <span>{t('common.loading')}</span>
                    </div>
                ) : error ? (
                    <div style={{ 
                        textAlign: 'center', 
                        color: '#e74c3c',
                        padding: '40px'
                    }}>
                        {error}
                    </div>
                ) : (
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse', 
                        fontSize: '12px',
                        color: 'var(--text-color)'
                    }}>
                        <thead>
                            <tr style={{ 
                                background: 'var(--primary-color)',
                                color: 'white',
                                position: 'sticky',
                                top: 0
                            }}>
                                <th style={{ padding: '12px 6px', textAlign: 'left' }}>Gün</th>
                                <th style={{ padding: '12px 4px' }}>{t('prayer.fajr')}</th>
                                <th style={{ padding: '12px 4px' }}>{t('prayer.sunrise')}</th>
                                <th style={{ padding: '12px 4px' }}>{t('prayer.dhuhr')}</th>
                                <th style={{ padding: '12px 4px' }}>{t('prayer.asr')}</th>
                                <th style={{ padding: '12px 4px', background: 'rgba(255,255,255,0.2)' }}>{t('prayer.maghrib')}</th>
                                <th style={{ padding: '12px 4px' }}>{t('prayer.isha')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {days.map((day, index) => (
                                <tr 
                                    key={index} 
                                    style={{ 
                                        borderBottom: '1px solid var(--glass-border)',
                                        background: day.isToday ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent'
                                    }}
                                >
                                    <td style={{ 
                                        padding: '10px 6px', 
                                        textAlign: 'left',
                                        fontWeight: day.isToday ? 'bold' : 'normal'
                                    }}>
                                        <div style={{ fontWeight: '600' }}>{day.gregorian}</div>
                                        <div style={{ fontSize: '10px', opacity: 0.7 }}>{day.hijri}</div>
                                    </td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center' }}>{cleanTime(day.times.Fajr)}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center' }}>{cleanTime(day.times.Sunrise)}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center' }}>{cleanTime(day.times.Dhuhr)}</td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center' }}>{cleanTime(day.times.Asr)}</td>
                                    <td style={{ 
                                        padding: '10px 4px', 
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        color: 'var(--primary-color)',
                                        background: 'rgba(var(--primary-rgb), 0.1)'
                                    }}>
                                        {cleanTime(day.times.Maghrib)}
                                    </td>
                                    <td style={{ padding: '10px 4px', textAlign: 'center' }}>{cleanTime(day.times.Isha)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Imsakiye;
