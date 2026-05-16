import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Compass,
  Sparkles,
  Target,
  Users
} from 'lucide-react';
import { getStoredPrimaryGoal } from '../../../utils/primaryGoal';

const GOAL_SHORTCUTS = {
  prayer_rhythm: {
    id: 'dailyTasks',
    icon: <Target size={18} className="crisp-icon" />,
    labelKey: 'menu.dailyTasks',
    fallbackLabel: 'Gunluk Gorev'
  },
  quran_learning: {
    id: 'quran',
    icon: <BookOpen size={18} className="crisp-icon" />,
    labelKey: 'features.quran',
    fallbackLabel: 'Kuran'
  },
  family_consistency: {
    id: 'assistant',
    icon: <Sparkles size={18} className="crisp-icon" />,
    labelKey: 'features.assistant',
    fallbackLabel: 'Rehber'
  }
};

const BASE_SHORTCUTS = [
  {
    id: 'zikirmatik',
    icon: <Sparkles size={18} className="crisp-icon" />,
    labelKey: 'features.dhikr',
    fallbackLabel: 'Zikirmatik'
  },
  {
    id: 'family',
    icon: <Users size={18} className="crisp-icon" />,
    labelKey: 'family.title',
    fallbackLabel: 'Huzur Aile'
  },
  {
    id: 'qibla',
    icon: <Compass size={18} className="crisp-icon" />,
    labelKey: 'features.qibla',
    fallbackLabel: 'Kible'
  }
];

const HomeQuickAccessStrip = memo(({ onSelectFeature }) => {
  const { t } = useTranslation();
  const primaryGoal = getStoredPrimaryGoal();

  const shortcuts = useMemo(() => {
    const goalShortcut = GOAL_SHORTCUTS[primaryGoal] || GOAL_SHORTCUTS.prayer_rhythm;
    return [...BASE_SHORTCUTS, goalShortcut];
  }, [primaryGoal]);

  const handleKeyDown = (featureId) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectFeature(featureId, 'home_quick_access');
    }
  };

  return (
    <>
      <div className="home-quick-access-strip" role="group" aria-label={t('features.quickAccess', 'Hizli erisim')}>
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.id}
            type="button"
            className="home-quick-access-item"
            onClick={() => onSelectFeature(shortcut.id, 'home_quick_access')}
            onKeyDown={handleKeyDown(shortcut.id)}
            aria-label={t(shortcut.labelKey, shortcut.fallbackLabel)}
          >
            <span className="home-quick-access-icon">{shortcut.icon}</span>
            <span className="home-quick-access-label">{t(shortcut.labelKey, shortcut.fallbackLabel)}</span>
          </button>
        ))}
      </div>

      <style>{`
        .home-quick-access-strip {
          position: relative;
          z-index: 14;
          margin: 18px 5px 16px;
          padding: 10px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          border-radius: 24px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
            linear-gradient(145deg, rgba(4, 47, 46, 0.95), rgba(6, 78, 59, 0.82));
          border: 1px solid rgba(245, 158, 11, 0.16);
          box-shadow: 0 18px 36px rgba(0, 0, 0, 0.24);
          backdrop-filter: blur(16px) saturate(1.1);
          -webkit-backdrop-filter: blur(16px) saturate(1.1);
        }

        .home-quick-access-strip::before {
          content: '';
          position: absolute;
          inset: 0 0 auto 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          opacity: 0.7;
          pointer-events: none;
        }

        .home-quick-access-item {
          appearance: none;
          border: none;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.035);
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 74px;
          padding: 10px 6px;
          transition: transform 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
        }

        .home-quick-access-item:hover,
        .home-quick-access-item:focus-visible {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.075);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
          outline: none;
        }

        .home-quick-access-item:active {
          transform: scale(0.97);
          background: rgba(255, 255, 255, 0.1);
        }

        .home-quick-access-icon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, rgba(245, 158, 11, 0.2), rgba(15, 118, 110, 0.18));
          color: var(--text-gold);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .home-quick-access-label {
          font-size: 0.64rem;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: 0.01em;
          text-align: center;
          color: rgba(248, 250, 252, 0.94);
          text-wrap: balance;
        }

        @media (max-width: 420px) {
          .home-quick-access-strip {
            margin-top: 16px;
            padding: 9px;
            gap: 7px;
          }

          .home-quick-access-item {
            min-height: 70px;
            padding-inline: 4px;
          }

          .home-quick-access-icon {
            width: 32px;
            height: 32px;
          }

          .home-quick-access-label {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </>
  );
});

HomeQuickAccessStrip.displayName = 'HomeQuickAccessStrip';

export default HomeQuickAccessStrip;
