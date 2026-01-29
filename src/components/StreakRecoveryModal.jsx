import { useState, useEffect } from 'react';
import { Flame, Clock, PlayCircle, X, Shield, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getRecoveryStatus, recoverStreak, markRecoveryUsed } from '../services/streakService';
import { showRewardedAd } from '../services/admobService';
import './StreakRecoveryModal.css';

const StreakRecoveryModal = ({ streakData, onClose, onRecovered }) => {
  const { t } = useTranslation();
  const [recoveryStatus, setRecoveryStatus] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const status = getRecoveryStatus();
    setRecoveryStatus(status);
    
    if (status.canRecover && status.recoveryDeadline) {
      const interval = setInterval(() => {
        updateTimeLeft(status.recoveryDeadline);
      }, 1000);
      updateTimeLeft(status.recoveryDeadline);
      return () => clearInterval(interval);
    }
  }, []);

  const updateTimeLeft = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    
    if (diff <= 0) {
      setTimeLeft(t('streakRecovery.expired'));
      setRecoveryStatus(prev => ({ ...prev, canRecover: false }));
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleWatchAd = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Reklamı göster
      const adResult = await showRewardedAd();
      
      if (adResult.success) {
        // Reklam başarıyla izlendi, streak'i kurtar
        const result = recoverStreak();
        
        if (result.success) {
          markRecoveryUsed();
          setSuccess(true);
          
          // 2 saniye sonra kapat
          setTimeout(() => {
            onRecovered && onRecovered(result.newStreak);
            onClose();
          }, 2000);
        } else {
          setError(result.message);
        }
      } else {
        setError(t('streakRecovery.adError'));
      }
    } catch (err) {
      setError(t('streakRecovery.genericError'));
      console.error('Recovery error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!recoveryStatus) return null;

  // Kurtarma mümkün değilse modal gösterme
  if (!recoveryStatus.canRecover && !success) {
    return null;
  }

  return (
    <div className="streak-recovery-overlay" onClick={handleClose}>
      <div className="streak-recovery-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="recovery-header">
          <button className="recovery-close-btn" onClick={handleClose} disabled={isLoading}>
            <X size={24} />
          </button>
          
          <div className="recovery-icon-container">
            <div className="recovery-flame-icon">
              <Flame size={48} />
            </div>
            <div className="recovery-shield-icon">
              <Shield size={24} />
            </div>
          </div>
          
          <h2 className="recovery-title">
            {success ? t('streakRecovery.successTitle') : t('streakRecovery.title')}
          </h2>
        </div>

        {/* Content */}
        <div className="recovery-content">
          {success ? (
            <div className="recovery-success">
              <div className="success-animation">
                <Flame size={64} className="success-flame" />
              </div>
              <p className="success-message">
                {t('streakRecovery.successMessage', { count: streakData?.current || 0 })}
              </p>
              <div className="success-streak-display">
                <span className="success-streak-number">{streakData?.current || 0}</span>
                <span className="success-streak-label">{t('streakRecovery.days')}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="recovery-info">
                <div className="recovery-streak-display">
                  <span className="recovery-streak-number">{streakData?.current || 0}</span>
                  <span className="recovery-streak-label">{t('streakRecovery.daysAtRisk')}</span>
                </div>
                
                <p className="recovery-description">
                  {t('streakRecovery.description')}
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="recovery-countdown">
                <Clock size={20} />
                <div className="countdown-info">
                  <span className="countdown-label">{t('streakRecovery.timeLeft')}</span>
                  <span className="countdown-time">{timeLeft}</span>
                </div>
              </div>

              {/* Warning */}
              <div className="recovery-warning">
                <AlertTriangle size={18} />
                <span>{t('streakRecovery.oneTimeUse')}</span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="recovery-error">
                  {error}
                </div>
              )}

              {/* Action Button */}
              <button 
                className="recovery-action-btn"
                onClick={handleWatchAd}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <PlayCircle size={24} />
                    <span>{t('streakRecovery.watchAd')}</span>
                  </>
                )}
              </button>

              <p className="recovery-footer-text">
                {t('streakRecovery.footerText')}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreakRecoveryModal;