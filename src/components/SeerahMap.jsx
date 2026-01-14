import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, MapPin, Calendar, BookOpen } from 'lucide-react';
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
    <div className="app-container" style={{ minHeight: '100vh', padding: '20px', background: 'var(--bg-color)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <IslamicBackButton onClick={onClose} />
        <h2 style={{ margin: 0, fontSize: '22px', color: 'var(--primary-color)' }}>
          🗺️ {t('seerah.title')}
        </h2>
      </div>

      {/* Dönem Filtreleri */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '5px' }}>
        <button
          onClick={() => setSelectedPeriod(null)}
          style={{
            padding: '8px 14px',
            borderRadius: '20px',
            border: 'none',
            background: !selectedPeriod ? 'var(--primary-color)' : 'var(--glass-bg)',
            color: !selectedPeriod ? 'white' : 'var(--text-color)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {t('seerah.allPeriods')}
        </button>
        {SEERAH_PERIODS.map(period => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: 'none',
              background: selectedPeriod === period.id ? period.color : 'var(--glass-bg)',
              color: selectedPeriod === period.id ? 'white' : 'var(--text-color)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {period.name}
          </button>
        ))}
      </div>

      {/* Zaman Çizelgesi */}
      <div style={{ position: 'relative', paddingLeft: '30px' }}>
        {/* Dikey Çizgi */}
        <div style={{
          position: 'absolute',
          left: '10px',
          top: '10px',
          bottom: '10px',
          width: '2px',
          background: 'linear-gradient(to bottom, #f39c12, #e74c3c, #9b59b6, #2ecc71)'
        }} />

        {filteredEvents.map((event) => {
          const period = SEERAH_PERIODS.find(p => p.id === event.period);
          return (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
              style={{
                position: 'relative',
                marginBottom: '15px',
                cursor: 'pointer'
              }}
            >
              {/* Nokta */}
              <div style={{
                position: 'absolute',
                left: '-25px',
                top: '15px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: period?.color,
                border: '3px solid var(--bg-color)',
                boxShadow: `0 0 0 2px ${period?.color}`
              }} />

              {/* Kart */}
              <div className="glass-card" style={{
                padding: '15px',
                borderLeft: `3px solid ${period?.color}`,
                transition: 'all 0.3s ease',
                background: selectedEvent?.id === event.id ? `${period?.color}15` : 'var(--glass-bg)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{event.icon}</span>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-color)' }}>
                        {event.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-color-muted)', marginTop: '3px', display: 'flex', gap: '10px' }}>
                        <span><Calendar size={12} style={{ marginRight: '3px' }} />{event.year}</span>
                        <span><MapPin size={12} style={{ marginRight: '3px' }} />{event.location}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight 
                    size={18} 
                    color="var(--text-color-muted)"
                    style={{ 
                      transition: 'transform 0.3s ease',
                      transform: selectedEvent?.id === event.id ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}
                  />
                </div>

                {/* Detay */}
                {selectedEvent?.id === event.id && (
                  <div style={{ marginTop: '12px', animation: 'fadeIn 0.3s ease' }}>
                    <div style={{
                      padding: '12px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <BookOpen size={14} color={period?.color} />
                        <span style={{ fontSize: '11px', color: period?.color, fontWeight: '600' }}>{t('seerah.details')}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-color)', lineHeight: 1.6, margin: 0 }}>
                        {event.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeerahMap;
