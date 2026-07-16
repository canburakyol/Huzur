import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shareVerseAsImage } from '../../../services/verseImageShareService';
import { logger } from '../../../utils/logger';

const VerseOfTheDay = memo(({ dailyContent }) => {
  const { t } = useTranslation();
  const shareCardRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState(false);
  
  const reference = dailyContent?.verse?.reference || "İnşirah, 5-6";
  const arabicText = dailyContent?.verse?.arabic || "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا";
  const translationText = dailyContent?.verse?.translation || `"Elbette zorlukla beraber bir kolaylık vardır. Gerçekten, zorlukla beraber bir kolaylık daha vardır."`;
  const backgroundImage = dailyContent?.verse?.image || '/stories/quran-1.jpg';

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    setShareError(false);

    try {
      const result = await shareVerseAsImage(shareCardRef.current, {
        reference,
        translation: translationText.replace(/^"|"$/g, ''),
      });

      if (!result.success && result.reason !== 'cancelled') {
        logger.error('[VerseOfTheDay] Image share failed', result.error || result.reason);
        setShareError(true);
      }
    } catch (error) {
      logger.error('[VerseOfTheDay] Share failed unexpectedly', error);
      setShareError(true);
    } finally {
      setIsSharing(false);
    }
  };

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
          <button
            type="button"
            className="verse-share-button"
            aria-label={t('common.share', 'Paylaş')}
            onClick={handleShare}
            disabled={isSharing}
          >
            <span className="material-symbols-outlined text-sm">share</span>
            <span>{isSharing ? 'Görsel hazırlanıyor…' : 'Bu ayeti sevdiklerinle paylaş'}</span>
          </button>
          <button type="button" className="verse-save-button" aria-label={t('common.save', 'Kaydet')}>
            <span className="material-symbols-outlined text-sm">bookmark</span>
          </button>
        </div>
        {shareError ? (
          <p className="verse-share-error" role="alert">Paylaşım açılamadı. Lütfen tekrar deneyin.</p>
        ) : null}
      </div>

      <div className="verse-share-render" aria-hidden="true">
        <article
          ref={shareCardRef}
          className="verse-share-card"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="verse-share-card__shade" />
          <div className="verse-share-card__content">
            <div className="verse-share-card__brand">HUZUR</div>
            <div className="verse-share-card__label">GÜNÜN AYETİ</div>
            <p className="verse-share-card__arabic">{arabicText}</p>
            <div className="verse-share-card__divider" />
            <p className="verse-share-card__translation">“{translationText.replace(/^"|"$/g, '')}”</p>
            <p className="verse-share-card__reference">{reference}</p>
            <div className="verse-share-card__footer">
              <strong>Huzur: Namaz Vakitleri ve Kuran</strong>
              <span>Google Play'den ücretsiz indir</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
});

VerseOfTheDay.displayName = 'VerseOfTheDay';

export default VerseOfTheDay;
