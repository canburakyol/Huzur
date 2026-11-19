import { useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  ChevronDown,
  Heart,
  Info,
  Search,
  Share2,
  Sparkles,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import IslamicBackButton from '../../../components/shared/IslamicBackButton';
import { contentService } from '../../../services/contentService';
import { buildEsmaShareCard, openShareCard, shareCard } from '../../../services/shareCardService';
import { storageService } from '../../../services/storageService';
import './EsmaUlHusna.css';
import '../../../components/app-shell/Navigation.css';

const ESMA_FAVORITES_KEY = 'esma_favorites';

function EsmaUlHusna({ onClose }) {
  const { t, i18n } = useTranslation();
  const [esmaList, setEsmaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyEsma, setDailyEsma] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [favorites, setFavorites] = useState(() => storageService.getItem(ESMA_FAVORITES_KEY, []));
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      const data = await contentService.getEsmaUlHusna(i18n.language);

      if (!isMounted) return;

      setEsmaList(data);
      if (data.length > 0) {
        const today = new Date();
        const yearStart = new Date(today.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((today - yearStart) / (1000 * 60 * 60 * 24));
        setDailyEsma(data[dayOfYear % data.length]);
      }
      setLoading(false);
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [i18n.language]);

  const filteredNames = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase(i18n.language);

    return esmaList.filter((esma) => {
      const matchesSearch = !query || [esma.latin, esma.meaning, esma.arabic]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase(i18n.language).includes(query));
      const matchesFavorite = !showFavoritesOnly || favorites.includes(esma.id);
      return matchesSearch && matchesFavorite;
    });
  }, [esmaList, favorites, i18n.language, searchQuery, showFavoritesOnly]);

  const toggleFavorite = (id) => {
    const nextFavorites = favorites.includes(id)
      ? favorites.filter((favoriteId) => favoriteId !== id)
      : [...favorites, id];

    setFavorites(nextFavorites);
    storageService.setItem(ESMA_FAVORITES_KEY, nextFavorites);
  };

  const shareEsma = async (esma) => {
    const card = buildEsmaShareCard(esma);
    openShareCard('esma', 'esma_ul_husna_page');
    await shareCard(card, 'esma_ul_husna_page');
  };

  if (loading || !dailyEsma) {
    return (
      <main className="esma-page esma-page--loading" aria-label={t('esma.title', 'Esmaül Hüsna')}>
        <div className="spinner premium" />
      </main>
    );
  }

  return (
    <main className="esma-page">
      <header className="esma-header esma-enter">
        <IslamicBackButton onClick={onClose} size="medium" />
        <div className="esma-header__copy">
          <span className="esma-eyebrow">{t('esma.eyebrow', '99 güzel isim')}</span>
          <h1>{t('esma.title', 'Esmaül Hüsna')}</h1>
          <p>{t('esma.subtitle', "Allah'ın 99 Güzel İsmi")}</p>
        </div>
      </header>

      <section className="esma-daily esma-enter esma-enter--delay" aria-labelledby="daily-esma-title">
        <div className="esma-daily__topline">
          <span id="daily-esma-title"><Sparkles size={15} /> {t('esma.daily', 'Günün Esması')}</span>
          <span className="esma-daily__number">{String(dailyEsma.id).padStart(2, '0')}</span>
        </div>
        <div className="esma-daily__arabic" lang="ar" dir="rtl">{dailyEsma.arabic}</div>
        <h2>{dailyEsma.latin}</h2>
        <p className="esma-daily__meaning">{dailyEsma.meaning}</p>
        {dailyEsma.detail && <p className="esma-daily__detail">{dailyEsma.detail}</p>}
      </section>

      <section className="esma-directory esma-enter esma-enter--later" aria-labelledby="esma-directory-title">
        <div className="esma-section-heading">
          <div>
            <span className="esma-eyebrow">{t('esma.directory', 'Fihrist')}</span>
            <h2 id="esma-directory-title">{t('esma.directoryTitle', 'İsimler ve anlamları')}</h2>
          </div>
          <span className="esma-result-count" aria-live="polite">{`${filteredNames.length} / ${esmaList.length}`}</span>
        </div>

        <div className="esma-tools">
          <label className="esma-search">
            <Search size={19} aria-hidden="true" />
            <span className="sr-only">{t('esma.search_placeholder', 'İsim ara')}</span>
            <input
              type="search"
              placeholder={t('esma.search_placeholder', 'İsim ara...')}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} aria-label={t('esma.clearSearch', 'Aramayı temizle')}>
                <X size={17} />
              </button>
            )}
          </label>
          <button
            type="button"
            className={`esma-favorites-filter ${showFavoritesOnly ? 'is-active' : ''}`}
            onClick={() => setShowFavoritesOnly((current) => !current)}
            aria-pressed={showFavoritesOnly}
            aria-label={showFavoritesOnly ? t('esma.showAll', 'Tüm isimleri göster') : t('esma.showFavoritesOnly', 'Yalnızca favorileri göster')}
          >
            <Heart size={19} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            <span>{t('common.favorites', 'Favoriler')}</span>
            {favorites.length > 0 && <small>{favorites.length}</small>}
          </button>
        </div>

        {filteredNames.length === 0 ? (
          <div className="esma-empty">
            <Search size={28} />
            <strong>{t('common.no_results', 'Sonuç bulunamadı')}</strong>
            <span>{t('esma.emptyHint', 'Arama kelimesini veya favori filtresini değiştirebilirsin.')}</span>
          </div>
        ) : (
          <div className="esma-list">
            {filteredNames.map((esma) => {
              const isExpanded = expandedId === esma.id;
              const isFavorite = favorites.includes(esma.id);

              return (
                <article className={`esma-row ${isExpanded ? 'is-expanded' : ''}`} key={esma.id}>
                  <button
                    type="button"
                    className="esma-row__trigger"
                    onClick={() => setExpandedId(isExpanded ? null : esma.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`esma-detail-${esma.id}`}
                  >
                    <span className="esma-row__number">{String(esma.id).padStart(2, '0')}</span>
                    <span className="esma-row__copy">
                      <strong>{esma.latin}</strong>
                      <small>{esma.meaning}</small>
                    </span>
                    <span className="esma-row__arabic" lang="ar" dir="rtl">{esma.arabic}</span>
                    <ChevronDown className="esma-row__chevron" size={19} aria-hidden="true" />
                  </button>

                  {isExpanded && (
                    <div className="esma-row__detail" id={`esma-detail-${esma.id}`}>
                      {esma.detail && <p>{esma.detail}</p>}
                      <div className="esma-row__actions">
                        <button
                          type="button"
                          className={isFavorite ? 'is-favorite' : ''}
                          onClick={() => toggleFavorite(esma.id)}
                          aria-pressed={isFavorite}
                        >
                          <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
                          {isFavorite ? t('common.inFavorites', 'Favorilerde') : t('common.favorite', 'Favori')}
                        </button>
                        <button type="button" onClick={() => shareEsma(esma)}>
                          <Share2 size={17} />
                          {t('common.share', 'Paylaş')}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <aside className="esma-note">
        <BookOpenText size={19} aria-hidden="true" />
        <div>
          <strong>{t('esma.aboutTitle', 'Esmaül Hüsna hakkında')}</strong>
          <p>
            {t('esma.info_note', "Esmâü'l-Hüsnâ, Allah Teâlâ'nın en güzel isimleri demektir. Bu isimleri zikretmek, anlamlarını tefekkür etmek ve bu isimlerle Allah'a dua etmek müstehaptır.")}
          </p>
        </div>
        <Info size={16} aria-hidden="true" />
      </aside>
    </main>
  );
}

export default EsmaUlHusna;
