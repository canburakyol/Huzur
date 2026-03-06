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
import { tr, enUS } from 'date-fns/locale';
import { Flame, Snowflake, ShieldCheck, Calendar as CalendarIcon } from 'lucide-react';

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
    en: enUS
  };
  const resolvedLocale = localeMap[i18n.language?.split('-')?.[0]] || enUS;

  const weekDays = [
    t('streakCalendar.weekdays.mon', 'Pzt'),
    t('streakCalendar.weekdays.tue', 'Sal'),
    t('streakCalendar.weekdays.wed', 'Çar'),
    t('streakCalendar.weekdays.thu', 'Per'),
    t('streakCalendar.weekdays.fri', 'Cum'),
    t('streakCalendar.weekdays.sat', 'Cmt'),
    t('streakCalendar.weekdays.sun', 'Paz')
  ];

  return (
    <div className="reveal-stagger">
      <div className="settings-card" style={{ flexDirection: 'column', padding: '24px', position: 'relative' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="settings-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--primary-color)' }}>
                    <Flame size={20} />
                </div>
                <div>
                   <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: 'var(--nav-text)' }}>
                      {t('streakCalendar.seriesTitle', '{{category}} Serisi', { category: categoryName })}
                   </h3>
                   <div style={{ fontSize: '0.75rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                      {format(today, 'MMMM yyyy', { locale: resolvedLocale })}
                   </div>
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
                <div className="stat-badge">
                    <span className="stat-label">{t('streakCalendar.days', 'Gün')}</span>
                    <span className="stat-value">{categoryData?.count || 0}</span>
                </div>
                <div className="stat-badge" style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    < Snowflake size={12} color="var(--accent-color)" />
                    <span className="stat-value" style={{ color: 'var(--accent-color)' }}>{categoryData?.freezeTokens || 0}</span>
                </div>
            </div>
          </div>

          {/* Grid */}
          <div className="calendar-grid">
            {weekDays.map(day => (
              <div key={day} className="weekday-label">{day}</div>
            ))}
            {calendarDays.map((day, i) => {
              const status = getDayStatus(day);
              const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
              const isTodayDay = isToday(day);
              
              return (
                <div 
                  key={i}
                  className={`calendar-day ${status} ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDay ? 'is-today' : ''}`}
                  title={format(day, 'd MMMM yyyy', { locale: resolvedLocale })}
                  style={{ '--delay': `${(i % 7) * 0.05 + Math.floor(i / 7) * 0.05}s` }}
                >
                  <span className="day-number">{format(day, 'd')}</span>
                  {status === 'activity' && <div className="status-dot activity" />}
                  {status === 'frozen' && <Snowflake size={10} className="status-icon frozen" />}
                  {isTodayDay && <div className="today-indicator" />}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ 
              marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px', 
              paddingTop: '16px', borderTop: '1px solid var(--nav-border)', width: '100%' 
          }}>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--bg-emerald-light)' }} />
              <span>{t('streakCalendar.legend.completed', 'Tamamlandı')}</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--accent-color)' }} />
              <span>{t('streakCalendar.legend.frozen', 'Donduruldu')}</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--nav-border)' }} />
              <span>{t('streakCalendar.legend.missed', 'Kaçırıldı')}</span>
            </div>
          </div>
      </div>

      <style>{`
        .stat-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background: var(--nav-hover);
            border: 1px solid var(--nav-border);
            border-radius: 12px;
        }

        .stat-label {
            font-size: 0.65rem;
            font-weight: 800;
            color: var(--nav-text-muted);
            text-transform: uppercase;
        }

        .stat-value {
            font-size: 0.95rem;
            font-weight: 950;
            color: var(--nav-accent);
        }

        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 6px;
            width: 100%;
        }

        .weekday-label {
            font-size: 0.65rem;
            font-weight: 900;
            color: var(--nav-text-muted);
            text-align: center;
            padding: 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .calendar-day {
            aspect-ratio: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--nav-hover);
            border: 1px solid transparent;
            border-radius: 10px;
            position: relative;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--nav-text-muted);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: reveal 0.5s ease backwards;
            animation-delay: var(--delay);
        }

        @keyframes reveal {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }

        .calendar-day.is-today {
            border-color: var(--nav-accent);
            color: var(--nav-text);
        }

        .today-indicator {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 4px;
            height: 4px;
            background: var(--nav-accent);
            border-radius: 50%;
        }

        .calendar-day.other-month {
            opacity: 0.15;
            filter: blur(0.5px);
        }

        .calendar-day.activity {
            background: rgba(15, 118, 110, 0.15);
            border: 1px solid rgba(15, 118, 110, 0.3);
            color: var(--bg-emerald-light);
        }

        .calendar-day.frozen {
            background: rgba(59, 130, 246, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: var(--accent-color);
        }

        .calendar-day.missed {
            background: rgba(255, 255, 255, 0.02);
            color: var(--nav-text-muted);
            opacity: 0.4;
        }

        .calendar-day.future {
            opacity: 0.1;
            pointer-events: none;
        }

        .status-dot.activity {
            position: absolute;
            bottom: 6px;
            width: 4px;
            height: 4px;
            background: var(--bg-emerald-light);
            border-radius: 50%;
            box-shadow: 0 0 8px rgba(15, 118, 110, 0.5);
        }

        .status-icon.frozen {
            position: absolute;
            bottom: 4px;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--nav-text-muted);
        }

        .legend-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default StreakCalendar;
