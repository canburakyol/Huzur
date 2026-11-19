import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import PageHeader from '../../../components/shared/PageHeader';

import CancelFlowModal from '../../onboarding/components/CancelFlowModal';
import LicensesCredits from '../../system/components/LicensesCredits';
import PrivacyPolicy from '../../system/components/PrivacyPolicy';
import TermsOfService from '../../system/components/TermsOfService';
import { useSettingsState } from '../hooks/useSettingsState';
import SettingsAccessSection from './SettingsAccessSection';
import SettingsBasicsSection from './SettingsBasicsSection';
import SettingsHistoryScreen from './SettingsHistoryScreen';
import SettingsLegalSection from './SettingsLegalSection';
import SettingsMiniLeagueSection from './SettingsMiniLeagueSection';
import SettingsNotificationSection from './SettingsNotificationSection';
import './settings.css';

const SettingsAiHealthPanel = import.meta.env.DEV
  ? React.lazy(() => import('./SettingsAiHealthPanel'))
  : () => null;

function SettingsShell({ onClose }) {
  const { t, i18n } = useTranslation();
  const settingsState = useSettingsState({ i18n, onClose });

  if (settingsState.activeOverlay === 'cancelFlow') {
    return (
      <CancelFlowModal
        onClose={settingsState.closeOverlay}
        onConfirmCancel={settingsState.handleConfirmCancel}
      />
    );
  }

  if (settingsState.activeOverlay === 'privacy') {
    return <PrivacyPolicy onClose={settingsState.closeOverlay} />;
  }

  if (settingsState.activeOverlay === 'terms') {
    return <TermsOfService onClose={settingsState.closeOverlay} />;
  }

  if (settingsState.activeOverlay === 'licenses') {
    return <LicensesCredits onClose={settingsState.closeOverlay} />;
  }

  if (settingsState.activeOverlay === 'history') {
    return (
      <SettingsHistoryScreen
        onClose={settingsState.closeOverlay}
        title={t('settings.historyTitle', 'Bildirim Geçmişi')}
      />
    );
  }

  return (
    <div className="app-container hz-root hz-settings">
      <PageHeader title={t('settings.title')} onBack={onClose} />
      <div className="hz-settings__body">

      <SettingsBasicsSection
        currentLang={settingsState.currentLang}
        darkMode={settingsState.darkMode}
        onLanguageChange={settingsState.handleLanguageChange}
        onToggleDarkMode={settingsState.toggleDarkMode}
        supportedLanguages={settingsState.supportedLanguages}
        t={t}
      />

      <SettingsNotificationSection
        onOpenFeature={settingsState.openFeature}
        onShowHistory={() => settingsState.openOverlay('history')}
        onToggleStickyNotification={settingsState.toggleStickyNotification}
        stickyNotification={settingsState.stickyNotification}
        t={t}
      />

      <SettingsMiniLeagueSection
        miniLeaguePreferences={settingsState.miniLeaguePreferences}
        miniLeagueSummary={settingsState.miniLeagueSummary}
        onToggleMiniLeague={settingsState.handleMiniLeagueToggle}
        onToggleVisibility={settingsState.handleMiniLeagueVisibilityCycle}
        t={t}
      />

      <SettingsAccessSection
        onManageSubscription={() => settingsState.openOverlay('cancelFlow')}
        onOpenFeature={settingsState.openFeature}
        t={t}
        userIsPro={settingsState.userIsPro}
      />

      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <SettingsAiHealthPanel />
        </Suspense>
      )}

      <SettingsLegalSection
        onShowLicenses={() => settingsState.openOverlay('licenses')}
        onShowPrivacy={() => settingsState.openOverlay('privacy')}
        onShowTerms={() => settingsState.openOverlay('terms')}
        t={t}
      />
      </div>
    </div>
  );
}

export default SettingsShell;
