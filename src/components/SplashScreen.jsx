import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useCallback } from 'react';
import launchIcon from '../../play_store_assets/2026-03-refresh/app-icon-512.png';

/**
 * SplashScreen Component
 * Displays a spiritual welcome screen on first session load
 * Uses vanilla JS events for Android WebView compatibility
 */
const SplashScreen = ({ onHide }) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const dismissed = useRef(false);

  const handleDismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    if (onHide) onHide();
  }, [onHide]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Vanilla JS event listeners for Android WebView compatibility
    const handleTouch = (e) => {
      e.preventDefault();
      handleDismiss();
    };

    const handleClick = () => {
      handleDismiss();
    };

    // Add multiple event types for maximum compatibility
    container.addEventListener('touchstart', handleTouch, { passive: false });
    container.addEventListener('touchend', handleTouch, { passive: false });
    container.addEventListener('click', handleClick);
    container.addEventListener('pointerdown', handleClick);

    // Auto-dismiss after 5 seconds as fallback
    const autoTimer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => {
      container.removeEventListener('touchstart', handleTouch);
      container.removeEventListener('touchend', handleTouch);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('pointerdown', handleClick);
      clearTimeout(autoTimer);
    };
  }, [handleDismiss]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, rgba(4, 47, 46, 0.85) 0%, rgba(2, 44, 34, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, cursor: 'pointer', padding: '20px',
        touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <div className="sota-glass-deep sota-glow" style={{
        padding: '40px 28px', borderRadius: '28px', maxWidth: '360px',
        textAlign: 'center', pointerEvents: 'none',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Soft mystic light in background */}
        <div style={{
          position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 60%)',
          animation: 'breathingGlow 6s infinite alternate', zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="sota-stagger-1" style={{ marginBottom: '24px' }}>
            <img
              src={launchIcon}
              alt="Huzur app icon"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '28px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
              }}
            />
          </div>
          <div className="sota-stagger-2" style={{ fontFamily: "var(--arabic-font-family)", fontSize: '28px', color: '#fff', marginBottom: '16px', textShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
          </div>
          <div className="sota-stagger-3" style={{ fontFamily: "var(--arabic-font-family)", fontSize: '22px', color: '#fde68a', marginBottom: '16px', lineHeight: '1.6', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي
          </div>
          <div className="sota-stagger-4" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.95)', marginBottom: '28px', fontStyle: 'italic', fontWeight: '300' }}>
            "{t('splash.translation')}"
            <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7, fontWeight: '400' }}>{t('splash.reference')}</div>
          </div>
          <div className="sota-stagger-5" style={{ 
            fontSize: '14px', color: '#fff', 
            padding: '16px 28px', background: 'rgba(255,255,255,0.15)', 
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '30px', display: 'inline-block',
            fontWeight: '600', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease'
          }}>
            👆 {t('splash.tapToContinue')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;


