import { AlertCircle, Shield } from 'lucide-react';

import SettingsActionRow from './SettingsActionRow';

function SettingsAccessSection({ onManageSubscription, onOpenFeature, t, userIsPro }) {
  return (
    <>
      <div className="settings-group">
        <div className="settings-group-title premium-text">{t('settings.proFeatures', 'Premium Ozellikler')}</div>
        <SettingsActionRow
          description={t('settings.removeAdsDesc')}
          icon={<Shield size={20} />}
          iconStyle={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)' }}
          onClick={() => onOpenFeature('pro')}
          title={t('settings.removeAdsTitle')}
        />
      </div>

      {userIsPro ? (
        <div className="settings-group">
          <div className="settings-group-title premium-text">
            {t('settings.subscriptionManagement', 'Abonelik Yonetimi')}
          </div>
          <SettingsActionRow
            chevronColor="rgba(239, 68, 68, 0.4)"
            description={t('settings.cancelSubscriptionDesc', 'Huzur Pro aboneliginizi sonlandirin.')}
            icon={<AlertCircle size={20} />}
            iconStyle={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error-color)' }}
            onClick={onManageSubscription}
            style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
            title={t('settings.cancelSubscription', 'Aboneligi Iptal Et')}
            titleStyle={{ color: 'var(--error-color)' }}
          />
        </div>
      ) : null}
    </>
  );
}

export default SettingsAccessSection;
