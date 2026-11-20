import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';

// Daily hadith from Sahih al-Bukhari / Sahih Muslim only (see contentService SAHIH_HADITHS).
const DailyInsight = memo(({ dailyContent }) => {
  const { t } = useTranslation();
  const insight = dailyContent?.insight;
  if (!insight?.text) return null;

  return (
    <section className="hz-card hz-home-card">
      <div className="hz-home-card__head">
        <span className="hz-overline">{t('stories.dailyHadith', 'Günün Hadisi')}</span>
        <BookOpen size={18} strokeWidth={1.75} aria-hidden="true" style={{ color: 'var(--gold)' }} />
      </div>
      {insight.arabic ? <p className="hz-ayah" lang="ar">{insight.arabic}</p> : null}
      {insight.arabic ? <hr className="hz-rule" /> : null}
      <p className="hz-body">{insight.text}</p>
      {insight.source ? <div className="hz-ref" style={{ marginTop: 'var(--space-2)' }}>{insight.source}</div> : null}
    </section>
  );
});

DailyInsight.displayName = 'DailyInsight';

export default DailyInsight;
