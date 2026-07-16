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
        <div className="settings-group-title premium-text">{t('settings.legal')}</div>

        <SettingsActionRow
          icon={<Shield size={20} />}
          onClick={onShowPrivacy}
          title={t('settings.privacyPolicy')}
        />

        {showAdPrivacy && (
          <SettingsActionRow
            icon={<SlidersHorizontal size={20} />}
            onClick={() => void showAdPrivacyOptions()}
            title={t('settings.adPrivacyOptions', 'Reklam gizlilik tercihleri')}
          />
        )}

        <SettingsActionRow
          icon={<FileText size={20} />}
          onClick={onShowTerms}
          title={t('settings.termsOfService')}
        />

        <SettingsActionRow
          icon={<Info size={20} />}
          onClick={onShowLicenses}
          title={t('settings.licensesAndCredits')}
        />
      </div>

      <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', padding: '20px' }}>
        {t('app.name')} v{APP_VERSION}
      </div>
    </>
  );
}

export default SettingsLegalSection;
