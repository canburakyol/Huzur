import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
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
  const [isSharing, setIsSharing] = useState(false);

  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.huzurapp.android';
  const premiumShareCopy =
    "Huzur ile sevdiklerinle ayni niyette bulus, hatim halkalarina katil ve dualarda birlikte amin de. Sakin, guvenli ve manevi bir yol arkadasi ariyorsan Huzur'u kesfet.";

  const handleShare = async () => {
    if (isSharing) return;

    const shareTitle = t('community.shareTitle', 'Huzur - Cemaat');
    const shareMessage = `${t(
      'community.sharePremiumText',
      premiumShareCopy
    )}\n\n${playStoreUrl}`;

    try {
      setIsSharing(true);

      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: shareTitle,
          text: shareMessage,
          url: playStoreUrl,
          dialogTitle: shareTitle
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareMessage,
          url: playStoreUrl
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareMessage);
        alert(t('community.shareCopied', 'Paylasim linki kopyalandi.'));
      }
    } catch (error) {
      if (error?.message !== 'Share canceled' && error?.name !== 'AbortError') {
        console.error('Error sharing community:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

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
              type="button"
              disabled={isSharing}
              style={{
                background: 'var(--hb-hover)',
                color: 'var(--hb-accent)',
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                opacity: isSharing ? 0.7 : 1,
                transition: 'opacity 0.2s ease, transform 0.2s ease'
              }}
              aria-label="Share community"
              onClick={handleShare}
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
