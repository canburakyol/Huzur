import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const HomeAiRecommendationCard = memo(function HomeAiRecommendationCard({ onSelectFeature, rankingState }) {
  const { t } = useTranslation();
  if (!rankingState?.headline) {
    return null;
  }

  return (
    <div
      className="bg-white rounded-3xl border-huzur-sage-100 shadow-huzur-soft"
      style={{
        margin: '0 5px 16px',
        padding: '22px 20px',
      }}
    >
      <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
        {t('homeFeed.aiRecommendation.eyebrow')}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '6px' }}>
        {rankingState.headline}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', lineHeight: '1.55', fontWeight: '600' }}>
        {rankingState.explanation}
      </div>
      {rankingState.socialHint ? (
        <div style={{ marginTop: '10px', fontSize: '0.76rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-main)', lineHeight: '1.5', fontWeight: '700' }}>
          {rankingState.socialHint}
        </div>
      ) : null}
      {rankingState.suggestedActionFeature && rankingState.suggestedActionLabel ? (
        <button
          onClick={() => onSelectFeature?.(rankingState.suggestedActionFeature, 'home_ai_recommendation')}
          style={{
            marginTop: '12px',
            background: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
            color: 'var(--primary)',
            border: '1px solid color-mix(in srgb, var(--secondary) 20%, transparent)',
            borderRadius: '16px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-main)',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          {rankingState.suggestedActionLabel}
        </button>
      ) : null}
    </div>
  );
});

export default HomeAiRecommendationCard;
