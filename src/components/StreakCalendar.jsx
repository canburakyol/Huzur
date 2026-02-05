import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { tr } from 'date-fns/locale';
import { Flame, Snowflake, ShieldCheck } from 'lucide-react';
import './StreakCalendar.css';

const StreakCalendar = ({ categoryData, categoryName = 'Genel' }) => {
  const history = categoryData?.history || [];
  const today = new Date();
  
  // Get days for current month
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getDayStatus = (day) => {
    const record = history.find(h => isSameDay(new Date(h.date), day));
    if (record) return record.type; // 'activity', 'frozen'
    
    if (day > today) return 'future';
    if (isToday(day)) return 'pending';
    
    return 'missed';
  };

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div className="streak-calendar-card glass-card">
      <div className="calendar-header">
        <div className="flex items-center gap-2">
          <Flame className="text-orange-500" size={20} />
          <h3>{categoryName} Serisi</h3>
        </div>
        <div className="streak-stats">
          <div className="stat-item">
            <span className="stat-value">{categoryData?.count || 0}</span>
            <span className="stat-label">Gün</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-blue-400">
              <Snowflake size={14} className="inline mr-1" />
              {categoryData?.freezeTokens || 0}
            </span>
            <span className="stat-label">Dondurma</span>
          </div>
        </div>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="weekday-label">{day}</div>
        ))}
        {calendarDays.map((day, i) => {
          const status = getDayStatus(day);
          const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
          
          return (
            <div 
              key={i} 
              className={`calendar-day ${status} ${!isCurrentMonth ? 'other-month' : ''}`}
              title={format(day, 'd MMMM yyyy', { locale: tr })}
            >
              <span className="day-number">{format(day, 'd')}</span>
              {status === 'activity' && <div className="status-dot activity" />}
              {status === 'frozen' && <Snowflake size={10} className="status-icon frozen" />}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend mt-4">
        <div className="legend-item">
          <div className="legend-dot activity" /> <span>Tamamlandı</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot frozen" /> <span>Donduruldu</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot missed" /> <span>Eksik</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
