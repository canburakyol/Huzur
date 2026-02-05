import { Suspense, lazy } from 'react';

// Lazy Load Components
const SplashScreen = lazy(() => import('../SplashScreen'));
const MoodSelector = lazy(() => import('../MoodSelector'));
const AdPopup = lazy(() => import('../AdPopup'));

const GlobalOverlays = ({ 
  showSplash, 
  onHideSplash, 
  showMoodSelector, 
  setShowMoodSelector, 
  newBadge, 
  clearBadge,
  t 
}) => {
  return (
    <>
      {/* Splash Screen */}
      {showSplash && (
        <Suspense fallback={null}>
          <SplashScreen onHide={onHideSplash} />
        </Suspense>
      )}

      {/* Mood Selector Overlay */}
      {showMoodSelector && (
        <Suspense fallback={null}>
          <MoodSelector onClose={() => setShowMoodSelector(false)} />
        </Suspense>
      )}

      {/* Badge Celebration Popup */}
      {newBadge && (
        <div className="badge-celebration-overlay" onClick={clearBadge}>
          <div className="badge-celebration" onClick={(e) => e.stopPropagation()}>
            <div className="badge-emoji">{newBadge.emoji}</div>
            <div className="badge-title">{newBadge.title}</div>
            <div className="badge-message">{newBadge.message}</div>
            <button className="badge-close-btn" onClick={clearBadge}>
              {t ? t('home.awesome') : 'Harika!'}
            </button>
          </div>
        </div>
      )}

      {/* Global Ad Popup */}
      <Suspense fallback={null}>
        <AdPopup />
      </Suspense>
    </>
  );
};

export default GlobalOverlays;
