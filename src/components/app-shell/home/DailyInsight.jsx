import { memo } from 'react';

const DailyInsight = memo(({ dailyContent }) => {
  // Use dailyContent if available, otherwise static placeholder
  const text = dailyContent?.insight?.text || `"Güzel söz sadakadır." (Buhari)`;

  return (
    <section className="daily-insight-section">
      <div className="daily-insight-card">
        <div className="daily-insight-icon">
          <span className="material-symbols-outlined text-white">tips_and_updates</span>
        </div>
        <div>
          <h4 className="daily-insight-title">Günün İlhamı</h4>
          <p className="daily-insight-text">{text}</p>
        </div>
      </div>
    </section>
  );
});

DailyInsight.displayName = 'DailyInsight';

export default DailyInsight;
