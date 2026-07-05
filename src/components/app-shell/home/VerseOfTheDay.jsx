import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const VerseOfTheDay = memo(({ dailyContent }) => {
  const { t } = useTranslation();
  
  const reference = dailyContent?.verse?.reference || "İnşirah, 5-6";
  const arabicText = dailyContent?.verse?.arabic || "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا";
  const translationText = dailyContent?.verse?.translation || `"Elbette zorlukla beraber bir kolaylık vardır. Gerçekten, zorlukla beraber bir kolaylık daha vardır."`;

  return (
    <section className="verse-section">
      <span className="material-symbols-outlined verse-bg-icon">auto_stories</span>
      <div className="verse-content">
        <span className="verse-badge">{t('home.verseOfTheDay', 'Günün Ayeti')}</span>
        
        {/* Arabic verse text */}
        <h3 className="verse-title">{arabicText}</h3>
        
        {/* Golden elegant divider */}
        <div className="verse-divider"></div>
        
        {/* Translation text */}
        <p className="verse-text">{translationText}</p>
        
        {/* Reference tag */}
        <span className="verse-ref-tag">{reference}</span>

        <div className="verse-actions">
          <button aria-label={t('common.share', 'Paylaş')}>
            <span className="material-symbols-outlined text-sm">share</span>
          </button>
          <button aria-label={t('common.save', 'Kaydet')}>
            <span className="material-symbols-outlined text-sm">bookmark</span>
          </button>
        </div>
      </div>
    </section>
  );
});

VerseOfTheDay.displayName = 'VerseOfTheDay';

export default VerseOfTheDay;
