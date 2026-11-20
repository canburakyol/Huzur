import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import HatimList from './HatimList';
import HatimDetail from './HatimDetail';
import DuaList from './DuaList';
import PageHeader from '../../../components/shared/PageHeader';
import { BookOpen, Heart, Share2 } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { logger } from '../../../utils/logger';
import '../../../styles/PracticePages.css';
import './Social.css';

const SocialDashboard = ({ onClose }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
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
        showToast(t('community.shareCopied', 'Paylaşım linki kopyalandı.'), 'success');
      }
    } catch (error) {
      if (error?.message !== 'Share canceled' && error?.name !== 'AbortError') {
        logger.error('Error sharing community:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="practice-page social-sanctuary">
      {!selectedHatimId && (
        <>
          <PageHeader
            title={activeTab === 'hatim' ? t('community.tabs.hatims') : t('community.tabs.duas')}
            subtitle={activeTab === 'hatim' ? t('community.hatimDesc') : t('community.duaDesc')}
            onBack={onClose}
            action={(
              <button
                type="button"
                className="hz-iconbtn"
                disabled={isSharing}
                aria-label={t('community.share', 'Topluluğu paylaş')}
                onClick={handleShare}
              >
                <Share2 size={20} strokeWidth={1.75} aria-hidden="true" />
              </button>
            )}
          />

          <div className="practice-segments social-segments" role="tablist" aria-label={t('community.sanctuary')}>
            {[['hatim', <BookOpen key="i" size={16} aria-hidden="true" />, t('community.tabs.hatims')], ['dua', <Heart key="i" size={16} aria-hidden="true" />, t('community.tabs.duas')]].map(([id, icon, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                className={`practice-segment ${activeTab === id ? 'practice-segment--active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Content Area */}
      <div className="sanctuary-content-area">
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
