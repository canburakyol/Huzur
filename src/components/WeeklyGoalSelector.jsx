import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Sparkles, Trophy, CalendarCheck } from 'lucide-react';
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
    <div className="settings-card reveal-stagger" style={{ flexDirection: 'column', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div className="settings-icon-box" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--nav-accent)' }}>
            <Target size={20} />
        </div>
        <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '950', color: 'var(--nav-text)' }}>
                {t('weeklyGoal.title', 'Haftalık Hedef')}
            </h4>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} />
                <span>DAHA FAZLA PUAN KAZAN</span>
            </div>
        </div>
      </div>

      <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600', lineHeight: '1.5' }}>
        {t('weeklyGoal.description', 'Haftada kaç gün ibadet takibi yapmak istersiniz?')}
      </p>

      <div className="goal-options-grid">
        {WEEKLY_OPTIONS.map((goal, index) => {
          const active = selectedGoal === goal;
          return (
            <button
              key={goal}
              onClick={() => handleSelect(goal)}
              className={`goal-chip ${active ? 'active' : ''}`}
              style={{ '--delay': `${index * 0.1}s` }}
            >
              <div className="chip-content">
                  <div className="chip-value">{goal}</div>
                  <div className="chip-label">{t('weeklyGoal.daysLabelShort', 'GÜN')}</div>
              </div>
              {active && <div className="active-indicator"><CalendarCheck size={14} /></div>}
            </button>
          );
        })}
      </div>

      <style>{`
        .goal-options-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            width: 100%;
        }

        .goal-chip {
            position: relative;
            padding: 16px 12px;
            background: var(--nav-hover);
            border: 1px solid var(--nav-border);
            border-radius: 16px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: reveal 0.5s ease backwards;
            animation-delay: var(--delay);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        @keyframes reveal {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        .goal-chip:hover:not(.active) {
            border-color: var(--nav-accent);
            background: rgba(79, 70, 229, 0.05);
        }

        .goal-chip.active {
            background: var(--nav-accent);
            border-color: var(--nav-accent);
            box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
            transform: translateY(-4px);
        }

        .chip-content {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .chip-value {
            font-size: 1.5rem;
            font-weight: 950;
            color: var(--nav-text);
            transition: color 0.3s;
        }

        .goal-chip.active .chip-value { color: white; }

        .chip-label {
            font-size: 0.65rem;
            font-weight: 800;
            color: var(--nav-text-muted);
            letter-spacing: 1px;
            transition: color 0.3s;
        }

        .goal-chip.active .chip-label { color: rgba(255, 255, 255, 0.8); }

        .active-indicator {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 24px;
            height: 24px;
            background: #10b981;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid var(--nav-bg);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default WeeklyGoalSelector;
