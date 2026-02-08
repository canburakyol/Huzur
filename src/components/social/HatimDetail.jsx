import { useState } from 'react';
import { useGroupHatim } from '../../hooks/useGroupHatim';
import { getCurrentUserId } from '../../services/authService';

const HatimDetail = ({ hatimId, onBack }) => {
  const { hatimDetails, loading, error, takePart, releasePart, completePart } = useGroupHatim(hatimId);
  const currentUserId = getCurrentUserId();
  
  // Local state to track which part is being interacted with (for loading states)
  const [processingPart, setProcessingPart] = useState(null);

  if (loading && !hatimDetails) return <div style={{ color: 'var(--text-color)', padding: '20px', textAlign: 'center' }}>Yükleniyor...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Hata: {error}</div>;
  if (!hatimDetails) return null;

  // Extra security: If user somehow got here without being a member
  const isMember = hatimDetails.readers?.includes(currentUserId);
  if (!isMember) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-color)' }}>
        <p>⚠️ Bu hatimin detaylarını görmek için önce katılmalısınız.</p>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: '20px' }}>Geri Dön</button>
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

  const getPartColor = (status, isMine) => {
    if (status === 'completed') return 'var(--success-color)'; // Green
    if (status === 'taken') return isMine ? 'var(--warning-color)' : 'rgba(255,255,255,0.3)'; // Orange if mine, gray transparent if others
    return 'rgba(255,255,255,0.1)'; // Empty
  };

  const getPartBorder = (status, isMine) => {
    if (status === 'taken' && isMine) return '2px solid var(--warning-color)';
    if (status === 'completed') return '2px solid var(--success-color)';
    return '1px solid var(--glass-border)';
  };

  return (
    <div className="hatim-detail" style={{ animation: 'fadeIn 0.3s' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={onBack} className="btn-icon" style={{ color: 'var(--text-color)', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>{hatimDetails.name}</h3>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-color-muted)' }}>Kod: {hatimDetails.joinCode} (Dokunarak Kopyala)</p>
        </div>
      </div>

      {/* Grid */}
      <div className="glass-card" style={{ padding: '15px' }}>
         <h4 style={{ marginTop: 0, marginBottom: '15px', color: 'var(--text-color)' }}>Cüz Durumları</h4>
         <div style={{
           display: 'grid',
           gridTemplateColumns: 'repeat(5, 1fr)',
           gap: '8px'
         }}>
           {Array.from({ length: 30 }, (_, i) => i + 1).map(num => {
             const part = hatimDetails.parts?.[num] || { status: 'free' };
             const isMine = part.takenBy?.uid === currentUserId;
             const isLoading = processingPart === num;

             return (
               <button
                 key={num}
                 onClick={() => handlePartClick(num, part)}
                 disabled={isLoading}
                 style={{
                   aspectRatio: '1',
                   borderRadius: '8px',
                   border: getPartBorder(part.status, isMine),
                   background: getPartColor(part.status, isMine),
                   color: 'var(--text-color)',
                   fontWeight: 'bold',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   position: 'relative',
                   fontSize: '14px'
                 }}
               >
                 {isLoading ? '...' : num}
                 {isMine && part.status === 'taken' && (
                   <span style={{ position: 'absolute', bottom: '2px', fontSize: '8px' }}>SİZDE</span>
                 )}
               </button>
             );
           })}
         </div>

         {/* Legend */}
         <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-color-muted)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
             <div style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)' }}></div> Boş
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--warning-color)' }}></div> Sizde
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.3)' }}></div> Başkasında
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--success-color)' }}></div> Okundu
           </div>
         </div>
      </div>
     
      {/* Share Button */}
      <button 
        className="btn btn-primary"
        onClick={() => {
          navigator.clipboard.writeText(hatimDetails.joinCode);
          alert('Davet kodu kopyalandı!');
        }}
        style={{ 
          width: '100%', 
          marginTop: '20px', 
          padding: '14px', 
          borderRadius: '12px',
          fontWeight: 'bold'
        }}
      >
        Davet Kodunu Kopyala
      </button>

    </div>
  );
};

export default HatimDetail;
