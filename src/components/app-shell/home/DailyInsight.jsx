import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb } from 'lucide-react';

const DailyInsight = memo(({ dailyContent }) => {
  const { t } = useTranslation();
  const text = dailyContent?.insight?.text;
  if (!text) return null;

  return (
    <section className="hz-card hz-home-card">
      <div className="hz-home-card__head">
        <span className="hz-overline">{t('home.dailyInsight', 'Günün İlhamı')}</span>
        <Lightbulb size={18} strokeWidth={1.75} aria-hidden="true" style={{ color: 'var(--gold)' }} />
      </div>
      <p className="hz-body" style={{ marginTop: 'var(--space-2)' }}>{text}</p>
    </section>
  );
});

DailyInsight.displayName = 'DailyInsight';

export default DailyInsight;
