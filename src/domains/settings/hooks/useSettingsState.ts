import { useCallback, useEffect, useMemo, useState } from 'react';

import { changeLanguage, getSupportedLanguages } from '../../../services/languageService';
import { buildMiniLeagueSnapshot, getMiniLeaguePreferences, updateMiniLeaguePreferences } from '../../../services/miniLeagueService';
import { logMiniLeagueOptedIn } from '../../../services/analyticsService';
import { requestNotificationPermission } from '../../../services/smartNotificationService';
import { syncProStatusFromServer } from '../../../services/subscriptionSyncService';
import { buildWeeklySocialSummary } from '../../../services/weeklySocialService';
import { isPro } from '../../../services/proService';
import { logger } from '../../../utils/logger';
import { useAppStore } from '../../../stores/useAppStore';

const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

const applyTheme = (isDarkMode: boolean) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.setAttribute('data-theme', isDarkMode ? THEME_DARK : THEME_LIGHT);
};

interface UseSettingsStateProps {
  i18n: { language?: string };
  onClose?: () => void;
}

interface MiniLeaguePreferences {
  optedIn: boolean;
  visibilityMode: 'private' | 'group' | 'league';
}

export function useSettingsState({ i18n, onClose }: UseSettingsStateProps) {
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [miniLeaguePreferences, setMiniLeaguePreferences] = useState<MiniLeaguePreferences | null>(null);

  const darkMode = useAppStore((s) => s.settings.theme === 'dark');
  const setTheme = useAppStore((s) => s.setTheme);
  const stickyNotification = useAppStore((s) => s.settings.stickyNotification);
  const setStickyNotification = useAppStore((s) => s.setStickyNotification);

  const userIsPro = isPro();
  const currentLang = i18n.language?.split('-')[0] || 'tr';
  const supportedLanguages = useMemo(() => getSupportedLanguages(), []);

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  useEffect(() => {
    let isMounted = true;

    const loadMiniLeaguePreferences = async () => {
      const preferences = await getMiniLeaguePreferences();
      if (isMounted) {
        setMiniLeaguePreferences(preferences);
      }
    };

    void loadMiniLeaguePreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  const miniLeagueSummary = useMemo(() => (
    miniLeaguePreferences
      ? buildMiniLeagueSnapshot(buildWeeklySocialSummary(), miniLeaguePreferences)
      : null
  ), [miniLeaguePreferences]);

  const openOverlay = useCallback((overlayName: string) => {
    setActiveOverlay(overlayName);
  }, []);

  const closeOverlay = useCallback(() => {
    setActiveOverlay(null);
  }, []);

  const openFeature = useCallback((featureKey: string) => {
    onClose?.();
    useAppStore.getState().setActiveFeature(featureKey);
  }, [onClose]);

  const toggleDarkMode = useCallback(() => {
    setTheme(darkMode ? 'light' : 'dark');
    applyTheme(!darkMode);
  }, [darkMode, setTheme]);

  const toggleStickyNotification = useCallback(async () => {
    const nextState = !stickyNotification;
    setStickyNotification(nextState);

    if (nextState) {
      await requestNotificationPermission();
    }
  }, [stickyNotification, setStickyNotification]);

  const handleLanguageChange = useCallback(async (languageCode: string) => {
    await changeLanguage(languageCode);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    window.open('https://play.google.com/store/account/subscriptions', '_blank', 'noopener,noreferrer');

    window.setTimeout(async () => {
      try {
        await syncProStatusFromServer();
      } catch (error) {
        logger.warn('[Settings] Subscription sync failed:', error);
      }
    }, 2000);

    setActiveOverlay(null);
  }, []);

  const handleMiniLeagueToggle = useCallback(async () => {
    if (!miniLeaguePreferences) {
      return;
    }

    const nextPreferences = await updateMiniLeaguePreferences({
      ...miniLeaguePreferences,
      optedIn: !miniLeaguePreferences.optedIn
    });

    setMiniLeaguePreferences(nextPreferences);

    if (nextPreferences.optedIn) {
      logMiniLeagueOptedIn(nextPreferences.visibilityMode);
    }
  }, [miniLeaguePreferences]);

  const handleMiniLeagueVisibilityCycle = useCallback(async () => {
    if (!miniLeaguePreferences?.optedIn) {
      return;
    }

    const order: Array<'private' | 'group' | 'league'> = ['private', 'group', 'league'];
    const currentIndex = order.indexOf(miniLeaguePreferences.visibilityMode);
    const nextVisibilityMode = order[(currentIndex + 1) % order.length];
    const nextPreferences = await updateMiniLeaguePreferences({
      ...miniLeaguePreferences,
      visibilityMode: nextVisibilityMode
    });

    setMiniLeaguePreferences(nextPreferences);
  }, [miniLeaguePreferences]);

  return {
    activeOverlay,
    closeOverlay,
    currentLang,
    darkMode,
    handleConfirmCancel,
    handleLanguageChange,
    handleMiniLeagueToggle,
    handleMiniLeagueVisibilityCycle,
    miniLeaguePreferences,
    miniLeagueSummary,
    openFeature,
    openOverlay,
    stickyNotification,
    supportedLanguages,
    toggleDarkMode,
    toggleStickyNotification,
    userIsPro
  };
}

export default useSettingsState;
