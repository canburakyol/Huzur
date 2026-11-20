import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../../hooks/useToast';
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
import { useGroupHatim } from '../../../hooks/useGroupHatim';
import { getCurrentUserId } from '../../../services/authService';
import { buildHatimWeeklySummary } from '../../../services/weeklySocialService';
import { logger } from '../../../utils/logger';
import { logHatimWeeklySummaryViewed } from '../../../services/analyticsService';
import './Social.css';

const HatimDetail = ({ hatimId, onBack }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { hatimDetails, loading, error, takePart, releasePart, completePart } = useGroupHatim(hatimId);
  const currentUserId = getCurrentUserId();
  const [processingPart, setProcessingPart] = useState(null);
  const weeklySummary = useMemo(() => (
    hatimDetails ? buildHatimWeeklySummary(hatimDetails) : null
  ), [hatimDetails]);

  useEffect(() => {
    if (!hatimId || !weeklySummary) return;
    logHatimWeeklySummaryViewed(hatimId, weeklySummary.weekKey, weeklySummary.completedThisWeek);
  }, [hatimId, weeklySummary]);

  const copyText = async (text, successMessage) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(successMessage, 'success');
        return;
      }
    } catch (error) {
      logger.error('[HatimDetail] Failed to copy hatim text', error);
    }

    showToast(successMessage, 'success');
  };

  if (loading && !hatimDetails) {
    return (
      <div className="settings-card reveal-stagger" style={{ justifyContent: 'center', padding: '40px' }}>
        <div className="spin"><RefreshCw size={32} color="var(--brand-ink)" /></div>
        <p style={{ margin: '16px 0 0', fontSize: '0.9rem', color: 'var(--ink-muted)', fontWeight: '600' }}>
          {t('common.loading')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="practice-panel" role="alert">
        <p className="practice-row__title">{t('common.error', 'Hata oluştu')}</p>
        <p className="practice-row__text">{error}</p>
      </div>
    );
  }

  if (!hatimDetails) return null;

  const isMember = hatimDetails.readers?.includes(currentUserId);
  if (!isMember) {
    return (
      <div className="practice-panel" style={{ textAlign: 'center' }}>
        <Info size={48} color="var(--soc-teal-dark)" style={{ marginBottom: '15px' }} />
        <p className="practice-row__text">
          {t('hatim.membershipRequired', 'Bu hatimin detaylarını görmek için önce katılmalısınız.')}
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
    defaultValue: `${hatimDetails.name} hatmine katılmak için davet kodu: ${hatimDetails.joinCode}`,
  });

  const handlePartClick = async (partNum, partData) => {
    if (processingPart) return;
    setProcessingPart(partNum);

    try {
      if (partData.status === 'free') {
        if (window.confirm(t('hatim.messages.confirmTake', { partNum, defaultValue: '{{partNum}}. cüzü okumak için almak istiyor musunuz?' }))) {
          await takePart(partNum);
        }
      } else if (partData.status === 'taken') {
        if (partData.takenBy?.uid === currentUserId) {
          const action = window.prompt(
            t('hatim.messages.partActions', 'Bu cüz sizin tarafınızdan alındı.\n"okudum" yazarak tamamlayın\n"iptal" yazarak bırakın')
          );

          // The prompt text is translated, so accept the command words of every supported language.
          const command = action?.trim().toLocaleLowerCase();
          if (['okudum', 'read', 'gelesen', 'sudah dibaca'].includes(command)) {
            await completePart(partNum);
          } else if (['iptal', 'vazgeç', 'cancel', 'abbrechen', 'batal'].includes(command)) {
            await releasePart(partNum);
          }
        } else {
          showToast(t('hatim.messages.cuzTaken', { name: partData.takenBy?.name }), 'info');
        }
      } else if (partData.status === 'completed') {
        showToast(t('hatim.messages.cuzCompleted', { name: partData.takenBy?.name }), 'success');
      }
    } catch (error) {
      logger.error('[HatimDetail] Failed to update hatim part status', error);
      showToast(t('common.error', 'Islem yapilamadi.'), 'error');
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
          dialogTitle: t('hatim.share', 'Davet Kodunu Paylaş'),
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

    await copyText(shareText, t('hatim.messages.inviteCopied', 'Davet mesajı kopyalandı.'));
  };

  return (
    <div className="hatim-detail reveal-stagger">
      <div className="settings-card hatim-detail-hero">
        <button
          onClick={onBack}
          type="button"
          className="hz-iconbtn"
          aria-label={t('common.back', 'Geri')}
        >
          <ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" />
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
                onClick={() => copyText(hatimDetails.joinCode, t('hatim.messages.codeCopied', 'Kod kopyalandı.'))}
              >
                <Copy size={16} />
                {t('common.copy', 'Kopyala')}
              </button>
              <button className="hatim-code-action-btn secondary" onClick={handleShareInvite}>
                <Share2 size={16} />
                {t('hatim.share', 'Paylaş')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-card hatim-detail-grid-card">
        {weeklySummary && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '18px'
          }}>
            <div style={{ background: 'var(--hb-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--hb-border)' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--hb-text)' }}>{weeklySummary.takenThisWeek}</div>
              <div style={{ fontSize: '0.66rem', fontWeight: '800', color: 'var(--hb-text-muted)', textTransform: 'uppercase' }}>Bu hafta alinan</div>
            </div>
            <div style={{ background: 'var(--hb-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--hb-border)' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--hb-text)' }}>{weeklySummary.completedThisWeek}</div>
              <div style={{ fontSize: '0.66rem', fontWeight: '800', color: 'var(--hb-text-muted)', textTransform: 'uppercase' }}>Bu hafta biten</div>
            </div>
            <div style={{ background: 'var(--hb-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--hb-border)' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--hb-text)' }}>{weeklySummary.completedTotal}</div>
              <div style={{ fontSize: '0.66rem', fontWeight: '800', color: 'var(--hb-text-muted)', textTransform: 'uppercase' }}>Toplam tamamlanan</div>
            </div>
            <div style={{ background: 'var(--hb-hover)', borderRadius: '16px', padding: '14px 12px', border: '1px solid var(--hb-border)' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--hb-text)' }}>{weeklySummary.remainingParts}</div>
              <div style={{ fontSize: '0.66rem', fontWeight: '800', color: 'var(--hb-text-muted)', textTransform: 'uppercase' }}>Kalan cuz</div>
            </div>
          </div>
        )}

        <div className="hatim-grid-header">
          <div>
            <h4 className="hatim-grid-title">{t('hatim.statusGrid', 'Cüz Durumları')}</h4>
            <p className="hatim-grid-subtitle">
              {t('hatim.gridSubtitle', 'Uygun olan cüzü seç, okumayı tamamlayınca durumu güncelle.')}
            </p>
          </div>
          <div className="hatim-grid-badge">
            <Sparkles size={14} />
            30 {t('hatim.parts', 'cüz')}
          </div>
        </div>

        <div className="sanctuary-grid sanctuary-grid-premium">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => {
            const part = hatimDetails.parts?.[num] || { status: 'free' };
            const isMine = part.takenBy?.uid === currentUserId;
            const isLoading = processingPart === num;

            let statusClass = 'free';
            let statusText = t('hatim.free', 'Boş');

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
                  <span className="part-number-label">{t('hatim.partShort', 'Cüz')}</span>
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
            {t('hatim.free', 'Boş')}
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
        {t('hatim.share', 'Davet Kodunu Paylaş')}
      </button>
    </div>
  );
};

export default HatimDetail;
