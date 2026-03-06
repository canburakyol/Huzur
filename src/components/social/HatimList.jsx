import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGroupHatim } from '../../hooks/useGroupHatim';
import CreateHatimModal from './CreateHatimModal';
import HatimCard from './HatimCard';
import { BookOpen, RefreshCw, Users } from 'lucide-react';
import './Social.css';

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
    return (
      <div className="settings-card reveal-stagger" style={{ justifyContent: 'center', padding: '40px' }}>
         <div className="spin"><RefreshCw size={32} color="var(--nav-accent)" /></div>
         <p style={{ margin: '16px 0 0', fontSize: '0.9rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-card reveal-stagger" style={{ borderColor: '#ef4444', flexDirection: 'column', gap: '12px' }}>
        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#ef4444' }}>⚠️ {t('common.error')}</p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>{error}</p>
        <button 
          className="velocity-btn-primary" 
          onClick={fetchAllPublicHatims} 
          style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', boxShadow: 'none' }}
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="hatim-list">
      {/* Actions */}
      <div className="sanctuary-actions reveal-stagger" style={{ marginBottom: '24px' }}>
        <button
          className="sanctuary-btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ flex: 1.5 }}
        >
          <BookOpen size={18} />
          {t('hatim.create')}
        </button>
        <button
          className="sanctuary-btn-outline"
          onClick={() => {
            setShowJoinInput(!showJoinInput);
            setTargetHatimId(null);
          }}
          style={{ flex: 1 }}
        >
          {t('hatim.join')}
        </button>
      </div>

      {/* Join Input */}
      {showJoinInput && (
        <div className="sanctuary-join-input-card reveal-stagger">
          {targetHatimId && (
            <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--hb-accent)', fontWeight: '800', textAlign: 'center' }}>
              ℹ️ {t('hatim.lockedDescShort', 'Katılmak için davet kodu giriniz:')}
            </p>
          )}
          <input
            type="text"
            className="code-field"
            placeholder="KODU GİR"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={8}
            style={{ marginBottom: '16px' }}
          />
          <button className="sanctuary-btn-primary" style={{ width: '100%' }} onClick={handleJoin}>
             {t('hatim.join')}
          </button>
        </div>
      )}

      {/* List - Using memoized HatimCard */}
      <div className="hatim-grid reveal-stagger" style={{ '--delay': '0.5s', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {activeHatims.map(hatim => (
          <HatimCard 
            key={hatim.id}
            hatim={hatim}
            onClick={() => handleHatimClick(hatim)}
            isMember={hatim.readers?.includes(userId)}
          />
        ))}

        {activeHatims.length === 0 && !loading && (
           <div className="settings-card reveal-stagger" style={{ flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: '16px' }}>
              <Users size={48} color="rgba(79, 70, 229, 0.4)" />
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--nav-text-muted)', fontWeight: '700', textAlign: 'center' }}>
                {t('hatim.noHatims', 'Henüz katıldığınız bir hatim yok.')}
              </p>
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

