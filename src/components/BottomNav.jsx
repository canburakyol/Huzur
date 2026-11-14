import { createElement, memo } from 'react';
import { Home, Book, HandHeart, MessageCircle, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNav = memo(({ activeTab, setActiveTab, onShowMenu }) => {
  const { t } = useTranslation();

  const handleKeyDown = (callback) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  const tabs = [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'quran', icon: Book, label: t('nav.quran') },
    { id: 'prayers', icon: HandHeart, label: t('menu.prayers', 'Dualar') },
    { id: 'assistant', icon: MessageCircle, label: t('nav.assistant') },
  ];

  return (
    <div className="bottom-nav" role="navigation" aria-label={t('nav.mainNavigation', 'Main navigation')} data-testid="bottom-navigation">
      {tabs.map(({ id, icon, label }) => (
        <div
          key={id}
          className={`nav-item ${activeTab === id ? 'active' : ''}`}
          onClick={() => setActiveTab(id, 'bottom_nav')}
          onKeyDown={handleKeyDown(() => setActiveTab(id, 'bottom_nav'))}
          role="button"
          tabIndex={0}
          aria-current={activeTab === id ? 'page' : undefined}
          aria-label={label}
          data-testid={`bottom-tab-${id}`}
        >
          {createElement(icon, { size: 24 })}
          <span>{label}</span>
        </div>
      ))}

      <div
        className="nav-item"
        onClick={onShowMenu}
        onKeyDown={handleKeyDown(onShowMenu)}
        role="button"
        tabIndex={0}
        aria-label={t('nav.menu')}
        data-testid="bottom-tab-menu"
      >
        <Menu size={24} />
        <span>{t('nav.menu')}</span>
      </div>
    </div>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
