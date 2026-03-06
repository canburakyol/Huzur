import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSurahComplete, getAyahAudioUrl, getAvailableTranslations } from '../services/quranService';
import { ChevronLeft, Play, Pause, Menu, X, SkipBack, SkipForward, Bookmark, Globe } from 'lucide-react';
import { storageService } from '../services/storageService';
import './Quran.css';

const QURAN_STORAGE_KEYS = {
    FAVORITES: 'quranFavorites',
    LAST_READ: 'quranLastRead'
};

const EMPTY_ARRAY = [];
const normalizeTranslationId = (translationId) => (translationId === 'tr.diyanet' ? 'tr.vakfi' : translationId);
const BASMALA_TEXT = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

function Quran({ onClose }) {
    const { t, i18n } = useTranslation();
    const [quranMeta, setQuranMeta] = useState(null);
    const [isQuranMetaLoading, setIsQuranMetaLoading] = useState(false);

    const [currentSurahNumber, setCurrentSurahNumber] = useState(null);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [surahContent, setSurahContent] = useState(null);
    const [isSurahLoading, setIsSurahLoading] = useState(false);
    const [surahLoadError, setSurahLoadError] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedReciter, setSelectedReciter] = useState(null);
    const [showBars, setShowBars] = useState(true);
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [activeMenuTab, setActiveMenuTab] = useState('surahs');
    const [playingAyah, setPlayingAyah] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [translations, setTranslations] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [volume] = useState(1);

    const audioRef = useRef(null);
    const contentRef = useRef(null);
    const latestLoadRequestRef = useRef(0);
    const hasInitializedRef = useRef(false);

    const loadQuranMeta = useCallback(async () => {
        if (quranMeta || isQuranMetaLoading) {
            return;
        }

        setIsQuranMetaLoading(true);
        try {
            const [surahModule, fihristModule] = await Promise.all([
                import('../data/surahList'),
                import('../data/detailedFihrist')
            ]);

            setQuranMeta({
                surahList: surahModule.surahList || EMPTY_ARRAY,
                reciters: surahModule.reciters || EMPTY_ARRAY,
                detailedFihrist: fihristModule.detailedFihrist || EMPTY_ARRAY
            });
        } catch (error) {
            console.error('Quran metadata load error:', error);
        } finally {
            setIsQuranMetaLoading(false);
        }
    }, [isQuranMetaLoading, quranMeta]);

    useEffect(() => {
        loadQuranMeta();
    }, [loadQuranMeta]);

    const surahList = useMemo(() => quranMeta?.surahList || EMPTY_ARRAY, [quranMeta]);
    const reciters = useMemo(() => quranMeta?.reciters || EMPTY_ARRAY, [quranMeta]);
    const detailedFihrist = useMemo(() => quranMeta?.detailedFihrist || EMPTY_ARRAY, [quranMeta]);

    const getInitialTranslation = useCallback(() => {
        if (i18n.language === 'en') return 'en.sahih';
        if (i18n.language === 'ar') return 'ar.jalalayn';
        return 'tr.vakfi';
    }, [i18n.language]);

    const [selectedTranslation, setSelectedTranslation] = useState(() => normalizeTranslationId(getInitialTranslation()));

    const activeSurah = useMemo(() => {
        const canonicalSurahNumber = Number(currentSurahNumber ?? surahContent?.number ?? selectedSurah?.number);

        if (!canonicalSurahNumber) {
            return selectedSurah;
        }

        return surahList.find((surah) => surah.number === canonicalSurahNumber) || selectedSurah;
    }, [currentSurahNumber, selectedSurah, surahContent, surahList]);

    const ayahCount =
        activeSurah?.ayahCount ||
        surahContent?.numberOfAyahs ||
        surahContent?.ayahs?.length ||
        0;

    const selectedTranslationLabel = useMemo(() => {
        const translationName = translations.find((translation) => translation.identifier === selectedTranslation)?.name;

        if (translationName) {
            return translationName;
        }

        const fallbackLabels = {
            'tr.vakfi': 'Diyanet Vakfı (Türkçe)',
            'en.sahih': 'Sahih International (English)',
            'ar.jalalayn': 'Tafsir Al-Jalalayn (العربية)'
        };

        return fallbackLabels[selectedTranslation] || 'Meal';
    }, [selectedTranslation, translations]);

    const transliterationLabel = selectedTranslation.startsWith('tr') ? 'Türkçe okunuş' : 'Transliteration';

    useEffect(() => {
        if (!selectedReciter && reciters.length > 0) {
            setSelectedReciter(reciters[0]);
        }
    }, [selectedReciter, reciters]);

    const scrollToAyah = useCallback((ayahId) => {
        window.setTimeout(() => {
            const ayahElement = document.getElementById(`ayah-${ayahId}`);
            if (ayahElement) {
                ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }, []);

    const loadSurah = useCallback(async (surahId, initialAyahId = null, translationIdOverride = null) => {
        const currentRequestId = ++latestLoadRequestRef.current;
        const normalizedSurahId = Number(surahId);
        const translationId = normalizeTranslationId(translationIdOverride || selectedTranslation);
        const surahInfo = surahList.find((surah) => surah.number === normalizedSurahId) || null;

        setCurrentSurahNumber(normalizedSurahId);
        setSelectedSurah(surahInfo);
        setSurahContent(null);
        setIsSurahLoading(true);
        setSurahLoadError('');
        setShowSideMenu(false);
        setSelectedTopic(null);
        setExpandedCategory(null);
        setIsPlaying(false);
        setPlayingAyah(null);

        try {
            const content = await getSurahComplete(normalizedSurahId, translationId);

            if (currentRequestId !== latestLoadRequestRef.current || !content) {
                return;
            }

            const canonicalSurahNumber = Number(content.number ?? normalizedSurahId);
            const canonicalSurah =
                surahList.find((surah) => surah.number === canonicalSurahNumber) || surahInfo;

            setSurahContent(content);
            setCurrentSurahNumber(canonicalSurahNumber);
            setSelectedSurah(canonicalSurah);

            if (initialAyahId) {
                scrollToAyah(initialAyahId);
            } else if (contentRef.current) {
                contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Surah load error:', error);
            if (currentRequestId === latestLoadRequestRef.current) {
                setSurahLoadError('Sure yuklenemedi');
            }
        } finally {
            if (currentRequestId === latestLoadRequestRef.current) {
                setIsSurahLoading(false);
            }
        }
    }, [scrollToAyah, selectedTranslation, surahList]);

    useEffect(() => {
        if (hasInitializedRef.current || surahList.length === 0) {
            return;
        }

        hasInitializedRef.current = true;

        const init = async () => {
            try {
                const storedFavorites = storageService.getItem(QURAN_STORAGE_KEYS.FAVORITES, []);
                setFavorites(storedFavorites);

                const storedLastRead = storageService.getItem(QURAN_STORAGE_KEYS.LAST_READ, null);
                const availableTranslations = await getAvailableTranslations();
                setTranslations(availableTranslations);

                const startSurahId = storedLastRead?.surahId || 1;
                const startAyahId = storedLastRead?.ayahId || null;

                await loadSurah(startSurahId, startAyahId);
            } catch (error) {
                console.error('Initialization error:', error);
            }
        };

        init();

        const audio = audioRef.current;
        return () => {
            if (audio) {
                audio.pause();
                audio.src = '';
            }
        };
    }, [loadSurah, surahList.length]);

    useEffect(() => {
        const nextTranslation = normalizeTranslationId(getInitialTranslation());

        if (nextTranslation === selectedTranslation) {
            return;
        }

        setSelectedTranslation(nextTranslation);

        if (activeSurah) {
            loadSurah(activeSurah.number, null, nextTranslation);
        }
    }, [activeSurah, getInitialTranslation, loadSurah, selectedTranslation]);

    const handleTranslationChange = async (translationId) => {
        const normalizedTranslationId = normalizeTranslationId(translationId);
        setSelectedTranslation(normalizedTranslationId);

        if (activeSurah) {
            await loadSurah(activeSurah.number, null, normalizedTranslationId);
        }
    };

    const toggleFavorite = (surah, ayah) => {
        const previewText = ayah.translation || ayah.arabic || '';
        const newFavorite = {
            surahId: surah.number,
            ayahId: ayah.number,
            text: previewText,
            surahName: surah.nameTranslation
        };

        const exists = favorites.find(
            (favorite) => favorite.surahId === newFavorite.surahId && favorite.ayahId === newFavorite.ayahId
        );

        const newFavorites = exists
            ? favorites.filter(
                (favorite) => !(favorite.surahId === newFavorite.surahId && favorite.ayahId === newFavorite.ayahId)
            )
            : [...favorites, newFavorite];

        setFavorites(newFavorites);
        storageService.setItem(QURAN_STORAGE_KEYS.FAVORITES, newFavorites);
    };

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) {
            return undefined;
        }

        let isMounted = true;

        const syncAudio = async () => {
            try {
                if (playingAyah && activeSurah && selectedReciter) {
                    const url = getAyahAudioUrl(activeSurah.number, playingAyah, selectedReciter.id);

                    if (audio.src !== url) {
                        audio.src = url;
                        audio.load();
                    }

                    if (isPlaying && isMounted) {
                        const playPromise = audio.play();
                        if (playPromise !== undefined) {
                            playPromise.catch((error) => {
                                if (isMounted) {
                                    console.error('Playback prevented:', error);
                                    if (error.name === 'NotAllowedError') {
                                        setIsPlaying(false);
                                    }
                                }
                            });
                        }
                    } else {
                        audio.pause();
                    }
                } else if (!playingAyah) {
                    audio.pause();
                }
            } catch (error) {
                console.error('Audio setup error:', error);
                if (isMounted) {
                    setIsPlaying(false);
                }
            }
        };

        syncAudio();

        return () => {
            isMounted = false;
        };
    }, [activeSurah, isPlaying, playingAyah, selectedReciter]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handlePlayPause = () => {
        if (!playingAyah) {
            setPlayingAyah(1);
            setIsPlaying(true);
            return;
        }

        setIsPlaying((prev) => !prev);
    };

    const handleAyahEnd = () => {
        if (activeSurah && playingAyah < ayahCount) {
            setPlayingAyah((prev) => prev + 1);
            setIsPlaying(true);
            return;
        }

        setIsPlaying(false);
        setPlayingAyah(null);
    };

    useEffect(() => {
        if (activeSurah && playingAyah) {
            storageService.setItem(QURAN_STORAGE_KEYS.LAST_READ, {
                surahId: activeSurah.number,
                surahName: activeSurah.name,
                ayahId: playingAyah,
                timestamp: Date.now()
            });
        }
    }, [activeSurah, playingAyah]);

    const handleSeek = (event) => {
        const ayahNumber = Number(event.target.value);
        setPlayingAyah(ayahNumber);
        setIsPlaying(true);
    };

    const handleNextAyah = () => {
        if (activeSurah && playingAyah < ayahCount) {
            setPlayingAyah((prev) => prev + 1);
            setIsPlaying(true);
        }
    };

    const handlePrevAyah = () => {
        if (playingAyah > 1) {
            setPlayingAyah((prev) => prev - 1);
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        if (!('mediaSession' in navigator) || !activeSurah || !playingAyah || !selectedReciter) {
            return undefined;
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: `${activeSurah.nameTranslation} - ${playingAyah}. Ayet`,
            artist: selectedReciter.name,
            album: 'Huzur - Kuran-i Kerim',
            artwork: [
                { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
        navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (playingAyah > 1) {
                setPlayingAyah((prev) => prev - 1);
                setIsPlaying(true);
            }
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            if (playingAyah < ayahCount) {
                setPlayingAyah((prev) => prev + 1);
                setIsPlaying(true);
            }
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (audioRef.current && details.seekTime) {
                audioRef.current.currentTime = details.seekTime;
            }
        });

        return () => {
            navigator.mediaSession.setActionHandler('play', null);
            navigator.mediaSession.setActionHandler('pause', null);
            navigator.mediaSession.setActionHandler('previoustrack', null);
            navigator.mediaSession.setActionHandler('nexttrack', null);
            navigator.mediaSession.setActionHandler('seekto', null);
        };
    }, [activeSurah, ayahCount, playingAyah, selectedReciter]);

    if (!activeSurah || !selectedReciter || isQuranMetaLoading || isSurahLoading || !surahContent) {
        return (
            <div className="library-loading">
                <div className="spinner premium"></div>
                {activeSurah && <div className="quran-loading-label">{activeSurah.nameTranslation}</div>}
                {surahLoadError && <div className="quran-loading-error">{surahLoadError}</div>}
            </div>
        );
    }

    return (
        <div className="quran-container">
            <div className={`quran-royal-header ${showBars ? 'visible' : 'hidden'}`}>
                <div className="header-top-row">
                    <button onClick={onClose} className="player-action-btn">
                        <ChevronLeft size={28} />
                    </button>

                    <div className="surah-titles">
                        <div className="surah-name-ar-display">{activeSurah.name}</div>
                        <div className="surah-name-tr-display">{activeSurah.nameTranslation}</div>
                        <div className="surah-meta-strip">
                            <span className="surah-meta-pill">{activeSurah.revelationType}</span>
                            <span className="surah-meta-pill">{ayahCount} {t('quran.ayah')}</span>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button
                            onClick={() => {
                                setActiveMenuTab('translations');
                                setShowSideMenu(true);
                            }}
                            className="player-action-btn"
                        >
                            <Globe size={24} />
                        </button>
                        <button
                            onClick={() => {
                                setActiveMenuTab('surahs');
                                setShowSideMenu(true);
                            }}
                            className="player-action-btn"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {showSideMenu && <div className="side-menu-overlay" onClick={() => setShowSideMenu(false)} />}

            <div className={`quran-side-menu-premium ${showSideMenu ? 'open' : ''}`}>
                <div className="side-menu-header">
                    <h3>{t('quran.menu')}</h3>
                    <button onClick={() => setShowSideMenu(false)} className="player-action-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="side-menu-tabs-premium">
                    <button className={`side-tab-btn ${activeMenuTab === 'surahs' ? 'active' : ''}`} onClick={() => setActiveMenuTab('surahs')}>{t('quran.surahs')}</button>
                    <button className={`side-tab-btn ${activeMenuTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setActiveMenuTab('bookmarks')}>{t('quran.bookmarks')}</button>
                    <button className={`side-tab-btn ${activeMenuTab === 'translations' ? 'active' : ''}`} onClick={() => setActiveMenuTab('translations')}>{t('quran.translations')}</button>
                    <button className={`side-tab-btn ${activeMenuTab === 'reciters' ? 'active' : ''}`} onClick={() => setActiveMenuTab('reciters')}>{t('quran.reciters')}</button>
                    <button className={`side-tab-btn ${activeMenuTab === 'fihrist' ? 'active' : ''}`} onClick={() => setActiveMenuTab('fihrist')}>{t('quran.fihrist')}</button>
                </div>

                <div className="side-menu-content">
                    {activeMenuTab === 'surahs' && (
                        <div className="list-content">
                            {surahList.map((surah) => (
                                <div
                                    key={surah.number}
                                    className={`premium-list-item ${activeSurah?.number === surah.number ? 'active' : ''}`}
                                    onClick={() => loadSurah(surah.number)}
                                >
                                    <div className="item-number-ring">{surah.number}</div>
                                    <div className="item-main-info">
                                        <div className="item-primary-text">{surah.nameTranslation}</div>
                                        <div className="item-secondary-text">{surah.ayahCount} {t('quran.ayah')}</div>
                                    </div>
                                    <div className="item-arabic-text">{surah.name}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeMenuTab === 'bookmarks' && (
                        <div className="list-content">
                            {favorites.length === 0 ? (
                                <div className="empty-state">{t('quran.noBookmarks')}</div>
                            ) : (
                                favorites.map((favorite, index) => (
                                    <div key={index} className="premium-list-item" onClick={() => loadSurah(favorite.surahId, favorite.ayahId)}>
                                        <div className="item-main-info">
                                            <div className="item-primary-text">{favorite.surahName} - {favorite.ayahId}. {t('quran.ayah')}</div>
                                            <div className="item-secondary-text">{(favorite.text || '').substring(0, 50)}...</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeMenuTab === 'translations' && (
                        <div className="list-content">
                            {translations.map((translation) => (
                                <div
                                    key={translation.identifier}
                                    className={`premium-list-item ${selectedTranslation === translation.identifier ? 'active' : ''}`}
                                    onClick={() => handleTranslationChange(translation.identifier)}
                                >
                                    <div className="item-main-info">
                                        <div className="item-primary-text">{translation.name}</div>
                                        <div className="item-secondary-text">{translation.language.toUpperCase()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeMenuTab === 'reciters' && (
                        <div className="list-content">
                            {reciters.map((reciter) => (
                                <div
                                    key={reciter.id}
                                    className={`premium-list-item ${selectedReciter?.id === reciter.id ? 'active' : ''}`}
                                    onClick={() => setSelectedReciter(reciter)}
                                >
                                    <div className="item-main-info">
                                        <div className="item-primary-text">{reciter.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeMenuTab === 'fihrist' && (
                        <div className="list-content">
                            {selectedTopic ? (
                                <div className="topic-detail">
                                    <button className="back-btn" onClick={() => setSelectedTopic(null)}>
                                        <ChevronLeft size={16} /> {t('quran.backToTopics')}
                                    </button>

                                    <h4>{selectedTopic.title}</h4>

                                    <div className="topic-ayahs">
                                        {selectedTopic.ayahs.map((ref, index) => {
                                            const surah = surahList.find((item) => item.number === ref.s);

                                            return (
                                                <div
                                                    key={`${ref.s}-${ref.a}-${index}`}
                                                    className="premium-list-item"
                                                    onClick={() => loadSurah(ref.s, ref.a)}
                                                >
                                                    <div className="item-main-info">
                                                        <div className="item-primary-text">
                                                            {surah?.nameTranslation} {t('quran.surah')}, {ref.a}. {t('quran.ayah')}
                                                        </div>
                                                        <div className="item-secondary-text">{t('quran.relatedAyah')}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                detailedFihrist.map((category, index) => (
                                    <div key={category.category} className="fihrist-category-premium">
                                        <button
                                            className="fihrist-category-btn"
                                            onClick={() => setExpandedCategory(expandedCategory === index ? null : index)}
                                        >
                                            <span>{category.category}</span>
                                            <span>{expandedCategory === index ? '-' : '+'}</span>
                                        </button>

                                        {expandedCategory === index && (
                                            <div className="fihrist-topics">
                                                {category.topics.map((topic) => (
                                                    <button
                                                        key={topic.title}
                                                        className="premium-list-item fihrist-topic-item"
                                                        onClick={() => setSelectedTopic(topic)}
                                                    >
                                                        <div className="item-main-info">
                                                            <div className="item-primary-text">{topic.title}</div>
                                                            <div className="item-secondary-text">
                                                                {topic.ayahs.length} {t('quran.ayah')}
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div
                className={`quran-scroll-area ${showBars ? '' : 'bars-hidden'}`.trim()}
                onClick={() => setShowBars((prev) => !prev)}
                ref={contentRef}
            >
                <div className="mushaf-frame">
                    <div className="mushaf-paper">
                        <div className="mushaf-surah-heading">
                            <div className="mushaf-surah-name-ar">{activeSurah.name}</div>
                            <div className="mushaf-surah-name-tr">{activeSurah.nameTranslation}</div>
                            <div className="surah-meta-strip page-meta">
                                <span className="surah-meta-pill">{activeSurah.revelationType}</span>
                                <span className="surah-meta-pill">{ayahCount} {t('quran.ayah')}</span>
                            </div>
                        </div>

                        {activeSurah.number !== 1 && activeSurah.number !== 9 && (
                            <div className="basmala-container-premium">{BASMALA_TEXT}</div>
                        )}

                        {surahContent.ayahs.map((ayah, index) => {
                            const isFavorite = favorites.some(
                                (favorite) => favorite.surahId === activeSurah.number && favorite.ayahId === ayah.number
                            );

                            return (
                                <div
                                    key={ayah.number}
                                    id={`ayah-${ayah.number}`}
                                    className={`mushaf-ayah-block reveal-stagger ${playingAyah === ayah.number ? 'active' : ''}`}
                                    style={{ '--delay': `${index * 0.02}s` }}
                                >
                                    <div className="ayah-meta-row">
                                        <div className="ayah-id-badge">{ayah.number}</div>

                                        <div className="ayah-actions-premium">
                                            <button
                                                className="player-action-btn"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    toggleFavorite(activeSurah, ayah);
                                                }}
                                            >
                                                <Bookmark
                                                    size={20}
                                                    fill={isFavorite ? 'var(--quran-gold)' : 'none'}
                                                    color={isFavorite ? 'var(--quran-gold)' : 'var(--quran-text-muted)'}
                                                />
                                            </button>
                                            <button
                                                className="player-action-btn"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    if (playingAyah === ayah.number) {
                                                        setIsPlaying(!isPlaying);
                                                    } else {
                                                        setPlayingAyah(ayah.number);
                                                        setIsPlaying(true);
                                                    }
                                                }}
                                            >
                                                {playingAyah === ayah.number && isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="ayah-arabic-display">{ayah.arabic}</div>

                                    {ayah.transliteration && (
                                        <>
                                            <div className="ayah-section-label">{transliterationLabel}</div>
                                            <div className="ayah-latin-display">{ayah.transliteration}</div>
                                        </>
                                    )}

                                    <div className="ayah-section-label">{selectedTranslationLabel}</div>
                                    <div className="ayah-meaning-display">{ayah.translation}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className={`quran-player-bar-premium ${showBars ? 'visible' : 'hidden'}`}>
                <audio ref={audioRef} onEnded={handleAyahEnd} />

                <div className="premium-slider-container">
                    <input
                        type="range"
                        min="1"
                        max={ayahCount}
                        value={playingAyah || 0}
                        onChange={handleSeek}
                        className="premium-slider"
                    />
                    <div className="premium-slider-meta">
                        <span>{playingAyah || 0}. Ayet</span>
                        <span>{ayahCount} Ayet</span>
                    </div>
                </div>

                <div className="player-main-controls">
                    <button className="player-action-btn" onClick={handlePrevAyah} disabled={!playingAyah || playingAyah <= 1}>
                        <SkipBack size={32} />
                    </button>

                    <button className="play-pause-btn-premium" onClick={handlePlayPause}>
                        {isPlaying ? <Pause size={32} /> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />}
                    </button>

                    <button className="player-action-btn" onClick={handleNextAyah} disabled={!playingAyah || playingAyah >= ayahCount}>
                        <SkipForward size={32} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Quran;
