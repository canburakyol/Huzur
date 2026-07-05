import { BookOpen, ChevronRight, Crown, Search, X, BookOpen as BookOpenIcon, ScrollText, GraduationCap, ClipboardList, Headphones, Video, CircleHelp } from 'lucide-react';

const iconMap = {
    'BookOpen': BookOpenIcon,
    'ScrollText': ScrollText,
    'GraduationCap': GraduationCap,
    'ClipboardList': ClipboardList,
    'Headphones': Headphones,
    'Video': Video,
    'CircleHelp': CircleHelp
};

const renderIcon = (icon, fallback) => {
  if (typeof icon === 'string' && iconMap[icon]) {
    const IconComponent = iconMap[icon];
    return <IconComponent size={32} strokeWidth={1.5} />;
  }

  return icon || fallback;
};

const getItemTitle = (item, t) => {
  if (!item) {
    return '';
  }

  if (item.title) {
    return item.type === 'prayer'
      ? t(item.title, { ns: 'prayers', defaultValue: item.title })
      : item.title;
  }

  return item.category;
};

function CategoryList({
  mode = 'categories',
  categories = [],
  isLibraryDataLoading = false,
  items = [],
  onCategorySelect,
  onClearQuery,
  onItemSelect,
  onRequestUpgrade,
  onSearchResultClick,
  onQueryChange,
  query = '',
  searchResults = [],
  t,
  userIsPro
}) {
  if (mode === 'items') {
    if (isLibraryDataLoading && items.length === 0) {
      return (
        <div className="library-loading">
          <div className="spinner premium"></div>
        </div>
      );
    }

    return (
      <div className="content-list-library reveal-stagger">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="settings-card reveal-stagger premium-glass hover-lift"
              style={{
                padding: '16px',
                cursor: 'pointer',
                border: item.isPro && !userIsPro ? '1px dashed var(--nav-border)' : ''
              }}
              onClick={() => {
                if (item.isPro && !userIsPro) {
                  onRequestUpgrade?.();
                  return;
                }

                onItemSelect?.(item);
              }}
            >
              <div className="settings-card-left">
                <div
                  className="settings-icon-box"
                  style={{
                    background: 'var(--nav-hover)',
                    color: 'var(--nav-accent)',
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px'
                  }}
                >
                  {renderIcon(item.icon, <BookOpen size={24} />)}
                </div>
                <div className="settings-user-info">
                  <div className="settings-label">{getItemTitle(item, t)}</div>
                  <div className="settings-desc">{item.description}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.isPro ? <Crown size={14} color="var(--tertiary)" fill="var(--tertiary)" /> : null}
                <ChevronRight size={18} color="var(--nav-text-muted)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const resultsLabel = isLibraryDataLoading && searchResults.length === 0
    ? t('common.loading', 'Yükleniyor...')
    : searchResults.length > 0
      ? t('library.results_found', { count: searchResults.length, defaultValue: `${searchResults.length} sonuç bulundu` })
      : t('library.no_results', 'Sonuç bulunamadı');

  return (
    <div className="reveal-stagger">
      <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '24px', fontWeight: '600' }}>
        {t('library.subtitle', 'İslami bilgi kaynakları ve referanslar')}
      </p>

      <div className="library-search-section" style={{ marginBottom: '32px' }}>
        <Search size={20} className="search-icon-library" style={{ color: 'var(--nav-accent)' }} />
        <input
          type="text"
          className="library-search-input"
          style={{
            background: 'var(--nav-hover)',
            border: '1px solid var(--nav-border)',
            borderRadius: '20px',
            padding: '16px 16px 16px 48px',
            fontSize: '1rem',
            color: 'var(--nav-text)'
          }}
          placeholder={t('library.search_placeholder', 'Ara... (örn: namaz, oruç)')}
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
        />
        {query ? (
          <button
            onClick={onClearQuery}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={18} color="var(--nav-text-muted)" />
          </button>
        ) : null}
      </div>

      {query.length >= 2 ? (
        <div style={{ marginBottom: '32px' }} className="reveal-stagger">
          <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.8rem', marginBottom: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
            {resultsLabel}
          </p>
          {searchResults.map((result, index) => (
            <div
              key={`${result.parentCategoryId}-${result.item?.id || result.match || index}`}
              className="settings-card reveal-stagger premium-glass hover-lift"
              style={{ marginBottom: '12px', cursor: 'pointer' }}
              onClick={() => onSearchResultClick?.(result)}
            >
              <div className="settings-card-left">
                <div className="settings-icon-box" style={{ background: 'var(--nav-hover)', color: 'var(--nav-accent)' }}>
                  {renderIcon(result.icon)}
                </div>
                <div className="settings-user-info">
                  <div className="settings-label">{result.match || getItemTitle(result.item, t)}</div>
                  <div className="settings-desc">{result.category}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {result.requiresPro && !userIsPro ? <Crown size={14} color="var(--tertiary)" fill="var(--tertiary)" /> : null}
                <ChevronRight size={18} color="var(--nav-text-muted)" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="category-grid-library" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {categories.map((category) => (
            <div
              key={category.id}
              className="settings-card reveal-stagger premium-glass hover-lift"
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '24px 16px',
                borderRadius: '24px',
                gap: '12px',
                cursor: 'pointer',
                height: 'auto',
                position: 'relative'
              }}
              onClick={() => {
                if (category.isPro && !userIsPro) {
                  onRequestUpgrade?.();
                  return;
                }

                onCategorySelect?.(category);
              }}
            >
              <div
                className="settings-icon-box"
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'var(--nav-hover)',
                  color: 'var(--nav-accent)',
                  borderRadius: '20px'
                }}
              >
                {renderIcon(category.icon)}
              </div>
              <div className="settings-label" style={{ fontSize: '0.95rem', fontWeight: '800' }}>
                {category.title}
              </div>
              {category.isPro ? (
                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                  <Crown size={14} color="var(--tertiary)" fill="var(--tertiary)" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryList;
