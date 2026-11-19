import { AlertCircle, Shield } from 'lucide-react';

import SettingsActionRow from './SettingsActionRow';

function SettingsAccessSection({ onManageSubscription, onOpenFeature, t, userIsPro }) {
  return (
    <>
      <div className="settings-group">
        <div className="settings-group-title hz-overline">{t('settings.proFeatures', 'Premium Özellikler')}</div>
        <SettingsActionRow
          description={t('settings.removeAdsDesc')}
          icon={<Shield size={20} strokeWidth={1.75} />}
          onClick={() => onOpenFeature('pro')}
          title={t('settings.removeAdsTitle')}
        />
      </div>
      {userIsPro ? (
        <div className="settings-group">
          <div className="settings-group-title hz-overline">
            {t('settings.subscriptionManagement', 'Abonelik Yönetimi')}
          </div>
          <SettingsActionRow
            description={t('settings.cancelSubscriptionDesc', 'Huzur Pro aboneliğinizi sonlandırın.')}
            icon={<AlertCircle size={20} strokeWidth={1.75} />}
            onClick={onManageSubscription}
            title={t('settings.cancelSubscription', 'Aboneliği İptal Et')}
            tone="danger"
          />
        </div>
      ) : null}
    </>
  );
}

export default SettingsAccessSection;
