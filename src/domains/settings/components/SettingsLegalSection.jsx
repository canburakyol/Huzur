import { FileText, Info, Shield } from 'lucide-react';

import { APP_VERSION } from '../../../constants';
import SettingsActionRow from './SettingsActionRow';

function SettingsLegalSection({ onShowLicenses, onShowPrivacy, onShowTerms, t }) {
  return (
    <>
      <div className="settings-group">
        <div className="settings-group-title premium-text">{t('settings.legal')}</div>

        <SettingsActionRow
          icon={<Shield size={20} />}
          onClick={onShowPrivacy}
          title={t('settings.privacyPolicy')}
        />

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
