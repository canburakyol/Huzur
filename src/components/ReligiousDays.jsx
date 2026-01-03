import { religiousDays } from '../data/religiousDays';

const ReligiousDays = ({ onClose }) => {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const isPast = (dateStr) => {
        return new Date(dateStr) < new Date();
    };

    return (
        <div className="glass-card religious-days-container">
            <button onClick={onClose} className="close-button">×</button>

            <h2 className="religious-days-title">Dini Günler (2025)</h2>

            <div className="days-list">
                {religiousDays.map((day, index) => (
                    <div
                        key={index}
                        className={`day-item ${isPast(day.date) ? 'past' : ''}`}
                    >
                        <div className="day-name">
                            {day.name}
                        </div>
                        <div className="day-date">
                            {formatDate(day.date)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReligiousDays;
