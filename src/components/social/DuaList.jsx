import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDua } from '../../hooks/useDua';
import CreateDuaModal from './CreateDuaModal';
import DuaCard from './DuaCard';
import { logger } from '../../utils/logger';
import { Heart, RefreshCw, Plus } from 'lucide-react';
import './Social.css';

const DuaList = () => {
  const { t } = useTranslation();
  const { duas, loading, error, prayForDua, prayedDuaIds, submittingDuaIds } = useDua();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const featuredDuas = duas.filter((dua) => dua.isSeed === true || dua.featured === true);
  const communityDuas = duas.filter((dua) => dua.isSeed !== true && dua.featured !== true);

  const isPrayed = (dua) => {
    return prayedDuaIds.has(dua.id) || submittingDuaIds.has(dua.id);
  };

  const handlePray = async (duaId) => {
    const dua = duas.find((item) => item.id === duaId);
    if (isPrayed(dua)) return;

    try {
      await prayForDua(duaId);
    } catch (error) {
      logger.error('Amin error:', error);
      alert(error?.message || t('community.messages.aminFailed', 'Amin gonderilemedi. Lutfen tekrar deneyin.'));
    }
  };

  if (loading && duas.length === 0) {
    return (
      <div className="settings-card reveal-stagger" style={{ justifyContent: 'center', padding: '40px' }}>
        <div className="spin"><RefreshCw size={32} color="var(--nav-accent)" /></div>
        <p style={{ margin: '16px 0 0', fontSize: '0.9rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-card reveal-stagger" style={{ borderColor: '#ef4444', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#ef4444' }}>⚠️ {t('common.error')}</p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>{error}</p>
      </div>
    );
  }

  const renderDuaCards = (items) => (
    <div className="sanctuary-stack-list">
      {items.map((dua) => (
        <DuaCard key={dua.id} dua={dua} isPrayed={isPrayed(dua)} onPray={handlePray} />
      ))}
    </div>
  );

  return (
    <div className="dua-list">
      <div className="reveal-stagger" style={{ marginBottom: '24px' }}>
        <button className="sanctuary-btn-primary" onClick={() => setShowCreateModal(true)} style={{ width: '100%' }}>
          <Plus size={20} />
          {t('dua.create', 'Dua istegi ekle')}
        </button>
      </div>

      <div className="dua-grid reveal-stagger" style={{ '--delay': '0.5s', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {featuredDuas.length > 0 && (
          <div className="sanctuary-section-block">
            <div className="sanctuary-section-header">
              <div>
                <h3 className="sanctuary-section-title">{t('community.featuredDuas', 'One cikan dualar')}</h3>
                <p className="sanctuary-section-subtitle">{t('community.featuredDuasDesc', 'Toplulugu bir araya getiren niyetler ve Huzur onerileri')}</p>
              </div>
            </div>
            {renderDuaCards(featuredDuas)}
          </div>
        )}

        {communityDuas.length > 0 && (
          <div className="sanctuary-section-block">
            <div className="sanctuary-section-header">
              <div>
                <h3 className="sanctuary-section-title">{t('community.publicDuas', 'Topluluktan dualar')}</h3>
                <p className="sanctuary-section-subtitle">{t('community.publicDuasDesc', 'Yeni dualari gor, amin de ve birlikte destek ol')}</p>
              </div>
            </div>
            {renderDuaCards(communityDuas)}
          </div>
        )}

        {duas.length === 0 && !loading && (
          <div className="settings-card reveal-stagger sanctuary-empty" style={{ flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: '16px' }}>
            <Heart size={48} color="var(--hb-accent)" />
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--nav-text-muted)', fontWeight: '700', textAlign: 'center' }}>
              {t('community.messages.noDuas')}
            </p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateDuaModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default DuaList;
