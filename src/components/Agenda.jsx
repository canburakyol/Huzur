import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, X } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { getMonthDays, getMonthName, getHijriDate } from '../data/agendaData';

const Agenda = ({ onClose }) => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState(() => {
        // Load events from localStorage on initial render
        const savedEvents = localStorage.getItem('agenda_events');
        return savedEvents ? JSON.parse(savedEvents) : {};
    }); // { "YYYY-MM-DD": [{id, title, time, desc}] }
    const [showEventModal, setShowEventModal] = useState(false);

    // Form state
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventTime, setNewEventTime] = useState('');
    const [newEventDesc, setNewEventDesc] = useState('');

    // Save events to localStorage
    const saveEvents = (updatedEvents) => {
        setEvents(updatedEvents);
        localStorage.setItem('agenda_events', JSON.stringify(updatedEvents));
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (dayObj) => {
        if (!dayObj) return;
        setSelectedDate(dayObj);
        setShowEventModal(true);
        // Reset form
        setNewEventTitle('');
        setNewEventTime('');
        setNewEventDesc('');
    };

    const handleAddEvent = (e) => {
        e.preventDefault();
        if (!newEventTitle.trim()) return;

        const dateKey = selectedDate.dateStr;
        const newEvent = {
            id: Date.now(),
            title: newEventTitle,
            time: newEventTime,
            desc: newEventDesc
        };

        const updatedEvents = { ...events };
        if (!updatedEvents[dateKey]) {
            updatedEvents[dateKey] = [];
        }
        updatedEvents[dateKey].push(newEvent);

        saveEvents(updatedEvents);

        // Clear form but keep modal open
        setNewEventTitle('');
        setNewEventTime('');
        setNewEventDesc('');
    };

    const handleDeleteEvent = (eventId) => {
        const dateKey = selectedDate.dateStr;
        const updatedEvents = { ...events };
        updatedEvents[dateKey] = updatedEvents[dateKey].filter(ev => ev.id !== eventId);

        if (updatedEvents[dateKey].length === 0) {
            delete updatedEvents[dateKey];
        }

        saveEvents(updatedEvents);
    };

    const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
    const hijriDate = getHijriDate(currentDate);

    // Weekday headers
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    return (
        <div style={{ paddingBottom: '80px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="glass-card" style={{
                marginBottom: '15px',
                padding: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <IslamicBackButton onClick={onClose} size="medium" />

                <div style={{ flex: 1, textAlign: 'center' }}>
                    <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '18px' }}>
                        {t(getMonthName(currentDate.getMonth()))} {currentDate.getFullYear()}
                    </h2>
                    <p style={{ margin: '5px 0 0', fontSize: '14px', color: 'var(--text-color)', opacity: 0.8 }}>
                        {t(hijriDate.monthName)} {hijriDate.year} (Hicri)
                    </p>
                </div>
            </div>

            {/* Calendar Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', padding: '0 10px' }}>
                <button onClick={handlePrevMonth} className="btn-icon" style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px', color: 'var(--text-color)' }}>
                    <ChevronLeft size={24} />
                </button>
                <button onClick={() => setCurrentDate(new Date())} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    Bugün
                </button>
                <button onClick={handleNextMonth} className="btn-icon" style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px', color: 'var(--text-color)' }}>
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="glass-card" style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
                {/* Weekday Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '10px', textAlign: 'center' }}>
                    {weekDays.map(day => (
                        <div key={day} style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-color)', opacity: 0.7 }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                    {days.map((day, index) => {
                        if (!day) return <div key={`empty-${index}`} />;

                        const hasEvents = events[day.dateStr] && events[day.dateStr].length > 0;
                        const isReligious = !!day.religiousDay;

                        return (
                            <div
                                key={day.dateStr}
                                onClick={() => handleDateClick(day)}
                                style={{
                                    aspectRatio: '1',
                                    background: day.isToday
                                        ? 'var(--primary-color)'
                                        : isReligious
                                            ? 'rgba(231, 76, 60, 0.1)'
                                            : 'rgba(255,255,255,0.05)',
                                    borderRadius: '10px',
                                    padding: '5px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    border: isReligious ? '1px solid rgba(231, 76, 60, 0.3)' : 'none',
                                    position: 'relative'
                                }}
                            >
                                <span style={{
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    color: day.isToday ? 'white' : 'var(--text-color)'
                                }}>
                                    {day.day}
                                </span>

                                <span style={{
                                    fontSize: '10px',
                                    color: day.isToday ? 'rgba(255,255,255,0.8)' : 'var(--text-color)',
                                    opacity: 0.7
                                }}>
                                    {day.hijri.day}
                                </span>

                                {/* Indicators */}
                                <div style={{ display: 'flex', gap: '2px' }}>
                                    {isReligious && (
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#e74c3c' }}></div>
                                    )}
                                    {hasEvents && (
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3498db' }}></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Event Modal */}
            {showEventModal && selectedDate && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'flex-end', // Bottom sheet style
                    justifyContent: 'center'
                }} onClick={() => setShowEventModal(false)}>
                    <div
                        style={{
                            width: '100%',
                            maxHeight: '85vh',
                            background: 'var(--card-bg)',
                            borderTopLeftRadius: '20px',
                            borderTopRightRadius: '20px',
                            padding: '20px',
                            overflowY: 'auto',
                            animation: 'slideUp 0.3s ease-out'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--primary-color)' }}>
                                    {selectedDate.day} {t(getMonthName(selectedDate.date.getMonth()))} {selectedDate.date.getFullYear()}
                                </h3>
                                <p style={{ margin: '5px 0 0', color: 'var(--text-color)', opacity: 0.8 }}>
                                    {selectedDate.hijri.day} {t(selectedDate.hijri.monthName)} {selectedDate.hijri.year}
                                </p>
                            </div>
                            <button onClick={() => setShowEventModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-color)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Religious Day Info */}
                        {selectedDate.religiousDay && (
                            <div style={{
                                background: 'rgba(231, 76, 60, 0.1)',
                                border: '1px solid rgba(231, 76, 60, 0.3)',
                                borderRadius: '12px',
                                padding: '15px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <CalendarIcon size={20} color="#e74c3c" />
                                <span style={{ color: '#e74c3c', fontWeight: '600' }}>
                                    {selectedDate.religiousDay.name}
                                </span>
                            </div>
                        )}

                        {/* Events List */}
                        <div style={{ marginBottom: '20px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-color)' }}>Etkinlikler & Notlar</h4>
                            {(!events[selectedDate.dateStr] || events[selectedDate.dateStr].length === 0) ? (
                                <p style={{ color: 'var(--text-color)', opacity: 0.5, fontStyle: 'italic' }}>Henüz etkinlik yok.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {events[selectedDate.dateStr].map(event => (
                                        <div key={event.id} style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '10px',
                                            padding: '12px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text-color)' }}>{event.title}</div>
                                                {event.time && (
                                                    <div style={{ fontSize: '12px', color: 'var(--primary-color)', marginTop: '2px' }}>⏰ {event.time}</div>
                                                )}
                                                {event.desc && (
                                                    <div style={{ fontSize: '13px', color: 'var(--text-color)', opacity: 0.7, marginTop: '4px' }}>{event.desc}</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                style={{ background: 'none', border: 'none', color: '#e74c3c', padding: '5px' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add Event Form */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-color)' }}>Yeni Ekle</h4>
                            <form onSubmit={handleAddEvent}>
                                <input
                                    type="text"
                                    placeholder="Başlık (Örn: İftar Daveti)"
                                    value={newEventTitle}
                                    onChange={e => setNewEventTitle(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--text-color)',
                                        marginBottom: '10px'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <input
                                        type="time"
                                        value={newEventTime}
                                        onChange={e => setNewEventTime(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'var(--text-color)'
                                        }}
                                    />
                                </div>
                                <textarea
                                    placeholder="Notlar..."
                                    value={newEventDesc}
                                    onChange={e => setNewEventDesc(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'var(--text-color)',
                                        marginBottom: '15px',
                                        resize: 'none',
                                        height: '80px'
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    disabled={!newEventTitle.trim()}
                                >
                                    <Plus size={20} />
                                    Ekle
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Agenda;
