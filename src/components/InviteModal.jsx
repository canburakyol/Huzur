import { useState } from 'react';
import { Gift, Link2, Send, X, Users, CheckCircle2, Copy } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { createInviteLink, getReferralProgress } from '../services/referralService';
import { analyticsService } from '../services/analyticsService';
import { getActiveCampaign } from '../services/campaignService';

const InviteModal = ({ isOpen, onClose }) => {
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const referralProgress = isOpen ? getReferralProgress() : null;

  if (!isOpen) return null;

  const handleCreateInvite = () => {
    const campaign = getActiveCampaign();
    const result = createInviteLink({
      source: 'invite_modal',
      campaign: campaign.id,
      lang: campaign.variant === 'diaspora' ? 'en' : 'tr'
    });
    setInviteUrl(result.inviteUrl);
    setInviteCode(result.code);
  };

  const handleShareInvite = async () => {
    if (!inviteUrl) return;
    const text = `Huzur uygulamasına katıl 🌙\n\nDavet kodum: ${inviteCode}\n${inviteUrl}`;

    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: 'Huzur Daveti',
          text: text,
          url: inviteUrl,
          dialogTitle: 'Arkadaşını Davet Et'
        });
        analyticsService.logShareSent('invite_link', 'native_share');
        return;
      }

      if (navigator.share) {
        await navigator.share({ title: 'Huzur Daveti', text, url: inviteUrl });
        analyticsService.logShareSent('invite_link', 'native_share');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        analyticsService.logShareSent('invite_link', 'clipboard');
        // Simple visual feedback instead of alert if possible, but keeping it for now
        alert('Davet linki kopyalandı!');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  return (
    <div className="velocity-modal-overlay">
      <div className="settings-card reveal-stagger" style={{ 
          flexDirection: 'column', padding: '32px', maxWidth: '440px', width: '90%',
          position: 'relative', border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(212, 175, 55, 0.1)'
      }}>
        <button 
            onClick={onClose}
            className="modal-close-btn"
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="settings-icon-box" style={{ 
              width: '64px', height: '64px', background: 'rgba(212, 175, 55, 0.15)', 
              color: '#d4af37', borderRadius: '20px', margin: '0 auto 16px' 
          }}>
            <Gift size={32} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '950', color: 'var(--nav-text)', letterSpacing: '-0.5px' }}>
             Arkadaşını Davet Et
          </h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600', lineHeight: '1.4' }}>
            Huzur'u paylaş, beraber kazanın. Referans ilerlemeni buradan takip edebilirsin.
          </p>
        </div>

        {referralProgress && (
          <div className="progress-section" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: 'var(--nav-text)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                Referans Durumu
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="progress-item">
                    <div className={`status-dot ${referralProgress.rewards?.inviterUnlockedAt ? 'active' : ''}`} />
                    <span style={{ flex: 1 }}>Davet Eden Ödülü</span>
                    <span style={{ fontWeight: '800', color: referralProgress.rewards?.inviterUnlockedAt ? '#10b981' : 'var(--nav-text-muted)' }}>
                        {referralProgress.rewards?.inviterUnlockedAt ? 'AÇILDI' : 'BEKLEMEDE'}
                    </span>
                    {referralProgress.rewards?.inviterUnlockedAt && <CheckCircle2 size={14} color="#10b981" />}
                </div>
                <div className="progress-item">
                    <div className={`status-dot ${referralProgress.rewards?.inviteeUnlockedAt ? 'active' : ''}`} />
                    <span style={{ flex: 1 }}>Davet Edilen Ödülü</span>
                    <span style={{ fontWeight: '800', color: referralProgress.rewards?.inviteeUnlockedAt ? '#10b981' : 'var(--nav-text-muted)' }}>
                        {referralProgress.rewards?.inviteeUnlockedAt ? 'AÇILDI' : 'BEKLEMEDE'}
                    </span>
                    {referralProgress.rewards?.inviteeUnlockedAt && <CheckCircle2 size={14} color="#10b981" />}
                </div>
            </div>
          </div>
        )}

        {!inviteUrl ? (
          <button
            onClick={handleCreateInvite}
            className="velocity-btn-primary"
            style={{ width: '100%', padding: '16px', background: '#d4af37' }}
          >
            <Link2 size={18} style={{ marginRight: '8px' }} />
            Davet Linki Oluştur
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="invite-info-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--nav-text-muted)', textTransform: 'uppercase' }}>Davet Kodu</span>
                  <Copy size={14} color="var(--nav-accent)" style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(inviteCode)} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--nav-text)', letterSpacing: '1px' }}>
                  {inviteCode}
              </div>
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--nav-border)', fontSize: '0.75rem', color: 'var(--nav-text-muted)', wordBreak: 'break-all', fontWeight: '600' }}>
                  {inviteUrl}
              </div>
            </div>

            <button
              onClick={handleShareInvite}
              className="velocity-btn-primary"
              style={{ width: '100%', padding: '16px' }}
            >
              <Send size={18} style={{ marginRight: '8px' }} />
              Linki Paylaş
            </button>
          </div>
        )}
      </div>

      <style>{`
        .velocity-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 10003;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }

        .modal-close-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            background: var(--nav-hover);
            border: none;
            color: var(--nav-text-muted);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .modal-close-btn:hover { background: var(--nav-border); color: var(--nav-text); }

        .progress-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--nav-hover);
            border-radius: 14px;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--nav-text);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--nav-border);
        }

        .status-dot.active {
            background: #10b981;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
        }

        .invite-info-card {
            background: var(--nav-hover);
            border: 1px solid var(--nav-border);
            border-radius: 16px;
            padding: 16px;
        }

        .velocity-btn-primary {
            background: var(--nav-accent);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 0.95rem;
            font-weight: 950;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .velocity-btn-primary:active { transform: scale(0.97); }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default InviteModal;
