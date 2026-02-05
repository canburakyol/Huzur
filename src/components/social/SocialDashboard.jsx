import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBackButton } from '../../hooks/useBackButton';
import HatimList from './HatimList';
import HatimDetail from './HatimDetail';
import DuaList from './DuaList';

const SocialDashboard = ({ onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('hatim'); // 'hatim' or 'dua'
  const [selectedHatimId, setSelectedHatimId] = useState(null);

  // Handle back button
  useBackButton({
    activeFeature: true,
    onBack: () => {
      if (selectedHatimId) {
        setSelectedHatimId(null);
      } else {
        onClose();
      }
    }
  });

  return (
    <div className="social-dashboard">
      {/* Header */}
      {!selectedHatimId && (
        <div className="social-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button 
              onClick={onClose}
              className="social-back-btn"
              aria-label={t('common.back', 'Geri')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h2 className="social-title">
              {t('social.title', 'Dua Kardeşliği')}
            </h2>
            <div style={{ width: '36px' }}></div> {/* Spacer */}
          </div>

          {/* Tab Navigation */}
          <div className="social-tabs">
            <button
              onClick={() => setActiveTab('hatim')}
              className={`social-tab-btn ${activeTab === 'hatim' ? 'active' : ''}`}
            >
              📖 {t('social.hatim', 'Grup Hatim')}
            </button>
            <button
              onClick={() => setActiveTab('dua')}
              className={`social-tab-btn ${activeTab === 'dua' ? 'active' : ''}`}
            >
              🤲 {t('social.dua', 'Dua Panosu')}
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div 
        className="social-content" 
        style={{ paddingTop: selectedHatimId ? 'calc(16px + env(safe-area-inset-top))' : '16px' }}
      >
        {activeTab === 'hatim' && (
          <div className="hatim-section">
            {selectedHatimId ? (
              <HatimDetail 
                hatimId={selectedHatimId} 
                onBack={() => setSelectedHatimId(null)} 
              />
            ) : (
              <HatimList onSelectHatim={setSelectedHatimId} />
            )}
          </div>
        )}

        {activeTab === 'dua' && (
            <div className="dua-section">
                <DuaList />
            </div>
        )}
      </div>
    </div>
  );
};

export default SocialDashboard;
