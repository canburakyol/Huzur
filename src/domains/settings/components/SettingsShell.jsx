import { useTranslation } from 'react-i18next';

import CancelFlowModal from '../../../components/CancelFlowModal';
import LicensesCredits from '../../../components/LicensesCredits';
import PrivacyPolicy from '../../../components/PrivacyPolicy';
import TermsOfService from '../../../components/TermsOfService';
import { useAiHealthPanel } from '../hooks/useAiHealthPanel';
import { useSettingsState } from '../hooks/useSettingsState';
import SettingsAccessSection from './SettingsAccessSection';
import SettingsAiHealthPanel from './SettingsAiHealthPanel';
import SettingsBasicsSection from './SettingsBasicsSection';
import SettingsHeader from './SettingsHeader';
import SettingsHistoryScreen from './SettingsHistoryScreen';
import SettingsLegalSection from './SettingsLegalSection';
import SettingsMiniLeagueSection from './SettingsMiniLeagueSection';
import SettingsNotificationSection from './SettingsNotificationSection';

function SettingsShell({ onClose }) {
  const { t, i18n } = useTranslation();
  const settingsState = useSettingsState({ i18n, onClose });
  const aiHealthPanel = useAiHealthPanel();

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
        title={t('settings.historyTitle', 'Bildirim Gecmisi')}
      />
    );
  }

  return (
    <div className="settings-container reveal-stagger">
      <SettingsHeader onClose={onClose} title={t('settings.title')} />

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

      <SettingsAiHealthPanel
        aiGlobalReleaseStatus={aiHealthPanel.aiGlobalReleaseStatus}
        aiHealthSummary={aiHealthPanel.aiHealthSummary}
        aiIncidentSummary={aiHealthPanel.aiIncidentSummary}
        aiOpsChecklist={aiHealthPanel.aiOpsChecklist}
        aiReleaseBrief={aiHealthPanel.aiReleaseBrief}
        globalReleaseTheme={aiHealthPanel.globalReleaseTheme}
        overallHealthTheme={aiHealthPanel.overallHealthTheme}
        releaseBriefTheme={aiHealthPanel.releaseBriefTheme}
        releaseReadiness={aiHealthPanel.releaseReadiness}
        releaseReadinessTheme={aiHealthPanel.releaseReadinessTheme}
        rolloutGate={aiHealthPanel.rolloutGate}
        rolloutGateTheme={aiHealthPanel.rolloutGateTheme}
        surfacePalette={aiHealthPanel.surfacePalette}
      />

      <SettingsLegalSection
        onShowLicenses={() => settingsState.openOverlay('licenses')}
        onShowPrivacy={() => settingsState.openOverlay('privacy')}
        onShowTerms={() => settingsState.openOverlay('terms')}
        t={t}
      />
    </div>
  );
}

export default SettingsShell;
