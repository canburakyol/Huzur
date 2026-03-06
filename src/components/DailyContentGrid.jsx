import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2 } from 'lucide-react';
import {
  buildVerseShareCard,
  buildDuaShareCard,
  buildEsmaShareCard,
  openShareCard,
  shareCard
} from '../services/shareCardService';
import './ModernHomeFeed.css';


/**
 * DailyContentGrid Component
 * Displays the Esma, Dua, and Verse of the day
 * Memoized to prevent unnecessary re-renders
 */
const DailyContentGrid = memo(({ dailyContent }) => {
  const { t } = useTranslation();

  const handleShareEsma = async () => {
    const card = buildEsmaShareCard({
      name: dailyContent?.esma?.name,
      arabic: dailyContent?.esma?.arabic,
      meaning: t(`esma.meanings.${dailyContent?.esma?.id}`) || dailyContent?.esma?.meaning
    });
    openShareCard('esma', 'daily_content_grid');
    await shareCard(card, 'daily_content_grid');
  };

  const handleShareDua = async () => {
    const card = buildDuaShareCard({
      title: t('home.dailyPrayer'),
      arabic: dailyContent?.dua?.arabic,
      text: t(dailyContent?.dua?.text)
    });
    openShareCard('dua', 'daily_content_grid');
    await shareCard(card, 'daily_content_grid');
  };

  const handleShareVerse = async () => {
    const card = buildVerseShareCard({
      reference: dailyContent?.verse?.reference,
      arabic: dailyContent?.verse?.arabic,
      translation: dailyContent?.verse?.translation || dailyContent?.verse?.text
    });
    openShareCard('verse', 'daily_content_grid');
    await shareCard(card, 'daily_content_grid');
  };

  return (
    <div className="daily-gazette-carousel">
      {/* 1. Esma of the Day */}
      <div className="daily-gazette-card reveal-stagger" style={{ '--delay': '0s' }}>
        <div className="daily-gazette-label">{t('home.dailyName')}</div>
        <div className="daily-gazette-title">{dailyContent.esma.name}</div>
        <div className="daily-gazette-arabic">{dailyContent.esma.arabic}</div>
        <button className="daily-gazette-share" onClick={handleShareEsma}>
          <Share2 size={14} /> {t('common.share')}
        </button>
      </div>

      {/* 2. Dua of the Day */}
      <div className="daily-gazette-card reveal-stagger" style={{ '--delay': '0.1s' }}>
        <div className="daily-gazette-label">{t('home.dailyPrayer')}</div>
        <div className="daily-gazette-text">"{t(dailyContent.dua.text)}"</div>
        <button className="daily-gazette-share" onClick={handleShareDua}>
          <Share2 size={14} /> {t('common.share')}
        </button>
      </div>

      {/* 3. Verse of the Day */}
      <div className="daily-gazette-card reveal-stagger" style={{ '--delay': '0.2s' }}>
        <div className="daily-gazette-label">{t('home.dailyVerse')}</div>
        <div className="daily-gazette-title verse-ref">{dailyContent.verse.reference}</div>
        <div className="daily-gazette-text verse-arabic">{dailyContent.verse.arabic}</div>
        <button className="daily-gazette-share" onClick={handleShareVerse}>
          <Share2 size={14} /> {t('common.share')}
        </button>
      </div>
    </div>
  );
});

DailyContentGrid.displayName = 'DailyContentGrid';

export default DailyContentGrid;

