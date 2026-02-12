import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import StreakCalendar from '../../components/StreakCalendar';
import { getStreakData } from '../../services/streakService';
import { ChevronLeft } from 'lucide-react';
import WeeklyGoalSelector from '../../components/WeeklyGoalSelector';

const StreakFeature = ({ onClose }) => {
  const { t } = useTranslation();
  const [streakData, setStreakData] = useState(null);

  useEffect(() => {
    const loadData = () => {
      setStreakData(getStreakData());
    };
    loadData();
  }, []);

  if (!streakData) return null;

  return (
    <div className="feature-container">
      <div className="feature-header flex items-center p-4">
        <button onClick={onClose} className="p-2 mr-2">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">{t('streakFeature.title', 'Streak Calendar')}</h2>
      </div>
      
      <div className="p-4 space-y-6">
        {/* App Streak */}
        <StreakCalendar 
          categoryData={{ 
            count: streakData.currentStreak, 
            history: streakData.appHistory || [], // We might need to map this
            freezeTokens: 0 // Overall app streak doesn't use tokens for now
          }} 
          categoryName={t('streakFeature.appCategory', 'App')} 
        />

        {/* Prayer Streak */}
        <StreakCalendar 
          categoryData={streakData.streaks?.prayer} 
          categoryName={t('streakFeature.prayerCategory', 'Prayer')} 
        />

        <WeeklyGoalSelector />

        <div className="tips-card glass-card p-4">
          <h4 className="font-bold mb-2">💡 {t('streakFeature.tipTitle', 'Tip')}</h4>
          <p className="text-sm">{t('streakFeature.tipText', 'You can earn 1 Freeze Token by tracking your worship daily for 7 days!')}</p>
        </div>
      </div>
    </div>
  );
};

export default StreakFeature;
