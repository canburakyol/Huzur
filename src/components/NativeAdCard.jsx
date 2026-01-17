import { useEffect, useState, useRef } from 'react';
import { nativeAdService } from '../services/nativeAdService';
import { isPro } from '../services/proService';
import './NativeAdCard.css';

const NativeAdCard = () => {
    const [ad, setAd] = useState(null);
    const cardRef = useRef(null);
    const impressionRecorded = useRef(false);

    useEffect(() => {
        // Skip for Pro users
        if (isPro()) return;

        const loadAd = async () => {
            const adData = await nativeAdService.load();
            if (adData) {
                setAd(adData);
            }
        };

        loadAd();
    }, []);

    // Intersection Observer for Impression Tracking
    useEffect(() => {
        if (!ad || !cardRef.current || impressionRecorded.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (!impressionRecorded.current) {
                        nativeAdService.recordImpression();
                        impressionRecorded.current = true;
                    }
                }
            },
            { threshold: 0.5 } // Trigger when 50% visible
        );

        const currentRef = cardRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ad]);

    if (!ad || isPro()) return null;

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
                    {/* 
                        Note: The plugin handles MediaView rendering natively on iOS.
                        For Android/Web, we render the image/video assets provided.
                        If mediaContent is a URL (Android behavior in some plugins), use it.
                        If it's base64, use it as src.
                    */}
                    {ad.images && ad.images.length > 0 ? (
                        <img src={ad.images[0].url || ad.images[0]} alt="Ad Media" />
                    ) : ad.mediaContent ? (
                         // Fallback if mediaContent is provided directly
                        <img src={ad.mediaContent} alt="Ad Media" />
                    ) : (
                        <div style={{width: '100%', height: '100%', background: '#333'}} />
                    )}
                </div>

                {/* Info */}
                <div className="native-ad-info">
                    <div className="native-ad-header-row">
                        {ad.icon && (
                            <img src={ad.icon.url || ad.icon} alt="" className="native-ad-icon" />
                        )}
                        <div className="native-ad-title-group">
                            <div className="native-ad-headline">{ad.headline}</div>
                            {ad.starRating > 0 && (
                                <div className="native-ad-rating">
                                    {'★'.repeat(Math.floor(ad.starRating))}
                                    {'☆'.repeat(5 - Math.floor(ad.starRating))}
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
};

export default NativeAdCard;
