import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import {
  ArrowLeft,
  BookMarked,
  Copy,
  Hash,
  Info,
  RefreshCw,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useGroupHatim } from '../../hooks/useGroupHatim';
import { getCurrentUserId } from '../../services/authService';
import './Social.css';

const HatimDetail = ({ hatimId, onBack }) => {
  const { t } = useTranslation();
  const { hatimDetails, loading, error, takePart, releasePart, completePart } = useGroupHatim(hatimId);
  const currentUserId = getCurrentUserId();
  const [processingPart, setProcessingPart] = useState(null);

  const copyText = async (text, successMessage) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        alert(successMessage);
        return;
      }
    } catch {
      // fall back to prompt below
    }

    window.prompt(t('common.copy', 'Kopyalamak icin secin:'), text);
  };

  if (loading && !hatimDetails) {
    return (
      <div className="settings-card reveal-stagger" style={{ justifyContent: 'center', padding: '40px' }}>
        <div className="spin"><RefreshCw size={32} color="var(--nav-accent)" /></div>
        <p style={{ margin: '16px 0 0', fontSize: '0.9rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
          {t('common.loading')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manuscript-card reveal-stagger" style={{ borderColor: '#ef4444' }}>
        <p className="lesson-title">{t('common.error', 'Hata olustu')}</p>
        <p className="lesson-desc">{error}</p>
      </div>
    );
  }

  if (!hatimDetails) return null;

  const isMember = hatimDetails.readers?.includes(currentUserId);
  if (!isMember) {
    return (
      <div className="manuscript-card reveal-stagger" style={{ textAlign: 'center' }}>
        <Info size={48} color="var(--soc-teal-dark)" style={{ marginBottom: '15px' }} />
        <p className="lesson-desc">
          {t('hatim.membershipRequired', 'Bu hatimin detaylarini gormek icin once katilmalisiniz.')}
        </p>
        <button onClick={onBack} className="sanctuary-btn-primary" style={{ marginTop: '20px', width: '100%' }}>
          {t('common.back', 'Geri don')}
        </button>
      </div>
    );
  }

  const shareText = t('hatim.shareText', {
    title: hatimDetails.name,
    code: hatimDetails.joinCode,
    defaultValue: `${hatimDetails.name} hatmine katilmak icin davet kodu: ${hatimDetails.joinCode}`,
  });

  const handlePartClick = async (partNum, partData) => {
    if (processingPart) return;
    setProcessingPart(partNum);

    try {
      if (partData.status === 'free') {
        if (window.confirm(`${partNum}. cuzu okumak icin almak istiyor musunuz?`)) {
          await takePart(partNum);
        }
      } else if (partData.status === 'taken') {
        if (partData.takenBy?.uid === currentUserId) {
          const action = window.prompt(
            `Bu cuz sizin tarafinizdan alindi.\n"okudum" yazarak tamamlayin\n"iptal" yazarak birakin`
          );

          if (action?.toLowerCase() === 'okudum') {
            await completePart(partNum);
          } else if (action?.toLowerCase() === 'iptal') {
            await releasePart(partNum);
          }
        } else {
          alert(`Bu cuz ${partData.takenBy?.name} tarafindan alinmis.`);
        }
      } else if (partData.status === 'completed') {
        alert(`Bu cuz ${partData.takenBy?.name} tarafindan okunmus. Allah kabul etsin.`);
      }
    } catch {
      alert(t('common.error', 'Islem yapilamadi.'));
    } finally {
      setProcessingPart(null);
    }
  };

  const handleShareInvite = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: hatimDetails.name,
          text: shareText,
          dialogTitle: t('hatim.share', 'Davet Kodunu Paylas'),
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: hatimDetails.name,
          text: shareText,
        });
        return;
      }
    } catch (errorInstance) {
      if (errorInstance?.message === 'Share canceled' || errorInstance?.name === 'AbortError') {
        return;
      }
    }

    await copyText(shareText, t('hatim.messages.inviteCopied', 'Davet mesaji kopyalandi.'));
  };

  return (
    <div className="hatim-detail reveal-stagger">
      <div className="settings-card hatim-detail-hero">
        <button
          onClick={onBack}
          className="premium-icon-btn"
          style={{ background: 'var(--hb-hover)', color: 'var(--hb-accent)', width: '44px', height: '44px', borderRadius: '14px' }}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="hatim-detail-hero-body">
          <div className="hatim-detail-title-wrap">
            <div className="hatim-detail-kicker">
              <BookMarked size={14} />
              {t('community.tabs.hatims', 'Hatimler')}
            </div>
            <h3 className="hatim-detail-title">{hatimDetails.name}</h3>
          </div>

          <div className="hatim-code-panel">
            <div className="hatim-code-panel-copy">
              <p className="hatim-code-label">{t('hatim.inviteCode', 'Davet kodu')}</p>
              <div className="hatim-code-value">
                <Hash size={14} />
                <span>{hatimDetails.joinCode}</span>
              </div>
            </div>

            <div className="hatim-code-actions">
              <button
                className="hatim-code-action-btn"
                onClick={() => copyText(hatimDetails.joinCode, t('hatim.messages.codeCopied', 'Kod kopyalandi.'))}
              >
                <Copy size={16} />
                {t('common.copy', 'Kopyala')}
              </button>
              <button className="hatim-code-action-btn secondary" onClick={handleShareInvite}>
                <Share2 size={16} />
                {t('hatim.share', 'Paylas')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-card hatim-detail-grid-card">
        <div className="hatim-grid-header">
          <div>
            <h4 className="hatim-grid-title">{t('hatim.statusGrid', 'Cuz Durumlari')}</h4>
            <p className="hatim-grid-subtitle">
              {t('hatim.gridSubtitle', 'Uygun olan cuzu sec, okumayi tamamlayinca durumu guncelle.')}
            </p>
          </div>
          <div className="hatim-grid-badge">
            <Sparkles size={14} />
            30 {t('hatim.parts', 'cuz')}
          </div>
        </div>

        <div className="sanctuary-grid sanctuary-grid-premium">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => {
            const part = hatimDetails.parts?.[num] || { status: 'free' };
            const isMine = part.takenBy?.uid === currentUserId;
            const isLoading = processingPart === num;

            let statusClass = 'free';
            let statusText = t('hatim.free', 'Bos');

            if (part.status === 'completed') {
              statusClass = 'completed';
              statusText = t('hatim.completed', 'Okundu');
            } else if (part.status === 'taken') {
              statusClass = isMine ? 'taken-mine' : 'taken-others';
              statusText = isMine ? t('hatim.mine', 'Sizde') : t('hatim.others', 'Baskasinda');
            }

            return (
              <button
                key={num}
                onClick={() => handlePartClick(num, part)}
                disabled={isLoading}
                className={`part-btn part-btn-premium ${statusClass}`}
              >
                <div className="part-btn-top">
                  <span className="part-number-label">{t('hatim.partShort', 'Cuz')}</span>
                  <span className="part-number">{isLoading ? <RefreshCw size={16} className="spin" /> : num}</span>
                </div>
                <div className="part-btn-bottom">
                  <span className="part-status-pill">{statusText}</span>
                  {part.takenBy?.name && part.status !== 'free' && (
                    <span className="part-owner-name">
                      {part.status === 'completed' ? t('hatim.readBy', 'Okuyan') : t('hatim.takenBy', 'Alan')}: {part.takenBy.name}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="hatim-legend-premium">
          <div className="legend-item">
            <div className="legend-box legend-box-free"></div>
            {t('hatim.free', 'Bos')}
          </div>
          <div className="legend-item">
            <div className="legend-box legend-box-mine"></div>
            {t('hatim.mine', 'Sizde')}
          </div>
          <div className="legend-item">
            <div className="legend-box legend-box-others"></div>
            {t('hatim.others', 'Baskasinda')}
          </div>
          <div className="legend-item">
            <div className="legend-box legend-box-completed"></div>
            {t('hatim.completed', 'Okundu')}
          </div>
        </div>
      </div>

      <button
        className="sanctuary-btn-primary reveal-stagger"
        style={{ width: '100%', marginTop: '24px', padding: '18px', borderRadius: '20px' }}
        onClick={handleShareInvite}
      >
        <Share2 size={20} />
        {t('hatim.share', 'Davet Kodunu Paylas')}
      </button>
    </div>
  );
};

export default HatimDetail;
