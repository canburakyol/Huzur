import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, HeartHandshake, Target } from 'lucide-react';
import { getPrimaryGoalConfig, getStoredPrimaryGoal } from '../../../utils/primaryGoal';

const iconMap = {
  dailyTasks: <Target size={18} />,
  dailyQuiz: <BookOpen size={18} />,
  family: <HeartHandshake size={18} />
};

const HomePriorityCard = memo(function HomePriorityCard({ onSelectFeature, streakData }) {
  const { t } = useTranslation();
  const primaryGoal = getStoredPrimaryGoal();
  const goalConfig = getPrimaryGoalConfig(primaryGoal);
  const action = goalConfig.homeAction;
  const supportingCopy = streakData?.current > 0
    ? t('homeFeed.priorityCard.supportingStreak', { count: streakData.current })
    : t('homeFeed.priorityCard.supportingStart');

  return (
    <section className="home-priority-card reveal-stagger">
      <div className="home-priority-card__eyebrow">
        {t('homeFeed.priorityCard.eyebrow')}
      </div>
      <div className="home-priority-card__body">
        <div className="home-priority-card__icon">
          {iconMap[action.feature] || <Target size={18} />}
        </div>
        <div>
          <h2 className="home-priority-card__title">
            {action.title}
          </h2>
          <p className="home-priority-card__description">
            {action.description}
          </p>
          <p className="home-priority-card__support">
            {supportingCopy}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelectFeature(action.feature, 'home_priority_card')}
        className="home-priority-card__button"
      >
        {action.cta}
        <ArrowRight size={16} />
      </button>
    </section>
  );
});

export default HomePriorityCard;
