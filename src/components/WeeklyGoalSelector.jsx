import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Target } from 'lucide-react';
import {
  getWeeklyGoalPreference,
  setWeeklyGoalPreference
} from '../services/streakService';

const WEEKLY_OPTIONS = [3, 5, 7];

const WeeklyGoalSelector = () => {
  const { t } = useTranslation();
  const initialGoal = useMemo(() => getWeeklyGoalPreference(), []);
  const [selectedGoal, setSelectedGoal] = useState(initialGoal);

  const handleSelect = (goal) => {
    const updated = setWeeklyGoalPreference(goal, 'weekly_goal_selector');
    setSelectedGoal(updated);
  };

  return (
    <div className="glass-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Target size={18} />
        <h4 style={{ margin: 0 }}>{t('weeklyGoal.title', 'Weekly Goal')}</h4>
      </div>
      <p style={{ margin: '0 0 12px', opacity: 0.8, fontSize: 13 }}>
        {t('weeklyGoal.description', 'How many days per week do you want to track your worship?')}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {WEEKLY_OPTIONS.map((goal) => {
          const active = selectedGoal === goal;
          return (
            <button
              key={goal}
              onClick={() => handleSelect(goal)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 10,
                border: active ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.2)',
                background: active ? '#d4af37' : 'rgba(255,255,255,0.08)',
                color: active ? '#14352a' : '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {t('weeklyGoal.daysValue', '{{count}} days', { count: goal })}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyGoalSelector;
