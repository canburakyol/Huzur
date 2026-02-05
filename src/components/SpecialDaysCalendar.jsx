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

// Özel günler veritabanı (2025-2026)
const SPECIAL_DAYS = [
  // 2025
  { id: 'regaib-2025', name: 'Regaib Gecesi', date: '2025-01-02', type: 'kandil', icon: '✨', color: '#8b5cf6', description: 'Üç ayların başlangıcı ve Regaib Gecesi' },
  { id: 'mevlid-2025', name: 'Mevlid Kandili', date: '2025-01-26', type: 'kandil', icon: '🌙', color: '#3b82f6', description: 'Peygamber Efendimiz\'in (s.a.v) doğum gecesi' },
  { id: 'berat-2025', name: 'Berat Kandili', date: '2025-02-13', type: 'kandil', icon: '⭐', color: '#22c55e', description: 'Aff ve mağfiret gecesi' },
  { id: 'ramazan-2025', name: 'Ramazan Başlangıcı', date: '2025-03-01', type: 'ramazan', icon: '🌙', color: '#f59e0b', description: 'Oruç ayının başlangıcı' },
  { id: 'kadir-2025', name: 'Kadir Gecesi', date: '2025-03-26', type: 'kandil', icon: '👑', color: '#d4af37', description: 'Bin aydan hayırlı gece' },
  { id: 'bayram-2025', name: 'Ramazan Bayramı', date: '2025-03-30', type: 'bayram', icon: '🎉', color: '#22c55e', description: 'Ramazan Bayramı 1. gün' },
  { id: 'arefe-2025', name: 'Arefe Günü', date: '2025-06-05', type: 'hac', icon: '🕋', color: '#ec4899', description: 'Hacı adaylarının Arafat\'ta toplandığı gün' },
  { id: 'kurban-2025', name: 'Kurban Bayramı', date: '2025-06-06', type: 'bayram', icon: '🐑', color: '#f97316', description: 'Kurban Bayramı 1. gün' },
  { id: 'hicri-2025', name: 'Hicri Yılbaşı', date: '2025-07-06', type: 'hicri', icon: '📅', color: '#14b8a6', description: 'Muharrem ayının başlangıcı' },
  { id: 'asure-2025', name: 'Aşure Günü', date: '2025-07-15', type: 'hicri', icon: '🥣', color: '#8b5cf6', description: 'Muharrem\'in 10. günü' },
  
  // 2026
  { id: 'regaib-2026', name: 'Regaib Gecesi', date: '2026-12-22', type: 'kandil', icon: '✨', color: '#8b5cf6', description: 'Üç ayların başlangıcı' },
  { id: 'mevlid-2026', name: 'Mevlid Kandili', date: '2026-01-15', type: 'kandil', icon: '🌙', color: '#3b82f6', description: 'Peygamber Efendimiz\'in (s.a.v) doğum gecesi' },
  { id: 'berat-2026', name: 'Berat Kandili', date: '2026-02-03', type: 'kandil', icon: '⭐', color: '#22c55e', description: 'Aff ve mağfiret gecesi' },
  { id: 'ramazan-2026', name: 'Ramazan Başlangıcı', date: '2026-02-18', type: 'ramazan', icon: '🌙', color: '#f59e0b', description: 'Oruç ayının başlangıcı' },
  { id: 'kadir-2026', name: 'Kadir Gecesi', date: '2026-03-15', type: 'kandil', icon: '👑', color: '#d4af37', description: 'Bin aydan hayırlı gece' },
  { id: 'bayram-2026', name: 'Ramazan Bayramı', date: '2026-03-19', type: 'bayram', icon: '🎉', color: '#22c55e', description: 'Ramazan Bayramı 1. gün' },
  { id: 'arefe-2026', name: 'Arefe Günü', date: '2026-05-26', type: 'hac', icon: '🕋', color: '#ec4899', description: 'Hacı adaylarının Arafat\'ta toplandığı gün' },
  { id: 'kurban-2026', name: 'Kurban Bayramı', date: '2026-05-27', type: 'bayram', icon: '🐑', color: '#f97316', description: 'Kurban Bayramı 1. gün' },
  { id: 'hicri-2026', name: 'Hicri Yılbaşı', date: '2026-06-26', type: 'hicri', icon: '📅', color: '#14b8a6', description: 'Muharrem ayının başlangıcı' },
  { id: 'asure-2026', name: 'Aşure Günü', date: '2026-07-05', type: 'hicri', icon: '🥣', color: '#8b5cf6', description: 'Muharrem\'in 10. günü' },
];

// Kategori renkleri
const CATEGORY_COLORS = {
  kandil: { bg: 'rgba(139, 92, 246, 0.2)', border: '#8b5cf6', icon: '✨' },
  ramazan: { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', icon: '🌙' },
  bayram: { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', icon: '🎉' },
  hac: { bg: 'rgba(236, 72, 153, 0.2)', border: '#ec4899', icon: '🕋' },
  hicri: { bg: 'rgba(20, 184, 166, 0.2)', border: '#14b8a6', icon: '📅' }
};

// Storage key
const STORAGE_KEY = 'huzur_special_days_notifications';

export function SpecialDaysCalendar({ onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Load notification preferences from localStorage with initial state
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // Save notification preferences
  const toggleNotification = (dayId) => {
    const newNotifications = {
      ...notifications,
      [dayId]: !notifications[dayId]
    };
    setNotifications(newNotifications);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
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
    const today = new Date().toISOString().split('T')[0];
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
                  background: CATEGORY_COLORS[day.type]?.bg || 'rgba(212, 175, 55, 0.1)',
                  borderColor: CATEGORY_COLORS[day.type]?.border || '#d4af37'
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
            <span className="legend-dot" style={{ background: '#8b5cf6' }}></span>
            <span>Kandil Geceleri</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
            <span>Ramazan</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#22c55e' }}></span>
            <span>Bayramlar</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ec4899' }}></span>
            <span>Hac</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#14b8a6' }}></span>
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
                  <li>🤲 Nafile namaz kılın</li>
                  <li>📖 Kuran-ı Kerim okuyun</li>
                  <li>📿 Zikir ve tesbihat yapın</li>
                  <li>🙏 Dua edin</li>
                  <li>💝 Sadaka verin</li>
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