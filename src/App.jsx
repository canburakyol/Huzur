import { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Custom Hooks
import { useBackButton } from './hooks/useBackButton';
import { usePrayerTimes, useStickyNotification, useAndroidWidget } from './hooks/usePrayerTimes';
import { useLocationConsent } from './hooks/useLocationConsent';
import { useAppInit } from './hooks/useAppInit';
import { useDailyContent } from './hooks/useDailyContent';
import { useDirection } from './hooks/useDirection';
import { useFocus } from './context/FocusContext';

// Components
const FeatureManager = lazy(() => import('./components/FeatureManager'));
import SplashScreen from './components/SplashScreen';
import BottomNav from './components/BottomNav';
import HomeHeader from './components/HomeHeader';
import DailyContentGrid from './components/DailyContentGrid';
import FeatureGrid from './components/FeatureGrid';
import AdPopup from './components/AdPopup';
import NativeAdCard from './components/NativeAdCard';
import PrayerTimeBanner from './components/PrayerTimeBanner';

// Lazy Load Components
const Stories = lazy(() => import('./components/Stories'));
const Prayers = lazy(() => import('./components/Prayers'));
const Quran = lazy(() => import('./components/Quran'));
const PrayerCountdown = lazy(() => import('./components/PrayerCountdown'));
const SpiritualCoach = lazy(() => import('./components/SpiritualCoach'));
const Community = lazy(() => import('./components/Community'));
const HamburgerMenu = lazy(() => import('./components/HamburgerMenu'));
const MoodSelector = lazy(() => import('./components/MoodSelector'));

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
    <>
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onHide={() => {
          sessionStorage.setItem('splashShown', 'true');
          setShowSplash(false);
        }} />
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
        <AdPopup />

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
            <PrayerTimeBanner timings={timings} nextPrayer={nextPrayer} />

            {/* Header: Location, Weather & Streak */}
            <HomeHeader 
              locationName={locationName} 
              weather={weather} 
              streakData={streakData} 
            />

            {/* Stories Section */}
            <Suspense fallback={<div style={{ height: '100px' }}></div>}>
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
              <Suspense fallback={<div></div>}>
                <PrayerCountdown timings={timings} nextPrayer={nextPrayer} />
              </Suspense>
            )}

            {/* Daily Content Grid */}
            <DailyContentGrid dailyContent={dailyContent} />

            {/* Native Advanced Ad */}
            <NativeAdCard />

            {/* Feature Grid */}
            <FeatureGrid onSelectFeature={setActiveFeature} />
          </>
        )}

        {/* Tab Contents */}
        {activeTab === 'prayers' && (
          <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading')}</div>}>
            <Prayers onClose={() => setActiveTab('home')} />
          </Suspense>
        )}
        {activeTab === 'quran' && (
          <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading')}</div>}>
            <Quran onClose={() => setActiveTab('home')} />
          </Suspense>
        )}
        {activeTab === 'community' && (
          <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading')}</div>}>
            <Community onClose={() => setActiveTab('home')} />
          </Suspense>
        )}
        {activeTab === 'assistant' && (
          <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>{t('common.loading')}</div>}>
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
          <BottomNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onShowMenu={() => setShowHamburgerMenu(true)} 
          />
        )}
      </div>
    </>
  );
}

export default App;
