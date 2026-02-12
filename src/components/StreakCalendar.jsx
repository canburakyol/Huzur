import React from 'react';
import { useTranslation } from 'react-i18next';
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

const StreakCalendar = ({ categoryData, categoryName = 'General' }) => {
  const { t, i18n } = useTranslation();
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

  const localeMap = {
    tr: tr,
  };
  const resolvedLocale = localeMap[i18n.language?.split('-')?.[0]];

  const weekDays = [
    t('streakCalendar.weekdays.mon', 'Mon'),
    t('streakCalendar.weekdays.tue', 'Tue'),
    t('streakCalendar.weekdays.wed', 'Wed'),
    t('streakCalendar.weekdays.thu', 'Thu'),
    t('streakCalendar.weekdays.fri', 'Fri'),
    t('streakCalendar.weekdays.sat', 'Sat'),
    t('streakCalendar.weekdays.sun', 'Sun')
  ];

  return (
    <div className="streak-calendar-card glass-card">
      <div className="calendar-header">
        <div className="flex items-center gap-2">
          <Flame className="text-orange-500" size={20} />
          <h3>{t('streakCalendar.seriesTitle', '{{category}} Streak', { category: categoryName })}</h3>
        </div>
        <div className="streak-stats">
          <div className="stat-item">
            <span className="stat-value">{categoryData?.count || 0}</span>
            <span className="stat-label">{t('streakCalendar.days', 'Days')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value text-blue-400">
              <Snowflake size={14} className="inline mr-1" />
              {categoryData?.freezeTokens || 0}
            </span>
            <span className="stat-label">{t('streakCalendar.freeze', 'Freeze')}</span>
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
              title={resolvedLocale ? format(day, 'd MMMM yyyy', { locale: resolvedLocale }) : format(day, 'd MMMM yyyy')}
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
          <div className="legend-dot activity" /> <span>{t('streakCalendar.legend.completed', 'Completed')}</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot frozen" /> <span>{t('streakCalendar.legend.frozen', 'Frozen')}</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot missed" /> <span>{t('streakCalendar.legend.missed', 'Missed')}</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
