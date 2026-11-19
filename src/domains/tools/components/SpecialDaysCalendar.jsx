import { useState } from 'react';
import {
  X, 
  ChevronLeft, 
  ChevronRight,
  Moon,
  Star,
  Heart,
  Sparkles,
  Calendar,
  Bell
} from 'lucide-react';
import './SpecialDaysCalendar.css';
import { storageService } from '../../../services/storageService';
import { religiousDays, toLocalDateKey } from '../../../data/religiousDays';

// Presentation for each kind; dates come from the shared Diyanet table in data/religiousDays.
const KIND_META = {
  regaib: { type: 'kandil', icon: '✨', description: 'Üç ayların ilk kandili' },
  mirac: { type: 'kandil', icon: '🌙', description: "Peygamber Efendimiz'in (s.a.v.) Miraç'a yükseldiği gece" },
  berat: { type: 'kandil', icon: '⭐', description: 'Af ve mağfiret gecesi' },
  ramazan: { type: 'ramazan', icon: '🌙', description: 'Ramazan ayının ilk günü' },
  kadir: { type: 'kandil', icon: '👑', description: 'Bin aydan hayırlı gece' },
  ramazanArefe: { type: 'ramazan', icon: '🌙', description: "Ramazan Bayramı'ndan önceki gün" },
  ramazanBayrami: { type: 'bayram', icon: '🎉', description: 'Ramazan Bayramı 1. gün' },
  kurbanArefe: { type: 'hac', icon: '🕋', description: "Hacıların Arafat'ta vakfeye durduğu gün" },
  kurbanBayrami: { type: 'bayram', icon: '🐑', description: 'Kurban Bayramı 1. gün' },
  hicriYilbasi: { type: 'hicri', icon: '📅', description: 'Muharrem ayının ilk günü' },
  asure: { type: 'hicri', icon: '🥣', description: "Muharrem'in 10. günü" },
  mevlid: { type: 'kandil', icon: '🌙', description: "Peygamber Efendimiz'in (s.a.v.) doğum gecesi" },
};

const SPECIAL_DAYS = religiousDays.map((day) => ({ id: `${day.kind}-${day.date}`, ...day, ...KIND_META[day.kind] }));

// Kategori renkleri
const CATEGORY_COLORS = {
  kandil: { bg: 'rgba(var(--nav-accent-rgb, 245, 158, 11), 0.18)', border: 'var(--accent-gold-light)', icon: '✨' },
  ramazan: { bg: 'rgba(var(--nav-accent-rgb, 245, 158, 11), 0.18)', border: 'var(--accent-gold-light)', icon: '🌙' },
  bayram: { bg: 'rgba(15, 118, 110, 0.18)', border: 'var(--surface-container)', icon: '🎉' },
  hac: { bg: 'rgba(6, 95, 70, 0.18)', border: 'var(--secondary-container)', icon: '🕋' },
  hicri: { bg: 'rgba(6, 78, 59, 0.18)', border: 'var(--primary-container)', icon: '📅' }
};

// Storage key
const STORAGE_KEY = 'huzur_special_days_notifications';

