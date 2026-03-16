import { useEffect, useState, useRef, memo } from 'react';
import { nativeAdService } from '../services/nativeAdService';
import { LazyImage } from './LazyImage';
import './NativeAdCard.css';

const IMPRESSION_THRESHOLD = 0.5;
const MAX_STAR_RATING = 5;

const NativeAdCard = memo(({ isProUser = false }) => {
  const [ad, setAd] = useState(null);
  const cardRef = useRef(null);
  const impressionRecorded = useRef(false);

  useEffect(() => {
    if (isProUser) {
      return;
    }

    const loadAd = async () => {
      const adData = await nativeAdService.load();
      if (adData) {
        setAd(adData);
      }
    };

    loadAd();
  }, [isProUser]);

  // Intersection Observer for Impression Tracking
  useEffect(() => {
    if (!ad || !cardRef.current || impressionRecorded.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impressionRecorded.current) {
          nativeAdService.recordImpression();
          impressionRecorded.current = true;
        }
      },
      { threshold: IMPRESSION_THRESHOLD }
    );

    const currentRef = cardRef.current;
    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [ad]);

  if (!ad || isProUser) return null;

  const filledStars = Math.floor(ad.starRating);
  const emptyStars = MAX_STAR_RATING - filledStars;

  return (
    <div
      className="native-ad-container"
      ref={cardRef}
      onClick={() => nativeAdService.handleClick()}
    >
      {/* Ad Label - ZORUNLU (Google Policy) */}
      <div className="native-ad-label">
        <span className="ad-badge">Reklam</span>
        <span className="ad-choices">ⓘ</span>
      </div>

      <div className="native-ad-content">
        {/* Media (Video/Image) */}
        <div className="native-ad-media">
          {ad.images && ad.images.length > 0 ? (
            <LazyImage
              src={ad.images[0].url || ad.images[0]}
              alt="Ad Media"
              className="native-ad-lazy-image"
            />
          ) : ad.mediaContent ? (
            <LazyImage
              src={ad.mediaContent}
              alt="Ad Media"
              className="native-ad-lazy-image"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#333' }} />
          )}
        </div>

        {/* Info */}
        <div className="native-ad-info">
          <div className="native-ad-header-row">
            {ad.icon && (
              <LazyImage
                src={ad.icon.url || ad.icon}
                alt=""
                className="native-ad-icon"
              />
            )}
            <div className="native-ad-title-group">
              <div className="native-ad-headline">{ad.headline}</div>
              {ad.starRating > 0 && (
                <div className="native-ad-rating">
                  {'★'.repeat(filledStars)}
                  {'☆'.repeat(emptyStars)}
                  <span>{ad.starRating}</span>
                </div>
              )}
            </div>
          </div>

          {ad.store && (
            <div className="native-ad-store">
              🛍️ {ad.store}
            </div>
          )}

          <div className="native-ad-body">{ad.body}</div>
        </div>
      </div>

      {/* CTA Button */}
      <button className="native-ad-cta">
        🚀 {ad.callToAction || 'Yükle'}
      </button>
    </div>
  );
});

export default NativeAdCard;
