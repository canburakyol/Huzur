import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Gift,
  Link2,
  LoaderCircle,
  Send,
  ShieldAlert,
  Sparkles,
  X
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import {
  createInviteLink,
  getReferralProgress,
} from '../../../services/referralService';
import { getProDetails } from '../../../services/proService';
import {
  ANALYTICS_EVENTS,
  analyticsService,
} from '../../../services/analyticsService';
import {
  buildReferralAnalyticsPayload,
  buildReferralShareText,
  getReferralGrowthPlan,
} from '../../../services/referralGrowthService';
import {
  getReferralServerSnapshot,
  syncReferralState,
} from '../../../services/referralServerService';
import { getActiveCampaign } from '../../../services/campaignService';
import { logger } from '../../../utils/logger';

const formatBlockedUntil = (value) => {
  const parsed = Date.parse(value || '');
  if (!Number.isFinite(parsed)) return null;

  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(parsed));
};

const InviteModal = ({ isOpen, onClose, entrySource = 'invite_modal' }) => {
  const [modalSeedProgress] = useState(() => getReferralProgress());
  const [localProgress, setLocalProgress] = useState(modalSeedProgress);
  const [serverSnapshot, setServerSnapshot] = useState(null);
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteCode, setInviteCode] = useState(() => modalSeedProgress?.ownCode || '');
  const [feedback, setFeedback] = useState('');
  const [syncing, setSyncing] = useState(false);
  const rewardClaimLoggedRef = useRef('');

  useEffect(() => {
    if (!isOpen) return;

    const initialPlan = getReferralGrowthPlan({
      localProgress: modalSeedProgress,
      surface: entrySource,
    });

    analyticsService.logInviteModalViewed(
      entrySource,
      buildReferralAnalyticsPayload(initialPlan, {
        has_local_code: Boolean(modalSeedProgress?.ownCode),
      })
    );

    let cancelled = false;
    const loadSnapshot = async () => {
      setSyncing(true);
      const snapshot = await getReferralServerSnapshot();
      if (!cancelled && snapshot) {
        setServerSnapshot(snapshot);
      }
      if (!cancelled) {
        setSyncing(false);
      }
    };

    void loadSnapshot();

    return () => {
      cancelled = true;
    };
  }, [entrySource, isOpen, modalSeedProgress]);

  const growthPlan = useMemo(() => {
    if (!localProgress) return null;

    return getReferralGrowthPlan({
      localProgress,
      serverSnapshot,
      surface: entrySource,
    });
  }, [entrySource, localProgress, serverSnapshot]);

  const referralExpiry = useMemo(() => {
    const proDetails = getProDetails();
    if (proDetails.active && proDetails.source === 'referral_reward' && proDetails.remaining.ms > 0) {
      return proDetails.remaining;
    }
    return null;
  }, []);

  useEffect(() => {
    if (!growthPlan?.inviterRewardReady && !growthPlan?.inviteeRewardReady) return;
    const signature = `${entrySource}:${growthPlan.signature}`;
    if (rewardClaimLoggedRef.current === signature) return;
    rewardClaimLoggedRef.current = signature;

    analyticsService.logEvent(ANALYTICS_EVENTS.REFERRAL_REWARD_CLAIMED, {
      ...buildReferralAnalyticsPayload(growthPlan, {
        entry_source: entrySource,
      }),
    });
  }, [entrySource, growthPlan]);
  const funnelMetrics = useMemo(() => {
    const inviterSummary = serverSnapshot?.inviterSummary || {};
    const linkReadyCount = localProgress?.ownCode ? 1 : 0;

    return [
      { id: 'link_ready', label: 'Link hazir', value: linkReadyCount },
      { id: 'accepted', label: 'Kabul', value: Math.max(0, Number(inviterSummary.acceptedCount) || 0) },
      { id: 'onboarding', label: 'Onboarding', value: Math.max(0, Number(inviterSummary.onboardingCompletedCount) || 0) },
      { id: 'ibadah', label: 'Ilk ibadet', value: Math.max(0, Number(inviterSummary.firstIbadahCompletedCount) || 0) },
      { id: 'reward', label: 'Odul', value: Math.max(0, Number(inviterSummary.rewardUnlockedCount) || 0) },
    ];
  }, [localProgress?.ownCode, serverSnapshot]);

  if (!isOpen || !localProgress || !growthPlan) return null;

  const refreshAfterLocalMutation = async (nextProgress, source) => {
    setLocalProgress(nextProgress);
    setInviteCode(nextProgress?.ownCode || '');
    setSyncing(true);
    const snapshot = await syncReferralState(nextProgress, { source, force: true });
    if (snapshot) {
      setServerSnapshot(snapshot);
    }
    setSyncing(false);
  };

  const ensureInviteReady = async () => {
    const campaign = getActiveCampaign();
    if (inviteUrl && inviteCode) {
      return {
        code: inviteCode,
        inviteUrl,
        campaign,
      };
    }

    const result = createInviteLink({
      source: entrySource,
      campaign: campaign.id,
      lang: campaign.variant === 'diaspora' ? 'en' : 'tr',
    });

    setInviteUrl(result.inviteUrl);
    setInviteCode(result.code);
    const nextProgress = getReferralProgress();
    await refreshAfterLocalMutation(nextProgress, entrySource);
    setFeedback('Davet linkin hazir. Simdi tek bir kisiye sakin bir notla gonderebilirsin.');

    return {
      ...result,
      campaign,
    };
  };

  const writeClipboard = async (text, successMessage, analyticsEvent) => {
    if (!navigator.clipboard?.writeText) {
      setFeedback('Bu cihazda kopyalama destegi su an gorunmuyor.');
      return;
    }

    await navigator.clipboard.writeText(text);
    setFeedback(successMessage);

    const analyticsPayload = buildReferralAnalyticsPayload(growthPlan, {
      referral_code: inviteCode || undefined,
    });

    if (analyticsEvent === 'code') {
      analyticsService.logInviteCodeCopied(inviteCode, entrySource, analyticsPayload);
      return;
    }

    analyticsService.logInviteLinkCopied(entrySource, analyticsPayload);
  };

  const handleShareInvite = async () => {
    const preparedInvite = await ensureInviteReady();
    const shareCopy = buildReferralShareText({
      inviteCode: preparedInvite.code,
      inviteUrl: preparedInvite.inviteUrl,
      variant: growthPlan.shareVariant,
      lang: preparedInvite.campaign.variant === 'diaspora' ? 'en' : 'tr',
      campaign: preparedInvite.campaign,
    });

    const baseAnalyticsPayload = buildReferralAnalyticsPayload(growthPlan, {
      referral_code: preparedInvite.code,
    });

    try {
      if (Capacitor.isNativePlatform()) {
        analyticsService.logInviteShareOpened(entrySource, 'native_share', baseAnalyticsPayload);
        await Share.share({
          title: shareCopy.title,
          text: shareCopy.text,
          url: preparedInvite.inviteUrl,
          dialogTitle: shareCopy.dialogTitle,
        });
        analyticsService.logEvent(ANALYTICS_EVENTS.SHARE_SENT, {
          card_type: 'invite_link',
          channel: 'native_share',
          ...baseAnalyticsPayload,
        });
        setFeedback('Davet paylasildi. Ilk donus oldugunda burada gormeye baslayacaksin.');
        return;
      }

      if (navigator.share) {
        analyticsService.logInviteShareOpened(entrySource, 'web_share', baseAnalyticsPayload);
        await navigator.share({
          title: shareCopy.title,
          text: shareCopy.text,
          url: preparedInvite.inviteUrl,
        });
        analyticsService.logEvent(ANALYTICS_EVENTS.SHARE_SENT, {
          card_type: 'invite_link',
          channel: 'web_share',
          ...baseAnalyticsPayload,
        });
        setFeedback('Davet paylasildi. Ilk donus oldugunda burada gormeye baslayacaksin.');
        return;
      }

      analyticsService.logInviteShareOpened(entrySource, 'clipboard', baseAnalyticsPayload);
      await navigator.clipboard.writeText(shareCopy.text);
      analyticsService.logEvent(ANALYTICS_EVENTS.SHARE_SENT, {
        card_type: 'invite_link',
        channel: 'clipboard',
        ...baseAnalyticsPayload,
      });
      setFeedback('Paylasim metni kopyalandi. Tek bir kisiye gondermen yeterli.');
    } catch (error) {
      setFeedback('Paylasim yarida kaldi. Istersen once linki kopyalayip elle gonderebilirsin.');
      logger.error('[InviteModal] Share error', error);
    }
  };

  const blockedLabel = formatBlockedUntil(growthPlan.blockedUntil);
  const hasInviteReady = Boolean(inviteUrl && inviteCode);

  return (
    <div className="invite-modal-overlay">
      <div className="invite-modal-card reveal-stagger">
        <button
          onClick={onClose}
          className="invite-modal-close"
          aria-label="Kapat"
        >
          <X size={18} />
        </button>

        <div className="invite-modal-header">
          <div className="invite-icon-box">
            <Gift size={30} />
          </div>
          <div className="invite-badge-row">
            <span className="invite-badge">{growthPlan.badge}</span>
            {syncing ? (
              <span className="invite-sync-pill">
                <LoaderCircle size={12} className="spin-icon" />
                Esitleniyor
              </span>
            ) : null}
          </div>
          <h3>{growthPlan.headline}</h3>
          <p>{growthPlan.description}</p>
        </div>

        {referralExpiry && (
          <div className="referral-expiry-banner">
            <div className="referral-expiry-icon">
              <Sparkles size={16} />
            </div>
            <div className="referral-expiry-content">
              <p className="referral-expiry-title">Pro üyeliğin aktif!</p>
              <p className="referral-expiry-timer">
                {referralExpiry.hours > 0 
                  ? `${referralExpiry.hours} saat ${referralExpiry.minutes} dakika`
                  : `${referralExpiry.minutes} dakika`} kaldı
              </p>
              <p className="referral-expiry-hint">
                Davet ederek süreyi uzatabilir veya abone olabilirsin.
              </p>
            </div>
          </div>
        )}

        <div className="invite-stats-grid">
          {growthPlan.stats.map((stat) => (
            <div key={stat.id} className="invite-stat-card">
              <div className="invite-stat-value">{stat.value}</div>
              <div className="invite-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="invite-funnel-card">
          <div className="invite-section-title">
            <Sparkles size={14} />
            Referral hunisi
          </div>
          <div className="invite-funnel-grid">
            {funnelMetrics.map((metric) => (
              <div key={metric.id} className="invite-funnel-metric">
                <div className="invite-funnel-value">{metric.value}</div>
                <div className="invite-funnel-label">{metric.label}</div>
              </div>
            ))}
          </div>
          <div className="invite-funnel-helper">
            Link hazirlandiktan sonra hangi asamada hareket oldugunu buradan gorebilirsin.
          </div>
        </div>

        {growthPlan.riskState === 'blocked' ? (
          <div className="invite-warning-card">
            <ShieldAlert size={18} />
            <div>
              <strong>Guvenlik molasi aktif</strong>
              <p>
                {blockedLabel
                  ? `${blockedLabel} sonrasinda tekrar deneyebilirsin.`
                  : 'Kisa bir sure sonra tekrar deneyebilirsin.'}
              </p>
            </div>
          </div>
        ) : null}

        <div className="invite-steps-card">
          <div className="invite-section-title">
            <Sparkles size={14} />
            Growth loop
          </div>
          <div className="invite-step-list">
            {growthPlan.steps.map((step) => (
              <div key={step.id} className={`invite-step-item status-${step.status}`}>
                <div className="invite-step-marker">
                  {step.status === 'done' ? <CheckCircle2 size={14} /> : step.status === 'active' ? <Sparkles size={14} /> : <span />}
                </div>
                <div className="invite-step-copy">
                  <strong>{step.label}</strong>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="invite-note-card">
          <div className="invite-section-title">
            <Link2 size={14} />
            Paylasim notu
          </div>
          <p>{growthPlan.supportingNote}</p>
          {growthPlan.syncIssue ? (
            <p className="invite-note-subtle">
              Davet iliskisi sunucuda henuz tam eslesmedi. Linki kullanan ilk kisi geldikce burada netlesecek.
            </p>
          ) : null}
        </div>

        <div className="invite-actions-card">
          <div className="invite-actions-topline">
            <span>Davet kodun</span>
            {inviteCode ? (
              <button
                type="button"
                className="invite-inline-copy"
                onClick={() => writeClipboard(inviteCode, 'Davet kodu kopyalandi.', 'code')}
              >
                <Copy size={14} />
                Kopyala
              </button>
            ) : null}
          </div>

          <div className="invite-code-pill">
            {inviteCode || 'Hazir degil'}
          </div>

          {inviteUrl ? (
            <button
              type="button"
              className="invite-link-preview"
              onClick={() => writeClipboard(inviteUrl, 'Davet linki kopyalandi.', 'link')}
            >
              <span>{inviteUrl}</span>
              <Copy size={14} />
            </button>
          ) : (
            <div className="invite-link-placeholder">
              Link ilk paylasim oncesi tek tikla hazirlanir.
            </div>
          )}

          <button
            onClick={handleShareInvite}
            className="invite-primary-button"
          >
            <Send size={18} />
            {hasInviteReady ? growthPlan.shareLabel : 'Davet linkini hazirla'}
          </button>

          <div className="invite-support-text">
            {hasInviteReady ? growthPlan.shareSupportLabel : 'Link bir kez hazirlandiktan sonra tekrar tekrar kullanabilirsin.'}
          </div>
        </div>

        {feedback ? (
          <div className="invite-feedback">
            {feedback}
          </div>
        ) : null}
      </div>

      <style>{`
        .invite-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(4, 20, 16, 0.88);
          backdrop-filter: blur(10px);
          z-index: 10003;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.25s ease;
        }

        .invite-modal-card {
          width: min(460px, 100%);
          max-height: 92vh;
          overflow-y: auto;
          padding: 28px 24px 24px;
          border-radius: 28px;
          position: relative;
          background:
            radial-gradient(circle at top right, rgba(212, 175, 55, 0.18), transparent 34%),
            linear-gradient(145deg, rgba(15, 61, 46, 0.98), rgba(7, 36, 27, 0.98));
          border: 1px solid rgba(212, 175, 55, 0.24);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        }

        .invite-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid rgba(212, 175, 55, 0.18);
          background: rgba(255, 255, 255, 0.06);
          color: var(--nav-text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .invite-modal-header {
          text-align: center;
          margin-bottom: 18px;
        }

        .referral-expiry-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          margin-bottom: 16px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.06));
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 16px;
        }

        .referral-expiry-icon {
          color: var(--secondary);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .referral-expiry-content {
          flex: 1;
        }

        .referral-expiry-title {
          margin: 0 0 6px 0;
          color: var(--on-secondary-container);
          font-size: 0.88rem;
          font-weight: 800;
        }

        .referral-expiry-timer {
          margin: 0 0 6px 0;
          color: var(--tertiary);
          font-size: 1.1rem;
          font-weight: 950;
        }

        .referral-expiry-hint {
          margin: 0;
          color: var(--secondary-fixed-dim);
          font-size: 0.74rem;
          line-height: 1.5;
          font-weight: 600;
        }

        .invite-icon-box {
          width: 62px;
          height: 62px;
          border-radius: 22px;
          margin: 0 auto 14px;
          background: rgba(212, 175, 55, 0.14);
          color: var(--tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 24px rgba(212, 175, 55, 0.12);
        }

        .invite-badge-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .invite-badge,
        .invite-sync-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 0.72rem;
          font-weight: 900;
        }

        .invite-badge {
          background: rgba(212, 175, 55, 0.16);
          color: var(--tertiary-fixed-dim);
          border: 1px solid rgba(212, 175, 55, 0.22);
        }

        .invite-sync-pill {
          background: rgba(15, 118, 110, 0.18);
          color: var(--secondary-fixed-dim);
          border: 1px solid rgba(15, 118, 110, 0.2);
        }

        .invite-modal-header h3 {
          margin: 0 0 8px 0;
          font-size: 1.45rem;
          font-weight: 950;
          color: var(--nav-text);
          letter-spacing: -0.04em;
        }

        .invite-modal-header p {
          margin: 0;
          color: var(--nav-text-muted);
          line-height: 1.55;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .invite-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }

        .invite-stat-card,
        .invite-funnel-card,
        .invite-steps-card,
        .invite-note-card,
        .invite-actions-card,
        .invite-warning-card,
        .invite-feedback {
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.05);
        }

        .invite-stat-card {
          padding: 14px 12px;
          text-align: center;
        }

        .invite-stat-value {
          color: var(--nav-text);
          font-size: 1.05rem;
          font-weight: 950;
          margin-bottom: 4px;
        }

        .invite-stat-label {
          color: var(--nav-text-muted);
          font-size: 0.72rem;
          line-height: 1.4;
          font-weight: 700;
        }

        .invite-warning-card,
        .invite-funnel-card,
        .invite-steps-card,
        .invite-note-card,
        .invite-actions-card,
        .invite-feedback {
          padding: 16px;
          margin-bottom: 14px;
        }

        .invite-warning-card {
          display: flex;
          gap: 12px;
          border-color: rgba(245, 158, 11, 0.25);
          background: rgba(180, 83, 9, 0.10);
          color: var(--on-tertiary-container);
        }

        .invite-warning-card strong {
          display: block;
          margin-bottom: 4px;
          font-size: 0.86rem;
        }

        .invite-warning-card p {
          margin: 0;
          font-size: 0.76rem;
          line-height: 1.5;
          color: var(--tertiary-fixed-dim);
        }

        .invite-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.76rem;
          font-weight: 900;
          color: var(--nav-accent);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }

        .invite-step-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .invite-funnel-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .invite-funnel-metric {
          border-radius: 16px;
          border: 1px solid rgba(212, 175, 55, 0.14);
          background: rgba(255, 255, 255, 0.04);
          padding: 12px 10px;
          text-align: center;
        }

        .invite-funnel-value {
          font-size: 1.05rem;
          font-weight: 900;
          color: var(--nav-text);
          margin-bottom: 4px;
        }

        .invite-funnel-label {
          font-size: 0.66rem;
          font-weight: 800;
          color: var(--nav-text-muted);
          text-transform: uppercase;
          line-height: 1.35;
        }

        .invite-funnel-helper {
          margin-top: 10px;
          font-size: 0.72rem;
          color: var(--nav-text-muted);
          line-height: 1.45;
          font-weight: 700;
        }

        .invite-step-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .invite-step-item.status-done {
          border-color: rgba(16, 185, 129, 0.22);
          background: rgba(16, 185, 129, 0.08);
        }

        .invite-step-item.status-active {
          border-color: rgba(212, 175, 55, 0.2);
          background: rgba(212, 175, 55, 0.08);
        }

        .invite-step-marker {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          color: var(--nav-accent);
        }

        .invite-step-copy strong {
          display: block;
          color: var(--nav-text);
          font-size: 0.84rem;
          margin-bottom: 4px;
        }

        .invite-step-copy p,
        .invite-note-card p,
        .invite-note-subtle {
          margin: 0;
          color: var(--nav-text-muted);
          font-size: 0.76rem;
          line-height: 1.55;
          font-weight: 600;
        }

        .invite-note-subtle {
          margin-top: 8px !important;
          color: rgba(217, 230, 219, 0.72) !important;
        }

        .invite-actions-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
          color: var(--nav-text-muted);
          font-size: 0.74rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .invite-inline-copy {
          border: none;
          border-radius: 999px;
          background: rgba(212, 175, 55, 0.12);
          color: var(--nav-accent);
          padding: 6px 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 900;
          cursor: pointer;
        }

        .invite-code-pill {
          border-radius: 18px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.04);
          color: var(--nav-text);
          font-size: 1.18rem;
          font-weight: 950;
          text-align: center;
          letter-spacing: 0.16em;
          border: 1px solid rgba(212, 175, 55, 0.18);
          margin-bottom: 10px;
        }

        .invite-link-preview,
        .invite-link-placeholder {
          width: 100%;
          border-radius: 16px;
          padding: 12px 14px;
          margin-bottom: 12px;
          font-size: 0.76rem;
          line-height: 1.45;
        }

        .invite-link-preview {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: var(--nav-text-muted);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          text-align: left;
          cursor: pointer;
        }

        .invite-link-preview span {
          overflow-wrap: anywhere;
          flex: 1;
        }

        .invite-link-placeholder {
          border: 1px dashed rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.025);
          color: var(--nav-text-muted);
        }

        .invite-primary-button {
          width: 100%;
          border: none;
          border-radius: 18px;
          padding: 15px 16px;
          background: linear-gradient(135deg, var(--nav-accent), var(--surface-container));
          color: var(--on-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.94rem;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(15, 118, 110, 0.22);
        }

        .invite-support-text {
          margin-top: 10px;
          color: var(--nav-text-muted);
          font-size: 0.74rem;
          line-height: 1.5;
          font-weight: 600;
          text-align: center;
        }

        .invite-feedback {
          color: var(--on-secondary-container);
          border-color: rgba(16, 185, 129, 0.18);
          background: rgba(16, 185, 129, 0.10);
          font-size: 0.78rem;
          line-height: 1.5;
          font-weight: 700;
        }

        .spin-icon {
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 480px) {
          .invite-modal-card {
            padding: 24px 18px 18px;
          }

          .invite-stats-grid {
            grid-template-columns: 1fr;
          }

          .invite-funnel-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default InviteModal;
