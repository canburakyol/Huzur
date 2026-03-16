import { Suspense, lazy } from 'react';

const SplashScreen = lazy(() => import('../SplashScreen'));
const GrowthOnboarding = lazy(() => import('../GrowthOnboarding'));
const Streak24hRecoveryModal = lazy(() => import('../Streak24hRecoveryModal'));
const InviteModal = lazy(() => import('../InviteModal'));
const MoodSelector = lazy(() => import('../MoodSelector'));
const StreakProtectionModal = lazy(() => import('../StreakProtectionModal'));
const LevelUpConfetti = lazy(() => import('../LevelUpConfetti'));

function AppOverlays({
  showSplash,
  onHideSplash,
  showGrowthOnboarding,
  onboardingStep,
  onboardingLanguage,
  onSelectGrowthLanguage,
  onRequestGrowthLocation,
  onRequestGrowthNotifications,
  onChangeGrowthStep,
  onCompleteGrowth,
  streak24hRecovery,
  onConfirm24hRecovery,
  onWatchRewarded24hRecovery,
  onClose24hRecovery,
  isProUser,
  showInviteModal,
  onCloseInvite,
  showMoodSelector,
  onCloseMoodSelector,
  newBadge,
  onClearBadge,
  t,
  protectionTarget,
  onCloseProtection,
  onUseProtectionToken
}) {
  return (
    <>
      {showSplash && (
        <Suspense fallback={null}>
          <SplashScreen onHide={onHideSplash} />
        </Suspense>
      )}

      {showGrowthOnboarding && !showSplash && (
        <Suspense fallback={null}>
          <GrowthOnboarding
            initialStep={onboardingStep}
            initialLanguage={onboardingLanguage}
            onSelectLanguage={onSelectGrowthLanguage}
            onRequestLocation={onRequestGrowthLocation}
            onRequestNotifications={onRequestGrowthNotifications}
            onStepChange={onChangeGrowthStep}
            onComplete={onCompleteGrowth}
          />
        </Suspense>
      )}

      {!!streak24hRecovery && (
        <Suspense fallback={null}>
          <Streak24hRecoveryModal
            isOpen={!!streak24hRecovery}
            categoryName="Namaz"
            deadline={streak24hRecovery.deadline}
            onConfirm={onConfirm24hRecovery}
            onWatchRewardedRecovery={onWatchRewarded24hRecovery}
            requiresRewardedAd={!isProUser}
            onClose={onClose24hRecovery}
          />
        </Suspense>
      )}

      {showInviteModal && (
        <Suspense fallback={null}>
          <InviteModal
            isOpen={showInviteModal}
            onClose={onCloseInvite}
          />
        </Suspense>
      )}

      {showMoodSelector && (
        <Suspense fallback={null}>
          <MoodSelector onClose={onCloseMoodSelector} />
        </Suspense>
      )}

      {newBadge && (
        <div className="badge-celebration-overlay" onClick={onClearBadge}>
          <div className="badge-celebration" onClick={(e) => e.stopPropagation()}>
            <div className="badge-emoji">{newBadge.emoji}</div>
            <div className="badge-title">{newBadge.title}</div>
            <div className="badge-message">{newBadge.message}</div>
            <button className="badge-close-btn" onClick={onClearBadge}>{t('home.awesome')}</button>
          </div>
        </div>
      )}

      {protectionTarget && (
        <Suspense fallback={null}>
          <StreakProtectionModal
            isOpen={!!protectionTarget}
            onClose={onCloseProtection}
            categoryName={protectionTarget.category === 'prayer' ? 'Namaz' : protectionTarget.category}
            categoryData={protectionTarget.data}
            onUseToken={onUseProtectionToken}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <LevelUpConfetti />
      </Suspense>
    </>
  );
}

export default AppOverlays;