export function SpecialDaysCalendar({ onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Load notification preferences from localStorage with initial state
  const [notifications, setNotifications] = useState(() => {
    return storageService.getItem(STORAGE_KEY, {});
  });

  // Save notification preferences
  const toggleNotification = (dayId) => {
    const newNotifications = {
      ...notifications,
      [dayId]: !notifications[dayId]
    };
    setNotifications(newNotifications);
    storageService.setItem(STORAGE_KEY, newNotifications);
  };

  // Get days for current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const specialDay = SPECIAL_DAYS.find(day => day.date === dateStr);
      days.push({
        day: i,
        date: dateStr,
        specialDay
      });
    }
    
    return days;
  };

  // Get upcoming special days
  const getUpcomingDays = () => {
    const today = toLocalDateKey(new Date());
    return SPECIAL_DAYS
      .filter(day => day.date >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  
  const days = getDaysInMonth(currentDate);
  const upcomingDays = getUpcomingDays();

  // Calculate days until a special day
  const getDaysUntil = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="special-days-container">
      {/* Header */}
      <div className="special-days-header">
        <button className="back-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="header-content">
          <h1>Özel Günler Takvimi</h1>
          <p>Dini günleri ve kandil gecelerini takip edin</p>
        </div>
      </div>

      {/* Upcoming Special Days */}
      <div className="upcoming-section">
        <h2 className="section-title">
          <Sparkles size={20} />
          Yaklaşan Özel Günler
        </h2>
        <div className="upcoming-list">
          {upcomingDays.map((day) => {
            const daysUntil = getDaysUntil(day.date);
            return (
              <div 
                key={day.id}
                className="upcoming-card"
                style={{ 
                  background: CATEGORY_COLORS[day.type]?.bg || 'rgba(var(--nav-accent-rgb, 245, 158, 11), 0.12)',
                  borderColor: CATEGORY_COLORS[day.type]?.border || 'var(--accent-gold-light)'
                }}
              >
                <div className="upcoming-icon">{day.icon}</div>
                <div className="upcoming-info">
                  <h3>{day.name}</h3>
                  <p>{day.description}</p>
                  <span className="days-until">
                    {daysUntil === 0 ? 'Bugün!' : `${daysUntil} gün kaldı`}
                  </span>
                </div>
                <button 
                  className={`notify-btn ${notifications[day.id] ? 'active' : ''}`}
                  onClick={() => toggleNotification(day.id)}
                >
                  <Bell size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-section">
        <div className="calendar-header">
          <button className="nav-btn" onClick={prevMonth}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button className="nav-btn" onClick={nextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendar-grid">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div key={day} className="week-day-header">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => (
            <div 
              key={index}
              className={`calendar-day ${day?.specialDay ? 'special' : ''} ${!day ? 'empty' : ''}`}
              style={day?.specialDay ? {
                background: CATEGORY_COLORS[day.specialDay.type]?.bg,
                borderColor: CATEGORY_COLORS[day.specialDay.type]?.border
              } : {}}
              onClick={() => day?.specialDay && setSelectedDay(day.specialDay)}
            >
              {day && (
                <>
                  <span className="day-number">{day.day}</span>
                  {day.specialDay && (
                    <span className="day-icon">{day.specialDay.icon}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <h3>Kategori Açıklamaları</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--accent-gold-light)' }}></span>
            <span>Kandil Geceleri</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--accent-gold-light)' }}></span>
            <span>Ramazan</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--surface-container)' }}></span>
            <span>Bayramlar</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--secondary-container)' }}></span>
            <span>Hac</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: 'var(--primary-container)' }}></span>
            <span>Hicri Günler</span>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="day-modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="day-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDay(null)}>
              <X size={20} />
            </button>
            
            <div 
              className="modal-header"
              style={{ 
                background: CATEGORY_COLORS[selectedDay.type]?.bg,
                borderColor: CATEGORY_COLORS[selectedDay.type]?.border
              }}
            >
              <span className="modal-icon">{selectedDay.icon}</span>
              <h2>{selectedDay.name}</h2>
              <p className="modal-date">
                {new Date(selectedDay.date).toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="modal-content">
              <p className="modal-description">{selectedDay.description}</p>
              
              <div className="modal-actions">
                <button 
                  className={`modal-notify-btn ${notifications[selectedDay.id] ? 'active' : ''}`}
                  onClick={() => toggleNotification(selectedDay.id)}
                >
                  <Bell size={18} />
                  {notifications[selectedDay.id] ? 'Bildirim Açık' : 'Bildirim Aç'}
                </button>
              </div>

              <div className="modal-info">
                <h4>Önerilen İbadetler:</h4>
                <ul>
                  <li>Nafile namaz kılın</li>
                  <li>Kuran-ı Kerim okuyun</li>
                  <li>Zikir ve tesbihat yapın</li>
                  <li>Dua edin</li>
                  <li>Sadaka verin</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpecialDaysCalendar;


