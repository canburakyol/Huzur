import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGroupHatim } from '../../hooks/useGroupHatim';
import CreateHatimModal from './CreateHatimModal';
import HatimCard from './HatimCard';

const HatimList = ({ onSelectHatim }) => {
  const { t } = useTranslation();
  const { activeHatims, fetchAllPublicHatims, loading, error, joinHatim, userId } = useGroupHatim();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [targetHatimId, setTargetHatimId] = useState(null);

  useEffect(() => {
    fetchAllPublicHatims();
  }, [fetchAllPublicHatims]);

  const handleJoin = async () => {
    if (!joinCode) return;
    try {
      await joinHatim(joinCode);
      setShowJoinInput(false);
      setJoinCode('');
      setTargetHatimId(null);
      fetchAllPublicHatims(); // Refresh list to show as joined
    } catch (error) {
      alert(t('common.error', 'Hata oluştu') + ': ' + error.message);
    }
  };

  const handleHatimClick = (hatim) => {
    const isMember = hatim.readers?.includes(userId);
    if (isMember) {
      onSelectHatim(hatim.id);
    } else {
      setTargetHatimId(hatim.id);
      setJoinCode('');
      setShowJoinInput(true);
      // Scroll to join input
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && activeHatims.length === 0) {
    return <div style={{ color: 'var(--text-color)', textAlign: 'center', marginTop: '20px' }}>Yükleniyor...</div>;
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--warning-color)' }}>
        <p>⚠️ Bir sorun oluştu</p>
        <p style={{ fontSize: '12px', marginTop: '5px' }}>{error}</p>
        <button className="btn" onClick={fetchAllPublicHatims} style={{ marginTop: '10px' }}>Tekrar Dene</button>
      </div>
    );
  }

  return (
    <div className="hatim-list">
      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '14px' }}
        >
          + {t('hatim.create', 'Yeni Hatim')}
        </button>
        <button
          className="btn"
          onClick={() => {
            setShowJoinInput(!showJoinInput);
            setTargetHatimId(null);
          }}
          style={{ 
            flex: 1, 
            padding: '14px', 
            borderRadius: '12px', 
            fontSize: '14px', 
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-color)'
          }}
        >
          {t('hatim.join', 'Koda Katıl')}
        </button>
      </div>

      {/* Join Input */}
      {showJoinInput && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', border: `2px solid ${targetHatimId ? 'var(--secondary-color)' : 'var(--primary-color)'}` }}>
          {targetHatimId && (
            <p style={{ color: 'var(--secondary-color)', fontSize: '14px', marginBottom: '12px', fontWeight: 'bold' }}>
              ℹ️ Bu hatime katılmak için davet kodunu girmelisiniz:
            </p>
          )}
          <input
            type="text"
            placeholder="Davet kodu (Örn: X8K2L9)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(0,0,0,0.2)',
              color: 'var(--text-color)',
              marginBottom: '12px',
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '2px'
            }}
          />
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleJoin}>
             Katıl
          </button>
        </div>
      )}

      {/* List - Using memoized HatimCard */}
      <div className="hatim-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {activeHatims.map(hatim => (
          <HatimCard 
            key={hatim.id}
            hatim={hatim}
            onClick={() => handleHatimClick(hatim)}
            isMember={hatim.readers?.includes(userId)}
          />
        ))}

        {activeHatims.length === 0 && !loading && (
           <div style={{ 
             textAlign: 'center', 
             color: 'var(--text-color-muted)', 
             padding: '40px 20px',
             background: 'var(--glass-bg)',
             borderRadius: '12px',
             border: '1px solid var(--glass-border)'
           }}>
              Henüz katıldığınız bir hatim yok.
           </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateHatimModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchAllPublicHatims();
          }}
        />
      )}
    </div>
  );
};

export default HatimList;

