import { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from './components/ErrorBoundary';
import { ensureAuthenticated } from './services/authService';
import crashlyticsReporter, { initCrashlyticsTestHook } from './utils/crashlyticsReporter';

// Custom Hooks
import { useBackButton } from './hooks/useBackButton';
import { usePrayerTimes, useStickyNotification, useAndroidWidget } from './hooks/usePrayerTimes';
import { useLocationConsent } from './hooks/useLocationConsent';
import { useAppInit } from './hooks/useAppInit';
import { useDailyContent } from './hooks/useDailyContent';
import { useDirection } from './hooks/useDirection';
import { useFocus } from './context/FocusContext';
import { NotificationService } from './services/notificationService';

// Components - Lazy loaded for performance
const FeatureManager = lazy(() => import('./components/FeatureManager'));
const SplashScreen = lazy(() => import('./components/SplashScreen'));
const BottomNav = lazy(() => import('./components/BottomNav'));
const HomeHeader = lazy(() => import('./components/HomeHeader'));
const DailyContentGrid = lazy(() => import('./components/DailyContentGrid'));
const FeatureGrid = lazy(() => import('./components/FeatureGrid'));
const AdPopup = lazy(() => import('./components/AdPopup'));
const NativeAdCard = lazy(() => import('./components/NativeAdCard'));
const PrayerTimeBanner = lazy(() => import('./components/PrayerTimeBanner'));
const DailyQuests = lazy(() => import('./components/DailyQuests'));

// Lazy Load Components
const Stories = lazy(() => import('./components/Stories'));
const Prayers = lazy(() => import('./components/Prayers'));
const Quran = lazy(() => import('./components/Quran'));
const PrayerCountdown = lazy(() => import('./components/PrayerCountdown'));
const SpiritualCoach = lazy(() => import('./components/SpiritualCoach'));
const SocialDashboard = lazy(() => import('./components/social/SocialDashboard'));
const HamburgerMenu = lazy(() => import('./components/HamburgerMenu'));
const MoodSelector = lazy(() => import('./components/MoodSelector'));

// Loading fallback component
const LoadingFallback = ({ height = '100px' }) => (
  <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="loading-spinner" />
  </div>
);

function App() {
  const { t } = useTranslation();
  const { isFocusMode } = useFocus();
  // UI State
  const [activeFeature, setActiveFeature] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('splashShown'));

  // Prayer Times Hook
  const {
    timings,
    nextPrayer,
    loading,
    error,
    showWelcome,
    fetchPrayerTimes,
    handleEnableNotifications,
    handleCloseWelcome
  } = usePrayerTimes();

  // Location & Weather Hook
  const handleLocationUpdate = useCallback((coords) => {
    fetchPrayerTimes(coords);
  }, [fetchPrayerTimes]);

  const {
    weather,
    locationName,
    showLocationPrompt,
    locationConsentGiven,
    handleLocationConsent
  } = useLocationConsent(handleLocationUpdate);

  // App Initialization Hook
  const { streakData, newBadge, clearBadge, isProUser } = useAppInit(timings);

  // Daily Content Hook
  const { dailyContent } = useDailyContent();

  // RTL/LTR Direction Hook
  useDirection();

  // Android Back Button Hook
  useBackButton({
    showMoodSelector,
    activeFeature,
    activeTab,
    setShowMoodSelector,
    setActiveFeature,
    setActiveTab
  });

  // Sticky Notification & Widget Hooks
  useStickyNotification(timings, nextPrayer);
  useAndroidWidget(timings, nextPrayer, locationName);


  // Initialize Firebase Auth on mount
  useEffect(() => {
    const initAuth = async () => {
       try {
         const uid = await ensureAuthenticated();
         if (uid) {
            // Initialize Push Notifications listener (and sync token)
            NotificationService.initPush(uid);
         }
       } catch (e) {
         console.error("Auth init error", e);
       }
    };
    initAuth();
  }, []);

  // Crashlytics test beacon on app mount (will be ignored if native plugin not available)
  useEffect(() => {
    try {
      crashlyticsReporter?.logCrash?.('App mounted - startup');
    } catch {
      // ignore in case Crashlytics bridge isn't ready yet
    }
  }, []);
  // Initialize Crashlytics test hook to allow quick in-app test from console/UI
  useEffect(() => {
    try { initCrashlyticsTestHook(); } catch { /* ignore */ }
  }, []);

  // Global error handling for production observability
  useEffect(() => {
    const onError = (event) => {
      // Basic log; hook with Crashlytics later
      console.error('[GlobalError]', event.message, 'at', event.filename, 'line', event.lineno);
      try {
        crashlyticsReporter?.logException?.(event?.error || new Error(event.message || 'Error'));
      } catch {
        // ignore
      }
    };
    const onUnhandledRejection = (event) => {
      console.error('[UnhandledRejection]', event.reason);
      try {
        crashlyticsReporter?.logException?.(event?.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      } catch {
        // ignore
      }
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  // Listen for custom feature open events (e.g. from Settings)
  useEffect(() => {
    const handleOpenFeature = (e) => {
      setActiveFeature(e.detail);
    };
    window.addEventListener('openFeature', handleOpenFeature);
    return () => window.removeEventListener('openFeature', handleOpenFeature);
  }, []);

  // Render Active Feature Overlay
  if (activeFeature) {
    return (
      <Suspense fallback={<div className="loading-overlay">Yükleniyor...</div>}>
        <FeatureManager activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
    <>
      {/* Splash Screen */}
      {showSplash && (
        <Suspense fallback={null}>
          <SplashScreen onHide={() => {
            sessionStorage.setItem('splashShown', 'true');
            setShowSplash(false);
          }} />
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
            <button className="badge-close-btn" onClick={clearBadge}>{t('home.awesome')}</button>
          </div>
        </div>
      )}

      <div className="app-container" style={{ position: 'relative', paddingBottom: '130px' }}>
        <Suspense fallback={null}>
          <AdPopup />
        </Suspense>

        {/* Error Message */}
        {error && (
          <div className="glass-card" style={{
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            border: '1px solid rgba(231, 76, 60, 0.3)',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#e74c3c', margin: 0, textAlign: 'center' }}>⚠️ {error}</p>
            <button onClick={() => fetchPrayerTimes(null, true)} className="btn btn-primary" style={{ marginTop: '10px' }}>
              {t('common.retry')}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: '#666' }}>{t('prayer.loading')}</p>
          </div>
        )}
        {/* Home Tab Content */}
        {activeTab === 'home' && !loading && !error && (
          <>
            {/* Prayer Time Banner */}
            <Suspense fallback={<LoadingFallback height="80px" />}>
              <PrayerTimeBanner timings={timings} nextPrayer={nextPrayer} />
            </Suspense>

            {/* Header: Location, Weather & Streak */}
            <Suspense fallback={<LoadingFallback height="60px" />}>
              <HomeHeader 
                locationName={locationName} 
                weather={weather} 
                streakData={streakData} 
              />
            </Suspense>

            {/* Stories Section */}
            <Suspense fallback={<LoadingFallback height="100px" />}>
              <Stories />
            </Suspense>

            {/* Welcome / Permission Prompt */}
            {showWelcome && (
              <div className="glass-card" style={{ backgroundColor: 'rgba(255, 243, 205, 0.95)', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100, width: '90%', maxWidth: '400px' }}>
                <h3 style={{ color: '#856404' }}>{t('home.welcome')}</h3>
                <p style={{ marginBottom: '20px' }}>{t('home.notificationPrompt')}</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={handleEnableNotifications}>{t('home.yesEnable')}</button>
                  <button className="btn" onClick={handleCloseWelcome} style={{ background: 'rgba(0,0,0,0.1)' }}>{t('common.no')}</button>
                </div>
              </div>
            )}

            {/* Location Consent Prompt */}
            {showLocationPrompt && !locationConsentGiven && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9998, padding: '20px'
              }}>
                <div className="glass-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '12px' }}>{t('home.locationRequired')}</h3>
                  <p style={{ marginBottom: '16px', color: '#555', lineHeight: 1.6 }}>
                    {t('home.locationReasonIntro')}
                  </p>
                  <ul style={{ textAlign: 'left', margin: '0 auto 20px', maxWidth: '280px', color: '#444', fontSize: '14px', lineHeight: 1.8 }}>
                    <li>🕌 {t('home.locationPrayer')}</li>
                    <li>🧭 {t('home.locationQibla')}</li>
                    <li>📍 {t('home.locationMosque')}</li>
                    <li>🌤️ {t('home.locationWeather')}</li>
                  </ul>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
                    {t('home.locationPrivacy')}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => handleLocationConsent(true)} style={{ flex: 1 }}>{t('home.allowLocation')}</button>
                    <button className="btn" onClick={() => handleLocationConsent(false)} style={{ background: 'rgba(0,0,0,0.1)', flex: 1 }}>{t('home.notNow')}</button>
                  </div>
                </div>
              </div>
            )}

            {/* Prayer Countdown */}
            {timings && nextPrayer && (
              <Suspense fallback={<LoadingFallback height="120px" />}>
                <PrayerCountdown timings={timings} nextPrayer={nextPrayer} />
              </Suspense>
            )}

            {/* Daily Quests - Gamification */}
            <Suspense fallback={<LoadingFallback height="180px" />}>
              <DailyQuests />
            </Suspense>

            {/* Daily Content Grid */}
            <Suspense fallback={<LoadingFallback height="200px" />}>
              <DailyContentGrid dailyContent={dailyContent} />
            </Suspense>

            {/* Native Advanced Ad */}
            <Suspense fallback={<LoadingFallback height="150px" />}>
              <NativeAdCard />
            </Suspense>

            {/* Feature Grid */}
            <Suspense fallback={<LoadingFallback height="300px" />}>
              <FeatureGrid onSelectFeature={setActiveFeature} />
            </Suspense>
          </>
        )}

        {/* Tab Contents */}
        {activeTab === 'prayers' && (
          <Suspense fallback={<LoadingFallback height="100vh" />}>
            <Prayers onClose={() => setActiveTab('home')} />
          </Suspense>
        )}
        {activeTab === 'quran' && (
          <Suspense fallback={<LoadingFallback height="100vh" />}>
            <Quran onClose={() => setActiveTab('home')} />
          </Suspense>
        )}
        {activeTab === 'community' && (
          <Suspense fallback={<LoadingFallback height="100vh" />}>
            <SocialDashboard onClose={() => setActiveTab('home')} />
          </Suspense>
        )}
        {activeTab === 'assistant' && (
          <Suspense fallback={<LoadingFallback height="100vh" />}>
            <SpiritualCoach onClose={() => setActiveTab('home')} />
          </Suspense>
        )}

        {/* Hamburger Menu */}
        <Suspense fallback={null}>
          <HamburgerMenu
            onSelectFeature={setActiveFeature}
            currentFeature={activeFeature}
            externalOpen={showHamburgerMenu}
            onClose={() => setShowHamburgerMenu(false)}
            isPro={isProUser}
          />
        </Suspense>

        {/* Bottom Navigation Bar */}
        {!isFocusMode && (
          <Suspense fallback={null}>
            <BottomNav 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onShowMenu={() => setShowHamburgerMenu(true)} 
            />
          </Suspense>
        )}
      </div>
    </>
    </ErrorBoundary>
  );
}

export default App;
