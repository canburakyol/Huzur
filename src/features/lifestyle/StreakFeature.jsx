import React, { useState, useEffect } from 'react';
import StreakCalendar from '../../components/StreakCalendar';
import { getStreakData } from '../../services/streakService';
import { ChevronLeft } from 'lucide-react';

const StreakFeature = ({ onClose }) => {
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
        <h2 className="text-xl font-bold">Seri Takvimi</h2>
      </div>
      
      <div className="p-4 space-y-6">
        {/* App Streak */}
        <StreakCalendar 
          categoryData={{ 
            count: streakData.currentStreak, 
            history: streakData.appHistory || [], // We might need to map this
            freezeTokens: 0 // Overall app streak doesn't use tokens for now
          }} 
          categoryName="Uygulama" 
        />

        {/* Prayer Streak */}
        <StreakCalendar 
          categoryData={streakData.streaks?.prayer} 
          categoryName="Namaz" 
        />

        <div className="tips-card glass-card p-4">
          <h4 className="font-bold mb-2">💡 İpucu</h4>
          <p className="text-sm">7 gün boyunca her gün ibadetlerinizi kaydederek 1 adet "Dondurma Hakkı" kazanabilirsiniz!</p>
        </div>
      </div>
    </div>
  );
};

export default StreakFeature;
