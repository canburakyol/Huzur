import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, MapPin, Calendar, BookOpen, Map, Info, Sparkles } from 'lucide-react';
import IslamicBackButton from './shared/IslamicBackButton';
import { SEERAH_PERIODS, SEERAH_EVENTS } from '../data/seerahData';

/**
 * İnteraktif Siyer Haritası Bileşeni
 * Peygamberimizin hayatını kronolojik olarak sunar
 */
const SeerahMap = ({ onClose }) => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredEvents = selectedPeriod 
    ? SEERAH_EVENTS.filter(e => e.period === selectedPeriod)
    : SEERAH_EVENTS;

  return (
    <div className="settings-container reveal-stagger" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <IslamicBackButton onClick={onClose} size="medium" />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--nav-text)', fontWeight: '950', letterSpacing: '-0.5px' }}>
            {t('seerah.title', 'Siyer Haritası')}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
            {t('seerah.subtitle', 'Peygamberimizin (sav) hayat yolculuğu')}
          </p>
        </div>
      </div>

      {/* Dönem Filtreleri */}
      <div className="period-filter-container">
        <button
          onClick={() => setSelectedPeriod(null)}
          className={`period-chip ${!selectedPeriod ? 'active' : ''}`}
          style={{ '--period-color': 'var(--nav-accent)' }}
        >
          {t('seerah.allPeriods', 'Tümü')}
        </button>
        {SEERAH_PERIODS.map(period => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id)}
            className={`period-chip ${selectedPeriod === period.id ? 'active' : ''}`}
            style={{ '--period-color': period.color }}
          >
            {period.name}
          </button>
        ))}
      </div>

      {/* Zaman Çizelgesi */}
      <div className="timeline-wrapper">
        <div className="timeline-line" />

        {filteredEvents.map((event, index) => {
          const period = SEERAH_PERIODS.find(p => p.id === event.period);
          const isSelected = selectedEvent?.id === event.id;
          
          return (
            <div
              key={event.id}
              className={`timeline-entry ${isSelected ? 'is-selected' : ''}`}
              style={{ '--delay': `${index * 0.1}s`, '--entry-color': period?.color }}
            >
              {/* Haritalama Noktası */}
              <div className="timeline-node">
                  <div className="node-inner" />
              </div>

              {/* Etkinlik Kartı */}
              <div 
                className="settings-card timeline-card" 
                onClick={() => setSelectedEvent(isSelected ? null : event)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="event-icon-box">
                      {event.icon}
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: 'var(--nav-text)' }}>
                            {event.title}
                        </h4>
                        <div className="event-meta">
                            <span><Calendar size={12} /> {event.year}</span>
                            <span><MapPin size={12} /> {event.location}</span>
                        </div>
                    </div>
                  </div>
                  <div className={`chevron-box ${isSelected ? 'active' : ''}`}>
                    <ChevronRight size={18} />
                  </div>
                </div>

                {/* Detay Paneli */}
                <div className={`event-details ${isSelected ? 'expanded' : ''}`}>
                    <div className="details-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <BookOpen size={14} color="var(--nav-accent)" />
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--nav-accent)', textTransform: 'uppercase' }}>
                                {t('seerah.details', 'Ayrıntılar')}
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--nav-text)', fontWeight: '600', lineHeight: '1.6' }}>
                            {event.description}
                        </p>
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .period-filter-container {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding: 8px 4px 20px 4px;
            margin: 0 -20px 12px -20px;
            padding-left: 20px;
            scrollbar-width: none;
        }

        .period-filter-container::-webkit-scrollbar { display: none; }

        .period-chip {
            padding: 10px 18px;
            border-radius: 12px;
            border: 1px solid var(--nav-border);
            background: var(--nav-hover);
            color: var(--nav-text-muted);
            font-size: 0.75rem;
            font-weight: 800;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .period-chip.active {
            background: var(--period-color);
            border-color: var(--period-color);
            color: white;
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
            transform: translateY(-2px);
        }

        .timeline-wrapper {
            position: relative;
            padding-left: 36px;
            margin-top: 10px;
        }

        .timeline-line {
            position: absolute;
            left: 10px;
            top: 20px;
            bottom: 20px;
            width: 2px;
            background: linear-gradient(to bottom, 
                var(--nav-accent), 
                #10b981, 
                #f59e0b, 
                #ef4444, 
                var(--nav-accent)
            );
            opacity: 0.3;
            border-radius: 1px;
        }

        .timeline-entry {
            position: relative;
            margin-bottom: 20px;
            animation: reveal 0.5s ease backwards;
            animation-delay: var(--delay);
        }

        @keyframes reveal {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }

        .timeline-node {
            position: absolute;
            left: -32px;
            top: 24px;
            width: 14px;
            height: 14px;
            background: var(--nav-bg);
            border: 2.5px solid var(--entry-color);
            border-radius: 50%;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        }

        .timeline-entry.is-selected .timeline-node {
            transform: scale(1.4);
            box-shadow: 0 0 15px var(--entry-color);
        }

        .node-inner {
            width: 4px;
            height: 4px;
            background: var(--entry-color);
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.3s;
        }

        .timeline-entry.is-selected .node-inner { opacity: 1; }

        .timeline-card {
            flex-direction: column;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid var(--nav-border);
        }

        .timeline-entry.is-selected .timeline-card {
            border-color: var(--entry-color);
            background: var(--nav-hover);
        }

        .event-icon-box {
            font-size: 1.5rem;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--nav-bg);
            border-radius: 12px;
            border: 1px solid var(--nav-border);
        }

        .event-meta {
            display: flex;
            gap: 12px;
            margin-top: 6px;
            font-size: 0.75rem;
            color: var(--nav-text-muted);
            font-weight: 700;
        }

        .event-meta span { display: flex; align-items: center; gap: 4px; }

        .chevron-box {
            color: var(--nav-text-muted);
            transition: all 0.3s;
        }

        .chevron-box.active {
            transform: rotate(90deg);
            color: var(--nav-accent);
        }

        .event-details {
            max-height: 0;
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 0;
        }

        .event-details.expanded {
            max-height: 500px;
            opacity: 1;
            margin-top: 16px;
        }

        .details-content {
            padding: 16px;
            background: var(--nav-bg);
            border-radius: 14px;
            border: 1px solid var(--nav-border);
        }
      `}</style>
    </div>
  );
};

export default SeerahMap;
