import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSurahComplete, getAyahAudioUrl, getAvailableTranslations } from '../../../services/quranService';
import { ChevronLeft, Play, Pause, Menu, X, SkipBack, SkipForward, Bookmark, Globe, Eye, EyeOff } from 'lucide-react';
import { storageService } from '../../../services/storageService';
import { surahList as staticSurahList, reciters as staticReciters } from '../../../data/surahList';
import { logger } from '../../../utils/logger';
import './Quran.css';

const QURAN_STORAGE_KEYS = {
    FAVORITES: 'quranFavorites',
    LAST_READ: 'quranLastRead',
    SIMPLE_MODE: 'quranSimpleMode'
};



const EMPTY_ARRAY = [];
const DEFAULT_TRANSLATIONS = [
    { identifier: 'tr.vakfi', name: 'Diyanet Vakfi (Turkce)', language: 'tr', type: 'translation' },
    { identifier: 'en.sahih', name: 'Sahih International (English)', language: 'en', type: 'translation' },
    { identifier: 'ar.jalalayn', name: 'Tafsir Al-Jalalayn (العربية)', language: 'ar', type: 'tafsir' }
];
const normalizeTranslationId = (translationId) => (translationId === 'tr.diyanet' ? 'tr.vakfi' : translationId);
const BASMALA_TEXT = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

const smoothScrollTo = (container, targetY, duration = 350) => {
    const startY = container.scrollTop;
    const difference = targetY - startY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing: easeInOutCubic
        const ease = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        container.scrollTop = startY + difference * ease;

        if (timeElapsed < duration) {
            window.requestAnimationFrame(animateScroll);
        }
    };

    window.requestAnimationFrame(animateScroll);
};

