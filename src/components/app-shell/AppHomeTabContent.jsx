import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
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
import './home/HomeMushaf.css';

const PremiumHomeHero = lazy(() => import('../PremiumHomeHero'));
const NativeAdCard = lazy(() => import('../NativeAdCard'));

function AppHomeTabContent({
  timings,
  nextPrayer,
  locationName,
  weather,
  streakData,
  dailyContent,
  onOpenInvite,
  onSelectFeature,
  onShowMenu,
  isProUser
}) {
  const { t } = useTranslation();
  const [homeExperience, setHomeExperience] = useState(null);
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
      <header className="home-header">
        <div className="home-header-title">
          <div className="home-header-logo-container">
            <img
              src="/pwa-192x192.png"
              alt="Huzur Logo"
              className="home-header-logo"
            />
          </div>
          <div className="home-welcome-block">
            <span className="home-welcome-subtitle">{t('home.greetingSalam', 'Selamun Aleyküm')}</span>
            <h1 className="home-header-title-text">Huzur</h1>
          </div>
        </div>
        <div className="home-header-actions">
          <button aria-label={t('settings.notifications', 'Bildirimler')} onClick={() => onSelectFeature && onSelectFeature('settings')}>
            <Bell size={22} strokeWidth={1.6} aria-hidden="true" />
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

        <VerseOfTheDay dailyContent={dailyContent} />

        <Suspense fallback={null}>
          <NativeAdCard isProUser={isProUser} />
        </Suspense>

        <QuickAccessGrid onSelectFeature={handleSelectFeature} onShowMenu={onShowMenu} />

        {shouldShowFirstActivation ? (
          <FirstActivationCard onSelectFeature={handleSelectFeature} />
        ) : null}

        <DailyInsight dailyContent={dailyContent} />
      </main>
    </div>
  );
}

export default AppHomeTabContent;
