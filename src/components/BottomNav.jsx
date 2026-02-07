import { memo } from 'react';
import { Home, Book, MessageCircle, Users, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * BottomNav Component
 * Main navigation bar for the application
 * Memoized to prevent unnecessary re-renders when parent updates
 */
const BottomNav = memo(({ activeTab, setActiveTab, onShowMenu }) => {
  const { t } = useTranslation();

  return (
    <div className="bottom-nav">
      <div 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
        onClick={() => setActiveTab('home')}
      >
        <Home size={24} />
        <span>{t('nav.home')}</span>
      </div>
      <div 
        className={`nav-item ${activeTab === 'quran' ? 'active' : ''}`} 
        onClick={() => setActiveTab('quran')}
      >
        <Book size={24} />
        <span>{t('nav.quran')}</span>
      </div>
      <div 
        className={`nav-item ${activeTab === 'assistant' ? 'active' : ''}`} 
        onClick={() => setActiveTab('assistant')}
      >
        <div className="assistant-icon-wrapper">
          <MessageCircle size={24} />
          <span className="notification-dot"></span>
        </div>
        <span>{t('nav.assistant')}</span>
      </div>
      <div 
        className={`nav-item ${activeTab === 'community' ? 'active' : ''}`} 
        onClick={() => setActiveTab('community')}
      >
        <Users size={24} />
        <span>{t('nav.community')}</span>
      </div>
      <div className="nav-item" onClick={onShowMenu}>
        <Menu size={24} />
        <span>{t('nav.menu')}</span>
      </div>
    </div>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;

