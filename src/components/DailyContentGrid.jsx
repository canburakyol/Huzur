import { memo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * DailyContentGrid Component
 * Displays the Esma, Dua, and Verse of the day
 * Memoized to prevent unnecessary re-renders
 */
const DailyContentGrid = memo(({ dailyContent }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
      <div className="glass-card daily-item-compact">
        <div className="daily-title-compact" style={{ color: 'var(--primary-color)' }}>{t('home.dailyName')}</div>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-color)' }}>{dailyContent.esma.name}</div>
        <div style={{ fontSize: '10px', fontFamily: 'serif', color: 'var(--primary-color)' }}>{dailyContent.esma.arabic}</div>
      </div>
      <div className="glass-card daily-item-compact">
        <div className="daily-title-compact">{t('home.dailyPrayer')}</div>
        <div className="daily-text-compact" style={{ fontSize: '9px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          "{t(dailyContent.dua.text)}"
        </div>
      </div>
      <div className="glass-card daily-item-compact">
        <div className="daily-title-compact">{t('home.dailyVerse')}</div>
        <div style={{ fontWeight: 'bold', fontSize: '9px', color: 'var(--primary-color)' }}>{dailyContent.verse.reference}</div>
        <div style={{ fontFamily: 'serif', fontSize: '10px', color: 'var(--text-color)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{dailyContent.verse.arabic}</div>
      </div>
    </div>
  );
});

DailyContentGrid.displayName = 'DailyContentGrid';

export default DailyContentGrid;

