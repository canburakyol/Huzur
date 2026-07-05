import { Sparkles } from 'lucide-react';

/**
 * Premium moment upgrade card shown after successful AI interactions.
 */
const PremiumMomentCard = ({ premiumMoment, onAction }) => {
  if (!premiumMoment?.showUpgrade) return null;

  return (
    <div className="premium-moment-card-container">
      <div className="premium-moment-glass-card">
        <div className="premium-moment-badge">
          <Sparkles size={12} color="var(--brand-primary)" />
          Premium Moment
        </div>
        <h4 className="premium-moment-title">
          {premiumMoment.headline}
        </h4>
        <p className="premium-moment-desc">
          {premiumMoment.description}
        </p>
        <button
          type="button"
          onClick={onAction}
          className="premium-moment-action-btn"
        >
          <Sparkles size={15} />
          Daha derin desteği gör
        </button>
      </div>
    </div>
  );
};

export default PremiumMomentCard;
