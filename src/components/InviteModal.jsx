import { useState } from 'react';
import { Gift, Link2, Send, X } from 'lucide-react';
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
        alert('Davet linki kopyalandı!');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10003,
        background: 'rgba(0,0,0,0.58)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18
      }}
    >
      <div className="glass-card" style={{ width: '100%', maxWidth: 430, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center', color: '#d4af37' }}>
            <Gift size={18} /> Arkadaşını Davet Et
          </h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ marginTop: 10, marginBottom: 14, opacity: 0.85 }}>
          Davet linki oluşturup paylaş. Referans ilerlemeni aşağıda takip edebilirsin.
        </p>

        {referralProgress && (
          <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Referans Durumu</div>
            <div style={{ fontSize: 13, marginBottom: 4 }}>
              Davet eden ödülü: {referralProgress.rewards?.inviterUnlockedAt ? 'Açıldı' : 'Beklemede'}
            </div>
            <div style={{ fontSize: 13 }}>
              Davet edilen ödülü: {referralProgress.rewards?.inviteeUnlockedAt ? 'Açıldı' : 'Beklemede'}
            </div>
          </div>
        )}

        {!inviteUrl ? (
          <button
            onClick={handleCreateInvite}
            style={{
              width: '100%',
              border: '1px solid #d4af37',
              borderRadius: 10,
              background: '#d4af37',
              color: '#14352a',
              padding: '11px 12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Link2 size={16} /> Davet Linki Oluştur
          </button>
        ) : (
          <>
            <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.75 }}>Davet Kodu</div>
              <div style={{ fontWeight: 700 }}>{inviteCode}</div>
              <div style={{ marginTop: 6, fontSize: 12, wordBreak: 'break-all' }}>{inviteUrl}</div>
            </div>

            <button
              onClick={handleShareInvite}
              style={{
                width: '100%',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                padding: '11px 12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Send size={16} /> Linki Paylaş
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InviteModal;
