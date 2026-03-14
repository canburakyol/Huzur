import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { SUPPORTED_LANGUAGE_OPTIONS } from '../config/i18nConfig';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS } from '../constants';

const baseButton = {
  border: 'none',
  borderRadius: 14,
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer'
};

const choiceButtonStyle = (selected = false) => ({
  ...baseButton,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  textAlign: 'left',
  width: '100%',
  background: selected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.07)',
  color: selected ? '#d4af37' : '#fff',
  border: selected ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.12)',
  transition: 'all 0.2s ease'
});

function GrowthOnboarding({
  initialStep = 0,
  initialLanguage = 'tr',
  onSelectLanguage,
  onRequestLocation,
  onRequestNotifications,
  onComplete,
  loadingLocation = false,
  loadingNotifications = false
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(initialStep);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [selectedGoal, setSelectedGoal] = useState('prayer');
  const [loading, setLoading] = useState(false);

  const languageOptions = useMemo(() => SUPPORTED_LANGUAGE_OPTIONS, []);

  const steps = useMemo(() => ([
    {
      title: t('growth.onboarding.languageTitle', 'Dilini Sec / Choose your language'),
      description: t('growth.onboarding.languageDescription', 'Uygulamayi sana en uygun dilde hazirlayalim. Istedigin dili simdi sec, sonra ayarlardan degistirebilirsin.'),
      actionLabel: t('growth.onboarding.continue', 'Devam Et')
    },
    {
      title: t('growth.onboarding.locationTitle', 'Konumunu kullanalim mi?'),
      description: t('growth.onboarding.locationDescription', 'Namaz vakitlerini daha dogru hesaplamak icin konumunu kullanabiliriz. Istersen simdilik Istanbul ile de devam edebilirsin.')
    },
    {
      title: t('growth.onboarding.notificationTitle', 'Bildirim almak ister misin?'),
      description: t('growth.onboarding.notificationDescription', 'Vakitleri, zikirleri ve gunluk hatirlatmalari kacirmamak icin bildirimleri acabilirsin. Istersen bunu sonra da yapabilirsin.')
    },
    {
      title: t('growth.onboarding.goalTitle', 'Temel odagin ne olsun?'),
      description: t('growth.onboarding.goalDescription', 'Anasayfa ve onerileri buna gore sekillendirelim.'),
      actionLabel: t('growth.onboarding.continue', 'Devam Et')
    },
    {
      title: t('growth.onboarding.firstActionTitle', 'Hazirsan baslayalim'),
      description: t('growth.onboarding.firstActionDescription', 'Kurulum tamamlandi. Artik dogrudan ana ekrana gecip uygulamayi kullanabilirsin.'),
      actionLabel: t('growth.onboarding.startNow', 'Ana ekrana gec')
    }
  ]), [t]);

  const currentStep = steps[step];
  const totalSteps = steps.length;

  const goals = useMemo(() => ([
    { id: 'prayer', label: t('growth.goal.prayer', 'Namazlarimi takip etmek'), icon: '🕌' },
    { id: 'quran', label: t('growth.goal.quran', "Kuran okumak ve ogrenmek"), icon: '📖' },
    { id: 'zikir', label: t('growth.goal.zikir', 'Zikir ve tesbihat yapmak'), icon: '📿' },
    { id: 'dua', label: t('growth.goal.dua', 'Dua ve Esmaul Husna'), icon: '✨' }
  ]), [t]);

  const isBusy = loading || loadingLocation || loadingNotifications;

  const goToNextStep = () => {
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      if (step === 0) {
        await onSelectLanguage?.(selectedLanguage);
        goToNextStep();
        return;
      }

      if (step === 3) {
        storageService.setItem(STORAGE_KEYS.USER_PRIMARY_GOAL || 'user_primary_goal', selectedGoal);
        goToNextStep();
        return;
      }

      if (step === totalSteps - 1) {
        window.setTimeout(() => {
          onComplete?.();
        }, 0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationAnswer = async (accepted) => {
    setLoading(true);
    try {
      await onRequestLocation?.(accepted);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationAnswer = async (accepted) => {
    setLoading(true);
    try {
      await onRequestNotifications?.(accepted);
      setStep(3);
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
          {t('growth.onboarding.stepCounter', 'Adim {{current}} / {{total}}', { current: step + 1, total: totalSteps })}
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: 22, color: '#d4af37' }}>{currentStep.title}</h2>
        <p style={{ margin: '0 0 20px', lineHeight: 1.6, color: '#d9e6db' }}>{currentStep.description}</p>

        {step === 0 && (
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {languageOptions.map((item) => (
              <button
                key={item.code}
                onClick={() => setSelectedLanguage(item.code)}
                disabled={isBusy}
                style={{
                  ...choiceButtonStyle(selectedLanguage === item.code),
                  justifyContent: 'space-between'
                }}
              >
                <span>{item.nativeName}</span>
                {selectedLanguage === item.code && <Check size={18} />}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
            <button
              onClick={() => handleLocationAnswer(true)}
              disabled={isBusy}
              style={choiceButtonStyle(false)}
            >
              <span style={{ fontSize: 20 }}>📍</span>
              <span>
                <strong style={{ display: 'block', marginBottom: 4 }}>
                  {t('growth.onboarding.locationAllow', 'Konumumu kullan')}
                </strong>
                <span style={{ opacity: 0.8, fontSize: 13 }}>
                  {t('growth.onboarding.locationAllowDesc', 'Bulundugun yere gore vakitleri hesapla')}
                </span>
              </span>
            </button>
            <button
              onClick={() => handleLocationAnswer(false)}
              disabled={isBusy}
              style={choiceButtonStyle(false)}
            >
              <span style={{ fontSize: 20 }}>🕊️</span>
              <span>
                <strong style={{ display: 'block', marginBottom: 4 }}>
                  {t('growth.onboarding.locationSkip', 'Simdilik gec')}
                </strong>
                <span style={{ opacity: 0.8, fontSize: 13 }}>
                  {t('growth.onboarding.locationSkipDesc', 'Istanbul ile devam et, sonra degistir')}
                </span>
              </span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
            <button
              onClick={() => handleNotificationAnswer(true)}
              disabled={isBusy}
              style={choiceButtonStyle(false)}
            >
              <span style={{ fontSize: 20 }}>🔔</span>
              <span>
                <strong style={{ display: 'block', marginBottom: 4 }}>
                  {t('growth.onboarding.notificationsAllow', 'Bildirimleri ac')}
                </strong>
                <span style={{ opacity: 0.8, fontSize: 13 }}>
                  {t('growth.onboarding.notificationsAllowDesc', 'Namaz vakitleri ve hatirlatmalari al')}
                </span>
              </span>
            </button>
            <button
              onClick={() => handleNotificationAnswer(false)}
              disabled={isBusy}
              style={choiceButtonStyle(false)}
            >
              <span style={{ fontSize: 20 }}>🌙</span>
              <span>
                <strong style={{ display: 'block', marginBottom: 4 }}>
                  {t('growth.onboarding.notificationsSkip', 'Simdilik istemiyorum')}
                </strong>
                <span style={{ opacity: 0.8, fontSize: 13 }}>
                  {t('growth.onboarding.notificationsSkipDesc', 'Daha sonra ayarlardan acabilirsin')}
                </span>
              </span>
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                disabled={isBusy}
                style={choiceButtonStyle(selectedGoal === goal.id)}
              >
                <span style={{ fontSize: 20 }}>{goal.icon}</span>
                <span style={{ flex: 1, fontWeight: 600 }}>{goal.label}</span>
                {selectedGoal === goal.id && <Check size={18} />}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)'
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
              {t('growth.onboarding.selectedGoal', 'Secilen odak')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
              <span style={{ fontSize: 20 }}>
                {goals.find((goal) => goal.id === selectedGoal)?.icon}
              </span>
              <span>{goals.find((goal) => goal.id === selectedGoal)?.label}</span>
            </div>
          </div>
        )}

        {(step === 0 || step === 3 || step === 4) && (
          <button
            onClick={handleContinue}
            disabled={isBusy}
            style={{
              ...baseButton,
              width: '100%',
              background: '#d4af37',
              color: '#14352a',
              opacity: isBusy ? 0.7 : 1
            }}
          >
            {isBusy
              ? t('common.loading', 'Yukleniyor...')
              : currentStep.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default GrowthOnboarding;


