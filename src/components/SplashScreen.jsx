import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useCallback } from 'react';

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
        background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, cursor: 'pointer', padding: '20px',
        touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-color) 0%, rgba(212, 165, 116, 0.95) 100%)',
        padding: '32px 24px', borderRadius: '20px', maxWidth: '340px',
        textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.2)', pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕌</div>
        <div style={{ fontFamily: "'Amiri', serif", fontSize: '24px', color: '#fff', marginBottom: '16px' }}>
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
        </div>
        <div style={{ fontFamily: "'Amiri', serif", fontSize: '20px', color: '#fff', marginBottom: '12px', lineHeight: '1.5' }}>
          رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '20px', fontStyle: 'italic' }}>
          "{t('splash.translation')}"
          <div style={{ fontSize: '11px', marginTop: '6px', opacity: 0.8 }}>{t('splash.reference')}</div>
        </div>
        <div style={{ 
          fontSize: '14px', color: '#fff', 
          padding: '14px 24px', background: 'rgba(255,255,255,0.3)', 
          borderRadius: '30px', display: 'inline-block',
          fontWeight: '700', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          👆 {t('splash.tapToContinue')}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

