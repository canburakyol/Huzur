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
    <div className="social-dashboard glass-card" style={{ 
      border: 'none', 
      borderRadius: 0, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'var(--bg-color)',
      backdropFilter: 'none'
    }}>
      {/* Header */}
      {!selectedHatimId && (
        <div className="social-header" style={{ 
          padding: '20px', 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--glass-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button
              onClick={onClose}
              className="social-back-btn"
              aria-label={t('common.back', 'Geri')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid var(--glass-border)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-color)'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div style={{ width: '36px' }}></div> {/* Spacer */}
          </div>

          {/* Tab Navigation */}
          <div className="social-tabs" style={{ 
            display: 'flex', 
            background: 'rgba(0,0,0,0.2)', 
            padding: '4px', 
            borderRadius: '12px',
            gap: '4px'
          }}>
            <button
              onClick={() => setActiveTab('hatim')}
              className={`social-tab-btn ${activeTab === 'hatim' ? 'active' : ''}`}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'hatim' ? 'var(--primary-color)' : 'transparent',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              📖 {t('community.tabs.hatims', 'Hatimler')}
            </button>
            <button
              onClick={() => setActiveTab('dua')}
              className={`social-tab-btn ${activeTab === 'dua' ? 'active' : ''}`}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'dua' ? 'var(--primary-color)' : 'transparent',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              🤲 {t('community.tabs.duas', 'Dualar')}
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div
        className="social-content"
        style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          paddingBottom: '100px',
          paddingTop: selectedHatimId ? 'calc(16px + env(safe-area-inset-top))' : '20px' 
        }}
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
