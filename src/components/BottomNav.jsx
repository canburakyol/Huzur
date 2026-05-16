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

  const handleKeyDown = (callback) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  return (
    <div className="bottom-nav" role="navigation" aria-label={t('nav.mainNavigation', 'Main navigation')}>
      <div 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
        onClick={() => setActiveTab('home', 'bottom_nav')}
        onKeyDown={handleKeyDown(() => setActiveTab('home', 'bottom_nav'))}
        role="button"
        tabIndex={0}
        aria-current={activeTab === 'home' ? 'page' : undefined}
        aria-label={t('nav.home')}
      >
        <Home size={24} />
        <span>{t('nav.home')}</span>
      </div>
      <div 
        className={`nav-item ${activeTab === 'quran' ? 'active' : ''}`} 
        onClick={() => setActiveTab('quran', 'bottom_nav')}
        onKeyDown={handleKeyDown(() => setActiveTab('quran', 'bottom_nav'))}
        role="button"
        tabIndex={0}
        aria-current={activeTab === 'quran' ? 'page' : undefined}
        aria-label={t('nav.quran')}
      >
        <Book size={24} />
        <span>{t('nav.quran')}</span>
      </div>
      <div 
        className={`nav-item ${activeTab === 'assistant' ? 'active' : ''}`} 
        onClick={() => setActiveTab('assistant', 'bottom_nav')}
        onKeyDown={handleKeyDown(() => setActiveTab('assistant', 'bottom_nav'))}
        role="button"
        tabIndex={0}
        aria-current={activeTab === 'assistant' ? 'page' : undefined}
        aria-label={t('nav.assistant')}
      >
        <div className="assistant-icon-wrapper">
          <MessageCircle size={24} />
          <span className="notification-dot"></span>
        </div>
        <span>{t('nav.assistant')}</span>
      </div>
      <div
        className={`nav-item ${activeTab === 'community' ? 'active' : ''}`}
        onClick={() => setActiveTab('community', 'bottom_nav')}
        onKeyDown={handleKeyDown(() => setActiveTab('community', 'bottom_nav'))}
        role="button"
        tabIndex={0}
        aria-current={activeTab === 'community' ? 'page' : undefined}
        aria-label={t('nav.community')}
      >
        <Users size={24} />
        <span>{t('nav.community')}</span>
      </div>
      <div
        className="nav-item"
        onClick={onShowMenu}
        onKeyDown={handleKeyDown(onShowMenu)}
        role="button"
        tabIndex={0}
        aria-label={t('nav.menu')}
      >
        <Menu size={24} />
        <span>{t('nav.menu')}</span>
      </div>
    </div>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;

