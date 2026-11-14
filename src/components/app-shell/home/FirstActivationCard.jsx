import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, Sparkles, Target, Users } from 'lucide-react';
import { ANALYTICS_EVENTS, logEvent } from '../../../services/analyticsService';
import { getPrimaryGoalConfig, getStoredPrimaryGoal } from '../../../utils/primaryGoal';

const activationCopy = {
  prayer_rhythm: {
    icon: <Target size={22} />,
    promiseKey: 'homeFeed.activation.promise.prayer_rhythm',
  },
  quran_learning: {
    icon: <BookOpen size={22} />,
    promiseKey: 'homeFeed.activation.promise.quran_learning',
  },
  family_consistency: {
    icon: <Users size={22} />,
    promiseKey: 'homeFeed.activation.promise.family_consistency',
  },
};

function FirstActivationCard({ onSelectFeature }) {
  const { t } = useTranslation();
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
    <section className="first-activation-card" aria-label={t('homeFeed.activation.ariaLabel', 'İlk ibadet adımı')}>
      <div className="first-activation-card__header">
        <span className="first-activation-card__icon">{copy.icon}</span>
        <span className="first-activation-card__eyebrow">{t('homeFeed.activation.eyebrow', 'İlk adım')}</span>
        <span className="first-activation-card__time">{t('homeFeed.activation.time', '2 dakika')}</span>
      </div>

      <div className="first-activation-card__body">
        <h2>{t(`primaryGoal.${goalConfig.id}.title`, action.title)}</h2>
        <p>{t(copy.promiseKey)} {t(`primaryGoal.${goalConfig.id}.description`, action.description)}</p>
      </div>

      <button type="button" className="first-activation-card__button" onClick={handleStart}>
        <Sparkles size={17} />
        <span>{t(`primaryGoal.${goalConfig.id}.cta`, action.cta)}</span>
        <ArrowRight size={17} />
      </button>
    </section>
  );
}

export default FirstActivationCard;
