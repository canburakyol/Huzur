import { useCallback, useEffect, useMemo, useState } from 'react';
import { Crown, Sparkles, BookOpen, ScrollText, GraduationCap, ClipboardList, Headphones, Video, CircleHelp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { logger } from '../../../utils/logger';

import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { getLocalizedSurahList } from '../../../data/surahList';
import { localizeLibraryData } from '../data/i18n/applyLibraryOverlay';
import { isPro } from '../../../services/proService';
import { getAudioUrlSync, getReciters } from '../../../services/quranService';
import './Library.css';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useLibraryNavigation } from '../hooks/useLibraryNavigation';
import { useLibrarySearch } from '../hooks/useLibrarySearch';
import CategoryList from './CategoryList';
import ItemContent from './ItemContent';
import ReciterBrowser from './ReciterBrowser';

const IconMapper = ({ iconName, size = 24, color }) => {
    const iconMap = {
        'BookOpen': BookOpen,
        'ScrollText': ScrollText,
        'GraduationCap': GraduationCap,
        'ClipboardList': ClipboardList,
        'Headphones': Headphones,
        'Video': Video,
        'CircleHelp': CircleHelp
    };
    const IconComponent = iconMap[iconName] || BookOpen;
    return <IconComponent size={size} color={color} />;
};

const EMPTY_LIBRARY_DATA = Object.freeze({
  AUDIO: [],
  BOOKS: [],
  EDUCATION: [],
  FAQ: [],
  PRAYERS: [],
  REFERENCES: [],
  RELIGIOUS_TEXTS: [],
  VIDEO: []
});

const getResolvedLibraryData = (dataModule) => ({
  AUDIO: dataModule.AUDIO || [],
  BOOKS: dataModule.BOOKS || [],
  EDUCATION: dataModule.EDUCATION || [],
  FAQ: dataModule.FAQ || [],
  PRAYERS: dataModule.PRAYERS || [],
  REFERENCES: dataModule.REFERENCES || [],
  RELIGIOUS_TEXTS: dataModule.RELIGIOUS_TEXTS || [],
  VIDEO: dataModule.VIDEO || []
});

