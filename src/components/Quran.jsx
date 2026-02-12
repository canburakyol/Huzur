import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getSurahComplete, getAyahAudioUrl, getAvailableTranslations } from '../services/quranService';
import { ChevronLeft, Play, Pause, Volume2, VolumeX, BookOpen, Loader, Menu, X, SkipBack, SkipForward, Heart, Share2, Headphones, List, FileText, Settings, Bookmark, Info, Globe, Maximize, Minimize } from 'lucide-react';
import { useFocus } from '../context/FocusContext';
import { storageService } from '../services/storageService';

const QURAN_STORAGE_KEYS = {
    FAVORITES: 'quranFavorites',
    LAST_READ: 'quranLastRead'
};

const EMPTY_ARRAY = [];

function Quran({ onClose }) {
    const { t, i18n } = useTranslation();
    const { isFocusMode, toggleFocusMode } = useFocus();
    const [quranMeta, setQuranMeta] = useState(null);
    const [isQuranMetaLoading, setIsQuranMetaLoading] = useState(false);

    const loadQuranMeta = useCallback(async () => {
        if (quranMeta || isQuranMetaLoading) return;

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
    }, [quranMeta, isQuranMetaLoading]);

    useEffect(() => {
        loadQuranMeta();
    }, [loadQuranMeta]);

    const surahList = useMemo(() => quranMeta?.surahList || EMPTY_ARRAY, [quranMeta]);
    const reciters = useMemo(() => quranMeta?.reciters || EMPTY_ARRAY, [quranMeta]);
    const detailedFihrist = useMemo(() => quranMeta?.detailedFihrist || EMPTY_ARRAY, [quranMeta]);
    // Core State
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [surahContent, setSurahContent] = useState(null);

    // Audio State
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedReciter, setSelectedReciter] = useState(null);
    const [volume, setVolume] = useState(1); // 0 to 1

    // UI State
    const [showBars, setShowBars] = useState(true);
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [activeMenuTab, setActiveMenuTab] = useState('surahs'); // surahs, bookmarks, translations, reciters, fihrist
    const [showTranslation] = useState(true);
    const [playingAyah, setPlayingAyah] = useState(null);

    // Fihrist State
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);

    // Data State
    const [translations, setTranslations] = useState([]);

    useEffect(() => {
        if (!selectedReciter && reciters.length > 0) {
            setSelectedReciter(reciters[0]);
        }
    }, [selectedReciter, reciters]);
    
    // Initialize translation based on current language
    const getInitialTranslation = useCallback(() => {
        if (i18n.language === 'en') return 'en.sahih';
        if (i18n.language === 'ar') return 'ar.jalalayn';
        return 'tr.vakfi';
    }, [i18n.language]);

    const [selectedTranslation, setSelectedTranslation] = useState(getInitialTranslation());
    const [favorites, setFavorites] = useState([]);

    // Local state for loading and lastRead tracking (setters only - values used internally)
    const [, setLoading] = useState(false);
    const [, setLastRead] = useState(null);

    const audioRef = useRef(null);
    const ayahAudioRef = useRef(null); // For individual ayah audio - prevents memory leak
    const contentRef = useRef(null);

    // Load a surah with its content (memoized to avoid recreation)
    const loadSurah = useCallback(async (surahId, initialAyahId = null, translationIdOverride = null) => {
        setLoading(true);
        // Reset playback state when switching surahs
        setIsPlaying(false);
        setPlayingAyah(null);
        
        try {
                const surahInfo = surahList.find(s => s.number === surahId);
            // Use override if provided, otherwise state
            const transId = translationIdOverride || selectedTranslation;
            const content = await getSurahComplete(surahId, transId);

            if (content) {
                setSurahContent(content);
                setSelectedSurah(surahInfo);
                setShowSideMenu(false);
                
                // Scroll to last read ayah if provided
                if (initialAyahId) {
                    setTimeout(() => {
                        const ayahElement = document.getElementById(`ayah-${initialAyahId}`);
                        if (ayahElement) {
                            ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Surah load error:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedTranslation, surahList]);

    // Sync translation with language change
    useEffect(() => {
        const newTrans = getInitialTranslation();
        if (newTrans !== selectedTranslation) {
            setSelectedTranslation(newTrans);
            // If a surah is already loaded, reload it with new translation
            if (selectedSurah) {
                loadSurah(selectedSurah.number, null, newTrans);
            }
        }
    }, [getInitialTranslation, selectedTranslation, selectedSurah, loadSurah]);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Load favorites and last read
                const storedFavorites = storageService.getItem(QURAN_STORAGE_KEYS.FAVORITES, []);
                setFavorites(storedFavorites);

                const storedLastRead = storageService.getItem(QURAN_STORAGE_KEYS.LAST_READ, null);
                setLastRead(storedLastRead);

                // Load available translations
                const availTranslations = await getAvailableTranslations();
                setTranslations(availTranslations);

                // Metadata yoksa surah yüklemeyi beklet
                if (surahList.length === 0) {
                    return;
                }

                // Determine start Surah and Ayah
                let startSurahId = 1;
                let startAyahId = null;
                if (storedLastRead && storedLastRead.surahId) {
                    startSurahId = storedLastRead.surahId;
                    startAyahId = storedLastRead.ayahId || null;
                }

                await loadSurah(startSurahId, startAyahId);
            } catch (error) {
                console.error('Initialization error:', error);
            } finally {
                setLoading(false);
            }
        };
        init();
        return () => {
            if (ayahAudioRef.current) {
                ayahAudioRef.current.pause();
                ayahAudioRef.current.src = '';
                ayahAudioRef.current = null;
            }
        };
    }, [loadSurah, surahList]);

    const handleTranslationChange = async (translationId) => {
        setSelectedTranslation(translationId);
        if (selectedSurah) {
            await loadSurah(selectedSurah.number, null, translationId);
        }
    };

    const toggleFavorite = (surah, ayah) => {
        // Use translation for preview text, fallback to arabic or empty string
        const previewText = ayah.translation || ayah.arabic || '';
        const newFavorite = {
            surahId: surah.number,
            ayahId: ayah.number,
            text: previewText,
            surahName: surah.nameTranslation // Use Turkish name
        };

        const exists = favorites.find(f => f.surahId === newFavorite.surahId && f.ayahId === newFavorite.ayahId);

        let newFavorites;
        if (exists) {
            newFavorites = favorites.filter(f => !(f.surahId === newFavorite.surahId && f.ayahId === newFavorite.ayahId));
        } else {
            newFavorites = [...favorites, newFavorite];
        }

        setFavorites(newFavorites);
        storageService.setItem(QURAN_STORAGE_KEYS.FAVORITES, newFavorites);
    };

    // Audio Handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        let isMounted = true;

        const playAudio = async () => {
            try {
                if (playingAyah && selectedSurah && selectedReciter) {
                    const url = getAyahAudioUrl(selectedSurah.number, playingAyah, selectedReciter.id);
                    
                    // Only update src if it's different to avoid reloading
                    if (audio.src !== url) {
                        audio.src = url;
                        audio.load();
                    }

                    if (isPlaying && isMounted) {
                        // Handle play promise to avoid "The play() request was interrupted" error
                        const playPromise = audio.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                if (isMounted) {
                                    console.error("Playback prevented:", error);
                                    // Don't stop playing state immediately on auto-play restrictions, 
                                    // but maybe pause if it's a real error
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
                console.error("Audio setup error:", error);
                if (isMounted) setIsPlaying(false);
            }
        };

        playAudio();

        return () => {
            isMounted = false;
        };
    }, [playingAyah, isPlaying, selectedReciter, selectedSurah]);

    // Apply volume to audio element
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handlePlayPause = () => {
        if (!playingAyah) {
            setPlayingAyah(1);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    const handleAyahEnd = () => {
        if (selectedSurah && playingAyah < selectedSurah.ayahCount) {
            // Move to next ayah
            setPlayingAyah(prev => prev + 1);
            // Ensure we keep playing
            setIsPlaying(true); 
        } else {
            // End of surah
            setIsPlaying(false);
            setPlayingAyah(null);
        }
    };

    // Save last played position to localStorage
    useEffect(() => {
        if (selectedSurah && playingAyah) {
            const lastRead = {
                surahId: selectedSurah.number,
                surahName: selectedSurah.name,
                ayahId: playingAyah,
                timestamp: Date.now()
            };
            storageService.setItem(QURAN_STORAGE_KEYS.LAST_READ, lastRead);
        }
    }, [selectedSurah, playingAyah]);

    const handleSeek = (e) => {
        const ayahNumber = Number(e.target.value);
        setPlayingAyah(ayahNumber);
        setIsPlaying(true);
    };

    const handleNextAyah = () => {
        if (selectedSurah && playingAyah < selectedSurah.ayahCount) {
            setPlayingAyah(prev => prev + 1);
            setIsPlaying(true);
        }
    };

    const handlePrevAyah = () => {
        if (playingAyah > 1) {
            setPlayingAyah(prev => prev - 1);
            setIsPlaying(true);
        }
    };

    // Media Session API Integration (Lock Screen Controls)
    useEffect(() => {
        if ('mediaSession' in navigator && selectedSurah && playingAyah && selectedReciter) {
            // Update Metadata
            navigator.mediaSession.metadata = new MediaMetadata({
                title: `${selectedSurah.nameTranslation} - ${playingAyah}. Ayet`,
                artist: selectedReciter.name,
                album: 'Huzur - Kuran-ı Kerim',
                artwork: [
                    { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            // Action Handlers
            navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
            navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
            
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                if (playingAyah > 1) {
                    setPlayingAyah(prev => prev - 1);
                    setIsPlaying(true);
                }
            });
            
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                if (selectedSurah && playingAyah < selectedSurah.ayahCount) {
                    setPlayingAyah(prev => prev + 1);
                    setIsPlaying(true);
                }
            });

            // Seek handler (optional but good for progress bars)
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (audioRef.current && details.seekTime) {
                    audioRef.current.currentTime = details.seekTime;
                }
            });
        }

        return () => {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
                navigator.mediaSession.setActionHandler('seekto', null);
            }
        };
    }, [selectedSurah, playingAyah, selectedReciter, setIsPlaying]); // Re-run when track changes to update metadata/closures

    // Render Side Menu Content
    const renderSideMenu = () => (
        <div className={`side-menu ${showSideMenu ? 'open' : ''}`}>
            <div className="side-menu-header">
                <h3>{t('quran.menu')}</h3>
                <button onClick={() => setShowSideMenu(false)}><X size={24} /></button>
            </div>

            <div className="side-menu-tabs">
                <button className={activeMenuTab === 'surahs' ? 'active' : ''} onClick={() => setActiveMenuTab('surahs')}>{t('quran.surahs')}</button>
                <button className={activeMenuTab === 'bookmarks' ? 'active' : ''} onClick={() => setActiveMenuTab('bookmarks')}>{t('quran.bookmarks')}</button>
                <button className={activeMenuTab === 'translations' ? 'active' : ''} onClick={() => setActiveMenuTab('translations')}>{t('quran.translations')}</button>
                <button className={activeMenuTab === 'reciters' ? 'active' : ''} onClick={() => setActiveMenuTab('reciters')}>{t('quran.reciters')}</button>
                <button className={activeMenuTab === 'fihrist' ? 'active' : ''} onClick={() => setActiveMenuTab('fihrist')}>{t('quran.fihrist')}</button>
            </div>

            <div className="side-menu-content">
                {activeMenuTab === 'surahs' && (
                    <div className="list-content">
                        {surahList.map(surah => (
                            <div key={surah.number} className={`list-item ${selectedSurah?.number === surah.number ? 'active' : ''}`} onClick={() => loadSurah(surah.number)}>
                                <span className="number">{surah.number}</span>
                                <div className="info">
                                    <span className="name">{surah.nameTranslation}</span>
                                    <span className="meaning">{surah.meaning}</span>
                                </div>
                                <span className="arabic">{surah.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeMenuTab === 'bookmarks' && (
                    <div className="list-content">
                        {favorites.length === 0 ? (
                            <div className="empty-state">{t('quran.noBookmarks')}</div>
                        ) : (
                            favorites.map((fav, idx) => (
                                <div key={idx} className="list-item" onClick={() => loadSurah(fav.surahId)}>
                                    <div className="info">
                                        <span className="name">{fav.surahName} - {fav.ayahId}. {t('quran.ayah')}</span>
                                        <span className="preview">{(fav.text || '').substring(0, 50)}...</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeMenuTab === 'translations' && (
                    <div className="list-content">
                        {translations.map(t => (
                            <div key={t.identifier} className={`list-item ${selectedTranslation === t.identifier ? 'active' : ''}`} onClick={() => handleTranslationChange(t.identifier)}>
                                <span className="name">{t.name}</span>
                                <span className="meaning">{t.language.toUpperCase()}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeMenuTab === 'reciters' && (
                    <div className="list-content">
                        {reciters.map(r => (
                            <div key={r.id} className={`list-item ${selectedReciter.id === r.id ? 'active' : ''}`} onClick={() => setSelectedReciter(r)}>
                                <span className="name">{r.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeMenuTab === 'fihrist' && (
                    <div className="list-content fihrist-content">
                        {selectedTopic ? (
                            <div className="topic-detail">
                                <button className="back-btn" onClick={() => setSelectedTopic(null)}>
                                    <ChevronLeft size={16} /> {t('quran.backToTopics')}
                                </button>
                                <h4>{selectedTopic.title}</h4>
                                <div className="topic-ayahs">
                                    {selectedTopic.ayahs.map((ref, idx) => {
                                        const surah = surahList.find(s => s.number === ref.s);
                                        return (
                                            <div key={idx} className="list-item" onClick={() => {
                                                loadSurah(ref.s);
                                                // Optional: Scroll to ayah logic could be added here
                                                setShowSideMenu(false);
                                            }}>
                                                <div className="info">
                                                    <span className="name">{surah?.nameTranslation} {t('quran.surah')}, {ref.a}. {t('quran.ayah')}</span>
                                                    <span className="meaning">{t('quran.relatedAyah')}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            detailedFihrist.map((cat, idx) => (
                                <div key={idx} className="fihrist-category">
                                    <div
                                        className="category-header"
                                        onClick={() => setExpandedCategory(expandedCategory === idx ? null : idx)}
                                    >
                                        <span className="name">{cat.category}</span>
                                        {expandedCategory === idx ? <ChevronLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> : <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />}
                                    </div>
                                    {expandedCategory === idx && (
                                        <div className="category-topics">
                                            {cat.topics.map((topic, tIdx) => (
                                                <div key={tIdx} className="list-item topic-item" onClick={() => setSelectedTopic(topic)}>
                                                    <span className="name">{topic.title}</span>
                                                    <span className="count">{topic.ayahs.length} {t('quran.ayah')}</span>
                                                </div>
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
    );

    if (!selectedSurah || !surahContent || !selectedReciter || isQuranMetaLoading) {
        return (
            <div className="quran-container loading">
                <Loader className="spinner" size={40} />
            </div>
        );
    }

    const selectedTranslationName = translations.find(t => t.identifier === selectedTranslation)?.name || 'Meal';

    return (
        <div className="quran-container overhaul royal-theme">
            {/* Royal Header */}
            <div className={`royal-header ${showBars ? 'visible' : 'hidden'}`}>
                <div className="header-bg-circle"></div>
                <div className="header-bg-circle"></div>
                
                <div className="header-content">
                    <div className="header-top-row">
                        <button onClick={onClose} className="icon-btn-light"><ChevronLeft size={24} /></button>
                        <div className="surah-title-tr">{t('quran.surah')} {selectedSurah.nameTranslation}</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => {
                                setActiveMenuTab('translations');
                                setShowSideMenu(true);
                            }} className="icon-btn-light">
                                <Globe size={24} />
                            </button>
                            <button onClick={() => {
                                setActiveMenuTab('surahs');
                                setShowSideMenu(true);
                            }} className="icon-btn-light">
                                <Menu size={24} />
                            </button>
                            <button onClick={toggleFocusMode} className="icon-btn-light" style={{ marginLeft: '5px' }}>
                                {isFocusMode ? <Minimize size={24} /> : <Maximize size={24} />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="surah-title-ar">سورة {selectedSurah.name}</div>
                    
                    <div className="surah-info-badges">
                        <span className="badge">{selectedSurah.revelationType}</span>
                        <span className="badge">{selectedSurah.ayahCount} {t('quran.ayah')}</span>
                        <span className="badge">Cüz {Math.ceil(selectedSurah.number / 20)}</span> {/* Yaklaşık cüz hesabı */}
                    </div>
                </div>
            </div>

            {/* Side Menu Overlay */}
            {showSideMenu && <div className="side-menu-overlay" onClick={() => setShowSideMenu(false)} />}
            {renderSideMenu()}

            {/* Main Content */}
            <div
                className="quran-content-area royal-content"
                onClick={() => setShowBars(!showBars)}
                ref={contentRef}
            >
                {/* Basmala Strip */}
                {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                    <div className="basmala-container">
                        <span className="strip-ornament">❧</span>
                        <div className="basmala-text">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
                        <span className="strip-ornament" style={{ transform: 'scaleX(-1)' }}>❧</span>
                    </div>
                )}

                {surahContent.ayahs.map((ayah) => (
                    <div key={ayah.number} id={`ayah-${ayah.number}`} className={`ayah-card ${playingAyah === ayah.number ? 'active' : ''}`}>
                        <div className="ayah-header">
                            <div className="ayah-number-symbol">{ayah.number}</div>
                            <div className="ayah-actions">
                                <button className="action-btn" onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedSurah, ayah); }}>
                                    <Bookmark
                                        size={18}
                                        fill={favorites.some(f => f.surahId === selectedSurah.number && f.ayahId === ayah.number) ? "#D4AF37" : "none"}
                                        color={favorites.some(f => f.surahId === selectedSurah.number && f.ayahId === ayah.number) ? "#D4AF37" : "#bdc3c7"}
                                    />
                                </button>
                                <button className="action-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    // Share logic placeholder
                                    if (navigator.share) {
                                        navigator.share({
                                            title: `Huzur App - ${selectedSurah.nameTranslation} ${ayah.number}. Ayet`,
                                            text: `${ayah.arabic}\n\n${ayah.translation}`,
                                            url: 'https://huzurapp.com'
                                        }).catch(console.error);
                                    }
                                }}>
                                    <Share2 size={18} />
                                </button>
                                <button className="action-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    setPlayingAyah(ayah.number);
                                    setIsPlaying(true);
                                }}>
                                    {playingAyah === ayah.number && isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="ayah-arabic">
                            {ayah.arabic}
                        </div>

                        <div className="text-label">{t('quran.turkishReading')}</div>
                        <div className="ayah-transliteration">
                            {ayah.transliteration}
                        </div>

                        {showTranslation && (
                            <>
                                <div className="text-label">{selectedTranslationName.toUpperCase()} {t('quran.translation')}</div>
                                <div className="ayah-translation">
                                    {ayah.translation}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Royal Player Bar */}
            <div className={`royal-player-bar ${showBars ? 'visible' : 'hidden'}`}>
                <audio
                    ref={audioRef}
                    onEnded={handleAyahEnd}
                />
                <button className="play-btn-royal" onClick={handlePlayPause}>
                    {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                </button>
                
                <div className="progress-container-royal">
                    <div className="time-info-royal">
                        <span>{playingAyah ? `${playingAyah}. ${t('quran.ayah')}` : t('quran.start')}</span>
                        <span>{selectedSurah.ayahCount} {t('quran.ayah')}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max={selectedSurah.ayahCount}
                        value={playingAyah || 0}
                        onChange={handleSeek}
                        className="royal-slider"
                    />
                </div>

                <div className="volume-control-royal">
                     <button onClick={() => setVolume(volume === 0 ? 1 : 0)}>
                        {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                     </button>
                </div>
                
                <div className="nav-controls-royal">
                     <button onClick={handlePrevAyah} disabled={!playingAyah || playingAyah <= 1}>
                        <SkipBack size={20} />
                     </button>
                    <button onClick={handleNextAyah} disabled={!playingAyah || (selectedSurah && playingAyah >= selectedSurah.ayahCount)}>
                        <SkipForward size={20} />
                    </button>
                </div>
            </div>
            <style>{`
                :root {
                    --emerald: #0F3D2E;
                    --emerald-light: #1A5C45;
                    --gold: #D4AF37;
                    --gold-light: #F4E5BC;
                    --cream: #FDFBF7;
                    --text-dark: #2C3E50;
                    --text-light: #7F8C8D;
                }

                .quran-container.royal-theme {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: var(--cream);
                    background-image: radial-gradient(var(--gold-light) 1px, transparent 1px);
                    background-size: 20px 20px;
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Inter', sans-serif;
                }

                /* --- HEADER --- */
                .royal-header {
                    background: linear-gradient(135deg, var(--emerald) 0%, #0a2b20 100%);
                    color: white;
                    padding: 20px 20px 30px;
                    border-bottom-left-radius: 30px;
                    border-bottom-right-radius: 30px;
                    box-shadow: 0 10px 30px rgba(15, 61, 46, 0.3);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    z-index: 1002;
                    transition: transform 0.3s ease;
                    overflow: hidden;
                }
                .royal-header.hidden { transform: translateY(-100%); }

                .header-bg-circle {
                    position: absolute;
                    width: 200px;
                    height: 200px;
                    border: 1px solid rgba(212, 175, 55, 0.1);
                    border-radius: 50%;
                    top: -50px;
                    left: -50px;
                    pointer-events: none;
                }
                .header-bg-circle:nth-child(2) {
                    top: 20px;
                    right: -80px;
                    width: 150px;
                    height: 150px;
                    border-color: rgba(212, 175, 55, 0.2);
                }

                .header-content {
                    position: relative;
                    z-index: 2;
                    text-align: center;
                }

                .header-top-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .icon-btn-light {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .surah-title-tr {
                    font-family: serif;
                    font-size: 1.1rem;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    color: var(--gold);
                    font-weight: 600;
                }

                .surah-title-ar {
                    font-family: var(--arabic-font-family);
                    font-size: 2.8rem;
                    line-height: 1.2;
                    margin-bottom: 15px;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
                }

                .surah-info-badges {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                }

                .badge {
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(5px);
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    color: #eee;
                }

                /* --- CONTENT --- */
                .royal-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 220px 20px 120px 20px; /* Top padding accounts for header height */
                }

                /* --- BASMALA STRIP --- */
                .basmala-container {
                    margin: 0 10px 20px;
                    background-color: #fff;
                    background-image: radial-gradient(#fdfbf7 50%, #fff 100%);
                    border-radius: 50px;
                    padding: 8px 20px;
                    text-align: center;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
                    position: relative;
                    z-index: 5;
                    border: 2px solid var(--gold);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 50px;
                }

                .basmala-text {
                    font-family: var(--arabic-font-family);
                    font-size: 1.4rem;
                    color: var(--emerald);
                    margin: 0 15px;
                    line-height: 1;
                    padding-bottom: 5px;
                }

                .strip-ornament {
                    color: var(--gold);
                    font-size: 1.2rem;
                    display: flex;
                    align-items: center;
                }

                /* --- AYAH CARDS --- */
                .ayah-card {
                    background: white;
                    border-radius: 16px;
                    padding: 15px;
                    margin-bottom: 12px;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.03);
                    border-left: 3px solid transparent;
                    transition: all 0.3s ease;
                }

                .ayah-card.active {
                    border-left: 3px solid var(--gold);
                    box-shadow: 0 5px 20px rgba(212, 175, 55, 0.15);
                    background: linear-gradient(to right, #fff, #fffdf5);
                }

                .ayah-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }

                .ayah-number-symbol {
                    width: 30px;
                    height: 30px;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L61 11L50 22L39 11L50 0Z' fill='%23D4AF37'/%3E%3Cpath d='M50 100L39 89L50 78L61 89L50 100Z' fill='%23D4AF37'/%3E%3Cpath d='M100 50L89 61L78 50L89 39L100 50Z' fill='%23D4AF37'/%3E%3Cpath d='M0 50L11 39L22 50L11 61L0 50Z' fill='%23D4AF37'/%3E%3Ccircle cx='50' cy='50' r='35' stroke='%23D4AF37' stroke-width='2'/%3E%3C/svg%3E");
                    background-size: contain;
                    background-repeat: no-repeat;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: bold;
                    color: var(--emerald);
                    font-family: var(--arabic-font-family);
                }

                .ayah-actions {
                    display: flex;
                    gap: 8px;
                }

                .action-btn {
                    background: none;
                    border: none;
                    color: #bdc3c7;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .action-btn:hover { color: var(--gold); }

                .ayah-arabic {
                    text-align: right;
                    font-family: var(--arabic-font-family);
                    font-size: 1.6rem;
                    line-height: 2;
                    color: black;
                    margin-bottom: 12px;
                    direction: rtl;
                }

                .ayah-transliteration {
                    font-size: 0.85rem;
                    color: var(--text-light);
                    font-style: italic;
                    margin-bottom: 6px;
                    line-height: 1.4;
                }

                .ayah-translation {
                    font-size: 0.9rem;
                    color: var(--text-dark);
                    font-weight: 500;
                    line-height: 1.4;
                    border-left: 2px solid var(--gold-light);
                    padding-left: 10px;
                }
                
                .text-label {
                    font-size: 0.65rem;
                    color: var(--gold);
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    margin-top: 10px;
                    margin-bottom: 2px;
                    text-transform: uppercase;
                }

                /* --- PLAYER BAR --- */
                .royal-player-bar {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    background: rgba(15, 61, 46, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 10px 15px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    color: white;
                    z-index: 1002;
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: transform 0.3s ease;
                }
                .royal-player-bar.hidden { transform: translateY(150%); }

                .play-btn-royal {
                    width: 45px;
                    height: 45px;
                    background: var(--gold);
                    border-radius: 50%;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--emerald);
                    box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
                    cursor: pointer;
                    flex-shrink: 0;
                }

                .progress-container-royal {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .time-info-royal {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.7rem;
                    color: rgba(255,255,255,0.7);
                    margin-bottom: 4px;
                }

                .royal-slider {
                    width: 100%;
                    height: 4px;
                    -webkit-appearance: none;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                    outline: none;
                }
                .royal-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 12px;
                    height: 12px;
                    background: var(--gold);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0,0,0,0.5);
                }

                .volume-control-royal button,
                .nav-controls-royal button {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    padding: 5px;
                }
                .volume-control-royal button:hover,
                .nav-controls-royal button:hover {
                    color: white;
                }
                
                .nav-controls-royal {
                    display: flex;
                    gap: 5px;
                }

                /* Side Menu Styles (Preserved) */
                .side-menu {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 85%;
                    height: 100%;
                    background: #fff;
                    z-index: 1005;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    box-shadow: -2px 0 10px rgba(0,0,0,0.1);
                }
                .side-menu.open { transform: translateX(0); }

                .side-menu-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 1004;
                }

                .side-menu-header {
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .side-menu-tabs {
                    display: flex;
                    overflow-x: auto;
                    border-bottom: 1px solid #eee;
                    padding: 0 10px;
                }

                .side-menu-tabs button {
                    padding: 15px;
                    background: none;
                    border: none;
                    white-space: nowrap;
                    color: #777;
                    font-weight: 500;
                    border-bottom: 2px solid transparent;
                }

                .side-menu-tabs button.active {
                    color: #2c3e50;
                    border-bottom-color: #2c3e50;
                }

                .side-menu-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                }

                .list-item {
                    padding: 15px;
                    border-bottom: 1px solid #f5f5f5;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                }
                .list-item:active { background: #f9f9f9; }
                .list-item.active { background: #f0f8ff; }

                .list-item .number {
                    width: 30px;
                    height: 30px;
                    background: #eee;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 15px;
                    font-size: 14px;
                }

                .list-item .info { flex: 1; display: flex; flex-direction: column; }
                .list-item .name { font-weight: 600; color: #333; }
                .list-item .meaning { font-size: 12px; color: #777; }
                .list-item .arabic { font-family: var(--arabic-font-family); font-size: 18px; }
                
                .fihrist-category { border-bottom: 1px solid #eee; }
                .category-header { padding: 15px; background: #f8f9fa; font-weight: 600; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                .category-topics { background: #fff; }
                .topic-item { padding-left: 30px !important; display: flex; justify-content: space-between; }
                .topic-item .count { font-size: 12px; color: #95a5a6; background: #eee; padding: 2px 8px; border-radius: 10px; }
                .back-btn { display: flex; align-items: center; gap: 5px; background: none; border: none; color: #2c3e50; font-weight: 500; padding: 10px 0; cursor: pointer; margin-bottom: 10px; }
                .topic-detail h4 { margin: 0 0 15px 0; color: #2c3e50; padding-bottom: 10px; border-bottom: 2px solid #eee; }
            `}</style>
        </div>
    );
}

export default Quran;
