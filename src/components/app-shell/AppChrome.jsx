import { Suspense, lazy } from 'react';
import AppHomeTabContent from './AppHomeTabContent';
import AppOverlays from './AppOverlays';

const BottomNav = lazy(() => import('../BottomNav'));
const HamburgerMenu = lazy(() => import('../HamburgerMenu'));
const WelcomeBackBonus = lazy(() => import('../WelcomeBackBonus'));
const WeeklyReportModal = lazy(() => import('../gamification/WeeklyReportModal'));
const AppTabRouter = lazy(() => import('./AppTabRouter'));

function AppChrome({ controller }) {
  const {
    t,
    isFocusMode,
    hasBlockingOverlay,
    navigation,
    streak,
    prayer,
    location,
    appInit,
    dailyContent,
    growthOnboarding
  } = controller;

  return (
    <>
      <AppOverlays
        showSplash={navigation.showSplash}
        onHideSplash={navigation.hideSplash}
        showGrowthOnboarding={growthOnboarding.showGrowthOnboarding}
        onboardingStep={growthOnboarding.onboardingStep}
        onboardingConfig={growthOnboarding.onboardingConfig}
        onboardingLanguage={growthOnboarding.onboardingLanguage}
        onboardingReferralProgress={growthOnboarding.referralProgress}
        onboardingReferralServerSnapshot={growthOnboarding.referralServerSnapshot}
        onboardingIsProUser={appInit.isProUser}
        onSelectGrowthLanguage={growthOnboarding.handleGrowthLanguageSelect}
        onRequestGrowthLocation={growthOnboarding.handleGrowthLocationRequest}
        onRequestGrowthNotifications={growthOnboarding.handleGrowthNotificationRequest}
        onChangeGrowthStep={growthOnboarding.setOnboardingStep}
        onCompleteGrowth={growthOnboarding.handleGrowthComplete}
        streak24hRecovery={streak.streak24hRecovery}
        onConfirm24hRecovery={streak.handleConfirm24hRecovery}
        onWatchRewarded24hRecovery={streak.handleRewarded24hRecovery}
        onClose24hRecovery={() => streak.setStreak24hRecovery(null)}
        isProUser={appInit.isProUser}
        showInviteModal={navigation.showInviteModal}
        inviteModalContext={navigation.inviteModalContext}
        onCloseInvite={navigation.closeInviteModal}
        showMoodSelector={navigation.showMoodSelector}
        onCloseMoodSelector={() => navigation.setShowMoodSelector(false)}
        newBadge={appInit.newBadge}
        onClearBadge={appInit.clearBadge}
        t={t}
        protectionTarget={streak.protectionTarget}
        onCloseProtection={() => streak.setProtectionTarget(null)}
        onUseProtectionToken={streak.handleUseProtectionToken}
      />

      <Suspense fallback={null}>
        <WelcomeBackBonus />
        <WeeklyReportModal
          onOpenInvite={(source = 'weekly_report_referral') => navigation.openInviteModal({ source })}
        />
      </Suspense>

      {!hasBlockingOverlay && (
        <div className="app-container" style={{ position: 'relative', paddingBottom: '130px' }}>
          {navigation.activeTab === 'home' && (
            <AppHomeTabContent
              loading={prayer.loading}
              error={prayer.error}
              fetchPrayerTimes={prayer.fetchPrayerTimes}
              t={t}
              timings={prayer.timings}
              nextPrayer={prayer.nextPrayer}
              locationName={location.locationName}
              weather={location.weather}
              streakData={appInit.streakData}
              onOpenInvite={(source = 'home_hero') => navigation.openInviteModal({ source })}
              dailyContent={dailyContent}
              onSelectFeature={navigation.setActiveFeature}
              isProUser={appInit.isProUser}
            />
          )}

          <Suspense fallback={null}>
            <AppTabRouter
              activeTab={navigation.activeTab}
              setActiveTab={navigation.setActiveTab}
              onSelectFeature={navigation.setActiveFeature}
              timings={prayer.timings}
              nextPrayer={prayer.nextPrayer}
              locationName={location.locationName}
              streakData={appInit.streakData}
              dailyContent={dailyContent}
              isProUser={appInit.isProUser}
              onOpenInvite={(source = 'assistant_referral') => navigation.openInviteModal({ source })}
            />
          </Suspense>

          <Suspense fallback={null}>
            <HamburgerMenu
              onSelectFeature={navigation.setActiveFeature}
              currentFeature={navigation.activeFeature}
              externalOpen={navigation.showHamburgerMenu}
              onClose={() => navigation.setShowHamburgerMenu(false)}
              isPro={appInit.isProUser}
            />
          </Suspense>

          {!isFocusMode && (
            <Suspense fallback={null}>
              <BottomNav
                activeTab={navigation.activeTab}
                setActiveTab={navigation.setActiveTab}
                onShowMenu={() => navigation.setShowHamburgerMenu(true)}
              />
            </Suspense>
          )}
        </div>
      )}
    </>
  );
}

export default AppChrome;