function LibraryShell({ onClose, onShowPro, onUpgrade }) {
  const { t, i18n } = useTranslation();
  const surahList = useMemo(() => getLocalizedSurahList(i18n.language), [i18n.language]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [libraryData, setLibraryData] = useState(null);
  const [isLibraryDataLoading, setIsLibraryDataLoading] = useState(false);

  const {
    breadcrumbs,
    currentView,
    expandedSection,
    goBack,
    selectCategory,
    selectItem,
    selectReciter,
    selectedCategory,
    selectedItem,
    selectedReciter,
    toggleExpandedSection
  } = useLibraryNavigation();

  const categories = useMemo(() => {
    const data = libraryData || EMPTY_LIBRARY_DATA;

    return [
      { id: 'books', title: t('library.categories.books', 'Kitaplar'), icon: 'BookOpen', data: data.BOOKS },
      { id: 'texts', title: t('library.categories.texts', 'Dini Metinler'), icon: 'ScrollText', data: data.RELIGIOUS_TEXTS },
      { id: 'education', title: t('library.categories.education', 'Eğitim'), icon: 'GraduationCap', data: data.EDUCATION },
      { id: 'references', title: t('library.categories.references', 'Referanslar'), icon: 'ClipboardList', data: data.REFERENCES },
      { id: 'audio', title: t('library.categories.audio', 'Sesli Kütüphane'), icon: 'Headphones', data: data.AUDIO, isPro: true },
      { id: 'video', title: t('library.categories.video', 'İslami Akademi'), icon: 'Video', data: data.VIDEO },
      { id: 'faq', title: t('library.categories.faq', 'Soru-Cevap'), icon: 'CircleHelp', data: data.FAQ }
    ];
  }, [libraryData, t]);

  const currentCategoryItems = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return categories.find((category) => category.id === selectedCategory.id)?.data || [];
  }, [categories, selectedCategory]);

  const reciters = useMemo(() => getReciters(), []);
  const userIsPro = isPro();

  const { clearQuery, query, results, setQuery } = useLibrarySearch(categories);
  const { playingIndex, speakArabic, stopAll, toggleAudio } = useAudioPlayer();

  const loadLibraryData = useCallback(async () => {
    if (libraryData || isLibraryDataLoading) {
      return;
    }

    setIsLibraryDataLoading(true);

    try {
      const dataModule = await import('../data/libraryData');
      setLibraryData(await localizeLibraryData(getResolvedLibraryData(dataModule), i18n.language || 'tr'));
    } catch (error) {
      logger.error('[Library] Veri yükleme hatası:', error);
    } finally {
      setIsLibraryDataLoading(false);
    }
  }, [i18n.language, isLibraryDataLoading, libraryData]);

  // Reload content in the new language when the user switches language.
  useEffect(() => {
    setLibraryData(null);
  }, [i18n.language]);

  useEffect(() => {
    if ((selectedCategory || query.length >= 2) && !libraryData && !isLibraryDataLoading) {
      loadLibraryData();
    }
  }, [isLibraryDataLoading, libraryData, loadLibraryData, query.length, selectedCategory]);

  const currentTitle = useMemo(() => {
    if (selectedReciter) {
      return selectedReciter.name;
    }

    if (selectedItem) {
      if (selectedItem.title) {
        return selectedItem.type === 'prayer'
          ? t(selectedItem.title, { defaultValue: selectedItem.title })
          : selectedItem.title;
      }

      return selectedItem.category || t('library.title', 'Kütüphane');
    }

    if (selectedCategory) {
      return selectedCategory.title;
    }

    return t('library.title', 'Kütüphane');
  }, [selectedCategory, selectedItem, selectedReciter, t]);

  const handleShowPro = useCallback(() => {
    setShowPaywall(false);
    onShowPro?.();
    onUpgrade?.();
  }, [onShowPro, onUpgrade]);

  const handleBack = useCallback(() => {
    if (selectedReciter || selectedItem) {
      stopAll();
    }

    const backTarget = goBack();
    if (backTarget === 'root') {
      onClose?.();
    }
  }, [goBack, onClose, selectedItem, selectedReciter, stopAll]);

  const handleCategorySelect = useCallback((category) => {
    if (category.isPro && !userIsPro) {
      setShowPaywall(true);
      return;
    }

    loadLibraryData();
    selectCategory(category);
  }, [loadLibraryData, selectCategory, userIsPro]);

  const handleItemSelect = useCallback((item) => {
    if (item.isPro && !userIsPro) {
      setShowPaywall(true);
      return;
    }

    selectItem(item);
  }, [selectItem, userIsPro]);

  const handleSearchResultClick = useCallback((result) => {
    if (result.requiresPro && !userIsPro) {
      setShowPaywall(true);
      return;
    }

    const parentCategory = categories.find((category) => category.id === result.parentCategoryId);
    if (parentCategory) {
      selectCategory(parentCategory);
    }

    selectItem(result.item);
    clearQuery();
  }, [categories, clearQuery, selectCategory, selectItem, userIsPro]);

  const shouldRenderReciterBrowser = selectedItem?.type === 'reciters' && currentView === 'reciter';

  return (
    <div className="settings-container">
      <div
        className="library-header reveal-stagger"
        style={{
          '--delay': '0s',
          marginBottom: '24px',
          padding: '0 4px',
          alignItems: 'flex-start'
        }}
      >
        <IslamicBackButton onClick={handleBack} size="medium" />
        <div style={{ minWidth: 0 }}>
          <h1
            className="library-title"
            style={{
              fontSize: '1.5rem',
              fontWeight: '900',
              color: 'var(--ink)',
              margin: 0
            }}
          >
            {currentTitle}
          </h1>
          {breadcrumbs.length > 1 ? (
            <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--ink-muted)', fontWeight: '700' }}>
              {breadcrumbs.map((crumb) => (crumb.id === 'root' ? t('library.title', crumb.label) : crumb.label)).join(' / ')}
            </div>
          ) : null}
        </div>
        <div style={{ flex: 1 }}></div>
        {userIsPro ? (
          <div
            className="hamburger-level-badge"
            style={{
              background: 'color-mix(in srgb, var(--brand-ink) 10%, transparent)',
              color: 'var(--brand-ink)',
              borderColor: 'var(--brand-ink)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '12px'
            }}
          >
            <Crown size={14} fill="var(--brand-ink)" />
            <span style={{ fontSize: '11px', fontWeight: '900' }}>PRO</span>
          </div>
        ) : (
          <div
            onClick={() => setShowPaywall(true)}
            style={{
              background: 'var(--paper-sunken)',
              color: 'var(--ink-muted)',
              padding: '8px',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            <Crown size={18} />
          </div>
        )}
      </div>

      <div className="reveal-stagger" style={{ '--delay': '0.1s' }}>
        {currentView === 'categories' ? (
          <CategoryList
            categories={categories}
            isLibraryDataLoading={isLibraryDataLoading}
            onCategorySelect={handleCategorySelect}
            onClearQuery={clearQuery}
            onQueryChange={setQuery}
            onRequestUpgrade={() => setShowPaywall(true)}
            onSearchResultClick={handleSearchResultClick}
            query={query}
            searchResults={results}
            t={t}
            userIsPro={userIsPro}
          />
        ) : null}

        {currentView === 'category' ? (
          <CategoryList
            isLibraryDataLoading={isLibraryDataLoading}
            items={currentCategoryItems}
            mode="items"
            onItemSelect={handleItemSelect}
            onRequestUpgrade={() => setShowPaywall(true)}
            t={t}
            userIsPro={userIsPro}
          />
        ) : null}

        {shouldRenderReciterBrowser ? (
          <ReciterBrowser
            activeItem={selectedItem}
            activeReciter={selectedReciter}
            getSurahAudioUrl={getAudioUrlSync}
            onPlaySurah={toggleAudio}
            onSelectReciter={selectReciter}
            playingIndex={playingIndex}
            reciters={reciters}
            surahs={surahList}
          />
        ) : null}

        {selectedItem && !shouldRenderReciterBrowser ? (
          <ItemContent
            expandedIndex={expandedSection}
            item={selectedItem}
            onSpeakArabic={speakArabic}
            onToggleAudio={toggleAudio}
            onToggleExpanded={toggleExpandedSection}
            playingIndex={playingIndex}
            t={t}
          />
        ) : null}
      </div>

      {showPaywall ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'color-mix(in srgb, var(--paper-sunken) 80%, transparent)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '24px'
          }}
          onClick={() => setShowPaywall(false)}
        >
          <div
            className="settings-card"
            style={{
              padding: '40px 24px',
              maxWidth: '400px',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '24px',
              background: 'var(--paper)',
              border: '1px solid var(--brand-ink)',
              boxShadow: '0 24px 48px color-mix(in srgb, var(--paper-sunken) 50%, transparent)',
              borderRadius: '40px',
              animation: 'modalOpen 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--brand-ink) 0%, var(--gold-ink) 100%)',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 12px 24px color-mix(in srgb, var(--brand-ink) 40%, transparent)'
              }}
            >
              <Crown size={40} color='var(--on-primary)' fill='var(--on-primary)' />
            </div>

            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--ink)', marginBottom: '8px' }}>
                Huzur Pro
              </h2>
              <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.5' }}>
                {t('library.paywall_desc', 'Tüm kütüphane içeriğine ve premium özelliklere sınırsız erişim sağlayın.')}
              </p>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: 'Headphones', text: t('library.feature_audio', 'Ünlü hafızlardan hatim setleri') },
                { icon: 'Video', text: t('library.feature_video', 'İslami Akademi video serileri') },
                { icon: 'BookOpen', text: t('library.feature_books', 'Özel dini kaynaklar ve kitaplar') }
              ].map((feature, index) => (
                <div key={`${feature.text}-${index}`} className="settings-card" style={{ padding: '12px 16px', background: 'var(--paper-sunken)', border: 'none', justifyContent: 'flex-start', gap: '12px' }}>
                  <span style={{ color: 'var(--brand-ink)' }}>
                    <IconMapper iconName={feature.icon} size={20} />
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--ink)', fontWeight: '700', textAlign: 'left' }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              <button
                className="velocity-target-btn"
                style={{
                  width: '100%',
                  background: 'var(--brand-ink)',
                  color: 'var(--on-primary)',
                  borderColor: 'transparent',
                  height: '64px',
                  fontSize: '1.1rem',
                  fontWeight: '900',
                  justifyContent: 'center'
                }}
                onClick={handleShowPro}
              >
                <Sparkles size={20} fill='var(--on-primary)' /> {t('common.upgrade_pro', "Pro'ya Yükselt")}
              </button>

              <button
                onClick={() => setShowPaywall(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--ink-muted)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '800' }}
              >
                {t('common.later', 'Belki Daha Sonra')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default LibraryShell;