function Quran({ onClose }) {
    const { t, i18n } = useTranslation();

    const [currentSurahNumber, setCurrentSurahNumber] = useState(null);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [surahContent, setSurahContent] = useState(null);
    const [isSurahLoading, setIsSurahLoading] = useState(false);
    const [surahLoadError, setSurahLoadError] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedReciter, setSelectedReciter] = useState(null);
    const [showBars, setShowBars] = useState(true);
    const [activeReadingAyah, setActiveReadingAyah] = useState(1);
    const [isReaderScrolling, setIsReaderScrolling] = useState(false);
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [activeMenuTab, setActiveMenuTab] = useState('surahs');
    const [playingAyah, setPlayingAyah] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [translations, setTranslations] = useState(DEFAULT_TRANSLATIONS);
    const [detailedFihrist, setDetailedFihrist] = useState(EMPTY_ARRAY);
    const [isFihristLoading, setIsFihristLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [volume] = useState(1);
    const [simpleMode, setSimpleMode] = useState(() => storageService.getItem(QURAN_STORAGE_KEYS.SIMPLE_MODE, false));

    const audioRef = useRef(null);
    const contentRef = useRef(null);
    const latestLoadRequestRef = useRef(0);
    const hasInitializedRef = useRef(false);
    const scrollIdleTimerRef = useRef(null);
    const scrollFrameRef = useRef(null);
    const lastLangRef = useRef(i18n.language);
    const isProgrammaticScrollRef = useRef(false);

    const surahList = useMemo(() => staticSurahList || EMPTY_ARRAY, []);
    const reciters = useMemo(() => staticReciters || EMPTY_ARRAY, []);

    const getInitialTranslation = useCallback(() => {
        if (i18n.language === 'en') return 'en.sahih';
        if (i18n.language === 'ar') return 'ar.jalalayn';
        return 'tr.vakfi';
    }, [i18n.language]);

    const [selectedTranslation, setSelectedTranslation] = useState(() => normalizeTranslationId(getInitialTranslation()));

    const loadDetailedFihrist = useCallback(async () => {
        if (detailedFihrist.length > 0 || isFihristLoading) {
            return;
        }

        setIsFihristLoading(true);
        try {
            const fihristModule = await import('../../../data/detailedFihrist');
            setDetailedFihrist(fihristModule.detailedFihrist || EMPTY_ARRAY);
        } catch (error) {
            logger.error('Detailed fihrist load error:', error);
        } finally {
            setIsFihristLoading(false);
        }
    }, [detailedFihrist.length, isFihristLoading]);

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

    useEffect(() => {
        let isMounted = true;

        const loadTranslations = async () => {
            try {
                const availableTranslations = await getAvailableTranslations();
                if (isMounted && Array.isArray(availableTranslations) && availableTranslations.length > 0) {
                    setTranslations(availableTranslations);
                }
            } catch (error) {
                logger.error('Translations load error:', error);
            }
        };

        void loadTranslations();

        return () => {
            isMounted = false;
        };
    }, []);

    const scrollToAyah = useCallback((ayahId) => {
        isProgrammaticScrollRef.current = true;
        window.setTimeout(() => {
            const container = contentRef.current;
            const ayahElement = document.getElementById(`ayah-${ayahId}`);
            if (container && ayahElement) {
                const elementOffsetTop = ayahElement.offsetTop;
                const elementHeight = ayahElement.offsetHeight;
                const containerHeight = container.clientHeight;

                const targetY = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2);
                smoothScrollTo(container, targetY, 350);
            }

            window.setTimeout(() => {
                isProgrammaticScrollRef.current = false;
            }, 450);
        }, 100);
    }, []);

    const handleReaderScroll = useCallback(() => {
        setIsReaderScrolling(true);
        setShowBars(false);
        window.clearTimeout(scrollIdleTimerRef.current);

        if (isProgrammaticScrollRef.current) {
            scrollIdleTimerRef.current = window.setTimeout(() => {
                setIsReaderScrolling(false);
                setShowBars(true);
            }, 700);
            return;
        }

        if (!scrollFrameRef.current) {
            scrollFrameRef.current = window.requestAnimationFrame(() => {
                scrollFrameRef.current = null;
                const viewportCenter = window.innerHeight / 2;
                const blocks = contentRef.current?.querySelectorAll('.mushaf-ayah-block') || [];
                let closestAyah = null;
                let closestDistance = Number.POSITIVE_INFINITY;

                blocks.forEach((block) => {
                    const rect = block.getBoundingClientRect();
                    const distance = Math.abs((rect.top + rect.bottom) / 2 - viewportCenter);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestAyah = Number(block.dataset.ayahNumber);
                    }
                });

                if (closestAyah) setActiveReadingAyah(closestAyah);
            });
        }

        scrollIdleTimerRef.current = window.setTimeout(() => {
            setIsReaderScrolling(false);
            setShowBars(true);
        }, 700);
    }, []);

    useEffect(() => () => {
        window.clearTimeout(scrollIdleTimerRef.current);
        if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current);
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
                smoothScrollTo(contentRef.current, 0, 300);
            }
        } catch (error) {
            logger.error('Surah load error:', error);
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
                const startSurahId = storedLastRead?.surahId || 1;
                const startAyahId = storedLastRead?.ayahId || null;

                await loadSurah(startSurahId, startAyahId);
            } catch (error) {
                logger.error('Initialization error:', error);
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
        if (lastLangRef.current !== i18n.language) {
            lastLangRef.current = i18n.language;
            const nextTranslation = normalizeTranslationId(getInitialTranslation());
            setSelectedTranslation(nextTranslation);

            if (activeSurah) {
                void loadSurah(activeSurah.number, null, nextTranslation);
            }
        }
    }, [activeSurah, getInitialTranslation, loadSurah, i18n.language]);

    useEffect(() => {
        if (activeMenuTab === 'fihrist' && detailedFihrist.length === 0) {
            void loadDetailedFihrist();
        }
    }, [activeMenuTab, detailedFihrist.length, loadDetailedFihrist]);

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

    const toggleSimpleMode = () => {
        const newMode = !simpleMode;
        setSimpleMode(newMode);
        storageService.setItem(QURAN_STORAGE_KEYS.SIMPLE_MODE, newMode);
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
                                    logger.error('Playback prevented:', error);
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
                logger.error('Audio setup error:', error);
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

    const prepareAudioForAyah = useCallback((ayahNumber) => {
        const audio = audioRef.current;

        if (!audio || !activeSurah || !selectedReciter) {
            return null;
        }

        const url = getAyahAudioUrl(activeSurah.number, ayahNumber, selectedReciter.id);

        if ((audio.currentSrc || audio.src) !== url) {
            audio.src = url;
            audio.load();
        }

        return audio;
    }, [activeSurah, selectedReciter]);

    const playAyah = useCallback(async (ayahNumber) => {
        const cleanAyahNumber = Number(ayahNumber);
        const audio = prepareAudioForAyah(cleanAyahNumber);

        setPlayingAyah(cleanAyahNumber);
        setActiveReadingAyah(cleanAyahNumber);
        setIsPlaying(true);

        if (!audio) {
            return;
        }

        try {
            await audio.play();
        } catch (error) {
            logger.error('Playback failed:', error);
            setIsPlaying(false);
        }
    }, [prepareAudioForAyah]);

    const handlePlayPause = () => {
        if (!playingAyah) {
            void playAyah(activeReadingAyah || 1);
            return;
        }

        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }

        void playAyah(playingAyah);
    };

    const handleAyahEnd = () => {
        const audio = audioRef.current;
        if (!audio) return;

        // Prevent fake ended events fired by the browser on source changes
        const isNaturalEnd = audio.duration > 0 && Math.abs(audio.currentTime - audio.duration) < 1.0;
        if (!isNaturalEnd) {
            logger.info('Bypassing non-natural audio ended event');
            return;
        }

        if (activeSurah && playingAyah && playingAyah < ayahCount) {
            const nextAyah = Number(playingAyah) + 1;
            setPlayingAyah(nextAyah);
            setActiveReadingAyah(nextAyah);
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
        void playAyah(ayahNumber);
    };

    const handleNextAyah = () => {
        if (activeSurah && playingAyah && playingAyah < ayahCount) {
            void playAyah(playingAyah + 1);
        }
    };

    const handlePrevAyah = () => {
        if (playingAyah && playingAyah > 1) {
            void playAyah(playingAyah - 1);
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

        navigator.mediaSession.setActionHandler('play', () => {
            void playAyah(playingAyah);
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            audioRef.current?.pause();
            setIsPlaying(false);
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (playingAyah > 1) {
                void playAyah(playingAyah - 1);
            }
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            if (playingAyah < ayahCount) {
                void playAyah(playingAyah + 1);
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
    }, [activeSurah, ayahCount, playAyah, playingAyah, selectedReciter]);

    if (!activeSurah || !selectedReciter || isSurahLoading || !surahContent) {
        return (
            <div className="library-loading">
                <div className="spinner premium"></div>
                {activeSurah && <div className="quran-loading-label">{activeSurah.nameTranslation}</div>}
                {surahLoadError && <div className="quran-loading-error">{surahLoadError}</div>}
            </div>
        );
    }

    const sliderAyah = playingAyah || activeReadingAyah || 1;
    const sliderProgress = ayahCount > 1 ? ((sliderAyah - 1) / (ayahCount - 1)) * 100 : 0;
    const ayahSelectorTitle = t('quran.ayahSelectorTitle', 'Ayet sec');
    const ayahSelectorHint = t('quran.ayahSelectorHint', 'Kaydirinca secilen ayet hemen calmaya baslar');
    const activeAyahLabel = isPlaying && playingAyah
        ? t('quran.playingAyahLabel', 'Calan ayet')
        : t('quran.selectedAyahLabel', 'Secili ayet');
    const totalAyahsLabel = t('quran.totalAyahsLabel', 'Toplam');

    return (
        <div className={`quran-container ${showBars ? '' : 'bars-hidden'}`}>
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
                            onClick={toggleSimpleMode}
                            className="player-action-btn"
                            title={simpleMode ? 'Detaylı Mod' : 'Basit Mod'}
                        >
                            {simpleMode ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
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
                            {isFihristLoading ? (
                                <div className="empty-state">{t('common.loading', 'Yukleniyor...')}</div>
                            ) : selectedTopic ? (
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
                className={`quran-scroll-area ${showBars ? '' : 'bars-hidden'} ${isReaderScrolling ? 'is-scrolling' : 'is-idle'}`.trim()}
                onScroll={handleReaderScroll}
                onClick={() => setShowBars(true)}
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

                        {simpleMode && (
                            <div style={{
                                textAlign: 'center', padding: '8px 16px', marginBottom: '16px',
                                background: 'var(--surface-action-soft)', borderRadius: '20px',
                                border: '1px solid var(--border-soft)',
                                fontSize: '0.75rem', fontWeight: '700', color: 'var(--brand-primary)'
                            }}>
                                Basit Mod - Meal için Detayları Göster'e tıklayın
                            </div>
                        )}

                        {surahContent.ayahs.map((ayah, index) => {
                            const isFavorite = favorites.some(
                                (favorite) => favorite.surahId === activeSurah.number && favorite.ayahId === ayah.number
                            );

                            return (
                                <div
                                    key={ayah.number}
                                    id={`ayah-${ayah.number}`}
                                    data-ayah-number={ayah.number}
                                    className={`mushaf-ayah-block reveal-stagger ${playingAyah === ayah.number ? 'active' : ''} ${activeReadingAyah === ayah.number ? 'is-reading-focus' : 'is-reading-muted'}`}
                                    style={{ '--delay': `${index * 0.02}s` }}
                                    onClick={() => {
                                        setActiveReadingAyah(ayah.number);
                                        if (isPlaying) {
                                            void playAyah(ayah.number);
                                        }
                                    }}
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
                                                        if (isPlaying) {
                                                            audioRef.current?.pause();
                                                            setIsPlaying(false);
                                                        } else {
                                                            void playAyah(ayah.number);
                                                        }
                                                    } else {
                                                        void playAyah(ayah.number);
                                                    }
                                                }}
                                            >
                                                {playingAyah === ayah.number && isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="ayah-arabic-display" style={{ fontSize: simpleMode ? '2rem' : '1.5rem' }}>{ayah.arabic}</div>

                                    {!simpleMode && ayah.transliteration && (
                                        <>
                                            <div className="ayah-section-label">{transliterationLabel}</div>
                                            <div className="ayah-latin-display">{ayah.transliteration}</div>
                                        </>
                                    )}

                                    {!simpleMode && (
                                        <>
                                            <div className="ayah-section-label">{selectedTranslationLabel}</div>
                                            <div className="ayah-meaning-display">{ayah.translation}</div>
                                        </>
                                    )}

                                    {simpleMode && (
                                        <button
                                            className="show-details-btn"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setSimpleMode(false);
                                                storageService.setItem(QURAN_STORAGE_KEYS.SIMPLE_MODE, false);
                                            }}
                                            style={{
                                                marginTop: '12px', padding: '8px 16px', borderRadius: '20px',
                                                background: 'var(--surface-action-hover)', border: '1px solid var(--border-strong)',
                                                color: 'var(--brand-primary)', fontSize: '0.8rem', fontWeight: '700',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Detayları Göster
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className={`quran-player-bar-premium ${showBars ? 'visible' : 'hidden'}`}>
                <audio ref={audioRef} onEnded={handleAyahEnd} />

                <div className="player-main-controls">
                    <button className="player-action-btn" onClick={handlePrevAyah} disabled={!playingAyah || playingAyah <= 1}>
                        <SkipBack size={18} />
                    </button>

                    <button className="play-pause-btn-premium" onClick={handlePlayPause}>
                        {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" style={{ marginLeft: '1px' }} />}
                    </button>

                    <button className="player-action-btn" onClick={handleNextAyah} disabled={!playingAyah || playingAyah >= ayahCount}>
                        <SkipForward size={18} />
                    </button>
                </div>

                <div className="premium-slider-container" style={{ '--slider-progress': `${sliderProgress}%` }}>
                    <input
                        type="range"
                        min="1"
                        max={ayahCount}
                        value={sliderAyah}
                        onChange={handleSeek}
                        className="premium-slider"
                        aria-label={ayahSelectorTitle}
                    />
                </div>

                <div className="player-ayah-indicator">
                    <strong>{sliderAyah}/{ayahCount}</strong>
                </div>
            </div>
        </div>
    );
}

export default Quran;
