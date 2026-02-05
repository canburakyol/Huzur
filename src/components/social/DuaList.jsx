import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDua } from '../../hooks/useDua';
import CreateDuaModal from './CreateDuaModal';
import DuaCard from './DuaCard';
import { getCurrentUserId } from '../../services/authService';
import { logger } from '../../utils/logger';

const DuaList = () => {
  const { t } = useTranslation();
  const { duas, loading, prayForDua } = useDua();
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

  return (
    <div className="dua-list">
      {/* Actions */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
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
           <div style={{ textAlign: 'center', color: 'var(--text-color-muted)', padding: '20px' }}>
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

