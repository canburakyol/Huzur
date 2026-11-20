import { createElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle, ShieldCheck, Heart, ArrowRight, Wallet, TrendingDown, Settings2, Bug, MessageCircle } from 'lucide-react';
import { logger } from '../../../utils/logger';

const REASONS = [
  { id: 'expensive', icon: Wallet, labelKey: 'churn.expensive', defaultLabel: 'Çok pahalı' },
  { id: 'not_using', icon: TrendingDown, labelKey: 'churn.notUsing', defaultLabel: 'Yeterince kullanmıyorum' },
  { id: 'missing_feature', icon: Settings2, labelKey: 'churn.missingFeature', defaultLabel: 'Aradığım özellikleri bulamadım' },
  { id: 'technical', icon: Bug, labelKey: 'churn.technical', defaultLabel: 'Teknik sorunlar yaşıyorum' },
  { id: 'other', icon: MessageCircle, labelKey: 'churn.other', defaultLabel: 'Diğer' },
];

const CancelFlowModal = ({ onClose, onConfirmCancel }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1: Survey, 2: Offer, 3: Confirm
  const [selectedReason, setSelectedReason] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReasonSelect = (reasonId) => {
    setSelectedReason(reasonId);
    // Proceed to Offer step
    setStep(2);
  };

  const getDynamicOffer = () => {
    if (!selectedReason) return null;

    if (selectedReason === 'expensive') {
      return {
        title: t('churn.offer.discountTitle', 'Size Özel %30 İndirim!'),
        description: t('churn.offer.discountDesc', 'Gitmeyin diye önümüzdeki 3 ay boyunca %30 indirim kazandınız. Huzur’la kalmaya devam edin.'),
        actionType: 'apply_discount',
        actionLabel: t('churn.offer.acceptDiscount', 'İndirimi Kabul Et'),
        icon: <ShieldCheck size={40} color="var(--brand-ink)" />
      };
    } else if (selectedReason === 'not_using') {
      return {
        title: t('churn.offer.pauseTitle', 'Aboneliğinizi Dondurun'),
        description: t('churn.offer.pauseDesc', 'Tamamen iptal etmek yerine 1 ay boyunca ücretsiz dondurun. Hazır olduğunuzda kaldığınız yerden devam edin.'),
        actionType: 'pause',
        actionLabel: t('churn.offer.acceptPause', 'Aboneliği Dondur'),
        icon: <Heart size={40} color="var(--gold-ink)" />
      };
    } else {
      // Default fallback offer / Feature showcase
      return {
        title: t('churn.offer.helpTitle', 'Yardımcı Olabiliriz'),
        description: t('churn.offer.helpDesc', 'Daha iyi bir deneyim için özel destek ekibimizle görüşmek ister misiniz? Müşteri memnuniyeti bizim için her şeydir.'),
        actionType: 'support',
        actionLabel: t('churn.offer.contactSupport', 'Destekle Görüş'),
        icon: <Heart size={40} color="var(--brand-ink)" />
      };
    }
  };

  const offer = getDynamicOffer();

  const handleAcceptOffer = async () => {
    setIsProcessing(true);
    logger.log(`[CancelFlow] User accepted offer: ${offer.actionType}`);
    // Here we would call the revenue cat or backend service to apply offer
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
    }, 1500);
  };

  const handleDeclineOffer = () => {
    setStep(3);
  };

  const confirmCancellation = async () => {
    setIsProcessing(true);
    logger.log(`[CancelFlow] User confirmed cancellation for reason: ${selectedReason}`);
    // Log to analytics
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmCancel();
    }, 1000);
  };

  return (
    <div className="cancel-flow-overlay" style={overlayStyle}>
      <div className="cancel-flow-modal" style={modalStyle}>
        
        {/* Close Button top right */}
        <button onClick={onClose} style={closeBtnStyle} disabled={isProcessing}>
          <X size={20} color="var(--ink-muted)" />
        </button>

        {step === 1 && (
          <div className="step-survey" style={contentStyle}>
            <h2 style={titleStyle}>{t('churn.survey.title', 'Bizi Neden Bırakıyorsunuz?')}</h2>
            <p style={descStyle}>{t('churn.survey.desc', 'Deneyiminizi geliştirmek için ayrılma sebebinizi öğrenebilir miyiz?')}</p>
            
            <div style={reasonsContainerStyle}>
              {REASONS.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleReasonSelect(r.id)}
                  style={reasonBtnStyle}
                >
                  {createElement(r.icon, { size: 20, strokeWidth: 1.75, 'aria-hidden': true })}
                  <span style={{ fontWeight: 500 }}>{t(r.labelKey, r.defaultLabel)}</span>
                </button>
              ))}
            </div>
            
            <div style={footerStyle}>
              <button onClick={onClose} style={primaryBtnStyle}>
                {t('churn.survey.keepSub', 'Aboneliğimi Koru')}
              </button>
            </div>
          </div>
        )}

        {step === 2 && offer && (
          <div className="step-offer" style={contentStyle}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
              {offer.icon}
            </div>
            <h2 style={titleStyle}>{offer.title}</h2>
            <p style={descStyle}>{offer.description}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 30 }}>
              <button 
                onClick={handleAcceptOffer} 
                style={primaryBtnStyle}
                disabled={isProcessing}
              >
                {isProcessing ? t('common.processing', 'İşleniyor...') : offer.actionLabel}
              </button>
              <button onClick={handleDeclineOffer} style={ghostBtnStyle} disabled={isProcessing}>
                {t('churn.offer.decline', 'Hayır, İptal İşlemine Devam Et')}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-confirm" style={contentStyle}>
             <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
              <AlertTriangle size={40} color="var(--danger)" />
            </div>
            <h2 style={{...titleStyle, color: 'var(--danger)'}}>{t('churn.confirm.title', 'Emin Misiniz?')}</h2>
            <p style={descStyle}>
              {t('churn.confirm.desc', 'Aboneliğinizi iptal etmeniz durumunda, mevcut döneminizin sonunda Pro özelliklerine erişiminizi kaybedeceksiniz. Tüm reklamsız deneyim ve premium içerikler sonlanacaktır.')}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 30 }}>
              <button onClick={onClose} style={primaryBtnStyle} disabled={isProcessing}>
                {t('churn.confirm.keep', 'Vazgeç, Abonelikte Kal')}
              </button>
              <button onClick={confirmCancellation} style={destructiveBtnStyle} disabled={isProcessing}>
                {isProcessing ? t('churn.confirm.canceling', 'İptal Ediliyor...') : t('churn.confirm.cancel', 'Evet, Aboneliğimi İptal Et')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Internal inline styles for the React component
const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.75)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10000,
  padding: 20
};

