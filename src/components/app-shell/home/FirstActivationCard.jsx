import { useEffect, useRef } from 'react';
import { ArrowRight, BookOpen, Sparkles, Target, Users } from 'lucide-react';
import { ANALYTICS_EVENTS, logEvent } from '../../../services/analyticsService';
import { getPrimaryGoalConfig, getStoredPrimaryGoal } from '../../../utils/primaryGoal';

const activationCopy = {
  prayer_rhythm: {
    eyebrow: 'Ilk adim',
    icon: <Target size={22} />,
    time: '2 dakika',
    promise: 'Bugunu bos gecirme.',
  },
  quran_learning: {
    eyebrow: 'Ilk adim',
    icon: <BookOpen size={22} />,
    time: '2 dakika',
    promise: 'Kuran veya dua ile kisa bir bag kur.',
  },
  family_consistency: {
    eyebrow: 'Ilk adim',
    icon: <Users size={22} />,
    time: '2 dakika',
    promise: 'Ailece bugunun tek adimini gorunur kil.',
  },
};

function FirstActivationCard({ onSelectFeature }) {
  const viewedRef = useRef(false);
  const primaryGoal = getStoredPrimaryGoal();
  const goalConfig = getPrimaryGoalConfig(primaryGoal);
  const action = goalConfig.homeAction;
  const copy = activationCopy[primaryGoal] || activationCopy.prayer_rhythm;

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;

    logEvent(ANALYTICS_EVENTS.FIRST_ACTIVATION_CARD_VIEWED, {
      primary_goal: primaryGoal,
      feature: action.feature,
    });
  }, [action.feature, primaryGoal]);

  const handleStart = () => {
    logEvent(ANALYTICS_EVENTS.FIRST_ACTIVATION_CARD_CLICKED, {
      primary_goal: primaryGoal,
      feature: action.feature,
    });
    onSelectFeature(action.feature, 'first_activation_card');
  };

  return (
    <section className="first-activation-card" aria-label="Ilk ibadet adimi">
      <div className="first-activation-card__header">
        <span className="first-activation-card__icon">{copy.icon}</span>
        <span className="first-activation-card__eyebrow">{copy.eyebrow}</span>
        <span className="first-activation-card__time">{copy.time}</span>
      </div>

      <div className="first-activation-card__body">
        <h2>{action.title}</h2>
        <p>{copy.promise} {action.description}</p>
      </div>

      <button type="button" className="first-activation-card__button" onClick={handleStart}>
        <Sparkles size={17} />
        <span>{action.cta}</span>
        <ArrowRight size={17} />
      </button>

      <style>{`
        .first-activation-card {
          margin: 0 5px 16px;
          padding: 20px;
          border-radius: 24px;
          color: var(--nav-text);
          background:
            linear-gradient(145deg, rgba(15, 118, 110, 0.24), rgba(245, 158, 11, 0.13)),
            rgba(6, 78, 59, 0.72);
          border: 1px solid rgba(245, 158, 11, 0.22);
          box-shadow: 0 20px 42px rgba(0, 0, 0, 0.24);
        }

        .first-activation-card__header {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          margin-bottom: 16px;
        }

        .first-activation-card__icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          color: var(--text-gold);
          background: rgba(255, 255, 255, 0.09);
        }

        .first-activation-card__eyebrow,
        .first-activation-card__time {
          min-width: 0;
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(248, 250, 252, 0.86);
        }

        .first-activation-card__time {
          margin-left: auto;
          padding: 7px 10px;
          border-radius: 999px;
          color: var(--text-gold);
          background: rgba(245, 158, 11, 0.13);
          white-space: nowrap;
        }

        .first-activation-card__body h2 {
          margin: 0 0 8px;
          font-size: 1.22rem;
          line-height: 1.18;
          font-weight: 950;
          letter-spacing: 0;
        }

        .first-activation-card__body p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.55;
          font-weight: 650;
          color: rgba(248, 250, 252, 0.78);
        }

        .first-activation-card__button {
          width: 100%;
          min-height: 50px;
          margin-top: 18px;
          border: none;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          color: #ffffff;
          background: linear-gradient(135deg, var(--nav-accent), var(--bg-emerald-light));
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(15, 118, 110, 0.28);
          transition: transform 0.18s ease, filter 0.18s ease;
        }

        .first-activation-card__button:hover,
        .first-activation-card__button:focus-visible {
          transform: translateY(-1px);
          filter: brightness(1.04);
          outline: none;
        }

        .first-activation-card__button:active {
          transform: scale(0.98);
        }

        @media (max-width: 420px) {
          .first-activation-card {
            padding: 18px;
          }

          .first-activation-card__body h2 {
            font-size: 1.12rem;
          }

          .first-activation-card__body p {
            font-size: 0.84rem;
          }
        }
      `}</style>
    </section>
  );
}

export default FirstActivationCard;
