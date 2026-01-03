import { useState, useEffect } from 'react';
import { getPrayerTimes } from '../services/prayerService';

const Imsakiye = ({ onClose }) => {
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMonth = async () => {
            // In a real app, we would fetch the whole month. 
            // Since our service currently fetches 'today', we will simulate a list for demo purposes
            // or fetch multiple days if the API supports it. 
            // For now, we'll mock a 30-day list starting from today based on the single day data we have,
            // just to show the UI structure. In production, we'd need a 'calendar' endpoint.

            const todayData = await getPrayerTimes();
            const today = new Date();

            const mockDays = Array.from({ length: 30 }, (_, i) => {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                return {
                    date: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }),
                    times: todayData.timings // Using same times for demo as we don't have full month API yet
                };
            });

            setDays(mockDays);
            setLoading(false);
        };

        fetchMonth();
    }, []);

    return (
        <div className="glass-card" style={{ textAlign: 'center', position: 'relative', maxHeight: '80vh', overflowY: 'auto', width: '95%' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>

            <h2 style={{ color: '#d35400', marginBottom: '20px' }}>İmsakiye</h2>

            {loading ? (
                <div>Yükleniyor...</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(211, 84, 0, 0.1)', color: '#d35400' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Tarih</th>
                                <th style={{ padding: '10px' }}>İmsak</th>
                                <th style={{ padding: '10px' }}>Güneş</th>
                                <th style={{ padding: '10px' }}>Öğle</th>
                                <th style={{ padding: '10px' }}>İkindi</th>
                                <th style={{ padding: '10px' }}>Akşam</th>
                                <th style={{ padding: '10px' }}>Yatsı</th>
                            </tr>
                        </thead>
                        <tbody>
                            {days.map((day, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <td style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>{day.date}</td>
                                    <td style={{ padding: '10px' }}>{day.times.Fajr}</td>
                                    <td style={{ padding: '10px' }}>{day.times.Sunrise}</td>
                                    <td style={{ padding: '10px' }}>{day.times.Dhuhr}</td>
                                    <td style={{ padding: '10px' }}>{day.times.Asr}</td>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#d35400' }}>{day.times.Maghrib}</td>
                                    <td style={{ padding: '10px' }}>{day.times.Isha}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Imsakiye;
