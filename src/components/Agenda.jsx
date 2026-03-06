import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, X, 
    Clock, MapPin, Tag, MoreHorizontal, Check, RefreshCw
} from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { getMonthDays, getMonthName, getHijriDate } from '../data/agendaData';
import { storageService } from '../services/storageService';
import './Navigation.css';

const AGENDA_EVENTS_KEY = 'agenda_events';

const Agenda = ({ onClose }) => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState(() => {
        return storageService.getItem(AGENDA_EVENTS_KEY, {});
    });
    const [showEventModal, setShowEventModal] = useState(false);

    // Form state
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventTime, setNewEventTime] = useState('');
    const [newEventDesc, setNewEventDesc] = useState('');

    const saveEvents = (updatedEvents) => {
        setEvents(updatedEvents);
        storageService.setItem(AGENDA_EVENTS_KEY, updatedEvents);
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

    const weekDays = [
        t('agenda.weekdays.mon', 'Pzt'),
        t('agenda.weekdays.tue', 'Sal'),
        t('agenda.weekdays.wed', 'Çar'),
        t('agenda.weekdays.thu', 'Per'),
        t('agenda.weekdays.fri', 'Cum'),
        t('agenda.weekdays.sat', 'Cmt'),
        t('agenda.weekdays.sun', 'Paz')
    ];

    return (
        <div className="settings-container reveal-stagger" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <IslamicBackButton onClick={onClose} size="medium" />
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                        {t(getMonthName(currentDate.getMonth()))} {currentDate.getFullYear()}
                    </h2>
                    <p className="settings-desc">
                        {t(hijriDate.monthName)} {hijriDate.year} ({t('agenda.hijriLabel', 'Hicri')})
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handlePrevMonth} style={{ background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '12px', padding: '10px', color: 'var(--nav-text)', cursor: 'pointer' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNextMonth} style={{ background: 'var(--nav-hover)', border: '1px solid var(--nav-border)', borderRadius: '12px', padding: '10px', color: 'var(--nav-text)', cursor: 'pointer' }}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="settings-card" style={{ flexDirection: 'column', padding: '12px', gap: '12px' }}>
                {/* Weekday Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
                    {weekDays.map(day => (
                        <div key={day} style={{ fontSize: '11px', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {days.map((day, index) => {
                        if (!day) return <div key={`empty-${index}`} />;

                        const hasEvents = events[day.dateStr] && events[day.dateStr].length > 0;
                        const isReligious = !!day.religiousDay;

                        return (
                            <div
                                key={day.dateStr}
                                onClick={() => handleDateClick(day)}
                                className={`calendar-day ${day.isToday ? 'today' : ''}`}
                                style={{
                                    aspectRatio: '1',
                                    background: day.isToday
                                        ? 'var(--nav-accent)'
                                        : isReligious
                                            ? 'rgba(239, 68, 68, 0.05)'
                                            : 'var(--nav-hover)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: day.isToday ? 'none' : isReligious ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--nav-border)',
                                    position: 'relative',
                                    transition: 'all 0.2s',
                                    boxShadow: day.isToday ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none'
                                }}
                            >
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: '800',
                                    color: day.isToday ? 'white' : 'var(--nav-text)'
                                }}>
                                    {day.day}
                                </span>

                                <span style={{
                                    fontSize: '9px',
                                    fontWeight: '700',
                                    color: day.isToday ? 'rgba(255,255,255,0.8)' : 'var(--nav-text-muted)',
                                    marginBottom: '-12px'
                                }}>
                                    {day.hijri.day}
                                </span>

                                {/* Indicators */}
                                <div style={{ position: 'absolute', bottom: '6px', display: 'flex', gap: '3px' }}>
                                    {isReligious && (
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444' }}></div>
                                    )}
                                    {hasEvents && (
                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3b82f6' }}></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Event Modal / Bottom Sheet */}
            {showEventModal && selectedDate && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                    zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
                }} onClick={() => setShowEventModal(false)}>
                    <div
                        className="modal-content reveal-stagger"
                        style={{
                            width: '100%', maxWidth: '500px', maxHeight: '90vh',
                            background: 'var(--nav-bg)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
                            padding: '32px', overflowY: 'auto', border: '1px solid var(--nav-border)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ width: '40px', height: '4px', background: 'var(--nav-border)', borderRadius: '2px', margin: '-16px auto 24px' }}></div>
                        
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--nav-text)' }}>
                                    {selectedDate.day} {t(getMonthName(selectedDate.date.getMonth()))} {selectedDate.date.getFullYear()}
                                </h3>
                                <p className="settings-desc">
                                    {selectedDate.hijri.day} {t(selectedDate.hijri.monthName)} {selectedDate.hijri.year}
                                </p>
                            </div>
                            <button onClick={() => setShowEventModal(false)} style={{ background: 'var(--nav-hover)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nav-text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Religious Day */}
                        {selectedDate.religiousDay && (
                            <div className="settings-card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CalendarIcon size={20} />
                                    </div>
                                    <div style={{ fontWeight: '800' }}>{selectedDate.religiousDay.name}</div>
                                </div>
                            </div>
                        )}

                        {/* Events List */}
                        <div className="settings-group">
                            <div className="settings-group-title">{t('agenda.eventsAndNotes', 'Etkinlikler ve Notlar')}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(!events[selectedDate.dateStr] || events[selectedDate.dateStr].length === 0) ? (
                                    <div style={{ padding: '24px', textAlign: 'center', opacity: 0.5 }}>
                                        <CalendarIcon size={40} style={{ marginBottom: '12px' }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{t('agenda.noEventsYet', 'Bugün için bir kayıt bulunmuyor.')}</p>
                                    </div>
                                ) : (
                                    events[selectedDate.dateStr].map(event => (
                                        <div key={event.id} className="settings-card" style={{ padding: '16px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '800', color: 'var(--nav-text)' }}>{event.title}</div>
                                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                                    {event.time && (
                                                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--nav-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Clock size={12} /> {event.time}
                                                        </div>
                                                    )}
                                                    {event.desc && (
                                                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--nav-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Tag size={12} /> {event.desc}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                style={{ background: 'rgba(239, 68, 68, 0.05)', border: 'none', color: '#ef4444', padding: '10px', borderRadius: '12px' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Add Event Form */}
                        <div className="settings-group" style={{ marginTop: '32px' }}>
                            <div className="settings-group-title">{t('agenda.addNew', 'Yeni Ekle')}</div>
                            <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input
                                    type="text"
                                    placeholder={t('agenda.titlePlaceholder', 'Başlık (örn: İftar Daveti)')}
                                    value={newEventTitle}
                                    onChange={e => setNewEventTitle(e.target.value)}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--nav-border)', background: 'var(--nav-hover)', color: 'var(--nav-text)', outline: 'none' }}
                                />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="time"
                                            value={newEventTime}
                                            onChange={e => setNewEventTime(e.target.value)}
                                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--nav-border)', background: 'var(--nav-hover)', color: 'var(--nav-text)', outline: 'none' }}
                                        />
                                        <Clock size={16} style={{ position: 'absolute', right: '14px', pointerEvents: 'none', color: 'var(--nav-text-muted)' }} />
                                    </div>
                                </div>
                                <textarea
                                    placeholder={t('agenda.notesPlaceholder', 'Not ekleyin...')}
                                    value={newEventDesc}
                                    onChange={e => setNewEventDesc(e.target.value)}
                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--nav-border)', background: 'var(--nav-hover)', color: 'var(--nav-text)', outline: 'none', resize: 'none', height: '100px' }}
                                />
                                <button
                                    type="submit"
                                    style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'var(--nav-accent)', color: 'white', fontWeight: '800', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)' }}
                                    disabled={!newEventTitle.trim()}
                                >
                                    <Plus size={20} />
                                    {t('common.add', 'Ekle')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agenda;
