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

  const featuredHatims = activeHatims.filter((hatim) => hatim.isSeed === true);
  const communityHatims = activeHatims.filter((hatim) => hatim.isSeed !== true);

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
    } catch (error) {
      alert(`${t('common.error', 'Hata olustu')}: ${error.message}`);
    }
  };

  const handleHatimClick = (hatim) => {
    const isMember = hatim.isMember === true || hatim.readers?.includes(userId);
    if (isMember) {
      onSelectHatim(hatim.id);
      return;
    }

    setTargetHatimId(hatim.id);
    setJoinCode('');
    setShowJoinInput(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <button className="velocity-btn-primary" onClick={fetchAllPublicHatims} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', boxShadow: 'none' }}>
          {t('common.retry')}
        </button>
      </div>
    );
  }

  const renderHatimCards = (hatims) => (
    <div className="sanctuary-stack-list">
      {hatims.map((hatim) => (
        <HatimCard
          key={hatim.id}
          hatim={hatim}
          onClick={() => handleHatimClick(hatim)}
          isMember={hatim.isMember === true || hatim.readers?.includes(userId)}
        />
      ))}
    </div>
  );

  return (
    <div className="hatim-list">
      <div className="sanctuary-actions reveal-stagger" style={{ marginBottom: '24px' }}>
        <button className="sanctuary-btn-primary" onClick={() => setShowCreateModal(true)} style={{ flex: 1.5 }}>
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

      {showJoinInput && (
        <div className="sanctuary-join-input-card reveal-stagger">
          {targetHatimId && (
            <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--hb-accent)', fontWeight: '800', textAlign: 'center' }}>
              ℹ️ {t('hatim.lockedDescShort', 'Katilmak icin davet kodu giriniz:')}
            </p>
          )}
          <input
            type="text"
            className="code-field"
            placeholder="KODU GIR"
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

      <div className="hatim-grid reveal-stagger" style={{ '--delay': '0.5s', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {featuredHatims.length > 0 && (
          <div className="sanctuary-section-block">
            <div className="sanctuary-section-header">
              <div>
                <h3 className="sanctuary-section-title">{t('community.featuredHatims', 'One cikan hatimler')}</h3>
                <p className="sanctuary-section-subtitle">{t('community.featuredHatimsDesc', 'Huzur tarafindan onerilen acik topluluk halkalari')}</p>
              </div>
            </div>
            {renderHatimCards(featuredHatims)}
          </div>
        )}

        {communityHatims.length > 0 && (
          <div className="sanctuary-section-block">
            <div className="sanctuary-section-header">
              <div>
                <h3 className="sanctuary-section-title">{t('community.publicHatims', 'Topluluktan gercek hatimler')}</h3>
                <p className="sanctuary-section-subtitle">{t('community.publicHatimsDesc', 'Katil, davet et ve birlikte tamamlanan hatimlere eslik et')}</p>
              </div>
            </div>
            {renderHatimCards(communityHatims)}
          </div>
        )}

        {activeHatims.length === 0 && !loading && (
          <div className="settings-card reveal-stagger" style={{ flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: '16px' }}>
            <Users size={48} color="rgba(79, 70, 229, 0.4)" />
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--nav-text-muted)', fontWeight: '700', textAlign: 'center' }}>
              {t('hatim.noHatims', 'Henuz gorunen bir hatim yok. Ilk acik halkayi sen baslat.')}
            </p>
          </div>
        )}
      </div>

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
