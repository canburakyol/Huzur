import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpenText, Share2 } from 'lucide-react';
import { shareVerseAsImage } from '../../../services/verseImageShareService';
import { logger } from '../../../utils/logger';

const VerseOfTheDay = memo(({ dailyContent }) => {
  const { t } = useTranslation();
  const shareCardRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState(false);
  
  const reference = dailyContent?.verse?.reference || "İnşirah, 5-6";
  const arabicText = dailyContent?.verse?.arabic || "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا";
  const translationText = dailyContent?.verse?.translation || `"Elbette zorlukla beraber bir kolaylık vardır. Gerçekten, zorlukla beraber bir kolaylık daha vardır."`;
  const backgroundImage = dailyContent?.verse?.image || '/stories/quran-1.webp';

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
    <section className="hz-card hz-home-card">
      <div className="hz-home-card__head">
        <span className="hz-overline">{t('home.verseOfTheDay', 'Günün Ayeti')}</span>
        <BookOpenText size={18} strokeWidth={1.75} aria-hidden="true" style={{ color: 'var(--gold)' }} />
      </div>
      <p className="hz-ayah" lang="ar">{arabicText}</p>
      <hr className="hz-rule" />
      <p className="hz-body">{translationText.replace(/^"|"$/g, '')}</p>
      <div className="hz-ref" style={{ marginTop: 'var(--space-2)' }}>{reference}</div>
      <button
        type="button"
        className="hz-btn hz-btn--secondary"
        style={{ width: '100%', marginTop: 'var(--space-4)' }}
        onClick={handleShare}
        disabled={isSharing}
      >
        <Share2 size={18} strokeWidth={1.75} aria-hidden="true" />
        {isSharing ? t('home.preparingImage', 'Görsel hazırlanıyor…') : t('home.shareVerse', 'Bu ayeti sevdiklerinle paylaş')}
      </button>
      {shareError ? (
        <p className="hz-label" role="alert" style={{ color: 'var(--danger)', margin: 'var(--space-2) 0 0' }}>{t('home.shareFailed', 'Paylaşım açılamadı. Lütfen tekrar deneyin.')}</p>
      ) : null}

      <div className="verse-share-render" aria-hidden="true">
        <article
          ref={shareCardRef}
          className="verse-share-card"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="verse-share-card__shade" />
          <div className="verse-share-card__content">
            <div className="verse-share-card__brand">HUZUR</div>
            <div className="verse-share-card__label">{t('home.verseOfTheDay', 'Günün Ayeti')}</div>
            <p className="verse-share-card__arabic">{arabicText}</p>
            <div className="verse-share-card__divider" />
            <p className="verse-share-card__translation">“{translationText.replace(/^"|"$/g, '')}”</p>
            <p className="verse-share-card__reference">{reference}</p>
            <div className="verse-share-card__footer">
              <strong>Huzur: Namaz Vakitleri ve Kuran</strong>
              <span>{t('home.shareCardCta', "Google Play'den ücretsiz indir")}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
});

VerseOfTheDay.displayName = 'VerseOfTheDay';

export default VerseOfTheDay;
