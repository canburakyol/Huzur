import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGroupHatim } from '../../hooks/useGroupHatim';
import CreateHatimModal from './CreateHatimModal';
import HatimCard from './HatimCard';

const HatimList = ({ onSelectHatim }) => {
  const { t } = useTranslation();
  const { activeHatims, fetchMyHatims, loading, error } = useGroupHatim();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const { joinHatim } = useGroupHatim();

  useEffect(() => {
    fetchMyHatims();
  }, [fetchMyHatims]);

  const handleJoin = async () => {
    if (!joinCode) return;
    try {
      await joinHatim(joinCode);
      setShowJoinInput(false);
      setJoinCode('');
    } catch (error) {
      alert(t('common.error', 'Hata oluştu') + ': ' + error.message);
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
        <button className="btn" onClick={fetchMyHatims} style={{ marginTop: '10px' }}>Tekrar Dene</button>
      </div>
    );
  }

  return (
    <div className="hatim-list">
      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ flex: 1, fontSize: '14px' }}
        >
          + {t('hatim.create', 'Yeni Hatim')}
        </button>
        <button 
          className="btn"
          onClick={() => setShowJoinInput(!showJoinInput)}
          style={{ flex: 1, fontSize: '14px', background: 'rgba(255,255,255,0.2)' }}
        >
          {t('hatim.join', 'Koda Katıl')}
        </button>
      </div>

      {/* Join Input */}
      {showJoinInput && (
        <div className="glass-card" style={{ padding: '15px' }}>
          <input
            type="text"
            placeholder="Davet kodu (Örn: X8K2L9)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(255,255,255,0.1)',
              color: 'var(--text-color)',
              marginBottom: '10px'
            }}
          />
          <button className="btn btn-primary" onClick={handleJoin}>
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
            onClick={onSelectHatim}
          />
        ))}

        {activeHatims.length === 0 && !loading && (
           <div style={{ textAlign: 'center', color: 'var(--text-color-muted)', padding: '20px' }}>
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
            fetchMyHatims();
          }}
        />
      )}
    </div>
  );
};

export default HatimList;