const modalStyle = {
  backgroundColor: 'var(--paper-raised)',
  borderRadius: 24,
  width: '100%',
  maxWidth: 400,
  padding: '32px 24px',
  position: 'relative',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  border: '1px solid rgba(255,255,255,0.1)'
};

const closeBtnStyle = {
  position: 'absolute',
  top: 16, right: 16,
  background: 'transparent',
  border: 'none',
  padding: 8,
  cursor: 'pointer'
};

const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center'
};

const titleStyle = {
  color: 'var(--on-primary)',
  fontSize: 22,
  fontWeight: '700',
  marginBottom: 12,
  marginTop: 0
};

const descStyle = {
  color: 'var(--ink-muted)',
  fontSize: 15,
  lineHeight: 1.5,
  marginBottom: 24
};

const reasonsContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  marginBottom: 24
};

const reasonBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  color: 'var(--on-primary)',
  fontSize: 15,
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'left'
};

const footerStyle = {
  marginTop: 10
};

const primaryBtnStyle = {
  width: '100%',
  padding: '16px',
  backgroundColor: 'var(--gold-ink)',
  color: 'var(--on-tertiary)',
  border: 'none',
  borderRadius: 12,
  fontSize: 16,
  fontWeight: '600',
  cursor: 'pointer'
};

const ghostBtnStyle = {
  width: '100%',
  padding: '14px',
  backgroundColor: 'transparent',
  color: 'var(--ink-muted)',
  border: 'none',
  fontSize: 15,
  fontWeight: '500',
  cursor: 'pointer'
};

const destructiveBtnStyle = {
  width: '100%',
  padding: '14px',
  backgroundColor: 'color-mix(in srgb, var(--danger) 10%, transparent)',
  color: 'var(--danger)',
  border: '1px solid color-mix(in srgb, var(--danger) 20%, transparent)',
  borderRadius: 12,
  fontSize: 15,
  fontWeight: '600',
  cursor: 'pointer'
};

export default CancelFlowModal;
