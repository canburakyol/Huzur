import { useEffect, useState } from 'react';
import { FileText, Info, Shield, SlidersHorizontal } from 'lucide-react';

import { APP_VERSION } from '../../../constants';
import {
  AD_PRIVACY_OPTIONS_STATUS_EVENT,
  isAdPrivacyOptionsRequired,
  showAdPrivacyOptions
} from '../../../services/admobService';
import SettingsActionRow from './SettingsActionRow';

function SettingsLegalSection({ onShowLicenses, onShowPrivacy, onShowTerms, t }) {
  const [showAdPrivacy, setShowAdPrivacy] = useState(() => isAdPrivacyOptionsRequired());

  useEffect(() => {
    const handleStatusChange = (event) => setShowAdPrivacy(event.detail?.required === true);
    window.addEventListener(AD_PRIVACY_OPTIONS_STATUS_EVENT, handleStatusChange);
    return () => window.removeEventListener(AD_PRIVACY_OPTIONS_STATUS_EVENT, handleStatusChange);
  }, []);

  return (
    <>
      <div className="settings-group">
        <div className="settings-group-title hz-overline">{t('settings.legal')}</div>

        <SettingsActionRow
          icon={<Shield size={20} strokeWidth={1.75} />}
          onClick={onShowPrivacy}
          title={t('settings.privacyPolicy')}
        />

        {showAdPrivacy && (
          <SettingsActionRow
            icon={<SlidersHorizontal size={20} strokeWidth={1.75} />}
            onClick={() => void showAdPrivacyOptions()}
            title={t('settings.adPrivacyOptions', 'Reklam gizlilik tercihleri')}
          />
        )}

        <SettingsActionRow
          icon={<FileText size={20} strokeWidth={1.75} />}
          onClick={onShowTerms}
          title={t('settings.termsOfService')}
        />

        <SettingsActionRow
          icon={<Info size={20} strokeWidth={1.75} />}
          onClick={onShowLicenses}
          title={t('settings.licensesAndCredits')}
        />
      </div>

      <p className="hz-label" style={{ margin: 0, textAlign: 'center' }}>
        {t('app.name')} v{APP_VERSION}
      </p>
    </>
  );
}

export default SettingsLegalSection;
