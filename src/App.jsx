import { Suspense, lazy, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from './components/ErrorBoundary';

// Custom Hooks
import { useBackButton } from './hooks/useBackButton';
import { usePrayerTimes, useStickyNotification, useAndroidWidget } from './hooks/usePrayerTimes';
import { useLocationConsent } from './hooks/useLocationConsent';
import { useAppInit } from './hooks/useAppInit';
import { useDailyContent } from './hooks/useDailyContent';
import { useDirection } from './hooks/useDirection';
import { useFocus } from './context/FocusContext';
import { useDeepLinkBridge } from './hooks/app-shell/useDeepLinkBridge';
import { useBootstrapEffects } from './hooks/app-shell/useBootstrapEffects';
import { useStreakGuards } from './hooks/app-shell/useStreakGuards';
import { useNavigationState } from './hooks/app-shell/useNavigationState';
import { useGrowthOnboardingFlow } from './hooks/app-shell/useGrowthOnboardingFlow';
import { useRuntimeAutoLocalization } from './hooks/useRuntimeAutoLocalization';
import AppOverlays from './components/app-shell/AppOverlays';
import AppHomeTabContent from './components/app-shell/AppHomeTabContent';
import AppTabRouter from './components/app-shell/AppTabRouter';
import './components/Navigation.css';

// Components - Lazy loaded for performance
const FeatureManager = lazy(() => import('./components/FeatureManager'));
const BottomNav = lazy(() => import('./components/BottomNav'));
const HamburgerMenu = lazy(() => import('./components/HamburgerMenu'));

function App() {
  const { t } = useTranslation();
  const { isFocusMode } = useFocus();

  const {
    activeFeature,
    setActiveFeature,
    activeTab,
    setActiveTab,
    showHamburgerMenu,
    setShowHamburgerMenu,
    showMoodSelector,
    setShowMoodSelector,
    showSplash,
    showInviteModal,
    setShowInviteModal,
    hideSplash
  } = useNavigationState();

  const {
    protectionTarget,
    setProtectionTarget,
    streak24hRecovery,
    setStreak24hRecovery,
    handleConfirm24hRecovery,
    handleUseProtectionToken
  } = useStreakGuards();

  // Prayer Times Hook
  const {
    timings,
    nextPrayer,
    loading,
    error,
    _showWelcome,
    fetchPrayerTimes,
    handleEnableNotifications,
    _handleCloseWelcome
  } = usePrayerTimes();

  // Location & Weather Hook
  const handleLocationUpdate = useCallback((coords) => {
    fetchPrayerTimes(coords);
  }, [fetchPrayerTimes]);

  const {
    weather,
    locationName,
    _showLocationPrompt,
    _locationConsentGiven,
    handleLocationConsent
  } = useLocationConsent(handleLocationUpdate);

  // App Initialization Hook
  const { streakData, newBadge, clearBadge, isProUser } = useAppInit(timings);

  // Daily Content Hook
  const { dailyContent } = useDailyContent();

  // RTL/LTR Direction Hook
  useDirection();
  useRuntimeAutoLocalization();

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

  useBootstrapEffects();
  useDeepLinkBridge();

  const {
    showGrowthOnboarding,
    onboardingLanguage,
    handleGrowthLanguageSelect,
    handleGrowthLocationRequest,
    handleGrowthNotificationRequest,
    handleGrowthComplete
  } = useGrowthOnboardingFlow({
    handleLocationConsent,
    handleEnableNotifications,
    setActiveTab
  });

  // Render Active Feature Overlay
  if (activeFeature) {
    return (
      <div data-i18n-autolocalize="true">
        <Suspense fallback={<div className="loading-overlay">Yükleniyor...</div>}>
          <FeatureManager 
            activeFeature={activeFeature} 
            setActiveFeature={setActiveFeature} 
            locationName={locationName} 
          />
        </Suspense>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div data-i18n-autolocalize="true">
        <AppOverlays
          showSplash={showSplash}
          onHideSplash={hideSplash}
          showGrowthOnboarding={showGrowthOnboarding}
          onboardingLanguage={onboardingLanguage}
          onSelectGrowthLanguage={handleGrowthLanguageSelect}
          onRequestGrowthLocation={handleGrowthLocationRequest}
          onRequestGrowthNotifications={handleGrowthNotificationRequest}
          onCompleteGrowth={handleGrowthComplete}
          streak24hRecovery={streak24hRecovery}
          onConfirm24hRecovery={handleConfirm24hRecovery}
          onClose24hRecovery={() => setStreak24hRecovery(null)}
          showInviteModal={showInviteModal}
          onCloseInvite={() => setShowInviteModal(false)}
          showMoodSelector={showMoodSelector}
          onCloseMoodSelector={() => setShowMoodSelector(false)}
          newBadge={newBadge}
          onClearBadge={clearBadge}
          t={t}
          protectionTarget={protectionTarget}
          onCloseProtection={() => setProtectionTarget(null)}
          onUseProtectionToken={handleUseProtectionToken}
        />

        <div className="app-container" style={{ position: 'relative', paddingBottom: '130px' }}>
          {activeTab === 'home' && (
            <AppHomeTabContent
              loading={loading}
              error={error}
              fetchPrayerTimes={fetchPrayerTimes}
              t={t}
              timings={timings}
              nextPrayer={nextPrayer}
              locationName={locationName}
              weather={weather}
              streakData={streakData}
              onOpenInvite={() => setShowInviteModal(true)}
              dailyContent={dailyContent}
              onSelectFeature={setActiveFeature}
            />
          )}

          <AppTabRouter
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

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
      </div>
    </ErrorBoundary>
  );
}

export default App;
