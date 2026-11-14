import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb } from 'lucide-react';

const DailyInsight = memo(({ dailyContent }) => {
  const { t } = useTranslation();
  // Use dailyContent if available, otherwise static placeholder
  const text = dailyContent?.insight?.text || `"Güzel söz sadakadır." (Buhari)`;

  return (
    <section className="daily-insight-section">
      <div className="daily-insight-card">
        <div className="daily-insight-icon">
          <Lightbulb size={22} color="#fff" aria-hidden="true" />
        </div>
        <div>
          <h4 className="daily-insight-title">{t('home.dailyInsight', 'Günün İlhamı')}</h4>
          <p className="daily-insight-text">{text}</p>
        </div>
      </div>
    </section>
  );
});

DailyInsight.displayName = 'DailyInsight';

export default DailyInsight;
