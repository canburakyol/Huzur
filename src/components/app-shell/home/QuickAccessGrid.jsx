import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, CalendarDays, CircleDot, Compass, Fingerprint, Gem, HandHeart, LayoutGrid, MapPin, MessageCircle } from 'lucide-react';

const QuickAccessGrid = memo(({ onSelectFeature, onShowMenu }) => {
  const { t } = useTranslation();

  const handleSelect = (featureId) => {
    if (onSelectFeature) {
      onSelectFeature(featureId, 'quick_access');
    }
  };

  const handleShowMenu = () => {
    if (onShowMenu) {
      onShowMenu();
    }
  };

  const SMALL_TILES = [
    { id: 'quran', icon: BookOpen, label: t('menu.quran', "Kur'an") },
    { id: 'prayers', icon: HandHeart, label: t('menu.prayers', "Dualar") },
    { id: 'imsakiye', icon: CalendarDays, label: t('menu.imsakiye', "İmsakiye") },
    { id: 'esmaUlHusna', icon: Gem, label: t('menu.esma', "Esmalar") },
    { id: 'mosque', icon: MapPin, label: t('menu.mosque', "Camiim") },
    { id: 'tespihat', icon: CircleDot, label: t('menu.tespihat', "Tespihat") },
    { id: 'assistant', icon: MessageCircle, label: t('nav.assistant', "Soru-Cevap") },
    { id: 'more', icon: LayoutGrid, label: t('menu.more', "Daha Fazla"), action: handleShowMenu }
  ];

  return (
    <section className="quick-access-section">
      <div className="quick-access-header">
        <h3 className="quick-access-title">{t('home.quickAccess', 'Hızlı Erişim')}</h3>
        <div className="quick-access-actions">
          <button onClick={() => handleSelect('settings')}>{t('common.edit', 'Düzenle')}</button>
          <button onClick={handleShowMenu}>{t('common.all', 'Tümü')}</button>
        </div>
      </div>

      {/* Top 2 Large Premium Cards */}
      <div className="quick-access-large-row">
        <button
          type="button"
          className="quick-access-large-card"
          onClick={() => handleSelect('qibla')}
        >
          <div className="quick-access-large-icon-wrapper qibla-icon-bg">
            <Compass size={22} aria-hidden="true" />
          </div>
          <div className="quick-access-large-info">
            <span className="quick-access-large-title">{t('menu.qibla', 'Kıble Pusulası')}</span>
            <span className="quick-access-large-desc">{t('home.qiblaDesc', 'Hassas yön bulucu')}</span>
          </div>
        </button>

        <button
          type="button"
          className="quick-access-large-card"
          onClick={() => handleSelect('zikirmatik')}
        >
          <div className="quick-access-large-icon-wrapper dhikr-icon-bg">
            <Fingerprint size={22} aria-hidden="true" />
          </div>
          <div className="quick-access-large-info">
            <span className="quick-access-large-title">{t('menu.zikirmatik', 'Zikirmatik')}</span>
            <span className="quick-access-large-desc">{t('home.zikirDesc', 'Günlük tesbihat takip')}</span>
          </div>
        </button>
      </div>

      {/* 2x4 Square Module Grid */}
      <div className="quick-access-square-grid">
        {SMALL_TILES.map((tile) => (
          <button
            type="button"
            key={tile.id}
            className="quick-access-square-card"
            onClick={() => tile.action ? tile.action() : handleSelect(tile.id)}
          >
            <div className="quick-access-square-icon-container">
              <tile.icon size={20} aria-hidden="true" />
            </div>
            <span className="quick-access-square-label">
              {tile.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
});

QuickAccessGrid.displayName = 'QuickAccessGrid';

export default QuickAccessGrid;
