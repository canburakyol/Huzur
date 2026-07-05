import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const QuickAccessGrid = memo(({ onSelectFeature }) => {
  const { t } = useTranslation();

  const handleSelect = (featureId) => {
    if (onSelectFeature) {
      onSelectFeature(featureId, 'quick_access');
    }
  };

  const SMALL_TILES = [
    { id: 'quran', icon: 'menu_book', label: t('menu.quran', "Kur'an") },
    { id: 'prayers', icon: 'import_contacts', label: t('menu.prayers', "Dualar") },
    { id: 'imsakiye', icon: 'calendar_month', label: t('menu.imsakiye', "İmsakiye") },
    { id: 'esmaUlHusna', icon: 'diamond', label: t('menu.esma', "Esmalar") },
    { id: 'mosque', icon: 'mosque', label: t('menu.mosque', "Camiim") },
    { id: 'community', icon: 'group', label: t('menu.community', "Topluluk") },
    { id: 'assistant', icon: 'forum', label: t('menu.assistant', "Asistan AI") },
    { id: 'more', icon: 'grid_view', label: t('menu.more', "Daha Fazla") }
  ];

  return (
    <section className="quick-access-section">
      <div className="quick-access-header">
        <h3 className="quick-access-title">{t('home.quickAccess', 'Hızlı Erişim')}</h3>
        <div className="quick-access-actions">
          <button onClick={() => handleSelect('settings')}>{t('common.edit', 'Düzenle')}</button>
          <button onClick={() => handleSelect('all_features')}>{t('common.all', 'Tümü')}</button>
        </div>
      </div>
      
      {/* Top 2 Large Premium Cards */}
      <div className="quick-access-large-row">
        <div 
          className="quick-access-large-card"
          onClick={() => handleSelect('qibla')}
        >
          <div className="quick-access-large-icon-wrapper qibla-icon-bg">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>explore</span>
          </div>
          <div className="quick-access-large-info">
            <span className="quick-access-large-title">{t('menu.qibla', 'Kıble Pusulası')}</span>
            <span className="quick-access-large-desc">{t('home.qiblaDesc', 'Hassas yön bulucu')}</span>
          </div>
        </div>

        <div 
          className="quick-access-large-card"
          onClick={() => handleSelect('zikirmatik')}
        >
          <div className="quick-access-large-icon-wrapper dhikr-icon-bg">
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>ads_click</span>
          </div>
          <div className="quick-access-large-info">
            <span className="quick-access-large-title">{t('menu.zikirmatik', 'Zikirmatik')}</span>
            <span className="quick-access-large-desc">{t('home.zikirDesc', 'Günlük tesbihat takip')}</span>
          </div>
        </div>
      </div>

      {/* 2x4 Square Module Grid */}
      <div className="quick-access-square-grid">
        {SMALL_TILES.map((tile) => (
          <div 
            key={tile.id} 
            className="quick-access-square-card"
            onClick={() => handleSelect(tile.id)}
          >
            <div className="quick-access-square-icon-container">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {tile.icon}
              </span>
            </div>
            <span className="quick-access-square-label">
              {tile.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
});

QuickAccessGrid.displayName = 'QuickAccessGrid';

export default QuickAccessGrid;
