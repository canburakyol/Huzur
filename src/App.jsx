import { useState, Suspense, lazy, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getTodayProgress } from './services/dailyTasksService';
import { Settings as SettingsIcon, Heart, Sparkles } from 'lucide-react';

// Custom Hooks
import { useBackButton } from './hooks/useBackButton';
import { usePrayerTimes, useStickyNotification, useAndroidWidget } from './hooks/usePrayerTimes';
import { useLocationConsent } from './hooks/useLocationConsent';
import { useAppInit } from './hooks/useAppInit';
import { useDailyContent } from './hooks/useDailyContent';
import { useDirection } from './hooks/useDirection';

// Components
import FeatureManager from './components/FeatureManager';
import SplashScreen from './components/SplashScreen';
import BottomNav from './components/BottomNav';
import HomeHeader from './components/HomeHeader';
import DailyContentGrid from './components/DailyContentGrid';
import FeatureGrid from './components/FeatureGrid';
import AdPopup from './components/AdPopup';

// Lazy Load Components
const Stories = lazy(() => import('./components/Stories'));
const Prayers = lazy(() => import('./components/Prayers'));
const Quran = lazy(() => import('./components/Quran'));
const PrayerCountdown = lazy(() => import('./components/PrayerCountdown'));
const Assistant = lazy(() => import('./components/Assistant'));
const Community = lazy(() => import('./components/Community'));
const HamburgerMenu = lazy(() => import('./components/HamburgerMenu'));
const MoodSelector = lazy(() => import('./components/MoodSelector'));

function App() {
  const { t } = useTranslation();
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

  // Render Active Feature Overlay
  if (activeFeature) {
    return <FeatureManager activeFeature={activeFeature} setActiveFeature={setActiveFeature} />;
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
        
        {/* Settings Button - Only show on Home tab */}
        {activeTab === 'home' && (
          <button
            onClick={() => setActiveFeature('settings')}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6c757d', zIndex: 10
            }}
          >
            <SettingsIcon size={24} />
          </button>
        )}

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
            {/* Besmele */}
            <div style={{
              textAlign: 'center', fontFamily: "'Amiri', 'Scheherazade', serif",
              fontSize: '26px', color: 'var(--primary-color)',
              marginTop: '15px', marginBottom: '5px', fontWeight: 'bold'
            }}>
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
            </div>

            {/* Header: Location, Weather & Streak */}
            <HomeHeader 
              locationName={locationName} 
              weather={weather} 
              streakData={streakData} 
            />

            {/* Mood Selector Trigger */}
            <div style={{ padding: '0 5px', marginBottom: '20px' }}>
              <button 
                onClick={() => setShowMoodSelector(true)}
                className="glass-card"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '12px', padding: '15px',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                  border: '1px solid var(--glass-border)', borderRadius: '16px', cursor: 'pointer'
                }}
              >
                <div style={{ 
                  width: '40px', height: '40px', background: 'var(--primary-color)', 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Heart size={20} color="white" fill="white" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-color)', fontSize: '15px' }}>{t('home.moodQuestion')}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-color-muted)' }}>{t('home.moodSubtitle')}</div>
                </div>
                <Sparkles size={20} color="var(--primary-color)" style={{ marginLeft: 'auto' }} />
              </button>
            </div>

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

            {/* Daily Tasks Widget */}
            <div 
              className="glass-card daily-tasks-widget"
              onClick={() => setActiveFeature('dailyTasks')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', marginBottom: '16px', cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)', transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '28px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '12px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🎯
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-color)' }}>{t('home.dailyTasks')}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-color-muted)', marginTop: '2px' }}>{t('home.dailyTasksSubtitle')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
                <div style={{ width: '40px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(() => { try { return getTodayProgress().percentage; } catch { return 0; } })()}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #3b82f6)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-color)' }}>
                  {(() => { try { const p = getTodayProgress(); return `${p.completed}/${p.total}`; } catch { return '0/5'; } })()}
                </span>
              </div>
            </div>

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
            <Assistant onClose={() => setActiveTab('home')} />
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
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onShowMenu={() => setShowHamburgerMenu(true)} 
        />
      </div>
    </>
  );
}

export default App;
