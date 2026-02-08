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


// Services
import streakService from './services/streakService';
import { checkAndNotifyStreakRisk } from './services/streakProtectionService';

// Components - Lazy loaded for performance
const FeatureManager = lazy(() => import('./components/FeatureManager'));
const SplashScreen = lazy(() => import('./components/SplashScreen'));
const BottomNav = lazy(() => import('./components/BottomNav'));
const HomeHeader = lazy(() => import('./components/HomeHeader'));
const DailyContentGrid = lazy(() => import('./components/DailyContentGrid'));
const FeatureGrid = lazy(() => import('./components/FeatureGrid'));
const NativeAdCard = lazy(() => import('./components/NativeAdCard'));
const PrayerTimeBanner = lazy(() => import('./components/PrayerTimeBanner'));
const DailyQuests = lazy(() => import('./components/DailyQuests'));
const Stories = lazy(() => import('./components/Stories'));
const Prayers = lazy(() => import('./components/Prayers'));
const Quran = lazy(() => import('./components/Quran'));
const PrayerCountdown = lazy(() => import('./components/PrayerCountdown'));
const SpiritualCoach = lazy(() => import('./components/SpiritualCoach'));
const SocialDashboard = lazy(() => import('./components/social/SocialDashboard'));
const HamburgerMenu = lazy(() => import('./components/HamburgerMenu'));
const MoodSelector = lazy(() => import('./components/MoodSelector'));
const StreakProtectionModal = lazy(() => import('./components/StreakProtectionModal'));
const LevelUpConfetti = lazy(() => import('./components/LevelUpConfetti'));

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
  const [protectionTarget, setProtectionTarget] = useState(null); // { category, data }

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
            // NotificationService.initPush(uid); // Removed: Method does not exist
         }
       } catch (e) {
         console.error("Auth init error", e);
       }
    };
    initAuth();
  }, []);

  // Crashlytics
  useEffect(() => {
    try {
      crashlyticsReporter?.logCrash?.('App mounted - startup');
      initCrashlyticsTestHook();
    } catch { /* ignore */ }
  }, []);

  // Global error handling
  useEffect(() => {
    const onError = (event) => {
      console.error('[GlobalError]', event.message);
      try { crashlyticsReporter?.logException?.(event?.error || new Error(event.message)); } catch { /* silently ignore logging errors */ }
    };
    const onUnhandledRejection = (event) => {
      console.error('[UnhandledRejection]', event.reason);
      try { crashlyticsReporter?.logException?.(event?.reason instanceof Error ? event.reason : new Error(String(event.reason))); } catch { /* silently ignore logging errors */ }
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  // Streak Protection Check
  useEffect(() => {
    const checkProtection = async () => {
      setTimeout(async () => {
        await checkAndNotifyStreakRisk();
        const data = streakService.getStreakData();
        const today = new Date().toISOString().split('T')[0];
        
        const prayerStreak = data.streaks?.prayer;
        if (prayerStreak && prayerStreak.count > 0 && 
            prayerStreak.lastDate && prayerStreak.lastDate !== today &&
            prayerStreak.freezeTokens > 0) {
          
          const lastDate = new Date(prayerStreak.lastDate);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastDate < yesterday.setHours(0,0,0,0)) {
            setProtectionTarget({ category: 'prayer', data: prayerStreak });
          }
        }
      }, 3000);
    };
    checkProtection();
  }, []);

  // Listen for custom feature open events
  useEffect(() => {
    const handleOpenFeature = (e) => setActiveFeature(e.detail);
    const handleSetActiveTab = (e) => {
      const tab = e?.detail;
      if (typeof tab === 'string' && tab.length > 0) {
        setActiveTab(tab);
      }
    };
    window.addEventListener('openFeature', handleOpenFeature);
    window.addEventListener('setActiveTab', handleSetActiveTab);
    return () => {
      window.removeEventListener('openFeature', handleOpenFeature);
      window.removeEventListener('setActiveTab', handleSetActiveTab);
    };
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

      {/* Streak Protection Modal */}
      {protectionTarget && (
        <Suspense fallback={null}>
          <StreakProtectionModal
            isOpen={!!protectionTarget}
            onClose={() => setProtectionTarget(null)}
            categoryName={protectionTarget.category === 'prayer' ? 'Namaz' : protectionTarget.category}
            categoryData={protectionTarget.data}
            onUseToken={() => {
              streakService.useFreezeToken(protectionTarget.category);
              setProtectionTarget(null);
            }}
          />
        </Suspense>
      )}

      {/* Level Up Confetti */}
      <Suspense fallback={null}>
        <LevelUpConfetti />
      </Suspense>

      <div className="app-container" style={{ position: 'relative', paddingBottom: '130px' }}>


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
            <Suspense fallback={<LoadingFallback height="80px" />}>
              <PrayerTimeBanner timings={timings} nextPrayer={nextPrayer} />
            </Suspense>

            <Suspense fallback={<LoadingFallback height="60px" />}>
              <HomeHeader 
                locationName={locationName} 
                weather={weather} 
                streakData={streakData} 
              />
            </Suspense>

            <Suspense fallback={<LoadingFallback height="100px" />}>
              <Stories />
            </Suspense>

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

            {showLocationPrompt && !locationConsentGiven && (
              <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(var(--surface-blur))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9998, padding: '20px'
              }}>
                <div className="glass-card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '12px' }}>{t('home.locationRequired')}</h3>
                  <p style={{ marginBottom: '16px', color: '#555', lineHeight: 1.6 }}>{t('home.locationReasonIntro')}</p>
                  <ul style={{ textAlign: 'left', margin: '0 auto 20px', maxWidth: '280px', color: '#444', fontSize: '14px', lineHeight: 1.8 }}>
                    <li>🕌 {t('home.locationPrayer')}</li>
                    <li>🧭 {t('home.locationQibla')}</li>
                    <li>📍 {t('home.locationMosque')}</li>
                    <li>🌤️ {t('home.locationWeather')}</li>
                  </ul>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={() => handleLocationConsent(true)} style={{ flex: 1 }}>{t('home.allowLocation')}</button>
                    <button className="btn" onClick={() => handleLocationConsent(false)} style={{ background: 'rgba(0,0,0,0.1)', flex: 1 }}>{t('home.notNow')}</button>
                  </div>
                </div>
              </div>
            )}

            {timings && nextPrayer && (
              <Suspense fallback={<LoadingFallback height="120px" />}>
                <PrayerCountdown timings={timings} nextPrayer={nextPrayer} />
              </Suspense>
            )}

            <Suspense fallback={<LoadingFallback height="180px" />}>
              <DailyQuests />
            </Suspense>

            <Suspense fallback={<LoadingFallback height="200px" />}>
              <DailyContentGrid dailyContent={dailyContent} />
            </Suspense>

            <Suspense fallback={<LoadingFallback height="150px" />}>
              <NativeAdCard />
            </Suspense>

            <Suspense fallback={<LoadingFallback height="300px" />}>
              <FeatureGrid onSelectFeature={setActiveFeature} />
            </Suspense>
          </>
        )}

        {/* Tabs */}
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

        <Suspense fallback={null}>
          <HamburgerMenu
            onSelectFeature={setActiveFeature}
            currentFeature={activeFeature}
            externalOpen={showHamburgerMenu}
            onClose={() => setShowHamburgerMenu(false)}
            isPro={isProUser}
          />
        </Suspense>

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
    </ErrorBoundary>
  );
}

export default App;
