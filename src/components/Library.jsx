import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronDown, Book, Search, Volume2, X, Lock, Play, Pause, Crown, Sparkles, BookOpen, Headphones, Video, FileText, Star, Compass } from 'lucide-react';
import { getReciters, getAudioUrlSync } from '../services/quranService';
import { surahList } from '../data/surahList';
import { isPro } from '../services/proService';
import IslamicBackButton from './shared/IslamicBackButton';
import './Library.css';

function Library({ onClose, onShowPro }) {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [activeReciter, setActiveReciter] = useState(null);
    const [expandedChapter, setExpandedChapter] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [playingIndex, setPlayingIndex] = useState(null);
    const [audioPlayer, setAudioPlayer] = useState(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [libraryData, setLibraryData] = useState(null);
    const [isLibraryDataLoading, setIsLibraryDataLoading] = useState(false);

    const loadLibraryData = useCallback(async () => {
        if (libraryData || isLibraryDataLoading) return;

        setIsLibraryDataLoading(true);
        try {
            const dataModule = await import('../data/libraryData');
            setLibraryData({
                BOOKS: dataModule.BOOKS || [],
                RELIGIOUS_TEXTS: dataModule.RELIGIOUS_TEXTS || [],
                EDUCATION: dataModule.EDUCATION || [],
                REFERENCES: dataModule.REFERENCES || [],
                FAQ: dataModule.FAQ || [],
                AUDIO: dataModule.AUDIO || [],
                VIDEO: dataModule.VIDEO || [],
                PRAYERS: dataModule.PRAYERS || []
            });
        } catch (error) {
            console.error('[Library] Veri yükleme hatası:', error);
        } finally {
            setIsLibraryDataLoading(false);
        }
    }, [libraryData, isLibraryDataLoading]);

    useEffect(() => {
        if ((activeCategory || searchQuery.length >= 2) && !libraryData && !isLibraryDataLoading) {
            loadLibraryData();
        }
    }, [activeCategory, searchQuery, libraryData, isLibraryDataLoading, loadLibraryData]);

    const BOOKS = useMemo(() => libraryData?.BOOKS || [], [libraryData]);
    const RELIGIOUS_TEXTS = useMemo(() => libraryData?.RELIGIOUS_TEXTS || [], [libraryData]);
    const EDUCATION = useMemo(() => libraryData?.EDUCATION || [], [libraryData]);
    const REFERENCES = useMemo(() => libraryData?.REFERENCES || [], [libraryData]);
    const FAQ = useMemo(() => libraryData?.FAQ || [], [libraryData]);
    const AUDIO = useMemo(() => libraryData?.AUDIO || [], [libraryData]);
    const VIDEO = useMemo(() => libraryData?.VIDEO || [], [libraryData]);
    const PRAYERS = useMemo(() => libraryData?.PRAYERS || [], [libraryData]);

    const LIBRARY_CATEGORIES = [
        { id: 'books', title: 'Kitaplar', icon: '📚', data: BOOKS },
        { id: 'texts', title: 'Dini Metinler', icon: '📜', data: RELIGIOUS_TEXTS },
        { id: 'education', title: 'Eğitim', icon: '🎓', data: EDUCATION },
        { id: 'references', title: 'Referanslar', icon: '📋', data: REFERENCES },
        { id: 'prayers', title: 'Peygamber Duaları', icon: '🤲', data: PRAYERS },
        { id: 'audio', title: 'Sesli Kütüphane', icon: '🎧', data: AUDIO, isPro: true },
        { id: 'video', title: 'İslami Akademi', icon: '🎬', data: VIDEO },
        { id: 'faq', title: 'Soru-Cevap', icon: '❓', data: FAQ }
    ];

    const userIsPro = isPro();

    // Play Arabic letter using Web Speech API
    const speakArabic = (letter, index, e) => {
        e.stopPropagation();

        if (!('speechSynthesis' in window)) {
            alert('Ses özelliği bu tarayıcıda desteklenmiyor.');
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = 'ar';
        utterance.rate = 0.5;
        utterance.volume = 1;

        setPlayingIndex(index);

        utterance.onend = () => setPlayingIndex(null);
        utterance.onerror = () => setPlayingIndex(null);

        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 100);
    };

    // Handle Audio Playback
    const toggleAudio = (url, index, e) => {
        e.stopPropagation();

        if (currentAudioUrl === url && audioPlayer && !audioPlayer.paused) {
            audioPlayer.pause();
            setPlayingIndex(null);
        } else {
            if (audioPlayer) {
                audioPlayer.pause();
            }
            const newAudio = new Audio(url);
            newAudio.play().catch(err => console.error("Audio play error:", err));
            newAudio.onended = () => setPlayingIndex(null);
            setAudioPlayer(newAudio);
            setCurrentAudioUrl(url);
            setPlayingIndex(index);
        }
    };

    // Global search across all library content
    const searchResults = useMemo(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) return [];

        const query = searchQuery.toLowerCase().trim();
        const results = [];

        // Search Books
        BOOKS.forEach(book => {
            if (book.title.toLowerCase().includes(query)) {
                results.push({ type: 'book', category: 'Kitaplar', icon: book.icon, item: book });
            }
            book.chapters?.forEach(chapter => {
                if (chapter.title.toLowerCase().includes(query) || chapter.content?.toLowerCase().includes(query)) {
                    results.push({
                        type: 'chapter',
                        category: book.title,
                        icon: book.icon,
                        item: book,
                        chapter,
                        match: chapter.title
                    });
                }
            });
        });

        // Search Religious Texts
        RELIGIOUS_TEXTS.forEach(text => {
            if (text.title.toLowerCase().includes(query)) {
                results.push({ type: 'text', category: 'Dini Metinler', icon: text.icon, item: text });
            }
            text.items?.forEach(item => {
                const searchable = `${item.title || ''} ${item.name || ''} ${item.text || ''} ${item.explanation || ''}`.toLowerCase();
                if (searchable.includes(query)) {
                    results.push({
                        type: 'text-item',
                        category: text.title,
                        icon: text.icon,
                        item: text,
                        match: item.title || item.name || item.text
                    });
                }
            });
        });

        // Search Education
        EDUCATION.forEach(edu => {
            if (edu.title.toLowerCase().includes(query)) {
                results.push({ type: 'education', category: 'Eğitim', icon: edu.icon, item: edu });
            }
            edu.topics?.forEach(topic => {
                const searchable = `${topic.title || ''} ${topic.name || ''} ${topic.content || ''} ${topic.description || ''}`.toLowerCase();
                if (searchable.includes(query)) {
                    results.push({
                        type: 'topic',
                        category: edu.title,
                        icon: edu.icon,
                        item: edu,
                        match: topic.title || topic.name
                    });
                }
            });
        });

        // Search References
        REFERENCES.forEach(ref => {
            if (ref.title.toLowerCase().includes(query)) {
                results.push({ type: 'reference', category: 'Referanslar', icon: ref.icon, item: ref });
            }
            ref.items?.forEach(item => {
                const searchable = `${item.name || ''} ${item.meaning || ''} ${item.title || ''} ${item.description || ''}`.toLowerCase();
                if (searchable.includes(query)) {
                    results.push({
                        type: 'ref-item',
                        category: ref.title,
                        icon: ref.icon,
                        item: ref,
                        match: item.name || item.title
                    });
                }
            });
        });

        // Search Audio
        AUDIO.forEach(audio => {
            if (audio.title.toLowerCase().includes(query)) {
                results.push({ type: 'audio', category: 'Sesli Kütüphane', icon: audio.icon, item: audio });
            }
            audio.items?.forEach(track => {
                if (track.title && track.title.toLowerCase().includes(query)) {
                    results.push({
                        type: 'track',
                        category: audio.title,
                        icon: audio.icon,
                        item: audio,
                        match: track.title
                    });
                }
            });
        });

        // Search FAQ
        FAQ.forEach(faq => {
            if (faq.category.toLowerCase().includes(query)) {
                results.push({ type: 'faq', category: 'Soru-Cevap', icon: faq.icon, item: faq });
            }
            faq.questions?.forEach(qa => {
                if (qa.q.toLowerCase().includes(query) || qa.a.toLowerCase().includes(query)) {
                    results.push({
                        type: 'question',
                        category: faq.category,
                        icon: faq.icon,
                        item: faq,
                        match: qa.q
                    });
                }
            });
        });

        return results.slice(0, 20); // Limit to 20 results
    }, [searchQuery, BOOKS, RELIGIOUS_TEXTS, EDUCATION, REFERENCES, AUDIO, FAQ]);

    // Handle search result click
    const handleSearchResultClick = (result) => {
        setActiveItem(result.item);
        setSearchQuery('');
    };

    // Go back navigation
    const goBack = () => {
        if (activeReciter) {
            setActiveReciter(null);
            if (audioPlayer) {
                audioPlayer.pause();
                setPlayingIndex(null);
            }
        } else if (activeItem) {
            setActiveItem(null);
            setExpandedChapter(null);
            if (audioPlayer) {
                audioPlayer.pause();
                setPlayingIndex(null);
            }
        } else if (activeCategory) {
            setActiveCategory(null);
        } else {
            onClose();
        }
    };

    // Get current title for header
    const getTitle = () => {
        if (activeReciter) return activeReciter.name;
        if (activeItem) return activeItem.title ? t(activeItem.title, { ns: 'prayers' }) : activeItem.category;
        if (activeCategory) return LIBRARY_CATEGORIES.find(c => c.id === activeCategory)?.title;
        return 'Kütüphane';
    };

    // Render category list (main view)
    const renderCategories = () => (
        <div className="reveal-stagger">
            <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '24px', fontWeight: '600' }}>
                {t('library.subtitle', 'İslami bilgi kaynakları ve referanslar')}
            </p>

            {/* Search Box */}
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
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
                )}
            </div>

            {/* Search Results */}
            {searchQuery.length >= 2 && (
                <div style={{ marginBottom: '32px' }} className="reveal-stagger">
                    <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.8rem', marginBottom: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                        {searchResults.length > 0
                            ? t('library.results_found', { count: searchResults.length })
                            : t('library.no_results')}
                    </p>
                    {searchResults.map((result, index) => (
                        <div
                            key={index}
                            className="settings-card reveal-stagger premium-glass hover-lift"
                            style={{ marginBottom: '12px', cursor: 'pointer' }}
                            onClick={() => handleSearchResultClick(result)}
                        >
                            <div className="settings-card-left">
                                <div className="settings-icon-box" style={{ background: 'var(--nav-hover)', color: 'var(--nav-accent)' }}>
                                    <span style={{ fontSize: '1.2rem' }}>{result.icon}</span>
                                </div>
                                <div className="settings-user-info">
                                    <div className="settings-label">
                                        {result.match || result.item.title || result.item.category}
                                    </div>
                                    <div className="settings-desc">
                                        {result.category}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={18} color="var(--nav-text-muted)" />
                        </div>
                    ))}
                </div>
            )}

            {/* Category Grid */}
            {searchQuery.length < 2 && (
                <div className="category-grid-library" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {LIBRARY_CATEGORIES.map((category) => (
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
                                    setShowPaywall(true);
                                } else {
                                    loadLibraryData();
                                    setActiveCategory(category.id);
                                }
                            }}
                        >
                            <div className="settings-icon-box" style={{ 
                                width: '64px', 
                                height: '64px', 
                                background: 'var(--nav-hover)', 
                                color: 'var(--nav-accent)',
                                borderRadius: '20px'
                            }}>
                                <span style={{ fontSize: '2rem' }}>{category.icon}</span>
                            </div>
                            <div className="settings-label" style={{ fontSize: '0.95rem', fontWeight: '800' }}>
                                {category.title}
                            </div>
                            {category.isPro && (
                                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                    <Crown size={14} color="#f59e0b" fill="#f59e0b" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // Render items in a category
    const renderCategoryItems = () => {
        if (!libraryData) {
            return (
                <div className="library-loading">
                    <div className="spinner premium"></div>
                </div>
            );
        }

        let items = [];
        switch (activeCategory) {
            case 'books': items = BOOKS; break;
            case 'texts': items = RELIGIOUS_TEXTS; break;
            case 'education': items = EDUCATION; break;
            case 'references': items = REFERENCES; break;
            case 'prayers': items = PRAYERS; break;
            case 'audio': items = AUDIO; break;
            case 'video': items = VIDEO; break;
            case 'faq': items = FAQ; break;
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
                                    setShowPaywall(true);
                                } else {
                                    setActiveItem(item);
                                }
                            }}
                        >
                            <div className="settings-card-left">
                                <div className="settings-icon-box" style={{ 
                                    background: 'var(--nav-hover)', 
                                    color: 'var(--nav-accent)',
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '16px'
                                }}>
                                    {item.icon || <BookOpen size={24} />}
                                </div>
                                <div className="settings-user-info">
                                    <div className="settings-label">
                                        {item.title ? (item.type === 'prayer' ? t(item.title, { ns: 'prayers' }) : item.title) : item.category}
                                    </div>
                                    <div className="settings-desc">
                                        {item.description}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {item.isPro && <Crown size={14} color="#f59e0b" fill="#f59e0b" />}
                                <ChevronRight size={18} color="var(--nav-text-muted)" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render Reciter Content (List of Surahs)
    const renderReciterContent = () => {
        if (!activeReciter) return null;

        return (
            <div className="reveal-stagger">
                <div className="settings-group">
                    <div className="settings-group-title premium-text">
                        {activeReciter.name} - Hatim Seti
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {surahList.map((surah, index) => {
                            const audioUrl = getAudioUrlSync(surah.number, activeReciter.id);
                            const isPlaying = playingIndex === index;

                            return (
                                <div
                                    key={surah.number}
                                    className="settings-card reveal-stagger premium-glass hover-lift"
                                    style={{ 
                                        padding: '12px 16px', 
                                        cursor: 'pointer',
                                        background: isPlaying ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.05)' : '',
                                        borderColor: isPlaying ? 'var(--nav-accent)' : ''
                                    }}
                                    onClick={(e) => toggleAudio(audioUrl, index, e)}
                                >
                                    <div className="settings-card-left">
                                        <div 
                                            className="settings-icon-box"
                                            style={{
                                                background: isPlaying ? 'var(--nav-accent)' : 'var(--nav-hover)',
                                                color: isPlaying ? 'white' : 'var(--nav-accent)',
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '50%'
                                            }}
                                        >
                                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                        </div>
                                        <div className="settings-user-info">
                                            <div className="settings-label" style={{ color: isPlaying ? 'var(--nav-accent)' : '' }}>
                                                {surah.number}. {surah.name}
                                            </div>
                                            <div className="settings-desc">
                                                {surah.nameTranslation} • {surah.ayahCount} Ayet
                                            </div>
                                        </div>
                                    </div>
                                    {isPlaying && (
                                        <div className="audio-wave">
                                            <span></span><span></span><span></span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // Render item content (chapters, items, topics, questions)
    const renderItemContent = () => {
        if (!activeItem) return null;

        // Audio Library - Reciters List
        if (activeItem.type === 'reciters') {
            if (activeReciter) return renderReciterContent();

            const reciters = getReciters();
            return (
                <div className="reveal-stagger">
                    <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                        {activeItem.description}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {reciters.map((reciter) => (
                            <div
                                key={reciter.id}
                                className="settings-card reveal-stagger premium-glass hover-lift"
                                style={{ padding: '16px', cursor: 'pointer' }}
                                onClick={() => setActiveReciter(reciter)}
                            >
                                <div className="settings-card-left">
                                    <div className="settings-icon-box" style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        borderRadius: '50%',
                                        background: 'var(--nav-hover)',
                                        color: 'var(--nav-accent)'
                                    }}>
                                        <Mic size={20} />
                                    </div>
                                    <div className="settings-user-info">
                                        <div className="settings-label">
                                            {reciter.name}
                                        </div>
                                        <div className="settings-desc">
                                            {reciter.country}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={18} color="var(--nav-text-muted)" />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Audio Library - Playlist
        if (activeItem.type === 'playlist') {
            return (
                <div className="reveal-stagger">
                    <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                        {activeItem.description}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activeItem.items.map((track, index) => {
                            const isPlaying = playingIndex === index;
                            return (
                                <div
                                    key={index}
                                    className="settings-card reveal-stagger premium-glass hover-lift"
                                    style={{ 
                                        padding: '16px', 
                                        cursor: 'pointer',
                                        background: isPlaying ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.05)' : '',
                                        borderColor: isPlaying ? 'var(--nav-accent)' : ''
                                    }}
                                    onClick={(e) => toggleAudio(track.url, index, e)}
                                >
                                    <div className="settings-card-left">
                                        <div className="settings-icon-box" style={{ 
                                            width: '44px', 
                                            height: '44px', 
                                            borderRadius: '50%',
                                            background: isPlaying ? 'var(--nav-accent)' : 'var(--nav-hover)',
                                            color: isPlaying ? 'white' : 'var(--nav-accent)'
                                        }}>
                                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                        </div>
                                        <div className="settings-user-info">
                                            <div className="settings-label" style={{ color: isPlaying ? 'var(--nav-accent)' : '' }}>
                                                {track.title}
                                            </div>
                                            <div className="settings-desc">
                                                {track.duration}
                                            </div>
                                        </div>
                                    </div>
                                    {isPlaying && (
                                        <div className="audio-wave">
                                            <span></span><span></span><span></span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }



        // Prophet Prayers
        if (activeItem.type === 'prayer') {
            return (
                <div className="reveal-stagger">
                    <div className="settings-card premium-glass hover-lift" style={{ 
                        padding: '32px 24px', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '24px'
                    }}>
                        {activeItem.prophet && (
                            <div className="hamburger-level-badge" style={{ 
                                background: 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1)', 
                                color: 'var(--nav-accent)',
                                fontWeight: '900',
                                border: '1px solid var(--nav-accent)'
                            }}>
                                {activeItem.prophet}
                            </div>
                        )}
                        
                        <h2 style={{ 
                            fontSize: '1.75rem', 
                            color: 'var(--nav-text)', 
                            margin: 0,
                            fontWeight: '900',
                            lineHeight: '1.2'
                        }}>
                            {t(activeItem.title)}
                        </h2>

                        {activeItem.situation && (
                            <div style={{ 
                                fontSize: '0.9rem', 
                                color: 'var(--nav-text-muted)',
                                fontStyle: 'italic',
                                padding: '0 16px'
                            }}>
                                "{activeItem.situation}"
                            </div>
                        )}

                        <div style={{ 
                            background: 'var(--nav-hover)', 
                            padding: '32px 24px', 
                            borderRadius: '32px',
                            width: '100%',
                            border: '1px solid var(--nav-border)'
                        }}>
                            <div style={{ 
                                fontFamily: 'var(--arabic-font-family)', 
                                fontSize: '2rem', 
                                color: 'var(--nav-text)', 
                                lineHeight: '1.8',
                                marginBottom: '24px',
                                direction: 'rtl'
                            }}>
                                {activeItem.arabic}
                            </div>
                            
                            <div style={{ 
                                fontSize: '1rem', 
                                color: 'var(--nav-text-muted)', 
                                marginBottom: '20px',
                                lineHeight: '1.6',
                                fontWeight: '600'
                            }}>
                                {activeItem.transliteration || activeItem.turkish}
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--nav-border)', margin: '20px 0' }} />

                            <div style={{ 
                                fontSize: '1.1rem', 
                                color: 'var(--nav-accent)', 
                                fontWeight: '800',
                                lineHeight: '1.6'
                            }}>
                                {t(activeItem.meaning)}
                            </div>
                        </div>

                        {activeItem.source && (
                            <div style={{ 
                                fontSize: '0.75rem', 
                                color: 'var(--nav-text-muted)', 
                                fontWeight: '700',
                                opacity: 0.8
                            }}>
                                Source: {activeItem.source}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Video Library - İslami Akademi Episodes
        if (activeItem.type === 'video') {
            return (
                <div className="reveal-stagger">
                    <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                        {activeItem.description}
                    </p>
                    
                    {/* Series Header */}
                    <div className="settings-card premium-glass hover-lift" style={{ 
                        marginBottom: '24px', 
                        padding: '24px',
                        background: 'linear-gradient(135deg, rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1), rgba(59, 130, 246, 0.1))',
                        border: '1px solid var(--nav-accent)'
                    }}>
                        <div className="settings-card-left">
                            <div className="settings-icon-box" style={{ width: '72px', height: '72px', background: 'white' }}>
                                <span style={{ fontSize: '2.5rem' }}>{activeItem.icon}</span>
                            </div>
                            <div className="settings-user-info">
                                <div className="settings-label" style={{ fontSize: '1.1rem', color: 'var(--nav-accent)' }}>
                                    {activeItem.episodes?.length || 0} {t('library.episodes', 'Bölüm')}
                                </div>
                                <div className="settings-desc" style={{ fontWeight: '800' }}>
                                    {t('library.premium_video', 'Premium Video Akademi')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Episode List */}
                    <div className="settings-group">
                        <div className="settings-group-title premium-text">{t('library.episode_list', 'Bölüm Listesi')}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {activeItem.episodes?.map((episode, index) => (
                                <div
                                    key={index}
                                    className="settings-card reveal-stagger premium-glass hover-lift"
                                    style={{ padding: '16px', cursor: 'pointer' }}
                                >
                                    <div className="settings-card-left">
                                        <div style={{
                                            width: '64px',
                                            height: '44px',
                                            borderRadius: '12px',
                                            background: 'var(--nav-hover)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            position: 'relative',
                                            border: '1px solid var(--nav-border)'
                                        }}>
                                            {episode.thumbnail}
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                background: 'var(--nav-accent)',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                            }}>
                                                <Play size={12} color="#fff" fill="white" />
                                            </div>
                                        </div>
                                        <div className="settings-user-info">
                                            <div className="settings-label" style={{ fontSize: '0.9rem' }}>
                                                {episode.number}. {episode.title}
                                            </div>
                                            <div className="settings-desc">
                                                ⏱️ {episode.duration}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} color="var(--nav-text-muted)" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coming Soon Notice */}
                    <div className="settings-card" style={{ 
                        marginTop: '32px',
                        padding: '24px',
                        justifyContent: 'center',
                        background: 'var(--nav-hover)',
                        border: '1px dashed var(--nav-border)'
                    }}>
                        <div style={{ textAlign: 'center', color: 'var(--nav-text-muted)', fontSize: '0.85rem', fontWeight: '700' }}>
                            🎬 Video içerikler yakında eklenecek
                        </div>
                    </div>
                </div>
            );
        }

        // External Video - YouTube Channel/Playlist Redirect
        if (activeItem.type === 'external_video') {
            const openYouTube = (url) => {
                window.open(url, '_blank', 'noopener,noreferrer');
            };

            const youtubeSearchUrl = activeItem.searchQuery 
                ? `https://www.youtube.com/results?search_query=${encodeURIComponent(activeItem.searchQuery)}`
                : null;

            return (
                <div className="reveal-stagger">
                    <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                        {activeItem.description}
                    </p>
                    
                    {/* Source Card */}
                    <div className="settings-card" style={{ 
                        marginBottom: '24px', 
                        padding: '20px',
                        background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
                        color: 'white',
                        border: 'none'
                    }}>
                        <div className="settings-card-left">
                            <div className="settings-icon-box" style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                                <Youtube size={28} fill="white" />
                            </div>
                            <div className="settings-user-info">
                                <div className="settings-label" style={{ color: 'white', fontSize: '1.1rem' }}>
                                    {activeItem.source}
                                </div>
                                <div className="settings-desc" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700' }}>
                                    YouTube Kanalı • {activeItem.topics?.length || 0} Konu
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Topics Row */}
                    <div className="settings-group" style={{ marginBottom: '24px' }}>
                        <div className="settings-group-title">📚 {t('library.topics', 'İçerik Konuları')}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {activeItem.topics?.map((topic, index) => (
                                <div 
                                    key={index}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'var(--nav-hover)',
                                        borderRadius: '24px',
                                        fontSize: '0.8rem',
                                        color: 'var(--nav-accent)',
                                        fontWeight: '800',
                                        border: '1px solid var(--nav-border)'
                                    }}
                                >
                                    {topic}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {activeItem.channelUrl && (
                            <button
                                onClick={() => openYouTube(activeItem.channelUrl)}
                                className="velocity-target-btn"
                                style={{ 
                                    width: '100%', 
                                    background: '#ff0000', 
                                    color: 'white', 
                                    borderColor: 'transparent',
                                    justifyContent: 'center',
                                    fontWeight: '900'
                                }}
                            >
                                <Play size={20} fill="white" /> {t('library.go_to_channel', 'YouTube Kanalına Git')}
                            </button>
                        )}

                        {activeItem.playlistUrl && (
                            <button
                                onClick={() => openYouTube(activeItem.playlistUrl)}
                                className="velocity-target-btn"
                                style={{ 
                                    width: '100%', 
                                    background: 'var(--nav-hover)', 
                                    borderColor: '#ff0000',
                                    color: '#ff0000',
                                    justifyContent: 'center'
                                }}
                            >
                                <ListVideo size={20} /> {t('library.view_playlists', 'Oynatma Listelerini Gör')}
                            </button>
                        )}

                        {youtubeSearchUrl && (
                            <button
                                onClick={() => openYouTube(youtubeSearchUrl)}
                                className="velocity-target-btn"
                                style={{ 
                                    width: '100%', 
                                    background: 'transparent', 
                                    color: 'var(--nav-text-muted)',
                                    justifyContent: 'center',
                                    borderColor: 'var(--nav-border)'
                                }}
                            >
                                <Search size={18} /> {t('library.search_on_youtube', "YouTube'da Ara")}
                            </button>
                        )}
                    </div>

                    <p style={{ textAlign: 'center', color: 'var(--nav-text-muted)', fontSize: '0.75rem', marginTop: '24px', padding: '0 20px', lineHeight: '1.5', fontWeight: '600' }}>
                        ℹ️ {t('library.external_notice', 'Video içerikler harici kaynaklardan sağlanmaktadır. YouTube uygulamasına yönlendirileceksiniz.')}
                    </p>
                </div>
            );
        }

        // Books with chapters
        if (activeItem.chapters) {
            return (
                <div className="reveal-stagger">
                    <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                        {activeItem.description}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeItem.chapters.map((chapter, index) => {
                            const isExpanded = expandedChapter === index;
                            return (
                                <div
                                    key={index}
                                    className="settings-card reveal-stagger"
                                    style={{ 
                                        padding: '16px', 
                                        cursor: 'pointer', 
                                        flexDirection: 'column',
                                        background: isExpanded ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.03)' : '',
                                        borderColor: isExpanded ? 'var(--nav-accent)' : ''
                                    }}
                                    onClick={() => setExpandedChapter(isExpanded ? null : index)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="settings-icon-box" style={{ 
                                                width: '32px', 
                                                height: '32px', 
                                                borderRadius: '8px',
                                                background: isExpanded ? 'var(--nav-accent)' : 'var(--nav-hover)',
                                                color: isExpanded ? 'white' : 'var(--nav-accent)'
                                            }}>
                                                <Book size={16} />
                                            </div>
                                            <div className="settings-label" style={{ fontWeight: '800', color: isExpanded ? 'var(--nav-accent)' : '' }}>
                                                {chapter.title}
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronDown size={18} color="var(--nav-accent)" /> : <ChevronRight size={18} color="var(--nav-text-muted)" />}
                                    </div>
                                    {isExpanded && (
                                        <div style={{
                                            marginTop: '16px',
                                            padding: '20px',
                                            borderRadius: '16px',
                                            background: 'var(--nav-hover)',
                                            fontSize: '1rem',
                                            lineHeight: '1.8',
                                            color: 'var(--nav-text)',
                                            whiteSpace: 'pre-wrap',
                                            border: '1px solid var(--nav-border)'
                                        }}>
                                            {chapter.content}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // Religious texts with items (Asmaul Husna items etc.)
        if (activeItem.items) {
            return (
                <div className="reveal-stagger">
                    <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                        {activeItem.description}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeItem.items.map((item, index) => {
                            const isExpanded = expandedChapter === index;
                            return (
                                <div
                                    key={index}
                                    className="settings-card reveal-stagger"
                                    style={{ 
                                        padding: '16px', 
                                        cursor: 'pointer', 
                                        flexDirection: 'column',
                                        background: isExpanded ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.03)' : '',
                                        borderColor: isExpanded ? 'var(--nav-accent)' : ''
                                    }}
                                    onClick={() => setExpandedChapter(isExpanded ? null : index)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                                        <div style={{
                                            background: isExpanded ? 'var(--nav-accent)' : 'var(--nav-hover)',
                                            color: isExpanded ? 'white' : 'var(--nav-accent)',
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.85rem',
                                            fontWeight: '900',
                                            flexShrink: 0
                                        }}>
                                            {item.number}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ 
                                                fontWeight: '800', 
                                                color: isExpanded ? 'var(--nav-accent)' : 'var(--nav-text)',
                                                fontSize: '1rem'
                                            }}>
                                                {item.title || item.name || item.text}
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronDown size={18} color="var(--nav-accent)" /> : <ChevronRight size={18} color="var(--nav-text-muted)" />}
                                    </div>

                                    {item.arabic && !isExpanded && (
                                        <div style={{
                                            width: '100%',
                                            fontFamily: "var(--arabic-font-family)",
                                            fontSize: '1.5rem',
                                            textAlign: 'right',
                                            direction: 'rtl',
                                            color: 'var(--nav-text-muted)',
                                            marginTop: '8px',
                                            opacity: 0.6
                                        }}>
                                            {item.arabic}
                                        </div>
                                    )}

                                    {isExpanded && (
                                        <div style={{ marginTop: '16px', width: '100%' }}>
                                            {item.arabic && (
                                                <div style={{
                                                    fontFamily: "var(--arabic-font-family)",
                                                    fontSize: '2.2rem',
                                                    textAlign: 'center',
                                                    direction: 'rtl',
                                                    color: 'var(--nav-text)',
                                                    padding: '24px',
                                                    background: 'var(--nav-hover)',
                                                    borderRadius: '24px',
                                                    marginBottom: '16px',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {item.arabic}
                                                </div>
                                            )}
                                            <div style={{
                                                padding: '20px',
                                                borderRadius: '24px',
                                                background: 'var(--nav-hover)',
                                                fontSize: '0.95rem',
                                                lineHeight: '1.7',
                                                color: 'var(--nav-text)',
                                                border: '1px solid var(--nav-border)'
                                            }}>
                                                {item.text && (
                                                    <div style={{ fontWeight: '800', marginBottom: '8px', color: 'var(--nav-accent)' }}>
                                                        {t('library.pronunciation', 'Okunuşu')}: <span style={{ fontWeight: '600', color: 'var(--nav-text)' }}>{item.text}</span>
                                                    </div>
                                                )}
                                                <div style={{ fontWeight: '600' }}>
                                                    {item.explanation || item.meaning || item.description}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // Education with topics (ElifBa etc.)
        if (activeItem.topics) {
            return (
                <div className="reveal-stagger">
                    <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600' }}>
                        {activeItem.description}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activeItem.topics.map((topic, index) => {
                            const isExpanded = expandedChapter === index;
                            const isPlaying = playingIndex === index;
                            return (
                                <div
                                    key={index}
                                    className="settings-card reveal-stagger"
                                    style={{ 
                                        padding: '16px', 
                                        cursor: 'pointer',
                                        flexDirection: 'column',
                                        background: isExpanded ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.03)' : '',
                                        borderColor: isPlaying ? 'var(--nav-accent)' : (isExpanded ? 'var(--nav-accent)' : '')
                                    }}
                                    onClick={() => setExpandedChapter(isExpanded ? null : index)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            {topic.letter && (
                                                <div style={{
                                                    fontSize: '2.5rem',
                                                    fontFamily: "var(--arabic-font-family)",
                                                    color: isPlaying ? 'var(--nav-accent)' : 'var(--nav-text)',
                                                    width: '48px',
                                                    height: '48px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: 'var(--nav-hover)',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s'
                                                }}>
                                                    {topic.letter}
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: '800', color: isExpanded ? 'var(--nav-accent)' : 'var(--nav-text)', fontSize: '1.1rem' }}>
                                                    {topic.title || topic.name}
                                                </div>
                                                {topic.pronunciation && (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--nav-text-muted)', fontWeight: '600' }}>
                                                        {t('library.pronunciation', 'Okunuşu')}: {topic.pronunciation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {topic.letter && (
                                                <button
                                                    onClick={(e) => speakArabic(topic.letter, index, e)}
                                                    style={{
                                                        background: isPlaying ? 'var(--nav-accent)' : 'var(--nav-hover)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '40px',
                                                        height: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        boxShadow: isPlaying ? '0 0 12px rgba(var(--nav-accent-rgb), 0.3)' : 'none'
                                                    }}
                                                >
                                                    <Volume2 size={20} color={isPlaying ? '#fff' : 'var(--nav-accent)'} />
                                                </button>
                                            )}
                                            {isExpanded ? <ChevronDown size={18} color="var(--nav-accent)" /> : <ChevronRight size={18} color="var(--nav-text-muted)" />}
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div style={{
                                            marginTop: '16px',
                                            padding: '20px',
                                            borderRadius: '24px',
                                            background: 'var(--nav-hover)',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.8',
                                            color: 'var(--nav-text)',
                                            border: '1px solid var(--nav-border)'
                                        }}>
                                            {topic.content || topic.description}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // FAQ with questions
        if (activeItem.questions) {
            return (
                <div className="reveal-stagger">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeItem.questions.map((qa, index) => {
                            const isExpanded = expandedChapter === index;
                            return (
                                <div
                                    key={index}
                                    className="settings-card reveal-stagger"
                                    style={{ 
                                        padding: '16px', 
                                        cursor: 'pointer', 
                                        flexDirection: 'column',
                                        background: isExpanded ? 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.03)' : '',
                                        borderColor: isExpanded ? 'var(--nav-accent)' : ''
                                    }}
                                    onClick={() => setExpandedChapter(isExpanded ? null : index)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', gap: '16px' }}>
                                        <div style={{ fontWeight: '800', color: isExpanded ? 'var(--nav-accent)' : 'var(--nav-text)', fontSize: '0.95rem', flex: 1 }}>
                                            {qa.q}
                                        </div>
                                        {isExpanded ? <ChevronDown size={18} color="var(--nav-accent)" /> : <ChevronRight size={18} color="var(--nav-text-muted)" />}
                                    </div>
                                    {isExpanded && (
                                        <div style={{
                                            marginTop: '16px',
                                            padding: '20px',
                                            borderRadius: '24px',
                                            background: 'var(--nav-hover)',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.7',
                                            color: 'var(--nav-text)',
                                            border: '1px solid var(--nav-border)'
                                        }}>
                                            {qa.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="settings-container">
            {/* Header */}
            <div className="library-header reveal-stagger" style={{ 
                '--delay': '0s',
                marginBottom: '24px',
                padding: '0 4px'
            }}>
                <IslamicBackButton onClick={goBack} size="medium" />
                <h1 className="library-title" style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '900', 
                    color: 'var(--nav-text)',
                    margin: 0
                }}>
                    {getTitle()}
                </h1>
                <div style={{ flex: 1 }}></div>
                {userIsPro ? (
                    <div className="hamburger-level-badge" style={{ 
                        background: 'rgba(var(--nav-accent-rgb, 249, 115, 22), 0.1)', 
                        color: 'var(--nav-accent)',
                        borderColor: 'var(--nav-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '12px'
                    }}>
                        <Crown size={14} fill="var(--nav-accent)" />
                        <span style={{ fontSize: '11px', fontWeight: '900' }}>PRO</span>
                    </div>
                ) : (
                    <div 
                        onClick={() => setShowPaywall(true)}
                        style={{ 
                            background: 'var(--nav-hover)', 
                            color: 'var(--nav-text-muted)',
                            padding: '8px',
                            borderRadius: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        <Crown size={18} />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="reveal-stagger" style={{ '--delay': '0.1s' }}>
                {!activeCategory && renderCategories()}
                {activeCategory && !activeItem && renderCategoryItems()}
                {activeItem && renderItemContent()}
            </div>

            {/* Premium / Paywall Modal */}
            {showPaywall && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
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
                            background: 'var(--nav-bg)',
                            border: '1px solid var(--nav-accent)',
                            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                            borderRadius: '40px',
                            animation: 'modalOpen 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, var(--nav-accent) 0%, #f59e0b 100%)',
                            borderRadius: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 12px 24px rgba(var(--nav-accent-rgb), 0.4)'
                        }}>
                            <Crown size={40} color="white" fill="white" />
                        </div>

                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--nav-text)', marginBottom: '8px' }}>
                                Huzur Pro
                            </h2>
                            <p style={{ color: 'var(--nav-text-muted)', fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.5' }}>
                                {t('library.paywall_desc', 'Tüm kütüphane içeriğine ve premium özelliklere sınırsız erişim sağlayın.')}
                            </p>
                        </div>

                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { icon: '🎧', text: t('library.feature_audio', 'Ünlü hafızlardan hatim setleri') },
                                { icon: '🎬', text: t('library.feature_video', 'İslami Akademi video serileri') },
                                { icon: '📚', text: t('library.feature_books', 'Özel dini kaynaklar ve kitaplar') }
                            ].map((feature, i) => (
                                <div key={i} className="settings-card" style={{ padding: '12px 16px', background: 'var(--nav-hover)', border: 'none', justifyContent: 'flex-start', gap: '12px' }}>
                                    <span style={{ fontSize: '1.25rem' }}>{feature.icon}</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--nav-text)', fontWeight: '700', textAlign: 'left' }}>
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                            <button
                                className="velocity-target-btn"
                                style={{ width: '100%', background: 'var(--nav-accent)', color: 'white', borderColor: 'transparent', height: '64px', fontSize: '1.1rem', fontWeight: '900', justifyContent: 'center' }}
                                onClick={() => {
                                    setShowPaywall(false);
                                    if (onShowPro) onShowPro();
                                }}
                            >
                                <Sparkles size={20} fill="white" /> {t('common.upgrade_pro', 'Pro\'ya Yükselt')}
                            </button>

                            <button
                                onClick={() => setShowPaywall(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--nav-text-muted)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: '800' }}
                            >
                                {t('common.later', 'Belki Daha Sonra')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Library;
