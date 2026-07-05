import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import FirstActivationCard from './home/FirstActivationCard';
import LoadingFallback from './home/LoadingFallback';
import VerseOfTheDay from './home/VerseOfTheDay';
import QuickAccessGrid from './home/QuickAccessGrid';
import DailyInsight from './home/DailyInsight';
import { useHomeFeedState } from '../../hooks/app-shell/useHomeFeedState';
import { ANALYTICS_EVENTS, logEvent } from '../../services/analyticsService';
import {
  FIRST_IBADAH_ACTION_COMPLETED_EVENT,
  hasCompletedFirstIbadahAction,
} from '../../services/activationService';
import {
  DEFAULT_HOME_EXPERIENCE_CONFIG,
  loadHomeExperienceConfig,
} from '../../services/homeExperienceConfigService';
import './home/HomeFresh.css';
import NavigationUpdateNotice from './NavigationUpdateNotice';
import { STORAGE_KEYS } from '../../constants';
import { storageService } from '../../services/storageService';

const PremiumHomeHero = lazy(() => import('../PremiumHomeHero'));

function AppHomeTabContent({
  timings,
  nextPrayer,
  locationName,
  weather,
  streakData,
  dailyContent,
  onOpenInvite,
  onSelectFeature,
  isProUser
}) {

  const [homeExperience, setHomeExperience] = useState(null);
  const [showNavigationUpdate, setShowNavigationUpdate] = useState(() => (
    storageService.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, false)
    && !storageService.getBoolean(STORAGE_KEYS.NAVIGATION_UPDATE_V1_SEEN, false)
  ));
  const [firstActivationCompleted, setFirstActivationCompleted] = useState(() => hasCompletedFirstIbadahAction());
  const resolvedHomeExperience = homeExperience || DEFAULT_HOME_EXPERIENCE_CONFIG;
  const shouldShowFirstActivation = !firstActivationCompleted;
  const { recoveryPlan } = useHomeFeedState({
    timings,
    nextPrayer,
    locationName,
    streakData,
    dailyContent,
    isProUser,
    onOpenInvite,
    referralSurfaceEnabled: false
  });

  const handleSelectFeature = useCallback((feature, source) => {
    onSelectFeature(feature, source);
  }, [onSelectFeature]);

  const acknowledgeNavigationUpdate = useCallback(() => {
    storageService.setBoolean(STORAGE_KEYS.NAVIGATION_UPDATE_V1_SEEN, true);
    setShowNavigationUpdate(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadHomeExperienceConfig().then((config) => {
      if (isMounted) {
        setHomeExperience(config);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleFirstIbadahCompleted = () => {
      setFirstActivationCompleted(true);
    };

    window.addEventListener(FIRST_IBADAH_ACTION_COMPLETED_EVENT, handleFirstIbadahCompleted);
    return () => {
      window.removeEventListener(FIRST_IBADAH_ACTION_COMPLETED_EVENT, handleFirstIbadahCompleted);
    };
  }, []);

  useEffect(() => {
    if (!homeExperience) return;

    logEvent(ANALYTICS_EVENTS.HOME_VIEWED, {
      has_daily_content: Boolean(dailyContent),
      is_pro: isProUser === true,
      recovery_band: recoveryPlan?.riskBand || 'steady',
      first_activation_completed: firstActivationCompleted,
      home_variant: resolvedHomeExperience.variant,
      home_experiment_variant: resolvedHomeExperience.experimentVariant,
      home_config_source: resolvedHomeExperience.source,
      home_config_enabled: resolvedHomeExperience.enabled === true
    });
    logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
      screen_name: 'tab_home',
      screen_class: 'tab_home',
      screen_title: 'Home',
      screen_type: 'tab',
      tab: 'home',
      source: 'home_render',
      has_daily_content: Boolean(dailyContent),
      is_pro: isProUser === true,
      recovery_band: recoveryPlan?.riskBand || 'steady',
      first_activation_completed: firstActivationCompleted,
      home_variant: resolvedHomeExperience.variant,
      home_experiment_variant: resolvedHomeExperience.experimentVariant,
      home_config_source: resolvedHomeExperience.source,
      home_config_enabled: resolvedHomeExperience.enabled === true
    });
  }, [dailyContent, firstActivationCompleted, homeExperience, isProUser, recoveryPlan?.riskBand, resolvedHomeExperience]);

  return (
    <div className="home-redesign-container animate-fadeIn">
      {showNavigationUpdate ? (
        <NavigationUpdateNotice onAcknowledge={acknowledgeNavigationUpdate} />
      ) : null}

      <header className="home-header">
        <div className="home-header-title">
          <div className="home-header-logo-container">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB2Vnwfe5Ik83esNAEHbGmy-lvEk2-aDGYcg4y3hDD6tnpLhr3gRq9QsJQCpV7XNL-RDsi19N93-Kid8wlhB8OTR1QVr8-t76vEWo548cr0muD5b2uJycoW87sqMExVd-fgI_VtqQgoLdmsB3brqhcElcg9NnJaK_KGLAySIahDt0zp21GXw8c3YaqQoSXURD1_0cJxEjUeWOCiTKVV0vm390KWEHucW4JgRghi1ahpsMpUZ5VZkcdilQGXrrsZB3USwWli0pV6HWx"
              alt="Huzur Logo"
              className="home-header-logo"
            />
          </div>
          <div className="home-welcome-block">
            <span className="home-welcome-subtitle">Selamun Aleyküm</span>
            <h1 className="home-header-title-text">Huzur</h1>
          </div>
        </div>
        <div className="home-header-actions">
          <button aria-label="Bildirimler" onClick={() => onSelectFeature && onSelectFeature('settings')}>
            <span className="material-symbols-outlined font-light">notifications</span>
          </button>
        </div>
      </header>

      <main className="home-main-content">
        <Suspense fallback={<LoadingFallback height="220px" />}>
          <PremiumHomeHero
            locationName={locationName}
            weather={weather}
            streakData={streakData}
            onOpenInvite={onOpenInvite}
            timings={timings}
            nextPrayer={nextPrayer}
            recoveryPlan={recoveryPlan}
            onSelectFeature={handleSelectFeature}
            dailyContent={dailyContent}
          />
        </Suspense>

        <QuickAccessGrid onSelectFeature={handleSelectFeature} />

        <VerseOfTheDay dailyContent={dailyContent} />

        {shouldShowFirstActivation ? (
          <FirstActivationCard onSelectFeature={handleSelectFeature} />
        ) : null}

        <DailyInsight dailyContent={dailyContent} />
      </main>
    </div>
  );
}

export default AppHomeTabContent;
