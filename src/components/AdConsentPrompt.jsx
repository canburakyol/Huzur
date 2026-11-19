import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { storageService } from '../services/storageService';
import { getPrivacyConsentSnapshot, updateAdsConsent } from '../services/privacyConsentStore';
import './AdConsentPrompt.css';

export const AD_CONSENT_DECIDED_KEY = 'huzur_ad_consent_decided_v1';

function AdConsentPrompt() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(
    () => !storageService.getBoolean(AD_CONSENT_DECIDED_KEY, false)
      && !getPrivacyConsentSnapshot().adsEnabled
  );

  if (!isVisible) return null;

  const saveChoice = (adsEnabled) => {
    updateAdsConsent({ adsEnabled, personalizedAdsEnabled: false });
    storageService.setBoolean(AD_CONSENT_DECIDED_KEY, true);
    setIsVisible(false);
  };

  return (
    <div className="ad-consent-backdrop" role="presentation">
      <section
        className="ad-consent-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ad-consent-title"
      >
        <span className="ad-consent-icon" aria-hidden="true">
          <ShieldCheck size={22} />
        </span>
        <p className="ad-consent-eyebrow">{t('adConsent.eyebrow', 'Gizlilik tercihi')}</p>
        <h2 id="ad-consent-title">{t('adConsent.title', 'Ücretsiz deneyimi nasıl sürdürmek istersin?')}</h2>
        <p className="ad-consent-copy">
          {t('adConsent.copy', "Reklamlara izin verirsen Huzur'un ücretsiz özelliklerini desteklersin. İlk tercih olarak kişiselleştirilmemiş reklamlar kullanılır; analiz izni bundan ayrıdır.")}
        </p>
        <div className="ad-consent-actions">
          <button type="button" className="ad-consent-primary" onClick={() => saveChoice(true)}>
            {t('adConsent.allow', 'Reklamlarla devam et')}
          </button>
          <button type="button" className="ad-consent-secondary" onClick={() => saveChoice(false)}>
            {t('adConsent.decline', 'Şimdilik reklamsız devam et')}
          </button>
        </div>
      </section>
    </div>
  );
}

export default AdConsentPrompt;
