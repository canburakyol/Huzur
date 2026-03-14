import { useState } from 'react';
import { useGroupHatim } from '../../hooks/useGroupHatim';
import { getCurrentUserId } from '../../services/authService';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, Share2, Info, CheckCircle, RefreshCw, Hash } from 'lucide-react';
import './Social.css';

const HatimDetail = ({ hatimId, onBack }) => {
  const { t } = useTranslation();
  const { hatimDetails, loading, error, takePart, releasePart, completePart } = useGroupHatim(hatimId);
  const currentUserId = getCurrentUserId();
  
  // Local state to track which part is being interacted with (for loading states)
  const [processingPart, setProcessingPart] = useState(null);

  if (loading && !hatimDetails) {
    return (
      <div className="settings-card reveal-stagger" style={{ justifyContent: 'center', padding: '40px' }}>
         <div className="spin"><RefreshCw size={32} color="var(--nav-accent)" /></div>
         <p style={{ margin: '16px 0 0', fontSize: '0.9rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manuscript-card reveal-stagger" style={{ borderColor: '#ef4444' }}>
        <p className="lesson-title">⚠️ {t('common.error')}</p>
        <p className="lesson-desc">{error}</p>
      </div>
    );
  }
  if (!hatimDetails) return null;

  // Extra security: If user somehow got here without being a member
  const isMember = hatimDetails.readers?.includes(currentUserId);
  if (!isMember) {
    return (
      <div className="manuscript-card reveal-stagger" style={{ textAlign: 'center' }}>
        <Info size={48} color="var(--soc-teal-dark)" style={{ marginBottom: '15px' }} />
        <p className="lesson-desc">⚠️ {t('hatim.membershipRequired', 'Bu hatimin detaylarını görmek için önce katılmalısınız.')}</p>
        <button onClick={onBack} className="sanctuary-btn-primary" style={{ marginTop: '20px', width: '100%' }}>
          {t('common.back')}
        </button>
      </div>
    );
  }

  const handlePartClick = async (partNum, partData) => {
    if (processingPart) return; // Prevent double clicks
    setProcessingPart(partNum);

    try {
      // Logic for changing status
      if (partData.status === 'free') {
        // Take it
        if (window.confirm(`${partNum}. Cüzü okumak için almak istiyor musunuz?`)) {
          await takePart(partNum);
        }
      } else if (partData.status === 'taken') {
        // Only owner can act
        if (partData.takenBy?.uid === currentUserId) {
           const action = window.prompt(
             `Bu cüz sizin tarafınızdan alındı.\n'okudum' yazarak tamamlayın\n'iptal' yazarak bırakın`
           );
           
           if (action?.toLowerCase() === 'okudum') {
             await completePart(partNum);
           } else if (action?.toLowerCase() === 'iptal') {
             await releasePart(partNum);
           }
        } else {
          alert(`Bu cüz ${partData.takenBy?.name} tarafından alınmış.`);
        }
      } else if (partData.status === 'completed') {
        alert(`Bu cüz ${partData.takenBy?.name} tarafından okundu. Allah kabul etsin!`);
      }
    } catch (err) {
      console.error(err);
      alert('İşlem yapılamadı.');
    } finally {
      setProcessingPart(null);
    }
  };


  return (
    <div className="hatim-detail reveal-stagger">
      {/* Header */}
      <div className="settings-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', border: '1px solid var(--hb-border)' }}>
        <button onClick={onBack} className="premium-icon-btn" style={{ background: 'var(--hb-hover)', color: 'var(--hb-accent)', width: '44px', height: '44px', borderRadius: '14px' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '950', color: 'var(--hb-bg)', letterSpacing: '-0.5px' }}>
            {hatimDetails.name}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--hb-accent)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Hash size={14} /> {hatimDetails.joinCode}
          </p>
        </div>
        <button 
          className="premium-icon-btn" 
          style={{ background: 'rgba(180, 83, 9, 0.1)', color: 'var(--hb-accent)', width: '44px', height: '44px', borderRadius: '14px', border: '1px solid rgba(180, 83, 9, 0.2)' }}
          onClick={() => {
            navigator.clipboard.writeText(hatimDetails.joinCode);
            alert(t('hatim.messages.codeCopied'));
          }}
        >
          <Copy size={20} />
        </button>
      </div>

      {/* Grid */}
      <div className="settings-card" style={{ flexDirection: 'column', padding: '24px', border: '1px solid var(--hb-border)' }}>
         <h4 style={{ margin: '0 0 24px 0', fontSize: '0.75rem', fontWeight: '900', color: 'var(--hb-bg)', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {t('hatim.statusGrid', 'Cüz Durumları')}
         </h4>
         <div className="sanctuary-grid">
           {Array.from({ length: 30 }, (_, i) => i + 1).map(num => {
             const part = hatimDetails.parts?.[num] || { status: 'free' };
             const isMine = part.takenBy?.uid === currentUserId;
             const isLoading = processingPart === num;

             let statusClass = 'free';
             if (part.status === 'completed') statusClass = 'completed';
             else if (part.status === 'taken') statusClass = isMine ? 'taken-mine' : 'taken-others';

             return (
               <button
                 key={num}
                 onClick={() => handlePartClick(num, part)}
                 disabled={isLoading}
                 className={`part-btn ${statusClass}`}
                 style={{
                   borderRadius: '14px',
                   border: '1px solid rgba(0,0,0,0.05)',
                   fontWeight: '900',
                   transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                 }}
               >
                 {isLoading ? <RefreshCw size={16} className="spin" /> : num}
                 {isMine && part.status === 'taken' && (
                   <span className="part-label-mini" style={{ color: 'var(--hb-accent)', fontWeight: '950' }}>{t('hatim.mine', 'SİZDE')}</span>
                 )}
                 {part.status === 'completed' && (
                   <span className="part-label-mini" style={{ color: 'white', opacity: 0.7 }}>
                     <CheckCircle size={12} fill="white" />
                   </span>
                 )}
               </button>
             );
           })}
         </div>

         {/* Legend */}
         <div style={{ 
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', 
            marginTop: '32px', padding: '18px', background: 'rgba(0,0,0,0.03)', borderRadius: '18px' 
         }}>
            <div className="legend-item" style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--hb-bg)', opacity: 0.6 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'white', border: '1.5px solid rgba(0,0,0,0.1)' }}></div>
              {t('hatim.free', 'Boş')}
            </div>
            <div className="legend-item" style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--hb-bg)', opacity: 0.6 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--hb-emerald-light)', border: '1px solid var(--hb-bg)' }}></div>
              {t('hatim.mine', 'Sizde')}
            </div>
            <div className="legend-item" style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--hb-bg)', opacity: 0.6 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#f1f5f9', border: '1.5px solid rgba(0,0,0,0.05)' }}></div>
              {t('hatim.others', 'Başkasında')}
            </div>
            <div className="legend-item" style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--hb-bg)', opacity: 0.6 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--hb-bg)' }}></div>
              {t('hatim.completed', 'Okundu')}
            </div>
         </div>
      </div>
     
      {/* Share Button */}
      <button 
        className="sanctuary-btn-primary reveal-stagger"
        style={{ width: '100%', marginTop: '24px', padding: '18px', borderRadius: '20px' }}
        onClick={() => {
          const shareText = t('hatim.shareText', { title: hatimDetails.name, code: hatimDetails.joinCode });
          navigator.clipboard.writeText(shareText);
          alert(t('hatim.messages.inviteCopied'));
        }}
      >
        <Share2 size={20} />
        {t('hatim.share', 'Davet Kodunu Paylaş')}
      </button>

    </div>
  );
};

export default HatimDetail;

