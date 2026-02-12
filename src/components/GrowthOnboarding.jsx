import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGE_OPTIONS } from '../config/i18nConfig';

const baseButton = {
  border: 'none',
  borderRadius: 12,
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer'
};

const GrowthOnboarding = ({
  initialStep = 0,
  initialLanguage = 'tr',
  onSelectLanguage,
  onRequestLocation,
  onRequestNotifications,
  onComplete,
  loadingLocation = false,
  loadingNotifications = false
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(initialStep);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const languageOptions = useMemo(() => SUPPORTED_LANGUAGE_OPTIONS, []);

  const steps = useMemo(() => ([
    {
      title: t('growth.onboarding.languageTitle', 'Dilini Seç / Choose your language'),
      description: t('growth.onboarding.languageDescription', "Dünyanın neresinde olursanız olun, İslam'ın nuruyla buluşmanız için ana dilinizde ve global dillerde yanınızdayız."),
      actionLabel: t('growth.onboarding.continue', 'Devam Et')
    },
    {
      title: t('growth.onboarding.locationTitle', 'Vaktinizi Belirleyelim'),
      description: t('growth.onboarding.locationDescription', 'Ezan sesinin yankılandığı yerel vaktinizi en doğru şekilde belirleyebilmemiz için konumunuzu paylaşıp kıblenizi bulalım.'),
      actionLabel: t('growth.onboarding.enableLocation', 'Konumu Etkinleştir')
    },
    {
      title: t('growth.onboarding.notificationTitle', 'Kalbiniz Huzurla Sarsın'),
      description: t('growth.onboarding.notificationDescription', 'Hayatın telaşında namazı ve zikri unutmamak, her vakitte Rabbinize yönelmek için hatırlatıcılarımızı etkinleştirin.'),
      actionLabel: t('growth.onboarding.enableNotifications', 'Bildirimleri Aç')
    },
    {
      title: t('growth.onboarding.firstActionTitle', 'Bismillah Diyerek Başlayalım'),
      description: t('growth.onboarding.firstActionDescription', 'Manevi yolculuğunuza ilk adımı atın. İlk ibadetinizi kaydedip huzura merhaba deyin.'),
      actionLabel: t('growth.onboarding.startNow', 'Şimdi Başla')
    }
  ]), [t]);

  const currentStep = steps[step];

  const [loading, setLoading] = useState(false);

  const handlePrimaryAction = async () => {
    setLoading(true);
    try {
      if (step === 0) {
        await onSelectLanguage?.(selectedLanguage);
        setStep(1);
        return;
      }

      if (step === 1) {
        await onRequestLocation?.();
        setStep(2);
        return;
      }

      if (step === 2) {
        await onRequestNotifications?.();
        setStep(3);
        return;
      }

      onComplete?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        background: 'rgba(12, 32, 25, 0.92)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #0f3d2e 0%, #1a5c45 100%)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          padding: 20,
          color: '#f7f5ef',
          boxShadow: '0 18px 50px rgba(0,0,0,0.45)'
        }}
      >
        <div style={{ marginBottom: 16, fontSize: 13, opacity: 0.8 }}>
          {t('growth.onboarding.stepCounter', 'Adım {{current}} / {{total}}', { current: step + 1, total: 4 })}
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: 22, color: '#d4af37' }}>{currentStep.title}</h2>
        <p style={{ margin: '0 0 20px', lineHeight: 1.6, color: '#d9e6db' }}>{currentStep.description}</p>

        {step === 0 && (
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {languageOptions.map((item) => (
              <button
                key={item.code}
                onClick={() => setSelectedLanguage(item.code)}
                style={{
                  ...baseButton,
                  background: selectedLanguage === item.code ? '#d4af37' : 'rgba(255,255,255,0.08)',
                  color: selectedLanguage === item.code ? '#14352a' : '#fff',
                  border: selectedLanguage === item.code ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.2)'
                }}
              >
                {item.nativeName}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handlePrimaryAction}
          disabled={loading || loadingLocation || loadingNotifications}
          style={{
            ...baseButton,
            width: '100%',
            background: '#d4af37',
            color: '#14352a',
            opacity: (loading || loadingLocation || loadingNotifications) ? 0.7 : 1
          }}
        >
          { (loading || loadingLocation || loadingNotifications)
            ? t('common.loading', 'Yükleniyor...')
            : currentStep.actionLabel}
        </button>
      </div>
    </div>
  );
};

export default GrowthOnboarding;
