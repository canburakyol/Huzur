import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDua } from '../../hooks/useDua';
import CreateDuaModal from './CreateDuaModal';
import DuaCard from './DuaCard';
import { getCurrentUserId } from '../../services/authService';
import { logger } from '../../utils/logger';

const DuaList = () => {
  const { t } = useTranslation();
  const { duas, loading, error, prayForDua } = useDua();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const currentUserId = getCurrentUserId();

  const isPrayed = (dua) => {
    return dua.aminBy && dua.aminBy.includes(currentUserId);
  };

  const handlePray = async (duaId) => {
    const dua = duas.find(d => d.id === duaId);
    if (isPrayed(dua)) return; 
    
    try {
      await prayForDua(duaId);
    } catch (error) {
      logger.error('Amin error:', error);
    }
  };

  if (loading && duas.length === 0) {
    return <div style={{ color: 'var(--text-color)', textAlign: 'center', marginTop: '20px' }}>Yükleniyor...</div>;
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
        <p style={{ margin: '0 0 8px' }}>⚠️ Firebase bağlantı/izin hatası</p>
        <p style={{ fontSize: '12px', margin: 0 }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="dua-list">
      {/* Actions */}
      <div style={{ marginBottom: '24px' }}>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
        >
          ✍️ {t('dua.create', 'Dua İste')}
        </button>
      </div>

      {/* List - Using memoized DuaCard */}
      <div className="dua-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {duas.map(dua => (
          <DuaCard 
            key={dua.id}
            dua={dua}
            isPrayed={isPrayed(dua)}
            onPray={handlePray}
          />
        ))}

        {duas.length === 0 && !loading && (
           <div style={{ 
             textAlign: 'center', 
             color: 'var(--text-color-muted)', 
             padding: '40px 20px',
             background: 'var(--glass-bg)',
             borderRadius: '12px',
             border: '1px solid var(--glass-border)'
           }}>
             Henüz hiç dua isteği yok. İlk isteyen siz olun.
           </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateDuaModal 
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default DuaList;

