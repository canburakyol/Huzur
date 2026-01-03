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

/**
 * HomeHeader Component
 * Displays location, weather and user streak
 */
const HomeHeader = ({ locationName, weather, streakData }) => {
  const { t } = useTranslation();

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '20px', padding: '0 5px', marginTop: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-color)' }}>
        <MapPin size={20} color="var(--primary-color)" />
        <span style={{ fontWeight: '600', fontSize: '16px' }}>{locationName}</span>
      </div>
      
      {streakData.current > 0 && (
        <div className={`streak-badge ${streakData.isMilestone ? 'milestone' : ''}`}>
          <span className="streak-emoji">{streakData.emoji}</span>
          <span className="streak-count">{streakData.current}</span>
          <span>{t('common.day')}</span>
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-color)', marginRight: '40px' }}>
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
  );
};

export default HomeHeader;
