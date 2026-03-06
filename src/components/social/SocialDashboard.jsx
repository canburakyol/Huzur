import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBackButton } from '../../hooks/useBackButton';
import HatimList from './HatimList';
import HatimDetail from './HatimDetail';
import DuaList from './DuaList';
import IslamicBackButton from '../shared/IslamicBackButton';
import { BookOpen, Heart, Share2 } from 'lucide-react';
import './Social.css';

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
    <div className="education-container social-sanctuary">
      {/* Header */}
      {!selectedHatimId && (
        <header className="settings-container reveal-stagger sanctuary-header">
          <div className="sanctuary-header-top">
            <IslamicBackButton onClick={onClose} size="medium" color="var(--hb-accent)" />
            <div className="sanctuary-pill">
              {t('community.sanctuary')}
            </div>
            <button
              className="premium-icon-btn" 
              style={{ background: 'var(--hb-hover)', color: 'var(--hb-accent)', width: '44px', height: '44px', borderRadius: '14px' }}
              aria-label="Share community"
            >
              <Share2 size={20} />
            </button>
          </div>

          <div className="sanctuary-title-wrap">
            <h1 className="sanctuary-title">
              {activeTab === 'hatim' ? t('community.tabs.hatims') : t('community.tabs.duas')}
            </h1>
            <p className="sanctuary-subtitle">
              {activeTab === 'hatim' ? t('community.hatimDesc') : t('community.duaDesc')}
            </p>
          </div>
          
          <div className="sanctuary-tabs sanctuary-tabs-main" role="tablist" aria-label="Community tabs">
            <button
              onClick={() => setActiveTab('hatim')}
              className={`sanctuary-tab-btn ${activeTab === 'hatim' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'hatim'}
            >
              <BookOpen size={20} />
              {t('community.tabs.hatims')}
            </button>
            <button
              onClick={() => setActiveTab('dua')}
              className={`sanctuary-tab-btn ${activeTab === 'dua' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'dua'}
            >
              <Heart size={20} />
              {t('community.tabs.duas')}
            </button>
          </div>
        </header>
      )}

      {/* Content Area */}
      <div className="sanctuary-content-area reveal-stagger" style={{ '--delay': '0.4s' }}>
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
