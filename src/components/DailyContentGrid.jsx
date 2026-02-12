import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2 } from 'lucide-react';
import {
  buildVerseShareCard,
  buildDuaShareCard,
  openShareCard,
  shareCard
} from '../services/shareCardService';

/**
 * DailyContentGrid Component
 * Displays the Esma, Dua, and Verse of the day
 * Memoized to prevent unnecessary re-renders
 */
const DailyContentGrid = memo(({ dailyContent }) => {
  const { t } = useTranslation();

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
    <div className="daily-carousel" style={{ 
        display: 'flex', 
        gap: '12px', 
        overflowX: 'auto', 
        padding: '10px 5px 20px 5px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
    }}>
      <div className="glass-card daily-card">
        <div className="daily-label">{t('home.dailyName')}</div>
        <div className="daily-name">{dailyContent.esma.name}</div>
        <div className="daily-arabic">{dailyContent.esma.arabic}</div>
      </div>

      <div className="glass-card daily-card">
        <div className="daily-label">{t('home.dailyPrayer')}</div>
        <div className="daily-text">"{t(dailyContent.dua.text)}"</div>
        <button className="daily-share-btn" onClick={handleShareDua}>
          <Share2 size={12} /> {t('common.share')}
        </button>
      </div>

      <div className="glass-card daily-card">
        <div className="daily-label">{t('home.dailyVerse')}</div>
        <div className="daily-ref">{dailyContent.verse.reference}</div>
        <div className="daily-arabic-small">{dailyContent.verse.arabic}</div>
        <button className="daily-share-btn" onClick={handleShareVerse}>
          <Share2 size={12} /> {t('common.share')}
        </button>
      </div>

      <style>{`
        .daily-carousel::-webkit-scrollbar { display: none; }
        .daily-card {
            min-width: 140px;
            max-width: 140px;
            padding: 15px 12px;
            margin-bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            flex-shrink: 0;
        }
        .daily-label {
            font-size: 9px;
            text-transform: uppercase;
            color: var(--primary-color);
            font-weight: 800;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .daily-name {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-color);
        }
        .daily-arabic {
            font-family: serif;
            font-size: 16px;
            color: var(--primary-color);
            margin-top: 4px;
        }
        .daily-text {
            font-size: 10px;
            line-height: 1.4;
            color: var(--text-color);
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            height: 42px;
        }
        .daily-ref {
            font-size: 10px;
            font-weight: 800;
            color: var(--primary-color);
        }
        .daily-arabic-small {
            font-family: serif;
            font-size: 12px;
            color: var(--text-color);
            opacity: 0.8;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }
        .daily-share-btn {
            margin-top: 10px;
            background: transparent;
            border: none;
            color: var(--primary-color);
            font-size: 10px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
        }
      `}</style>
    </div>
  );
});

DailyContentGrid.displayName = 'DailyContentGrid';

export default DailyContentGrid;

