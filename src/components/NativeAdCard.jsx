import { useEffect, useState, useRef, memo } from 'react';
import { nativeAdService } from '../services/nativeAdService';
import { LazyImage } from './LazyImage';
import './NativeAdCard.css';

const IMPRESSION_THRESHOLD = 0.5;

const getAssetSource = (asset) => {
  if (!asset) return null;
  if (typeof asset === 'string') return asset;
  return asset.url || null;
};

const NativeAdCard = memo(({ isProUser = false }) => {
  const [ad, setAd] = useState(null);
  const cardRef = useRef(null);
  const impressionRecorded = useRef(false);

  useEffect(() => {
    if (isProUser) {
      return;
    }

    let isMounted = true;

    const loadAd = async () => {
      const adData = await nativeAdService.load();
      if (isMounted && adData) {
        setAd(adData);
      }
    };

    loadAd();

    return () => {
      isMounted = false;
    };
  }, [isProUser]);

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

  const mediaSource = getAssetSource(ad.images?.[0]) || getAssetSource(ad.mediaContent);
  const iconSource = getAssetSource(ad.icon);
  const rating = Number(ad.starRating || 0);
  const hasRating = Number.isFinite(rating) && rating > 0;

  return (
    <article className="native-ad-container" ref={cardRef} aria-label="Reklam">
      <div className="native-ad-label">
        <span className="ad-badge">Reklam</span>
        <span className="ad-choices" aria-label="Reklam bilgisi">i</span>
      </div>

      <div className="native-ad-content">
        <div className="native-ad-media">
          {mediaSource ? (
            <LazyImage
              src={mediaSource}
              alt=""
              className="native-ad-lazy-image"
            />
          ) : (
            <div className="native-ad-media-placeholder" aria-hidden="true" />
          )}
        </div>

        <div className="native-ad-info">
          <div className="native-ad-header-row">
            {iconSource && (
              <LazyImage
                src={iconSource}
                alt=""
                className="native-ad-icon"
              />
            )}
            <div className="native-ad-title-group">
              <div className="native-ad-headline">{ad.headline}</div>
              {hasRating && (
                <div className="native-ad-rating">
                  <span>{rating.toFixed(1)}</span>
                  <span className="native-ad-rating-label">puan</span>
                </div>
              )}
            </div>
          </div>

          {ad.store && (
            <div className="native-ad-store">{ad.store}</div>
          )}

          {ad.body && (
            <div className="native-ad-body">{ad.body}</div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="native-ad-cta"
        onClick={() => nativeAdService.handleClick()}
      >
        {ad.callToAction || 'Yükle'}
      </button>
    </article>
  );
});

export default NativeAdCard;
