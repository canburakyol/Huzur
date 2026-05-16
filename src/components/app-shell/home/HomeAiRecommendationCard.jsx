function HomeAiRecommendationCard({ onSelectFeature, rankingState }) {
  if (!rankingState?.headline) {
    return null;
  }

  return (
    <div
      style={{
        margin: '0 5px 16px',
        padding: '18px 18px',
        borderRadius: '22px',
        background: rankingState.riskBand === 'at_risk'
          ? 'linear-gradient(145deg, rgba(180, 83, 9, 0.14), rgba(15, 118, 110, 0.10))'
          : 'linear-gradient(145deg, rgba(15, 118, 110, 0.16), rgba(212, 175, 55, 0.08))',
        border: '1px solid rgba(212, 175, 55, 0.16)',
      }}
    >
      <div style={{ fontSize: '0.72rem', fontWeight: '900', color: 'var(--nav-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
        Gunluk ritim notu
      </div>
      <div style={{ fontSize: '0.96rem', fontWeight: '900', color: 'var(--nav-text)', marginBottom: '6px' }}>
        {rankingState.headline}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--nav-text-muted)', lineHeight: '1.55', fontWeight: '600' }}>
        {rankingState.explanation}
      </div>
      {rankingState.socialHint ? (
        <div style={{ marginTop: '10px', fontSize: '0.76rem', color: 'var(--nav-text-muted)', lineHeight: '1.5', fontWeight: '700' }}>
          {rankingState.socialHint}
        </div>
      ) : null}
      {rankingState.suggestedActionFeature && rankingState.suggestedActionLabel ? (
        <button
          onClick={() => onSelectFeature?.(rankingState.suggestedActionFeature, 'home_ai_recommendation')}
          style={{
            marginTop: '12px',
            background: 'var(--nav-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            fontWeight: '800',
            cursor: 'pointer'
          }}
        >
          {rankingState.suggestedActionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default HomeAiRecommendationCard;
