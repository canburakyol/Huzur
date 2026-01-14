import { MapPin, Sun, Cloud, CloudRain, CloudSnow } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Weather Icon Helper
const getWeatherIcon = (code) => {
  if (code === undefined) return <Sun size={20} />;
  if (code <= 3) return <Sun size={20} />;
  if (code <= 48) return <Cloud size={20} />;
  if (code <= 67) return <CloudRain size={20} />;
  if (code <= 77) return <CloudSnow size={20} />;
  return <CloudRain size={20} />;
};

import { useTime } from '../context/TimeContext';

/**
 * HomeHeader Component
 * Displays location, weather, user streak and dynamic greeting
 */
const HomeHeader = ({ locationName, weather, streakData }) => {
    const { t } = useTranslation();
    const { greetingKey, timeOfDay } = useTime();

  // Dynamic background gradients based on time of day
  const getGradient = () => {
    switch(timeOfDay) {
      case 'morning': return 'linear-gradient(135deg, rgba(255, 223, 186, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)';
      case 'noon': return 'linear-gradient(135deg, rgba(255, 247, 0, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%)';
      case 'afternoon': return 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%)';
      case 'evening': return 'linear-gradient(135deg, rgba(100, 50, 200, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%)';
      case 'night': return 'linear-gradient(135deg, rgba(20, 30, 48, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)';
      default: return 'none';
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '10px',
      marginBottom: '20px', padding: '15px', marginTop: '10px',
      background: getGradient(),
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-color)' }}>
          <MapPin size={20} color="var(--primary-color)" />
          <span style={{ fontWeight: '600', fontSize: '16px' }}>{locationName}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-color)' }}>
          {weather ? (
            <>
              {getWeatherIcon(weather.weathercode)}
              <span style={{ fontWeight: '600', fontSize: '16px' }}>{Math.round(weather.temperature)}°C</span>
            </>
          ) : (
            <span style={{ fontSize: '14px', color: 'var(--text-color-muted)' }}>...</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-color)', fontWeight: 'bold' }}>
          {t(greetingKey)}
        </h2>

        {streakData.current > 0 && (
          <div className={`streak-badge ${streakData.isMilestone ? 'milestone' : ''}`} style={{ margin: 0 }}>
            <span className="streak-emoji">{streakData.emoji}</span>
            <span className="streak-count">{streakData.current}</span>
            <span>{t('common.day')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeHeader;
